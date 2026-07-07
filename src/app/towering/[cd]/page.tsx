"use client";

import { useEffect, useState, useMemo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import { Track } from "@/types";

export default function ToweringCDPage({ params }: { params: Promise<{ cd: string }> }) {
  const { cd } = use(params);
  const decodedCd = decodeURIComponent(cd);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    currentTrack,
    currentAlbum,
    isPlaying,
    playTrack,
    playAlbum,
    togglePlay,
  } = usePlayerStore();

  useEffect(() => {
    fetch(`/api/towering/${encodeURIComponent(decodedCd)}`)
      .then((res) => res.json())
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [decodedCd]);

  const virtualAlbum = useMemo(
    () => ({
      id: `towering-${decodedCd.replace(/\s+/g, '-').toLowerCase()}`,
      title: decodedCd,
      year: 2026, // Approximate year of the compilation
      folderName: `TOWERING ABOVE THE REST/${decodedCd}`,
      trackCount: tracks.length,
      coverPath: `/api/towering/artwork?cd=${encodeURIComponent(decodedCd)}&v=2`,
      accentColor: "hsl(215, 20%, 30%)",
      accentColorRGB: "60, 75, 95",
      description: `Part of the Towering Above the Rest archive.`,
      producer: "Various",
      label: "Archive",
      recordedAt: "Various",
      tracks,
    }),
    [decodedCd, tracks]
  );

  const isCurrentAlbum = currentAlbum?.id === virtualAlbum.id;

  return (
    <div className="min-h-screen has-player bg-black">
      {/* Header */}
      <div className="pt-32 md:pt-40 pb-12 px-8 md:px-12 border-b border-white/5 relative overflow-hidden">
        {/* Blurred background image */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]">
          <Image
            src={virtualAlbum.coverPath}
            alt=""
            fill
            className="object-cover blur-[60px]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="mb-6"
          >
            <Link 
              href="/towering" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Collection
            </Link>
          </motion.div>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-48 h-48 md:w-56 md:h-56 relative rounded-lg overflow-hidden shadow-2xl flex-shrink-0"
            >
              <Image
                src={virtualAlbum.coverPath}
                alt={virtualAlbum.title}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </motion.div>
            
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <p className="text-[10px] tracking-[0.4em] uppercase text-white/30 font-medium mb-3">
                  Archive Series
                </p>
              </motion.div>
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="font-sans font-black text-4xl md:text-5xl lg:text-7xl tracking-[-0.04em] text-white leading-[0.9]"
                >
                  {decodedCd}
                </motion.h1>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="mt-6 flex items-center gap-6"
              >
                <button
                  onClick={() => {
                    if (tracks.length === 0) return;
                    if (isCurrentAlbum && isPlaying) {
                      togglePlay();
                    } else {
                      playAlbum(virtualAlbum);
                    }
                  }}
                  disabled={loading || tracks.length === 0}
                  className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center transition-all hover:border-white hover:bg-white/10 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCurrentAlbum && isPlaying ? (
                    <Pause size={22} fill="white" className="text-white" />
                  ) : (
                    <Play size={22} className="text-white ml-1" fill="white" />
                  )}
                </button>
                <div>
                  <p className="text-sm text-white/50 max-w-lg leading-relaxed">
                    {loading ? "Loading..." : `${tracks.length} tracks`}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-12">
        <div className="space-y-0.5">
          {/* List Header */}
          <div className="grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[2.5rem_1fr_5rem] gap-4 px-4 py-2 text-[10px] text-white/20 uppercase tracking-[0.2em] border-b border-white/5 mb-4">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="flex items-center justify-end">
              <Clock size={14} />
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-white/30 text-sm tracking-[0.2em] uppercase">
              Extracting Audio Metadata...
            </div>
          ) : (
            tracks.map((track, i) => {
              const isCurrentTrackPlaying =
                isCurrentAlbum && currentTrack?.fileName === track.fileName && isPlaying;
              const isActive = isCurrentAlbum && currentTrack?.fileName === track.fileName;

              return (
                <motion.div
                  key={track.fileName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 1) }}
                >
                  <div
                    className={`group rounded-lg transition-colors ${
                      isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div
                      className="grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[2.5rem_1fr_5rem] gap-4 px-4 py-3 items-center cursor-pointer"
                      onClick={() => {
                        if (isActive) {
                          togglePlay();
                        } else {
                          playTrack(virtualAlbum, track);
                        }
                      }}
                    >
                      {/* Play indicator / Track number */}
                      <div className="flex items-center justify-center relative w-full h-full">
                        {isActive && isCurrentTrackPlaying ? (
                          <div className="flex items-center justify-center gap-[2px]">
                            {[1, 2, 3].map((bar) => (
                              <motion.div
                                key={bar}
                                animate={{ height: [3, 10, 3] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: bar * 0.15,
                                }}
                                className="w-[2px] rounded-full bg-white"
                              />
                            ))}
                          </div>
                        ) : isActive && !isCurrentTrackPlaying ? (
                          <Pause size={12} className="text-white" fill="white" />
                        ) : (
                          <>
                            <span className="text-xs text-white/30 font-mono group-hover:opacity-0 transition-opacity">
                              {track.number}
                            </span>
                            <Play size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity absolute ml-0.5" fill="white" />
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isActive ? "text-white" : "text-white/80 group-hover:text-white"
                          }`}
                        >
                          {track.title}
                        </p>
                      </div>

                      {/* Duration */}
                      <span className="text-sm text-white/30 text-right hidden md:block tabular-nums">
                        {track.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
