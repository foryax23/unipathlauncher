# Onboarding v2 — Bridge mascot + glass tiles

Move the mascot down beside the Continue button, redraw it as a polished "Bridge" character that personifies Bridge Gateway, and restyle the step-3 subject grid as glass cards with gradient icons. Keep all existing animations and add a few new ones for the new mascot.

## What changes

### 1. Mascot relocation + redesign
- **Position**: removed from the top of each step. New home: sits in the sticky bottom bar to the LEFT of the Continue button, ~64–72px tall on mobile, peeking just above the bar so it feels like a real companion watching the user finish each step.
- **New character — "Archie the Bridge"**: a stylised brass-gold suspension-bridge silhouette with two pylons (the "eyes"), a soft arch (the "smile"), and a small base. Personality comes from animation, not detail — keeps it crisp at any size.
- **Crisper rendering**: built as a clean multi-layer inline SVG using project tokens (`var(--primary)`, `var(--gold)`, `var(--surface)`):
  - Soft drop shadow under the base (SVG `<filter>` with `feGaussianBlur` + `feOffset`).
  - Subtle inner highlight on the pylons (linear gradient stop) for a metallic brass look.
  - Cable strands as thin curved paths with rounded caps.
  - Eyes are two glowing windows on each pylon (small rounded rects with a pulse).
  - A tiny pennant/flag on top that flutters.
- **Animations** (all gated by `prefers-reduced-motion`):
  - `idle` → gentle sway (rotate ±1.5°) + flag flutter
  - `thinking` → pylons blink slower, head tilts -4°
  - `happy` → pylons sparkle, arch curves up into a smile (path morph via two SVG paths cross-faded)
  - `cheer` → small jump + sparkle burst from the top of the bridge
  - `celebrate` → confetti from above + sustained sparkle, used at finish
- **Speech bubble**: stays, but anchors above the mascot in the bottom bar, max-width ~14rem, auto-hides if it would overlap the Continue button on narrow screens (<360px).

### 2. Continue bar layout
- Bottom bar becomes a 2-column grid: `[mascot 96px] [Continue button flex-1]`.
- Continue button keeps `animate-glow-pulse` on ready, `animate-shake-x` on invalid tap.
- Safe-area padding preserved.

### 3. Step 3 — Glass subject cards
- New `GlassSubjectCard` component used only by the subject step.
- Visual:
  - `backdrop-blur` glass surface (`bg-surface/60 backdrop-blur-xl border border-white/15`).
  - Large 48×48 rounded-square icon plate with **per-subject gradient** (Business→primary→gold, Computer Science→indigo→cyan, Law→navy→brass, Engineering→slate→amber, Arts→coral→pink, Health→teal→emerald, etc.) — gradient defined per subject id in a small lookup.
  - Icon rendered white inside the gradient plate; soft inner glow ring.
  - Title in display font, subtle subtitle (course count or short tag).
  - On hover/desktop: tile lifts 2px, gradient plate scales 1.05, glass border brightens.
  - On select: gold ring around the whole tile, gradient plate emits a one-shot `ring-sweep`, a small gold check sticker pops in top-right, tile gets a stronger inner glow.
- Stagger-in retained.
- Mobile: 2-column; ≥sm: 3-column. Min-height 120px to feel chunky and tappable.

### 4. Other steps — light polish
- Other step bodies untouched in structure, but the Mascot no longer takes vertical space, so the form gets more room (drop `mt-6`/`mb-4` mascot wrappers, increase content top padding slightly).

## Out of scope
- No copy changes beyond mascot speech bubble messages.
- No data model, no auth, no server function changes.
- Other steps' button styles unchanged (only step 3 gets the glass treatment).
- No new npm dependencies.

## Files touched

```
src/components/onboarding/Mascot.tsx              (rewrite — bridge character + new moods)
src/components/onboarding/GlassSubjectCard.tsx    (new — step 3 glass tile)
src/routes/onboarding.tsx                          (edit — move mascot into bottom bar grid; swap subject grid)
src/styles.css                                     (edit — new keyframes: bridge-sway, flag-flutter, window-blink, smile-morph; subject gradient utilities)
```

Approve to build.
