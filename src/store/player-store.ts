"use client";

import { create } from "zustand";
import { Album, Track } from "@/types";

interface PlayerState {
  // Current playback
  currentAlbum: Album | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Queue
  queue: { album: Album; track: Track }[];
  queueIndex: number;

  // UI
  isExpanded: boolean;
  isQueueOpen: boolean;
  repeatMode: "off" | "all" | "one";

  // Audio element ref
  audioRef: HTMLAudioElement | null;
  
  // Deferred playback: URL to load once audioRef becomes available
  pendingTrackUrl: string | null;

  // Equalizer state: 10 bands (-12 to +12 dB)
  eqBands: number[];

  // Actions
  setAudioRef: (ref: HTMLAudioElement) => void;
  playTrack: (album: Album, track: Track) => void;
  playAlbum: (album: Album, startIndex?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleExpanded: () => void;
  toggleQueue: () => void;
  toggleRepeat: () => void;
  addToQueue: (album: Album, track: Track) => void;
  clearPendingTrack: () => void;
  setEqBand: (index: number, gain: number) => void;
  setEqPreset: (bands: number[]) => void;
}

function getTrackUrl(album: Album, track: Track): string {
  return `/api/music/${encodeURIComponent(album.folderName)}/${encodeURIComponent(track.fileName)}`;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentAlbum: null,
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  queue: [],
  queueIndex: -1,
  isExpanded: false,
  isQueueOpen: false,
  repeatMode: "all",
  audioRef: null,
  pendingTrackUrl: null,
  eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  setEqBand: (index, gain) =>
    set((state) => {
      const newBands = [...state.eqBands];
      newBands[index] = gain;
      return { eqBands: newBands };
    }),

  setEqPreset: (bands) => set({ eqBands: bands }),

  setAudioRef: (ref) => set({ audioRef: ref }),

  playTrack: (album, track) => {
    const url = getTrackUrl(album, track);

    // Build queue from album tracks
    const queue = album.tracks.map((t) => ({ album, track: t }));
    const queueIndex = album.tracks.findIndex(
      (t) => t.number === track.number
    );

    set({
      currentAlbum: album,
      currentTrack: track,
      queue,
      queueIndex,
      isPlaying: true,
      progress: 0,
    });
    
    // Auto-play new track if audio ref exists
    const { audioRef, volume, isMuted } = get();
    if (audioRef) {
      audioRef.src = url;
      audioRef.volume = isMuted ? 0 : volume;
      audioRef.play().catch(() => {});
      set({ pendingTrackUrl: null });
    } else {
      set({ pendingTrackUrl: url });
    }
  },

  playAlbum: (album, startIndex = 0) => {
    const track = album.tracks[startIndex];
    if (track) {
      get().playTrack(album, track);
    }
  },

  togglePlay: () => {
    const { audioRef, isPlaying } = get();
    if (!audioRef) return;

    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play().catch(() => {});
    }
    set({ isPlaying: !isPlaying });
  },

  pause: () => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.pause();
      set({ isPlaying: false });
    }
  },

  resume: () => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.play().catch(() => {});
      set({ isPlaying: true });
    }
  },

  next: () => {
    const { queue, queueIndex, repeatMode } = get();
    if (repeatMode === "one") {
      const { audioRef } = get();
      if (audioRef) {
        audioRef.currentTime = 0;
        audioRef.play().catch(() => {});
        set({ progress: 0, isPlaying: true });
      }
      return;
    }
    if (queueIndex < queue.length - 1) {
      const next = queue[queueIndex + 1];
      get().playTrack(next.album, next.track);
    } else if (repeatMode === "all" && queue.length > 0) {
      const next = queue[0];
      get().playTrack(next.album, next.track);
    } else {
      set({ isPlaying: false, progress: 0 });
      const { audioRef } = get();
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
    }
  },

  previous: () => {
    const { queue, queueIndex, audioRef, progress } = get();
    // If more than 3 seconds in, restart current track
    if (progress > 3 && audioRef) {
      audioRef.currentTime = 0;
      set({ progress: 0 });
      return;
    }
    if (queueIndex > 0) {
      const prev = queue[queueIndex - 1];
      get().playTrack(prev.album, prev.track);
    }
  },

  seek: (time) => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.currentTime = time;
      set({ progress: time });
    }
  },

  setVolume: (volume) => {
    const { audioRef } = get();
    set({ volume, isMuted: false });
    if (audioRef) {
      audioRef.volume = volume;
    }
  },

  toggleMute: () => {
    const { audioRef, isMuted, volume } = get();
    set({ isMuted: !isMuted });
    if (audioRef) {
      audioRef.volume = isMuted ? volume : 0;
    }
  },

  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),

  toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),
  toggleQueue: () => set((s) => ({ isQueueOpen: !s.isQueueOpen })),
  toggleRepeat: () =>
    set((s) => {
      const nextMode: Record<string, "off" | "all" | "one"> = {
        off: "all",
        all: "one",
        one: "off",
      };
      return { repeatMode: nextMode[s.repeatMode] || "off" };
    }),

  addToQueue: (album, track) => {
    set((s) => ({
      queue: [...s.queue, { album, track }],
    }));
  },

  clearPendingTrack: () => set({ pendingTrackUrl: null }),
}));
