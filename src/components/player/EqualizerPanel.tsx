"use client";

import { usePlayerStore } from "@/store/player-store";
import { motion } from "framer-motion";

const FREQUENCIES = ["32", "64", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

const PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "Bass Boost": [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  Electronic: [5, 4, 1, -1, -2, 0, 2, 3, 4, 5],
  Acoustic: [2, 2, 1, 0, -1, -1, 1, 2, 2, 1],
  "Vocal Boost": [-1, -2, -1, 1, 3, 4, 3, 1, 0, -1],
  Rock: [4, 3, 2, -1, -2, -1, 1, 2, 3, 4],
};

export default function EqualizerPanel() {
  const { eqBands, setEqBand, setEqPreset, currentAlbum } = usePlayerStore();
  const accentRGB = currentAlbum?.accentColorRGB || "255, 255, 255";

  // Find active preset
  const activePreset = Object.entries(PRESETS).find(([, bands]) =>
    bands.every((b, i) => Math.abs(b - eqBands[i]) < 0.2)
  )?.[0];

  return (
    <div className="flex flex-col h-full text-white overflow-hidden p-5 md:p-8 lg:p-10">
      {/* Header + Presets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Equalizer</h3>
          <p className="text-[11px] text-white/25 mt-0.5 tracking-wide">Adjust frequency response</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
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
        </div>
      </div>

      {/* EQ Bands */}
      <div className="flex-1 flex items-stretch justify-between gap-1 md:gap-3 relative min-h-[200px]">
        {/* dB reference lines */}
        <div className="absolute inset-x-0 top-0 bottom-10 flex flex-col justify-between pointer-events-none">
          {[12, 6, 0, -6, -12].map((db) => (
            <div key={db} className="flex items-center gap-2 w-full">
              <span className="text-[9px] font-mono text-white/15 w-6 text-right flex-shrink-0">
                {db > 0 ? `+${db}` : db}
              </span>
              <div
                className={`flex-1 border-b ${
                  db === 0 ? "border-white/10" : "border-white/[0.03]"
                } ${db === 0 ? "border-solid" : "border-dashed"}`}
              />
            </div>
          ))}
        </div>

        {/* Band sliders */}
        {eqBands.map((gain, index) => (
          <div key={index} className="flex flex-col items-center flex-1 z-10 group">
            {/* Slider track */}
            <div className="relative flex-1 w-full flex justify-center items-center mb-2">
              {/* Visual track */}
              <div className="absolute top-0 bottom-0 w-[5px] md:w-[6px] bg-white/[0.04] rounded-full overflow-hidden">
                {/* Active fill from center */}
                {gain > 0 ? (
                  <motion.div
                    className="absolute bottom-1/2 w-full rounded-full origin-bottom"
                    animate={{ height: `${(gain / 12) * 50}%` }}
                    transition={{ duration: 0.15 }}
                    style={{ background: `rgba(${accentRGB}, 0.4)` }}
                  />
                ) : gain < 0 ? (
                  <motion.div
                    className="absolute top-1/2 w-full rounded-full origin-top"
                    animate={{ height: `${(Math.abs(gain) / 12) * 50}%` }}
                    transition={{ duration: 0.15 }}
                    style={{ background: `rgba(${accentRGB}, 0.25)` }}
                  />
                ) : null}
              </div>

              {/* Invisible range input */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={gain}
                  onChange={(e) => setEqBand(index, parseFloat(e.target.value))}
                  className="w-[180px] md:w-[220px] opacity-0 cursor-pointer z-20"
                  style={{ transform: "rotate(-90deg)" }}
                />
              </div>

              {/* Thumb */}
              <motion.div
                className="absolute w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-white pointer-events-none z-10 transition-transform duration-200 group-hover:scale-125"
                animate={{
                  top: `calc(${50 - (gain / 12) * 50}% - 8px)`,
                }}
                transition={{ duration: 0.15 }}
                style={{
                  boxShadow: `0 0 8px rgba(255,255,255,0.3), 0 0 16px rgba(${accentRGB}, 0.15)`,
                }}
              />
            </div>

            {/* Frequency label */}
            <div className="text-[9px] md:text-[10px] font-mono text-white/25 group-hover:text-white/50 transition-colors duration-300">
              {FREQUENCIES[index]}
            </div>
            {/* Gain readout */}
            <div
              className="text-[9px] font-mono font-semibold mt-0.5 transition-colors duration-300"
              style={{
                color: Math.abs(gain) < 0.5
                  ? "rgba(255,255,255,0.15)"
                  : `rgba(${accentRGB}, 0.7)`,
              }}
            >
              {gain > 0 ? "+" : ""}
              {gain.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
