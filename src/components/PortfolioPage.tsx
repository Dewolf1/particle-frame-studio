import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Instagram, Camera, Sparkles, Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { CameraShatter, type CameraPhase } from "@/components/scene/CameraShatter";
import { CanvasBoundary, supportsWebGL } from "@/components/scene/WebGLFallback";
import { Header } from "@/components/navigation/Header";
import { MobileNavSheet } from "@/components/navigation/MobileNavSheet";
import { WorkGallery } from "@/components/portfolio/WorkGallery";
import { StillsMotionSplit } from "@/components/interactive/StillsMotionSplit";
import { GearVault } from "@/components/studio/GearVault";
import { DirectorBio } from "@/components/studio/DirectorBio";
import { ServicesSection } from "@/components/studio/ServicesSection";
import { FilmstripCarousel } from "@/components/interactive/FilmstripCarousel";
import { BookingConciergeModal } from "@/components/booking/BookingConciergeModal";
import { Toaster } from "@/components/ui/sonner";
import { sounds } from "@/lib/sound-effects";

const INSTAGRAM_URL = "https://www.instagram.com/paiman_wafa/";
const STUDIO_EMAIL = "contact@paimanwafa.com";

const HINT: Record<CameraPhase, string> = {
  assembling: "Optical Reassembly in progress…",
  idle: "Click camera to fracture into particles",
  exploded: "Click to reassemble optics",
};

export default function PortfolioPage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<CameraPhase>("idle");
  const [shattered, setShattered] = useState(false);
  const [ready, setReady] = useState(true);
  const [webgl, setWebgl] = useState(true);

  // Modals & Navigation state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const pointerStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handleToggleShatter = useCallback(() => {
    sounds.shutterClick();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // Safe fallback
      }
    }
    setShattered((current) => !current);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a, button, input, textarea")) return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (Math.hypot(e.clientX - pointerStart.current.x, e.clientY - pointerStart.current.y) > 8) {
      hasMoved.current = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a, button, input, textarea")) return;
    if (!hasMoved.current) {
      handleToggleShatter();
    }
  };

  const handlePhaseChange = useCallback((nextPhase: CameraPhase) => {
    setPhase(nextPhase);
    if (nextPhase === "assembling") {
      sounds.shutterWind();
    }
    if (nextPhase !== "exploded") {
      setShattered(false);
    }
  }, []);

  const handleReady = useCallback(() => {
    stageRef.current?.setAttribute("data-scene-ready", "");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!supportsWebGL()) {
      setWebgl(false);
      handleReady();
    }
  }, [handleReady]);

  const handleCopyEmail = () => {
    sounds.lensTick();
    navigator.clipboard.writeText(STUDIO_EMAIL);
    toast.success("Studio email copied to clipboard", {
      description: STUDIO_EMAIL,
    });
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-accent selection:text-background">
      {/* 35mm Celluloid Film Grain Texture Overlay */}
      <div className="film-grain" aria-hidden />

      {/* Persistent Frosted Header */}
      <Header
        onOpenBooking={() => {
          setSelectedService("");
          setBookingOpen(true);
        }}
        onOpenMobileNav={() => setMobileNavOpen(true)}
      />

      {/* Mobile Slide-out Drawer */}
      <MobileNavSheet
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpenBooking={() => {
          setSelectedService("");
          setBookingOpen(true);
        }}
      />

      {/* 3D Hero Section */}
      <section
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="vignette relative h-[100svh] min-h-[600px] overflow-hidden select-none"
      >
        {/* WebGL Canvas Background */}
        <div
          ref={stageRef}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          {webgl ? (
            <CanvasBoundary fallback={<div className="hero-glow absolute inset-0" aria-hidden />}>
              <Canvas
                flat
                dpr={[1, 2]}
                camera={{ position: [0, 0, 3.1], fov: 42 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              >
                <Suspense fallback={null}>
                  <ambientLight intensity={1.25} />
                  <directionalLight position={[3, 4, 5]} intensity={2.8} />
                  <directionalLight position={[-4, 1, -3]} intensity={1.4} color="#d6e2ff" />
                  <pointLight position={[0, 2.5, 2]} intensity={85} color="#ffb55c" />
                  <pointLight position={[0, -1.2, -2]} intensity={45} color="#ffaa44" />
                  <CameraShatter
                    shattered={shattered}
                    onPhaseChange={handlePhaseChange}
                    onReady={handleReady}
                  />
                </Suspense>
              </Canvas>
            </CanvasBoundary>
          ) : (
            <div className="hero-glow absolute inset-0" aria-hidden />
          )}
        </div>

        {/* Hero Editorial Content */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 sm:px-6 text-center">
          {/* Metadata pill badge */}
          <div
            className="animate-rise flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-4 py-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] text-accent backdrop-blur-md"
            style={{ animationDelay: "0.1s" }}
          >
            <Camera className="size-3" />
            <span>Photography · Cinematography · Post</span>
          </div>

          <h1
            className="animate-rise mt-4 sm:mt-6 font-serif font-normal text-[clamp(3.1rem,8vw,7.8rem)] leading-[0.96] tracking-[-0.03em] text-foreground"
            style={{ animationDelay: "0.25s" }}
          >
            Stories Told in
            <br />
            <span className="italic font-serif font-normal text-accent tracking-normal">
              Light &amp; Motion
            </span>
          </h1>

          <p
            className="animate-rise mt-4 sm:mt-6 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground/80 font-sans font-normal px-2"
            style={{ animationDelay: "0.4s" }}
          >
            A high-craft production studio for brands that want to be remembered. Sculpted with
            large-format glass, 35mm celluloid discipline, and uncompromising color science.
          </p>

          <div
            className="animate-rise pointer-events-auto mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            style={{ animationDelay: "0.55s" }}
          >
            <a
              href="#work"
              onClick={() => sounds.lensTick()}
              className="relative overflow-hidden rounded-full bg-foreground px-6 sm:px-7 py-3 sm:py-3.5 text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-background transition-all duration-300 hover:scale-105 hover:bg-accent hover:shadow-[0_0_25px_rgba(255,180,80,0.35)] active:scale-95"
            >
              Explore Portfolio
            </a>

            <button
              type="button"
              onClick={() => {
                sounds.shutterClick();
                setSelectedService("");
                setBookingOpen(true);
              }}
              className="rounded-full border border-border/80 bg-card/60 px-6 sm:px-7 py-3 sm:py-3.5 text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-foreground backdrop-blur-md transition-all duration-300 hover:border-accent hover:text-accent hover:scale-105 active:scale-95"
            >
              Initiate Project
            </button>
          </div>
        </div>

        {/* Interactive Camera Shatter Trigger Button & Indicator */}
        <div className="absolute inset-x-0 bottom-6 sm:bottom-8 z-20 flex flex-col items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handleToggleShatter}
            className="group animate-pulse-glow flex items-center gap-2 rounded-full border border-accent/40 bg-background/90 px-4 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] text-foreground backdrop-blur-md transition-all duration-300 hover:border-accent hover:scale-105 active:scale-95 shadow-xl"
          >
            <Sparkles className="size-3 text-accent group-hover:rotate-45 transition-transform duration-500" />
            <span>{HINT[phase]}</span>
          </button>
          <span className="scroll-line" aria-hidden />
        </div>
      </section>

      {/* Selected Work Gallery */}
      <WorkGallery />

      {/* Dual-Threat Interactive Stills vs Motion Reveal */}
      <StillsMotionSplit />

      {/* Studio Equipment Arsenal / Gear Vault */}
      <GearVault />

      {/* Director Profile & Artistic Statement */}
      <DirectorBio
        onOpenBooking={() => {
          setSelectedService("");
          setBookingOpen(true);
        }}
      />

      {/* Services & Deliverables */}
      <ServicesSection
        onSelectService={(service) => {
          setSelectedService(service);
          setBookingOpen(true);
        }}
      />

      {/* 35mm Filmstrip Daily Frames Carousel */}
      <FilmstripCarousel />

      {/* Contact & Commission Section */}
      <section id="contact" className="mx-auto max-w-5xl px-6 py-28 md:py-36 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-accent mb-6">
          <Mail className="size-3" />
          <span>Worldwide Commissions & Bookings</span>
        </div>

        <h2 className="font-serif font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight text-foreground">
          Let&apos;s Make Something
          <br />
          <span className="italic font-serif font-normal text-accent tracking-normal">
            Worth Watching.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground/85 font-sans font-normal md:text-base">
          Now booking commercial campaigns, editorial stills, and cinema productions for the coming
          season. Tell us about the atmosphere you envision.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              sounds.shutterClick();
              setSelectedService("");
              setBookingOpen(true);
            }}
            className="rounded-full bg-accent px-8 py-4 text-xs font-sans font-medium uppercase tracking-[0.2em] text-background shadow-2xl transition-transform hover:scale-105"
          >
            Start a Commission
          </button>

          <button
            type="button"
            onClick={handleCopyEmail}
            className="flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-6 py-4 text-xs font-sans font-medium uppercase tracking-[0.18em] text-foreground backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
          >
            <Copy className="size-3.5" />
            <span>Copy {STUDIO_EMAIL}</span>
          </button>
        </div>
      </section>

      {/* Persistent Footer */}
      <footer className="border-t border-border/50 bg-card/30 px-6 py-12 text-center text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-heading font-extrabold text-base sm:text-lg tracking-[0.12em] uppercase text-foreground">
              Paiman Wafa<span className="text-accent">.</span>
            </span>
            <span className="text-border">|</span>
            <span className="text-[10px] font-sans font-medium">Photography · Film · Post</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#work"
              onClick={() => sounds.lensTick()}
              className="text-[10px] hover:text-foreground transition-colors"
            >
              Work
            </a>
            <a
              href="#arsenal"
              onClick={() => sounds.lensTick()}
              className="text-[10px] hover:text-foreground transition-colors"
            >
              Arsenal
            </a>
            <a
              href="#services"
              onClick={() => sounds.lensTick()}
              className="text-[10px] hover:text-foreground transition-colors"
            >
              Services
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => sounds.lensTick()}
              className="text-muted-foreground transition-colors hover:text-accent flex items-center gap-1.5"
            >
              <Instagram className="size-3.5" />
              <span className="text-[10px]">@paiman_wafa</span>
            </a>
          </div>

          <div className="text-[10px] text-muted-foreground/80">
            © 2026 Paiman Wafa. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Interactive Booking Concierge Dialog */}
      <BookingConciergeModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preselectedService={selectedService}
      />

      {/* Toast Notifications Provider */}
      <Toaster position="bottom-right" />
    </div>
  );
}
