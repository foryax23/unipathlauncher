## Goal
Two upgrades to the homepage:
1. **Hero**: add a looping, muted, autoplay video as the background layer so the gold/coral hero feels cinematic instead of flat.
2. **DestinationsGrid**: turn the stacked grid of UK region cards into a horizontal carousel/slideshow so users can swipe through cities instead of scrolling a tall column.

## 1. Hero background video

### Asset
Generate a short ambient UK-themed loop with `videogen--generate_video` (5s, 1920×1080, 16:9, `camera_fixed: true` for stability):
> "Slow cinematic aerial drift over a UK university campus quad with golden hour light, students walking, soft sunbeams, warm cinematic color grade, subtle motion, seamless loop"

Upload to CDN → `src/assets/hero-bg.mp4.asset.json`. Also extract first frame as `hero-bg-poster.jpg.asset.json` for instant paint.

### Edit `src/components/marketing/Hero.tsx`
Layer order behind the existing content (no copy changes):
1. `<video>` at `absolute inset-0 -z-20`, `object-cover`, `autoPlay muted loop playsInline preload="metadata" poster={posterUrl}`, `aria-hidden`.
2. Existing `bg-gradient-warm` div moves to `-z-10` and gets `opacity-80` so the video tints through.
3. Add a dark `bg-gradient-to-b from-background/30 via-transparent to-background/40` vignette for text legibility at `-z-10`.
4. Keep the amber/coral blur orbs (still at `-z-10`, `opacity-60`).
5. Respect `prefers-reduced-motion` — same `useEffect` pattern as `CinematicShowcase`: pause and show poster.

The right-column decorative SVG + picsum student image stays unchanged (we already updated other photos in earlier passes).

## 2. Destinations carousel

### Edit `src/components/marketing/DestinationsGrid.tsx`
Replace the `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with the existing shadcn `Carousel` component (`src/components/ui/carousel.tsx` — already in the project, uses Embla):

- Wrap items in `<Carousel opts={{ align: "start", loop: true }} className="w-full">` with `<CarouselContent>` + `<CarouselItem className="basis-full sm:basis-1/2 lg:basis-1/3 pl-4">` per region.
- Show 1 card on mobile, 2 on `sm`, 3 on `lg`.
- Add `<CarouselPrevious />` and `<CarouselNext />` positioned top-right of the section header (over the title block, mono coral chip styling to match the section's existing eyebrow).
- Add **autoplay** via `embla-carousel-autoplay` plugin (already a sibling package — verify; if missing, install `bun add embla-carousel-autoplay`). 5s delay, pauses on hover, doesn't stop on interaction.
- Add bottom dot indicators showing current slide / total, mono small chip on the right edge (`02 / 06` style, matches the `CinematicMedia` chrome we shipped).
- Keep each card's existing visuals (image, gradient overlay, flag, ranking note, tuition/living, partner pills). Bump `min-height` to a single consistent value (~440px) so cards align in the track.
- Subtle hover: card lifts `-translate-y-1` like today, image `scale-105` on hover, ring becomes `ring-gold/30`.

### Section header
Keep the eyebrow + title + sub-copy block. Add the carousel controls (prev/next + counter) on the right side on `md+`, stacked below on mobile.

## Files touched
- **new** `src/assets/hero-bg.mp4.asset.json`
- **new** `src/assets/hero-bg-poster.jpg.asset.json`
- **edit** `src/components/marketing/Hero.tsx` (add background `<video>` layer)
- **edit** `src/components/marketing/DestinationsGrid.tsx` (grid → Carousel + autoplay + counter)
- **maybe install** `embla-carousel-autoplay` if not present

## Out of scope
- No copy / heading changes.
- No changes to `HeroMatchCard`, `LiveOffersBand`, or any other section.
- Not touching the `CinematicShowcase` video band lower on the page — that stays.

Approve and I'll generate the loop and ship both changes in one pass.