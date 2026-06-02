import logoAsset from "@/assets/bgc-logo.png.asset.json";

type Variant = "full" | "mark" | "stacked";

const SIZES: Record<Variant, number> = {
  full: 36,
  mark: 32,
  stacked: 64,
};

export function Logo({
  className = "",
  variant = "full",
  showTagline = false,
}: {
  className?: string;
  variant?: Variant;
  showTagline?: boolean;
}) {
  const size = SIZES[variant];
  const Mark = (
    <img
      src={logoAsset.url}
      alt="Bridge Gateway Consulting"
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      className="shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
      style={{ width: size, height: size }}
    />
  );

  if (variant === "mark") {
    return <span className={`inline-flex items-center ${className}`}>{Mark}</span>;
  }

  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
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
