import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import * as mm from "music-metadata";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileName = searchParams.get("file");

  if (!fileName || !fileName.endsWith(".mp3")) {
    return new NextResponse("Invalid file", { status: 400 });
  }

  try {
    const bsidesDir = join(process.cwd(), "songs", "B-side");
    const filePath = join(bsidesDir, fileName);
    
    // ensure no directory traversal
    if (!filePath.startsWith(bsidesDir)) {
       return new NextResponse("Forbidden", { status: 403 });
    }

    const metadata = await mm.parseFile(filePath, { skipCovers: false });
    const picture = metadata.common.picture?.[0];

    if (picture) {
      return new NextResponse(Buffer.from(picture.data), {
        status: 200,
        headers: {
          "Content-Type": picture.format || "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse("No artwork found", { status: 404 });
  } catch (error) {
    console.error("Error extracting artwork:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
