"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";

interface LyricsPanelProps {
  lyrics: string | undefined;
  accentColorRGB: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  isStaticMode?: boolean;
}

interface ParsedLine {
  time: number;
  text: string;
}

export default function LyricsPanel({
  lyrics,
  accentColorRGB,
  isPlaying,
  progress,
  duration,
  isStaticMode = false,
}: LyricsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const currentTranslateY = useRef(0);
  const targetTranslateY = useRef(0);
  const rafId = useRef<number>(0);

  // Parse lyrics once and memoize
  const { parsedLines, hasLRC } = useMemo(() => {
    if (!lyrics) return { parsedLines: [] as ParsedLine[], hasLRC: false };

    const rawLines = lyrics.split("\n");
    const lrcDetected = rawLines.some((l) =>
      /^\[\d{2}:\d{2}\.\d{2,3}\]/.test(l)
    );

    if (lrcDetected) {
      const parsed: ParsedLine[] = [];
      
      rawLines.forEach((line) => {
        const timestampRegex = /\[\d{2}:\d{2}(?:[\.:]\d{2,3})?\]/g;
        const timestamps = line.match(timestampRegex);
        
        if (timestamps) {
          const text = line.replace(timestampRegex, '').trim();
          timestamps.forEach((ts) => {
            const timeMatch = ts.match(/\[(\d{2}):(\d{2})(?:[\.:](\d{2,3}))?\]/);
            if (timeMatch) {
              const minutes = parseInt(timeMatch[1], 10);
              const seconds = parseInt(timeMatch[2], 10);
              const fractionStr = timeMatch[3] || '0';
              const fraction = parseInt(fractionStr, 10) / (fractionStr.length === 3 ? 1000 : 100);
              const time = minutes * 60 + seconds + fraction;
              parsed.push({ time, text });
            }
          });
        } else {
          if (line.trim() !== "") {
            parsed.push({ time: -1, text: line.trim() });
          }
        }
      });
      
      // Sort parsed lines by time
      parsed.sort((a, b) => a.time - b.time);

      // POST-PROCESS: Distribute duplicate timestamps for clumped lines
      for (let i = 0; i < parsed.length; i++) {
        let j = i;
        while (j < parsed.length && parsed[j].time === parsed[i].time) {
          j++;
        }
        const count = j - i;
        if (count > 1 && parsed[i].time !== -1) {
          // Find the next unique timestamp
          let nextTime = parsed[i].time + 2; // Default 2 second gap if at the end
          for (let k = j; k < parsed.length; k++) {
            if (parsed[k].time > parsed[i].time) {
              nextTime = parsed[k].time;
              break;
            }
          }
          
          // Divide the duration equally among the duplicate lines
          const duration = nextTime - parsed[i].time;
          const step = duration / count;
          
          for (let k = 0; k < count; k++) {
            parsed[i + k].time = parsed[i].time + (k * step);
          }
        }
        i = j - 1; // Advance the outer loop
      }

      return { parsedLines: parsed, hasLRC: true };
    } else {
      // Plain text: assign evenly spaced times
      const nonEmpty = rawLines.filter((l) => l.trim() !== "");
      const interval = duration > 0 ? duration / nonEmpty.length : 4;
      const parsed = nonEmpty.map((text, i) => ({
        time: i * interval,
        text,
      }));
      return { parsedLines: parsed, hasLRC: false };
    }
  }, [lyrics, duration]);

  // Determine active line index
  const TIME_OFFSET = 0.3;
  let currentActiveIndex = -1;
  for (let i = 0; i < parsedLines.length; i++) {
    if (
      parsedLines[i].time !== -1 &&
      progress + TIME_OFFSET >= parsedLines[i].time
    ) {
      currentActiveIndex = i;
    } else if (parsedLines[i].time !== -1) {
      break;
    }
  }

  // Calculate target translateY whenever active line changes
  const updateTargetPosition = useCallback(() => {
    if (isStaticMode) return;

    const container = containerRef.current;
    const linesContainer = linesContainerRef.current;

    // Use index 0 as target if no active line yet (e.g. during intro)
    const targetIndex = currentActiveIndex === -1 ? 0 : currentActiveIndex;
    const activeLine = lineRefs.current[targetIndex];

    if (!container || !activeLine || !linesContainer) return;

    const containerHeight = container.clientHeight;
    // Pin active line at 35% from top (Spotify-style: slightly above center)
    const pinPosition = containerHeight * 0.35;

    // Get the active line's position within the lines container
    const lineTop = activeLine.offsetTop;
    const lineHeight = activeLine.offsetHeight;
    const lineCenterY = lineTop + lineHeight / 2;

    // We want lineCenterY + translateY = pinPosition
    targetTranslateY.current = pinPosition - lineCenterY;
  }, [currentActiveIndex]);

  // Update target whenever active index changes
  useEffect(() => {
    updateTargetPosition();
  }, [currentActiveIndex, updateTargetPosition]);

  const [isReady, setIsReady] = useState(false);

  // Also recalculate after first render when DOM is ready
  useEffect(() => {
    // Reset explicitly so state doesn't leak from previous song
    currentTranslateY.current = 0;
    targetTranslateY.current = 0;
    // Delay slightly to prevent sync cascading renders
    setTimeout(() => setIsReady(false), 0);

    // Small delay to ensure DOM measurements are accurate
    const timer = setTimeout(() => {
      updateTargetPosition();
      // Snap immediately on first render (no animation)
      currentTranslateY.current = targetTranslateY.current;
      if (linesContainerRef.current) {
        linesContainerRef.current.style.transform = `translateY(${currentTranslateY.current}px)`;
      }
      setIsReady(true);
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedLines]);

  // Smooth animation loop using requestAnimationFrame with lerp
  useEffect(() => {
    if (isStaticMode) return;

    const animate = () => {
      const diff = targetTranslateY.current - currentTranslateY.current;

      // Lerp factor: 0.08 gives a smooth, cinematic glide
      // Higher = snappier, Lower = smoother/slower
      const lerp = 0.08;

      if (Math.abs(diff) > 0.5) {
        currentTranslateY.current += diff * lerp;
      } else {
        currentTranslateY.current = targetTranslateY.current;
      }

      if (linesContainerRef.current) {
        linesContainerRef.current.style.transform = `translateY(${currentTranslateY.current}px)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  if (!lyrics) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/20 text-sm uppercase tracking-widest font-mono">
          No lyrics available
        </p>
      </div>
    );
  }

  // Calculate visual properties for each line based on distance from active
  const getLineStyle = (index: number) => {
    if (isStaticMode) {
      return {
        opacity: 0.8,
        scale: 1,
        filter: "none",
        color: "#ffffff",
        textShadow: "none",
      };
    }

    // Before vocals start, everything is dimmed and waiting
    if (currentActiveIndex === -1) {
      const distFromTop = index;
      const normalizedDist = Math.min(distFromTop, 8) / 8;
      return {
        opacity: Math.max(0.04, 0.15 * (1 - normalizedDist)),
        scale: 1,
        filter: `blur(${Math.min(3, distFromTop * 0.5 + 1)}px)`,
        color: "#ffffff",
        textShadow: "none",
      };
    }

    const distance = Math.abs(index - currentActiveIndex);
    const isActive = index === currentActiveIndex;
    const isPast = index < currentActiveIndex;

    if (isActive) {
      return {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        color: "#ffffff",
        textShadow: `0 0 40px rgba(${accentColorRGB}, 0.6), 0 0 100px rgba(${accentColorRGB}, 0.2)`,
      };
    }

    // Gradual fade based on distance from active line
    // Closer lines are more visible, farther ones fade more
    const maxDistance = 8;
    const normalizedDist = Math.min(distance, maxDistance) / maxDistance;

    let opacity: number;
    let blur: number;

    if (distance === 1) {
      opacity = isPast ? 0.45 : 0.35;
      blur = 0;
    } else if (distance === 2) {
      opacity = isPast ? 0.3 : 0.2;
      blur = 0.5;
    } else if (distance === 3) {
      opacity = isPast ? 0.2 : 0.12;
      blur = 1;
    } else {
      opacity = Math.max(0.04, 0.15 * (1 - normalizedDist));
      blur = Math.min(3, distance * 0.5);
    }

    return {
      opacity,
      scale: 1,
      filter: `blur(${blur}px)`,
      color: "#ffffff",
      textShadow: "none",
    };
  };

  return (
    <div
      ref={containerRef}
      className={`h-full relative transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'} ${
        isStaticMode ? 'overflow-y-auto no-scrollbar pb-32 pt-8' : 'overflow-hidden'
      }`}
      style={isStaticMode ? {} : {
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 20%, black 60%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 20%, black 60%, transparent 100%)",
      }}
    >
      <div
        ref={linesContainerRef}
        className={isStaticMode ? "" : "will-change-transform"}
        style={isStaticMode ? {} : {}}
      >
        {parsedLines.map((line, i) => {
          const isEmpty = line.text.trim() === "";
          const style = getLineStyle(i);

          if (isEmpty) {
            return (
              <div
                key={i}
                ref={(el) => { lineRefs.current[i] = el as unknown as HTMLParagraphElement; }}
                className="h-6 md:h-10"
              />
            );
          }

          return (
            <p
              key={i}
              ref={(el) => { lineRefs.current[i] = el; }}
              className="font-sans font-black text-xl md:text-3xl lg:text-4xl tracking-[-0.02em] leading-[1.3] py-2 md:py-3 px-4 md:px-12 cursor-default transition-all duration-700 ease-out"
              style={{
                opacity: style.opacity,
                filter: style.filter,
                color: style.color,
                textShadow: style.textShadow,
                transform: `scale(${style.scale})`,
                transformOrigin: "left center",
              }}
            >
              {line.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
