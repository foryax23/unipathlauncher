
# Plan: Swap brand mark to the new gold bridge logo

The new logo is the gold-ring bridge mark you uploaded. Today, every place that shows the brand goes through `src/components/marketing/Logo.tsx`, which renders an inline SVG (a thin arc + a small gold dot). Replacing the mark in one place updates the navbar, footer, auth card, dashboard header, and the reset-password screen automatically.

## Steps

1. **Register the file as a Lovable Asset**
   - `mkdir -p src/assets`
   - `lovable-assets create --file /mnt/user-uploads/ChatGPT_Image_Jun_2_2026_09_11_39_PM.png --filename bgc-logo.png > src/assets/bgc-logo.png.asset.json`
   - This keeps the binary on the CDN and gives us a typed `{ url }` import.

2. **Update `src/components/marketing/Logo.tsx`**
   - Replace the inline SVG `Mark` with an `<img>` using the imported asset.
   - Sizes per variant (the logo is a circle, so width = height):
     - `full` (navbar / footer / auth): 36×36 px
     - `mark` (icon-only spots): 32×32 px
     - `stacked` (login hero): 64×64 px
   - Add `alt="Bridge Gateway Consulting"`, `loading="eager"`, `decoding="async"`.
   - Drop the `text-foreground currentColor` styling since the artwork is already gold; keep a subtle drop-shadow class so it reads on both light and dark backgrounds.
   - Leave the wordmark text and tagline untouched.

3. **Favicon + share image (so it shows up in browser tabs and link previews too)**
   - Save a copy of the PNG to `public/favicon.png` and `public/apple-touch-icon.png`.
   - In `src/routes/__root.tsx` `head().links`, add:
     - `{ rel: "icon", type: "image/png", href: "/favicon.png" }`
     - `{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" }`
   - In `head().meta`, set a default `og:image` / `twitter:image` to the new logo URL so social cards aren't blank.

## Out of scope (ask if you want them)

- Generating a separate dark-background variant of the artwork.
- Building a multi-resolution favicon set (`.ico`, 16/32/192/512).
- Animating the logo on hover.

Confirm and I'll ship it.
