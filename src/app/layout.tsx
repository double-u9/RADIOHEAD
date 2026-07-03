import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import GrainOverlay from "@/components/layout/GrainOverlay";
import FloatingPlayer from "@/components/player/FloatingPlayer";
import CustomCursor from "@/components/layout/CustomCursor";

export const metadata: Metadata = {
  title: "Radiohead — A Complete Discography Experience",
  description:
    "Explore the complete Radiohead discography. Stream all 9 studio albums, discover track stories, and immerse yourself in the world of Radiohead.",
  keywords: [
    "Radiohead",
    "discography",
    "OK Computer",
    "Kid A",
    "In Rainbows",
    "music",
    "streaming",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-text-primary font-sans antialiased">
        <CustomCursor />
        <GrainOverlay />
        <Header />
        <main>{children}</main>
        <FloatingPlayer />
      </body>
    </html>
  );
}
