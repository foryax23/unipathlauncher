import { useReveal } from "@/hooks/use-reveal";
import step01 from "@/assets/how-step-01.jpg.asset.json";
import step02 from "@/assets/how-step-02.jpg.asset.json";
import step03 from "@/assets/how-step-03.jpg.asset.json";

const STEPS = [
  {
    n: "01",
    title: "Tell us your interests",
    body:
      "Share your subject area, study level and where in the UK you'd like to study. It takes under three minutes.",
    img: step01.url,
    alt: "A student filling out a university application on a laptop at a cozy desk",
  },
  {
    n: "02",
    title: "We match you to universities",
    body:
      "Our advisers shortlist programmes from 120+ UK institutions that fit your goals, grades and budget.",
    img: step02.url,
    alt: "An adviser pointing at a shortlist of UK universities on a laptop screen",
  },
  {
    n: "03",
    title: "Get expert guidance",
    body:
      "Receive a tailored shortlist, application tips, and funding options, with a real adviser on call.",
    img: step03.url,
    alt: "A friendly UK university adviser in conversation with a prospective student",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">
            From curious to confident, in three steps.
          </h2>
        </div>

        <ol className="mt-16 space-y-24">
          {STEPS.map((s, i) => (
            <Step key={s.n} step={s} reverse={i % 2 === 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Step({
  step,
  reverse,
}: {
  step: (typeof STEPS)[number];
  reverse: boolean;
}) {
  const ref = useReveal<HTMLLIElement>();
  return (
    <li
      ref={ref}
      className={`reveal grid items-center gap-10 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
    >
      <div>
        <div className="font-serif text-7xl leading-none text-gold sm:text-8xl">
          {step.n}
        </div>
        <h3 className="mt-6 font-serif text-3xl text-foreground sm:text-4xl">
          {step.title}
        </h3>
        <p className="mt-4 max-w-md text-base text-muted-foreground">{step.body}</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-muted">
        <img
          src={step.img}
          alt={step.alt}
          width={1280}
          height={960}
          className="aspect-[4/3] w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    </li>
  );
}
