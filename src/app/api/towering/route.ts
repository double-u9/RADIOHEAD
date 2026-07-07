import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

export async function GET() {
  const toweringDir = join(process.cwd(), "songs", "TOWERING ABOVE THE REST");
  
  try {
    const items = await readdir(toweringDir);
    const cds = [];
    
    for (const item of items) {
      const itemPath = join(toweringDir, item);
      const stats = await stat(itemPath);
      
      if (stats.isDirectory()) {
        const files = await readdir(itemPath);
        const audioFiles = files.filter(f => f.endsWith(".flac") || f.endsWith(".mp3"));
        
        cds.push({
          name: item,
          folderName: item,
          trackCount: audioFiles.length
        });
      }
    }
    
    // Sort logically (CD 01, CD 02, etc.)
    cds.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    
    return NextResponse.json(cds);
  } catch (error) {
    console.error("Error reading Towering Above The Rest:", error);
    return NextResponse.json({ error: "Failed to load Towering collection" }, { status: 500 });
  }
}
