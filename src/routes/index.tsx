import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { ServicesBand } from "@/components/marketing/ServicesBand";
import { CinematicShowcase } from "@/components/marketing/CinematicShowcase";
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
      { property: "og:title", content: "Bridge Gateway · Apply to UK universities with confidence" },
      { property: "og:description", content: "The UK's modern way to apply to university. Get a personalised shortlist in 2 minutes." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { q: "Do I need to apply through UCAS?", a: "Most undergraduate applications go through UCAS, but some Foundation and direct-entry courses can be applied for directly with the university. Your Bridge Gateway adviser will tell you which route fits." },
            { q: "How much are UK tuition fees?", a: "For Home students, undergraduate fees are typically up to £9,535 per year (2025/26). Foundation routes and postgraduate fees vary by institution and course." },
            { q: "Can I get a student loan?", a: "Yes, eligible UK students can apply for Tuition Fee Loans and Maintenance Loans from Student Finance England (or the equivalent in Scotland, Wales and Northern Ireland)." },
            { q: "What is Clearing and can it help me?", a: "Clearing matches students with available university places after A-Level results day. We can help you weigh options and contact universities directly." },
            { q: "What entry requirements should I expect?", a: "Entry requirements vary by course. Foundation programmes are open to applicants without traditional qualifications; degree entry usually expects UCAS points or equivalent." },
            { q: "Are international students welcome?", a: "Yes. Several of our partner institutions accept international applicants with appropriate visas. Your adviser will guide you through the requirements." },
          ].map((i) => ({
            "@type": "Question",
            name: i.q,
            acceptedAnswer: { "@type": "Answer", text: i.a },
          })),
        }),
      },
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
        <CinematicShowcase />
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
