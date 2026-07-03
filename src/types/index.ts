export interface Track {
  number: number;
  title: string;
  fileName: string;
  duration: string;
  durationSeconds: number;
  description?: string;
  funFacts?: string[];
  productionNotes?: string;
  lyrics?: string;
  coverPath?: string;
  id?: string;
}

export interface Album {
  id: string;
  title: string;
  year: number;
  folderName: string;
  trackCount: number;
  coverPath: string;
  accentColor: string;
  accentColorRGB: string;
  description: string;
  producer: string;
  label: string;
  recordedAt: string;
  tracks: Track[];
}
