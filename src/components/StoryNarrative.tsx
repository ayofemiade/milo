"use client";

import { useId } from "react";

export interface StorySegment {
  id: string;
  title: string;
  body: string;
  alignment: "left" | "right" | "center";
}

export const STORY_SEGMENTS: StorySegment[] = [
  {
    id: "intro",
    title: "Before the day begins",
    body: "Deep within the silence of dawn, raw natural potential awaits the spark of action.",
    alignment: "center"
  },
  {
    id: "malt-cocoa",
    title: "Roasted Malt & Pure Cocoa",
    body: "Wholesome barley malt extracts combine with rich cocoa to lay the foundation of slow-release energy.",
    alignment: "left"
  },
  {
    id: "nutrition",
    title: "Grounded in Goodness",
    body: "Rich, creamy milk solids fuse with natural grain sugars to feed active muscles and sharp minds.",
    alignment: "right"
  },
  {
    id: "vitality",
    title: "Unlocking Active Vitality",
    body: "Essential vitamins and minerals awaken, creating a powerful fusion of morning strength.",
    alignment: "center"
  },
  {
    id: "pouring",
    title: "The Champion's Fuel",
    body: "Pouring nutrition into every glass, ready to power every stride, splash, and score.",
    alignment: "left"
  }
];

export function StoryNarrative() {
  return (
    <div className="pointer-events-none fixed inset-0 w-full h-screen z-20">
      {/* Scroll indicator instructions overlay */}
      <div className="scroll-indicator absolute top-12 left-1/2 -translate-x-1/2 text-center select-none">
        <p className="text-[10px] tracking-[0.3em] text-brand-light/30 uppercase animate-bounce">
          SCROLL TO COMMENCE FILM
        </p>
        <div className="w-[1px] h-6 bg-brand-green/30 mx-auto mt-2" />
      </div>

      {STORY_SEGMENTS.map((segment, index) => {
        const alignmentClass =
          segment.alignment === "left"
            ? "items-start text-left md:pl-24"
            : segment.alignment === "right"
            ? "items-end text-right md:pr-24"
            : "items-center text-center";

        return (
          <div
            key={segment.id}
            id={`story-${segment.id}`}
            className={`absolute inset-0 flex flex-col justify-center px-6 md:px-12 select-none pointer-events-none ${alignmentClass}`}
          >
            {/* Elegant glowing glass backplate behind narratives for readability */}
            <div className="max-w-xl glass-panel p-8 md:p-12 rounded-3xl opacity-0 translate-y-12 blur-md transition-all duration-100 ease-out">
              <span className="font-mono text-xs tracking-[0.4em] text-brand-gold uppercase block mb-3 text-glow-gold">
                Chapter 0{index + 1}
              </span>
              <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-brand-light mb-4 leading-tight">
                {segment.title}
              </h2>
              <p className="font-sans text-sm md:text-base leading-relaxed text-brand-light/75">
                {segment.body}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
