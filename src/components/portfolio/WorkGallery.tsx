import { useState } from "react";
import { Play, Eye, Filter, ArrowUpRight } from "lucide-react";
import { sounds } from "@/lib/sound-effects";
import { ProjectLightbox, type ProjectItem } from "./ProjectLightbox";

const PROJECTS: ProjectItem[] = [
  {
    id: "aura-of-dawn",
    title: "Aura of Dawn",
    category: "stills",
    categoryLabel: "Editorial — Fashion Still",
    client: "Celine Paris",
    year: "2026",
    src: "/photos/frame-1.jpg",
    aspectRatio: "portrait",
    exif: {
      camera: "Leica M11 Monochrom",
      lens: "Summilux-M 35mm f/1.4",
      shutter: "1/500s",
      aperture: "f/1.4",
      iso: "ISO 200",
      colorStock: "Ilford HP5 Plus 400 Tone Curve",
    },
    summary:
      "Captured during the magic hour with directional tungsten backlighting and natural ambient skylight to craft sculpted facial contouring.",
  },
  {
    id: "velocity-shadow",
    title: "Velocity & Shadow",
    category: "motion",
    categoryLabel: "Commercial Film — Automotive",
    client: "Porsche Design",
    year: "2026",
    src: "/photos/frame-2.jpg",
    aspectRatio: "portrait",
    exif: {
      camera: "ARRI Alexa 35",
      lens: "Cooke Anamorphic /i 50mm T2.3",
      shutter: "1/48s (180°)",
      aperture: "T2.8",
      iso: "ISO 800",
      colorStock: "Kodak Vision3 500T 5219 Emulation",
    },
    summary:
      "A cinematic nocturnal study exploring speed lines, anamorphic horizontal flares, and low-frequency engine vibrations through Tokyo tunnels.",
  },
  {
    id: "the-atelier",
    title: "The Atelier",
    category: "bts",
    categoryLabel: "Behind The Scenes",
    client: "Bottega Veneta",
    year: "2026",
    src: "/photos/frame-3.jpg",
    aspectRatio: "portrait",
    exif: {
      camera: "Sony FX3",
      lens: "Sony FE 24-70mm f/2.8 GM II",
      shutter: "1/250s",
      aperture: "f/2.8",
      iso: "ISO 640",
      colorStock: "S-Cinetone Neutral Profile",
    },
    summary:
      "Documenting high-precision production choreography, lighting grip rigs, and the raw tension between takes on a 35mm celluloid feature set.",
  },
  {
    id: "nocturne-solitude",
    title: "Nocturne Solitude",
    category: "stills",
    categoryLabel: "Portrait — Chiaroscuro",
    client: "Kinfolk Magazine",
    year: "2026",
    src: "/photos/frame-4.jpg",
    aspectRatio: "portrait",
    exif: {
      camera: "Hasselblad X2D 100C",
      lens: "XCD 80mm f/1.9",
      shutter: "1/160s",
      aperture: "f/2.0",
      iso: "ISO 100",
      colorStock: "Natural Color Solution (HNCS)",
    },
    summary:
      "Chiaroscuro study balancing deep obsidian shadows and warm golden keylight, sculpting micro-expressions with medium-format depth.",
  },
  {
    id: "chromatic-drift",
    title: "Chromatic Drift",
    category: "motion",
    categoryLabel: "Brand Motion Film",
    client: "Aether Dynamics",
    year: "2026",
    src: "/photos/frame-5.jpg",
    aspectRatio: "portrait",
    exif: {
      camera: "RED V-Raptor 8K VV",
      lens: "Zeiss Supreme Prime 35mm T1.5",
      shutter: "1/96s (120fps)",
      aperture: "T2.0",
      iso: "ISO 400",
      colorStock: "IPP2 REDWideGamutRGB",
    },
    summary:
      "High-speed 120fps tracking capturing aerodynamic motion blur and dynamic lighting reflections across tailored textile surfaces.",
  },
  {
    id: "mirage-horizon",
    title: "Mirage Horizon",
    category: "stills",
    categoryLabel: "Fine Art — Editorial",
    client: "Vogue Scandinavia",
    year: "2026",
    src: "/photos/frame-6.jpg",
    aspectRatio: "portrait",
    exif: {
      camera: "Leica SL2-S",
      lens: "Summicron-SL 50mm f/2.0",
      shutter: "1/320s",
      aperture: "f/2.0",
      iso: "ISO 125",
      colorStock: "Kodak Portra 160 Emulation",
    },
    summary:
      "Atmospheric natural light portrait evoking ethereal solitude, photographed in diffused morning coastal mist.",
  },
  {
    id: "golden-hour-pulse",
    title: "Golden Hour Pulse",
    category: "motion",
    categoryLabel: "Cinematic Music Film",
    client: "Sony Music Global",
    year: "2026",
    src: "/photos/frame-7.jpg",
    aspectRatio: "portrait",
    exif: {
      camera: "ARRI Alexa Mini LF",
      lens: "Master Anamorphic 40mm T1.9",
      shutter: "1/48s",
      aperture: "T2.4",
      iso: "ISO 800",
      colorStock: "Kodak 2383 Print Tone",
    },
    summary:
      "Warm tungsten rim lighting combined with anamorphic optical characteristics, capturing intimate musical expression with cinematic weight.",
  },
  {
    id: "sculpted-silence",
    title: "Sculpted Silence",
    category: "stills",
    categoryLabel: "Editorial Lookbook",
    client: "Yohji Yamamoto Archive",
    year: "2026",
    src: "/photos/frame-8.jpg",
    aspectRatio: "portrait",
    exif: {
      camera: "Leica M11",
      lens: "Noctilux-M 50mm f/0.95 ASPH",
      shutter: "1/1000s",
      aperture: "f/0.95",
      iso: "ISO 64",
      colorStock: "Kodak Tri-X 400 Black & White",
    },
    summary:
      "Razor-thin depth of field with creamy optical bokeh, elevating garment texture and anatomical silhouette to fine art.",
  },
];

type CategoryFilter = "all" | "stills" | "motion" | "bts";

const CATEGORIES: { label: string; value: CategoryFilter }[] = [
  { label: "All Works", value: "all" },
  { label: "Editorial Stills", value: "stills" },
  { label: "Cinematography & Film", value: "motion" },
  { label: "Behind The Scenes", value: "bts" },
];

export function WorkGallery() {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const filteredProjects =
    filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  const activeIndex = activeProject ? PROJECTS.findIndex((p) => p.id === activeProject.id) : -1;

  const handleNext = () => {
    if (activeIndex >= 0) {
      const nextIndex = (activeIndex + 1) % PROJECTS.length;
      setActiveProject(PROJECTS[nextIndex] || null);
    }
  };

  const handlePrev = () => {
    if (activeIndex >= 0) {
      const prevIndex = (activeIndex - 1 + PROJECTS.length) % PROJECTS.length;
      setActiveProject(PROJECTS[prevIndex] || null);
    }
  };

  return (
    <section id="work" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28 lg:px-12">
      {/* Header & Category Controls */}
      <div className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6 md:pb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
            <Filter className="size-3" />
            <span>Curated Portfolio</span>
          </div>
          <h2 className="mt-2 md:mt-3 font-serif font-normal text-3xl sm:text-5xl md:text-6xl text-foreground tracking-tight">
            Frames That <span className="italic font-serif font-normal text-accent">Linger</span>
          </h2>
        </div>

        {/* Filter Tabs - Horizontal Scroll on Mobile */}
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                sounds.lensTick();
                setFilter(cat.value);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-sans font-medium uppercase tracking-[0.16em] transition-all duration-300 ${
                filter === cat.value
                  ? "bg-foreground text-background shadow-md scale-102"
                  : "border border-border/60 bg-card/40 text-muted-foreground hover:border-accent hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asymmetric Gallery Grid - Optimized for Mobile & Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            onClick={() => {
              sounds.shutterClick();
              setActiveProject(project);
            }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-500 hover:border-accent hover:shadow-[0_0_35px_rgba(255,180,80,0.22)] hover:-translate-y-1.5 active:scale-[0.98]"
          >
            {/* Media Container with 9:14 Portrait Ratio to show off vertical photos */}
            <div className="relative overflow-hidden aspect-[9/14] w-full bg-background">
              <img
                src={project.src}
                alt={project.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 filter brightness-95 group-hover:brightness-105"
              />

              {/* Viewfinder Edge Accents */}
              <div className="pointer-events-none absolute inset-3 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Film Stock & Category Pill */}
              <div className="absolute top-3 left-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[9px] font-mono uppercase tracking-widest text-white/90 backdrop-blur-md border border-white/10 shadow-lg transition-transform duration-300 group-hover:-translate-y-0.5">
                {project.categoryLabel}
              </div>

              {/* Hover / Tap Overlay HUD */}
              <div className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-background/95 via-background/40 to-transparent p-5 opacity-0 transition-all duration-400 group-hover:opacity-100">
                <div className="flex justify-end">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-background shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 shadow-[0_0_20px_rgba(255,180,80,0.4)]">
                    {project.category === "motion" ? (
                      <Play className="size-4 fill-background translate-x-0.5" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-accent">
                    {project.exif.camera}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <h3 className="font-serif font-normal text-2xl text-foreground">
                      {project.title}
                    </h3>
                    <ArrowUpRight className="size-4 text-accent" />
                  </div>
                  <p className="mt-1 text-xs font-sans text-muted-foreground/90 line-clamp-2 leading-relaxed">
                    {project.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Caption Card */}
            <div className="flex items-center justify-between p-3.5 text-xs font-sans border-t border-border/40 bg-card/60">
              <span className="text-foreground font-medium truncate max-w-[70%] tracking-tight">
                {project.title}
              </span>
              <span className="text-accent shrink-0 font-mono text-[10px] tracking-wider">
                {project.year}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Lightbox Modal */}
      <ProjectLightbox
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </section>
  );
}
