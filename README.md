# Tortfolio

Portfolio site for **Tortilla** (Sadia Noman Tonni) — 2D digital artist and
illustrator. Character design, game art, comics, wallpapers and hand-drawn
animation.

Next.js 16 (App Router) · React · TypeScript · Tailwind v4 · deployed on Vercel.
Fully static — no database, no environment variables, no CMS.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

| script | what it does |
|---|---|
| `npm run dev` | local dev server |
| `npm run build` | production build |
| `npm run media` | rebuild images and video from `Categorized/` |
| `npm run lint` | eslint |
| `npm run favicon` | rebuild the site icons from the avatar master |

> Never run `npm run build` while `npm run dev` is running — they share `.next`
> and it corrupts into 500s on every route. Stop both, delete `.next`, restart.

**[HANDOFF.md](HANDOFF.md)** has the full deploy walkthrough, the media
conventions and the pre-launch checklist. Start there.

## What's where

```
app/                 routes
  page.tsx             home — hero, about, works, process, reel, contact
  work/[slug]/         one page per category
  art/[category]/[slug]/   one page per artwork
  comic/[series]/      vertical comic reader
components/          UI — Hero, ReelLoops (player), Lightbox (zoom viewer),
                       ThemeToggle (day/night), …
lib/
  works.ts             the six works in section 02
  artworks.ts          per-piece titles and notes  ← hand-written
  media.generated.ts   GENERATED, do not edit
  theme.ts             the two themes and the pre-paint init script
scripts/
  build-media.mjs      the media pipeline
  make-favicon.mjs     favicon.ico / icon.png / apple-icon.png
Categorized/         master artwork — the source of truth (not in the repo)
CLAUDE.md            design rules and the traps already hit
reference/           the original design brief and prototype, for history
```

## Adding artwork

`Categorized/` is the source of truth. `public/art/` and
`lib/media.generated.ts` are both built from it and should never be edited by
hand.

1. Drop the file into `Categorized/<category>/`
2. `npm run media`
3. Add a title and note in `lib/artworks.ts`, keyed by the id the script prints
4. Commit the changes in `public/art/` and `lib/media.generated.ts`

| path | meaning |
|---|---|
| `Categorized/comic/page.png` | a standalone piece |
| `Categorized/comic/ants/01-page.png` | a **series** — the number is reading order |
| `Categorized/wallpaper/_old.png` | leading `_` keeps the file but does not publish it |

Stills become WebP capped at 2200px; videos become H.264/AAC MP4 capped at
1080px with a poster frame, audio preserved. Video compression needs **ffmpeg
on PATH** — without it videos pass through uncompressed and the script warns.

`Categorized/` is gitignored (~160 MB of masters) and ships as a separate
archive. You only need it to run `npm run media`.

## Notes

- **Day and night themes**, switched from the dial in the nav pill. A first
  visit follows the operating system; after that the choice is remembered.
  Both themes are the same set of design tokens with different values, so
  there is no second stylesheet to keep in sync — see the theme section in
  [CLAUDE.md](CLAUDE.md) before adding a colour anywhere.
- Everything is muted by default. The reel is the one exception — it carries a
  sound toggle, because some clips have a track.
- Small screens get their own layout, not a squeezed one: the nav collapses to
  a full-screen sheet, the hero becomes a grid showing all five works at once,
  and the loop shelf becomes a 2-column grid.
- Artwork titles and notes in `lib/artworks.ts` are descriptive placeholders
  written from the artwork. They are not the artist's words and she should
  review them.
