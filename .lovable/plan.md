# Engaging Onboarding — Duolingo-style

Transform the 7-step onboarding into a delightful, mobile-first flow with playful animations, haptic-feeling micro-interactions, a friendly mascot, and celebratory feedback after each step. Desktop keeps the same flow but with calmer animation.

## What changes (user-facing)

1. **Mascot companion** — a friendly owl-style SVG character (built in code, no external assets) sits at the top of each step, reacting to user actions: idle bob, "thinking" tilt while empty, "happy" bounce + sparkles when a step is valid, "cheer" jump on Continue.
2. **Step transitions** — swipe-style slide between steps (forward = slide-in-right, back = slide-in-left) instead of always bottom-up. Old step fades + scales out, new step springs in. Honors `prefers-reduced-motion`.
3. **Progress bar** — segmented (one pill per step, like Duolingo's hearts/lessons row) with a fill animation when a step completes, and a soft "ping" pulse on the just-completed segment. XP-style "+1" floats up next to the bar when advancing.
4. **Per-step interactions**:
   - **Name**: animated cursor caret, characters pop in with a tiny scale on each keystroke (CSS only, no per-char DOM). Mascot starts waving once 2+ chars typed.
   - **Level / Start year / Subject cards**: tap → spring scale + colored ring sweep + check-mark draw-in (SVG stroke-dashoffset). Unselected cards dim slightly. Long-press shows a subtle haptic-style wobble.
   - **Subject grid**: stagger-in on mount (each card fades+rises with 40ms delay), icon does a small rotate on hover/tap.
   - **Location**: pin "drops" with a bounce when coordinates resolve; ripple ring expands once.
   - **Phone/consent**: input border animates to success-green when regex passes; consent checkbox draws its check with SVG stroke animation.
   - **Account**: Google button has a subtle shimmer; on success the mascot does a confetti burst (CSS-only confetti, ~12 spans).
5. **Continue button** — sticky bottom bar gets a pulsing glow when the step becomes valid (signaling "ready!"). Tap → button compresses, mascot cheers, step advances. Disabled state is greyed but the button gently shakes if tapped while invalid (cue to fill missing field).
6. **Sound (optional, off by default)** — small mute/unmute toggle in header that, when on, plays a soft "ding" on advance and "pop" on selection (Web Audio API oscillator — no asset files). Persisted in localStorage. Default: off, so silent UX is unchanged.
7. **Completion** — final "Finish" tap triggers a full-screen confetti + mascot celebration overlay (1.2s) before navigating to dashboard.

## Out of scope

- No changes to data model, server functions, auth flow, or step order/validation.
- No copy rewrites beyond mascot speech bubbles.
- No new dependencies — all animations via Tailwind keyframes + CSS + small SVG components.

## Technical plan

**New files**
- `src/components/onboarding/Mascot.tsx` — SVG owl with `mood` prop (`idle | thinking | happy | cheer | celebrate`) driving CSS animation classes.
- `src/components/onboarding/StepShell.tsx` — wraps each step body, handles enter/exit transition based on `direction` (forward/back).
- `src/components/onboarding/SegmentedProgress.tsx` — replaces current `<div>` progress bar; renders N pills, fills the completed ones with gradient.
- `src/components/onboarding/Confetti.tsx` — pure CSS confetti burst, mounted on cheer + completion.
- `src/hooks/use-onboarding-sound.ts` — tiny Web Audio API helper (ding/pop), respects mute toggle and `prefers-reduced-motion`.

**Edited files**
- `src/routes/onboarding.tsx` — wire mascot + StepShell + SegmentedProgress; track `direction` state for transitions; trigger confetti on Finish; sticky button gets `is-ready` class.
- `src/styles.css` — add keyframes: `bob`, `cheer-jump`, `sparkle`, `ring-sweep`, `check-draw`, `pin-drop`, `ripple`, `shake`, `glow-pulse`, `confetti-fall`, `pop-in`, `slide-in-from-right-spring`, `slide-out-to-left-spring`. Wrap heavy ones in `@media (prefers-reduced-motion: no-preference)`.

**Reduced-motion**
All animations gated. With reduced motion the mascot stays static, transitions become simple opacity fades, confetti is replaced with a single emoji burst.

**Mobile-first**
All animations tuned for mobile (≤480px). Desktop (≥768px) uses softer easing and shorter distances so it doesn't feel cartoonish on large screens. Mascot scales down on desktop to 64px and floats to the side instead of full-width.

## Files touched

```
src/routes/onboarding.tsx                          (edit)
src/styles.css                                     (edit, append keyframes)
src/components/onboarding/Mascot.tsx               (new)
src/components/onboarding/StepShell.tsx            (new)
src/components/onboarding/SegmentedProgress.tsx    (new)
src/components/onboarding/Confetti.tsx             (new)
src/hooks/use-onboarding-sound.ts                  (new)
```

Approve to build.
