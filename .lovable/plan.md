## UniPath — UK university lead-gen funnel

A single long-scroll landing page built into this TanStack Start app, with course data extracted from your uploaded PDF (May/June 2026 intake), leads persisted in Lovable Cloud, and a password-gated admin panel.

### Brand & design system
- Name: **UniPath**, custom inline SVG logo (graduation cap + upward arrow path mark)
- Tokens added to `src/styles.css` (oklch):
  - Primary navy `#0f2b5b`, accent gold `#e8b84b`, paper/ink surfaces, ring/border, muted
  - Full light + dark variants; sun/moon toggle in header (persists in `localStorage`)
- Typography: Google Fonts `Instrument Serif` (headings) + `Work Sans` (body), with preconnect in `__root.tsx` head
- British English copy throughout
- No purple gradients, no blob shapes, no coloured icon circles — editorial Oxbridge-meets-SaaS feel

### Page structure (`src/routes/index.tsx` + section components)
All sections live in `src/components/sections/` and compose into the single landing route. Smooth-scroll nav via `scroll-margin-top` + anchor links.

1. **Header** — logo, anchor nav (How, Courses, Stories, FAQ), theme toggle, primary CTA
2. **Hero** — full-bleed campus image (picsum seed `cambridge-quad`), animated subtle gradient overlay, H1, sub, two CTAs, stats bar
3. **How it works** — large `01 / 02 / 03` numerals, alternating editorial text+image rows
4. **Course categories** — 8 cards driven by PDF data, grouped into UK student-facing subject buckets:
   - Business & Finance, Health & Social Care, Public Health, Computer Science, Law, Engineering & Tech, Arts & Design, Education
   - Each card lists 2–3 real partner institutions extracted from the PDF (e.g. LSC/CCCU, University of Suffolk, University of Bolton, GBS, Arden, London Met, Mont Rose, Staffordshire, Leeds Trinity, William College)
   - Click pre-selects subject in the form and scrolls to it
5. **Social proof** — 3 testimonials (Aisha 19 Manchester, Daniel 22 Birmingham, Priya 24 London), star ratings, partner institution text-badge row, "Featured in" strip
6. **Lead capture** — 3-step form with progress bar:
   - Step 1 About You · Step 2 Your Studies (subject/level/start year) · Step 3 Your Goals (reason, source, GDPR consent)
   - Zod validation, inline errors, smooth step transitions, success state with personalised thank-you
7. **FAQ** — 6 accordion items (UCAS, fees, loans, Clearing, entry requirements, international students)
8. **Sticky mobile CTA** — appears after hero on <768px
9. **Footer** — logo, Privacy/Terms/Contact, Instagram/TikTok/LinkedIn icons, reassurance line

### Lead storage — Lovable Cloud
- Table `leads` (RLS enabled):
  - `id uuid pk`, `created_at`, `name`, `email`, `phone`, `city`, `subject`, `study_level`, `start_year`, `reason`, `source`, `consent bool`
  - INSERT policy: `WITH CHECK (true)` for `anon` (public form)
  - SELECT policy: only `admin` role (via `user_roles` + `has_role()`)
- Submit path: server function `submitLead` (`src/lib/leads.functions.ts`) using `supabaseAdmin`, validates with Zod, inserts row
- Admin path: server function `listLeads` gated by `requireSupabaseAuth` + `has_role(admin)`

### Admin panel
- Route: `/admin` (separate route, gated). Hash `#admin-view` on home redirects there.
- Auth: Lovable Cloud email/password sign-in; role check via `user_roles` table (`admin` enum). The "password `unipath2025`" from your brief becomes an actual admin account you create on first run — safer than a hardcoded client-side password.
- UI: lead count badge, sortable table (Name, Email, Phone, City, Subject, Level, Start Year, Submitted), **Export CSV** button (client-side blob download)

### Animations & UX
- Scroll-reveal via `IntersectionObserver` hook (opacity + translateY, respects `prefers-reduced-motion`)
- Hover lift on course cards (transform + shadow, no colour borders)
- Tap targets ≥44px, focus rings, WCAG AA contrast verified in both themes
- Semantic HTML5, single `<h1>`, correct heading hierarchy
- SEO: route `head()` with title, description, og tags

### Technical notes
- Stack stays TanStack Start (the project requires it — no standalone HTML file)
- New files: `src/routes/index.tsx` (rewrite), `src/routes/admin.tsx`, `src/components/ui-marketing/*` (Header, Hero, HowItWorks, Courses, Testimonials, LeadForm, FAQ, StickyCTA, Footer, ThemeToggle, Logo), `src/components/sections/data/courses.ts` (extracted from PDF), `src/lib/leads.functions.ts`, `src/hooks/use-theme.ts`, `src/hooks/use-reveal.ts`
- Tokens in `src/styles.css`, fonts preconnected in `__root.tsx`
- One migration: `leads` table + `user_roles` + `app_role` enum + `has_role()` function + RLS policies
- Enables Lovable Cloud (per your answer)

### What I'll do on approve
1. Enable Lovable Cloud, run migration
2. Extract & curate course list from the PDF into `courses.ts`
3. Build tokens, fonts, theme toggle
4. Build sections + form + animations
5. Build admin route with auth + CSV export
6. QA: verify dark mode, mobile (375px), form submit round-trip, admin list
