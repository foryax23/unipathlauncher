import type { ComponentType } from "react";
import { Check } from "lucide-react";

const GRADIENTS: Record<string, string> = {
  "business-finance": "from-[oklch(0.55_0.15_265)] to-[oklch(0.78_0.13_80)]",
  "health-social-care": "from-[oklch(0.55_0.13_180)] to-[oklch(0.7_0.15_155)]",
  "public-health": "from-[oklch(0.55_0.13_200)] to-[oklch(0.72_0.14_160)]",
  "computer-science": "from-[oklch(0.45_0.18_265)] to-[oklch(0.7_0.16_220)]",
  law: "from-[oklch(0.3_0.08_265)] to-[oklch(0.7_0.12_82)]",
  engineering: "from-[oklch(0.4_0.05_260)] to-[oklch(0.75_0.14_70)]",
  "arts-design": "from-[oklch(0.65_0.18_15)] to-[oklch(0.7_0.16_330)]",
  education: "from-[oklch(0.55_0.15_45)] to-[oklch(0.78_0.13_80)]",
  "hospitality-tourism": "from-[oklch(0.6_0.15_200)] to-[oklch(0.75_0.14_50)]",
  psychology: "from-[oklch(0.55_0.18_300)] to-[oklch(0.72_0.14_340)]",
};

export function GlassSubjectCard({
  id,
  title,
  Icon,
  image,
  active,
  onClick,
}: {
  id: string;
  title: string;
  Icon: ComponentType<{ className?: string }>;
  image?: string;
  active: boolean;
  onClick: () => void;
}) {
  const gradient = GRADIENTS[id] ?? "from-primary to-gold";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`tap group relative flex min-h-[180px] flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5 backdrop-blur-xl ${
        active
          ? "border-gold/70 bg-surface/80 shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--gold)_45%,transparent)]"
          : "border-white/15 bg-surface/55 hover:border-white/30 hover:bg-surface/70"
      }`}
    >
      {/* Photo */}
      <div className="relative h-24 w-full overflow-hidden">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            width={768}
            height={512}
            className={`absolute inset-0 size-full object-cover transition-transform duration-500 ${
              active ? "scale-105" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <span
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`}
          />
        )}
        {/* Legibility + theme overlay */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background/95" />
        <span
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-overlay opacity-40`}
        />

        {/* Floating icon plate */}
        <div
          className={`absolute bottom-2 left-2.5 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg transition-transform duration-300 ${
            active ? "scale-110" : "group-hover:scale-105"
          }`}
        >
          <Icon className="size-4.5 text-white drop-shadow" />
          <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
          {active && (
            <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-gold/60 animate-ring-sweep" />
          )}
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-1 items-center px-3.5 py-3">
        <span className="text-sm font-semibold leading-tight text-foreground">
          {title}
        </span>
      </div>

      {/* Selection check sticker */}
      {active && (
        <span className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-md animate-pop-in">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
