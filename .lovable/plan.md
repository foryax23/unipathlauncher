## Goal
Replace the random `picsum.photos` placeholders across the homepage with purposeful, on-brand UK student imagery. The current photos (Golden Gate Bridge, rainy city window, Scottish coastal cottages) are irrelevant to "UK universities", "scholarships", and "expert advisers" and weaken trust.

## Sections affected

### 1. WhyUs cards (`src/components/marketing/WhyUs.tsx`) — the three cards in the screenshot
- **Direct access to 40+ UK universities** → photo of a recognisable UK university campus / quad (e.g. Oxbridge-style spires, students walking under arches).
- **Save more with scholarships** → photo of a smiling student holding an acceptance letter / graduation cap with coins/notes motif, or a student celebrating with a laptop.
- **Expert UK education advisers** → photo of a warm 1:1 adviser meeting (adviser + student at a desk, laptop open, UK setting).

### 2. HowItWorks steps (`src/components/marketing/HowItWorks.tsx`)
- **01 Tell us your interests** → student filling out a form on a phone/laptop in a cozy study setup.
- **02 We match you to universities** → adviser pointing at a UK university shortlist on a screen / map of UK with pins.
- **03 Get expert guidance** → real adviser-student conversation, UK office feel (different angle from WhyUs card 3 so they don't repeat).

## Approach
- Generate 6 bespoke images with `imagegen--generate_image` (model `standard`, 4:3 aspect ≈ 1024×768).
- Upload each to the CDN via `lovable-assets create` → `.asset.json` pointers in `src/assets/`.
- Import the pointers in the two components and replace the `picsum.photos` URLs.
- Keep alt text descriptive for accessibility/SEO; keep all existing layout, tokens, and animations untouched.

## Out of scope
- `DestinationsGrid` (still uses picsum but each card represents a UK region — separate pass if you want).
- Hero, Testimonials, and any other section.
- Copy changes — only the images swap.

## Files touched
- **new** `src/assets/why-universities.jpg.asset.json`
- **new** `src/assets/why-scholarships.jpg.asset.json`
- **new** `src/assets/why-advisers.jpg.asset.json`
- **new** `src/assets/how-step-01.jpg.asset.json`
- **new** `src/assets/how-step-02.jpg.asset.json`
- **new** `src/assets/how-step-03.jpg.asset.json`
- **edit** `src/components/marketing/WhyUs.tsx`
- **edit** `src/components/marketing/HowItWorks.tsx`

Confirm and I'll also swap the `DestinationsGrid` region photos in the same pass if you want.