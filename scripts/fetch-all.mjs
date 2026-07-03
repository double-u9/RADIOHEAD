import fs from 'fs';
import https from 'https';

const file = 'src/data/albums.ts';
let content = fs.readFileSync(file, 'utf8');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function fetchLRC(trackName) {
  return new Promise(resolve => {
    https.get('https://lrclib.net/api/search?q=' + encodeURIComponent('Radiohead ' + trackName), {headers:{'User-Agent':'Agent/1'}}, res => {
      let data = ''; res.on('data', c => data+=c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const syn = j.find(x => x.syncedLyrics);
          resolve(syn ? syn.syncedLyrics : null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  const trackRegex = /title:\s*"([^"]+)",\s*lyrics:\s*"([\s\S]*?)",\s*fileName:/g;
  const matches = [...content.matchAll(trackRegex)];
  
  for (const match of matches) {
    const fullMatch = match[0];
    const track = match[1];
    const oldLyrics = match[2];
    
    if (oldLyrics.includes('[00:')) {
      continue;
    }
    
    console.log("Fetching: " + track);
    const t = await fetchLRC(track);
    if (t) {
      const escaped = t.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      const regex = new RegExp(`title:\\s*"${track.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\s*lyrics:\\s*"[\\s\\S]*?",\\s*fileName:`);
      content = content.replace(regex, `title: "${track}",\n        lyrics: "${escaped}",\n        fileName:`);
      fs.writeFileSync(file, content);
      console.log('Fixed ' + track);
    } else {
      console.log('Failed ' + track);
    }
    await sleep(700);
  }
  console.log("All done.");
})();
