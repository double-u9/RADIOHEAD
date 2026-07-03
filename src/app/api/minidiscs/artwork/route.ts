import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing id parameter", { status: 400 });
  }

  try {
    // Construct path: songs/MINI DISKS/covers/{id}.jpg
    const coverPath = join(process.cwd(), "songs", "MINI DISKS", "covers", `${id}.jpg`);

    if (!existsSync(coverPath)) {
      return new NextResponse("Cover not found", { status: 404 });
    }

    const imageBuffer = await readFile(coverPath);

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error reading cover art:", error);
    return new NextResponse("Error reading cover art", { status: 500 });
  }
}
