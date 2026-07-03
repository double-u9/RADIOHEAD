"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Album } from "@/types";
import { usePlayerStore } from "@/store/player-store";

interface AlbumCardProps {
  album: Album;
  index: number;
}

export default function AlbumCard({ album, index }: AlbumCardProps) {
  const playAlbum = usePlayerStore((s) => s.playAlbum);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
    >
      <Link href={`/albums/${album.id}`} className="block outline-none">
        <div className="relative aspect-square overflow-hidden mb-5">
          <Image
            src={album.coverPath}
            alt={album.title}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Subtle accent gradient on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(to top, rgba(${album.accentColorRGB}, 0.25), transparent 60%)`,
            }}
          />

          {/* Outline play button on hover */}
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

        {/* Info */}
        <div className="flex justify-between items-baseline">
          <div className="min-w-0 flex-1 pr-4">
            <h3 className="font-sans font-semibold text-base text-white/80 group-hover:text-white transition-colors truncate">
              {album.title}
            </h3>
            <p className="text-[11px] text-white/20 mt-1.5 tracking-wide">
              {album.trackCount} tracks · {album.label}
            </p>
          </div>
          <span className="text-xl font-sans font-black text-white/10 group-hover:text-white/20 transition-colors flex-shrink-0">
            {album.year}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
