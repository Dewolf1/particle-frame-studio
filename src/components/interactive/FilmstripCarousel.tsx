import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Instagram, ExternalLink } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

const INSTAGRAM_URL = "https://www.instagram.com/paiman_wafa/";
const INSTAGRAM_HANDLE = "@paiman_wafa";

const FRAMES = [
  {
    src: "/photos/frame-1.jpg",
    alt: "Editorial portraiture session",
    frameNum: "01",
    filmStock: "PORTRA 400",
  },
  {
    src: "/photos/frame-2.jpg",
    alt: "Commercial film production",
    frameNum: "02",
    filmStock: "TRI-X 400",
  },
  {
    src: "/photos/frame-3.jpg",
    alt: "Soundstage behind the scenes",
    frameNum: "03",
    filmStock: "CINESTILL 800T",
  },
  {
    src: "/photos/frame-4.jpg",
    alt: "Chiaroscuro studio lighting",
    frameNum: "04",
    filmStock: "PORTRA 160",
  },
  {
    src: "/photos/frame-5.jpg",
    alt: "Dynamic brand film sequence",
    frameNum: "05",
    filmStock: "VISION3 250D",
  },
  {
    src: "/photos/frame-6.jpg",
    alt: "High-fashion lookbook capture",
    frameNum: "06",
    filmStock: "EKTACHROME 100",
  },
  {
    src: "/photos/frame-7.jpg",
    alt: "Nocturnal cinematic lighting",
    frameNum: "07",
    filmStock: "ILFORD HP5",
  },
  {
    src: "/photos/frame-8.jpg",
    alt: "Fine-art portrait composition",
    frameNum: "08",
    filmStock: "KODAK 5219",
  },
];

export function FilmstripCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      sounds.lensTick();
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      sounds.lensTick();
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  return (
    <section id="instagram" className="py-20 md:py-28 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 mb-8 md:mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-accent">
              <Instagram className="size-3" />
              <span>Visual Diary · 35mm Celluloid Strip</span>
            </div>
            <h2 className="mt-2 md:mt-3 font-serif font-normal text-3xl sm:text-5xl md:text-6xl text-foreground tracking-tight">
              Daily <span className="italic font-serif font-normal text-accent">Frames</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => sounds.lensTick()}
              className="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card px-4 sm:px-5 py-2.5 text-xs font-sans font-medium uppercase tracking-[0.14em] text-foreground transition-colors hover:border-accent hover:text-accent shadow-sm"
            >
              <Instagram className="size-3.5" />
              <span>{INSTAGRAM_HANDLE}</span>
              <ExternalLink className="size-3" />
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous film frames"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next film frames"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 35mm Filmstrip Horizontal Strip with Sprockets */}
      <div className="relative py-4 sm:py-6 bg-card/40 border-y border-border/50 sprocket-border-t sprocket-border-b">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 sm:gap-6 px-4 sm:px-6 md:px-12 select-none">
            {FRAMES.map((frame, index) => (
              <a
                key={index}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => sounds.lensTick()}
                className="group relative flex-none w-[220px] sm:w-[280px] md:w-[320px] overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg transition-transform duration-500 hover:-translate-y-1 hover:border-accent"
              >
                {/* 35mm Film Frame Edge Header */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-black text-[9px] font-mono text-white/60 uppercase tracking-widest border-b border-white/10">
                  <span className="text-accent">EXP {frame.frameNum}A</span>
                  <span>{frame.filmStock}</span>
                </div>

                {/* Photo in Portrait 9:14 */}
                <div className="relative aspect-[9/14] overflow-hidden bg-background">
                  <img
                    src={frame.src}
                    alt={frame.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                  />

                  {/* Hover Instagram Icon & Frame Brackets */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-background shadow-xl">
                      <Instagram className="size-5" />
                    </span>
                  </div>
                </div>

                {/* 35mm Film Frame Edge Footer */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-black text-[8px] font-mono text-white/50 uppercase tracking-widest border-t border-white/10">
                  <span>PAIMAN WAFA · 2026</span>
                  <span className="text-accent flex items-center gap-1">
                    VIEW POST <ExternalLink className="size-2.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
