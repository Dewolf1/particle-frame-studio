import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Instagram } from "lucide-react";
import { CameraParticles } from "@/components/scene/CameraParticles";
import { CanvasBoundary, supportsWebGL } from "@/components/scene/WebGLFallback";
import type { ParticlePhase, ParticleSim } from "@/game/particle-sim";
import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";
import insta1 from "@/assets/insta-1.jpg";
import insta2 from "@/assets/insta-2.jpg";
import insta3 from "@/assets/insta-3.jpg";

const INSTAGRAM_URL = "https://instagram.com/lumen.studio";
const INSTAGRAM_HANDLE = "@lumen.studio";

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const HINT: Record<ParticlePhase, string> = {
  assembling: "Assembling…",
  idle: "Click the camera to shatter it",
  exploded: "Click to reassemble",
};

const WORKS = [
  { src: work1, title: "Afterglow", kind: "Portrait — Still" },
  { src: work2, title: "Night Frequency", kind: "Street — Film" },
  { src: work3, title: "On Set", kind: "Behind the Scenes" },
];

const INSTA_POSTS = [
  { src: work1, alt: "Studio portrait in amber light" },
  { src: insta1, alt: "On set with the cinema camera" },
  { src: insta2, alt: "Dancer in motion blur" },
  { src: insta3, alt: "Vintage lens catching flares" },
  { src: work2, alt: "Night street frames" },
  { src: work3, alt: "Behind the scenes" },
];

const SERVICES = [
  {
    title: "Still Photography",
    body: "Portraits, campaigns and editorial sets — composed for print, feed and billboard alike.",
  },
  {
    title: "Film & Motion",
    body: "Brand films, music videos and documentaries, directed end to end from concept to final cut.",
  },
  {
    title: "Post-Production",
    body: "Edit, grade and sound design. The polish that separates footage from a finished film.",
  },
];

export default function PortfolioPage() {
  const simRef = useRef<ParticleSim | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<ParticlePhase>("assembling");
  const [ready, setReady] = useState(false);

  const handleSim = useCallback((sim: ParticleSim | null) => {
    simRef.current = sim;
    if (sim) {
      sim.onPhaseChange = () => setPhase(sim.phase);
      setPhase(sim.phase);
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    simRef.current?.toggle();
  }, []);

  const handleReady = useCallback(() => {
    stageRef.current?.setAttribute("data-scene-ready", "");
    setReady(true);
  }, []);

  const [webgl, setWebgl] = useState(true);
  useEffect(() => {
    if (!supportsWebGL()) {
      setWebgl(false);
      handleReady();
    }
  }, [handleReady]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b from-background via-background/60 to-transparent px-6 py-5 md:px-12">
        <a href="#" className="font-display text-xl tracking-wide">
          Lumen<span className="text-accent">.</span>
        </a>
        <nav className="flex items-center gap-6 md:gap-10">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="text-muted-foreground transition-colors hover:text-accent"
          >
            <Instagram className="size-4" strokeWidth={1.5} />
          </a>
        </nav>
      </header>

      <section
        className="vignette relative h-[100svh] min-h-[600px] overflow-hidden"
        onPointerDown={handlePointerDown}
      >
        <div
          ref={stageRef}
          className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          {webgl ? (
            <CanvasBoundary
              fallback={<div className="hero-glow absolute inset-0" aria-hidden />}
            >
              <Canvas
                flat
                dpr={[1, 2]}
                camera={{ position: [0, 0, 3.1], fov: 42 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              >
                <Suspense fallback={null}>
                  <CameraParticles onSim={handleSim} onReady={handleReady} />
                </Suspense>
              </Canvas>
            </CanvasBoundary>
          ) : (
            <div className="hero-glow absolute inset-0" aria-hidden />
          )}
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="animate-rise text-[11px] uppercase tracking-[0.4em] text-muted-foreground" style={{ animationDelay: "0.1s" }}>
            Photography · Film · Post
          </p>
          <h1
            className="animate-rise mt-6 font-display text-[clamp(3.2rem,9vw,7.5rem)] leading-[0.95]"
            style={{ animationDelay: "0.25s" }}
          >
            Stories told in
            <br />
            <em className="text-accent">light &amp; motion</em>
          </h1>
          <p
            className="animate-rise mt-8 max-w-xl text-sm text-muted-foreground md:text-base"
            style={{ animationDelay: "0.4s" }}
          >
            A photography and film studio for brands that want to be remembered — captured as
            stills, or set in motion.
          </p>
          <div
            className="animate-rise pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: "0.55s" }}
          >
            <a
              href="#work"
              className="rounded-full bg-foreground px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-transform hover:scale-105"
            >
              View work
            </a>
            <a
              href="#contact"
              className="rounded-full border border-border px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:border-foreground"
            >
              Start a project
            </a>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            {HINT[phase]}
          </span>
          <span className="scroll-line" aria-hidden />
        </div>
      </section>

      <section id="work" className="mx-auto max-w-6xl px-6 py-28 md:px-12">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              Selected work
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl">Frames that linger</h2>
          </div>
          <span className="hidden text-[11px] uppercase tracking-[0.25em] text-muted-foreground md:block">
            Full portfolio on request
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {WORKS.map((w) => (
            <figure
              key={w.title}
              className="group overflow-hidden rounded-xl border border-border/60 bg-card"
            >
              <img
                src={w.src}
                alt={w.title}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <figcaption className="flex items-center justify-between p-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>{w.title}</span>
                <span className="text-accent">{w.kind}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="instagram" className="mx-auto max-w-6xl px-6 pb-4 pt-28 md:px-12">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
              Instagram
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl">Daily frames</h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
          >
            <Instagram className="size-4" strokeWidth={1.5} />
            {INSTAGRAM_HANDLE}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {INSTA_POSTS.map((post) => (
            <a
              key={post.src}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="group relative block overflow-hidden rounded-xl border border-border/60 bg-card"
            >
              <img
                src={post.src}
                alt={post.alt}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <Instagram className="size-6 text-accent" strokeWidth={1.5} />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section id="services" className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-3 md:px-12">
          {SERVICES.map((s) => (
            <div key={s.title}>
              <h3 className="font-display text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-4xl px-6 py-32 text-center">
        <h2 className="font-display text-5xl leading-tight md:text-7xl">
          Let&apos;s make something
          <br />
          <em className="text-accent">worth watching.</em>
        </h2>
        <p className="mt-6 text-sm text-muted-foreground md:text-base">
          Booking commissions for the coming season. Tell us about the story you want to tell.
        </p>
        <a
          href="mailto:hello@lumen.studio"
          className="mt-10 inline-flex rounded-full bg-foreground px-8 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-transform hover:scale-105"
        >
          hello@lumen.studio
        </a>
      </section>

      <footer className="border-t border-border/60 px-6 py-8 text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        <div className="mb-4 flex justify-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="text-muted-foreground transition-colors hover:text-accent"
          >
            <Instagram className="size-4" strokeWidth={1.5} />
          </a>
        </div>
        © 2026 Lumen Studio — Photography &amp; Film
      </footer>
    </div>
  );
}
