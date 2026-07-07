import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import * as mm from "music-metadata";
import { Track } from "@/types";

const memoryCache = new Map<string, Track[]>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cd: string }> }
) {
  const { cd } = await params;
  const decodedCd = decodeURIComponent(cd);
  
  if (memoryCache.has(decodedCd)) {
    return NextResponse.json(memoryCache.get(decodedCd));
  }

  const cdDir = join(process.cwd(), "songs", "TOWERING ABOVE THE REST", decodedCd);
  const cacheFilePath = join(cdDir, "cd-cache.json");

  try {
    const cacheData = await readFile(cacheFilePath, "utf-8");
    const tracks: Track[] = JSON.parse(cacheData);
    memoryCache.set(decodedCd, tracks);
    return NextResponse.json(tracks);
  } catch {
    // Cache doesn't exist, proceed to parse
  }

  try {
    const files = await readdir(cdDir);
    const audioFiles = files.filter((f) => f.endsWith(".flac") || f.endsWith(".mp3"));

    audioFiles.sort();

    const unsortedTracks = await Promise.all(
      audioFiles.map(async (file) => {
        const filePath = join(cdDir, file);

        try {
          const metadata = await mm.parseFile(filePath, {
            duration: true,
            skipCovers: true,
          });

          // Match "01 Title" or just take metadata title
          let title = metadata.common.title;
          if (!title) {
            title = file.replace(/\.(flac|mp3)$/i, "").replace(/^\d+\s*/, "");
          }

          const durationSec = metadata.format.duration || 0;
          const mins = Math.floor(durationSec / 60);
          const secs = Math.floor(durationSec % 60).toString().padStart(2, "0");

          return {
            title: title.trim(),
            duration: `${mins}:${secs}`,
            durationSeconds: Math.floor(durationSec),
            fileName: file,
            coverPath: `/api/towering/artwork?cd=${encodeURIComponent(decodedCd)}&v=2`,
            lyrics: undefined,
          };
        } catch (err) {
          console.error("Failed to parse", file, err);
          
          const fallbackTitle = file.replace(/\.(flac|mp3)$/i, "").replace(/^\d+\s*/, "").trim();
          return {
            title: fallbackTitle,
            duration: "0:00",
            durationSeconds: 0,
            fileName: file,
            coverPath: `/api/towering/artwork?cd=${encodeURIComponent(decodedCd)}&v=2`,
            lyrics: undefined,
          };
        }
      })
    );

    const tracks = unsortedTracks.map((track, idx) => ({
      ...track,
      number: idx + 1,
    })) as Track[];

    memoryCache.set(decodedCd, tracks);

    try {
      await writeFile(cacheFilePath, JSON.stringify(tracks, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write cache file for", decodedCd, err);
    }

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error reading CD:", decodedCd, error);
    return NextResponse.json({ error: `Failed to load CD ${decodedCd}` }, { status: 500 });
  }
}
