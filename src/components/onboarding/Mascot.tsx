import { useEffect, useState } from "react";

export type Mood = "idle" | "thinking" | "happy" | "cheer" | "celebrate";

export function Mascot({
  mood = "idle",
  message,
  size = 72,
}: {
  mood?: Mood;
  message?: string;
  size?: number;
}) {
  const [bump, setBump] = useState(0);
  useEffect(() => { setBump((n) => n + 1); }, [mood]);

  const anim =
    mood === "cheer" || mood === "celebrate"
      ? "animate-bridge-cheer"
      : mood === "happy"
        ? "animate-bridge-happy"
        : mood === "thinking"
          ? "animate-bridge-think"
          : "animate-bridge-sway";

  const sparkle = mood === "happy" || mood === "cheer" || mood === "celebrate";
  const smiling = mood === "happy" || mood === "cheer" || mood === "celebrate";

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      {message && (
        <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-2xl rounded-bl-sm border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-foreground shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-300 hidden sm:block">
          {message}
          <span className="absolute -bottom-1 left-6 size-2 rotate-45 border-b border-r border-border bg-surface" />
        </div>
      )}
      <div
        key={bump}
        className={`relative ${anim} will-change-transform`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {sparkle && (
          <>
            <span className="absolute -left-1 top-1 size-1.5 rounded-full bg-gold animate-sparkle" />
            <span className="absolute right-0 top-3 size-1 rounded-full bg-coral animate-sparkle [animation-delay:140ms]" />
            <span className="absolute -right-2 top-1 size-1.5 rounded-full bg-primary animate-sparkle [animation-delay:260ms]" />
          </>
        )}
        <svg viewBox="0 0 120 120" width={size} height={size}>
          <defs>
            <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.86 0.12 82)" />
              <stop offset="45%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="oklch(0.48 0.08 78)" />
            </linearGradient>
            <linearGradient id="pylon-hi" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.92 0.10 82)" stopOpacity="0.7" />
              <stop offset="40%" stopColor="oklch(0.92 0.10 82)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="deck" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="oklch(0.12 0.04 260)" />
            </linearGradient>
            <filter id="shadow" x="-30%" y="-10%" width="160%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" />
              <feOffset dy="3" result="off" />
              <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.95 0.14 82)" />
              <stop offset="100%" stopColor="oklch(0.95 0.14 82 / 0)" />
            </radialGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="60" cy="108" rx="34" ry="3" fill="oklch(0.18 0.05 260 / 0.25)" />

          <g filter="url(#shadow)">
            {/* Deck (base) */}
            <rect x="14" y="84" width="92" height="10" rx="3" fill="url(#deck)" />
            <rect x="14" y="84" width="92" height="2" rx="1" fill="oklch(1 0 0 / 0.18)" />

            {/* Suspension cables — main curves */}
            <path
              d="M22 84 C 40 50, 80 50, 98 84"
              stroke="var(--gold)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Hanger strands */}
            {[32, 42, 52, 60, 68, 78, 88].map((x, i) => {
              const yTop = 50 + Math.pow((x - 60) / 38, 2) * 34;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={yTop}
                  x2={x}
                  y2={84}
                  stroke="var(--gold)"
                  strokeWidth="0.8"
                  opacity="0.55"
                />
              );
            })}

            {/* Left pylon */}
            <rect x="22" y="34" width="14" height="56" rx="3" fill="url(#brass)" />
            <rect x="22" y="34" width="6" height="56" rx="3" fill="url(#pylon-hi)" />
            {/* Right pylon */}
            <rect x="84" y="34" width="14" height="56" rx="3" fill="url(#brass)" />
            <rect x="84" y="34" width="6" height="56" rx="3" fill="url(#pylon-hi)" />

            {/* Pylon caps */}
            <polygon points="22,34 36,34 29,26" fill="var(--gold)" />
            <polygon points="84,34 98,34 91,26" fill="var(--gold)" />

            {/* Windows / eyes — left */}
            <g className="origin-center animate-window-blink">
              <rect x="25" y="48" width="8" height="9" rx="1.5" fill="oklch(0.98 0.08 82)" />
              <circle cx="29" cy="52.5" r="1.6" fill="var(--primary)" />
            </g>
            {/* Windows / eyes — right */}
            <g className="origin-center animate-window-blink [animation-delay:120ms]">
              <rect x="87" y="48" width="8" height="9" rx="1.5" fill="oklch(0.98 0.08 82)" />
              <circle cx="91" cy="52.5" r="1.6" fill="var(--primary)" />
            </g>

            {/* Lower window strips (gives depth) */}
            <rect x="25" y="64" width="8" height="2" rx="0.5" fill="oklch(1 0 0 / 0.35)" />
            <rect x="25" y="70" width="8" height="2" rx="0.5" fill="oklch(1 0 0 / 0.25)" />
            <rect x="87" y="64" width="8" height="2" rx="0.5" fill="oklch(1 0 0 / 0.35)" />
            <rect x="87" y="70" width="8" height="2" rx="0.5" fill="oklch(1 0 0 / 0.25)" />

            {/* Smile / mouth — arch under deck */}
            {smiling ? (
              <path
                d="M44 96 Q60 108 76 96"
                stroke="var(--gold)"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M46 99 Q60 103 74 99"
                stroke="var(--gold)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.85"
              />
            )}

            {/* Flag pole + flutter flag on top */}
            <line x1="60" y1="14" x2="60" y2="34" stroke="var(--primary)" strokeWidth="1.2" />
            <path
              d="M60 16 L74 19 L60 24 Z"
              fill="var(--gold)"
              className="origin-left animate-flag-flutter"
              style={{ transformBox: "fill-box" }}
            />
          </g>

          {/* Cheer glow burst */}
          {(mood === "cheer" || mood === "celebrate") && (
            <circle cx="60" cy="34" r="22" fill="url(#glow)" className="animate-ring-sweep" />
          )}
        </svg>
      </div>
    </div>
  );
}
