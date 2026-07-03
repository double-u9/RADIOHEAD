import fs from 'fs';
import path from 'path';
import { Client } from 'genius-lyrics';

const client = new Client(); // No key needed for basic scraping
const ALBUMS_FILE = path.resolve('src/data/albums.ts');

async function run() {
  console.log("Reading albums.ts...");
  let content = fs.readFileSync(ALBUMS_FILE, 'utf8');

  const titleRegex = /title:\s*"([^"]+)",/g;
  let match;
  let matches = [];
  
  while ((match = titleRegex.exec(content)) !== null) {
    const title = match[1];
    const index = match.index;
    const lookahead = content.substring(index, index + 100);
    if (lookahead.includes('fileName:') || lookahead.includes('duration:')) {
      matches.push({ title, index, fullMatch: match[0] });
    }
  }

  matches.reverse();

  let foundCount = 0;

  for (const { title, index, fullMatch } of matches) {
    const lookahead = content.substring(index, index + 300);
    if (lookahead.includes('lyrics:')) {
      console.log(`⏭️ Lyrics already exist for ${title}`);
      continue;
    }

    console.log(`Fetching lyrics for: ${title}`);
    try {
      const searches = await client.songs.search(`Radiohead ${title}`);
      if (searches.length === 0) {
        console.log(`❌ No lyrics found for ${title}`);
        continue;
      }
      
      const song = searches[0];
      const lyrics = await song.lyrics();
      
      if (lyrics) {
        const lyricsFormatted = JSON.stringify(lyrics);
        const replacement = `${fullMatch}\n        lyrics: ${lyricsFormatted},`;
        content = content.substring(0, index) + replacement + content.substring(index + fullMatch.length);
        console.log(`✅ Added lyrics for ${title}`);
        foundCount++;
      }
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`Error fetching ${title}:`, e.message);
    }
    
    // Write incrementally in case it crashes
    if (foundCount % 5 === 0) {
      fs.writeFileSync(ALBUMS_FILE, content, 'utf8');
    }
  }

  fs.writeFileSync(ALBUMS_FILE, content, 'utf8');
  console.log(`Done! Found lyrics for ${foundCount} tracks.`);
}

run();
