"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const historyText = [
  "1985. Abingdon School, Oxfordshire.",
  "Five teenagers form a band called 'On a Friday'.",
  "1991. They sign to EMI and change their name.",
  "RADIOHEAD.",
  "From the explosive angst of 'Creep'...",
  "...to the dystopian dread of 'OK Computer'...",
  "...and the electronic reinvention of 'Kid A'.",
  "A relentless pursuit of the avant-garde."
];

function TextReveal({ children, progress, range }: { children: React.ReactNode, progress: MotionValue<number>, range: [number, number] }) {
  // Fade in, hold, fade out
  const opacity = useTransform(
    progress,
    [
      range[0], 
      range[0] + (range[1] - range[0]) * 0.2, 
      range[0] + (range[1] - range[0]) * 0.8, 
      range[1]
    ],
    [0, 1, 1, 0]
  );
  
  const y = useTransform(
    progress,
    [
      range[0], 
      range[0] + (range[1] - range[0]) * 0.2, 
      range[0] + (range[1] - range[0]) * 0.8, 
      range[1]
    ],
    [40, 0, 0, -40]
  );

  return (
    <motion.p
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center text-center font-sans font-black text-3xl md:text-5xl lg:text-7xl tracking-[-0.04em] text-white px-8"
    >
      {children}
    </motion.p>
  );
}

export default function BandHistory() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="h-[500vh] bg-black relative">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {historyText.map((text, i) => {
          const start = i / historyText.length;
          const end = (i + 1) / historyText.length;
          return (
            <TextReveal key={i} progress={scrollYProgress} range={[start, end]}>
              {text}
            </TextReveal>
          );
        })}
      </div>
    </section>
  );
}
