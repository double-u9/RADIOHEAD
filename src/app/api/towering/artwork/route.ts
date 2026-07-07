import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cd = searchParams.get("cd");

  try {
    let coverPath = "";
    
    // Check if specific CD has a cover.jpg
    if (cd) {
      const cdCoverPath = join(process.cwd(), "songs", "TOWERING ABOVE THE REST", cd, "cover.jpg");
      if (existsSync(cdCoverPath)) {
        coverPath = cdCoverPath;
      }
    }
    
    // Fallback to default
    if (!coverPath) {
      coverPath = join(process.cwd(), "public", "covers", "towering-above-the-rest.jpg");
      if (!existsSync(coverPath)) {
        return new NextResponse("Cover not found", { status: 404 });
      }
    }

    const imageBuffer = await readFile(coverPath);
    
    const contentType = coverPath.endsWith(".png") ? "image/png" : "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error reading cover art:", error);
    return new NextResponse("Error reading cover art", { status: 500 });
  }
}
