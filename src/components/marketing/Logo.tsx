type Variant = "full" | "mark" | "stacked";

export function Logo({
  className = "",
  variant = "full",
  showTagline = false,
}: {
  className?: string;
  variant?: Variant;
  showTagline?: boolean;
}) {
  const Mark = (
    <svg
      width="36"
      height="20"
      viewBox="0 0 36 20"
      aria-hidden="true"
      className="text-foreground"
    >
      {/* Bridge arc — the brand mark */}
      <path
        d="M2 16 Q 18 2 34 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Gold gateway pillar accent */}
      <circle cx="18" cy="6.5" r="1.4" fill="var(--gold)" />
    </svg>
  );

  if (variant === "mark") {
    return <span className={`inline-flex items-center ${className}`}>{Mark}</span>;
  }

  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-1 ${className}`}>
        {Mark}
        <span className="font-serif text-lg leading-none tracking-tight text-foreground">
          Bridge Gateway
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Consulting
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {Mark}
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl tracking-tight text-foreground">
          Bridge Gateway
        </span>
        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Consulting
        </span>
      </span>
    </span>
  );
}
