"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { albums } from "@/data/albums";
import { usePlayerStore } from "@/store/player-store";

export default function AlbumGridPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const playAlbum = usePlayerStore((s) => s.playAlbum);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.15, 0.4], [0, 1, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.15], [60, 0]);

  return (
    <section ref={sectionRef} className="relative py-32 md:py-40 bg-black">
      {/* Section title */}
      <motion.div
        style={{ opacity: titleOpacity, y: titleY }}
        className="px-8 md:px-12 mb-16"
      >
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/15 font-medium mb-3">
          Discography
        </p>
        <div className="flex items-end justify-between">
          <h2 className="font-sans font-black text-4xl md:text-6xl tracking-[-0.03em] text-white">
            All Albums
          </h2>
          <Link
            href="/albums"
            className="nav-link text-[11px] tracking-[0.2em] uppercase font-medium text-white/30 hover:text-white/60 transition-colors pb-2 hidden md:block"
          >
            View All →
          </Link>
        </div>
        <div className="mt-6 h-[1px] bg-white/5" />
      </motion.div>

      {/* Horizontal scroll strip */}
      <div className="horizontal-scroll px-8 md:px-12 scrollbar-hide">
        {albums.map((album, i) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.6,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="group w-[280px] md:w-[320px]"
          >
            <Link href={`/albums/${album.id}`} className="block outline-none">
              <div className="relative aspect-square overflow-hidden mb-5">
                <Image
                  src={album.coverPath}
                  alt={album.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="320px"
                />
                {/* Color tint on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to top, rgba(${album.accentColorRGB}, 0.3), transparent 60%)`,
                  }}
                />
                {/* Play on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      playAlbum(album);
                    }}
                    className="w-14 h-14 rounded-full border border-white/40 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all duration-300"
                  >
                    <svg
                      width="16"
                      height="18"
                      viewBox="0 0 16 18"
                      fill="white"
                      className="ml-1"
                    >
                      <polygon points="0,0 16,9 0,18" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <h3 className="font-sans font-semibold text-sm text-white/80 group-hover:text-white transition-colors truncate pr-4">
                  {album.title}
                </h3>
                <span className="text-[11px] text-white/20 font-mono flex-shrink-0">
                  {album.year}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Mobile view all link */}
      <div className="mt-12 px-8 md:hidden">
        <Link
          href="/albums"
          className="nav-link text-[11px] tracking-[0.2em] uppercase font-medium text-white/30"
        >
          View All Albums →
        </Link>
      </div>
    </section>
  );
}
