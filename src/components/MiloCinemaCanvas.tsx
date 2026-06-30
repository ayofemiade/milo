"use client";

import { useEffect, useRef } from "react";

interface MiloCinemaCanvasProps {
  images: (HTMLImageElement | null)[];
  frameIndexRef: React.RefObject<number>;
  manageCache: (index: number) => void;
  loadFrameOnDemand: (index: number) => Promise<void>;
  isMobile: boolean;
}

export function MiloCinemaCanvas({
  images,
  frameIndexRef,
  manageCache,
  loadFrameOnDemand,
  isMobile
}: MiloCinemaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastRenderedFrameRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number | null>(null);

  const mouseRef = useRef({ x: 0, y: 0 });
  const lerpedMouseRef = useRef({ x: 0, y: 0 });
  const interpolatedFrameRef = useRef<number>(0);

  // Synchronize initial scroll frame on mount
  useEffect(() => {
    if (frameIndexRef.current !== null) {
      interpolatedFrameRef.current = frameIndexRef.current;
    }
  }, [frameIndexRef]);

  // Track cursor movement for cinematic parallax
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize coordinate: center of screen is 0, ranges from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current = { x, y };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]);

  // Initialize Canvas Context and Handle Resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    contextRef.current = ctx;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      
      // On mobile, scale down canvas resolution slightly to optimize memory fillrate
      const scaleFactor = isMobile ? 0.75 : 1.0;
      
      canvas.width = window.innerWidth * dpr * scaleFactor;
      canvas.height = window.innerHeight * dpr * scaleFactor;
      
      // Keep styling sizes match viewport
      canvas.style.width = "100%";
      canvas.style.height = "100vh";
      
      // Reset rendered tracker to force redraw on resize
      lastRenderedFrameRef.current = -1;
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  // Main Render Loop driven by requestAnimationFrame ticks
  useEffect(() => {
    let active = true;

    const render = async () => {
      if (!active) return;

      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (!canvas || !ctx) {
        animationFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      // Read target index directly from ref to bypass React rendering cycles
      const targetIdx = frameIndexRef.current;
      const currentIdx = interpolatedFrameRef.current;

      const diff = targetIdx - currentIdx;
      const dist = Math.abs(diff);

      // Adaptive easing factor
      const baseEase = 0.05; // more weight/inertia for fast scrolling
      const maxEase = 0.18;  // more precision/responsiveness for slow scrolling
      const easeRate = maxEase - (maxEase - baseEase) * Math.min(1, dist / 30);

      let nextIdx = currentIdx + diff * easeRate;

      // Snapping threshold to prevent tiny fractional adjustments
      if (dist < 0.015) {
        nextIdx = targetIdx;
      }
      interpolatedFrameRef.current = nextIdx;

      // Rounded frame number for current frame drawing
      const renderIdx = Math.round(nextIdx);

      // Pre-fetch surrounding frames on mobile if they are null
      if (isMobile) {
        manageCache(renderIdx);
        // Load next and prev frames asynchronously
        loadFrameOnDemand(renderIdx + 1);
        loadFrameOnDemand(renderIdx + 2);
        loadFrameOnDemand(renderIdx - 1);
      }

      // Smoothly interpolate cursor positions for organic motion delay
      if (!isMobile) {
        lerpedMouseRef.current.x += (mouseRef.current.x - lerpedMouseRef.current.x) * 0.08;
        lerpedMouseRef.current.y += (mouseRef.current.y - lerpedMouseRef.current.y) * 0.08;
      }

      // Compute transitions for parallax based on index
      // Smoothly blend in parallax as scroll reaches the bottom (from frame 220 to 225)
      const t = Math.max(0, Math.min(1, (renderIdx - 220) / 5));
      const zoom = 1.0 + t * 0.04;
      const xOffset = lerpedMouseRef.current.x * t * 20; // Up to 20px translation
      const yOffset = lerpedMouseRef.current.y * t * 20; // Up to 20px translation

      // Redraw canvas if frame index changed OR if cursor-parallax is active
      const hasFrameChanged = renderIdx !== lastRenderedFrameRef.current;
      const isParallaxActive = t > 0.01 && (
        Math.abs(mouseRef.current.x - lerpedMouseRef.current.x) > 0.001 ||
        Math.abs(mouseRef.current.y - lerpedMouseRef.current.y) > 0.001
      );

      if (hasFrameChanged || isParallaxActive) {
        const img = images[renderIdx];

        if (img && img.complete) {
          // Calculate object-fit: cover coordinates
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const imgWidth = img.naturalWidth || img.width;
          const imgHeight = img.naturalHeight || img.height;

          const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
          // Scale size up slightly based on zoom factor
          const newWidth = imgWidth * ratio * zoom;
          const newHeight = imgHeight * ratio * zoom;

          // Standard centered coordinates
          const x = (canvasWidth - newWidth) / 2;
          const y = (canvasHeight - newHeight) / 2;

          // Perform high-performance draw with mouse offsets
          ctx.drawImage(img, x - xOffset, y - yOffset, newWidth, newHeight);
          lastRenderedFrameRef.current = renderIdx;
        } else {
          // If frame isn't loaded yet, try to load it on demand immediately
          if (!img) {
            await loadFrameOnDemand(renderIdx);
          }
          // Request visual update on next tick
          lastRenderedFrameRef.current = -1;
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      active = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [images, isMobile, loadFrameOnDemand, manageCache, frameIndexRef]);

  return (
    <div className="fixed inset-0 -z-10 w-full h-screen overflow-hidden bg-[#020803]">
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-cover transition-opacity duration-500 ease-out"
      />
      {/* Cinematic subtle grid scanline overlay for premium texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,8,3,0.4)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-repeat bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%)] bg-[length:100%_4px]" />
    </div>
  );
}
