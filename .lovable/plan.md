## 1. Remove the student names row from the hero
In `src/components/marketing/LiveOffersBand.tsx`, delete the entire first marquee (the offer pills with names like "Maria K. · BSc Computer Science · University of Manchester") and the now-unused `OFFERS` array. Keep only the partner-logo row.

## 2. Reimplement the partner-logo carousel so it loops smoothly on mobile

Root causes of the lag and clipping today:
- The full-bleed wrapper (`mx-[calc(50%-50vw)] w-screen`) inside the hero's padded container fights the parent's overflow and the mask, producing jank and a cropped strip.
- `brightness-0 invert` is a CSS filter recomposited every animated frame — on mobile GPUs that multiplies paint cost while the track is transforming.
- The track only contains `[...PARTNERS, ...PARTNERS]` (2 copies). On wider viewports the second copy can finish before the first wraps, causing a visible jump that reads as "lag".

Fix:
- **Lift the marquee out of the hero's padded container**: move `<LiveOffersBand />` in `Hero.tsx` so it sits as a sibling of (not inside) the `max-w-6xl` inner div, still inside the `<section>`. The component itself becomes `w-full overflow-hidden` with no negative margins. The mask runs cleanly edge-to-edge on every viewport.
- **Triple the track contents** (`[...PARTNERS, ...PARTNERS, ...PARTNERS]`) and animate `translateX(0 → -33.333%)` via a new `marquee-track-3x` keyframe in `src/styles.css`. With 3 copies the loop point is invisible at any viewport width.
- **Make the white logo tint static**: keep `filter: brightness(0) invert(1)` on each `<img>` (cached layer) but ensure only the *track* gets `will-change: transform; transform: translateZ(0)` so the compositor animates one layer instead of N image layers.
- **One linear duration (45s)**, pause-on-hover only at `sm:` and up so mobile motion never stalls. `motion-reduce:animate-none` stays.

## 3. Files touched
- `src/components/marketing/LiveOffersBand.tsx` — delete offer pills + `OFFERS`, restructure container, use new track class, triple loop.
- `src/components/marketing/Hero.tsx` — move `<LiveOffersBand />` outside the padded `max-w-6xl` div but still inside the `<section>`.
- `src/styles.css` — add `.marquee-track-3x` + `@keyframes marquee-3x` (0 → -33.333%).

## Out of scope
No copy, no logo set changes, no other sections.