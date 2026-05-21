import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { ServicesBand } from "@/components/marketing/ServicesBand";
import { DestinationsGrid } from "@/components/marketing/DestinationsGrid";
import { HowWeHelp } from "@/components/marketing/HowWeHelp";
import { WhyUs } from "@/components/marketing/WhyUs";
import { StatsBand } from "@/components/marketing/StatsBand";
import { TestimonialsMarquee } from "@/components/marketing/TestimonialsMarquee";
import { FAQ } from "@/components/marketing/FAQ";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { StickyCTA } from "@/components/marketing/StickyCTA";
import { Footer } from "@/components/marketing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bridge Gateway · Apply to UK universities with confidence" },
      { name: "description", content: "Discover, compare and apply to 40+ UK universities. Free expert guidance on courses, scholarships and visas, all in one place." },
      { property: "og:title", content: "Bridge Gateway, Apply to UK universities with confidence" },
      { property: "og:description", content: "The UK's modern way to apply to university. Get a personalised shortlist in 2 minutes." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServicesBand />
        <DestinationsGrid />
        <HowWeHelp />
        <WhyUs />
        <StatsBand />
        <TestimonialsMarquee />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
