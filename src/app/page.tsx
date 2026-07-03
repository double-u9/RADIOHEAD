"use client";

import HeroSection from "@/components/home/HeroSection";
import BandHistory from "@/components/home/BandHistory";
import BandMembersShowcase from "@/components/home/BandMembersShowcase";
import AlbumGridPreview from "@/components/home/AlbumGridPreview";
import Timeline from "@/components/home/Timeline";
import EnterOverlay from "@/components/layout/EnterOverlay";

export default function HomePage() {
  return (
    <div className="relative has-player">
      <EnterOverlay />
      <HeroSection />
      <BandHistory />
      <BandMembersShowcase />
      <AlbumGridPreview />
      <Timeline />

      {/* Footer */}
      <footer className="py-20 px-8 md:px-12 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-[0.2em] text-white/15 uppercase">
            A fan-made discography experience. All music by Radiohead.
          </p>
          <p className="text-[10px] tracking-[0.2em] text-white/15 uppercase font-mono">
            Oxford, England · 1985 — Present
          </p>
        </div>
      </footer>
    </div>
  );
}
