"use client";

import { useEffect, useRef } from "react";
import { Zap, Flame, ShieldAlert, Award, ArrowUpRight } from "lucide-react";

interface ProductSpecsBentoProps {
  isVisible: boolean;
}

export function ProductSpecsBento({ isVisible }: ProductSpecsBentoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-5xl px-6 py-24 mx-auto transition-all duration-1000 ease-out select-none ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-16 pointer-events-none"
      }`}
    >
      <div className="text-center mb-12">
        <span className="font-mono text-xs tracking-[0.45em] text-brand-gold uppercase block mb-3 text-glow-gold">
          Nutritional Blueprint
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-brand-light leading-tight">
          Unlocking Champion Energy
        </h2>
        <p className="font-sans text-sm md:text-base text-brand-light/60 mt-3 max-w-xl mx-auto">
          Every cup of MILO® is packed with ACTIGEN-E®—a combination of 8 vitamins and 4 minerals to optimize energy release.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Large Carbohydrate Focus (2x2 span equivalent) */}
        <div className="md:col-span-2 glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-green/20 flex items-center justify-center mb-6 text-brand-green shadow-[0_0_15px_rgba(0,150,57,0.2)]">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-brand-light tracking-tight mb-3">
              Malted Grains & Complex Grains
            </h3>
            <p className="font-sans text-sm leading-relaxed text-brand-light/70 max-w-lg">
              MILO® leverages premium malted barley extracts. These slow-release complex carbohydrates provide a sustained feed of energy to active muscle groups, maintaining peak metabolic performance without sugar spikes.
            </p>
          </div>
          <div className="flex gap-6 mt-8 border-t border-brand-green/10 pt-6">
            <div>
              <span className="font-mono text-2xl font-black text-brand-green">PRO-ENERGY</span>
              <p className="text-[10px] tracking-wider text-brand-light/45 uppercase mt-1">Steady Release</p>
            </div>
            <div className="w-[1px] bg-brand-light/10" />
            <div>
              <span className="font-mono text-2xl font-black text-brand-gold">80%</span>
              <p className="text-[10px] tracking-wider text-brand-light/45 uppercase mt-1">Carb Efficiency</p>
            </div>
          </div>
        </div>

        {/* Card 2: Medium Activ-Go Spotlight */}
        <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 flex items-center justify-center mb-6 text-brand-gold shadow-[0_0_15px_rgba(210,166,20,0.2)]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-brand-light tracking-tight mb-3">
              ACTIV-GO® Formula
            </h3>
            <p className="font-sans text-xs md:text-sm leading-relaxed text-brand-light/70">
              A patented blend of 6 vital B-vitamins (B2, B3, B6, B12), Vitamin C, Vitamin D, and 3 essential minerals—Iron, Calcium, and Phosphorus.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {["B-Vitamins", "Calcium", "Iron", "Vitamin D"].map((tag) => (
              <span key={tag} className="text-[9px] font-mono tracking-wider font-bold bg-brand-green/10 text-brand-green px-2.5 py-1 rounded-full border border-brand-green/10">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Card 3: Milk & Cocoa Protein Blend */}
        <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-brand-green uppercase mb-3 text-glow-green">
              Ingredients
            </h4>
            <h3 className="font-display text-lg font-bold text-brand-light tracking-tight mb-2">
              Milk & Pure Cocoa
            </h3>
            <p className="font-sans text-xs leading-relaxed text-brand-light/60">
              Natural cow's milk brings core proteins, whey, and calcium for skeletal integrity, while premium cocoa provides the rich, signature chocolate malt taste.
            </p>
          </div>
          <span className="text-[10px] font-mono text-brand-light/30">Ratio: 1:1 Fusion</span>
        </div>

        {/* Card 4: Energy Release Chart simulation */}
        <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-brand-gold uppercase mb-3 text-glow-gold">
              Metabolism
            </h4>
            <h3 className="font-display text-lg font-bold text-brand-light tracking-tight mb-3">
              Release Curve
            </h3>
            {/* Visual graph mockup */}
            <div className="h-16 flex items-end gap-1.5 mt-2 bg-brand-dark/30 rounded-lg p-2 border border-brand-green/5">
              {[30, 45, 55, 75, 90, 85, 70, 50, 40].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-brand-green to-brand-gold rounded-sm transition-all duration-500"
                  style={{ height: `${h}%`, opacity: 0.4 + (i * 0.06) }}
                />
              ))}
            </div>
          </div>
          <span className="text-[9px] font-mono text-brand-light/35 uppercase tracking-widest block">
            4-Hour Energy Span
          </span>
        </div>

        {/* Card 5: Full CTA Card */}
        <div className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between bg-gradient-to-br from-brand-green/10 via-brand-dark to-brand-gold/5 border-brand-green/30 min-h-[220px]">
          <div>
            <div className="flex justify-between items-start">
              <Award className="w-8 h-8 text-brand-gold" />
              <ArrowUpRight className="w-5 h-5 text-brand-light/30" />
            </div>
            <h3 className="font-display text-lg font-black text-brand-light mt-4 tracking-tight">
              Fuel Your Morning
            </h3>
            <p className="font-sans text-xs text-brand-light/60 mt-2">
              Discover breakfast recipe integrations and meal plans curated by energy scientists.
            </p>
          </div>
          <button className="w-full bg-brand-green text-brand-light py-3.5 px-6 rounded-2xl font-display font-black text-xs tracking-widest uppercase hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 shadow-[0_4px_20px_rgba(0,150,57,0.35)] cursor-pointer pointer-events-auto">
            EXPLORE THE RECIPES
          </button>
        </div>

      </div>
    </div>
  );
}
