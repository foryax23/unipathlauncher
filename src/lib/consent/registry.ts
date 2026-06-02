// Single source of truth for cookies/scripts used on the site.
// Used both by the runtime script-loader and the public Cookie Policy page,
// so legal copy and actual behaviour can never drift apart.

export type ConsentCategory = "necessary" | "preferences" | "analytics" | "marketing";

export type CookieEntry = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  category: ConsentCategory;
};

export type CategoryMeta = {
  id: ConsentCategory;
  title: string;
  description: string;
  required?: boolean;
};

export const CATEGORY_META: CategoryMeta[] = [
  {
    id: "necessary",
    title: "Strictly necessary",
    description:
      "Required for the site to function: authentication, session security and storing your cookie choices. Always on.",
    required: true,
  },
  {
    id: "preferences",
    title: "Preferences",
    description:
      "Remember small comfort settings like theme, language and dismissed banners so the site feels personal between visits.",
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Anonymised usage metrics that tell us which pages help and where people get stuck. Aggregated, never sold.",
  },
  {
    id: "marketing",
    title: "Marketing",
    description:
      "Measure the performance of our campaigns and show relevant ads on third-party platforms.",
  },
];

export const COOKIE_REGISTRY: CookieEntry[] = [
  { name: "sb-*", provider: "Bridge Gateway (auth)", purpose: "Keeps you signed in", duration: "Session / 7 days", category: "necessary" },
  { name: "bgc-cookie-consent-v2", provider: "Bridge Gateway", purpose: "Stores your cookie preferences", duration: "12 months", category: "necessary" },
  { name: "bgc_consent", provider: "Bridge Gateway", purpose: "Server-side mirror of your consent choices", duration: "12 months", category: "necessary" },

  { name: "unipath-theme", provider: "Bridge Gateway", purpose: "Remembers light/dark mode", duration: "12 months", category: "preferences" },
  { name: "bgc-rq-cache-v1", provider: "Bridge Gateway", purpose: "Caches page data so repeat visits load instantly", duration: "24 hours", category: "preferences" },

  { name: "_ga / _ga_*", provider: "Google Analytics", purpose: "Anonymised usage metrics", duration: "Up to 24 months", category: "analytics" },

  { name: "_fbp", provider: "Meta", purpose: "Campaign attribution", duration: "3 months", category: "marketing" },
  { name: "_gcl_*", provider: "Google Ads", purpose: "Conversion tracking", duration: "Up to 90 days", category: "marketing" },
  { name: "li_*", provider: "LinkedIn Insight", purpose: "Campaign attribution", duration: "Up to 6 months", category: "marketing" },
];

export function cookiesFor(category: ConsentCategory) {
  return COOKIE_REGISTRY.filter((c) => c.category === category);
}
