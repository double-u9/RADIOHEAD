"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  ChevronDown,
  ChevronUp,
  ListMusic,
  X,
  Mic2,
  Activity,
  Repeat,
  Repeat1,
  SlidersHorizontal,
} from "lucide-react";
import { usePlayerStore } from "@/store/player-store";
import AudioVisualizer from "./AudioVisualizer";
import LyricsPanel from "./LyricsPanel";
import EqualizerPanel from "./EqualizerPanel";

declare global {
  interface Window {
    __globalAudioContext?: AudioContext;
    __globalAnalyser?: AnalyserNode;
    __globalEqFilters?: BiquadFilterNode[];
    __globalMasterGain?: GainNode;
  }
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type FullscreenTab = "visualizer" | "lyrics" | "queue" | "equalizer";

export default function FloatingPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const miniProgressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<FullscreenTab | null>(null);

  // ─── Dynamic Lyrics Fetching ──────────────────────────────────
  const [fetchedLyrics, setFetchedLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const lyricsCacheRef = useRef<Record<string, string | null>>({});

  const {
    currentAlbum,
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isExpanded,
    isQueueOpen,
    queue,
    queueIndex,
    pendingTrackUrl,
    setAudioRef,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    setProgress,
    setDuration,
    toggleExpanded,
    toggleQueue,
    repeatMode,
    toggleRepeat,
    playTrack,
    clearPendingTrack,
    eqBands,
  } = usePlayerStore();

  // Fetch lyrics dynamically from static files, falling back to API
  useEffect(() => {
    if (!currentTrack || !currentAlbum) return;

    // Mini Discs are audio-only and have no lyrics.
    if (currentAlbum.id === "minidiscs") {
      setTimeout(() => {
        setFetchedLyrics(null);
        setLyricsLoading(false);
      }, 0);
      return;
    }

    const trackKey = currentTrack.fileName;

    // Check client-side cache first
    if (trackKey in lyricsCacheRef.current) {
      setFetchedLyrics(lyricsCacheRef.current[trackKey]);
      setLyricsLoading(false);
      return;
    }

    setLyricsLoading(true);
    setFetchedLyrics(null);

    const txtFileName = trackKey.replace(".mp3", ".txt");
    const fetchUrl = currentAlbum.id === "b-sides"
      ? `/lyrics/b-sides/${encodeURIComponent(txtFileName)}`
      : `/lyrics/albums/${currentAlbum.id}/${encodeURIComponent(txtFileName)}`;

    fetch(fetchUrl)
      .then(async (res) => {
        if (!res.ok) {
          // Fallback to dynamic api if the static file doesn't exist
          const cleanTitle = currentTrack.title
            .replace(/\s*\(Remastered\)/i, "")
            .replace(/\s*\(Live\)/i, "")
            .replace(/\s*\(.*version.*\)/i, "")
            .replace(/\s*\(Again\)/i, "")
            .trim();
          const fallbackRes = await fetch(`/api/lyrics?artist=Radiohead&title=${encodeURIComponent(cleanTitle)}`);
          if (!fallbackRes.ok) return null;
          const data = await fallbackRes.json();
          return data.lyrics || null;
        }
        return res.text();
      })
      .then((lyricsText) => {
        const finalLyrics = lyricsText && lyricsText.trim().length > 20 ? lyricsText.trim() : null;
        lyricsCacheRef.current[trackKey] = finalLyrics;
        setFetchedLyrics(finalLyrics);
      })
      .catch((err) => {
        console.error("Failed to load lyrics:", err);
        lyricsCacheRef.current[trackKey] = null;
        setFetchedLyrics(null);
      })
      .finally(() => {
        setLyricsLoading(false);
      });
  }, [currentTrack, currentAlbum]);

  // ─── Reset activeTab for instrumental tracks ────────────────
  useEffect(() => {
    if (activeTab === "lyrics") {
      const isMiniDisc = currentAlbum?.id === "minidiscs";
      const isInst = currentTrack?.title === "Treefingers" || currentTrack?.title === "Hunting Bears" || currentTrack?.title === "Feral";
      if (isMiniDisc || isInst) {
        setActiveTab(null);
      }
    }
  }, [currentTrack, currentAlbum, activeTab]);

  // ─── Web Audio API Global Engine ───────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    if (!window.__globalAudioContext) {
      try {
        const ctx = new AudioContext();
        window.__globalAudioContext = ctx;
        
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;
        window.__globalAnalyser = analyser;

        const masterGain = ctx.createGain();
        window.__globalMasterGain = masterGain;

        const eqFrequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        const filters = eqFrequencies.map((freq) => {
          const filter = ctx.createBiquadFilter();
          filter.type = "peaking";
          filter.frequency.value = freq;
          filter.Q.value = 1;
          filter.gain.value = 0;
          return filter;
        });
        window.__globalEqFilters = filters;

        let currentNode: AudioNode = source;
        filters.forEach((filter) => {
          currentNode.connect(filter);
          currentNode = filter;
        });
        
        currentNode.connect(masterGain);
        masterGain.connect(analyser);
        analyser.connect(ctx.destination);
      } catch (e) {
        console.error("Audio Engine Setup Error:", e);
      }
    } else if (window.__globalAudioContext.state === "suspended") {
      window.__globalAudioContext.resume();
    }
  }, [isPlaying]);

  // ─── Sync EQ Bands ─────────────────────────────────────────
  useEffect(() => {
    if (window.__globalEqFilters && window.__globalAudioContext) {
      window.__globalEqFilters.forEach((filter, i) => {
        filter.gain.setTargetAtTime(
          eqBands[i] || 0,
          window.__globalAudioContext!.currentTime,
          0.1
        );
      });
    }
  }, [eqBands]);

  // ─── Sync Web Audio Master Volume ─────────────────────────
  useEffect(() => {
    if (window.__globalMasterGain && window.__globalAudioContext) {
      const targetVolume = isMuted ? 0 : volume;
      window.__globalMasterGain.gain.setTargetAtTime(
        targetVolume,
        window.__globalAudioContext.currentTime,
        0.05
      );
    }
  }, [volume, isMuted]);

  // ─── Set audio ref on mount ────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, [setAudioRef]);

  // ─── Handle deferred playback ──────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && pendingTrackUrl) {
      audio.src = pendingTrackUrl;
      audio.volume = isMuted ? 0 : volume;
      audio.play().catch(console.error);
      clearPendingTrack();
    }
  }, [pendingTrackUrl, isMuted, volume, clearPendingTrack]);

  // ─── Audio event handlers ─────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isDragging) setProgress(audio.currentTime);
    };
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      next();
    };
    const onError = () => console.error("Audio error:", audio.error);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [setProgress, setDuration, next, isDragging]);

  // ─── Keyboard shortcuts ────────────────────────────────────
  const handleKeyboard = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(Math.min(progress + 10, duration));
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(Math.max(progress - 10, 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyN":
          next();
          break;
        case "KeyP":
          previous();
          break;
        case "KeyL":
          setActiveTab("lyrics");
          if (!isExpanded) toggleExpanded();
          break;
        case "Escape":
          if (isExpanded) toggleExpanded();
          break;
      }
    },
    [
      togglePlay,
      seek,
      progress,
      duration,
      setVolume,
      volume,
      toggleMute,
      next,
      previous,
      isExpanded,
      toggleExpanded,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleKeyboard]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack || !currentAlbum)
      return;

    const coverPath = currentAlbum?.id === "b-sides"
      ? `/api/bsides/artwork?file=${encodeURIComponent(currentTrack?.fileName || '')}`
      : currentAlbum?.id === "minidiscs"
      ? currentTrack?.coverPath || ''
      : currentAlbum?.coverPath || '';

    try {
      const absoluteCoverPath = new URL(coverPath, window.location.origin).href;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: "Radiohead",
        album: currentAlbum.title,
        artwork: [
          {
            src: absoluteCoverPath,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    } catch (error) {
      console.warn("Failed to set MediaSession metadata:", error);
    }

    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("previoustrack", () => previous());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
  }, [currentTrack, currentAlbum, togglePlay, previous, next]);

  // ─── Progress bar drag support ─────────────────────────────
  const handleProgressSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent, ref: React.RefObject<HTMLDivElement | null>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(fraction * duration);
    },
    [duration, seek]
  );

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
      setIsDragging(true);
      handleProgressSeek(e, ref);

      const onMouseMove = (ev: MouseEvent) => handleProgressSeek(ev as unknown as React.MouseEvent<HTMLDivElement>, ref);
      const onMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [handleProgressSeek]
  );

  // ─── Audio element always renders ──────────────────────────
  const audioElement = <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />;

  if (!currentTrack || !currentAlbum) return audioElement;

  const activeCoverPath = currentAlbum?.id === "b-sides"
    ? `/api/bsides/artwork?file=${encodeURIComponent(currentTrack?.fileName || '')}`
    : currentAlbum?.id === "minidiscs"
    ? currentTrack?.coverPath || ''
    : currentAlbum?.coverPath || '';

  // B-sides and minidiscs artwork comes from a dynamic API route — must bypass Next.js image optimizer
  const isUnoptimized = currentAlbum?.id === "b-sides" || currentAlbum?.id === "minidiscs";

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const tabs = [
    { id: "equalizer" as const, icon: SlidersHorizontal, label: "Equalizer" },
    { id: "lyrics" as const, icon: Mic2, label: "Lyrics" },
    { id: "queue" as const, icon: ListMusic, label: "Queue" },
  ];

  const renderAlbumArt = () => (
    <motion.div
      layoutId="album-art-container"
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-[min(72vw,340px)] lg:w-[min(38vw,440px)] aspect-square"
    >
      <motion.div
        animate={{
          opacity: isPlaying ? [0.25, 0.35, 0.25] : 0.15,
          scale: isPlaying ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-12 rounded-[40px] blur-[60px]"
        style={{ background: `radial-gradient(circle, rgba(${currentAlbum.accentColorRGB}, 0.5), transparent 70%)`, willChange: "transform, opacity" }}
      />
      <motion.div
        className="relative w-full h-full rounded-2xl overflow-hidden"
        animate={{ scale: isPlaying ? 1 : 0.92 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          boxShadow: `0 25px 60px -12px rgba(0,0,0,0.6), 0 8px 30px -8px rgba(${currentAlbum.accentColorRGB}, 0.25)`
        }}
      >
        <Image src={activeCoverPath} alt={currentAlbum.title} fill className="object-cover" priority unoptimized={isUnoptimized} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/20" />
      </motion.div>
    </motion.div>
  );

  const renderTrackInfo = (isMinimal: boolean) => (
    <motion.div
      layoutId="track-info"
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-5 lg:mb-7 flex flex-col ${isMinimal ? "items-center" : ""}`}
    >
      <h2 className={`text-2xl lg:text-4xl font-bold text-white tracking-[-0.02em] ${isMinimal ? "text-center" : ""}`}>
        {currentTrack.title}
      </h2>
      <p className={`text-sm text-white/35 mt-1.5 tracking-wide ${isMinimal ? "text-center" : ""}`}>
        Radiohead · {currentAlbum.title} · {currentAlbum.year}
      </p>
    </motion.div>
  );

  const renderTabSwitcher = () => {
    // Mini Discs and instrumental tracks like "Treefingers" shouldn't show a lyrics tab
    const isMiniDisc = currentAlbum?.id === "minidiscs";
    const isInstrumental = currentTrack?.title === "Treefingers" || currentTrack?.title === "Hunting Bears" || currentTrack?.title === "Feral";
    const availableTabs = (isMiniDisc || isInstrumental)
      ? tabs.filter((tab) => tab.id !== "lyrics")
      : tabs;

    return (
      <motion.div
        layoutId="tab-switcher"
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex gap-0.5 mb-5 p-1 bg-white/[0.03] rounded-2xl w-fit border border-white/[0.04]"
      >
        {availableTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
          className="relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors duration-300"
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-xl bg-white/[0.08]"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            />
          )}
          <span className={`relative z-10 flex items-center gap-1.5 transition-colors duration-300 ${activeTab === tab.id ? "text-white" : "text-white/30 hover:text-white/55"}`}>
            <tab.icon size={13} strokeWidth={1.5} />
            <span className="hidden sm:inline">{tab.label}</span>
          </span>
        </button>
        ))}
      </motion.div>
    );
  };

  const renderTabContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, display: "none", transition: { duration: 0 } }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/[0.03]"
    >
      <AnimatePresence mode="wait">
        {activeTab === "lyrics" && (
          <motion.div key="lyrics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="w-full h-full">
            {lyricsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                  <p className="text-white/20 text-xs uppercase tracking-widest font-mono">Fetching lyrics...</p>
                </div>
              </div>
            ) : (
              <LyricsPanel key={currentTrack.id} lyrics={currentTrack.lyrics || fetchedLyrics || undefined} accentColorRGB={currentAlbum.accentColorRGB} isPlaying={isPlaying} progress={progress} duration={duration} isStaticMode={currentAlbum.id === "b-sides"} />
            )}
          </motion.div>
        )}
        {activeTab === "equalizer" && (
          <motion.div key="equalizer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="w-full h-full">
            <EqualizerPanel />
          </motion.div>
        )}
        {activeTab === "queue" && (
          <motion.div key="queue" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="w-full h-full overflow-y-auto scrollbar-hide p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 font-medium mb-4">Queue</p>
            <div className="space-y-0.5">
              {queue.map((item, i) => (
                <button key={`${item.track.number}-${i}`} onClick={() => playTrack(item.album, item.track)} className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group ${i === queueIndex ? "bg-white/[0.07]" : "hover:bg-white/[0.03]"}`}>
                  {i === queueIndex && isPlaying ? (
                    <div className="flex items-center gap-[2px] w-5 justify-center">
                      {[1, 2, 3].map((bar) => (
                        <motion.div key={bar} animate={{ height: [3, 14, 3] }} transition={{ duration: 0.6, repeat: Infinity, delay: bar * 0.12, ease: "easeInOut" }} className="w-[2px] rounded-full" style={{ background: `rgba(${currentAlbum.accentColorRGB}, 0.8)` }} />
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[11px] font-mono w-5 text-center transition-colors duration-300 ${i === queueIndex ? "text-white/60" : "text-white/20 group-hover:text-white/40"}`}>{item.track.number}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate transition-colors duration-300 ${i === queueIndex ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>{item.track.title}</p>
                  </div>
                  <span className={`text-[11px] font-mono transition-colors duration-300 ${i === queueIndex ? "text-white/30" : "text-white/15 group-hover:text-white/30"}`}>{item.track.duration}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );


  return (
    <>
      {audioElement}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FULL SCREEN PLAYER                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            className="fixed inset-0 z-[60] flex flex-col"
          >
            {/* ── Background Atmosphere ── */}
            {/* Layer 1: Pure black base */}
            <div className="absolute inset-0 bg-black" />

            {/* Layer 2: Blurred album art ambient */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 scale-150">
                <Image
                  src={activeCoverPath}
                  alt=""
                  width={600}
                  height={600}
                  className="w-full h-full object-cover blur-[80px] opacity-[0.25] saturate-150"
                  priority
                  unoptimized={isUnoptimized}
                />
              </div>
            </div>

            {/* Layer 3: Accent color atmosphere */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 25% 0%, rgba(${currentAlbum.accentColorRGB}, 0.12) 0%, transparent 70%),
                  radial-gradient(ellipse 60% 40% at 75% 100%, rgba(${currentAlbum.accentColorRGB}, 0.06) 0%, transparent 60%),
                  radial-gradient(circle at 50% 50%, rgba(0,0,0,0.4) 0%, transparent 100%)
                `,
              }}
            />

            {/* Layer 4: Subtle vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
              }}
            />

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col h-full">
              {/* ── Top Bar ── */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex items-center justify-between px-6 lg:px-10 pt-5 pb-3"
              >
                <button
                  onClick={toggleExpanded}
                  className="p-2.5 -ml-2 text-white/30 hover:text-white/80 transition-all duration-300 rounded-full hover:bg-white/[0.06] active:scale-90"
                >
                  <ChevronDown size={22} strokeWidth={1.5} />
                </button>
                <div className="text-center">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/25 font-medium">
                    Playing from
                  </p>
                  <p className="text-[11px] text-white/45 font-medium mt-0.5 tracking-wide">
                    {currentAlbum.title}
                  </p>
                </div>
                <div className="w-10" />
              </motion.div>

              {/* ── Main Content Area ── */}
              <div className="flex-1 relative min-h-0 w-full">
                <AnimatePresence>
                  {activeTab ? (
                    <motion.div
                      key="expanded-layout"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.4 }}
                      style={{ willChange: "opacity" }}
                      className="absolute inset-0 flex flex-col lg:flex-row gap-0 px-6 lg:px-10"
                    >
                      {/* Left: Album Art */}
                      <div className="flex items-center justify-center lg:w-[45%] py-4 lg:py-0">
                        {renderAlbumArt()}
                      </div>
                      
                      {/* Right: Info + Tabs */}
                      <div className="flex flex-col lg:w-[55%] lg:pl-10 min-h-0">
                        {renderTrackInfo(false)}
                        {renderTabSwitcher()}
                        {renderTabContent()}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="minimal-layout"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.4 }}
                      style={{ willChange: "opacity" }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 lg:px-10 mt-6"
                    >
                      {renderAlbumArt()}
                      
                      <div className="flex flex-col items-center text-center">
                        {renderTrackInfo(true)}
                        {renderTabSwitcher()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Bottom Controls ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="px-6 lg:px-10 pb-7 pt-5"
              >
                {/* Progress Bar */}
                <div className="mb-5">
                  <div
                    ref={progressRef}
                    className="group relative w-full h-8 flex items-end cursor-pointer overflow-hidden transition-opacity duration-300 opacity-60 hover:opacity-100"
                    onMouseDown={(e) => handleProgressMouseDown(e, progressRef)}
                  >
                    <AudioVisualizer
                      variant="progress"
                      progress={progress}
                      duration={duration}
                      accentColorRGB={currentAlbum.accentColorRGB}
                      className="w-full h-full pointer-events-none"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white/60 tabular-nums">
                        {formatTime(progress)}
                      </span>
                      {isPlaying && (
                        <div className="w-4 h-3">
                          <AudioVisualizer variant="mini" barCount={4} accentColorRGB={currentAlbum.accentColorRGB} />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-white/25 font-mono tabular-nums">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-between">
                  {/* Left spacer */}
                  <div className="flex items-center gap-3 w-28" />

                  {/* Center: Playback */}
                  <div className="flex items-center gap-7">
                    <button
                      onClick={previous}
                      className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110 active:scale-90"
                    >
                      <SkipBack size={20} fill="currentColor" strokeWidth={0} />
                    </button>

                    {/* Play/Pause Button */}
                    <motion.button
                      onClick={togglePlay}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.92 }}
                      className="w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, rgba(${currentAlbum.accentColorRGB}, 0.7), rgba(255,255,255,0.95))`,
                        boxShadow: `
                          0 4px 20px rgba(${currentAlbum.accentColorRGB}, 0.25),
                          0 0 0 1px rgba(255,255,255,0.1) inset
                        `,
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {isPlaying ? (
                          <motion.div
                            key="pause"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Pause size={22} className="text-black" fill="black" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="play"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Play size={22} className="text-black ml-0.5" fill="black" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <button
                      onClick={next}
                      className="text-white/40 hover:text-white transition-all duration-300 hover:scale-110 active:scale-90"
                    >
                      <SkipForward size={20} fill="currentColor" strokeWidth={0} />
                    </button>
                  </div>

                  {/* Right: Repeat + Volume */}
                  <div className="flex items-center gap-3 w-28 justify-end">
                    <button
                      onClick={toggleRepeat}
                      className={`p-1.5 rounded-full transition-all duration-300 relative ${
                        repeatMode !== "off"
                          ? "text-white/80"
                          : "text-white/20 hover:text-white/45"
                      }`}
                      style={repeatMode !== "off" ? { color: `rgba(${currentAlbum.accentColorRGB}, 0.9)` } : {}}
                    >
                      {repeatMode === "one" ? (
                        <Repeat1 size={15} strokeWidth={1.5} />
                      ) : (
                        <Repeat size={15} strokeWidth={1.5} />
                      )}
                      {repeatMode !== "off" && (
                        <span 
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: `rgba(${currentAlbum.accentColorRGB}, 0.9)` }}
                        />
                      )}
                    </button>
                    <div className="hidden lg:flex items-center gap-2.5">
                      <button
                        onClick={toggleMute}
                        className="text-white/25 hover:text-white/55 transition-colors duration-300"
                      >
                        <VolumeIcon size={15} strokeWidth={1.5} />
                      </button>
                      <div className="relative w-20 h-4 flex items-center group cursor-pointer">
                        <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-[width] duration-100"
                            style={{
                              width: `${(isMuted ? 0 : volume) * 100}%`,
                              background: "rgba(255,255,255,0.35)",
                            }}
                          />
                        </div>
                        <div
                          className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-sm pointer-events-none"
                          style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 5px)` }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* QUEUE SIDE PANEL (non-expanded)                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isQueueOpen && !isExpanded && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-80 z-[55] overflow-y-auto scrollbar-hide"
            style={{
              background: "rgba(8, 8, 8, 0.92)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              borderLeft: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-7">
                <h3 className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-semibold">
                  Up Next
                </h3>
                <button
                  onClick={toggleQueue}
                  className="p-2 text-white/25 hover:text-white/60 transition-all duration-300 rounded-full hover:bg-white/[0.04] active:scale-90"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="space-y-0.5">
                {queue.map((item, i) => (
                  <button
                    key={`${item.track.number}-${i}`}
                    onClick={() => playTrack(item.album, item.track)}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
                      i === queueIndex
                        ? "bg-white/[0.06]"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {i === queueIndex && isPlaying ? (
                      <div className="flex items-center gap-[2px] w-5 justify-center">
                        {[1, 2, 3].map((bar) => (
                          <motion.div
                            key={bar}
                            animate={{ height: [3, 14, 3] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: bar * 0.12,
                              ease: "easeInOut",
                            }}
                            className="w-[2px] rounded-full"
                            style={{ background: `rgba(${currentAlbum.accentColorRGB}, 0.8)` }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className={`text-[11px] font-mono w-5 text-center transition-colors duration-300 ${
                        i === queueIndex ? "text-white/50" : "text-white/15 group-hover:text-white/35"
                      }`}>
                        {item.track.number}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate transition-colors duration-300 ${
                        i === queueIndex ? "text-white" : "text-white/35 group-hover:text-white/65"
                      }`}>
                        {item.track.title}
                      </p>
                      <p className={`text-[11px] truncate transition-colors duration-300 ${
                        i === queueIndex ? "text-white/30" : "text-white/15 group-hover:text-white/30"
                      }`}>
                        {item.album.title}
                      </p>
                    </div>
                    <span className={`text-[11px] font-mono transition-colors duration-300 ${
                      i === queueIndex ? "text-white/25" : "text-white/10 group-hover:text-white/25"
                    }`}>
                      {item.track.duration}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MINI PLAYER BAR                                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      {!isExpanded && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "rgba(8, 8, 8, 0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="w-full px-4 lg:px-6 h-[80px] flex items-center justify-between">
            {/* Left: Track Info */}
            <div className="flex items-center gap-3 w-[30%] min-w-[160px]">
              <button
                onClick={toggleExpanded}
                className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group"
              >
                <Image
                  src={activeCoverPath}
                  alt={currentAlbum.title}
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
                  unoptimized={isUnoptimized}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronUp size={20} className="text-white" strokeWidth={1.5} />
                </div>
              </button>
              <div className="min-w-0 text-left flex flex-col justify-center">
                <button 
                  onClick={toggleExpanded}
                  className="text-sm font-semibold text-white/90 hover:text-white truncate text-left transition-colors duration-300"
                >
                  {currentTrack.title}
                </button>
                <Link 
                  href={currentAlbum.id === "b-sides" ? "/b-sides" : `/albums/${currentAlbum.id}`}
                  className="text-[11px] text-white/35 hover:text-white/60 truncate mt-0.5 transition-colors duration-300"
                >
                  Radiohead
                </Link>
              </div>
            </div>

            {/* Center: Controls & Progress */}
            <div className="flex-1 max-w-[680px] flex flex-col justify-center items-center px-4">
              {/* Playback Buttons */}
              <div className="flex items-center gap-5 mb-1.5">
                <button
                  onClick={previous}
                  className="text-white/50 hover:text-white transition-all duration-300 active:scale-90"
                >
                  <SkipBack size={17} fill="currentColor" strokeWidth={0} />
                </button>
                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause size={14} className="text-black" fill="black" />
                  ) : (
                    <Play size={14} className="text-black ml-0.5" fill="black" />
                  )}
                </motion.button>
                <button
                  onClick={next}
                  className="text-white/50 hover:text-white transition-all duration-300 active:scale-90"
                >
                  <SkipForward size={17} fill="currentColor" strokeWidth={0} />
                </button>
                <button
                  onClick={toggleRepeat}
                  className={`transition-all duration-300 relative ${
                    repeatMode !== "off" ? "text-white/70" : "text-white/25 hover:text-white/50"
                  }`}
                  style={repeatMode !== "off" ? { color: `rgba(${currentAlbum.accentColorRGB}, 0.8)` } : {}}
                >
                  {repeatMode === "one" ? (
                    <Repeat1 size={14} strokeWidth={1.5} />
                  ) : (
                    <Repeat size={14} strokeWidth={1.5} />
                  )}
                  {repeatMode !== "off" && (
                    <span 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: `rgba(${currentAlbum.accentColorRGB}, 0.8)` }}
                    />
                  )}
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-2.5 w-full">
                <span className="text-[10px] text-white/30 font-mono w-9 text-right tabular-nums">
                  {formatTime(progress)}
                </span>
                <div
                  ref={miniProgressRef}
                  className="relative flex-1 group cursor-pointer h-4 flex items-center"
                  onMouseDown={(e) => handleProgressMouseDown(e, miniProgressRef)}
                >
                  <div className="w-full h-[3px] group-hover:h-[4px] bg-white/[0.08] rounded-full transition-all duration-300">
                    <div
                      className="h-full rounded-full transition-[width] duration-75"
                      style={{
                        width: `${progressPercent}%`,
                        background: `linear-gradient(90deg, rgba(${currentAlbum.accentColorRGB}, 0.5), rgba(255,255,255,0.7))`,
                      }}
                    />
                  </div>
                  <div 
                    className="absolute w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                    style={{ left: `calc(${progressPercent}% - 5px)`, top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
                <span className="text-[10px] text-white/30 font-mono w-9 tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Right: Extra Controls */}
            <div className="flex items-center justify-end gap-2 w-[30%] min-w-[160px]">
              {currentAlbum?.id !== "minidiscs" && (
                <button
                  onClick={() => {
                    setActiveTab("lyrics");
                    toggleExpanded();
                  }}
                  className="p-2 text-white/25 hover:text-white/60 transition-all duration-300 rounded-full hover:bg-white/[0.04]"
                  title="Lyrics"
                >
                  <Mic2 size={15} strokeWidth={1.5} />
                </button>
              )}
              <button
                onClick={toggleQueue}
                className={`p-2 transition-all duration-300 rounded-full hover:bg-white/[0.04] ${
                  isQueueOpen ? "" : "text-white/25 hover:text-white/60"
                }`}
                style={isQueueOpen ? { color: `rgba(${currentAlbum.accentColorRGB}, 0.8)` } : {}}
                title="Queue"
              >
                <ListMusic size={15} strokeWidth={1.5} />
              </button>
              <div className="hidden lg:flex items-center gap-2 group">
                <button
                  onClick={toggleMute}
                  className="text-white/25 hover:text-white/55 transition-colors duration-300"
                >
                  <VolumeIcon size={15} strokeWidth={1.5} />
                </button>
                <div className="relative w-20 h-4 flex items-center cursor-pointer">
                  <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-100"
                      style={{
                        width: `${(isMuted ? 0 : volume) * 100}%`,
                        background: "rgba(255,255,255,0.3)",
                      }}
                    />
                  </div>
                  <div 
                    className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-sm pointer-events-none"
                    style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 5px)`, top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
