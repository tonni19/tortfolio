# Deploying to Vercel

## The short version
1. Scaffold the app locally.
2. Recreate the design in it (README.md is the spec).
3. Push to GitHub.
4. Import the repo on Vercel — it autodetects Next.js and deploys on every push.
5. Point the domain.

## 1. Scaffold

```bash
npx create-next-app@latest tortfolio --ts --tailwind --app --eslint
cd tortfolio
mkdir -p public/art
# copy this bundle's art/ contents into public/art/
```

Then open Claude Code in the repo root with `CLAUDE.md` and `README.md` (from this bundle) copied in, and ask it to build the sections one at a time — Nav, Hero, About, WorkIndex, Process, Reel, Loops, Contact, then `/work/[slug]`. Check each in `npm run dev` before moving on.

## 2. Push to GitHub

```bash
git init
git add -A
git commit -m "Tortilla portfolio"
gh repo create tortfolio --private --source=. --push
# or create the repo in the GitHub UI and: git remote add origin <url> && git push -u origin main
```

## 3. Deploy

**Dashboard:** vercel.com → Add New → Project → import the repo → Framework: Next.js (autodetected) → Deploy. Nothing to configure for a static site with no env vars.

**CLI:**
```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production
```

From then on: every push to `main` ships to production, every branch and PR gets its own preview URL. That is the editing loop — commit, look at the preview, merge.

## 4. Domain
Project → Settings → Domains → add `tortilla.art` (or whatever you register). Vercel gives you the DNS records; add them at your registrar. If you buy the domain through Vercel it wires itself up. HTTPS is automatic.

## Checklist before going live
- [ ] Total page weight sane — GIFs converted to MPEG-4/WebM, nothing over ~3 MB
- [ ] Every video has `muted loop playsInline preload="metadata"`
- [ ] Lighthouse pass on mobile (the hero and marquees are the usual suspects)
- [ ] Real social URLs, real email
- [ ] `metadata` in `app/layout.tsx`: title, description, OG image (use a hero still)
- [ ] `prefers-reduced-motion` — stop the marquees and the hero sink, keep the layout
- [ ] Mobile: hero panels should stack or become a swipeable strip; the work-index cursor preview should be disabled on touch
