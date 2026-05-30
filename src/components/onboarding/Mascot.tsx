import { useEffect, useState } from "react";

export type Mood = "idle" | "thinking" | "happy" | "cheer" | "celebrate";

export function Mascot({ mood = "idle", message }: { mood?: Mood; message?: string }) {
  const [bump, setBump] = useState(0);
  useEffect(() => { setBump((n) => n + 1); }, [mood]);

  const anim =
    mood === "cheer" || mood === "celebrate"
      ? "animate-mascot-cheer"
      : mood === "happy"
        ? "animate-mascot-happy"
        : "animate-mascot-bob";

  const tilt =
    mood === "thinking" ? "-rotate-6" : mood === "happy" ? "rotate-2" : "rotate-0";

  // Eye expression
  const eyeY = mood === "happy" || mood === "cheer" || mood === "celebrate" ? 42 : 40;
  const mouthD =
    mood === "happy" || mood === "cheer" || mood === "celebrate"
      ? "M40 64 Q50 76 60 64"
      : mood === "thinking"
        ? "M42 68 Q50 64 58 68"
        : "M42 66 Q50 70 58 66";

  return (
    <div className="relative flex items-end justify-center gap-3 md:gap-4">
      <div
        key={bump}
        className={`relative ${anim} ${tilt} transition-transform`}
        style={{ width: 96, height: 96 }}
        aria-hidden
      >
        {(mood === "happy" || mood === "cheer" || mood === "celebrate") && (
          <>
            <span className="absolute -left-2 top-2 size-2 rounded-full bg-gold animate-sparkle" />
            <span className="absolute right-0 top-4 size-1.5 rounded-full bg-coral animate-sparkle [animation-delay:120ms]" />
            <span className="absolute -right-2 bottom-6 size-2 rounded-full bg-primary animate-sparkle [animation-delay:240ms]" />
          </>
        )}
        <svg viewBox="0 0 100 100" width="96" height="96">
          {/* body */}
          <ellipse cx="50" cy="58" rx="34" ry="36" fill="var(--primary)" />
          <ellipse cx="50" cy="68" rx="24" ry="24" fill="var(--surface)" opacity="0.95" />
          {/* ears */}
          <polygon points="18,28 28,18 30,34" fill="var(--primary)" />
          <polygon points="82,28 72,18 70,34" fill="var(--primary)" />
          {/* eyes background */}
          <circle cx="38" cy={eyeY} r="9" fill="white" />
          <circle cx="62" cy={eyeY} r="9" fill="white" />
          {/* pupils */}
          <circle cx="38" cy={eyeY + 1} r="4" fill="#0B1F3F" />
          <circle cx="62" cy={eyeY + 1} r="4" fill="#0B1F3F" />
          <circle cx="39" cy={eyeY} r="1.4" fill="white" />
          <circle cx="63" cy={eyeY} r="1.4" fill="white" />
          {/* beak */}
          <polygon points="50,52 46,58 54,58" fill="var(--gold)" />
          {/* mouth/smile */}
          <path d={mouthD} stroke="var(--gold)" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* feet */}
          <ellipse cx="40" cy="94" rx="6" ry="3" fill="var(--gold)" />
          <ellipse cx="60" cy="94" rx="6" ry="3" fill="var(--gold)" />
        </svg>
      </div>
      {message && (
        <div className="relative mb-3 max-w-[12rem] rounded-2xl rounded-bl-sm border border-border bg-surface px-3 py-2 text-xs text-foreground shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
          {message}
        </div>
      )}
    </div>
  );
}
