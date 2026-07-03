"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnterOverlay() {
  const [entered, setEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("hasEnteredSite")) {
      setTimeout(() => setEntered(true), 0);
      // We do not auto-play here because browsers will block it without a fresh click.
      // The user can click the toggle button if they refresh.
    }
  }, []);

  const handleEnter = () => {
    setEntered(true);
    sessionStorage.setItem("hasEnteredSite", "true");

    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.log("Audio play failed", e));
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/ambient.mp3"
        loop
      />

      <AnimatePresence>
        {!entered && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black cursor-pointer"
            onClick={handleEnter}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 2 }}
              className="text-white/50 uppercase font-mono text-[10px] md:text-xs tracking-[0.3em] mb-4"
            >
              Click anywhere to begin
            </motion.p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 1, type: "spring" }}
              className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {entered && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="fixed bottom-8 left-8 z-[60] text-[9px] uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors flex items-center gap-2"
            onClick={toggleAudio}
          >
            <div className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-red-600 animate-pulse' : 'bg-white/30'}`} />
            {isPlaying ? 'Mute' : 'Play'}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
