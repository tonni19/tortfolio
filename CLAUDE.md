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

## Two themes, one set of token names
Day and night, switched from the nav pill (`ThemeToggle`) and stored in
`localStorage`. `data-theme` on `<html>` is the only switch; the inline
script in `app/layout.tsx` writes it before first paint, seeded from
`prefers-color-scheme`, so there is no flash and no `prefers-color-scheme`
fallback in the CSS.

The token names are **roles, not colours**. `--color-cream` means "the page"
and is a plum-black at night; `--color-ink` means "the text on the page" and
is warm paper at night. That is why `bg-cream`, `text-ink` and every
`bg-sage`/`text-cream` pairing flip on their own, and why adding a dark theme
touched almost no components.

- Never write a raw colour in a component. If a value needs to differ per
  theme it is a token in `:root` + `:root[data-theme="dark"]`.
- Three tokens deliberately never flip, because they sit on artwork or in the
  always-dark lightbox where "light" is a fact about the surface, not a
  theme: `--color-panel-ink`, `--color-on-media`, `--color-accent-fixed`.
  **Text over a photo uses `text-on-media`, not `text-cream`** — `text-cream`
  is the page colour and goes black at night.
- The accent brightens at night (`#b0305a` → `#ef6f95`) because Deep Rose is
  3.2:1 on the dark ground and the eyebrows it colours are 10px. Both themes
  clear 4.5:1 on every pairing; the audit is in the scratchpad harness.
- Surfaces that are dark *on purpose* rather than dark *by theme* use
  `--matte` (reel stage), `--chip-bg`/`--chip-fg` (labels on artwork) and
  `--nav-sheet-bg` (the phone menu — flipping it with the accent made it a
  full-bleed hot pink at night).
- The flip animates as a circular wipe from the toggle via the View
  Transitions API. **Desktop only.** No API, a coarse pointer, or reduced
  motion, and it simply changes. Most of what a theme switch costs is the
  full-viewport repaint that both paths pay; the wipe adds a snapshot on top
  of it (mean worst frame 106ms vs 90ms on a throttled 390x844 DPR-3
  profile), and a 480ms animation gives those dropped frames somewhere to
  show, while the same hitch on an instant change is one invisible frame.
- **Measure theme-switch performance with the flip direction held constant.**
  Light-to-dark and dark-to-light do not cost the same, so a harness that
  just taps the button repeatedly alternates direction and attributes the
  difference to whatever it was actually testing. That artifact produced a
  confident, wrong finding that the grain overlay was costing 90ms on phones;
  held constant, it costs nothing (68.1ms mean with it, 69.6ms without).
- **Nothing may change size between themes.** The old-and-new snapshots of a
  view transition are overlaid, so any layout difference shows up as text
  ghosting at the wipe edge. The toggle's `DAY`/`NIGHT` label caught this:
  `NIGHT` is 15px wider, and because the nav pill is centred that width
  landed as a 7.6px sideways jump on every link in the nav. Both words are
  now stacked in one grid cell and switched with `visibility`, never
  `display`. The layout-diff harness in the scratchpad checks this.
- **The wipe does not use the house easing**, and this is deliberate. A wipe
  is judged by the speed of its *edge*, and `cubic-bezier(.16,1,.3,1)` spends
  half its duration in its last 3% of travel. That last 3% of radius only
  lands in the corner furthest from the button, so three corners cleared in
  138ms and the fourth crept in over the remaining 482ms — it read as the
  bottom-left corner lagging. It is now near-linear, 480ms, with the radius
  overshot 6% so the easing's dead tail falls off screen. Edge speed across
  the four corners went from a 7000x spread to 2.9x.

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
5. **Text contrast:** ink on cream, cream on sage — in both themes, since those are roles. Never cream text on a cream ground; work-index rows are ink by default and sage on hover.
6. **Copy is the artist's.** Do not rewrite briefs, about text, or process copy.

## Known traps from the prototype
- **CSS layering.** Tailwind v4 emits utilities inside `@layer utilities`, and unlayered CSS beats layered CSS regardless of specificity. A bare `a { color }` written outside a layer silently overrides every `text-*` utility on every link — it made the nav and CTA pills render sage-on-sage, i.e. invisible. Element rules go in `@layer base`, our classes in `@layer components`. Never add an unlayered rule to `globals.css`.
- The work-index preview is a **pinned panel in a sticky left column** — it does not follow the cursor (changed from the prototype at the artist's request). It must still mount every image once and cross-fade opacity; swapping `src` shows the previous project's image for a frame.
- `Reveal` needs a huge `rootMargin` top value. An element the user jumps past via a nav anchor goes from ratio 0 (below viewport) to ratio 0 (above viewport) without ever crossing the threshold, so no callback fires and it is stranded at `opacity: 0` forever.
- Loop card sizing: one shared height, width computed from each clip's own intrinsic ratio. Fixed aspect boxes produced letterboxing and a dead right gutter.
- The comic hero panel is a portrait page rotated 90° with `width:100vh` so the full page reads across the panel.
