"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const currentScale = useRef(0.2);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      return;
    }

    document.body.classList.add("custom-cursor");

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("[data-cursor-hover]")
      ) {
        setIsHovering(true);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("[data-cursor-hover]")
      ) {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });

    // Animation loop with lerp for smooth following
    let raf: number;
    // Lower lerp for position (smooth but responsive, fixing 'too quick' jumpiness)
    const posLerp = 0.25;
    // Slower lerp for scale (smooth hover expansion)
    const scaleLerp = 0.2;

    const animate = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * posLerp;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * posLerp;
      
      // Base scale 0.2 of 40px = 8px. Hover scale 1 of 40px = 40px.
      const targetScale = isHovering ? 1 : 0.2;
      currentScale.current += (targetScale - currentScale.current) * scaleLerp;

      if (dotRef.current) {
        // Offset by 20px (half of 40px width/height) to center the dot exactly on cursor
        dotRef.current.style.transform = `translate(${currentPos.current.x - 20}px, ${currentPos.current.y - 20}px) scale(${currentScale.current})`;
      }

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(raf);
    };
  }, [isHovering]);

  if (isTouch) return null;

  return (
    <div
      ref={dotRef}
      className={`cursor-dot ${isHovering ? "hovering" : ""}`}
      style={{ willChange: "transform" }}
    />
  );
}
