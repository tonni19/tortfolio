/**
 * Static content for the portfolio. No CMS, no fetching.
 * Copy is the artist's — see CLAUDE.md, do not rewrite briefs or notes.
 *
 * Intrinsic dimensions are measured from the files in public/art so
 * next/image can reserve space without a layout shift.
 */

import { media } from "./media.generated";

/**
 * Every work now points at a category folder, so covers and pieces all come
 * from lib/media.generated.ts. The old bundle art in public/art/legacy/ is no
 * longer referenced by any page.
 */

type WorkInput = {
  slug: string;
  title: string;
  /** Split title for the hero caption: first line panel-ink, second sage-mid. */
  a: string;
  b: string;
  kind: string;
  /**
   * Category folder in Categorized/. Everything dropped in there shows on
   * this work's page automatically — no code change needed.
   */
  category?: string;
  /** Media id used for the hero panel and the work-index preview. */
  cover?: string;
  meta: string;
  tools: string;
  brief: string;
};

/** `id` and `num` are derived from position — see WORKS below. */
export type Work = WorkInput & { id: number; num: string };

/**
 * Order here is the order of section 02. Every work appears in that index,
 * including the ones the hero does not have room for.
 */
const WORK_INPUTS: readonly WorkInput[] = [
  {
    slug: "wallpaper",
    title: "Wallpaper",
    a: "WALL",
    b: "PAPER",
    kind: "WALLPAPERS",
    category: "wallpaper",
    cover: "wallpaper/strike",
    meta: "PERSONAL · 2026",
    tools: "CLIP STUDIO",
    brief:
      "Chibi wallpapers for desktop and phone. Minimal black fields with one small character parked in the corner, so icons still have somewhere to live.",
  },
  {
    slug: "portrait",
    title: "Portrait",
    a: "POR",
    b: "TRAIT",
    kind: "ILLUSTRATION",
    category: "portrait",
    cover: "portrait/smoke",
    meta: "PERSONAL · 2025",
    tools: "CLIP STUDIO / PROCREATE",
    brief:
      "Painted portraits. People, animals, and whatever the light is doing behind them.",
  },
  {
    slug: "game-characters",
    title: "Game Characters",
    a: "GAME",
    b: "CHARACTERS",
    kind: "GAME ART",
    category: "game-characters",
    cover: "game-characters/model-sheet",
    meta: "GAME JAM · 2026",
    tools: "ASEPRITE / CLIP STUDIO",
    // Drafted from the artist's CV — needs her sign-off before launch.
    brief:
      "Character work for A Small Journey, a narrative platformer about empathy built in Godot 4 with two developers under game jam conditions. Designs, in-game assets, and the comic-panel sequences that open and close the game: panel layout, line art, colour and hand lettering.",
  },
  {
    slug: "comic",
    title: "Comic",
    a: "CO",
    b: "MIC",
    kind: "COMIC SERIES",
    category: "comic",
    cover: "comic/we-stay-prepared",
    meta: "SHORT COMIC · 2025",
    tools: "CLIP STUDIO",
    brief:
      "Five pages about a boy who kicks an anthill, gets hit by a car, and wakes up convinced he has become an ant. The ants have their own side of the story.",
  },
  {
    slug: "animation",
    title: "Animation",
    a: "ANI",
    b: "MATION",
    kind: "FRAME BY FRAME",
    category: "animation",
    cover: "animation/sunburst",
    meta: "PERSONAL · 2026",
    tools: "CALLIPEG / CLIP STUDIO",
    brief:
      "Hand-drawn animation on twos. Short loops and longer scenes, exported as MP4 with the frame sheet and layered file alongside.",
  },
  {
    slug: "custom",
    title: "Custom",
    a: "CUS",
    b: "TOM",
    kind: "COMMISSIONS",
    category: "custom",
    cover: "custom/car-14-livery",
    meta: "COMMISSION WORK · OPEN",
    tools: "CLIP STUDIO / PROCREATE",
    brief:
      "I take commissions. Character portraits, couple and group pieces, pet portraits, album and poster art, profile pictures, and short animated loops. Send me a reference or just a description and I'll send back a sketch before any colour goes down.",
  },
];

/**
 * `id` is the array index and `num` is derived from it, so the two can never
 * drift out of sync with the display order the way hand-written values did.
 */
export const WORKS: readonly Work[] = WORK_INPUTS.map((work, i) => ({
  ...work,
  id: i,
  num: String(i + 1).padStart(3, "0"),
}));

/**
 * The five works that get a hero panel, in panel order. The hero has room for
 * five of seven; Brainwave and Nightshift are index-only and still appear in
 * full in section 02.
 */
export const HERO_SLUGS = [
  "wallpaper",
  "portrait",
  "game-characters",
  "comic",
  "custom",
] as const;

/**
 * Resolves a work's cover to something an <Image> can actually render.
 * A video cover falls back to its poster frame — pointing next/image at an
 * .mp4 renders a broken image, which is exactly what happened to Animation.
 */
export function coverOf(work: Work): { src: string; width: number; height: number } {
  if (work.cover) {
    const item = media(work.cover);
    return {
      src: item.kind === "video" ? (item.poster ?? item.src) : item.src,
      width: item.width,
      height: item.height,
    };
  }
  throw new Error(`Work "${work.slug}" has no cover.`);
}

export const HERO_WORKS: readonly Work[] = HERO_SLUGS.map((slug) => {
  const work = WORKS.find((w) => w.slug === slug);
  if (!work) throw new Error(`HERO_SLUGS references unknown work "${slug}"`);
  return work;
});

/**
 * Section 03. Rewritten from the commission workflow on the artist's CV:
 * scope and pricing agreed up front, style matched to the brief, layered
 * sources delivered with the finals, check-ins at agreed milestones.
 */
export const PROCESS_STEPS = [
  {
    num: "01",
    title: "Brief & Scope",
    body: "We agree scope, pricing and revision rounds before anything gets drawn, so we both know what is being made.",
  },
  {
    num: "02",
    title: "Thumbnails",
    body: "Rough passes until the pose and the composition read at the size of a thumbnail. Nothing precious survives this stage.",
  },
  {
    num: "03",
    title: "Line & Colour",
    body: "Line, flats, then a shading pass, in whatever the brief calls for: pixel, vector, painted or inked.",
  },
  {
    num: "04",
    title: "Deliver",
    body: "Export-ready finals plus the layered source files, with check-ins at every milestone so nothing lands as a surprise.",
  },
] as const;

export const NAV_ITEMS = [
  { num: "01", label: "About", href: "/#about" },
  { num: "02", label: "Works", href: "/#works" },
  { num: "03", label: "Process", href: "/#process" },
  { num: "04", label: "Reel", href: "/#reel" },
  { num: "05", label: "Contact", href: "/#contact" },
] as const;

/** Shared closing paragraph on every detail page. */
export const DETAIL_PROCESS_NOTE =
  "Rough pass first, then clean line, flats, and a shading pass. Layered source files ship alongside the export-ready finals.";

export const CONTACT_EMAIL = "sadiatonni1916@gmail.com";

// The prototype also listed Behance and Tumblr; neither appears on the
// artist's CV, so they were dropped rather than shipped as dead links.
export const SOCIAL_LINKS = [
  { label: "INSTAGRAM", href: "https://instagram.com/tortilla_._" },
] as const;

export function getWork(slug: string): Work | undefined {
  return WORKS.find((w) => w.slug === slug);
}

export function nextWork(work: Work): Work {
  return WORKS[(work.id + 1) % WORKS.length];
}
