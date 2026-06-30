"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { useImagePreloader } from "@/hooks/useImagePreloader";
import { MiloCinemaCanvas } from "@/components/MiloCinemaCanvas";
import { Preloader } from "@/components/Preloader";
import { StoryNarrative, STORY_SEGMENTS } from "@/components/StoryNarrative";
import { InteractiveHUD } from "@/components/InteractiveHUD";
import { ProductSpecsBento } from "@/components/ProductSpecsBento";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const {
    images,
    preloadState,
    manageCache,
    loadFrameOnDemand,
    isMobile,
    totalFrames
  } = useImagePreloader();

  // Frame trackers: ref is used to feed the high-speed canvas loop
  // and prevent React re-renders during active scroll.
  const frameIndexRef = useRef<number>(0);
  
  // State variables are updated only when needed for UI text sync (HUD)
  const [activeFrameState, setActiveFrameState] = useState<number>(0);
  const [isBentoVisible, setIsBentoVisible] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize Lenis Smooth Scroll & GSAP ScrollTrigger bindings
  useEffect(() => {
    if (!preloadState.isReady) return;

    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom premium cubic ease-out
      touchMultiplier: 2.0,
      infinite: false,
    });

    // Feed Lenis requestAnimationFrame loops to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Map scroll progress to our cinematic frame timeline
    const scrollVal = { frame: 0 };
    let lastIntFrame = 0;

    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.0, // Kinetic delay interpolation for smooth frame transition
        onUpdate: (self) => {
          const frameVal = scrollVal.frame;
          frameIndexRef.current = frameVal;
          
          // Throttled UI state updates: only update state when integer index changes
          const currentIntFrame = Math.round(frameVal);
          if (currentIntFrame !== lastIntFrame) {
            lastIntFrame = currentIntFrame;
            setActiveFrameState(currentIntFrame);
            
            // Show bento spec details during final pouring scene (Frames >= 170)
            setIsBentoVisible(currentIntFrame >= 170);
          }
        }
      }
    });

    // Scrub the frame index across 0 to 237 over the entire scroll height
    mainTimeline.to(scrollVal, {
      frame: totalFrames - 1,
      ease: "none"
    });

    // 3. Staggered reveal of storytelling narrative overlays
    STORY_SEGMENTS.forEach((segment, index) => {
      const element = document.querySelector(`#story-${segment.id} > div`);
      if (!element) return;

      // Compute normalized scroll triggers for each segment
      const enterStart = index * 0.18 + 0.05;
      const enterEnd = enterStart + 0.06;
      const exitStart = enterEnd + 0.06;
      const exitEnd = exitStart + 0.06;

      const triggerTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: `${enterStart * 100}% top`,
          end: `${exitEnd * 100}% top`,
          scrub: true,
        }
      });

      // Staggered reveal tween: Fades in, blurs, and slides up/down
      triggerTl
        .to(element, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "power2.out"
        })
        .to(element, {
          opacity: 0,
          y: -40,
          filter: "blur(12px)",
          duration: 1.0,
          ease: "power2.in",
          delay: 1.2
        });
    });

    // 4. Shift canvas container to the left in final Scene 5 (desktop only)
    if (!isMobile) {
      gsap.to(".cinema-canvas-wrapper", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "70% top",
          end: "90% top",
          scrub: true,
        },
        x: "-15%",
        scale: 0.95,
        borderRadius: "40px",
        boxShadow: "0 25px 70px -10px rgba(0, 150, 57, 0.3)"
      });
    }

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
    };
  }, [preloadState.isReady, totalFrames, isMobile]);

  return (
    <>
      {/* 1. Immersive Two-Stage Preloader */}
      <Preloader
        progress={preloadState.progress}
        totalLoaded={preloadState.totalLoaded}
        totalFrames={totalFrames}
        onComplete={() => {
          // Additional entrance trigger if needed
        }}
      />

      {/* 2. Interactive Scroll Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[600vh] bg-[#020803]"
      >
        {/* 3. Cinematic Canvas Element */}
        <div className="cinema-canvas-wrapper fixed inset-0 w-full h-screen overflow-hidden transition-all duration-300">
          <MiloCinemaCanvas
            images={images}
            frameIndexRef={frameIndexRef}
            manageCache={manageCache}
            loadFrameOnDemand={loadFrameOnDemand}
            isMobile={isMobile}
          />
        </div>

        {/* 4. Interactive HUD */}
        {preloadState.isReady && (
          <InteractiveHUD
            frameIndex={activeFrameState}
            totalFrames={totalFrames}
          />
        )}

        {/* 5. Narrative Text Overlays */}
        {preloadState.isReady && <StoryNarrative />}

        {/* 6. Product Specification Bento Grid (Mounts at bottom of track) */}
        {preloadState.isReady && (
          <div className="absolute bottom-0 left-0 right-0 w-full flex flex-col justify-end min-h-screen bg-gradient-to-t from-[#020803] via-[#020803]/80 to-transparent">
            <ProductSpecsBento isVisible={isBentoVisible} />
            <footer className="w-full py-12 text-center text-[10px] font-mono tracking-[0.3em] text-brand-light/20 border-t border-brand-green/5 bg-brand-dark">
              © {new Date().getFullYear()} MILO® CINEMATIC EXPERIENCE. ALL RIGHTS RESERVED.
            </footer>
          </div>
        )}
      </div>
    </>
  );
}
