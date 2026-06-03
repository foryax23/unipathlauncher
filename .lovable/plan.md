## Goal
The 5 picsum placeholders in the **"How we help"** section (`HowWeHelp.tsx`, the five-step product walkthrough) are off-brand and static. Replace them with bespoke, on-theme images and wrap each in a cinematic media frame with subtle motion so the section reads like an editorial product film, not a stock-photo grid.

## What I'll generate (5 images, 3:2, standard quality)
1. **Personalised recommendations** → moody hero shot of a sleek dashboard mockup on a laptop showing a UK universities match list, soft coral/gold rim light.
2. **Research checklist** → top-down editorial shot of a notebook + phone showing a checklist, warm desk lamp, university brochures.
3. **Course comparison** → cinematic close-up of a side-by-side comparison table on a tablet, finger about to tap, shallow depth of field.
4. **Parent / guardian access** → warm candid shot of a parent and student reviewing a laptop together on a sofa, golden window light.
5. **Application & visa support** → editorial flat-lay of UK passport, UCAS-style application papers, laptop with deadline tracker, coffee.

All uploaded via `lovable-assets create` → `src/assets/help-step-0[1-5].jpg.asset.json`.

## Cinematic media frame (new component `CinematicMedia`)
A reusable wrapper used inside each step:
- **Outer**: existing `rounded-3xl border bg-surface shadow-xl` + the existing `bg-gradient-warm` blur halo behind.
- **Ken-burns**: image gets `scale-[1.08]` baseline and animates to `scale-100` over ~14s on an infinite alternate loop (`@keyframes kenburns` added to `styles.css`). Disabled under `prefers-reduced-motion`.
- **Reveal**: reuse `useReveal` so each frame fades up + the image fades in with a slight `clip-path` reveal from bottom.
- **Scroll parallax-lite**: `IntersectionObserver` ratio → translates the image `-translate-y-[6%]` to `translate-y-[6%]` across the viewport (CSS variable, no libs). Subtle, not jumpy.
- **Sheen sweep**: a one-time diagonal gradient sweep across the frame when it first enters view (`@keyframes sheen`, masked overlay), giving a "film leader" cinematic moment.
- **Corner meta chip**: small mono `0X / 05` label top-left and a coral pulse dot top-right, matching the section's `font-mono · uppercase · tracking-[0.24em] · text-coral` rhythm.
- **Bottom gradient vignette**: `bg-gradient-to-t from-background/40 via-transparent` for depth.

## Files touched
- **new** `src/assets/help-step-01.jpg.asset.json` … `help-step-05.jpg.asset.json`
- **new** `src/components/marketing/CinematicMedia.tsx`
- **edit** `src/components/marketing/HowWeHelp.tsx` — wire the 5 new images, render through `CinematicMedia`, attach the `0X / 05` index.
- **edit** `src/styles.css` — add `@keyframes kenburns` + `@keyframes sheen` + a `@media (prefers-reduced-motion: reduce)` override.

## Out of scope
- `HowItWorks` (the 3-step section we just updated — already cinematic-enough, no changes).
- Copy / bullet lists / section heading — unchanged.
- New libraries — pure CSS + existing `useReveal` hook only.

Approve and I'll generate the assets and ship it.