## Diagnosis
In dark mode `--surface-warm` (used by `CinematicShowcase` via `bg-warm`) resolves to dark navy — not warm at all. The hero ends bright gold/amber, the next section starts dark navy, and the 40px amber blend I added is way too short to bridge that contrast. Result: a hard horizontal seam.

## Fix — give the seam a real bridge

Two coordinated edits create a smooth ~240px gradient transition from hero-gold down into the showcase's dark surface.

1. **`src/components/marketing/Hero.tsx`** — add a tall fade at the bottom of the hero that goes from transparent to the next section's surface color, so the hero visually dies into navy before the section line. Insert just before `</section>`:
   ```tsx
   <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent via-[var(--surface-warm)]/40 to-[var(--surface-warm)]" />
   ```

2. **`src/components/marketing/CinematicShowcase.tsx`** — replace the short `h-40 from-amber/25` blend with a taller layered blend so the top of the section *receives* a warm hint from above before settling into its own surface:
   ```tsx
   <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-amber/30 via-amber/10 to-transparent" />
   ```

Net effect: hero gold → soft amber haze → dark navy, no hard edge.

## Also apply the same principle to other seams (quick pass)
Audit the section boundaries on the homepage and add matching `h-32` to `h-48` gradient fades only where two adjacent sections have visibly different background tones. Specifically check:
- `ServicesBand` → `DestinationsGrid` (light surface → muted surface)
- `HowWeHelp` → `WhyUs`
- `StatsBand` → `TestimonialsMarquee`

For any pair where the tones already match (both `bg-background`, both `bg-surface-muted`), no change. Goal: no jarring step between any two consecutive sections.

## Out of scope
- Copy, layout, component reorder.
- Light-mode redesign — token values stay as they are; we only add transition gradients.

Approve and I'll ship the fixes.