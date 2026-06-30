"use client";

import { useState, useEffect, useRef } from "react";

const TOTAL_FRAMES = 238;

// Stage 1: Critical frames loaded immediately (Intro 0-25 and Hero 220-237)
const STAGE_1_INDICES = [
  ...Array.from({ length: 26 }, (_, i) => i), // 0 to 25
  ...Array.from({ length: 18 }, (_, i) => i + 220) // 220 to 237
];

const formatFrameFilename = (index: number) => {
  const padded = String(index).padStart(3, "0");
  return `/sequence/frame_${padded}_delay-0.041s.webp`;
};

export interface PreloadState {
  progress: number;
  isReady: boolean;
  totalLoaded: number;
}

export function useImagePreloader() {
  const [state, setState] = useState<PreloadState>({
    progress: 0,
    isReady: false,
    totalLoaded: 0,
  });

  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
  
  // Track decoding tasks so we don't repeat them
  const loadingStatusRef = useRef<("idle" | "loading" | "loaded")[]>(
    new Array(TOTAL_FRAMES).fill("idle")
  );

  const isMobileRef = useRef<boolean>(false);
  const currentFrameRef = useRef<number>(0);

  useEffect(() => {
    // Detect mobile device to apply sliding window cache
    if (typeof window !== "undefined") {
      isMobileRef.current =
        window.innerWidth < 768 ||
        (navigator.maxTouchPoints > 0 && /Mobi|Android/i.test(navigator.userAgent));
    }

    let isMounted = true;
    const stage1Set = new Set(STAGE_1_INDICES);

    async function loadFrame(index: number): Promise<HTMLImageElement | null> {
      if (imagesRef.current[index]) {
        return imagesRef.current[index];
      }

      if (loadingStatusRef.current[index] === "loading") {
        // Wait for it if it's already loading
        return new Promise((resolve) => {
          const check = setInterval(() => {
            if (imagesRef.current[index]) {
              clearInterval(check);
              resolve(imagesRef.current[index]);
            }
          }, 50);
        });
      }

      loadingStatusRef.current[index] = "loading";
      const img = new Image();
      img.src = formatFrameFilename(index);

      try {
        // Native off-thread decoding by GPU. Prevents main thread stutter.
        await img.decode();
        if (!isMounted) return null;
        
        imagesRef.current[index] = img;
        loadingStatusRef.current[index] = "loaded";
        return img;
      } catch (err) {
        console.error(`Failed to decode frame ${index}:`, err);
        // Fallback: still resolve so loading doesn't block forever
        imagesRef.current[index] = img;
        loadingStatusRef.current[index] = "loaded";
        return img;
      }
    }

    async function startPreload() {
      // ----------------------------------------------------
      // STAGE 1: Load and decode critical frames first
      // ----------------------------------------------------
      let stage1Loaded = 0;
      const stage1Promises = STAGE_1_INDICES.map(async (index) => {
        await loadFrame(index);
        stage1Loaded++;
        if (isMounted) {
          // Progress is based on Stage 1 completion (0 to 100%)
          const progress = Math.min(
            100,
            Math.round((stage1Loaded / STAGE_1_INDICES.length) * 100)
          );
          setState((prev) => ({
            ...prev,
            progress,
            totalLoaded: prev.totalLoaded + 1
          }));
        }
      });

      await Promise.all(stage1Promises);

      if (isMounted) {
        setState((prev) => ({ ...prev, isReady: true }));
      }

      // ----------------------------------------------------
      // STAGE 2: Stream remaining frames in background
      // ----------------------------------------------------
      const remainingIndices = Array.from({ length: TOTAL_FRAMES }, (_, i) => i)
        .filter((i) => !stage1Set.has(i));

      // Load remaining frames in small batches to not lock the network/main thread
      const batchSize = isMobileRef.current ? 4 : 8;
      for (let i = 0; i < remainingIndices.length; i += batchSize) {
        if (!isMounted) break;
        const batch = remainingIndices.slice(i, i + batchSize);
        await Promise.all(batch.map((index) => loadFrame(index)));
        
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            totalLoaded: imagesRef.current.filter(Boolean).length
          }));
        }
        
        // Brief yield to browser idle/repaint
        await new Promise((r) => setTimeout(r, 40));
      }
    }

    startPreload();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sliding Window Cache management for mobile devices.
  // Call this function inside the requestAnimationFrame loop to clean memory.
  const manageCache = (activeFrame: number) => {
    currentFrameRef.current = activeFrame;
    if (!isMobileRef.current) return; // Keep all in memory on desktop

    const WINDOW_SIZE = 20; // Keep current frame +/- 20 frames
    const minIndex = Math.max(0, activeFrame - WINDOW_SIZE);
    const maxIndex = Math.min(TOTAL_FRAMES - 1, activeFrame + WINDOW_SIZE);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      // Do not evict critical Stage 1 frames because they are needed for quick scrub resets
      if (STAGE_1_INDICES.includes(i)) continue;

      if ((i < minIndex || i > maxIndex) && imagesRef.current[i]) {
        // Evict from memory to prevent garbage collection spikes / tab crashes on mobile
        imagesRef.current[i] = null;
        loadingStatusRef.current[i] = "idle";
      }
    }
  };

  // Pre-load frames surrounding the active frame on-the-fly (useful for mobile dynamic fetch)
  const loadFrameOnDemand = async (index: number) => {
    if (index < 0 || index >= TOTAL_FRAMES) return;
    if (imagesRef.current[index] || loadingStatusRef.current[index] === "loading") return;

    loadingStatusRef.current[index] = "loading";
    const img = new Image();
    img.src = formatFrameFilename(index);
    try {
      await img.decode();
      imagesRef.current[index] = img;
      loadingStatusRef.current[index] = "loaded";
    } catch {
      imagesRef.current[index] = img;
      loadingStatusRef.current[index] = "loaded";
    }
  };

  return {
    images: imagesRef.current,
    preloadState: state,
    manageCache,
    loadFrameOnDemand,
    isMobile: isMobileRef.current,
    totalFrames: TOTAL_FRAMES
  };
}
