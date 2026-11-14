import { useState } from "react";
import { X, Check, Copy, ArrowRight, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { sounds } from "@/lib/sound-effects";

interface BookingConciergeModalProps {
  open: boolean;
  onClose: () => void;
  preselectedService?: string;
}

const DISCIPLINES = [
  "Still Photography (Campaign & Editorial)",
  "Film & Motion Direction (Commercial / Narrative)",
  "Post-Production & Color (DaVinci Resolve)",
  "Full Brand Campaign (Stills + Motion Package)",
];

const TIMELINES = [
  "Immediate (Within 2–4 Weeks)",
  "Coming Season (1–3 Months)",
  "Flexible / Concept Exploration",
];

const BUDGETS = [
  "$5,000 – $10,000 (Editorial / Local Campaign)",
  "$10,000 – $25,000 (Commercial Stills + Video)",
  "$25,000+ (Full Production / Cinema Campaign)",
];

const STUDIO_EMAIL = "contact@paimanwafa.com";

export function BookingConciergeModal({
  open,
  onClose,
  preselectedService,
}: BookingConciergeModalProps) {
  const [step, setStep] = useState<number>(1);
  const [discipline, setDiscipline] = useState<string>(preselectedService || DISCIPLINES[0] || "");
  const [timeline, setTimeline] = useState<string>(TIMELINES[0] || "");
  const [budget, setBudget] = useState<string>(BUDGETS[1] || "");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [brief, setBrief] = useState<string>("");

  if (!open) return null;

  const handleCopyEmail = () => {
    sounds.lensTick();
    navigator.clipboard.writeText(STUDIO_EMAIL);
    toast.success("Studio email copied to clipboard", {
      description: STUDIO_EMAIL,
    });
  };

  const handleLaunchEmail = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.shutterClick();

    const subject = encodeURIComponent(`Commission Inquiry: ${discipline} — ${name || "Client"}`);
    const body = encodeURIComponent(
      `Hello Paiman Wafa,\n\n` +
        `I would like to inquire about initiating a production commission:\n\n` +
        `· Discipline: ${discipline}\n` +
        `· Estimated Timeline: ${timeline}\n` +
        `· Budget Allocation: ${budget}\n` +
        `· Name/Brand: ${name || "Not provided"}\n` +
        `· Contact Email: ${email || "Not provided"}\n\n` +
        `Project Vision & Notes:\n${brief || "Please reach out to discuss concept treatments."}\n\n` +
        `Best regards,\n${name || "Inquirer"}`,
    );

    window.open(`mailto:${STUDIO_EMAIL}?subject=${subject}&body=${body}`, "_blank");
    toast.success("Email client launched with your brief!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/70 bg-card p-6 md:p-10 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent">
              <Sparkles className="size-3.5" />
            </span>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-accent">
                Commission Concierge
              </div>
              <h3 className="font-serif font-normal text-3xl text-foreground">
                Initiate a Project
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.lensTick();
              onClose();
            }}
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="my-6 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= s ? "bg-accent" : "bg-border/60"
              }`}
            />
          ))}
        </div>

        {/* Multi-Step Flow */}
        <form onSubmit={handleLaunchEmail}>
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-accent font-medium">
                  Step 01 / 03
                </span>
                <h4 className="font-serif font-normal text-2xl sm:text-3xl text-foreground mt-1 tracking-tight">
                  Select Production Discipline
                </h4>
              </div>

              <div className="grid gap-3">
                {DISCIPLINES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      sounds.lensTick();
                      setDiscipline(d);
                    }}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left font-sans text-xs sm:text-sm font-medium transition-all ${
                      discipline === d
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <span>{d}</span>
                    {discipline === d && <Check className="size-4 text-accent" />}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    sounds.lensTick();
                    setStep(2);
                  }}
                  className="flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-sans font-medium uppercase tracking-[0.18em] text-background transition-transform hover:scale-102 hover:bg-accent"
                >
                  <span>Continue</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-accent font-medium">
                  Step 02 / 03
                </span>
                <h4 className="font-serif font-normal text-2xl sm:text-3xl text-foreground mt-1 tracking-tight">
                  Scope, Timeline & Investment
                </h4>
              </div>

              {/* Timeline */}
              <div>
                <label className="text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-muted-foreground block mb-2">
                  Target Production Window
                </label>
                <div className="grid gap-2">
                  {TIMELINES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        sounds.lensTick();
                        setTimeline(t);
                      }}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left font-sans text-xs sm:text-sm font-medium transition-all ${
                        timeline === t
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <span>{t}</span>
                      {timeline === t && <Check className="size-3.5 text-accent" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-muted-foreground block mb-2">
                  Estimated Production Budget Bracket
                </label>
                <div className="grid gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        sounds.lensTick();
                        setBudget(b);
                      }}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left font-sans text-xs sm:text-sm font-medium transition-all ${
                        budget === b
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <span>{b}</span>
                      {budget === b && <Check className="size-3.5 text-accent" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.lensTick();
                    setStep(3);
                  }}
                  className="flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-sans font-medium uppercase tracking-[0.18em] text-background transition-transform hover:scale-102 hover:bg-accent"
                >
                  <span>Final Step</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-accent font-medium">
                  Step 03 / 03
                </span>
                <h4 className="font-serif font-normal text-2xl sm:text-3xl text-foreground mt-1 tracking-tight">
                  Brief & Contact Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-muted-foreground block mb-1.5">
                    Your Name / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Rostova / Vogue"
                    className="w-full rounded-xl border border-border/70 bg-background/60 p-3.5 text-sm font-sans text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-muted-foreground block mb-1.5">
                    Direct Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@rostova.com"
                    className="w-full rounded-xl border border-border/70 bg-background/60 p-3.5 text-sm font-sans text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-muted-foreground block mb-1.5">
                  Creative Vision / Production Notes
                </label>
                <textarea
                  rows={3}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Tell us about the atmosphere, location, or visual goals you are looking to achieve..."
                  className="w-full rounded-xl border border-border/70 bg-background/60 p-3.5 text-sm font-sans text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-4 py-3 text-xs font-sans font-medium uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                  >
                    <Copy className="size-3.5" />
                    <span>Copy Email</span>
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-xs font-sans font-medium uppercase tracking-[0.18em] text-background shadow-xl transition-transform hover:scale-105"
                  >
                    <Send className="size-3.5" />
                    <span>Send Brief</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
