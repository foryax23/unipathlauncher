import arden from "@/assets/partners/arden.png";
import gbs from "@/assets/partners/gbs.png";
import lsc from "@/assets/partners/lsc.png";
import londonMet from "@/assets/partners/london-met.png";
import lcca from "@/assets/partners/lcca.png";
import bolton from "@/assets/partners/bolton.png";
import regent from "@/assets/partners/regent.png";
import montRose from "@/assets/partners/mont-rose.png";
import aru from "@/assets/partners/aru.png";

const PARTNERS = [
  { name: "Arden University", src: arden },
  { name: "Global Banking School", src: gbs },
  { name: "London School of Commerce", src: lsc },
  { name: "London Metropolitan University", src: londonMet },
  { name: "London College of Contemporary Arts", src: lcca },
  { name: "University of Bolton", src: bolton },
  { name: "Regent College London", src: regent },
  { name: "Mont Rose College", src: montRose },
  { name: "Anglia Ruskin University", src: aru },
];

export function PartnersMarquee() {
  const loop = [...PARTNERS, ...PARTNERS];
  return (
    <section className="border-y border-border bg-surface-muted py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-coral">
            Trusted partners
          </p>
          <h2 className="mt-3 text-display-md text-foreground sm:text-display-lg">
            Awarded by leading UK universities
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            We work directly with accredited UK institutions to place students on the right course.
          </p>
        </div>
      </div>

      <div
        className="relative mt-10 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="marquee-track flex w-max gap-6 motion-reduce:animate-none">
          {loop.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex h-24 w-44 shrink-0 items-center justify-center rounded-2xl border border-border bg-white px-6 shadow-sm sm:h-28 sm:w-56"
            >
              <img
                src={p.src}
                alt={p.name}
                loading="lazy"
                className="max-h-16 w-auto max-w-full object-contain sm:max-h-20"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
