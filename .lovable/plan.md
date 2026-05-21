# Redesign inspired by UniEnrol + remove em dashes

## What the reference shows

Looking at the two screenshots:
1. **Hero**: bold red→orange gradient backdrop with soft cloud curves at the bottom; centered headline ("Apply with Malaysia's Trusted Education Consultant"); compact paragraph; a white **match card** on the left with nationality selector + big red pill CTA; on the right, a cut-out student photo on a warm-toned globe with line-art landmarks (Big Ben, Sydney Opera House, plane).
2. **Services band**: white background, small red eyebrow ("RESEARCH. ANALYSE. APPLY"), bold centered H2 ("Easy Access to Course Info & Student Services"), 3 columns each with an icon, title, copy and a text link ("Explore University →"). Below: "EXPLORE STUDY DESTINATIONS" eyebrow + a horizontal destinations row with landmark illustrations and country flags.

Our current site already has the warm coral/amber palette, glass match card, and landmark line art — close but less punchy. The redesign aligns layout/typography/proportions to the reference while keeping our UniPath UK content.

## Plan

### 1. Hero (`src/components/marketing/Hero.tsx`)
- Switch backdrop to a stronger **coral→amber gradient** (similar to UniEnrol red→orange) with the soft white curve at the bottom of the section.
- Center-align the headline + subcopy at the top on desktop (instead of left split), then place the **match card on the left** and the **student image with landmark line art on the right**, both rising into the curve.
- Tighten copy hierarchy: eyebrow ("UK's trusted student platform"), bold 2-line H1, 1-sentence sub.
- Keep current stats but move them under the curve in a thin band so the hero stays focused.
- Match card: tighten to a single primary control (study level) + big red/coral pill CTA — current `HeroMatchCard` already does this, just restyle for stronger contrast and a flag-style left adornment.

### 2. Services / How-we-help band (`src/components/marketing/HowWeHelp.tsx`)
- Rework to mirror the reference: small coral uppercase eyebrow, large centered H2, 3 equal columns (icon, title, body, text-link CTA). Use existing copy categories (Match courses, 1-to-1 guidance, Apply & visa).
- Use existing tokens (`text-coral`, `bg-warm`) — no new colors.

### 3. Destinations intro (`src/components/marketing/DestinationsGrid.tsx`)
- Keep the grid but prepend a header block styled like the reference: coral eyebrow "EXPLORE STUDY DESTINATIONS" + bold H2 "Start your successful study journey across the UK" + 1-line sub. (Mostly already there — tighten typography to match.)

### 4. Remove em dashes (—) sitewide
Replace every `—` with a comma, period, or colon based on sentence flow in:
- `src/components/marketing/*.tsx` (Hero, HeroMatchCard, HowWeHelp, WhyUs, DestinationsGrid, Courses, FAQ, HowItWorks, Testimonials)
- `src/components/marketing/data/testimonials.ts`
- `src/components/auth/AuthCard.tsx`
- `src/routes/*.tsx` (index, login, signup, reset-password, courses, admin, __root, _authenticated/onboarding, _authenticated/dashboard)
- `src/server.ts` (only if user-visible strings)

Rule: in marketing copy default to a comma; in titles like "Sign in — UniPath" use a middle dot `·` or pipe `|` (use `·` for consistency).

## Out of scope
- No logo/nav restructure (we keep UniPath branding + current header).
- No new images generated; we reuse current Picsum student photo and inline SVG landmarks.
- No backend / auth / admin changes.

## Technical notes
- Pure presentation work in `src/components/marketing/*` + a search/replace pass for `—`.
- All colors via existing tokens in `src/styles.css` (`--coral`, `--amber`, `--gradient-warm`, `--surface-warm`).
- No new dependencies, no route changes.
