## Goal
Bring steps 1, 2, 4, 5, and 6 of the onboarding up to the visual quality of step 3 (photo cards).

## Changes

### Step 1 — Name (chalk preview)
- `src/styles.css`: `@import` Google Font **Caveat**, add `--font-chalk: 'Caveat', cursive;` and `.font-chalk` utility.
- `src/routes/onboarding.tsx` Step 1: when `full_name.trim().length >= 1`, render a "preview plate" below the input:
  - Big handwritten name `text-5xl sm:text-6xl font-chalk text-gold/90`, soft chalk-dust drop-shadow.
  - A subtle SVG scribble underline beneath the text.
  - Plate fades + slides in (`animate-in fade-in slide-in-from-bottom-2`).

### Reusable photo card
- New `src/components/onboarding/PhotoChoiceCard.tsx` (extracted from `GlassSubjectCard`): full-bleed photo, blurred bottom label band, gold check on active, `aspect-[4/5]`. Used by steps 2, 3, and 4.
- Refactor `GlassSubjectCard.tsx` to be a thin wrapper around `PhotoChoiceCard` (keeps step 3 intact, no behaviour change).

### Step 2 — Study level (photo cards)
Generate 4 images to `src/assets/levels/` (768×512, fast, cinematic navy/gold, no people front-on, no text):
- `foundation.jpg` — open textbook + warm lamp on dark desk
- `undergraduate.jpg` — university quad / sandstone archway at golden hour, moody
- `topup.jpg` — graduation cap on stack of books, gold rim light
- `postgraduate.jpg` — researcher's desk: laptop, papers, microscope silhouette, navy lighting

Replace the `CardGrid` for level with a 2-col `PhotoChoiceCard` grid using these images.

### Step 4 — Start date (photo cards)
Generate 4 images to `src/assets/intakes/` (768×512, fast, same grading):
- `may-2026.jpg` — spring blossoms on a campus path
- `september-2026.jpg` — autumn leaves on cobblestones
- `january-2027.jpg` — frosted window with warm interior glow
- `flexible.jpg` — open calendar + pen, soft bokeh

2-col `PhotoChoiceCard` grid, titles "May 2026", "September 2026", "January 2027", "Flexible / Not sure yet".

### Step 5 — Location (default city chips)
In `src/components/onboarding/LocationStep.tsx`, above the search input add a horizontally-scrollable chips row of UK cities sourced from `CAMPUSES` (London, Birmingham, Manchester, Leeds, Plymouth, Stoke). Each chip:
- Rounded-full glass button, label + tiny pin icon.
- Click → calls `pick(lat, lng)` and centres the map.
- Active city (matching current selection) gets a gold ring + gold text.

Search, "use my location" and map stay as-is.

### Step 6 — Adviser contact (polish)
In `src/routes/onboarding.tsx` Step 6:
- **Phone**: wrap in a single bordered surface; left plate `🇬🇧 +44` with a divider, input borderless inside.
- **Notes**: replace the bare `Textarea` with a labelled card ("Anything else we should know?" + helper text + live char count bottom-right, max 500).
- **Consent**: convert into a clickable card row — large tap area, custom check pill on the left (gold when checked), two-line copy ("Yes, I'd like a free call" / "We'll reach out within 1 business day").
- **Reassurance row**: small lock icon + "Your details stay private. No spam." muted, below the consent.

## Out of scope
- Mascot SVG, copy/messages, sound, validation rules, backend.

## Technical notes
- All new images imported as ES modules from `src/assets/...` and passed by reference (no runtime URLs).
- `PhotoChoiceCard` props: `{ title, image, active, onClick }`. No icons, no descriptions — keeps steps visually consistent.
- Font import added once at the top of `src/styles.css`; Caveat used only via the `.font-chalk` utility.
