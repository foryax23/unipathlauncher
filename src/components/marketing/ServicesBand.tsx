import { Link } from "@tanstack/react-router";
import { GraduationCap, MessageCircle, Send } from "lucide-react";

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

export function ServicesBand() {
  return (
    <section className="border-t border-border bg-warm">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-coral">
            Research. Analyse. Apply.
          </p>
          <h2 className="mt-3 text-display-lg text-foreground">
            Easy access to course info & student services
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {SERVICES.map((s) => (
            <div key={s.title} className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-warm text-white shadow-lg shadow-coral/30">
                <s.icon className="h-8 w-8" strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                {s.title}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
              <Link
                to={s.to}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-coral"
              >
                {s.cta} <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
