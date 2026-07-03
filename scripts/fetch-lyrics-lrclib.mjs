import fs from 'fs';
import path from 'path';
import https from 'https';

const ALBUMS_PATH = path.resolve('src/data/albums.ts');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchSyncedLyrics(trackName) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(`Radiohead ${trackName}`);
    const url = `https://lrclib.net/api/search?q=${q}`;
    
    https.get(url, { headers: { 'User-Agent': 'AntigravityAgent/1.0.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const arr = JSON.parse(data);
          if (Array.isArray(arr) && arr.length > 0) {
            const withSynced = arr.find(t => t.syncedLyrics);
            if (withSynced) {
              resolve(withSynced.syncedLyrics);
            } else if (arr[0].plainLyrics) {
              resolve(arr[0].plainLyrics);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  let content = fs.readFileSync(ALBUMS_PATH, 'utf8');
  const trackBlockRegex = /title:\s*"([^"]+)",\s*lyrics:\s*"([\s\S]*?)",\s*fileName:/g;
  
  console.log('Fetching synced lyrics via search with delay...');
  let i = 0;
  
  // replaceAsync doesn't guarantee sequential execution because of Promise.all mapping.
  // We should do a manual loop over matches.
  const matches = [...content.matchAll(trackBlockRegex)];
  
  for (const match of matches) {
    const fullMatch = match[0];
    const title = match[1];
    const oldLyrics = match[2];
    
    // Skip if it already has LRC tags
    if (oldLyrics.includes('[00:')) {
      continue;
    }

    const lyrics = await fetchSyncedLyrics(title);
    i++;
    
    if (lyrics) {
      console.log(`Fetched ${i}: ${title} - OK`);
      const escapedLyrics = lyrics.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      const newBlock = `title: "${title}",\n        lyrics: "${escapedLyrics}",\n        fileName:`;
      content = content.replace(fullMatch, newBlock);
    } else {
      console.log(`Fetched ${i}: ${title} - FAILED`);
    }
    
    await sleep(700); // 700ms delay to avoid rate limit
  }
  
  fs.writeFileSync(ALBUMS_PATH, content, 'utf8');
  console.log('Done.');
}

run();
