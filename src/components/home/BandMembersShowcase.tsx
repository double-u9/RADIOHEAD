"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Rock_Salt } from "next/font/google";

const rockSalt = Rock_Salt({ weight: "400", subsets: ["latin"] });

const members = [
  {
    id: "thom-yorke",
    name: "Thom Yorke",
    role: "Lead Vocalist, Keyboards, Guitars",
    birthDate: "October 7, 1968",
    bio: "The emotional and thematic core of Radiohead, Yorke's ethereal falsetto and cryptic lyricism define the band's signature sound. His constant push towards electronic experimentation continues to shape modern music.",
    signature: "Ethereal Falsetto & Electronics",
    image: "/shadow/Thom Yorke.png",
  },
  {
    id: "jonny-greenwood",
    name: "Jonny Greenwood",
    role: "Lead Guitar, Keyboards, Orchestral",
    birthDate: "November 5, 1971",
    bio: "A multi-instrumental virtuoso and classically trained composer. Greenwood's aggressive guitar playing in the 90s paved the way for his breathtaking orchestral arrangements in their later work.",
    signature: "Aggressive Guitar & Orchestration",
    image: "/shadow/Jonny Greenwood.png",
  },
  {
    id: "ed-obrien",
    name: "Ed O'Brien",
    role: "Guitars, Backing Vocals, Effects",
    birthDate: "April 15, 1968",
    bio: "The architect of Radiohead's ambient textures. O'Brien uses his guitar not just as an instrument, but as a textural tool to create vast, atmospheric soundscapes and immersive effects.",
    signature: "Ambient Textures & Atmospheric Effects",
    image: "/shadow/Ed O'Brien.png",
  },
  {
    id: "colin-greenwood",
    name: "Colin Greenwood",
    role: "Bass Guitar",
    birthDate: "June 26, 1969",
    bio: "The rhythmic anchor of Radiohead. His melodic, deep-pocket basslines provide the soulful foundation upon which the band builds its most complex sonic architectures.",
    signature: "Melodic & Deep-pocket Basslines",
    image: "/shadow/Colin Greenwood.png",
  },
  {
    id: "philip-selway",
    name: "Philip Selway",
    role: "Drums, Percussion",
    birthDate: "May 23, 1967",
    bio: "Blending human precision with mechanical complexities, Selway's drumming bridges the gap between organic rock and electronic IDM, serving as the heartbeat of the band's evolving rhythm.",
    signature: "Precise & IDM-influenced Rhythms",
    image: "/shadow/Philip Selway.png",
  },
];

function MemberCard({ member, index, progress }: { member: typeof members[0], index: number, progress: MotionValue<number> }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isRightImage = true;

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.8, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);

  // Dim the current card as the next one scrolls over it
  // Started later and fades out smoother so it's less fast
  const fadeOutProgress = useTransform(
    progress,
    [(index + 0.3) / members.length, (index + 0.9) / members.length],
    [0, 0.9]
  );

  return (
    <div className="h-[150vh] w-full">
      <div className="sticky top-0 h-screen w-full flex items-end overflow-hidden bg-black">
        <motion.div
          ref={cardRef}
          style={{ scale, opacity, y }}
          className={`relative z-10 w-full h-full flex flex-col justify-end px-6 md:px-16 lg:px-24 pb-20 md:pb-32`}
        >
          {/* Full Screen Image Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src={member.image}
              alt={member.name}
              fill
              className={`object-contain transition-all duration-[3s] ease-out hover:scale-105 filter grayscale-[20%] hover:grayscale-0 opacity-80 ${
                isRightImage ? "object-right md:object-[80%_center]" : "object-left md:object-[20%_center]"
              }`}
              sizes="100vw"
              priority={index < 2}
            />
            {/* Gradient overlays for text readability and blending image borders */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 opacity-90" />
            <div className={`absolute inset-0 bg-gradient-to-${isRightImage ? 'r' : 'l'} from-black via-black/60 to-transparent z-10 opacity-90`} />
          </div>

          {/* Text Container */}
          <div className={`relative z-20 w-full max-w-4xl ${isRightImage ? 'self-start' : 'self-end'}`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col ${isRightImage ? 'items-start text-left' : 'items-end text-right'}`}
            >
              <div className={`flex items-center gap-4 mb-4 md:mb-6 ${isRightImage ? '' : 'flex-row-reverse'}`}>
                <span className="h-[1px] w-8 md:w-12 bg-white/50" />
                <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/70 font-mono drop-shadow-md">
                  {member.birthDate}
                </p>
              </div>

              <h2 className={`${rockSalt.className} text-[#FF0000] text-4xl md:text-6xl lg:text-[6rem] leading-tight mb-4 md:mb-6 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]`}>
                {member.name}
              </h2>

              <p className="text-sm md:text-lg text-white/70 font-medium tracking-[0.2em] uppercase mb-6 md:mb-10 drop-shadow-md">
                {member.role}
              </p>

              <p className="text-base md:text-xl lg:text-2xl text-white/90 leading-relaxed font-light max-w-3xl mb-8 md:mb-12 drop-shadow-md">
                {member.bio}
              </p>

              <div className={`inline-flex flex-col gap-2 md:gap-3 ${isRightImage ? 'items-start' : 'items-end'}`}>
                <span className="text-[9px] md:text-[10px] tracking-[0.2em] text-white/50 uppercase font-mono">
                  Signature Contribution
                </span>
                <span className={`text-sm md:text-base tracking-wide text-white py-1 italic drop-shadow-md border-white/40 ${isRightImage ? 'border-l pl-4' : 'border-r pr-4'}`}>
                  {member.signature}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Dim overlay for next card overlapping */}
        {index !== members.length - 1 && (
          <motion.div
            className="absolute inset-0 bg-black z-30 pointer-events-none"
            style={{ opacity: fadeOutProgress }}
          />
        )}
      </div>
    </div>
  );
}

export default function BandMembersShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the entire stack container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative bg-black">
      {members.map((member, index) => (
        <MemberCard key={member.id} member={member} index={index} progress={scrollYProgress} />
      ))}
    </section>
  );
}
