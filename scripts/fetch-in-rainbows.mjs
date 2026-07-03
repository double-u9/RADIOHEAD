import fs from 'fs';
import https from 'https';

const file = 'src/data/albums.ts';
let content = fs.readFileSync(file, 'utf8');

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
  // Let's just fetch for 15 Step, Videotape, Nude, Jigsaw Falling into Place, Weird Fishes/Arpeggi, Reckoner
  const tracks = ["15 Step", "Bodysnatchers", "Nude", "Weird Fishes/Arpeggi", "All I Need", "Faust Arp", "Reckoner", "House of Cards", "Jigsaw Falling into Place", "Videotape"];
  
  for (const track of tracks) {
    console.log("Fetching: " + track);
    const t = await fetchLRC(track);
    if (t) {
      const escaped = t.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      // match title: "15 Step",\n lyrics: "...",
      const regex = new RegExp(`title:\\s*"${track.replace("/", "\\\\/")}",\\s*lyrics:\\s*"[\\s\\S]*?",`);
      content = content.replace(regex, `title: "${track}",\n        lyrics: "${escaped}",`);
      fs.writeFileSync(file, content);
      console.log('Fixed ' + track);
    }
  }
})();
