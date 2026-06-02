import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { COMPANY } from "@/components/marketing/data/company";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Bridge Gateway Consulting" },
      { name: "description", content: "The terms that govern your use of Bridge Gateway Consulting's website and services." },
      { property: "og:title", content: "Terms of Service — Bridge Gateway Consulting" },
      { property: "og:description", content: "The terms that govern your use of our services." },
      { property: "og:url", content: `${COMPANY.url}/terms` },
    ],
    links: [{ rel: "canonical", href: `${COMPANY.url}/terms` }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-4xl text-foreground">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section className="prose prose-neutral mt-8 max-w-none text-foreground/90 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1 [&_a]:text-foreground [&_a]:underline">
          <h2>1. About these terms</h2>
          <p>
            These terms govern your use of the website and services operated by{" "}
            {COMPANY.legalName} (company number {COMPANY.companyNumber}), registered at{" "}
            {COMPANY.address.line1}, {COMPANY.address.line2}, {COMPANY.address.city}{" "}
            {COMPANY.address.postcode}, {COMPANY.address.country}.
          </p>

          <h2>2. Our service</h2>
          <p>
            We help students discover, compare and apply to UK universities. Adviser guidance is
            offered free of charge to students; we are remunerated by partner institutions when
            students enrol. We do not guarantee admission or a specific outcome.
          </p>

          <h2>3. Your responsibilities</h2>
          <ul>
            <li>Provide accurate, up-to-date information.</li>
            <li>Use the service lawfully and not to misrepresent yourself.</li>
            <li>Keep account credentials confidential.</li>
          </ul>

          <h2>4. Intellectual property</h2>
          <p>
            All content on this site, including logos, text, and design, is owned by or licensed to
            {" "}{COMPANY.legalName}. You may not copy or redistribute it without permission.
          </p>

          <h2>5. Third-party content</h2>
          <p>
            Course information, fees and entry requirements come from partner universities and can
            change without notice. Always verify with the institution before making decisions.
          </p>

          <h2>6. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, we are not liable for indirect or consequential
            loss arising from your use of the service. Nothing in these terms limits liability for
            fraud, death or personal injury caused by negligence.
          </p>

          <h2>7. Governing law</h2>
          <p>
            These terms are governed by the laws of England &amp; Wales. The courts of England
            &amp; Wales have exclusive jurisdiction.
          </p>

          <h2>8. Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
