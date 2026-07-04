"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/player-store";

interface AudioVisualizerProps {
  variant?: "bars" | "wave" | "mini" | "progress";
  barCount?: number;
  accentColorRGB?: string;
  className?: string;
  progress?: number;
  duration?: number;
}

export default function AudioVisualizer({
  variant = "bars",
  barCount = 48,
  accentColorRGB = "255, 255, 255",
  className = "",
  progress = 0,
  duration = 0,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  
  // Data for rendering
  const smoothedData = useRef<Float32Array | null>(null);
  const peakData = useRef<Float32Array | null>(null);
  const peakDecay = useRef<Float32Array | null>(null);

  const { isPlaying } = usePlayerStore();
  const progressRef = useRef(progress);
  const durationRef = useRef(duration);

  useEffect(() => {
    progressRef.current = progress;
    durationRef.current = duration;
  }, [progress, duration]);

  // The analyser is picked up directly in the draw loop to avoid race conditions.

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const actualPoints = variant === "progress" ? 2 : (variant === "mini" ? 4 : barCount);

    if (!smoothedData.current || smoothedData.current.length !== actualPoints) {
      smoothedData.current = new Float32Array(actualPoints);
      peakData.current = new Float32Array(actualPoints);
      peakDecay.current = new Float32Array(actualPoints);
    }

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const p = progressRef.current;
      const d = durationRef.current;
      const progressPercent = d > 0 ? p / d : 0;
      const safePercent = Math.max(0, Math.min(1, progressPercent));

      if (!analyserRef.current && window.__globalAnalyser) {
        analyserRef.current = window.__globalAnalyser;
      }
      
      const analyser = analyserRef.current;
      const isStatic = !analyser || !isPlaying;

      if (variant === "progress") {
        // --- PERFECTLY STRAIGHT PROGRESS LINE ---
        const centerY = height / 2;
        
        const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
        lineGradient.addColorStop(0, `rgba(${accentColorRGB}, 1)`);
        lineGradient.addColorStop(safePercent, `rgba(255, 255, 255, 0.95)`);
        lineGradient.addColorStop(safePercent, `rgba(255, 255, 255, 0.2)`);
        lineGradient.addColorStop(1, `rgba(255, 255, 255, 0.2)`);

        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();

        // The Playhead Thumb (Dot)
        const playheadX = safePercent * width;
        ctx.beginPath();
        ctx.arc(playheadX, centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = `rgba(${accentColorRGB}, 0.9)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      if (variant === "mini") {
        // --- CLASSIC APPLE MUSIC 4-BAR EQ ---
        const gap = 2;
        const barWidth = Math.max(1, (width - gap * (actualPoints - 1)) / actualPoints);
        const cornerRadius = barWidth / 2;
        
        let dataArray: Uint8Array | null = null;
        let bufferLength = 0;

        if (!isStatic && analyser) {
          bufferLength = analyser.frequencyBinCount;
          dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray as any);
        }
        
        for (let i = 0; i < actualPoints; i++) {
          let targetH = 2; // min height
          if (!isStatic && dataArray) {
             const t = i / (actualPoints - 1);
             const binIndex = Math.floor(Math.pow(t, 1.3) * bufferLength * 0.4); 
             const value = dataArray[binIndex] || 0;
             targetH = Math.max(2, (value / 255) * height);
          } else {
             // Subtle idle breathing
             const time = Date.now() / 1000;
             targetH = 2 + (Math.sin(time * 2 + i) * 0.5 + 0.5) * (height * 0.4);
          }
          
          const currentH = smoothedData.current![i];
          const lerp = targetH > currentH ? 0.3 : 0.1;
          smoothedData.current![i] = currentH + (targetH - currentH) * lerp;
          
          const h = smoothedData.current![i];
          const x = i * (barWidth + gap);
          const y = height - h;
          
          ctx.fillStyle = `rgba(${accentColorRGB}, 1)`;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, h, cornerRadius);
          ctx.fill();
        }
        
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // --- OTHER VARIANTS ---
      const bufferLength = analyser ? analyser.frequencyBinCount : 1024;

      if (variant === "bars") {
        if (isStatic) {
          // Bar breathing state
          const gap = 4;
          const barWidth = Math.max(1, (width - gap * (actualPoints - 1)) / actualPoints);
          const cornerRadius = Math.min(barWidth / 2, 2);
          const time = Date.now() / 1000;
          
          for (let i = 0; i < actualPoints; i++) {
            const breathe = Math.sin(time * 0.8 + i * 0.3) * 0.5 + 0.5;
            const targetH = height * 0.03 + breathe * height * 0.04;
  
            smoothedData.current![i] += (targetH - smoothedData.current![i]) * 0.05;
            const barH = Math.max(2, smoothedData.current![i]);
  
            const x = i * (barWidth + gap);
            const y = height - barH;
  
            ctx.fillStyle = `rgba(${accentColorRGB}, 0.08)`;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barH, cornerRadius);
            ctx.fill();
          }
          animationRef.current = requestAnimationFrame(draw);
          return;
        }

        const gap = 4;
        const barWidth = Math.max(1, (width - gap * (actualPoints - 1)) / actualPoints);
        const cornerRadius = Math.min(barWidth / 2, 2);
        const dataArray = new Uint8Array(bufferLength);
        analyser!.getByteFrequencyData(dataArray);

        for (let i = 0; i < actualPoints; i++) {
          const t = i / actualPoints;
          const binIndex = Math.floor(Math.pow(t, 1.3) * bufferLength * 0.85);
          const value = dataArray[binIndex] || 0;
          const normalizedValue = value / 255;
          const targetH = normalizedValue * height * 0.88 + 2;

          const lerpUp = 0.3;
          const lerpDown = 0.08;
          const currentH = smoothedData.current![i];
          const lerp = targetH > currentH ? lerpUp : lerpDown;
          smoothedData.current![i] += (targetH - currentH) * lerp;
          const barH = Math.max(2, smoothedData.current![i]);

          if (barH > peakData.current![i]) {
            peakData.current![i] = barH;
            peakDecay.current![i] = 0;
          } else {
            peakDecay.current![i] += 0.003;
            peakData.current![i] -= peakDecay.current![i];
            if (peakData.current![i] < barH) peakData.current![i] = barH;
          }

          const x = i * (barWidth + gap);
          const y = height - barH;

          const gradient = ctx.createLinearGradient(x, height, x, y);
          gradient.addColorStop(0, `rgba(${accentColorRGB}, ${0.15 + normalizedValue * 0.35})`);
          gradient.addColorStop(0.4, `rgba(${accentColorRGB}, ${0.25 + normalizedValue * 0.45})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, ${0.1 + normalizedValue * 0.7})`);
          ctx.fillStyle = gradient;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, cornerRadius);
          ctx.fill();

          if (peakData.current![i] > barH + 4) {
            const peakY = height - peakData.current![i] - 3;
            const peakAlpha = Math.max(0, Math.min(0.6, (peakData.current![i] - barH) / 20));
            ctx.fillStyle = `rgba(255, 255, 255, ${peakAlpha})`;
            ctx.beginPath();
            ctx.arc(x + barWidth / 2, peakY, barWidth / 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (variant === "wave") {
        if (isStatic) return;
        const timeArray = new Uint8Array(bufferLength);
        analyser!.getByteTimeDomainData(timeArray as any);
        const sliceWidth = width / bufferLength;

        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.12)`;
        ctx.beginPath();
        for (let i = 0; i < bufferLength; i++) {
          const v = timeArray[i] / 128.0;
          const y = (v * height) / 2 + 3;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * sliceWidth, y);
        }
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${accentColorRGB}, 0.5)`;
        ctx.beginPath();
        for (let i = 0; i < bufferLength; i++) {
          const v = timeArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(0, y);
          else {
            const prevX = (i - 1) * sliceWidth;
            const prevV = timeArray[i - 1] / 128.0;
            const prevY = (prevV * height) / 2;
            const cpX = (prevX + i * sliceWidth) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
          }
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, variant, barCount, accentColorRGB]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      }
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}
