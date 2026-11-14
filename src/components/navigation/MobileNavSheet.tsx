import { X, Instagram, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

interface MobileNavSheetProps {
  open: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

const NAV_LINKS = [
  { label: "Selected Work", href: "#work", desc: "Still & film portfolios" },
  { label: "Dual-Threat", href: "#dual-threat", desc: "Interactive still vs motion" },
  { label: "Studio Arsenal", href: "#arsenal", desc: "Cinema cameras & optics" },
  { label: "Services & Scope", href: "#services", desc: "Commercial & editorial" },
  { label: "Instagram Journal", href: "#instagram", desc: "Daily captured frames" },
  { label: "Direct Inquiries", href: "#contact", desc: "Commissions & bookings" },
];

const INSTAGRAM_URL = "https://www.instagram.com/paiman_wafa/";

export function MobileNavSheet({ open, onClose, onOpenBooking }: MobileNavSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-background/95 backdrop-blur-2xl p-6 md:hidden animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <span className="font-heading font-extrabold text-xl tracking-[0.12em] uppercase text-foreground">
            Paiman Wafa<span className="text-accent">.</span>
          </span>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[8px] font-mono uppercase tracking-[0.2em] text-accent">
            MENU
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            sounds.lensTick();
            onClose();
          }}
          aria-label="Close navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="my-auto flex flex-col gap-5 py-6">
        {NAV_LINKS.map((item, idx) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => {
              sounds.lensTick();
              onClose();
            }}
            className="group flex items-center justify-between border-b border-border/30 pb-3"
          >
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-accent/80">
                0{idx + 1}
              </div>
              <div className="font-serif font-normal text-3xl text-foreground transition-transform group-hover:translate-x-1">
                {item.label}
              </div>
              <div className="text-xs font-sans text-muted-foreground/80 mt-0.5">{item.desc}</div>
            </div>
            <ArrowRight className="size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-accent" />
          </a>
        ))}
      </nav>

      {/* Footer & Actions */}
      <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
        <button
          type="button"
          onClick={() => {
            onClose();
            sounds.shutterClick();
            onOpenBooking();
          }}
          className="flex w-full items-center justify-center rounded-full bg-foreground py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-background shadow-lg transition-transform hover:scale-102"
        >
          Start a Commission
        </button>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-accent"
          >
            <Instagram className="size-4" />
            <span>@paiman_wafa</span>
          </a>
          <button
            type="button"
            onClick={() => sounds.toggleMute()}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider"
          >
            {sounds.muted ? (
              <VolumeX className="size-3.5" />
            ) : (
              <Volume2 className="size-3.5 text-accent" />
            )}
            <span>{sounds.muted ? "Sound Off" : "Sound On"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
