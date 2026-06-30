"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Compass } from "lucide-react";

interface InteractiveHUDProps {
  frameIndex: number;
  totalFrames: number;
}

export function InteractiveHUD({ frameIndex, totalFrames }: InteractiveHUDProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeChapter, setActiveChapter] = useState("Anticipation");

  // Web Audio API refs for real-time scrolling synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodeRef = useRef<OscillatorNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);

  // Map Frame Index to Chapter Title
  useEffect(() => {
    if (frameIndex < 25) {
      setActiveChapter("Anticipation");
    } else if (frameIndex >= 25 && frameIndex < 102) {
      setActiveChapter("Raw Cocoa & Malt");
    } else if (frameIndex >= 102 && frameIndex < 166) {
      setActiveChapter("Vitality Activation");
    } else if (frameIndex >= 166 && frameIndex < 219) {
      setActiveChapter("Nourishment Flow");
    } else {
      setActiveChapter("Morning Hero");
    }
  }, [frameIndex]);

  // Handle Scroll Speed Synthesizer modulation
  useEffect(() => {
    const now = Date.now();
    const frameDelta = Math.abs(frameIndex - lastFrameRef.current);
    const timeDelta = now - lastScrollTimeRef.current;
    
    if (timeDelta > 0 && isPlayingAudio && synthNodeRef.current && filterNodeRef.current) {
      // Calculate scroll velocity (frames per millisecond)
      const velocity = frameDelta / timeDelta;
      
      // Modulate oscillator frequency and filter cutoff based on scroll speed
      const baseFreq = 82.41; // E2 (low bass drone)
      const targetFreq = baseFreq + Math.min(60, velocity * 400);
      const targetCutoff = 200 + Math.min(800, velocity * 2500);

      // Smoothly ramp nodes to target values to prevent clicking artifacts
      synthNodeRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current!.currentTime, 0.1);
      filterNodeRef.current.frequency.setTargetAtTime(targetCutoff, audioCtxRef.current!.currentTime, 0.15);
    }
    
    lastScrollTimeRef.current = now;
    lastFrameRef.current = frameIndex;
  }, [frameIndex, isPlayingAudio]);

  // Audio synthesizer lifecycle
  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      // Initialize Web Audio API
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // 1. Primary Low Oscillator (Sawtooth/Triangle mix for warm drone)
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(82.41, ctx.currentTime); // E2 note
      synthNodeRef.current = osc;

      // 2. Lowpass Filter for cinematic mood
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(250, ctx.currentTime);
      filter.Q.setValueAtTime(5, ctx.currentTime);
      filterNodeRef.current = filter;

      // 3. Gain Node for volume control
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0, ctx.currentTime); // Start silent
      gainNodeRef.current = gain;

      // Connections: Osc -> Filter -> Gain -> Destination
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      
      // Fade in gain to prevent sudden pop
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);
      setIsPlayingAudio(true);
    } else {
      const ctx = audioCtxRef.current;
      const gain = gainNodeRef.current;

      if (isPlayingAudio) {
        // Fade out synth
        gain?.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.5);
        setTimeout(() => {
          if (ctx.state === "running") {
            ctx.suspend();
          }
        }, 500);
        setIsPlayingAudio(false);
      } else {
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        gain?.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.5);
        setIsPlayingAudio(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup audio nodes on unmount
      if (synthNodeRef.current) {
        try {
          synthNodeRef.current.stop();
        } catch {}
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Progress metrics
  const scrollProgress = Math.min(100, Math.round((frameIndex / (totalFrames - 1)) * 100));

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none p-6 md:p-8 flex justify-between items-center">
      {/* Brand Header */}
      <div className="flex items-center gap-3 select-none pointer-events-auto">
        <span className="font-display text-lg font-black tracking-wider text-brand-green text-glow-green">
          MILO®
        </span>
        <div className="h-4 w-[1px] bg-brand-light/20" />
        <span className="font-mono text-[10px] tracking-[0.25em] text-brand-light/60 uppercase">
          Cinematic scrubbing
        </span>
      </div>

      {/* Center Dynamic HUD Tracker */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 bg-brand-dark/40 backdrop-blur-md px-6 py-2 rounded-full border border-brand-green/10 select-none">
        <Compass className="w-4 h-4 text-brand-gold animate-spin [animation-duration:15s]" />
        <span className="font-display text-xs font-bold tracking-widest text-[#f4f7f5] uppercase min-w-[120px] text-center">
          {activeChapter}
        </span>
        <div className="h-3 w-[1px] bg-brand-light/10" />
        <span className="font-mono text-[10px] text-brand-green font-bold w-10 text-right">
          {scrollProgress}%
        </span>
      </div>

      {/* Right Controls Panel */}
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* Sound mod activator */}
        <button
          onClick={toggleAudio}
          className="flex items-center justify-center w-10 h-10 rounded-full glass-panel glass-panel-hover text-brand-light/75 hover:text-brand-gold cursor-pointer"
          title="Toggle Scroll-Driven Synth Audio"
        >
          {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
