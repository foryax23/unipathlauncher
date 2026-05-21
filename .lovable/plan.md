# Hero "Live Offers" dynamic band

Adds a cinematic strip directly under the hero match-card + image, sitting on the warm gradient just above the curve. Two stacked motion layers create constant, low-noise movement that signals "the platform is alive."

## Layout

```
[ hero copy + match card + student image ]
[--- live offers ticker (top row) -------]
[--- partner uni logo marquee (row 2) ---]
[ soft curve into next section ]
```

Both rows are full-bleed within the hero container and run infinitely.

## Row 1, Live offers ticker

- A single horizontal row of glassy "offer cards" that scroll right-to-left at a steady pace (~50s loop).
- Each card: small green pulse dot, student first name + initial, course, university, city, relative time. Example: `● Maria K., BSc Computer Science, University of Manchester, 2m ago`.
- 10-12 hand-written realistic entries (varied subjects, regions, UK uni names) duplicated once in the DOM so the marquee loops seamlessly.
- Eyebrow tag on the left of the row reads `LIVE, recent offers` with a pulsing dot. Sticky on desktop, sits above on mobile.
- Pauses on hover.

## Row 2, Partner uni logo marquee

- Slimmer row, slower scroll in the opposite direction (~70s) for parallax feel.
- 16-20 partner UK universities as text wordmarks set in `font-editorial` (Instrument Serif italic), white at 70% opacity. Using wordmarks instead of real logos avoids trademark issues.
- Duplicated for seamless loop, fades on both edges via a CSS mask gradient.

## Visual treatment

- Container: thin top/bottom hairline in `white/15`, no card background, sits on the gradient.
- Offer cards: `bg-white/12`, `backdrop-blur-md`, `ring-1 ring-white/20`, rounded-full pill shape, white text.
- Pulse dot: 8px coral with an animated ring.
- Edge fades via `mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent)`.
- Respects `prefers-reduced-motion`: animation pauses, just shows the first 3 cards statically.

## Files

- New: `src/components/marketing/LiveOffersBand.tsx`, holds both rows + data arrays.
- Edit: `src/components/marketing/Hero.tsx`, render `<LiveOffersBand />` inside the hero section, after the two-column grid, before the closing curve SVG. Increase hero bottom padding slightly to fit.
- Reuse existing `marquee` keyframe in `src/styles.css` (already defined). Add one more keyframe `marquee-reverse` and a slower duration variant in the same file.

## Why this fits

- Reinforces the "98% offer rate, 40+ UK partners" stats already on the page with concrete, named proof.
- Matches the warm/coral aesthetic without competing with the headline.
- Pure CSS animation, zero runtime cost, no images/videos to load, works on all devices.

## Out of scope

- No backend or real offer data, content is curated static copy.
- No real university logos, wordmarks only.
- No changes to other sections.
