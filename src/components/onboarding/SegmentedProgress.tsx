export function SegmentedProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current + 1}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div
            key={i}
            className={`relative h-2 flex-1 overflow-hidden rounded-full transition-colors duration-500 ${
              done || active ? "bg-transparent" : "bg-muted"
            }`}
          >
            <div
              className={`absolute inset-0 origin-left rounded-full bg-gradient-to-r from-primary to-gold transition-transform duration-500 ${
                done ? "scale-x-100" : active ? "scale-x-100 animate-segment-fill" : "scale-x-0"
              }`}
            />
            {active && (
              <span className="absolute inset-0 rounded-full ring-2 ring-gold/40 animate-segment-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}
