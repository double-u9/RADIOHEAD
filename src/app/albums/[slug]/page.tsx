"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Clock,
  Disc3,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Music,
  Info,
  Sparkles,
} from "lucide-react";
import { getAlbumBySlug } from "@/data/albums";
import { usePlayerStore } from "@/store/player-store";
import { Track } from "@/types";
import { notFound } from "next/navigation";

interface TrackDetailProps {
  track: Track;
  isExpanded: boolean;
  onToggle: () => void;
}

function TrackDetail({ track, isExpanded, onToggle }: TrackDetailProps) {
  const hasDetails =
    track.description || track.funFacts?.length || track.productionNotes;

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
          <div className="px-4 md:px-14 pb-5 pt-2 space-y-4">
            {track.description && (
              <div className="flex gap-3">
                <Info
                  size={14}
                  className="text-white/30 mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-white/50 leading-relaxed">
                  {track.description}
                </p>
              </div>
            )}

            {track.funFacts && track.funFacts.length > 0 && (
              <div className="flex gap-3">
                <Sparkles
                  size={14}
                  className="text-white/30 mt-0.5 flex-shrink-0"
                />
                <ul className="space-y-1.5">
                  {track.funFacts.map((fact, i) => (
                    <li
                      key={i}
                      className="text-sm text-white/40 leading-relaxed"
                    >
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {track.productionNotes && (
              <div className="flex gap-3">
                <Music
                  size={14}
                  className="text-white/30 mt-0.5 flex-shrink-0"
                />
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

export default function AlbumDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const album = getAlbumBySlug(slug);
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);

  const {
    currentTrack,
    currentAlbum,
    isPlaying,
    playTrack,
    playAlbum,
    togglePlay,
  } = usePlayerStore();

  if (!album) {
    notFound();
  }

  const isCurrentAlbum = currentAlbum?.id === album.id;

  const totalDuration = album.tracks.reduce(
    (sum, t) => sum + t.durationSeconds,
    0
  );
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <div className="min-h-screen has-player bg-black">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background: subtle blurred cover */}
        <div className="absolute inset-0">
          <Image
            src={album.coverPath}
            alt=""
            fill
            className="object-cover blur-3xl scale-125 opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 md:px-12 pt-32 pb-16">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/albums"
              className="nav-link inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors mb-12"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
            {/* Album Cover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full md:w-72 lg:w-80 flex-shrink-0"
            >
              <div className="relative aspect-square overflow-hidden group">
                <Image
                  src={album.coverPath}
                  alt={album.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </motion.div>

            {/* Album Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 min-w-0"
            >
              <p className="text-[10px] tracking-[0.4em] text-white/20 uppercase mb-3">
                Studio Album
              </p>
              <h1 className="font-sans font-black text-4xl md:text-6xl lg:text-7xl tracking-[-0.03em] text-white leading-[0.9] mb-6">
                {album.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/30 mb-8">
                <span className="font-medium text-white/60">Radiohead</span>
                <span>·</span>
                <span>{album.year}</span>
                <span>·</span>
                <span>{album.trackCount} songs</span>
                <span>·</span>
                <span>{totalMinutes} min</span>
              </div>

              <div className="flex gap-6 mb-10 items-center">
                <button
                  onClick={() => {
                    if (isCurrentAlbum && isPlaying) {
                      togglePlay();
                    } else {
                      playAlbum(album);
                    }
                  }}
                  className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center transition-all hover:border-white hover:bg-white/10 hover:scale-105 active:scale-95"
                >
                  {isCurrentAlbum && isPlaying ? (
                    <Pause size={22} fill="white" className="text-white" />
                  ) : (
                    <Play size={22} className="text-white ml-1" fill="white" />
                  )}
                </button>
                <span className="text-[11px] tracking-[0.2em] uppercase text-white/25">
                  {isCurrentAlbum && isPlaying ? "Playing" : "Play Album"}
                </span>
              </div>

              <p className="text-sm text-white/25 leading-relaxed max-w-xl">
                {album.description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-12">
        <div className="space-y-0.5">
          {/* Header */}
          <div className="grid grid-cols-[2rem_1fr_auto] md:grid-cols-[2rem_1fr_auto_5rem] gap-4 px-4 py-2 text-[10px] text-white/20 uppercase tracking-[0.2em] border-b border-white/5 mb-2">
            <span className="text-right">#</span>
            <span>Title</span>
            <span className="hidden md:block" />
            <span className="flex items-center justify-end">
              <Clock size={14} />
            </span>
          </div>

          {album.tracks.map((track, i) => {
            const isCurrentTrackPlaying =
              isCurrentAlbum &&
              currentTrack?.number === track.number &&
              isPlaying;
            const isCurrentTrackPaused =
              isCurrentAlbum &&
              currentTrack?.number === track.number &&
              !isPlaying;
            const isActive = isCurrentAlbum && currentTrack?.number === track.number;
            const hasDetails =
              track.description ||
              (track.funFacts && track.funFacts.length > 0) ||
              track.productionNotes;

            return (
              <motion.div
                key={track.number}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  className={`group rounded-lg transition-colors ${
                    isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div
                    className="grid grid-cols-[2rem_1fr_auto] md:grid-cols-[2rem_1fr_auto_5rem] gap-4 px-4 py-3 items-center cursor-pointer"
                    onClick={() => {
                      if (isActive) {
                        togglePlay();
                      } else {
                        playTrack(album, track);
                      }
                    }}
                  >
                    {/* Number / Playing indicator */}
                    <div className="text-right">
                      {isCurrentTrackPlaying ? (
                        <div className="flex items-center justify-end gap-0.5">
                          {[1, 2, 3].map((bar) => (
                            <motion.div
                              key={bar}
                              animate={{ height: [4, 12, 4] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: bar * 0.15,
                              }}
                              className="w-[3px] rounded-full"
                              style={{ background: album.accentColor }}
                            />
                          ))}
                        </div>
                      ) : isCurrentTrackPaused ? (
                        <Pause
                          size={14}
                          className="ml-auto"
                          style={{ color: album.accentColor }}
                        />
                      ) : (
                        <>
                          <span className="text-sm text-white/30 group-hover:hidden">
                            {track.number}
                          </span>
                          <Play
                            size={14}
                            className="hidden group-hover:block ml-auto text-white"
                            fill="white"
                          />
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-white" : "text-white/80"
                        }`}
                        style={isActive ? { color: album.accentColor } : {}}
                      >
                        {track.title}
                      </p>
                    </div>

                    {/* Expand button */}
                    <div>
                      {hasDetails && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedTrack(
                              expandedTrack === track.number
                                ? null
                                : track.number
                            );
                          }}
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

                  {/* Expandable details */}
                  <TrackDetail
                    track={track}
                    isExpanded={expandedTrack === track.number}
                    onToggle={() =>
                      setExpandedTrack(
                        expandedTrack === track.number ? null : track.number
                      )
                    }
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Album Info Section */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="border-t border-white/5 pt-12">
          <h2 className="font-display text-sm tracking-[0.3em] text-white/30 uppercase mb-8">
            About This Album
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs text-white/30 uppercase tracking-wider mb-2">
                  Producer
                </h3>
                <p className="text-sm text-white/70">{album.producer}</p>
              </div>
              <div>
                <h3 className="text-xs text-white/30 uppercase tracking-wider mb-2">
                  Label
                </h3>
                <p className="text-sm text-white/70">{album.label}</p>
              </div>
              <div>
                <h3 className="text-xs text-white/30 uppercase tracking-wider mb-2">
                  Recorded At
                </h3>
                <p className="text-sm text-white/70">{album.recordedAt}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs text-white/30 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {album.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
