## Goal
1. Make Archie's speech-bubble text larger and easier to read.
2. Add a tasteful, design-consistent representative photo to each Step-3 subject card.

## Changes

### 1. Bubble text size — `src/components/onboarding/Mascot.tsx`
- Bump bubble from `text-[11px]` to `text-sm` (14px), padding from `px-3 py-1.5` to `px-4 py-2`, remove the `hidden sm:block` so it shows on mobile too (now that the mascot sits above the button there's room), and allow up to ~280px wrap (`max-w-[280px] whitespace-normal text-center`).

### 2. Subject photos

**Generate 10 photos** to `src/assets/subjects/{id}.jpg` (1024×1024, fast tier) — real-photo style but uniformly graded to fit the dark glassmorphic theme: cinematic, soft moody lighting, navy/gold colour cast, slight depth-of-field, no people's faces front-on (use hands, silhouettes, objects), no text/logos. Prompts per subject:
- business-finance: hands on laptop with charts, warm gold accents, dark navy desk
- health-social-care: stethoscope on linen, soft teal light
- public-health: clean lab beakers + leaf, teal/gold lighting
- computer-science: macro of glowing keyboard keys, blue-gold bokeh
- law: gavel and legal book stack, brass and navy
- engineering: blueprint with brass compass and gears, moody
- arts-design: paint palette and brushes overhead, dark wood, gold highlights
- education: stacked books with an apple, warm rim light, navy backdrop
- hospitality-tourism: vintage globe and passport, warm lamp light
- psychology: brain anatomical model on dark desk with soft amber light

**Update `GlassSubjectCard.tsx`**:
- Add optional `image?: string` prop.
- Restructure: card becomes a 16:9 photo at top (rounded-t-2xl, object-cover) with a gradient overlay (`from-background/95 via-background/60 to-transparent`) for legibility; icon plate floats over the photo bottom-left; title sits below the photo. Min-height grows to ~180px. Active state keeps gold ring + check sticker.
- Ambient gradient orb removed (photo replaces it).

**Update `src/routes/onboarding.tsx`**:
- Add a `SUBJECT_IMAGES` map importing each generated asset.
- Pass `image={SUBJECT_IMAGES[c.id]}` to `GlassSubjectCard`.

## Out of scope
- Mascot SVG, messages, other steps, sound.
