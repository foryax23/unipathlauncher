### Navbar Redesign: Glassmorphic Floating Pill + Simplified Theme Toggle

#### What we will change

1. **Header.tsx** -- Transform the full-width sticky bar into a floating glassmorphic pill:
   - Wrap the inner content in a rounded container (`rounded-2xl` or `rounded-full`) instead of spanning the full viewport width
   - Add generous horizontal margins so it floats above the content with breathing room
   - Strengthen the glass effect: higher blur + subtle inner glow / gradient border
   - Add a soft shadow for depth
   - Keep the layout: logo left, nav links center, actions right
   - Refine nav links to be smaller, more minimal text with a subtle hover underline or background pill effect
   - Keep existing sticky positioning but with top padding so it doesn't touch the viewport edge
   - Ensure mobile hamburger menu still works (or is prepared for)

2. **ThemeToggle.tsx** -- Make it smaller and simpler:
   - Reduce from `h-11 w-11` to `h-8 w-8` (32px)
   - Remove the chunky border, use a minimal ghost style or a very subtle background
   - Smaller icon (`h-4 w-4`)
   - Remove focus ring bloat, keep a subtle focus outline
   - Consider a smooth icon rotation/swap animation between Sun and Moon

#### Technical notes
- Uses existing design tokens from `src/styles.css` (`--glass`, `--glass-border`, `backdrop-filter`, etc.)
- Pure CSS changes, no new dependencies
- `prefers-reduced-motion` already respected globally
- No backend or auth logic touched

#### Files to edit
- `src/components/marketing/Header.tsx`
- `src/components/marketing/ThemeToggle.tsx`