"use client";

import { albums } from "@/data/albums";
import AlbumCard from "@/components/albums/AlbumCard";
import { motion } from "framer-motion";

export default function AlbumsPage() {
  return (
    <div className="min-h-screen has-player bg-black">
      {/* Header */}
      <div className="pt-32 md:pt-40 pb-16 px-8 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/15 font-medium mb-4">
              Complete Discography
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
              className="font-sans font-black text-6xl md:text-8xl lg:text-[10rem] tracking-[-0.04em] text-white leading-[0.85]"
            >
              Albums
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-8 text-sm text-white/25 max-w-lg leading-relaxed"
          >
            Nine studio albums. Twenty-three years of evolution — from
            guitar-driven debut to orchestral masterpiece.
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 h-[1px] bg-white/5 origin-left"
          />
        </div>
      </div>

      {/* Album Grid */}
      <div className="px-8 md:px-12 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {albums.map((album, i) => (
              <AlbumCard key={album.id} album={album} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
