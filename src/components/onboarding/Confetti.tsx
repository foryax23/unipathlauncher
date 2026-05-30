const COLORS = ["var(--gold)", "var(--coral)", "var(--primary)", "var(--amber)", "var(--success)"];

export function Confetti({ count = 24, fullscreen = false }: { count?: number; fullscreen?: boolean }) {
  const pieces = Array.from({ length: count });
  return (
    <div
      className={`pointer-events-none ${fullscreen ? "fixed inset-0 z-50" : "absolute inset-0"} overflow-hidden`}
      aria-hidden
    >
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.25;
        const dur = 1 + Math.random() * 0.8;
        const size = 6 + Math.random() * 6;
        const rot = Math.random() * 360;
        const color = COLORS[i % COLORS.length];
        return (
          <span
            key={i}
            className="absolute block animate-confetti-fall"
            style={{
              left: `${left}%`,
              top: "-10%",
              width: `${size}px`,
              height: `${size * 0.4}px`,
              background: color,
              transform: `rotate(${rot}deg)`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
              borderRadius: "2px",
            }}
          />
        );
      })}
    </div>
  );
}
