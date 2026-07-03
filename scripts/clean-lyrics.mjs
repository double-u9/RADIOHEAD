import fs from 'fs';
import path from 'path';

const file = path.resolve('src/data/albums.ts');
let content = fs.readFileSync(file, 'utf8');

// The Genius lyrics often start with "<number> ContributorsTranslations..." or similar, ending with "Lyrics" or "... Read More"
// Then the actual lyrics usually start with "[Verse 1]" or similar.
// But some might just start with text.
// Another pattern: it almost always has the word "Lyrics" right after the song title, and if there's a description, it ends with "Read More " or "Read More\xa0"
content = content.replace(/lyrics: "([^"]+)"/g, (match, lyricsStr) => {
  // Try to remove everything before the first '['
  const bracketIndex = lyricsStr.indexOf('[');
  if (bracketIndex !== -1 && bracketIndex < 500) { // Usually the intro text is a few hundred chars max
    // Check if what we are removing contains "Contributors" or "Lyrics" to be safe
    const prefix = lyricsStr.substring(0, bracketIndex);
    if (prefix.includes('Contributors') || prefix.includes('Lyrics')) {
      return `lyrics: "${lyricsStr.substring(bracketIndex)}"`;
    }
  }

  // If no bracket, try to remove up to "Read More "
  const readMoreMatch = lyricsStr.match(/Read More(?:\s| )/);
  if (readMoreMatch) {
    const idx = readMoreMatch.index + readMoreMatch[0].length;
    return `lyrics: "${lyricsStr.substring(idx)}"`;
  }

  // Fallback: remove "XX Contributors... Lyrics"
  const lyricsWordIndex = lyricsStr.indexOf('Lyrics');
  if (lyricsWordIndex !== -1 && lyricsWordIndex < 200 && lyricsStr.includes('Contributors')) {
    return `lyrics: "${lyricsStr.substring(lyricsWordIndex + 6).trim()}"`;
  }

  return match;
});

fs.writeFileSync(file, content, 'utf8');
console.log('Cleaned lyrics.');
