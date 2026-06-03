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

export function LiveOffersBand() {
  // Triple the loop so the wrap point is invisible at any viewport width
  const partners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <div className="group relative mt-12 w-full overflow-hidden motion-reduce:[&_*]:!animate-none">
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          maskImage:
            "linear-gradient(to right, black 0%, transparent 0%, transparent 100%, black 100%)",
        }}
      />
      <div
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div
          className="marquee-track-3x flex w-max items-center gap-10 sm:gap-14 sm:group-hover:[animation-play-state:paused]"
          style={{ willChange: "transform", transform: "translateZ(0)" }}
        >
          {partners.map((p, i) => (
            <img
              key={i}
              src={p.src}
              alt={p.name}
              loading="eager"
              decoding="async"
              className="h-10 w-auto shrink-0 object-contain opacity-90 sm:h-12"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
