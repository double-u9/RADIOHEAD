"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { albums } from "@/data/albums";
import Image from "next/image";
import Link from "next/link";

export default function Timeline() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineWidth = useTransform(scrollYProgress, [0.1, 0.6], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] flex flex-col justify-center py-20 bg-black overflow-hidden"
    >
      <motion.div style={{ opacity }} className="w-full max-w-7xl mx-auto px-8 md:px-12">
        {/* Section title */}
        <div className="mb-20">
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/15 font-medium mb-3">
            Chronology
          </p>
          <div className="flex items-baseline gap-6 md:gap-12">
            <span className="font-sans font-black text-4xl md:text-6xl tracking-[-0.03em] text-white">
              1993
            </span>
            <div className="flex-1 relative h-[1px]">
              <div className="absolute inset-0 bg-white/5" />
              <motion.div
                style={{ width: lineWidth }}
                className="absolute inset-0 bg-white/30 origin-left"
              />
            </div>
            <span className="font-sans font-black text-4xl md:text-6xl tracking-[-0.03em] text-white">
              2016
            </span>
          </div>
        </div>

        {/* Album timeline items */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 md:gap-6">
          {albums.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                delay: i * 0.05,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link href={`/albums/${album.id}`} className="group block">
                <div className="relative aspect-square overflow-hidden mb-3">
                  <Image
                    src={album.coverPath}
                    alt={album.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    sizes="150px"
                  />
                </div>
                <p className="text-[10px] text-white/20 font-mono group-hover:text-white/50 transition-colors">
                  {album.year}
                </p>
                <p className="text-[11px] text-white/40 font-medium group-hover:text-white transition-colors truncate mt-0.5">
                  {album.title}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
