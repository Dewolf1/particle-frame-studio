import { useEffect, useState } from "react";
import { Instagram, Volume2, VolumeX, Menu } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenMobileNav: () => void;
}

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Dual-Threat", href: "#dual-threat" },
  { label: "Arsenal", href: "#arsenal" },
  { label: "Services", href: "#services" },
  { label: "Journal", href: "#instagram" },
  { label: "Contact", href: "#contact" },
];

const INSTAGRAM_URL = "https://www.instagram.com/paiman_wafa/";

export function Header({ onOpenBooking, onOpenMobileNav }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [muted, setMuted] = useState(sounds.muted);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 px-6 py-4 md:px-12 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/50 py-3 shadow-2xl"
          : "bg-gradient-to-b from-background via-background/60 to-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo & Camera HUD Status */}
        <div className="flex items-center gap-5">
          <a
            href="#"
            className="group flex items-center font-heading font-extrabold text-lg sm:text-xl tracking-[0.12em] uppercase text-foreground transition-transform hover:scale-102"
            onClick={() => sounds.lensTick()}
          >
            Paiman Wafa
            <span className="text-accent transition-colors group-hover:text-foreground">.</span>
          </a>

          {/* Telemetry Badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-foreground/90 font-medium">REC</span>
            <span className="text-border">|</span>
            <span>AVAILABLE 2026 COMMISSIONS</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => sounds.lensTick()}
              className="relative text-[11px] font-sans font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-0 after:bg-accent after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Controls & CTA */}
        <div className="flex items-center gap-4">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/40 text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            title={muted ? "Sound Effects: OFF" : "Sound Effects: ON"}
          >
            {muted ? (
              <VolumeX className="size-3.5 opacity-60" strokeWidth={1.5} />
            ) : (
              <Volume2 className="size-3.5 text-accent" strokeWidth={1.5} />
            )}
          </button>

          {/* Instagram Link */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            onClick={() => sounds.lensTick()}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/40 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <Instagram className="size-3.5" strokeWidth={1.5} />
          </a>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => {
              sounds.shutterClick();
              onOpenBooking();
            }}
            className="rounded-full bg-foreground px-5 py-2 text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-background transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-foreground shadow-lg"
          >
            Book Shoot
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => {
              sounds.lensTick();
              onOpenMobileNav();
            }}
            aria-label="Open mobile navigation menu"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/60 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Menu className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
