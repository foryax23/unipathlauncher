## Goal
Make the "Research. Analyse. Apply." services section feel premium and alive with thoughtful, professional motion — not generic fade-ins.

## Changes (single file: `src/components/marketing/ServicesBand.tsx`)

### 1. Eyebrow + headline reveal
- Eyebrow "RESEARCH. ANALYSE. APPLY." → animate each word in sequence (stagger 120ms) with a subtle blur-up + fade, and animated separator dots pulsing between words.
- Headline → word-by-word mask reveal (translateY 100% → 0 with overflow-hidden clip) on scroll-in via IntersectionObserver (reuse `useReveal`).
- Add a thin coral underline that draws in (scaleX 0 → 1, 600ms ease-out) under the eyebrow once visible.

### 2. Service cards — premium hover + entrance
- Entrance: each card fades + lifts (translateY 24px → 0) with 150ms stagger between cards, triggered when section enters viewport.
- Icon medallion:
  - Replace flat rounded square with a circular gold gradient badge (matches the screenshot's aesthetic) with a soft outer glow ring.
  - On entrance: badge scales from 0.6 → 1 with spring-like ease, icon inside fades in 200ms after.
  - On hover: badge gets a slow rotating conic-gradient halo ring (3s linear infinite) + 1.05 scale; icon does a subtle wiggle.
- Card body:
  - Wrap in a group with hover lift (-translateY 4px) + shadow bloom.
  - Animated underline on the CTA link (existing `story-link` pattern: scaleX origin-left on hover).
  - Arrow `→` in CTA translates right 4px on hover.

### 3. Connecting motion between cards (desktop only, md+)
- Add a thin dashed gold line that animates drawing horizontally between the three icon badges on scroll-in (SVG `stroke-dasharray` animation, 1200ms). Reinforces the "Research → Analyse → Apply" flow.
- Hidden on mobile (single column doesn't need it).

### 4. Ambient background motion
- Two soft gold/coral radial blurs in the section background that drift slowly (translate 20px loop, 12s ease-in-out infinite alternate) for life without distraction.

## Technical notes
- All animations use CSS keyframes added inline via Tailwind arbitrary values or a small `<style>` block — no new dependencies.
- Scroll-triggered reveals use the existing `useReveal` hook pattern (IntersectionObserver, one-shot).
- Respect `prefers-reduced-motion`: all motion wrapped with `motion-reduce:animate-none motion-reduce:transition-none`.
- Mobile viewport (390px): cards stack, connecting line hidden, entrance stagger preserved, hover effects degrade gracefully to tap states.

## Out of scope
- No copy changes, no new services, no changes to other sections, no routing changes.
- No new npm packages.
