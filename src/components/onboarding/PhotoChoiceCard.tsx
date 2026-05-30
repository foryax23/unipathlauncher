import { Check } from "lucide-react";

export function PhotoChoiceCard({
  title,
  image,
  active,
  onClick,
}: {
  title: string;
  image?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`tap group relative flex aspect-[4/5] w-full flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5 ${
        active
          ? "border-gold/70 shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--gold)_45%,transparent)]"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      {image && (
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
      )}

      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />

      <div className="relative mt-auto w-full">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-background/30 backdrop-blur-md [mask-image:linear-gradient(to_top,black_55%,transparent)]" />
        <div className="relative px-4 py-3">
          <span className="block text-[15px] font-semibold leading-tight text-white drop-shadow-sm">
            {title}
          </span>
        </div>
      </div>

      {active && (
        <span className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-md animate-pop-in">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
