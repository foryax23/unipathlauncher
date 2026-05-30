## Goal
Make Archie the Bridge's messages much more engaging — cheeky, playful, on-brand for a UK university journey — with dynamic variations per state instead of one-liner stubs.

## Approach
In `src/routes/onboarding.tsx`, replace each step's single `mascotMsg` string with a small helper that returns a contextual message based on the current input state (empty / typing / valid / invalid). Keep all logic in the frontend; no backend or component changes.

## Per-step copy (cheeky companion voice)

**Step 1 — Name**
- Empty: "Right then — what shall I call you?"
- 1 char: "Don't stop now, keep going…"
- Valid: `"${firstName}! Brilliant name. Let's build your path."`

**Step 2 — Level**
- Empty: "Pick your starting block — no wrong answers."
- Selected: rotates per choice
  - Foundation: "Foundations first — that's how every great bridge starts."
  - Undergraduate: "A classic. UK unis love an undergrad."
  - Top-up: "Smart move — finish what you started."
  - Postgraduate: "Ooh, the brainy route. Respect."

**Step 3 — Subject**
- Empty: "What gets you out of bed?"
- Selected: per subject
  - business-finance: "Future CEO energy. Noted."
  - computer-science: "0s and 1s it is. Very 2026."
  - law: "Objection: this is a great choice."
  - health-social-care / public-health: "Caring careers. The UK needs you."
  - engineering: "Bridges, literally. We're soulmates."
  - arts-design: "Creative chaos incoming."
  - education: "Shaping minds. Big deal."
  - hospitality-tourism: "Tea, biscuits, world tour. Sorted."
  - psychology: "Reading me already, aren't you?"
  - default: "Lovely. Adding it to your file."

**Step 4 — Start date**
- Empty: "When do we kick off?"
- May 2026: "Spring start — sunshine and freshers' fairs."
- September 2026: "The big one. Most courses, most options."
- January 2027: "Winter intake — fewer crowds, same degree."
- Not sure: "Flexible — my favourite kind of student."

**Step 5 — Location**
- Empty: "Where in the world are you?"
- Found: `"${city ?? "Got it"}! I'll find unis near you."`

**Step 6 — Phone + consent**
- Empty phone: "Pop your number in — one call, that's it."
- Invalid phone: "Hmm, that doesn't look quite right…"
- Valid phone, no consent: "Tick the box and we're golden."
- Valid + consent: "Perfect. An adviser will be in touch."

**Step 7 — Account**
- Signed in: `"Welcome back, ${firstName}. One tap to finish."`
- Empty: "Last step! Save your shortlist."
- Invalid email: "Real email please — no funny business."
- Short password: "6 characters minimum — keep it safe."
- Valid: "Smashing. Hit Finish and let's go."

## Implementation
Single file change in `src/routes/onboarding.tsx`. Replace each step object's `mascotMsg: ...` with a derived expression. Add a small `SUBJECT_MSGS` and `LEVEL_MSGS` map near `SUBJECT_ICONS`. No new files, no styling changes, no behavior changes.

## Out of scope
- Mascot visuals/animation (already done)
- Message bubble layout (already done)
- Sound, validation logic
