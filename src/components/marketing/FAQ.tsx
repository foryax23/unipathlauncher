import { useState } from "react";

const ITEMS = [
  {
    q: "Do I need to apply through UCAS?",
    a: "Most undergraduate applications go through UCAS, but some Foundation and direct-entry courses can be applied for directly with the university. Your UniPath adviser will tell you which route fits.",
  },
  {
    q: "How much are UK tuition fees?",
    a: "For Home students, undergraduate fees are typically up to £9,535 per year (2025/26). Foundation routes and postgraduate fees vary by institution and course.",
  },
  {
    q: "Can I get a student loan?",
    a: "Yes, eligible UK students can apply for Tuition Fee Loans and Maintenance Loans from Student Finance England (or the equivalent in Scotland, Wales and Northern Ireland).",
  },
  {
    q: "What is Clearing and can it help me?",
    a: "Clearing matches students with available university places after A-Level results day. We can help you weigh options and contact universities directly.",
  },
  {
    q: "What entry requirements should I expect?",
    a: "Entry requirements vary by course. Foundation programmes are open to applicants without traditional qualifications; degree entry usually expects UCAS points or equivalent.",
  },
  {
    q: "Are international students welcome?",
    a: "Yes. Several of our partner institutions accept international applicants with appropriate visas. Your adviser will guide you through the requirements.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-4xl px-4 py-24 sm:px-6 lg:py-32">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Frequently asked
        </p>
        <h2 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">
          Answers for prospective UK students.
        </h2>

        <ul className="mt-12 divide-y divide-border border-y border-border">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-[64px] w-full items-center justify-between gap-6 py-5 text-left text-foreground"
                >
                  <span className="font-serif text-xl">{item.q}</span>
                  <span
                    aria-hidden="true"
                    className={`text-2xl text-muted-foreground transition-transform ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 pb-6"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <p className="max-w-2xl text-sm text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
