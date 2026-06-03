## What to change

### 1. Smooth seams between sections
The hard horizontal edges visible in the screenshots are caused by adjacent sections using different background tokens (`bg-warm` → `bg-background` → `bg-surface-muted` → gold `StatsBand`) plus a hairline `border-t border-border` between them.

- **`HowWeHelp.tsx`** — remove `border-t border-border`. Add a top fade overlay (`h-32 bg-gradient-to-b from-[var(--surface-warm)] to-transparent`) so it blends out of the warm CinematicShowcase above, and a bottom fade (`h-32 bg-gradient-to-b from-transparent to-[var(--surface-muted)]`) so it blends into WhyUs below.
- **`WhyUs.tsx`** — remove `border-t border-border`. Add a bottom fade into the gold StatsBand (`h-32 bg-gradient-to-b from-transparent to-amber/40`).
- **`StatsBand.tsx`** — remove `border-y border-border`. Add a top fade from `surface-muted` into gold, and a bottom fade from gold into the next section's background (TestimonialsMarquee surface).

Net result: continuous vertical flow with no visible step lines on mobile or desktop.

### 2. Polish the 4 stats numbers
The current StatsBand reads flat — big white numerals on gold with no hierarchy. Upgrade it:
- Wrap each stat in a glass card (`rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm p-6`)
- Use the editorial italic font for the numerals (matching the hero's `font-editorial italic` accent), slightly larger (`text-5xl sm:text-6xl`)
- Add a thin coral divider between numeral and label, tighter tracking on labels
- Subtle reveal-on-scroll using existing `useReveal` hook

### 3. Preload section images before scroll
Currently `HowWeHelp` step images and `WhyUs` cards use `loading="lazy"` so they pop in late.
- Change all `<img loading="lazy">` in `WhyUs.tsx` and the `CinematicMedia` component used by `HowWeHelp` to `loading="eager"` with `fetchPriority="high"` for the first one and default for the rest, OR preload them via `<link rel="preload" as="image">` injected from the route's `head()`.
- Simpler approach: switch to `loading="eager" decoding="async"` since these are above-the-fold-ish on mobile after a short scroll.

### 4. Fix mobile hero logos carousel (laggy + cropped)
On mobile (390px viewport), the `LiveOffersBand` partner row sits inside the hero's centered `max-w-6xl` container with horizontal padding, which crops the marquee mask and competes with the hero video for paint work. Fixes:
- Break the marquee row out of the padded container: render it `full-bleed` (negative margin or `mx-[calc(50%-50vw)] w-screen`) so the mask runs edge-to-edge on mobile.
- Reduce paint cost: drop the `backdrop-blur-md` on the offer pills on mobile (`sm:backdrop-blur-md`), and add `will-change: transform` + `transform: translateZ(0)` to the marquee tracks so they composite on the GPU.
- Increase the marquee animation duration on small screens so motion looks smoother at lower frame rates.

### 5. Remove the "Live · Recent offers" label
Delete the entire eyebrow row (the pulsing dot + "Live · Recent offers" caption) at the top of `LiveOffersBand`. Keep the two scrolling rows beneath it.

## Out of scope
- No copy, layout reordering, or new sections.
- No backend / data changes.
- Light-mode token values stay the same; we only adjust class names and overlays.

Approve and I'll ship these fixes in one pass.