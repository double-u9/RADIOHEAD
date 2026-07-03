"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Music,
} from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import { Track } from "@/types";

// ─── Expandable Track Detail Panel ────────────────────────────────────────────
interface TrackDetailProps {
  track: Track;
  isExpanded: boolean;
}

function TrackDetail({ track, isExpanded }: TrackDetailProps) {
  const hasDetails =
    track.description || (track.funFacts && track.funFacts.length > 0) || track.productionNotes;

  if (!hasDetails) return null;

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="px-4 md:px-16 pb-5 pt-2 space-y-4">
            {track.description && (
              <div className="flex gap-3">
                <Info size={14} className="text-white/30 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/50 leading-relaxed">{track.description}</p>
              </div>
            )}
            {track.funFacts && track.funFacts.length > 0 && (
              <div className="flex gap-3">
                <Sparkles size={14} className="text-white/30 mt-0.5 flex-shrink-0" />
                <ul className="space-y-1.5">
                  {track.funFacts.map((fact, i) => (
                    <li key={i} className="text-sm text-white/40 leading-relaxed">
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {track.productionNotes && (
              <div className="flex gap-3">
                <Music size={14} className="text-white/30 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/40 leading-relaxed italic">
                  {track.productionNotes}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Mini Discs Page ──────────────────────────────────────────────────────
export default function MiniDiscsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);

  const {
    currentTrack,
    currentAlbum,
    isPlaying,
    playTrack,
    playAlbum,
    togglePlay,
  } = usePlayerStore();

  useEffect(() => {
    fetch("/api/minidiscs")
      .then((res) => res.json())
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const virtualAlbum = useMemo(
    () => ({
      id: "minidiscs",
      title: "Mini Discs",
      year: 2019,
      folderName: "MINI DISKS",
      trackCount: tracks.length,
      coverPath: "",
      accentColor: "hsl(0, 0%, 50%)",
      accentColorRGB: "128, 128, 128",
      description: "Hacked MD archives released by the band.",
      producer: "Radiohead",
      label: "Self-released",
      recordedAt: "Various",
      tracks,
    }),
    [tracks]
  );

  const isCurrentAlbum = currentAlbum?.id === virtualAlbum.id;

  return (
    <div className="min-h-screen has-player bg-black">
      {/* Header */}
      <div className="pt-32 md:pt-40 pb-12 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/15 font-medium mb-4">
              Archive
            </p>
          </motion.div>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-sans font-black text-5xl md:text-7xl lg:text-[8rem] tracking-[-0.04em] text-white leading-[0.85]"
            >
              Mini Discs
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-8 flex items-center gap-6"
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
                {loading ? "..." : `${tracks.length} archive tracks`}, OK Computer era sessions.
              </p>
              <p className="text-xs text-white/30 mt-1">
                {loading ? "Loading tracks..." : `${tracks.length} sessions`}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Track List */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-12">
        <div className="space-y-0.5">
          {/* List Header */}
          <div className="grid grid-cols-[3rem_1fr_auto] md:grid-cols-[3rem_1fr_auto_5rem] gap-4 px-4 py-2 text-[10px] text-white/20 uppercase tracking-[0.2em] border-b border-white/5 mb-4">
            <span>Art</span>
            <span>Session</span>
            <span className="hidden md:block" />
            <span className="flex items-center justify-end">
              <Clock size={14} />
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-white/30 text-sm tracking-[0.2em] uppercase">
              Loading Archive...
            </div>
          ) : (
            tracks.map((track, i) => {
              const isCurrentTrackPlaying =
                isCurrentAlbum && currentTrack?.fileName === track.fileName && isPlaying;
              const isActive = isCurrentAlbum && currentTrack?.fileName === track.fileName;
              const hasDetails =
                track.description ||
                (track.funFacts && track.funFacts.length > 0) ||
                track.productionNotes;

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
                    {/* Main row */}
                    <div
                      className="grid grid-cols-[3rem_1fr_auto] md:grid-cols-[3rem_1fr_auto_5rem] gap-4 px-4 py-3 items-center cursor-pointer"
                      onClick={() => {
                        if (isActive) {
                          togglePlay();
                        } else {
                          playTrack(virtualAlbum, track);
                        }
                      }}
                    >
                      {/* Cover Art / Playing indicator */}
                      <div className="relative w-10 h-10 rounded bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <Image
                          src={track.coverPath!}
                          alt={track.title}
                          fill
                          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          unoptimized
                        />
                        {/* Overlay for active state */}
                        {isActive && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            {isCurrentTrackPlaying ? (
                              <div className="flex items-center justify-center gap-0.5">
                                {[1, 2, 3].map((bar) => (
                                  <motion.div
                                    key={bar}
                                    animate={{ height: [4, 12, 4] }}
                                    transition={{
                                      duration: 0.6,
                                      repeat: Infinity,
                                      delay: bar * 0.15,
                                    }}
                                    className="w-[3px] rounded-full bg-white"
                                  />
                                ))}
                              </div>
                            ) : (
                              <Pause size={14} className="text-white" fill="white" />
                            )}
                          </div>
                        )}
                        {/* Hover play icon (only if not active) */}
                        {!isActive && (
                          <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                            <Play size={14} className="text-white ml-0.5" fill="white" />
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="min-w-0 flex flex-col justify-center">
                        <p
                          className={`text-sm font-medium truncate ${
                            isActive ? "text-white" : "text-white/80"
                          }`}
                        >
                          {track.title}
                        </p>
                      </div>

                      {/* Expand button */}
                      <div onClick={(e) => e.stopPropagation()}>
                        {hasDetails && (
                          <button
                            onClick={() =>
                              setExpandedTrack(expandedTrack === track.number ? null : track.number)
                            }
                            className="p-1 text-white/20 hover:text-white/50 transition-colors"
                          >
                            {expandedTrack === track.number ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Duration */}
                      <span className="text-sm text-white/30 text-right hidden md:block">
                        {track.duration}
                      </span>
                    </div>

                    {/* Expandable detail panel */}
                    <TrackDetail
                      track={track}
                      isExpanded={expandedTrack === track.number}
                    />
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
