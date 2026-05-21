import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Courses } from "@/components/marketing/Courses";
import { Testimonials } from "@/components/marketing/Testimonials";
import { LeadForm } from "@/components/marketing/LeadForm";
import { FAQ } from "@/components/marketing/FAQ";
import { StickyCTA } from "@/components/marketing/StickyCTA";
import { Footer } from "@/components/marketing/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [preselected, setPreselected] = useState<string | null>(null);

  const selectSubject = (subject: string) => {
    setPreselected(subject);
    if (typeof document !== "undefined") {
      document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Courses onSelectSubject={selectSubject} />
        <Testimonials />

        <section id="apply" className="border-t border-border bg-surface-muted">
          <div className="mx-auto w-full max-w-3xl px-4 py-24 sm:px-6 lg:py-32">
            <div className="mb-12 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Free shortlist
              </p>
              <h2 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">
                Get your free university shortlist.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Three quick steps. A real adviser will be in touch within 24 hours.
              </p>
            </div>
            <LeadForm preselectedSubject={preselected} />
          </div>
        </section>

        <FAQ />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
