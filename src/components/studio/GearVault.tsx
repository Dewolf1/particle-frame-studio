import { useState } from "react";
import { Camera, Film, Sparkles, MonitorPlay } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

interface GearItem {
  name: string;
  category: "cameras" | "optics" | "lighting" | "post";
  make: string;
  specs: string;
  character: string;
  bestFor: string;
}

const GEAR_DATA: GearItem[] = [
  {
    name: "ALEXA 35",
    category: "cameras",
    make: "ARRI Cine",
    specs: "Super 35 4.6K Sensor · 17 Stops Dynamic Range · REVEAL Color Science",
    character:
      "The gold standard for cinematic organic texture, rolling highlight rolloff, and lifelike skin tones.",
    bestFor: "Commercials, Narrative Features, High-End Music Videos",
  },
  {
    name: "M11 Monochrom",
    category: "cameras",
    make: "Leica Camera",
    specs: "60MP BSI Full-Frame CMOS · Dedicated B&W Sensor · ISO 125–200,000",
    character:
      "Zero color filter array ensures uncompromising luminance sharpness, micro-contrast, and tonal depth.",
    bestFor: "Editorial Portraits, Architecture, Fine-Art Campaigns",
  },
  {
    name: "V-Raptor 8K VV",
    category: "cameras",
    make: "RED Digital Cinema",
    specs: "8K Full-Format Multi-Aspect · 120fps at 8K · REDCODE RAW 16-bit",
    character:
      "Ultra-high resolution and extreme frame rates for dynamic automotive tracking and VFX backplates.",
    bestFor: "High-Speed Commercials, Sports, Automotive Film",
  },
  {
    name: "Anamorphic /i Full Frame Plus (32–100mm)",
    category: "optics",
    make: "Cooke Optics",
    specs: "T2.3 Fast Aperture · 1.8x Oval Bokeh Squeeze · Anamorphic Flares",
    character:
      "The legendary 'Cooke Look'—warm, painterly organic falloff with controlled cinematic horizontal flares.",
    bestFor: "Cinematic Narrative & Atmospheric Commercials",
  },
  {
    name: "Summilux-M 35mm & 50mm f/1.4 ASPH",
    category: "optics",
    make: "Leica Optics",
    specs: "Fast f/1.4 Aperture · Floating Elements · 11-Blade Iris",
    character:
      "Chiseled subject isolation with butter-smooth background transitions; unmatched vintage micro-contrast.",
    bestFor: "Intimate Editorial Stills & Fashion Lookbooks",
  },
  {
    name: "Titan Tube & Aputure Electro Storm Rigs",
    category: "lighting",
    make: "Astera & Aputure",
    specs: "RGBAM 2000K–10000K · Wireless CRMX Control · 98+ TLCI Rating",
    character:
      "Tunable full-spectrum fixtures delivering precision directional modeling without harsh digital artifacts.",
    bestFor: "Soundstage Key Art & Complex Practical Sets",
  },
  {
    name: "DaVinci Resolve Studio Advanced Surface",
    category: "post",
    make: "Blackmagic Design",
    specs: "Hardware Trackballs · OLED Reference Monitors · ACES / HDR Workflow",
    character:
      "Node-based color grading pipeline with custom analog film-print grain emulations (Kodak 2383 / Fuji 3513).",
    bestFor: "Final Cinema Color Master & Film Print Transfers",
  },
];

type GearCategory = "all" | "cameras" | "optics" | "lighting" | "post";

const CATEGORIES: { label: string; value: GearCategory; icon: typeof Camera }[] = [
  { label: "All Arsenal", value: "all", icon: Sparkles },
  { label: "Cinema Bodies", value: "cameras", icon: Camera },
  { label: "Optical Glass", value: "optics", icon: Film },
  { label: "Lighting & Grip", value: "lighting", icon: Sparkles },
  { label: "Post & Color Suite", value: "post", icon: MonitorPlay },
];

export function GearVault() {
  const [activeCat, setActiveCat] = useState<GearCategory>("all");

  const filteredGear =
    activeCat === "all" ? GEAR_DATA : GEAR_DATA.filter((g) => g.category === activeCat);

  return (
    <section id="arsenal" className="mx-auto max-w-7xl px-6 py-28 md:px-12">
      <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-accent">
            <Camera className="size-3" />
            <span>Studio Equipment Pedigree</span>
          </div>
          <h2 className="mt-3 font-serif font-normal text-3xl sm:text-5xl md:text-6xl text-foreground tracking-tight">
            The Production{" "}
            <span className="italic font-serif font-normal text-accent">Arsenal</span>
          </h2>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  sounds.lensTick();
                  setActiveCat(cat.value);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-sans font-medium uppercase tracking-[0.16em] transition-all duration-300 ${
                  activeCat === cat.value
                    ? "bg-foreground text-background shadow-md"
                    : "border border-border/60 bg-card/40 text-muted-foreground hover:border-accent hover:text-foreground"
                }`}
              >
                <Icon className="size-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGear.map((item) => (
          <div
            key={item.name}
            className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm card-hover-luxury"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <span className="text-accent">{item.make}</span>
                <span>{item.category}</span>
              </div>

              <h3 className="mt-3 font-heading font-bold text-xl text-foreground group-hover:text-accent transition-colors tracking-tight">
                {item.name}
              </h3>

              <p className="mt-2 text-xs font-mono text-foreground/80 leading-relaxed border-y border-border/40 py-2.5 my-3 tracking-normal">
                {item.specs}
              </p>

              <p className="text-xs md:text-sm font-sans font-normal text-muted-foreground/90 leading-relaxed">
                {item.character}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span className="uppercase tracking-[0.16em]">Application</span>
              <span className="font-sans text-xs text-foreground/90 font-medium truncate max-w-[65%]">
                {item.bestFor}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
