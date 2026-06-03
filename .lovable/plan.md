## Problem
At the bottom of the Hero, an SVG curve is filled with `text-background`. In dark mode `--background` is deep navy, so the curve renders as a dark "puddle" sitting on the gold hero video — and right after it `CinematicShowcase` starts with a totally different warm/cream surface (`bg-warm`). Result: a curved dark blob squashed between two warm sections.

## Fix
Make the Hero → CinematicShowcase seam read as one continuous canvas.

1. **`src/components/marketing/Hero.tsx`** — delete the bottom SVG curve (lines ~77-84). The hero already ends with the LiveOffersBand and warm gradient; a hard horizontal edge is cleaner than a mismatched curve.

2. **`src/components/marketing/CinematicShowcase.tsx`** — add a soft top blend so the section visually continues the hero's warm tones instead of starting cold:
   - Add a top-edge gradient overlay: `absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber/20 via-amber/5 to-transparent` (sits inside the existing `bg-warm` section, behind content).
   - Remove the `border-t border-border` (it draws a hard hairline that fights the blend).

3. No copy, no layout, no other component changes.

## Out of scope
- Other section seams (Services → Destinations etc.) — they currently look fine, only this one was flagged.
- Light-mode tweaks — fix works in both modes since we drop the offending element.

Approve and I'll apply both edits.