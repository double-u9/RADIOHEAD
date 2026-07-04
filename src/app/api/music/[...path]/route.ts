import { NextRequest, NextResponse } from "next/server";
import { stat, createReadStream } from "fs";
import { join } from "path";
import { promisify } from "util";
import { Readable } from "stream";

const statAsync = promisify(stat);

const MUSIC_BASE = process.env.MUSIC_BASE_PATH || join(process.cwd(), "songs", "MAIN ALBUMS");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const decodedPath = path.map((p) => decodeURIComponent(p));
  let filePath = "";
  if (decodedPath[0] === "B-side" || decodedPath[0] === "MINI DISKS") {
    // Stream local folders directly from the project root/songs folder
    filePath = join(process.cwd(), "songs", ...decodedPath);
  } else {
    // Stream standard albums from external drive
    filePath = join(/* turbopackIgnore: true */ MUSIC_BASE, ...decodedPath);

    // Security: prevent directory traversal for external files
    if (!filePath.startsWith(MUSIC_BASE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const fileStat = await statAsync(filePath);
    const fileSize = fileStat.size;
    const range = request.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(stream) as ReadableStream;

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Type": filePath.endsWith(".flac") ? "audio/flac" : filePath.endsWith(".lrc") ? "text/plain" : "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const stream = createReadStream(filePath);
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Length": String(fileSize),
        "Content-Type": filePath.endsWith(".flac") ? "audio/flac" : filePath.endsWith(".lrc") ? "text/plain" : "audio/mpeg",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
