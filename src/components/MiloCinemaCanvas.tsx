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

      // Read current index directly from ref to bypass React rendering cycles
      const currentIdx = Math.round(frameIndexRef.current);
      
      // Pre-fetch surrounding frames on mobile if they are null
      if (isMobile) {
        manageCache(currentIdx);
        // Load next and prev frames asynchronously
        loadFrameOnDemand(currentIdx + 1);
        loadFrameOnDemand(currentIdx + 2);
        loadFrameOnDemand(currentIdx - 1);
      }

      // Only draw if the frame has actually changed
      if (currentIdx !== lastRenderedFrameRef.current) {
        const img = images[currentIdx];

        if (img && img.complete) {
          // Calculate object-fit: cover coordinates
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const imgWidth = img.naturalWidth || img.width;
          const imgHeight = img.naturalHeight || img.height;

          const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
          const newWidth = imgWidth * ratio;
          const newHeight = imgHeight * ratio;

          const x = (canvasWidth - newWidth) / 2;
          const y = (canvasHeight - newHeight) / 2;

          // Perform high-performance draw
          ctx.drawImage(img, x, y, newWidth, newHeight);
          lastRenderedFrameRef.current = currentIdx;
        } else {
          // If frame isn't loaded yet, try to load it on demand immediately
          if (!img) {
            await loadFrameOnDemand(currentIdx);
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
