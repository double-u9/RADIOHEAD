import { NextRequest, NextResponse } from "next/server";

// In-memory lyrics cache (persists across requests in the same server process)
const lyricsCache = new Map<string, string | null>();

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get("artist") || "";
  const title = request.nextUrl.searchParams.get("title") || "";

  if (!title) {
    return NextResponse.json({ lyrics: null });
  }

  const cacheKey = `${artist}:${title}`.toLowerCase();

  if (lyricsCache.has(cacheKey)) {
    return NextResponse.json({ lyrics: lyricsCache.get(cacheKey) });
  }

  try {
    // lyrics-finder is a CJS module — dynamic import
    const lyricsFinder = (await import("lyrics-finder")).default || (await import("lyrics-finder"));
    const result = await lyricsFinder(artist, title);

    const lyrics =
      result && typeof result === "string" && result.trim().length > 20
        ? result.trim()
        : null;

    lyricsCache.set(cacheKey, lyrics);
    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error("Lyrics fetch error for", artist, "-", title, ":", error);
    lyricsCache.set(cacheKey, null);
    return NextResponse.json({ lyrics: null });
  }
}
