import { Link } from "@tanstack/react-router";
import { GraduationCap, MessageCircle, Send } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

const SERVICES = [
  {
    icon: GraduationCap,
    title: "40+ UK Institutions",
    body: "Connect with leading UK universities across England, Scotland, Wales and Northern Ireland.",
    cta: "Explore Universities",
    to: "/courses",
  },
  {
    icon: MessageCircle,
    title: "Free 1-to-1 Guidance",
    body: "Speak with experienced advisers to choose the right course and handle every application step.",
    cta: "Speak to an Adviser",
    to: "/signup",
  },
  {
    icon: Send,
    title: "Scholarships & Visas",
    body: "Get support unlocking scholarships, student loans, and a smooth UK student visa process.",
    cta: "Start Application",
    to: "/signup",
  },
];

const EYEBROW_WORDS = ["Research.", "Analyse.", "Apply."];
const HEADLINE_WORDS = [
  "Easy", "access", "to", "course", "info", "&", "student", "services",
];

export function ServicesBand() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden border-t border-border bg-warm">
      {/* Ambient background blurs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-amber/25 blur-3xl motion-safe:animate-drift-a motion-reduce:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-10 h-[420px] w-[420px] rounded-full bg-coral/20 blur-3xl motion-safe:animate-drift-b motion-reduce:hidden"
      />

      <div
        ref={ref}
        className="reveal-on-scroll relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-coral">
            {EYEBROW_WORDS.map((w, i) => (
              <span key={w} className="inline-block">
                <span
                  className="services-eyebrow-word inline-block opacity-0 motion-reduce:opacity-100"
                  style={{ animationDelay: `${120 * i}ms` }}
                >
                  {w}
                </span>
                {i < EYEBROW_WORDS.length - 1 && (
                  <span className="mx-2 inline-block h-1 w-1 rounded-full bg-coral/70 align-middle" />
                )}
              </span>
            ))}
          </p>

          <span
            aria-hidden
            className="services-underline mx-auto mt-3 block h-px w-16 origin-left scale-x-0 bg-coral motion-reduce:scale-x-100"
          />

          <h2 className="mt-5 text-display-lg text-foreground">
            {HEADLINE_WORDS.map((w, i) => (
              <span
                key={`${w}-${i}`}
                className="mr-[0.25em] inline-block overflow-hidden align-bottom"
              >
                <span
                  className="services-headline-word inline-block translate-y-full motion-reduce:translate-y-0"
                  style={{ animationDelay: `${200 + 60 * i}ms` }}
                >
                  {w}
                </span>
              </span>
            ))}
          </h2>
        </div>

        {/* Connector line (desktop only) */}
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 mx-auto mt-14 hidden h-8 w-full max-w-4xl md:block"
          style={{ top: "calc(50% - 60px)" }}
          viewBox="0 0 800 8"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 130 4 L 670 4"
            stroke="currentColor"
            className="text-amber/60"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: 1,
            }}
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1"
              to="0"
              dur="1.4s"
              begin="0.6s"
              fill="freeze"
            />
          </path>
        </svg>

        <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-10">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              className="services-card group relative flex flex-col items-center text-center opacity-0 motion-reduce:opacity-100"
              style={{ animationDelay: `${400 + 150 * i}ms` }}
            >
              {/* Medallion */}
              <div className="relative">
                {/* Rotating halo on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:hidden"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent, var(--gold,#c9a84c), transparent 60%)",
                    animation: "services-halo-spin 3s linear infinite",
                    maskImage:
                      "radial-gradient(circle, transparent 58%, black 60%)",
                    WebkitMaskImage:
                      "radial-gradient(circle, transparent 58%, black 60%)",
                  }}
                />
                {/* Soft outer glow */}
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-amber/40 blur-xl transition-opacity duration-500 group-hover:opacity-100 opacity-60"
                />
                <div
                  className="services-medallion relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-500 ease-out group-hover:scale-105"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, #e8c879, #b8902f 70%, #8a6a1f)",
                    boxShadow:
                      "0 10px 30px -8px color-mix(in oklab, var(--gold,#c9a84c) 50%, transparent), inset 0 1px 0 rgba(255,255,255,0.4)",
                  }}
                >
                  <s.icon
                    className="services-icon h-9 w-9 transition-transform duration-500 group-hover:[animation:services-wiggle_0.6s_ease-in-out]"
                    strokeWidth={1.8}
                  />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                {s.title}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
              <Link
                to={s.to}
                className="story-link mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-coral"
              >
                {s.cta}
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes services-eyebrow-in {
          from { opacity: 0; filter: blur(6px); transform: translateY(6px); }
          to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        @keyframes services-headline-in {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes services-card-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes services-underline-in {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes services-halo-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes services-wiggle {
          0%,100% { transform: rotate(0); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        @keyframes drift-a {
          from { transform: translate(0,0); }
          to { transform: translate(20px,-12px); }
        }
        @keyframes drift-b {
          from { transform: translate(0,0); }
          to { transform: translate(-20px,14px); }
        }
        .animate-drift-a { animation: drift-a 12s ease-in-out infinite alternate; }
        .animate-drift-b { animation: drift-b 14s ease-in-out infinite alternate; }

        .reveal-on-scroll.is-visible .services-eyebrow-word {
          animation: services-eyebrow-in 600ms ease-out forwards;
        }
        .reveal-on-scroll.is-visible .services-underline {
          animation: services-underline-in 700ms 400ms ease-out forwards;
        }
        .reveal-on-scroll.is-visible .services-headline-word {
          animation: services-headline-in 700ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .reveal-on-scroll.is-visible .services-card {
          animation: services-card-in 700ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .services-eyebrow-word,
          .services-headline-word,
          .services-card,
          .services-underline { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
