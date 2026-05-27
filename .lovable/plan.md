## Add University Partners logo strip

Use the 9 uploaded partner logos (Arden, GBS, LSC, London Met, LCCA, Bolton, Regent College, Mont Rose, ARU) as a horizontally scrolling "Our University Partners" band on the homepage.

### Steps

1. **Save assets** — copy each upload into `src/assets/partners/` with stable names:
   - `arden.png`, `gbs.png`, `lsc.png`, `london-met.png`, `lcca.png`, `bolton.png`, `regent.png`, `mont-rose.png`, `aru.png`

2. **New component** `src/components/marketing/PartnersMarquee.tsx`
   - Section with kicker ("Trusted partners") + heading ("Awarded by leading UK universities").
   - Infinite CSS marquee: a flex row duplicated twice, animated via `@keyframes marquee` (translateX 0 → -50%), `prefers-reduced-motion` halts animation.
   - Each logo: fixed height (h-12 md:h-14), `object-contain`, grayscale + opacity by default, full color on hover. White/light card background so dark-on-transparent logos (London Met, LCCA, ARU) stay legible in dark mode — wrap each logo in a `bg-surface` rounded tile with padding.
   - Edge fade masks (left/right gradient) for polish.
   - Alt text per partner for SEO/a11y.

3. **Add marquee keyframes** to `src/styles.css` (`@keyframes marquee` + `.animate-marquee` utility honoring reduced motion).

4. **Mount on homepage** — insert `<PartnersMarquee />` in `src/routes/index.tsx` between the Hero and the next section (likely above `HowItWorks` / `Courses`).

### Out of scope
- No data model changes, no admin UI for managing partners (hard-coded list for now).
- No changes to existing `REGIONS.partners` text arrays.
