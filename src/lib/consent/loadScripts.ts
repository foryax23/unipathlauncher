// Consent-gated script loader with Google Consent Mode v2 support.
// Nothing actually loads unless (a) the matching env var is set AND (b) the
// user has granted the matching consent category.

import type { ConsentSnapshot } from "./cookie";

type GtagFn = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
    fbq?: (...args: unknown[]) => void;
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const LINKEDIN_PARTNER_ID = import.meta.env.VITE_LINKEDIN_PARTNER_ID as string | undefined;

let booted = false;
const loaded = new Set<string>();

function injectScript(id: string, src: string, attrs: Record<string, string> = {}) {
  if (loaded.has(id) || document.getElementById(id)) {
    loaded.add(id);
    return;
  }
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
  loaded.add(id);
}

function bootConsentModeDefaults() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const gtag: GtagFn = function (...args) {
    window.dataLayer!.push(args);
  };
  window.gtag = window.gtag || gtag;
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500,
  });
}

function applyConsentMode(s: ConsentSnapshot) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    ad_storage: s.marketing ? "granted" : "denied",
    ad_user_data: s.marketing ? "granted" : "denied",
    ad_personalization: s.marketing ? "granted" : "denied",
    analytics_storage: s.analytics ? "granted" : "denied",
    functionality_storage: s.preferences ? "granted" : "denied",
    personalization_storage: s.preferences ? "granted" : "denied",
  });
}

function loadGA() {
  if (!GA_ID) return;
  injectScript("ga4-loader", `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_ID, { anonymize_ip: true });
}

function loadMetaPixel() {
  if (!META_PIXEL_ID || loaded.has("meta-pixel")) return;
  loaded.add("meta-pixel");
  // Standard Meta Pixel snippet
  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e);
    t.async = !0;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  window.fbq?.("init", META_PIXEL_ID);
  window.fbq?.("track", "PageView");
}

function loadLinkedIn() {
  if (!LINKEDIN_PARTNER_ID) return;
  window._linkedin_partner_id = LINKEDIN_PARTNER_ID;
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  if (!window._linkedin_data_partner_ids.includes(LINKEDIN_PARTNER_ID)) {
    window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);
  }
  injectScript("linkedin-insight", "https://snap.licdn.com/li.lms-analytics/insight.min.js");
}

export function bootConsent() {
  if (booted || typeof window === "undefined") return;
  booted = true;
  bootConsentModeDefaults();
}

export function applyConsent(s: ConsentSnapshot) {
  if (typeof window === "undefined") return;
  bootConsent();
  applyConsentMode(s);
  if (s.analytics) loadGA();
  if (s.marketing) {
    loadMetaPixel();
    loadLinkedIn();
  }
}
