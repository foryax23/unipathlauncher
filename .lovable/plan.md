## Goal
Turn the flat 3-icon-circle ServicesBand into a dynamic, editorial 3-card module that's interesting to scroll past.

## Direction
Keep the same 3 services and links — only change the visual treatment. Adopt the same cinematic chrome already used by `CinematicMedia` / `CinematicShowcase` so it feels of-a-piece with the rest of the page.

## New layout per card (instead of icon-on-circle + centred text)

A tall asymmetric card (`min-h-[360px]`), bottom-aligned content, hover-driven motion:

- **Background**: relevant generated image (UK campus, adviser meeting, passport+visa documents) with `bg-gradient-to-t from-foreground/90 via-foreground/55 to-foreground/10` overlay so text stays readable.
- **Top-left chrome chip**: `01 / 03` mono index in coral, matching the `CinematicMedia` index chip.
- **Top-right ken-burns**: image inside its own container with `animate-[kenburns_18s_ease-in-out_infinite_alternate]` for slow zoom (reusing the keyframe already defined in `styles.css`).
- **Hover sheen sweep**: reuse the `sheen-sweep` keyframe — diagonal gold gradient sweeps once per hover, `group-hover:animate-[sheen-sweep_1.4s_ease-out]`.
- **Icon → small mono badge**: keep the lucide icon but shrunk to `h-4 w-4`, sitting inside a rounded gold/10 pill alongside the eyebrow `RESEARCH` / `ADVISE` / `APPLY` label. Replaces the big circle.
- **Title**: `text-2xl font-editorial italic` for the keyword + `font-sans` for the rest (matches hero treatment).
- **Body**: white/80, 2-3 lines, never collides with title.
- **CTA**: same arrow link but with `underline-offset-4 group-hover:underline` and a gold dot before the text on hover.
- **Card frame**: `rounded-3xl ring-1 ring-white/10 hover:ring-gold/40 hover:-translate-y-1` with `transition-all duration-500`.
- **Reveal**: wrap the grid in `useReveal` (the existing hook) so cards fade-up with a 100ms stagger on scroll.

## Section frame
- Replace the centred eyebrow + headline with the same layout but with a small floating coral pulse-dot before the eyebrow (same dot as elsewhere on the page).
- Add a subtle dot-pattern background (`bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] bg-[size:24px_24px] opacity-40`) behind the cards for texture — disabled under `prefers-reduced-motion` (purely CSS, so unconditional is fine).
- Keep `bg-warm` so it flows from the showcase above.

## Assets
3 new images (1280×960, `imagegen standard`), uploaded via `lovable-assets`:
- `service-universities.jpg` — UK university quad with sandstone, autumn light
- `service-adviser.jpg` — student + adviser at desk, warm tones, side-light
- `service-scholarship.jpg` — flat-lay of UK passport, visa letter, calculator, soft gold light

Pointer files: `src/assets/service-*.jpg.asset.json`.

## Files touched
- **new** `src/assets/service-universities.jpg.asset.json`
- **new** `src/assets/service-adviser.jpg.asset.json`
- **new** `src/assets/service-scholarship.jpg.asset.json`
- **edit** `src/components/marketing/ServicesBand.tsx` — full rewrite of card markup, keep SERVICES data and Links intact.

## Out of scope
- Copy changes (titles, body, CTAs all stay the same).
- Routing or data changes.
- Other sections — only ServicesBand.

Approve and I'll generate the images and ship.