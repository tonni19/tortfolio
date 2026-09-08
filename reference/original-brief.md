# Handoff: Tortilla — 2D Animator / Digital Artist Portfolio

## Overview
A single-page personal portfolio for **Tortilla**, a 2D animator and digital artist. One long scrolling home page (hero → about → work index → process → reel → loops → contact) plus a detail view per project. Dark-ink-on-cream editorial aesthetic with heavy motion: a hero that sinks under the page on scroll, expanding hero panels, marquees, a cursor-following image preview on the work index, and hover-only animated loops.

## About the Design Files
The files in `reference/` are **design references created in HTML** — a working prototype of the intended look and behavior, not production code to copy directly. `Tortilla Portfolio.dc.html` uses a proprietary template runtime (`<x-dc>`, `<sc-for>`, `<sc-if>`, `{{ holes }}`, `support.js`) that does **not** belong in the real site.

**The task: recreate this design in a real codebase.** Recommended target (below) is Next.js + React + Tailwind, deployed on Vercel. Read the prototype for exact values and behavior, then implement idiomatically — `sc-for` becomes `.map()`, `sc-if` becomes a conditional, `renderVals()` becomes component state + derived values, inline style strings become Tailwind classes or style objects.

## Fidelity
**High-fidelity.** Colors, type, spacing, motion timing and copy are final. Recreate the UI faithfully. Copy text is the artist's and should be kept verbatim unless she changes it.

---

## Recommended target stack

```
Next.js (App Router) + React + TypeScript + Tailwind CSS
```

Why: static output, zero-config Vercel deploys, image optimization for the artwork, and a single `app/page.tsx` that maps 1:1 to the prototype.

Suggested structure:

```
app/
  layout.tsx          # fonts, global css, <html> bg
  page.tsx            # home: hero + all sections
  work/[slug]/page.tsx# project detail view
components/
  Nav.tsx  Hero.tsx  About.tsx  WorkIndex.tsx  Process.tsx
  Reel.tsx  Loops.tsx  Marquee.tsx  Contact.tsx
  FloatingPreview.tsx # cursor-following image on work index
lib/
  works.ts            # the WORKS array (see Data below)
  loops.ts            # the LOOPS array
public/art/           # all image + video assets (copied from art/ here)
```

---

## Design tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| cream | `#f6f1e7` | page background, text on sage |
| ink | `#2a2723` | body text, headlines |
| sage | `#41705f` | primary accent: navbar, buttons, marquee, labels, hover |
| sage-light | `#b9d3c7` | logo degree mark |
| sage-mid | `#8fb0a5` | hero panel second word |
| bone | `#e6dccb` | media frame background |
| bone-hover | `#ece4d6` | hover fill on process cards / next-project bar |
| panel-ink | `#e8e6e0` | hero panel first word |
| hairline | `rgba(42,39,35,.16)` | row + section dividers |
| hairline-cream | `rgba(246,241,231,.16)` | dividers over cream (legacy, same weight) |
| scrim | `linear-gradient(180deg, rgba(23,26,28,.55) 0%, rgba(23,26,28,.05) 40%, rgba(23,26,28,.8) 100%)` | hero panel overlay |

Max two background colors per screen: cream and sage. Nothing else.

### Typography
| Role | Family | Size | Other |
|---|---|---|---|
| Display / headings | **Anton** 400 | `clamp(38px,4.4vw,74px)` h2 · `clamp(48px,9vw,150px)` detail h1 · `clamp(52px,11vw,168px)` contact | line-height .9–1.02, uppercase where noted |
| Work index title | Anton | `clamp(34px,5vw,78px)` | uppercase, line-height 1 |
| Body | **Space Grotesk** 400/500/700 | 17px body, 14.5px process body | line-height 1.6–1.65, `max-width:56ch`, `text-wrap:pretty` |
| Labels / meta | **JetBrains Mono** 400 | 9–11px | `letter-spacing:.14em–.24em`, uppercase |
| Marquee (services) | Anton | 46px | uppercase, `letter-spacing:.02em` |
| Marquee (tools) | Anton | 30px | uppercase, opacity .42 |

Google Fonts: `Anton`, `Space+Grotesk:wght@400;500;700`, `JetBrains+Mono:wght@400;700`. In Next.js use `next/font/google`.

### Spacing / geometry
- Section padding: `110–120px` vertical, `28px` horizontal. Content `max-width: 1500px; margin: 0 auto`.
- Radii: `3px` (thumbs), `4px` (images), `26px 26px 0 0` (page sheet over hero), `100px` (pills).
- Shadows: `0 10px 30px rgba(42,39,35,.22)` (navbar) · `0 -30px 80px rgba(0,0,0,.75)` (sheet lip over hero) · `0 30px 70px rgba(0,0,0,.6)` (floating preview).
- Standard easing: `cubic-bezier(.16,1,.3,1)`. Reveal: opacity .85s / transform .95s.
- Custom scrollbar: 10px, track `#2a2723`, thumb `#41705f`.
- Global grain overlay: fixed, `inset:0`, `pointer-events:none`, `z-index:60`, `opacity:.055`, `mix-blend-mode:overlay`, SVG feTurbulence `baseFrequency=.85 numOctaves=3` on a 120×120 tile.

---

## Screens

### 1. Nav (fixed, both screens)
Pill bar, `position:fixed; top:14px; left:50%; translateX(-50%); z-index:50`. Background sage, border `1px solid rgba(246,241,231,.24)`, radius 100px, padding `9px 12px 9px 20px`, gap 30px, `max-width:calc(100% - 28px)`.
- Logo: "Tortilla" in Anton 19px cream, `letter-spacing:.07em`, uppercase, with a `°` in sage-light. Click → home.
- Items: `01 About · 02 Works · 03 Process · 04 Reel · 05 Loops · 06 Contact`. JetBrains Mono 11px cream, `letter-spacing:.14em`, number at 9px opacity .5, padding `8px 13px`, radius 100px. **Hover: background cream, color ink** (.25s).
- Anchors scroll to `#about #works #process #reel #loops #contact`.

### 2. Hero — 5 panels
`height:100vh; min-height:660px; position:sticky; top:0; z-index:0; overflow:hidden`. Inner flex row of 5 panels (works 0,1,2,3,5 → Wallpaper, Portrait, Brainwave, Comic, Custom).
- Each panel: `flex:1` at rest; hovered panel `flex:2.6`, siblings `flex:.85`; transition `flex .65s cubic-bezier(.16,1,.3,1)`. Non-hovered panels get `filter:grayscale(.7) brightness(.6)` (.5s). Divider `1px solid rgba(23,26,28,.6)`.
- Image: `object-fit:cover`, `filter:grayscale(.15) contrast(1.05)`. The Comic panel is a portrait comic page rotated: `position:absolute; top:50%; left:50%; width:100vh; height:auto; transform:translate(-50%,-50%) rotate(90deg)`.
- Caption block bottom-center, 26px from bottom: split title in Anton `clamp(26px,3.1vw,52px)` line-height .86 — first line `#e8e6e0`, second `#8fb0a5` (e.g. WALL / PAPER, POR / TRAIT, NIGHT / SHIFT) — then the kind label in JetBrains Mono 11px cream `letter-spacing:.2em`, 10px above. Text-shadow `0 4px 24px rgba(0,0,0,.6)`.
- Click a panel → that project's detail view.
- **Scroll behavior:** hero inner scales `1 → 0.9`, translates `0 → -40px`, opacity `1 → 0.65` across the first `100vh`. The rest of the page is a cream sheet with `border-radius:26px 26px 0 0` and a heavy top shadow that slides over the hero (`z-index:2`). Implement with a scroll-driven CSS animation (`animation-timeline: scroll(root)`) and a throttled rAF fallback — see `reference/tortilla-scroll.js`. **Do not** run an unthrottled per-frame scroll loop; that was the original performance bug.

### 3. Services marquee
Sage band, cream text, `padding:12px 0`, `border-top:2px solid #2a2723`. Two identical duplicated tracks translating `0 → -50%` over 26s linear infinite. Items, gap 44px, separated by `✦` at opacity .45: 2D Animation · Character Design · Illustration · Frame by Frame.

### 4. 01 / About
Grid `1.15fr .85fr`, gap 70px, padding `120px 28px 110px`.
- Left: mono eyebrow `01 / ABOUT` (sage, 10px, .24em); h2 Anton `clamp(38px,4.4vw,74px)` line-height 1.02, `text-wrap:balance`; two paragraphs 17px/1.65 opacity .78 `max-width:56ch`; CTA pill "Get in touch →" — sage bg, cream text, Anton 16px uppercase, padding `15px 26px`, radius 100px, **hover → cream bg / ink text**, links to `#contact`.
- Right: `art/comic.jpg` full width, radius 4px, plus a sage circle badge 104×104 at `top:-26px; right:-14px`, border `1px solid rgba(246,241,231,.3)`, mono 9px cream "OPEN / FOR / WORK" on three lines, bobbing `translateY 0 → -14px` over 5s ease-in-out infinite.

### 5. 02 / Selected Works (index)
Header row: eyebrow `02 / SELECTED WORKS` (sage) left, `2021 — 2026` (opacity .4) right, `border-bottom:1px solid rgba(246,241,231,.16)`, `padding-bottom:16px`.
Six rows, each `display:flex; align-items:center; gap:24px; padding:26px 10px 26px 4px; border-bottom:1px solid rgba(42,39,35,.16)`:
`num (38px, mono 10px, opacity .45)` · `title (Anton clamp(34px,5vw,78px), uppercase, flex:1)` · `meta (200px, mono 10px, right, opacity .55)` · `↗ (26px, opacity .5)`.
- **Hover:** row color → sage, `padding-left: 4px → 26px` (.4s), non-hovered rows drop to opacity .55. Row text is ink by default and sage on hover — never cream-on-cream.
- **Floating preview:** `position:fixed`, 240×300, `margin:-150px 0 0 -120px` so it centers on the cursor, follows `mousemove` on the section, `z-index:40`, `pointer-events:none`, radius 3px, shadow `0 30px 70px rgba(0,0,0,.6)`. Idle: `opacity 0, rotate(-14deg) scale(.85)`; active: `opacity 1, rotate(-4deg) scale(1)` (opacity .35s, transform .5s). All six images are stacked inside and cross-faded by opacity (.18s linear) — **only the hovered row's image is visible**. Mount all images once and toggle opacity; do not swap `src` (that caused the "shows the previous hover" bug).

### 6. 03 / Process
Eyebrow `03 / PROCESS`. 4-column grid, `gap:1px` on a `rgba(246,241,231,.16)` background with a matching 1px border, so the gaps read as hairlines. Each cell: cream bg, `padding:34px 26px 40px`, `min-height:280px`, hover fill `#ece4d6`. Content: Anton 52px sage number (opacity .85), Anton 24px uppercase title, 14.5px/1.6 body at opacity .65.
Steps: **01 Scribble · 02 Rough Pass · 03 Clean & Colour · 04 Deliver** (copy in Data below).

### 7. 04 / Reel (featured player)
Eyebrow `04 / REEL` plus the featured clip's meta in mono 10px opacity .45.
Frame: `height:min(74vh,700px)`, `aspect-ratio` set from the clip's real intrinsic ratio (read on `loadedmetadata`, fall back 16/9 for video, 9/16 for GIF), `margin:0 auto`, bone bg, `1px solid rgba(42,39,35,.18)`, `overflow:hidden`, cursor pointer. Media `height:100%; width:auto; max-width:100%; object-fit:contain`.
- Autoplays muted, loops.
- Overlays: filename bottom-left (mono 10px cream, .18em, text-shadow); **PLAY / PAUSE pill** bottom-right — `padding:8px 14px`, radius 100px, `background:rgba(42,39,35,.72)`, mono 10px cream. Click anywhere on the frame toggles playback; the label mirrors the element's real state (bind to `play`, `pause`, `canplay`).
- The player's source is whichever loop card was last clicked in section 05.

### 8. 05 / Loops
Eyebrow `05 / LOOPS` + hint `CLICK ANY LOOP TO PLAY IT IN THE REEL ABOVE`.
Row: `display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:18px`.
Each card: shared `height:min(44vh,380px)`, `width: height × own aspect ratio` (so the 16:9 video is wide and the 9:16 GIFs are narrow — no letterboxing, no dead gutter on the right). Frame: bone bg, `1px solid rgba(42,39,35,.18)`; the card currently in the reel gets a **2px sage border** and `translateY(-4px)`.
- Badge top-left, `padding:5px 10px`, radius 100px, mono 9px: inactive `rgba(246,241,231,.9)` bg / ink text reading **PLAY IN REEL**; active sage bg / cream text reading **IN REEL**.
- Caption below the frame: two stacked lines, mono 9.5px, `letter-spacing:.16em`, opacity .55 — filename then note.
- **Hover-only playback.** At rest every card is a still frame: videos are paused (`preload="metadata"`), GIFs show a captured first frame (draw the loaded GIF to a canvas once, then render the resulting PNG until hover). On `mouseenter` the video plays and the GIF swaps back to the animated file; on `mouseleave` both return to the still. Never have four clips animating at once — that was the original load problem. In React, prefer a poster JPG/PNG exported per GIF at build time over the canvas trick.
- Clicking a card sends it to the reel above **and pauses the card itself**.

### 9. Tools marquee
Same mechanics as the services marquee, 34s, Anton 30px, opacity .42, gap 56px, hairline top and bottom, `padding:26px 0`: Huion · Clip Studio · Callipeg · Procreate · Adobe · Wacom.

### 10. 06 / Contact
Centered, `padding:120px 28px 70px`. Eyebrow `06 / CONTACT`. Giant mailto link "Let's make / it move" — Anton `clamp(52px,11vw,168px)`, line-height .92, uppercase, ink, **hover → sage**, `mailto:hello@tortilla.art`. Below: four mono 11px `.18em` links, gap 30px, wrapping — HELLO@TORTILLA.ART · INSTAGRAM · BEHANCE · TUMBLR (social hrefs are `#` placeholders and need real URLs). Footer line at `margin-top:70px`, mono 10px opacity .35: `©2026 TORTILLA — ALL DRAWINGS MINE`.

### 11. Project detail view
Route it as `/work/[slug]` in the real site (the prototype swaps state). `padding-top:78px` to clear the navbar.
- `← BACK TO INDEX` mono 10px opacity .6.
- Title block: h1 Anton `clamp(48px,9vw,150px)` line-height .9 uppercase; right-aligned meta + tools in mono 10px opacity .6, line-height 2; `border-bottom` hairline, `padding-bottom:26px`.
- Hero image: `width:100%; max-height:78vh`, radius 4px. `object-fit: contain` on bone bg for page-based projects (comic, wallpaper), `cover` otherwise.
- Two-column grid `1fr 1.1fr`, gap 70px, `padding:64px 28px`. Left: `THE BRIEF` eyebrow + brief paragraph + a fixed second paragraph ("Rough pass first, then clean line, flats, and a shading pass. The loop runs on twos so the movement keeps a bit of grit.").
- Right, projects **without** pages: a 3-column grid of frame thumbs, `aspect-ratio:3/4`, radius 3px, bone bg, images `grayscale(1) contrast(1.1)` at opacity .55 → **hover: full color, opacity 1**, with an `F001`-style mono 9px label at `left:8px; top:8px`.
- Right, projects **with** pages: a short note block (`pagesTitle` + `pagesNote`), and the pages themselves render full-width below in a `max-width:1180px` column, `gap:18px`, each with a mono 10px opacity .4 caption (`PAGE 01`, `WALLPAPER 01`). The phone wallpaper (`wp3`) is capped at `max-width:420px` and centered.
- Footer bar: `NEXT PROJECT` eyebrow + next project title in Anton `clamp(40px,7vw,110px)` sage, whole bar clickable, hover fill `#ece4d6`, hairline top, `padding:70px 28px`.

---

## Interactions & behavior summary
| Interaction | Detail |
|---|---|
| Hero panel hover | `flex` 1 → 2.6 (.65s cb(.16,1,.3,1)); siblings .85 and dimmed |
| Hero scroll | scale 1→.9, Y 0→-40px, opacity 1→.65 over 100vh; throttled rAF or scroll timeline |
| Section reveal | `[data-reveal]`: from `opacity 0, translateY(30px)`, IntersectionObserver (`rootMargin: 0 0 -6% 0`, threshold .02), one-shot. **Fail open** — if the observer never fires, content must still be visible |
| Work row hover | color → sage, padding-left → 26px, others fade to .55 |
| Floating preview | fixed, follows cursor, cross-faded stack, rotate/scale in |
| Loop card hover | that card only starts animating; leaves → still frame |
| Loop card click | becomes the reel source, reel plays, card pauses |
| Reel click | toggles play/pause; pill label follows real element state |
| Marquees | duplicated track, `translateX 0 → -50%`, linear infinite, 26s / 34s |
| Badge blink | `0,92,100% opacity 1; 94,98% opacity .15` over 3s (available, currently unused) |
| **Audio** | **Everything is muted, always.** Set `muted`, `defaultMuted`, `volume=0` on mount and on `play/playing/loadeddata/volumechange/canplay` (capture phase), plus a 500ms interval sweep. In the real site the same guard belongs in one small client component or hook |

## State
| State | Purpose |
|---|---|
| `hero: number` | hovered hero panel index, -1 none |
| `row: number` | hovered work-index row, -1 none |
| `cx, cy: number` | cursor position for the floating preview |
| `featured: number` | which loop is loaded in the reel |
| `playing: boolean` | reel play state, synced from the video element |
| `ratios: Record<string,number>` | intrinsic aspect ratios measured from media |
| `posters: Record<string,string>` | captured GIF first frames (replace with static poster files) |
| `hoverLoop: number` | which loop card is hovered, -1 none |
| route param | replaces `screen`/`currentId` — use `/work/[slug]` |

No data fetching. All content is static and belongs in `lib/works.ts` / `lib/loops.ts`.

---

## Data

### Works (order = index order; hero shows ids 0,1,2,3,5)
| id | num | title | split | kind | image | meta | tools |
|---|---|---|---|---|---|---|---|
| 0 | 001 | Wallpaper | WALL / PAPER | WALLPAPERS | match.jpg | PERSONAL — 2026 | CLIP STUDIO |
| 1 | 002 | Portrait | POR / TRAIT | ILLUSTRATION | fish.jpg | EDITORIAL — 2025 | PROCREATE |
| 2 | 003 | Brainwave | BRAIN / WAVE | KEY ART | brain.jpg | ALBUM ART — 2025 | CLIP STUDIO |
| 3 | 004 | Comic | CO / MIC | COMIC SERIES | comic-p1.jpg (rotated in hero) | SHORT COMIC — 2025 | CLIP STUDIO |
| 4 | 005 | Nightshift | NIGHT / SHIFT | COMIC | stars.jpg | SHORT COMIC — 2024 | CLIP STUDIO |
| 5 | 006 | Custom | CUS / TOM | COMMISSIONS | cyclist.jpg | COMMISSION WORK — OPEN | CLIP STUDIO / PROCREATE |

Page sets: Wallpaper → `wp1, wp2, wp3` (word "WALLPAPER", title `DOWNLOAD THE SET · 3 WALLPAPERS`, note "Two desktop, one phone. Drawn on a black field so they sit quietly behind your icons."). Comic → `comic-p1…p4` (word "PAGE").

Briefs (verbatim — do not rewrite):
- **Wallpaper:** "Chibi wallpapers for desktop and phone. Minimal black fields with one small character parked in the corner, so icons still have somewhere to live."
- **Portrait:** "Two fish, two moods. Painted for a print run about colour in cold water."
- **Brainwave:** "Cover art for a record that sounded like a pink pool in a green valley. I took that literally."
- **Comic:** "Four pages about a boy who kicks an anthill, gets hit by a car, and wakes up convinced he has become an ant. The ants have their own side of the story."
- **Nightshift:** "Panel one of a six-page comic about someone who cannot sleep and the room that keeps her company."
- **Custom:** "I take commissions. Character portraits, couple and group pieces, pet portraits, album and poster art, profile pictures, and short animated loops. Send me a reference or just a description and I will send back a sketch before any colour goes down."

### Process steps (verbatim)
- **01 Scribble** — "Thumbnails on paper until the pose reads at the size of a thumbnail. Nothing precious survives this stage."
- **02 Rough Pass** — "Key frames blocked out on twos. This is where the timing gets decided and most of the personality shows up."
- **03 Clean & Colour** — "Line goes down, flats go in, then a shading pass. Palette is usually three loud colours and one that argues."
- **04 Deliver** — "Loops exported as GIF, MP4 and a frame sheet, plus the layered file so you can keep working on it."

### Loops
| file | type | caption | reel meta |
|---|---|---|---|
| reel.mp4 | video 16:9 | LOOP_REEL.MP4 · PERSONAL · 2026 | HAND DRAWN · ON TWOS |
| house.gif | gif | LOOP_HOUSE.GIF · HAND DRAWN · ON TWOS | FRAME BY FRAME |
| loop2.mp4 | video 16:9 | LOOP_KIRBY.MP4 · PERSONAL · 2026 | CHARACTER LOOP |
| loop-window.gif | gif 9:16 | LOOP_WINDOW.GIF · PERSONAL · 2026 | FRAME BY FRAME |

### About copy (verbatim)
Heading: "Hi, I'm Tortilla — a 2D animator and digital artist making characters that refuse to sit still."
P1: "I draw people, animals and the odd sentient matchstick. Most of my work starts as a scribble in a sketchbook and ends as a loop — hand-drawn frame by frame, coloured loud, animated with a bit of a swagger."
P2: "Commissions, character sheets, promo loops, comics. If it moves and it has a face, I want to draw it."

---

## Assets
All in `art/` in this bundle → copy to `public/art/` in the real project. Every JPEG is already compressed for web.

`match.jpg fish.jpg brain.jpg smoke.jpg stars.jpg cyclist.jpg cat.jpg lemon.jpg comic.jpg comic-p1…p4.jpg wp1.jpg wp2.jpg wp3.jpg house.gif loop-window.gif reel.mp4 loop2.mp4`

All artwork is the artist's own. `smoke.jpg`, `cat.jpg`, `lemon.jpg` are used only as detail-view frame thumbs.

Asset notes for the real build:
- Serve the two GIFs as MP4/WebM as well — GIF is the heaviest format here and hover-only playback is easier with `<video>`.
- Export a static poster image per loop so cards need no canvas trick.
- Use `next/image` for stills; leave the reel and loop clips as plain `<video muted loop playsInline preload="metadata">`.
- Anything over ~3 MB should be re-encoded before it goes in the repo.

## Open content work
- Replace the `#` social links with real Instagram / Behance / Tumblr URLs.
- Confirm `hello@tortilla.art` is the real address.
- Real client names where meta currently reads PERSONAL / EDITORIAL.

## Files in this bundle
- `README.md` — this spec
- `CLAUDE.md` — drop into the new repo root so Claude Code has the full design context
- `VERCEL.md` — from empty folder to live domain
- `reference/Tortilla Portfolio.dc.html` — the prototype (design reference only)
- `reference/tortilla-scroll.js` — scroll/reveal/mute engine, readable as plain JS
- `reference/support.js` — prototype runtime, **not** for production
- `art/` — all assets
