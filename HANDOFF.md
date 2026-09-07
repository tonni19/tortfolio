# Tortfolio — Tortilla portfolio site

Next.js 16 (App Router) + React + TypeScript + Tailwind v4. Fully static, no
database, no environment variables.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run media        # rebuild images/video from Categorized/ (see below)
npm run lint
```

> Do not run `npm run build` while `npm run dev` is running — they share
> `.next` and it corrupts it. If routes start returning 500, stop everything,
> delete `.next`, and start again.

## Push to GitHub

```bash
git init
git add -A
git commit -m "Tortfolio"
gh repo create tortfolio --private --source=. --push
```

`node_modules`, `.next` and `Categorized/` are gitignored.

## Deploy to Vercel

1. vercel.com → **Add New → Project** → import the repo
2. Framework is auto-detected as Next.js. **Nothing to configure** — no env
   vars, no build overrides.
3. Deploy.

Every push to `main` ships to production; every branch gets a preview URL.

**Domain:** Project → Settings → Domains → add the domain, then add the DNS
records Vercel gives you at the registrar. HTTPS is automatic.

## Adding new artwork

The site reads from `public/art/` and `lib/media.generated.ts`, both of which
are **generated** from the `Categorized/` folder of master files.

`Categorized/` is not in the repo — it is ~160 MB of masters and git is the
wrong place for it. It is delivered as a separate archive. To add or change
artwork you need it:

1. Put the folder back at the project root
2. Drop the file into `Categorized/<category>/`
3. `npm run media`
4. Add a title and note in `lib/artworks.ts`, keyed by the id the script
   prints
5. Commit the changed files in `public/art/` and `lib/media.generated.ts`

Conventions the pipeline understands:

| Path | Meaning |
|---|---|
| `Categorized/comic/page.png` | a standalone piece |
| `Categorized/comic/ants/01-page.png` | a **series** — the number is reading order |
| `Categorized/wallpaper/_old.png` | leading `_` keeps the file but does not publish it |

Images are re-encoded to WebP (long edge 2200px) and videos to H.264/AAC MP4
(long edge 1080px, audio preserved) with a poster frame. **ffmpeg must be on
PATH** for video compression; without it videos are copied through uncompressed
and the script warns.

## Where things live

```
app/            routes — home, /work/[slug], /art/[category]/[slug], /comic/[series]
components/     UI; ReelLoops (player), Lightbox (zoom viewer), Hero, Marquee…
lib/works.ts    the six works in section 02, each pointing at a category
lib/artworks.ts per-piece titles and notes  ← hand-written
lib/media.generated.ts  GENERATED — do not edit
scripts/build-media.mjs the pipeline
public/art/legacy/      art from the original handoff that predates the pipeline
CLAUDE.md       design rules and the traps that have already bitten us
```

## Before going live

- [ ] Real Behance/Tumblr URLs, or leave them out (currently Instagram only)
- [ ] Confirm `hello@` address — currently `sadiatonni1916@gmail.com`
- [ ] Set the real domain in `metadataBase` in `app/layout.tsx`
      (currently `https://tortilla.art`)
- [ ] Artist to review the titles and notes in `lib/artworks.ts` — they are
      descriptive placeholders written from the artwork, not her words
- [ ] Artist to sign off the Game Characters brief in `lib/works.ts`, drafted
      from her CV
