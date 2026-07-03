"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Header({ 
  onMenuClick 
}: { 
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 mix-blend-difference"
    >
      <div className="flex items-center justify-between px-8 md:px-12 py-6">
        {/* Logo — just text */}
        <Link
          href="/"
          className="nav-link text-[11px] tracking-[0.3em] uppercase text-white font-medium"
        >
          Radiohead
        </Link>

        {/* Navigation — minimal text links */}
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className={`nav-link text-[11px] tracking-[0.2em] uppercase font-medium transition-opacity duration-300 ${pathname === "/"
              ? "text-white active"
              : "text-white/50 hover:text-white"
              }`}
          >
            Home
          </Link>
          <Link
            href="/albums"
            className={`nav-link text-[11px] tracking-[0.2em] uppercase font-medium transition-opacity duration-300 ${pathname.startsWith("/albums")
              ? "text-white active"
              : "text-white/50 hover:text-white"
              }`}
          >
            Albums
          </Link>
          <Link
            href="/b-sides"
            className={`nav-link text-[11px] tracking-[0.2em] uppercase font-medium transition-opacity duration-300 ${pathname.startsWith("/b-sides")
              ? "text-white active"
              : "text-white/50 hover:text-white"
              }`}
          >
            B-Sides
          </Link>
          <Link
            href="/minidiscs"
            className={`nav-link text-[11px] tracking-[0.2em] uppercase font-medium transition-opacity duration-300 ${pathname.startsWith("/minidiscs")
              ? "text-white active"
              : "text-white/50 hover:text-white"
              }`}
          >
            Mini Discs
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
