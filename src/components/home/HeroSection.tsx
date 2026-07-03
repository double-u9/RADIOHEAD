"use client";

import { motion } from "framer-motion";

const letters = "RADIOHEAD".split("");

const letterVariants = {
  hidden: { opacity: 0, y: 80 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.06,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

      {/* Center content */}
      <div className="relative z-10 text-center px-6">
        {/* Subtitle above */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.5 }}
          className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-white/30 font-medium mb-8"
        >
          A Complete Discography
        </motion.p>

        {/* RADIOHEAD — letter by letter */}
        <div className="overflow-hidden">
          <h1 className="font-sans font-black text-[15vw] md:text-[12vw] lg:text-[10vw] leading-[0.85] tracking-[-0.04em] text-white flex justify-center">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={letterVariants}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-[13px] text-white/25 tracking-wide"
        >
          Nine albums · 1993 — 2016
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-3"
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/20">
          Scroll
        </span>
        <div className="scroll-indicator">
          <div className="w-[1px] h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
