import fs from 'fs';
import lyricsFinder from 'lyrics-finder';
import path from 'path';

const ALBUMS_FILE = path.resolve('src/data/albums.ts');

async function run() {
  console.log("Reading albums.ts...");
  let content = fs.readFileSync(ALBUMS_FILE, 'utf8');

  // We will find all blocks that look like track definitions.
  // A track block starts with `{` and contains `title: "Track Title",`
  // We'll use a regex to match the title line and inject the lyrics below it if it doesn't have lyrics.
  
  const titleRegex = /title:\s*"([^"]+)",/g;
  let match;
  let matches = [];
  
  while ((match = titleRegex.exec(content)) !== null) {
    // Skip album titles (usually followed by year or folderName)
    // We can guess it's a track if it's near `fileName:`
    const title = match[1];
    const index = match.index;
    
    // Quick check if this is a track by looking ahead for `fileName:` or `duration:` within 100 chars
    const lookahead = content.substring(index, index + 100);
    if (lookahead.includes('fileName:') || lookahead.includes('duration:')) {
      matches.push({ title, index, fullMatch: match[0] });
    }
  }

  console.log(`Found ${matches.length} tracks. Fetching lyrics...`);
  
  // We need to replace from the end to the beginning to avoid messing up indices
  matches.reverse();

  for (const { title, index, fullMatch } of matches) {
    console.log(`Fetching lyrics for: ${title}`);
    try {
      let lyrics = await lyricsFinder("Radiohead", title);
      
      if (lyrics) {
        // Clean up lyrics (escape backticks, etc. actually we'll use stringify)
        const lyricsFormatted = JSON.stringify(lyrics);
        
        // Check if lyrics already exist nearby
        const lookahead = content.substring(index, index + 300);
        if (!lookahead.includes('lyrics:')) {
          const replacement = `${fullMatch}\n        lyrics: ${lyricsFormatted},`;
          content = content.substring(0, index) + replacement + content.substring(index + fullMatch.length);
          console.log(`✅ Added lyrics for ${title}`);
        } else {
          console.log(`⏭️ Lyrics already exist for ${title}`);
        }
      } else {
        console.log(`❌ No lyrics found for ${title}`);
      }
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`Error fetching ${title}:`, e.message);
    }
  }

  fs.writeFileSync(ALBUMS_FILE, content, 'utf8');
  console.log("Done updating albums.ts!");
}

run();
