import arden from "@/assets/partners/arden.png";
import gbs from "@/assets/partners/gbs.png";
import lsc from "@/assets/partners/lsc.png";
import londonMet from "@/assets/partners/london-met.png";
import lcca from "@/assets/partners/lcca.png";
import bolton from "@/assets/partners/bolton.png";
import regent from "@/assets/partners/regent.png";
import montRose from "@/assets/partners/mont-rose.png";
import aru from "@/assets/partners/aru.png";

const OFFERS = [
  { name: "Maria K.", course: "BSc Computer Science", uni: "University of Manchester", time: "2m ago" },
  { name: "James O.", course: "MEng Mechanical Engineering", uni: "Imperial College London", time: "6m ago" },
  { name: "Aisha R.", course: "BA Economics", uni: "University of Warwick", time: "11m ago" },
  { name: "Tom B.", course: "BSc Psychology", uni: "University of Edinburgh", time: "14m ago" },
  { name: "Priya S.", course: "MBBS Medicine", uni: "King's College London", time: "22m ago" },
  { name: "Lukas W.", course: "BSc Architecture", uni: "University of Bath", time: "28m ago" },
  { name: "Chloe D.", course: "LLB Law", uni: "University of Bristol", time: "33m ago" },
  { name: "Daniel A.", course: "BSc Data Science", uni: "University of Leeds", time: "41m ago" },
  { name: "Elena M.", course: "BA International Relations", uni: "LSE", time: "47m ago" },
  { name: "Noah P.", course: "BEng Civil Engineering", uni: "University of Glasgow", time: "52m ago" },
  { name: "Sara V.", course: "BSc Biomedical Science", uni: "University of Birmingham", time: "1h ago" },
  { name: "Yusuf H.", course: "BA Business Management", uni: "Durham University", time: "1h ago" },
];

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
  const offers = [...OFFERS, ...OFFERS];
  const partners = [...PARTNERS, ...PARTNERS];

  return (
    <div className="relative mt-16 space-y-5 motion-reduce:[&_*]:!animate-none">
      {/* Eyebrow */}
      <div className="flex items-center justify-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90">
          Live · Recent offers
        </p>
      </div>

      {/* Row 1: offer pills */}
      <div
        className="group overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex w-max gap-3 marquee-track group-hover:[animation-play-state:paused]">
          {offers.map((o, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center gap-3 rounded-full bg-white/15 px-5 py-2.5 text-sm text-white ring-1 ring-white/25 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-semibold">{o.name}</span>
              <span className="text-white/85">{o.course}</span>
              <span className="text-white/65">·</span>
              <span className="text-white/85">{o.uni}</span>
              <span className="text-white/55">· {o.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: partner wordmarks (slower, reversed) */}
      <div
        className="overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max items-center gap-12 marquee-track-reverse">
          {partners.map((p, i) => (
            <span
              key={i}
              className="font-editorial text-2xl italic text-white/70 sm:text-3xl"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
