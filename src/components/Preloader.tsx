"use client";

import { useEffect, useState } from "react";

interface PreloaderProps {
  progress: number;
  totalLoaded: number;
  totalFrames: number;
  onComplete: () => void;
}

export function Preloader({
  progress,
  totalLoaded,
  totalFrames,
  onComplete
}: PreloaderProps) {
  const [shouldMount, setShouldMount] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      // Delay slightly for visual comfort before fading out
      const timeout = setTimeout(() => {
        setFadeOut(true);
        // Wait for CSS transition (700ms) to complete before unmounting
        const unmountTimeout = setTimeout(() => {
          setShouldMount(false);
          onComplete();
        }, 700);
        return () => clearTimeout(unmountTimeout);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  if (!shouldMount) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020803] transition-all duration-700 ease-in-out ${
        fadeOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background glowing particles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />

      <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Brand Emblem */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border border-brand-green/20 animate-[spin_10s_linear_infinite]" />
          <div className="absolute w-20 h-20 rounded-full border-t-2 border-brand-gold animate-[spin_3s_linear_infinite]" />
          <span className="font-display text-4xl font-extrabold tracking-wider text-brand-green text-glow-green">
            MILO
          </span>
        </div>

        {/* Cinematic Title & Tagline */}
        <h2 className="font-display text-xl font-bold tracking-widest text-[#f4f7f5] uppercase mb-2">
          Cinematic Experience
        </h2>
        
        {/* Animated Message Based on Progress */}
        <p className="text-sm tracking-wider text-[#f4f7f5]/60 mb-8 h-6 animate-pulse">
          {progress < 30 && "Harvesting Roasted Malt..."}
          {progress >= 30 && progress < 60 && "Grinding Pure Cocoa..."}
          {progress >= 60 && progress < 90 && "Fusing Active Nutrients..."}
          {progress >= 90 && "Unlocking Active Vitality..."}
        </p>

        {/* Glowing Progress Bar Panel */}
        <div className="w-64 glass-panel p-1 rounded-full relative mb-4 overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-brand-green to-brand-gold rounded-full shadow-[0_0_12px_rgba(0,150,57,0.5)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Counters */}
        <div className="flex w-64 justify-between text-xs font-mono tracking-widest text-[#f4f7f5]/40">
          <span>DECODING ASSETS</span>
          <span className="text-brand-green font-bold">{progress}%</span>
        </div>

        <div className="text-[10px] font-mono tracking-widest text-[#f4f7f5]/20 mt-12 uppercase">
          Streaming {totalLoaded}/{totalFrames} Frames
        </div>
      </div>
    </div>
  );
}
