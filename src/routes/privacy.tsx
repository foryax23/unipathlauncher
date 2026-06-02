import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { COMPANY } from "@/components/marketing/data/company";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Bridge Gateway Consulting" },
      { name: "description", content: "How Bridge Gateway Consulting collects, uses and protects your personal data under UK GDPR." },
      { property: "og:title", content: "Privacy Policy — Bridge Gateway Consulting" },
      { property: "og:description", content: "How we handle your data under UK GDPR." },
      { property: "og:url", content: `${COMPANY.url}/privacy` },
    ],
    links: [{ rel: "canonical", href: `${COMPANY.url}/privacy` }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-4xl text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section className="prose prose-neutral mt-8 max-w-none text-foreground/90 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1 [&_a]:text-foreground [&_a]:underline">
          <h2>Who we are</h2>
          <p>
            {COMPANY.legalName} ("we", "us", "our") is a company registered in England &amp; Wales
            under company number {COMPANY.companyNumber}. Registered office:{" "}
            {COMPANY.address.line1}, {COMPANY.address.line2}, {COMPANY.address.city}{" "}
            {COMPANY.address.postcode}, {COMPANY.address.country}.
          </p>
          <p>We act as the data controller for the personal data described in this policy.</p>

          <h2>What we collect</h2>
          <ul>
            <li>Identity &amp; contact data: name, email, phone, city.</li>
            <li>Education profile: subject of interest, study level, intake, qualifications.</li>
            <li>Account data: authentication identifiers (if you create an account).</li>
            <li>Technical data: IP, device, browser, pages visited, referrer.</li>
            <li>Communications: messages you send to our advisers.</li>
          </ul>

          <h2>How we use it (lawful basis)</h2>
          <ul>
            <li>To match you with suitable universities — performance of a contract / your request.</li>
            <li>To contact you about your application — legitimate interests / consent.</li>
            <li>To improve the service — legitimate interests.</li>
            <li>To meet legal obligations — legal obligation.</li>
            <li>Marketing — only with your explicit consent, withdrawable at any time.</li>
          </ul>

          <h2>Sharing</h2>
          <p>
            We share data with partner universities you choose to apply to, with vetted service
            providers (hosting, email, analytics) under contract, and where required by law. We do
            not sell your personal data.
          </p>

          <h2>Retention</h2>
          <p>
            We keep lead and application data for up to 6 years after our last meaningful contact
            with you, to support follow-ups, fulfil legal obligations, and resolve disputes.
          </p>

          <h2>Your rights</h2>
          <p>
            You have the right to access, rectify, erase, restrict, port, and object to processing
            of your personal data, and to withdraw consent at any time. To exercise these rights,
            email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. You can also complain to
            the UK Information Commissioner's Office at <a href="https://ico.org.uk">ico.org.uk</a>.
          </p>

          <h2>International transfers</h2>
          <p>
            Where data is transferred outside the UK, we rely on adequacy decisions or appropriate
            safeguards such as the UK International Data Transfer Agreement.
          </p>

          <h2>Security</h2>
          <p>
            We use encryption in transit, access controls, and reputable cloud infrastructure.
            No method of transmission is 100% secure, but we work hard to protect your data.
          </p>

          <h2>Contact</h2>
          <p>
            Questions? Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or write to
            us at the registered office above.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
