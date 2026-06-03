## Goal
Showcase the uploaded video on the homepage as a cinematic, branded moment — not a plain `<video>` tag dropped on the page.

## Placement
Insert a new **CinematicShowcase** section on `/` (`src/routes/index.tsx`) between `Hero` and `ServicesBand`. This is the highest-attention slot right after the headline and match card, where a moving visual reinforces the brand promise before users scroll into static service cards.

## Asset handling
- Upload the MP4 via `lovable-assets create` → `src/assets/bgc-showcase.mp4.asset.json` (CDN-hosted, keeps repo light).
- Generate a still poster frame (first frame) and upload as `bgc-showcase-poster.jpg.asset.json` so the section renders instantly before the video buffers.

## Component: `src/components/marketing/CinematicShowcase.tsx`
A full-bleed cinematic band with these design moves:

1. **Framed stage** — video sits inside a rounded `rounded-[2.5rem]` container with `ring-1 ring-white/10` and a soft `shadow-2xl shadow-coral/20` glow, on top of the warm gradient bg used elsewhere (`bg-gradient-warm` faded behind, or warm cream `bg-warm` for contrast — see Tech Notes).
2. **Cinematic aspect** — `aspect-[21/9]` on desktop, `aspect-video` on mobile, so it reads as widescreen film, not a square clip.
3. **Autoplay, muted, loop, playsInline** — required for mobile autoplay. `preload="metadata"`, `poster={posterUrl}`.
4. **Reduced motion respect** — if `prefers-reduced-motion: reduce`, do not autoplay; show poster with a play button instead.
5. **Scroll-reveal** — reuse the existing `useReveal` hook for fade-up entrance, matching `HowItWorks` rhythm.
6. **Parallax-lite** — translate the video container `-translate-y-2` on scroll using a small `IntersectionObserver` ratio for a subtle "rising into frame" feel (CSS-only, no libs).
7. **Gradient vignette overlay** — `bg-gradient-to-t from-black/40 via-transparent` inside the frame so any overlaid copy stays legible.
8. **Overlaid editorial copy** (bottom-left of the frame):
   - Eyebrow (mono, tracked): `INSIDE BRIDGE GATEWAY`
   - Headline (serif/editorial): `A 60-second look at your UK journey.`
   - Sub: one line, muted-white.
   - CTA chip linking to `/onboarding` ("Start your match").
9. **Corner meta** — small top-right mono label `LIVE · 2026` and a subtle play/mute toggle (top-left) so users can unmute. Mute toggle uses `lucide-react` `Volume2` / `VolumeX`.
10. **Section frame** — section has its own `py-24 lg:py-32` band with eyebrow + section title above the video ("See it in motion"), keeping the rhythm consistent with `HowItWorks` and `WhyUs`.

## Accessibility & performance
- `<video>` gets `aria-label` and a visible caption summary below the frame.
- `controls` shown when user pauses or unmutes (custom toggle); native controls hidden by default for cinematic feel.
- `preload="metadata"` (not `auto`) so we don't block LCP.
- Poster image is `loading="eager"` for the above-the-fold scenario.

## Tech Notes
- All styling via existing tokens (`bg-warm`, `bg-gradient-warm`, `text-coral`, `text-gold`, `font-editorial`, `font-mono`, `border-border`) — no new colors.
- No new dependencies — `lucide-react` is already in the project.
- Files touched:
  - **new** `src/assets/bgc-showcase.mp4.asset.json`
  - **new** `src/assets/bgc-showcase-poster.jpg.asset.json`
  - **new** `src/components/marketing/CinematicShowcase.tsx`
  - **edit** `src/routes/index.tsx` (import + render `<CinematicShowcase />` between `<Hero />` and `<ServicesBand />`)

## Out of scope
- No changes to Hero, ServicesBand, or any other section.
- No analytics events on play/pause (can add later if wanted).
- No second video slot elsewhere on the site — confirm if you want it also on About/Services.
