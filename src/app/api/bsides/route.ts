import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import * as mm from "music-metadata";
import { Track } from "@/types";
import { bsidesStaticData } from "@/data/bsides";

let cachedTracks: Track[] | null = null;

/**
 * Normalize a string for fuzzy matching:
 * lowercase, strip all non-alphanumeric chars, collapse whitespace.
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/**
 * Extract the title portion from a lyrics filename.
 * Pattern: "NN - Title.txt" → "Title"
 */
function extractLyricsTitle(filename: string): string {
  return filename
    .replace(/\.txt$/i, "")
    .replace(/^\d+\s*-\s*/, "")
    .trim();
}

/**
 * Extract a clean title from an MP3 filename.
 * Strips .mp3 extension and "Radiohead - " prefix.
 */
function extractMp3Title(filename: string): string {
  return filename
    .replace(/\.mp3$/i, "")
    .replace(/^Radiohead\s*-\s*/i, "")
    .trim();
}

/**
 * Build a map of normalized lyrics titles → raw file content
 * from the /lyrics/ directory.
 */
async function loadLyricsMap(
  lyricsDir: string
): Promise<Map<string, { raw: string; originalTitle: string }>> {
  const map = new Map<string, { raw: string; originalTitle: string }>();

  let files: string[];
  try {
    files = await readdir(lyricsDir);
  } catch {
    // Lyrics directory doesn't exist — return empty map
    return map;
  }

  const txtFiles = files.filter((f) => f.endsWith(".txt"));

  for (const file of txtFiles) {
    try {
      const content = await readFile(join(lyricsDir, file), "utf-8");
      const title = extractLyricsTitle(file);
      const key = normalize(title);
      map.set(key, { raw: content, originalTitle: title });
    } catch {
      // Skip unreadable files
    }
  }

  return map;
}

/**
 * Find the best matching lyrics for a track.
 * Tries matching against metadata title first, then cleaned filename.
 * Returns the lyrics string, or null if the track is instrumental.
 * Returns undefined if no match was found.
 */
function findLyrics(
  metadataTitle: string,
  mp3Filename: string,
  lyricsMap: Map<string, { raw: string; originalTitle: string }>
): string | null | undefined {
  // Candidates to try matching (in priority order)
  const candidates = [
    normalize(metadataTitle),
    normalize(extractMp3Title(mp3Filename)),
  ];

  for (const candidate of candidates) {
    const match = lyricsMap.get(candidate);
    if (match) {
      return processLyricsContent(match.raw);
    }
  }

  // Try partial/substring matching as a last resort
  // (handles cases like "Pop is Dead Radiohead" → "Pop Is Dead")
  for (const [key, value] of lyricsMap.entries()) {
    for (const candidate of candidates) {
      if (candidate.includes(key) || key.includes(candidate)) {
        return processLyricsContent(value.raw);
      }
    }
  }

  return undefined; // No match found
}

/**
 * Process raw lyrics file content.
 * Returns null for instrumental tracks, cleaned lyrics string otherwise.
 */
function processLyricsContent(raw: string): string | null {
  const trimmed = raw.trim();

  // Instrumental / no-lyrics marker
  if (trimmed.toLowerCase().startsWith("no lyrics song")) {
    return null;
  }

  return trimmed;
}

export async function GET() {
  if (cachedTracks) {
    return NextResponse.json(cachedTracks);
  }

  try {
    const bsidesDir = join(process.cwd(), "songs", "B-side");
    const lyricsDir = join(process.cwd(), "songs", "B-side", "lyrics");

    const lyricsMap = await loadLyricsMap(lyricsDir);

    const files = await readdir(bsidesDir);
    const mp3Files = files.filter((f) => f.endsWith(".mp3"));

    // Process all tracks concurrently
    const unsortedTracks = await Promise.all(
      mp3Files.map(async (file) => {
        const filePath = join(bsidesDir, file);
        const staticData = bsidesStaticData[file] ?? {};

        try {
          const metadata = await mm.parseFile(filePath, {
            duration: true,
            skipCovers: true,
          });
          let title = metadata.common.title;
          if (!title) {
            title = file
              .replace(".mp3", "")
              .replace(/^Radiohead\s*-\s*/i, "");
          }

          const durationSec = metadata.format.duration || 0;
          const mins = Math.floor(durationSec / 60);
          const secs = Math.floor(durationSec % 60)
            .toString()
            .padStart(2, "0");

          const lyricsFromFile = findLyrics(title.trim(), file, lyricsMap);
          let finalLyrics: string | undefined;

          if (lyricsFromFile === null) {
            finalLyrics = undefined;
          } else if (lyricsFromFile !== undefined) {
            finalLyrics = lyricsFromFile;
          }

          return {
            title: title.trim(),
            duration: `${mins}:${secs}`,
            durationSeconds: Math.floor(durationSec),
            fileName: file,
            ...(staticData.description && { description: staticData.description }),
            ...(staticData.funFacts && { funFacts: staticData.funFacts }),
            ...(staticData.productionNotes && { productionNotes: staticData.productionNotes }),
            ...(finalLyrics && { lyrics: finalLyrics }),
          };
        } catch (err) {
          console.error("Failed to parse", file, err);

          const fallbackTitle = file
            .replace(".mp3", "")
            .replace(/^Radiohead\s*-\s*/i, "")
            .trim();
          const lyricsFromFile = findLyrics(fallbackTitle, file, lyricsMap);
          let finalLyrics: string | undefined;

          if (lyricsFromFile === null) {
            finalLyrics = undefined;
          } else if (lyricsFromFile !== undefined) {
            finalLyrics = lyricsFromFile;
          }

          return {
            title: fallbackTitle,
            duration: "0:00",
            durationSeconds: 0,
            fileName: file,
            ...(staticData.description && { description: staticData.description }),
            ...(staticData.funFacts && { funFacts: staticData.funFacts }),
            ...(staticData.productionNotes && { productionNotes: staticData.productionNotes }),
            ...(finalLyrics && { lyrics: finalLyrics }),
          };
        }
      })
    );

    // Assign sequential track numbers
    const tracks: Track[] = unsortedTracks.map((track, idx) => ({
      ...track,
      number: idx + 1,
    }));

    cachedTracks = tracks;
    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error reading B-sides:", error);
    return NextResponse.json(
      { error: "Failed to load B-sides" },
      { status: 500 }
    );
  }
}
