# Tortilla Portfolio — project context

Personal portfolio site for **Tortilla**, a 2D animator and digital artist. Built from a high-fidelity HTML prototype; `README.md` in the handoff bundle is the authoritative spec (colors, type, per-section layout, motion timings, verbatim copy, data tables). Read it before changing UI.

## Stack
Next.js App Router + React + TypeScript + Tailwind. Static, deployed on Vercel. No CMS, no database.

## Media pipeline — read this before touching images
`Categorized/` is the source of truth. `npm run media` ingests it:

    Categorized/<category>/<file>            -> a standalone piece
    Categorized/<category>/<series>/NN-file  -> an ordered series (comics)

It writes optimised files to `public/art/<category>/` and regenerates
`lib/media.generated.ts` (never edit that by hand). Titles and notes live in
`lib/artworks.ts`, keyed by the generated id `<category>/<slug>`.

- Series pages take their reading order from a numeric filename prefix.
- `public/art/legacy/` holds bundle-era art the script does not own. The
  script only clears the category folders it generates — **never** wipe
  `public/art` wholesale, those legacy files are not in git.
- A work in `lib/works.ts` points at a `category`, so uploading a file puts it
  on the site with no code change.

## Small screens get their own layout, not a squeezed one
Below `md` the nav collapses into a full-screen sheet, the hero becomes a
2x2+1 grid showing all five works at once, and the loop shelf becomes a
2-column grid. Horizontal scroll rails were tried and rejected: they hide
content behind a gesture nobody knows is there. Only the marquees scroll
sideways, because they animate on their own. Every control has a 44px hit
area on a coarse pointer.

## Design rules
- Palette is exactly: cream `#f6f1e7`, ink `#2a2723`, sage `#41705f`, plus bone `#e6dccb` / `#ece4d6` for media frames and hover fills. Max two background colors per screen. Do not introduce new colors or gradients.
- Fonts: Anton (display), Space Grotesk (body), JetBrains Mono (labels/meta, always uppercase with wide letter-spacing).
- Standard easing `cubic-bezier(.16,1,.3,1)`. Motion is a feature of this site — keep it.
- Editorial, generous whitespace, hairline dividers, no card shadows except the three documented ones.

## Non-negotiable behaviors
1. **Muted by default, everywhere.** `MuteGuard` forces `muted` + `defaultMuted` + `volume=0` on mount, on media events (capture phase), and a periodic sweep. The reel is the one exception: its player carries `data-allow-audio` and a Sound on/off control, because some clips have a track. Nothing else may make noise, and nothing autoplays audible — browsers only allow autoplay while muted.
2. **Loop cards animate on hover only.** Never four clips playing at once.
3. **Reveal animations fail open.** If IntersectionObserver never fires, content is visible — never ship a section that can stay at `opacity:0`. Verify with the stranded-reveal check, not by eye.
4. **Scroll work is throttled** (rAF-coalesced or a CSS scroll timeline). No unthrottled per-scroll layout reads.
5. **Text contrast:** ink on cream, cream on sage. Never cream text on a cream ground; work-index rows are ink by default and sage on hover.
6. **Copy is the artist's.** Do not rewrite briefs, about text, or process copy.

## Known traps from the prototype
- **CSS layering.** Tailwind v4 emits utilities inside `@layer utilities`, and unlayered CSS beats layered CSS regardless of specificity. A bare `a { color }` written outside a layer silently overrides every `text-*` utility on every link — it made the nav and CTA pills render sage-on-sage, i.e. invisible. Element rules go in `@layer base`, our classes in `@layer components`. Never add an unlayered rule to `globals.css`.
- The work-index preview is a **pinned panel in a sticky left column** — it does not follow the cursor (changed from the prototype at the artist's request). It must still mount every image once and cross-fade opacity; swapping `src` shows the previous project's image for a frame.
- `Reveal` needs a huge `rootMargin` top value. An element the user jumps past via a nav anchor goes from ratio 0 (below viewport) to ratio 0 (above viewport) without ever crossing the threshold, so no callback fires and it is stranded at `opacity: 0` forever.
- Loop card sizing: one shared height, width computed from each clip's own intrinsic ratio. Fixed aspect boxes produced letterboxing and a dead right gutter.
- The comic hero panel is a portrait page rotated 90° with `width:100vh` so the full page reads across the panel.
