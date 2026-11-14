import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Camera, Film, Aperture, Maximize2 } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

export interface ProjectItem {
  id: string;
  title: string;
  category: "stills" | "motion" | "bts";
  categoryLabel: string;
  client?: string;
  year: string;
  src: string;
  aspectRatio?: "portrait" | "video" | "anamorphic" | "square";
  exif: {
    camera: string;
    lens: string;
    shutter: string;
    aperture: string;
    iso: string;
    colorStock?: string;
  };
  summary: string;
}

interface ProjectLightboxProps {
  project: ProjectItem | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ProjectLightbox({ project, onClose, onNext, onPrev }: ProjectLightboxProps) {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, onClose, onNext, onPrev]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in duration-300">
      {/* Top HUD Bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 border-b border-border/40 backdrop-blur-md">
        <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-1.5 text-accent">
            <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
            <span>INSPECTION VIEW</span>
          </span>
          <span className="hidden sm:inline text-border">/</span>
          <span className="hidden sm:inline">{project.title}</span>
          <span className="hidden sm:inline text-border">/</span>
          <span className="hidden sm:inline text-foreground">{project.year}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[10px] font-mono tracking-widest text-muted-foreground">
            [ESC TO EXIT]
          </span>
          <button
            type="button"
            onClick={() => {
              sounds.lensTick();
              onClose();
            }}
            aria-label="Close lightbox"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative mt-12 flex h-[82vh] w-full max-w-7xl flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => {
            sounds.lensTick();
            onPrev();
          }}
          aria-label="Previous project"
          className="absolute left-2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card/60 text-foreground backdrop-blur-md transition-all hover:scale-105 hover:border-accent hover:bg-card"
        >
          <ChevronLeft className="size-6" />
        </button>

        {/* Image Presentation with Viewfinder Reticle */}
        <div className="relative flex flex-1 h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-card/40 p-2 md:p-6 viewfinder-corner viewfinder-corner-tl viewfinder-corner-tr viewfinder-corner-bl viewfinder-corner-br">
          <img
            src={project.src}
            alt={project.title}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-500 hover:scale-101"
          />

          {/* Optical Watermark HUD */}
          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/50 backdrop-blur-sm bg-black/40 px-3 py-1 rounded">
            <Maximize2 className="size-3 text-accent" />
            <span>OPTICAL MASTER · 4K HIGH DYNAMIC RANGE</span>
          </div>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => {
            sounds.lensTick();
            onNext();
          }}
          aria-label="Next project"
          className="absolute right-2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card/60 text-foreground backdrop-blur-md transition-all hover:scale-105 hover:border-accent hover:bg-card"
        >
          <ChevronRight className="size-6" />
        </button>

        {/* Metadata & EXIF Telemetry Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col justify-between rounded-xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent">
                {project.categoryLabel}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">{project.year}</span>
            </div>

            <h3 className="mt-2 font-serif font-normal text-3xl sm:text-4xl text-foreground tracking-tight">
              {project.title}
            </h3>
            {project.client && (
              <p className="mt-1 text-xs text-muted-foreground font-sans uppercase tracking-[0.14em] font-medium">
                Client: {project.client}
              </p>
            )}

            <p className="mt-4 text-xs font-sans font-normal leading-relaxed text-muted-foreground/85">
              {project.summary}
            </p>

            {/* EXIF Data Grid */}
            <div className="mt-6 border-t border-border/50 pt-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/80 mb-3 flex items-center gap-2">
                <Camera className="size-3 text-accent" />
                <span>EXIF Telemetry</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="rounded bg-background/60 p-2.5 border border-border/40">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Camera
                  </div>
                  <div className="mt-1 text-foreground font-medium truncate">
                    {project.exif.camera}
                  </div>
                </div>

                <div className="rounded bg-background/60 p-2.5 border border-border/40">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Optics / Lens
                  </div>
                  <div className="mt-1 text-foreground font-medium truncate">
                    {project.exif.lens}
                  </div>
                </div>

                <div className="rounded bg-background/60 p-2.5 border border-border/40">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Exposure
                  </div>
                  <div className="mt-1 text-foreground font-medium">
                    {project.exif.shutter} · {project.exif.aperture}
                  </div>
                </div>

                <div className="rounded bg-background/60 p-2.5 border border-border/40">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Sensitivity
                  </div>
                  <div className="mt-1 text-foreground font-medium">{project.exif.iso}</div>
                </div>
              </div>

              {project.exif.colorStock && (
                <div className="mt-3 rounded bg-background/60 p-2.5 border border-border/40 flex items-center gap-2">
                  <Film className="size-3 text-accent shrink-0" />
                  <div className="text-[10px] font-mono text-muted-foreground truncate">
                    Stock: <span className="text-foreground">{project.exif.colorStock}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Nav Controls on Mobile */}
          <div className="mt-6 flex md:hidden items-center justify-between border-t border-border/40 pt-4">
            <button
              type="button"
              onClick={() => {
                sounds.lensTick();
                onPrev();
              }}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" /> PREV
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.lensTick();
                onNext();
              }}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              NEXT <ChevronRight className="size-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
