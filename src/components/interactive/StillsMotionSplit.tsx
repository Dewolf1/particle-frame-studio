import { useState, useRef, useCallback } from "react";
import { SlidersHorizontal, Film, Camera } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

export function StillsMotionSplit() {
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    sounds.lensTick();
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      sounds.lensTick();
    }
  };

  return (
    <section id="dual-threat" className="border-t border-border/40 bg-card/30 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
        {/* Section Heading */}
        <div className="mb-10 md:mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-accent">
            <SlidersHorizontal className="size-3" />
            <span>Dual-Threat Interactive Showcase</span>
          </div>
          <h2 className="mt-3 md:mt-4 font-serif font-normal text-3xl sm:text-5xl md:text-6xl text-foreground tracking-tight">
            Still Precision <span className="font-serif italic font-normal text-accent/80">×</span>{" "}
            Motion Energy
          </h2>
          <p className="mx-auto mt-3 md:mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground/85 font-sans font-normal leading-relaxed">
            A single creative vision executed across two distinct mediums. Drag the divider to
            inspect the composition as an editorial still versus a graded cinematic sequence.
          </p>
        </div>

        {/* Split Comparison Frame - Responsive aspect ratio (4/5 on phone, 16/9 on desktop) */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative mx-auto aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9] max-h-[640px] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-border/70 shadow-2xl touch-none"
        >
          {/* Base Layer: Motion (Right) */}
          <div className="absolute inset-0">
            <img
              src="/photos/frame-2.jpg"
              alt="Graded Cinema Motion Frame"
              className="h-full w-full object-cover filter contrast-110 saturate-125"
            />
            {/* HUD Badge: Motion */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 rounded-full bg-black/60 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-accent backdrop-blur-md border border-white/10 shadow-lg">
              <Film className="size-3 sm:size-3.5" />
              <span>4K GRADED MOTION</span>
            </div>
          </div>

          {/* Clipped Layer: Still (Left) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src="/photos/frame-4.jpg"
              alt="Raw Editorial Still Frame"
              className="h-full w-full object-cover filter grayscale contrast-125"
            />
            {/* HUD Badge: Still */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 rounded-full bg-black/60 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-foreground backdrop-blur-md border border-white/10 shadow-lg">
              <Camera className="size-3 sm:size-3.5 text-accent" />
              <span>RAW STILL COMPOSITION</span>
            </div>
          </div>

          {/* Tactile Divider Line */}
          <div
            className="absolute inset-y-0 z-20 w-[2px] bg-accent shadow-[0_0_15px_rgba(255,180,80,0.9)]"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Center Aperture Thumb Handle */}
            <div className="absolute top-1/2 -left-4 sm:-left-5 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-accent bg-background text-accent shadow-2xl transition-all duration-300 hover:scale-115 active:scale-95 animate-pulse-glow">
              <SlidersHorizontal className="size-3.5 sm:size-4" />
            </div>
          </div>

          {/* Footer Instruction Hint */}
          <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center pointer-events-none">
            <span className="rounded-full bg-black/60 px-4 py-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-white/90 backdrop-blur-md border border-white/10 shadow-md">
              ◄ DRAG TO REVEAL STILL VS MOTION ►
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
