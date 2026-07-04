"use client";

import { usePlayerStore } from "@/store/player-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FREQUENCIES = ["32", "64", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

const PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "Bass Boost": [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  Electronic: [5, 4, 1, -1, -2, 0, 2, 3, 4, 5],
  Acoustic: [2, 2, 1, 0, -1, -1, 1, 2, 2, 1],
  "Vocal Boost": [-1, -2, -1, 1, 3, 4, 3, 1, 0, -1],
  Rock: [4, 3, 2, -1, -2, -1, 1, 2, 3, 4],
};

function getSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  let path = `M 0 100 L 0 ${points[0].y} L ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[0] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i === points.length - 2 ? points[i + 1] : points[i + 2];

    const t = 0.2;
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  path += ` L 100 ${points[points.length - 1].y} L 100 100 Z`;
  return path;
}

function SpectrumAnalyzer({ accentRGB }: { accentRGB: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      
      const analyser = window.__globalAnalyser;
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / (bufferLength * 0.75); // Focus on lower 75% of spectrum
      let x = 0;

      for (let i = 0; i < bufferLength * 0.75; i++) {
        const value = dataArray[i];
        const barHeight = (value / 255) * height;

        if (barHeight > 0) {
          ctx.fillStyle = `rgba(${accentRGB}, ${0.1 + (value / 255) * 0.35})`;
          // Draw bar with slight top rounding
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 1, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }

        x += barWidth;
      }
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [accentRGB]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-x-0 bottom-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none z-0" 
      width={400} 
      height={200}
    />
  );
}

export default function EqualizerPanel() {
  const { eqBands, setEqBand, setEqPreset, currentAlbum } = usePlayerStore();
  const accentRGB = currentAlbum?.accentColorRGB || "255, 255, 255";

  const activePreset = Object.entries(PRESETS).find(([, bands]) =>
    bands.every((b, i) => Math.abs(b - eqBands[i]) < 0.2)
  )?.[0];

  const points = eqBands.map((gain, i) => ({
    x: (i + 0.5) * 10,
    y: 50 - (gain / 12) * 50,
  }));
  const curvePath = getSmoothPath(points);
  const strokePath = curvePath.replace(/L 100 \d+ L 100 100 Z$/, "").replace(/^M 0 100 L 0 \d+ L/, "M");

  return (
    <div className="flex flex-col h-full text-white overflow-hidden p-5 md:p-8 lg:p-10 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8 relative z-20">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Equalizer</h3>
          <p className="text-[11px] text-white/25 mt-0.5 tracking-wide">Adjust frequency response</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(PRESETS).map(([name, bands]) => (
            <button
              key={name}
              onClick={() => setEqPreset(bands)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-all duration-300 ${
                activePreset === name
                  ? "text-white"
                  : "text-white/30 hover:text-white/55 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
              style={
                activePreset === name
                  ? {
                      background: `rgba(${accentRGB}, 0.15)`,
                      color: `rgba(${accentRGB}, 0.9)`,
                      border: `1px solid rgba(${accentRGB}, 0.2)`,
                    }
                  : { border: "1px solid rgba(255,255,255,0.04)" }
              }
            >
              {name}
            </button>
          ))}
          <button
            onClick={() => setEqPreset(PRESETS.Flat)}
            className="px-3 py-1.5 text-[11px] font-medium rounded-full text-white/40 hover:text-white/70 hover:bg-white/[0.06] border border-white/10 transition-colors ml-2"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-stretch justify-between gap-1 md:gap-3 relative min-h-[200px]">
        {/* Live Spectrum Analyzer Canvas */}
        <SpectrumAnalyzer accentRGB={accentRGB} />

        {/* SVG Curve overlaying the canvas */}
        <div className="absolute inset-x-0 top-0 bottom-10 pointer-events-none z-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="eqGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`rgba(${accentRGB}, 0.2)`} />
                <stop offset="100%" stopColor={`rgba(${accentRGB}, 0.0)`} />
              </linearGradient>
            </defs>
            <motion.path
              d={curvePath}
              fill="url(#eqGradient)"
              initial={false}
              animate={{ d: curvePath }}
              transition={{ duration: 0 }}
            />
            <motion.path
              d={strokePath}
              fill="none"
              stroke={`rgba(${accentRGB}, 0.7)`}
              strokeWidth="0.5"
              initial={false}
              animate={{ d: strokePath }}
              transition={{ duration: 0 }}
            />
          </svg>
        </div>

        {/* dB reference lines */}
        <div className="absolute inset-x-0 top-0 bottom-10 flex flex-col justify-between pointer-events-none z-0">
          {[12, 6, 0, -6, -12].map((db) => (
            <div key={db} className="flex items-center gap-2 w-full">
              <span className="text-[9px] font-mono text-white/15 w-6 text-right flex-shrink-0">
                {db > 0 ? `+${db}` : db}
              </span>
              <div
                className={`flex-1 border-b ${
                  db === 0 ? "border-white/20" : "border-white/[0.04]"
                } ${db === 0 ? "border-solid" : "border-dashed"}`}
              />
            </div>
          ))}
        </div>

        {/* Band sliders */}
        {eqBands.map((gain, index) => (
          <BandSlider
            key={index}
            index={index}
            gain={gain}
            accentRGB={accentRGB}
            setEqBand={setEqBand}
          />
        ))}
      </div>
    </div>
  );
}

function BandSlider({
  index,
  gain,
  accentRGB,
  setEqBand,
}: {
  index: number;
  gain: number;
  accentRGB: string;
  setEqBand: (i: number, val: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateGain = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = Math.max(rect.top, Math.min(clientY, rect.bottom));
    const percent = (y - rect.top) / rect.height;
    let newGain = 12 - percent * 24;

    // Magnetic snap to 0
    if (Math.abs(newGain) < 0.4) {
      newGain = 0;
    }

    setEqBand(index, parseFloat(newGain.toFixed(1)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateGain(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateGain(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    const el = e.currentTarget;
    el.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col items-center flex-1 z-10 group relative">
      <div
        className="relative flex-1 w-full flex justify-center items-center mb-2 cursor-pointer touch-none"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={() => setEqBand(index, 0)}
      >
        <div className="absolute inset-y-0 w-6 flex justify-center group-hover:bg-white/[0.02] rounded-full transition-colors">
          <div className="absolute top-0 bottom-0 w-[5px] md:w-[6px] bg-white/[0.06] rounded-full overflow-hidden">
            {gain > 0 ? (
              <motion.div
                className="absolute bottom-1/2 w-full rounded-full origin-bottom"
                animate={{ height: `${(gain / 12) * 50}%` }}
                transition={isDragging ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.15 }}
                style={{ background: `rgba(${accentRGB}, 0.6)` }}
              />
            ) : gain < 0 ? (
              <motion.div
                className="absolute top-1/2 w-full rounded-full origin-top"
                animate={{ height: `${(Math.abs(gain) / 12) * 50}%` }}
                transition={isDragging ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.15 }}
                style={{ background: `rgba(${accentRGB}, 0.3)` }}
              />
            ) : null}
          </div>
        </div>

        <motion.div
          className={`absolute w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-white pointer-events-none z-10 transition-transform duration-200 ${
            isDragging ? "scale-150" : "group-hover:scale-125"
          }`}
          animate={{
            top: `calc(${50 - (gain / 12) * 50}% - 8px)`,
          }}
          transition={isDragging ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.15 }}
          style={{
            boxShadow: isDragging
              ? `0 0 12px rgba(255,255,255,0.6), 0 0 24px rgba(${accentRGB}, 0.4)`
              : `0 0 8px rgba(255,255,255,0.3), 0 0 16px rgba(${accentRGB}, 0.15)`,
          }}
        />

        {/* Floating Tooltip */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, x: -5, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -5, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute left-1/2 ml-3 md:ml-4 whitespace-nowrap bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-mono font-bold border border-white/10 z-50 pointer-events-none"
              style={{
                top: `calc(${50 - (gain / 12) * 50}% - 12px)`,
                color: `rgba(${accentRGB}, 0.9)`,
                boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
              }}
            >
              {gain > 0 ? "+" : ""}{gain.toFixed(1)} dB
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-[9px] md:text-[10px] font-mono text-white/25 group-hover:text-white/50 transition-colors duration-300">
        {FREQUENCIES[index]}
      </div>
      <div
        className="text-[9px] font-mono font-semibold mt-0.5 transition-colors duration-300"
        style={{
          color:
            Math.abs(gain) < 0.5
              ? "rgba(255,255,255,0.15)"
              : `rgba(${accentRGB}, 0.7)`,
        }}
      >
        {gain > 0 ? "+" : ""}
        {gain.toFixed(1)}
      </div>
    </div>
  );
}
