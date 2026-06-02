import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CookieConsentProvider, useOptionalCookieConsent } from "@/components/cookies/CookieConsentProvider";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import { COMPANY } from "@/components/marketing/data/company";
import { startQueryPersistence, stopQueryPersistence } from "@/lib/cache/persistQueryClient";

import appCss from "../styles.css?url";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-serif text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-serif text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-serif tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// Inline script to set the theme before paint, preventing FOUC.
const themeBootstrap = `(function(){try{var t=localStorage.getItem('unipath-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bridge Gateway Consulting — Apply to UK universities with confidence" },
      {
        name: "description",
        content:
          "Bridge Gateway Consulting helps students and families find, apply to, and succeed at UK universities. Free, impartial guidance from expert advisers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Bridge Gateway Consulting" },
      { property: "fb:app_id", content: "0" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Caveat:wght@500;700&display=swap",
      },

    ],
    scripts: [
      { children: themeBootstrap },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: COMPANY.shortName,
          legalName: COMPANY.legalName,
          url: COMPANY.url,
          email: COMPANY.email,
          telephone: COMPANY.phones,
          address: {
            "@type": "PostalAddress",
            streetAddress: `${COMPANY.address.line1}, ${COMPANY.address.line2}`,
            addressLocality: COMPANY.address.city,
            postalCode: COMPANY.address.postcode,
            addressCountry: COMPANY.address.countryCode,
          },
          identifier: `Company No. ${COMPANY.companyNumber}`,
          description:
            "Education consultancy helping students apply to UK universities with expert, impartial guidance.",
        }),

      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Bridge Gateway Consulting",
          url: "https://bridgegatewayconsulting.com",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // #admin-view convenience redirect from the brief
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#admin-view") {
      window.location.replace("/admin");
    }
  }, []);

  // Re-run route guards + invalidate queries whenever the auth session changes,
  // so the OAuth callback lands on the correct page without a manual navigate.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        router.invalidate();
        queryClient.invalidateQueries();
      }
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <CookieConsentProvider>
        <QueryCachePersistence />
        <Outlet />
        <CookieBanner />
      </CookieConsentProvider>
    </QueryClientProvider>
  );
}

function QueryCachePersistence() {
  const { queryClient } = Route.useRouteContext();
  const consent = useOptionalCookieConsent();
  useEffect(() => {
    if (consent?.consent?.preferences) {
      startQueryPersistence(queryClient);
    } else {
      stopQueryPersistence();
    }
  }, [consent?.consent?.preferences, queryClient]);
  return null;
}

