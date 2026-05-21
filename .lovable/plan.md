
# UniPath v3 — UniEnrol-inspired refresh

Goal: borrow the structural choices that make unienrol.com convert (warm gradient hero with hand-drawn skyline + lifestyle photo, inline "match me" capture card, country destination cards with fees/rankings, feature stack with screenshots, big trust stats, scrolling testimonials), but reskin to our UK-only, Apple-2026 aesthetic (Geist, OKLCH, glass surfaces) and wire to the existing Lovable Cloud setup.

## Visual direction

- Keep Geist Sans/Mono. Soften palette toward a warm coral→amber gradient hero (à la UniEnrol) layered over our current navy as secondary, gold as accent.
- Hero composition: left = oversized headline + subhead + inline capture card; right = collage of UK landmarks line art (Big Ben, Tower Bridge, Edinburgh Castle) behind a student photo, with curved gradient sweeps.
- Section eyebrows in uppercase Geist Mono (small, tracked), large serif-free headlines, generous whitespace.
- Reuse existing `--glass-*` and gradient tokens; add `--gradient-warm`, `--surface-warm` in `src/styles.css`.

## New homepage structure (`src/routes/index.tsx`)

1. **Hero** — Headline "Apply to the UK's leading universities with confidence." + inline **MatchCard**: study-level select → "Start my free match" CTA (deep-links into `/onboarding` with prefilled level). Trust strip: "Covers A-Level • BTEC • IB • Access • International Foundation".
2. **Quick services row** (3 icon cards): 40+ UK Institutions • Free 1-to-1 Consultation • Clearing & Visa Support.
3. **Explore study destinations (UK regions)** — England, Scotland, Wales, Northern Ireland, London. Each card: outline map, flag/crest, "X universities in Russell Group", tuition from £, living cost from £/mo, partner logos strip on hover. Click → `/courses?region=...`.
4. **How we help** — 5-step feature stack with screenshot mockups (alternating left/right):
   - Personalised Course Recommendations
   - University Research Checklist
   - Course Comparison Table
   - Parent/Guardian Guest Access
   - Application & Visa Support
5. **Why students prefer us** — 3 big visual cards (Direct access to 40+ UK unis, Save with scholarships, Expert UK advisors).
6. **Stats band** — 98% offer rate · 40+ partner institutions · 10+ years guidance · £2M+ scholarships secured.
7. **Testimonials carousel** — auto-scrolling row of student cards with avatar, quote, programme, partner-uni logo. Pull 4-6 fictional UK examples.
8. **FAQ** (existing) — keep.
9. **Final CTA band** — "Find your course in 2 minutes" → `/onboarding`.
10. **Footer** (existing) — keep, refine spacing.

Sticky mobile CTA stays.

## New components (under `src/components/marketing/`)

- `HeroMatchCard.tsx` — inline level picker + CTA, frosted glass.
- `DestinationsGrid.tsx` + `DestinationCard.tsx` — UK region cards with hover partner-logos rail.
- `HowWeHelp.tsx` — 5-row alternating feature stack; uses picsum dashboard mockups for now.
- `WhyUs.tsx` — 3 large image cards.
- `StatsBand.tsx` — 4-up animated counters.
- `TestimonialsMarquee.tsx` — replace current `Testimonials.tsx` with horizontal auto-scroll (CSS `@keyframes`, pause on hover, prefers-reduced-motion safe).
- `FinalCTA.tsx`.

## Data

- Add `src/components/marketing/data/regions.ts` — UK regions with cost/ranking metadata and which `PROGRAMMES` map to them.
- Add `src/components/marketing/data/testimonials.ts` — 6 UK student testimonials.
- Keep `courses.ts` as source of truth; tag entries by `region` for destination filtering.

## Header / nav

Restructure `Header.tsx` to: **Courses** · **How it works** · **About** · **For Parents** · `Login` (pill) · `Get matched` (primary). Mobile drawer mirrors.

## Login page polish

`/login` (current route) — apply warm gradient backdrop + glass card so it matches the new hero language. No logic changes.

## Onboarding & dashboard

No structural change this round — just prefill `studyLevel` from hero MatchCard via search param, and restyle step shells to match the warm surface tokens.

## Token additions (`src/styles.css`)

```
--warm-50:  oklch(98% 0.02 40);
--warm-100: oklch(95% 0.05 35);
--coral:    oklch(68% 0.18 28);
--amber:    oklch(78% 0.15 65);
--gradient-warm: linear-gradient(135deg, var(--coral), var(--amber));
--surface-warm: color-mix(in oklab, var(--warm-50) 85%, white);
```

Dark mode: warm gradient remains, surfaces shift to deep plum/navy.

## Out of scope

- No new DB migrations.
- No new server functions (existing `leads`, `profile`, `geocode` unchanged).
- No new auth providers.
- Real partner logos / photography — placeholder via `picsum.photos` seeds + inline SVG line-art landmarks; user can swap later.

## Files

**New**: `src/components/marketing/HeroMatchCard.tsx`, `DestinationsGrid.tsx`, `DestinationCard.tsx`, `HowWeHelp.tsx`, `WhyUs.tsx`, `StatsBand.tsx`, `TestimonialsMarquee.tsx`, `FinalCTA.tsx`, `data/regions.ts`, `data/testimonials.ts`.
**Edited**: `src/routes/index.tsx` (recompose), `Header.tsx`, `Hero.tsx` (replace), `styles.css` (warm tokens + marquee keyframes), `routes/login.tsx` (backdrop only).
**Removed**: old `Testimonials.tsx` (superseded by marquee).
