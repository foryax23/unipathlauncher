export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="text-primary dark:text-gold"
      >
        {/* graduation cap silhouette + upward path */}
        <path
          d="M2 13 L16 6 L30 13 L16 20 Z"
          fill="currentColor"
        />
        <path
          d="M8 16 L8 22 C8 24 12 26 16 26 C20 26 24 24 24 22 L24 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M27 13 L27 20"
          stroke="var(--gold)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M24 17 L27 13 L30 17"
          stroke="var(--gold)"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-serif text-xl tracking-tight text-foreground">
        UniPath
      </span>
    </span>
  );
}
