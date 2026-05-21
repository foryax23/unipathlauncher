## Rebrand: Bridge Gateway Consulting

The uploaded logo is a minimal black arc — a bridge silhouette. I'll build the identity around that mark: the bridge as connector, gateway, passage.

### 1. Brand identity

- **Name**: Bridge Gateway Consulting (full) / "Bridge Gateway" (short) / "BGC" (mono)
- **Tagline**: "Your gateway to global education." (used on hero + footer)
- **Voice**: Considered, trusted, advisory — closer to a private consulting firm than a startup. UK-English spelling.

### 2. Logo system

- Copy `user-uploads://Logo-04_OK.png` to `src/assets/bridge-gateway-logo.png` (raster, for OG/favicons)
- Build an **SVG version** (`src/components/brand/BridgeMark.tsx`) that recreates the arc cleanly — scales crisp at any size, recolors via `currentColor`
- Lockup component (`src/components/brand/Logo.tsx`):
  - Arc mark + "Bridge Gateway" wordmark in serif
  - Variants: `full` (mark + wordmark), `mark` (arc only), `stacked` (mark above wordmark)
  - Replaces existing `src/components/marketing/Logo.tsx` usage
- Favicon + apple-touch-icon generated from the arc mark on navy
- OG image: arc + wordmark on navy with tagline

### 3. Color palette (Navy Trust + understated gold)

Refine the existing tokens in `src/styles.css` toward a more editorial, trustworthy palette:

- `--primary` deep navy `#0B1F3F` (oklch ~0.22 0.06 260)
- `--gold` muted brass `#B8924A` (oklch ~0.66 0.10 80) — used sparingly as accent
- `--background` warm ivory `#FAF7F1`
- `--surface` pure white cards on ivory
- `--foreground` near-black navy `#0A1628`
- Dark mode: navy background, ivory text, gold accent

### 4. Typography

- **Display/Serif**: Instrument Serif (already loaded) — used for headlines, brand wordmark
- **Sans**: Geist (already loaded) — UI, body, buttons
- Wordmark in the Logo component uses Instrument Serif with tight tracking

### 5. Copy + metadata rebrand

Replace every "UniPath" / "UniPathLauncher" / "Uni Path" mention across:

- `index.html` — title, meta description, og tags, theme-color
- `src/routes/__root.tsx` — head() title template, default meta, og:site_name
- Every route's `head()` — `/`, `/courses`, `/login`, `/signup`, `/admin`, `/onboarding`, `/reset-password`, `/verify-email`, `/dashboard`
- Marketing components: `Header`, `Footer`, `FAQ`, `LeadForm`, `Testimonials`, `HeroMatchCard`
- Auth + dashboard components: `VerifyEmailBanner`, dashboard greetings
- Email-facing copy in `reset-password` flow (subject line is configured in Cloud, but page copy says "Bridge Gateway")

New default title: `Bridge Gateway Consulting — Your gateway to global education`
New meta description: `Bridge Gateway Consulting helps students and families find, apply to, and succeed at universities abroad. Expert advisers. Personalised pathways.`

### 6. Marketing surfaces

- **Header**: new Logo lockup, nav unchanged
- **Hero (index)**: new H1 "Cross the bridge to your future university.", subhead reinforcing tagline, primary CTA "Start your pathway", secondary "Talk to an adviser"
- **Footer**: full lockup + tagline + "© 2026 Bridge Gateway Consulting Ltd."
- **Testimonials/FAQ**: replace product name mentions; keep structure

### 7. Admin + auth screens

- `/admin` adviser sign-in card: replace product name in header, swap logo
- `/login`, `/signup`, `/reset-password`, `/verify-email`: new logo + brand name in header card
- No logic changes — purely brand surface

### Technical notes

- All color changes happen in `src/styles.css` tokens — components keep using semantic classes (`bg-primary`, `text-gold`, etc.), so no per-component color edits needed.
- The current `Logo.tsx` is replaced with a new lockup in `src/components/brand/Logo.tsx` and re-exported from the old path to avoid touching every importer.
- No backend, auth, schema, or routing logic changes. Pure presentation + copy.
- Custom domain `bridgegatewayconsulting.com` already configured — metadata + canonical URLs will use it.

### Out of scope (ask if you want these too)

- Transactional email template redesign (Cloud auth emails)
- Print collateral / brand guidelines PDF
- New illustrations or photography
