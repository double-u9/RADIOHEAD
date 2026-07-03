import { NextResponse } from "next/server";
import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import * as mm from "music-metadata";
import { Track } from "@/types";

let memoryCache: Track[] | null = null;

export async function GET() {
  if (memoryCache) {
    return NextResponse.json(memoryCache);
  }

  const minidiscsDir = join(process.cwd(), "songs", "MINI DISKS");
  const cacheFilePath = join(minidiscsDir, "minidiscs-cache.json");

  try {
    const cacheData = await readFile(cacheFilePath, "utf-8");
    const tracks: Track[] = JSON.parse(cacheData);
    memoryCache = tracks;
    return NextResponse.json(tracks);
  } catch {
    // Cache doesn't exist, proceed to parse
  }

  try {
    const files = await readdir(minidiscsDir);
    const mp3Files = files.filter((f) => f.endsWith(".mp3"));

    mp3Files.sort();

    const unsortedTracks = await Promise.all(
      mp3Files.map(async (file) => {
        const filePath = join(minidiscsDir, file);

        try {
          const metadata = await mm.parseFile(filePath, {
            duration: true,
            skipCovers: true,
          });

          const match = file.match(/MD\d{3}/);
          const mdId = match ? match[0] : file.replace(".mp3", "");

          let title = metadata.common.title;
          if (!title) {
            title = file.replace(".mp3", "").replace(/^Radiohead\s*-\s*MINIDISCS\s*-\s*\d+\s*/i, "");
          }

          const durationSec = metadata.format.duration || 0;
          const mins = Math.floor(durationSec / 60);
          const secs = Math.floor(durationSec % 60).toString().padStart(2, "0");

          return {
            title: title.trim(),
            duration: `${mins}:${secs}`,
            durationSeconds: Math.floor(durationSec),
            fileName: file,
            coverPath: `/api/minidiscs/artwork?id=${mdId}`,
            lyrics: undefined,
          };
        } catch (err) {
          console.error("Failed to parse", file, err);
          return null;
        }
      })
    );

    const tracks = unsortedTracks
      .filter((t) => t !== null)
      .map((track, idx) => ({
        ...track,
        title: track!.title || "",
        number: idx + 1,
      })) as Track[];

    memoryCache = tracks;

    try {
      await writeFile(cacheFilePath, JSON.stringify(tracks, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write minidiscs cache file", err);
    }

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error reading Mini Discs:", error);
    return NextResponse.json({ error: "Failed to load Mini Discs" }, { status: 500 });
  }
}
