"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface CD {
  name: string;
  folderName: string;
  trackCount: number;
}

export default function ToweringPage() {
  const [cds, setCds] = useState<CD[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/towering")
      .then((res) => res.json())
      .then((data) => {
        setCds(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

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
              Compilation Archive
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
              className="font-sans font-black text-5xl md:text-7xl lg:text-[7.5rem] tracking-[-0.04em] text-white leading-[0.85]"
            >
              Towering Above <br className="hidden md:block" /> the Rest
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-8 text-sm text-white/25 max-w-lg leading-relaxed"
          >
            The massive 24-disc fan-compiled archive featuring B-sides, live sessions, demos, covers, and rarities from every era of the band.
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 h-[1px] bg-white/5 origin-left"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="px-8 md:px-12 pb-32">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="aspect-square skeleton rounded-xl opacity-30" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8">
              {cds.map((cd, i) => (
                <motion.div
                  key={cd.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.6,
                    delay: (i % 6) * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group"
                >
                  <Link href={`/towering/${encodeURIComponent(cd.folderName)}`} className="block outline-none">
                    <div className="relative aspect-square overflow-hidden mb-4 rounded-xl">
                      <Image
                        src={`/api/towering/artwork?cd=${encodeURIComponent(cd.folderName)}&v=2`}
                        alt={cd.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        unoptimized
                      />

                      {/* Subtle accent gradient on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(to top, rgba(30, 41, 59, 0.4), transparent 70%)`,
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <h3 className="font-sans font-semibold text-sm text-white/80 group-hover:text-white transition-colors truncate">
                        {cd.name.split(" ").slice(0, 2).join(" ")}
                      </h3>
                      <p className="text-[10px] text-white/30 mt-1 truncate">
                        {cd.name.split(" ").slice(2).join(" ") || "Collection"}
                      </p>
                      <p className="text-[10px] text-white/15 mt-0.5 tracking-wide">
                        {cd.trackCount} tracks
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
