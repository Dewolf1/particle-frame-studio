import { CheckCircle2, ArrowRight } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

const SERVICES = [
  {
    number: "01",
    title: "Still Photography",
    tagline: "Editorial, Campaign Key Art & Fine Portraits",
    body: "Composed with painterly lighting and optical discipline. We create images tailored for high-fashion print, luxury billboards, digital lookbooks, and high-engagement brand feeds.",
    deliverables: [
      "Medium-Format / 60MP High-Resolution Masters",
      "Full Commercial & Global Usage Licensing",
      "Bespoke Frequency-Separation Retouching",
      "On-Set Tethered Review & Digital Tech Rigs",
    ],
  },
  {
    number: "02",
    title: "Film & Motion Direction",
    tagline: "Brand Films, Commercials & Music Videos",
    body: "Directed end-to-end from conceptual treatment to cinematic picture lock. We bring the emotional weight of 35mm film and anamorphic glass to modern moving images.",
    deliverables: [
      "Cinema 4K / 8K Master Deliverables in ProRes 4444",
      "Multi-Aspect Optimization (16:9 Cinema, 9:16 Social)",
      "Full Camera, Lighting & Soundstage Crew Direction",
      "Dynamic Vehicle Tracking & Gimbal Cinematography",
    ],
  },
  {
    number: "03",
    title: "Post-Production & Color",
    tagline: "DaVinci Resolve Grade, Sound & Film Finishing",
    body: "The invisible artistry that separates raw footage from an unforgettable film. Analog film grain modeling, surgical color grading, and atmospheric sound design.",
    deliverables: [
      "Custom Film Emulation LUTs (Kodak / Fuji stocks)",
      "ACES Color-Managed Pipeline & HDR Mastering",
      "Foley, Spatial Audio Mixing & Score Synchronization",
      "Online Finishing, Title Design & Conform",
    ],
  },
];

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  return (
    <section id="services" className="border-y border-border/60 bg-card/40 py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-16 max-w-2xl">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-accent font-medium">
            Capabilities & Deliverables
          </p>
          <h2 className="mt-3 font-serif font-normal text-3xl sm:text-5xl md:text-6xl text-foreground tracking-tight">
            Crafted for Brands That{" "}
            <span className="italic font-serif font-normal text-accent">Refuse</span> to Be Ignored
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground/85 font-sans font-normal leading-relaxed">
            Every project is executed with bespoke optical packages and rigorous post-production to
            ensure your brand narrative cuts through the noise.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.number}
              className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card/60 p-8 card-hover-luxury hover:bg-card"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent font-medium">
                    {s.number} // CAPABILITY
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <h3 className="mt-6 font-serif font-normal text-3xl text-foreground">{s.title}</h3>
                <p className="mt-2 text-xs font-sans font-semibold uppercase tracking-[0.14em] text-accent/90">
                  {s.tagline}
                </p>
                <p className="mt-4 text-xs md:text-sm font-sans font-normal leading-relaxed text-muted-foreground/85">
                  {s.body}
                </p>

                {/* Deliverables Checklist */}
                <div className="mt-6 space-y-2.5 border-t border-border/40 pt-5">
                  <div className="text-[10px] font-sans font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Included Deliverables:
                  </div>
                  {s.deliverables.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5 text-xs font-sans text-foreground/85"
                    >
                      <CheckCircle2 className="size-3.5 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission CTA button */}
              <button
                type="button"
                onClick={() => {
                  sounds.shutterClick();
                  onSelectService(s.title);
                }}
                className="mt-8 flex items-center justify-between w-full rounded-lg border border-border/60 bg-background/60 px-4 py-3 text-xs font-sans font-medium uppercase tracking-[0.16em] text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <span>Inquire Discipline</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
