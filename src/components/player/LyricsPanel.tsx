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
  const targetTranslateY = useRef(0);

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
      
      parsed.sort((a, b) => a.time - b.time);

      // Distribute duplicate timestamps for clumped lines
      for (let i = 0; i < parsed.length; i++) {
        let j = i;
        while (j < parsed.length && parsed[j].time === parsed[i].time) {
          j++;
        }
        const count = j - i;
        if (count > 1 && parsed[i].time !== -1) {
          let nextTime = parsed[i].time + 2; 
          for (let k = j; k < parsed.length; k++) {
            if (parsed[k].time > parsed[i].time) {
              nextTime = parsed[k].time;
              break;
            }
          }
          
          const duration = nextTime - parsed[i].time;
          const step = duration / count;
          
          for (let k = 0; k < count; k++) {
            parsed[i + k].time = parsed[i].time + (k * step);
          }
        }
        i = j - 1;
      }

      return { parsedLines: parsed, hasLRC: true };
    } else {
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

    const targetIndex = currentActiveIndex === -1 ? 0 : currentActiveIndex;
    const activeLine = lineRefs.current[targetIndex];

    if (!container || !activeLine || !linesContainer) return;

    const containerHeight = container.clientHeight;
    const pinPosition = containerHeight * 0.35;

    const lineTop = activeLine.offsetTop;
    const lineHeight = activeLine.offsetHeight;
    const lineCenterY = lineTop + lineHeight / 2;

    targetTranslateY.current = pinPosition - lineCenterY;
    
    // Natively apply the transform to trigger the unified CSS transition
    linesContainer.style.transform = `translateY(${targetTranslateY.current}px)`;
  }, [currentActiveIndex, isStaticMode]);

  useEffect(() => {
    updateTargetPosition();
  }, [currentActiveIndex, updateTargetPosition]);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    targetTranslateY.current = 0;
    setTimeout(() => setIsReady(false), 0);

    const timer = setTimeout(() => {
      // Temporarily disable transition for the initial snap
      if (linesContainerRef.current) {
        linesContainerRef.current.style.transition = 'none';
      }
      
      updateTargetPosition();
      
      // Re-enable transition after the snap
      if (linesContainerRef.current) {
        // Force reflow
        linesContainerRef.current.getBoundingClientRect();
        linesContainerRef.current.style.transition = '';
      }
      setIsReady(true);
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedLines]);

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
        color: "#ffffff",
        textShadow: "none",
      };
    }

    if (currentActiveIndex === -1) {
      const distFromTop = index;
      const normalizedDist = Math.min(distFromTop, 8) / 8;
      return {
        opacity: Math.max(0.04, 0.15 * (1 - normalizedDist)),
        scale: 0.9,
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
        color: "#ffffff",
        // A much more refined, subtle ambient shadow instead of heavy glowing
        textShadow: `0 4px 30px rgba(0,0,0,0.5)`,
      };
    }

    // Smooth cinematic opacity-stepping depth of field
    // Completely replaces expensive CSS blur filters
    const maxDistance = 8;
    const normalizedDist = Math.min(distance, maxDistance) / maxDistance;

    let opacity: number;
    let scale: number;

    if (distance === 1) {
      opacity = isPast ? 0.35 : 0.5;
      scale = 0.98;
    } else if (distance === 2) {
      opacity = isPast ? 0.15 : 0.25;
      scale = 0.95;
    } else if (distance === 3) {
      opacity = isPast ? 0.08 : 0.12;
      scale = 0.92;
    } else {
      opacity = Math.max(0.02, 0.1 * (1 - normalizedDist));
      scale = 0.9;
    }

    return {
      opacity,
      scale,
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
        // Unified GPU Transition Physics for scrolling
        className={isStaticMode ? "" : "will-change-transform transition-transform duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]"}
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
            <div key={i} className="flex justify-center md:justify-start w-full">
              <p
                ref={(el) => { lineRefs.current[i] = el; }}
                // Refined premium typography with identical GPU transition physics
                className="font-sans font-bold text-2xl md:text-4xl lg:text-[2.75rem] tracking-tight leading-[1.3] md:leading-[1.25] py-3 md:py-4 px-4 md:px-12 cursor-default transition-[opacity,transform,text-shadow] duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] text-center md:text-left origin-center md:origin-left will-change-[transform,opacity]"
                style={{
                  opacity: style.opacity,
                  color: style.color,
                  textShadow: style.textShadow,
                  transform: `scale(${style.scale})`,
                }}
              >
                {line.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
