import { Award, MapPin } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

interface DirectorBioProps {
  onOpenBooking: () => void;
}

export function DirectorBio({ onOpenBooking }: DirectorBioProps) {
  return (
    <section className="border-t border-border/40 bg-card/20 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Portrait with Viewfinder Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-border/70 bg-card p-2 sm:p-3 shadow-2xl viewfinder-corner viewfinder-corner-tl viewfinder-corner-tr viewfinder-corner-bl viewfinder-corner-br card-hover-luxury group">
              <img
                src="/photos/frame-1.jpg"
                alt="Paiman Wafa — Director & Cinematographer"
                className="aspect-[9/13] sm:aspect-[4/5] w-full rounded-xl object-cover filter contrast-105 transition-transform duration-700 ease-out group-hover:scale-103"
              />

              {/* Viewfinder Telemetry Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-lg bg-black/60 px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-white/80 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span>DIRECTOR / DP</span>
                </div>
                <span>PAIMAN WAFA</span>
              </div>
            </div>
          </div>

          {/* Philosophy & Artist Statement */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-accent">
              <Award className="size-3" />
              <span>Vision & Philosophy</span>
            </div>

            <h2 className="mt-4 font-serif font-normal text-3xl sm:text-5xl md:text-6xl text-foreground leading-[1.04] tracking-tight">
              Light is Not Just Illumination.
              <br />
              <span className="italic font-serif font-normal text-accent">It is Emotion.</span>
            </h2>

            <p className="mt-6 text-sm md:text-base leading-relaxed text-muted-foreground/85 font-sans font-normal">
              Directed by photographer and filmmaker Paiman Wafa, the studio approaches every
              production as a bespoke optical sculpture. We merge the classical discipline of 35mm
              celluloid film, large-format optics, and physical lighting craftsmanship with modern
              digital post-production.
            </p>

            <p className="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground/85 font-sans font-normal">
              Whether capturing the still quietude of an editorial portrait or directing dynamic
              commercial automotive choreography, our singular objective remains uncompromised:
              crafting frames that linger long after the projector dims.
            </p>

            {/* Quick Stats Grid */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-border/40 py-6">
              <div>
                <div className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight">
                  10+ Years
                </div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mt-1">
                  Optical Craftsmanship
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-heading font-bold text-accent tracking-tight">
                  35mm & 8K
                </div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mt-1">
                  Cine Native Formats
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight flex items-center gap-1.5">
                  <MapPin className="size-4 text-accent" />
                  <span>Worldwide</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mt-1">
                  Commission Availability
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  sounds.shutterClick();
                  onOpenBooking();
                }}
                className="rounded-full bg-foreground px-8 py-3.5 text-xs font-sans font-medium uppercase tracking-[0.18em] text-background transition-transform hover:scale-105 hover:bg-accent"
              >
                Inquire For Production
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
