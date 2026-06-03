import { Link } from "@tanstack/react-router";
import { GraduationCap, MessageCircle, Send } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import universitiesImg from "@/assets/service-universities.jpg.asset.json";
import adviserImg from "@/assets/service-adviser.jpg.asset.json";
import scholarshipImg from "@/assets/service-scholarship.jpg.asset.json";

const SERVICES = [
  {
    icon: GraduationCap,
    eyebrow: "Research",
    title: "40+ UK Institutions",
    accent: "Institutions",
    body: "Connect with leading UK universities across England, Scotland, Wales and Northern Ireland.",
    cta: "Explore Universities",
    to: "/courses",
    image: universitiesImg.url,
  },
  {
    icon: MessageCircle,
    eyebrow: "Advise",
    title: "Free 1-to-1 Guidance",
    accent: "Guidance",
    body: "Speak with experienced advisers to choose the right course and handle every application step.",
    cta: "Speak to an Adviser",
    to: "/signup",
    image: adviserImg.url,
  },
  {
    icon: Send,
    eyebrow: "Apply",
    title: "Scholarships & Visas",
    accent: "Scholarships",
    body: "Get support unlocking scholarships, student loans, and a smooth UK student visa process.",
    cta: "Start Application",
    to: "/signup",
    image: scholarshipImg.url,
  },
];

export function ServicesBand() {
  const gridRef = useReveal<HTMLDivElement>();
  return (
    <section className="relative overflow-hidden bg-warm">
      {/* Subtle dot texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-coral">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-coral" />
            </span>
            Research. Analyse. Apply.
          </p>
          <h2 className="mt-3 text-display-lg text-foreground">
            Easy access to course info & student services
          </h2>
        </div>

        <div
          ref={gridRef}
          className="reveal mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7"
        >
          {SERVICES.map((s, i) => {
            const titleWithoutAccent = s.title.replace(s.accent, "").trim();
            return (
              <Link
                key={s.title}
                to={s.to}
                className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-foreground/80 p-6 text-white shadow-xl shadow-foreground/10 ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:ring-gold/40 sm:p-7"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image with ken-burns drift */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={s.image}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    width={1280}
                    height={960}
                    className="h-full w-full object-cover opacity-70 [animation:kenburns_18s_ease-in-out_infinite_alternate] motion-reduce:[animation:none]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/55 to-foreground/5" />
                </div>

                {/* Sheen sweep on hover */}
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 opacity-0 group-hover:[animation:sheen-sweep_1.4s_ease-out] group-hover:opacity-100 mix-blend-overlay motion-reduce:hidden"
                  aria-hidden
                />

                {/* Index chip — top left */}
                <span className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-coral/90 sm:left-6 sm:top-6">
                  {String(i + 1).padStart(2, "0")}
                  <span className="mx-1 text-white/35">/</span>
                  <span className="text-white/55">{String(SERVICES.length).padStart(2, "0")}</span>
                </span>

                {/* Icon chip — top right */}
                <span
                  className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/30 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 sm:right-6 sm:top-6"
                  aria-hidden
                >
                  <s.icon className="h-4 w-4" strokeWidth={1.8} />
                </span>

                {/* Bottom content */}
                <div className="relative">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold/90">
                    {s.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-[26px]">
                    {titleWithoutAccent}{" "}
                    <span className="font-editorial italic text-gold">{s.accent}</span>
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">{s.body}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="underline-offset-4 group-hover:underline">{s.cta}</span>
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
