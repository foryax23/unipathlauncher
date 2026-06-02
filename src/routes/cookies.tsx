import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { COMPANY } from "@/components/marketing/data/company";
import { ManageCookiesButton } from "@/components/cookies/ManageCookiesButton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Bridge Gateway Consulting" },
      { name: "description", content: "What cookies we use, why we use them, and how to control them." },
      { property: "og:title", content: "Cookie Policy — Bridge Gateway Consulting" },
      { property: "og:description", content: "What cookies we use and how to control them." },
      { property: "og:url", content: `${COMPANY.url}/cookies` },
    ],
    links: [{ rel: "canonical", href: `${COMPANY.url}/cookies` }],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-serif text-4xl text-foreground">Cookie Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section className="prose prose-neutral mt-8 max-w-none text-foreground/90 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1 [&_a]:text-foreground [&_a]:underline">
          <p>
            Cookies are small text files placed on your device when you visit a website. We use
            them to keep you signed in, remember your preferences, and understand how our site is
            used. This policy explains what we use and how to control them.
          </p>

          <h2>Your choices</h2>
          <p>
            You can accept all cookies, reject non-essential cookies, or pick categories to allow.
            Strictly-necessary cookies cannot be switched off as the site won't work without them.
          </p>
          <div className="mt-4 not-prose">
            <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
              <span><ManageCookiesButton className="text-current" /></span>
            </Button>
          </div>

          <h2>Categories we use</h2>
          <ul>
            <li>
              <strong>Strictly necessary</strong> — authentication, session security, and storing
              your cookie preference. Always on.
            </li>
            <li>
              <strong>Analytics</strong> — anonymised usage metrics so we can improve the site.
              Off by default.
            </li>
            <li>
              <strong>Marketing</strong> — measure campaign performance and show relevant ads on
              third-party platforms. Off by default.
            </li>
          </ul>

          <h2>Third-party cookies</h2>
          <p>
            Some cookies are set by third parties (e.g. Google Analytics, Meta) only when you
            consent to the matching category. Those providers operate under their own privacy
            policies.
          </p>

          <h2>Changing your mind</h2>
          <p>
            You can change or withdraw consent at any time using the "Manage cookies" link in the
            footer of every page. You can also clear cookies from your browser settings.
          </p>

          <h2>Contact</h2>
          <p>
            Questions? Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
