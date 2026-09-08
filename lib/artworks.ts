/**
 * Per-artwork identity: every piece in Categorized/ gets its own title and
 * note here, keyed by the id the media pipeline generates
 * ("<category>/<file-slug>").
 *
 * WORKFLOW
 *   1. Drop a file into Categorized/<category>/
 *   2. `npm run media`
 *   3. Add an entry below using the id the script prints
 *
 * A piece with no entry still renders — it falls back to a title made from
 * its filename — so a missing entry is untidy, never broken. `npm run lint`
 * will not catch it; `missingArtworkDetails()` below lists them.
 *
 * NOTE ON THE COPY: these titles and notes are descriptive, written from the
 * artwork itself so nothing shipped blank. They are placeholders for the
 * artist's own words — CLAUDE.md is explicit that the copy is hers.
 */

import { MEDIA, media, type MediaItem } from "./media.generated";

export type Artwork = MediaItem & { title: string; note: string };

type Detail = { title: string; note: string };

const DETAILS: Record<string, Detail> = {
  // ------------------------------------------------------------- animation
  "animation/sunburst": {
    title: "Sunburst",
    note: "Figures tumbling in a ring over a yellow sunburst before one is left alone on the field. Hand drawn, on twos.",
  },
  "animation/still-more": {
    title: "Still More",
    note: "A girl at a window beside a note asking whether she has lived through all her good days, or whether there is still more.",
  },
  "animation/the-hut": {
    title: "The Hut",
    note: "A hut on stilts under drifting clouds, drawn in loose ink over a warm ground.",
  },
  "animation/late-for-8-am": {
    title: "Late for 8 AM",
    note: "A short character loop with hand lettering — running, and not going to make it.",
  },

  // ----------------------------------------------------------------- comic
  "comic/we-stay-prepared": {
    title: "We Stay Prepared",
    note: "Two panels: a pair of eyes in close-up, then a face and a card about summoning happy feelings at the cost of sadness.",
  },
  "comic/ants-01-the-anthill": {
    title: "The Anthill",
    note: "He kicks the anthill and runs. Page one of the short.",
  },
  "comic/ants-02-impact": {
    title: "Impact",
    note: "The car, the crash, and the colony closing in around him.",
  },
  "comic/ants-04-ward": {
    title: "Ward",
    note: "Awake in a hospital bed, and certain about what he saw.",
  },
  "comic/ants-05-ants": {
    title: "Ants!!",
    note: "The same room, one beat later, and nobody believes him.",
  },
  "comic/ants-03-the-colony": {
    title: "The Colony",
    note: "Underground, the ants get their own side of the story.",
  },

  // ---------------------------------------------------------------- custom
  "custom/car-14-livery": {
    title: "Car 14 — Livery",
    note: "Side and top elevation of a racing livery in teal and lime, numbered 14.",
  },
  "custom/cat-nap": {
    title: "Cat Nap",
    note: "A ginger cat asleep on top of a carrier, drawn small and flat for print.",
  },
  "custom/mayer-doa-studio": {
    title: "Mayer Doa Studio",
    note: "A peacock crest with Bengali lettering, banner and florals, on a hot yellow field.",
  },
  "custom/nimbu": {
    title: "Nimbu",
    note: "Wordmark for Nimbu — a dripping lemon set inside a hypnotic cream and sage swirl.",
  },
  "custom/sorting-unit": {
    title: "Sorting Unit",
    note: "A recycling unit drawn flat and clean, with sorting slots colour-coded along the base.",
  },
  "custom/rickshaw": {
    title: "Rickshaw",
    note: "A cyclist hauling a rickshaw through neon traffic and flame, in halftone and hot purple.",
  },

  // -------------------------------------------------------- game characters
  "game-characters/model-sheet": {
    title: "Model Sheet",
    note: "Character reference on black — full figure, colour swatches and a hand study kept together on one board.",
  },
  "game-characters/lead-front": {
    title: "Lead — Front",
    note: "The player character, front view: heavy black hair, olive and purple layers.",
  },
  "game-characters/lead-bust": {
    title: "Lead — Bust",
    note: "The same character framed for dialogue, hair tied up.",
  },
  "game-characters/spearbearer": {
    title: "Spearbearer",
    note: "A tall figure with a spear and a patterned wrap skirt, painted full length.",
  },
  "game-characters/bazaar-npc-tank": {
    title: "Bazaar NPC — Tank",
    note: "Market crowd filler: a boy in a blue tank top, full figure.",
  },
  "game-characters/bazaar-npc-elder": {
    title: "Bazaar NPC — Elder",
    note: "Market crowd filler: an older man in a teal shirt.",
  },
  "game-characters/bazaar-npc-cap": {
    title: "Bazaar NPC — Cap",
    note: "Market crowd filler: a boy in a topi and olive kurta.",
  },
  "game-characters/bazaar-npc-tank-bust": {
    title: "Bazaar NPC — Tank, Bust",
    note: "Dialogue framing for the boy in the blue tank top.",
  },
  "game-characters/bazaar-npc-elder-bust": {
    title: "Bazaar NPC — Elder, Bust",
    note: "Dialogue framing for the older man in teal.",
  },
  "game-characters/bazaar-npc-cap-bust": {
    title: "Bazaar NPC — Cap, Bust",
    note: "Dialogue framing for the boy in the topi.",
  },
  "game-characters/bazaar-boy": {
    title: "Bazaar Boy",
    note: "Portrait study of the market boy in his topi and olive kurta.",
  },
  "game-characters/jai-jai-store": {
    title: "Jai Jai Store",
    note: "A market stall prop with hand-painted Bengali signage and produce crates.",
  },
  "game-characters/umbrella-cart": {
    title: "Umbrella Cart",
    note: "A fruit cart under a striped umbrella, boxed produce stacked along the front.",
  },
  "game-characters/grocers-stall": {
    title: "Grocer's Stall",
    note: "The big stall: hanging bunches, gourds and melons under a red and white awning.",
  },
  "game-characters/shop-clerk-long-hair": {
    title: "Shop Clerk — Long Hair",
    note: "Supermarket staff in an orange apron, full figure.",
  },
  "game-characters/shop-clerk-bob": {
    title: "Shop Clerk — Bob",
    note: "A second supermarket clerk, same uniform, different cut.",
  },
  "game-characters/shop-npc-glasses": {
    title: "Shop NPC — Glasses",
    note: "Supermarket NPC in orange overalls and round glasses.",
  },
  "game-characters/shop-clerk-bust": {
    title: "Shop Clerk — Bust",
    note: "Dialogue framing for the supermarket clerk.",
  },
  "game-characters/pixel-sprite": {
    title: "Pixel Sprite",
    note: "A pixel-art take on the character, built small enough to move in engine.",
  },
  "game-characters/blade-sprite": {
    title: "Blade Sprite",
    note: "Seven-frame pixel loop — a hooded figure drawing a blade.",
  },
  "game-characters/starstruck": {
    title: "Starstruck",
    note: "A painted portrait against a starred coral field. Sits with the game folder but is an illustration, not an asset.",
  },

  "custom/brainwave": {
    title: "Brainwave",
    note: "Cover art for a record that sounded like a pink pool in a green valley — taken literally.",
  },
  "custom/lemon": {
    title: "Lemon",
    note: "Two lemon slices in gold on black, cut back to a hard graphic for print.",
  },

  // -------------------------------------------------------------- portrait
  "portrait/two-fish": {
    title: "Two Fish",
    note: "Two fish, two moods — one iridescent, one deep blue — painted for a print run about colour in cold water.",
  },
  "portrait/smoke": {
    title: "Smoke",
    note: "A woman in a blue and gold sari mid-drag, drawn against a flat coral ground.",
  },
  "portrait/cosmos": {
    title: "Cosmos",
    note: "A face split by colour — half lit in yellow and pink — against a starfield.",
  },
  "portrait/coco": {
    title: "Coco",
    note: "A black cat stretched out on grey, the working palette left in the margin.",
  },

  // ------------------------------------------------------------ my avatars
  "my-avatars/tortilla": {
    title: "Tortilla",
    note: "Self portrait as a wide-eyed sketch with a mop of hair and star-tipped shoes.",
  },

  // ------------------------------------------------------------- wallpaper
  "wallpaper/strike": {
    title: "Strike",
    note: "A crow lifting off the head of a struck match, its box open below.",
  },
  "wallpaper/nightie": {
    title: "Nightie",
    note: "Desktop wallpaper — a small character parked bottom-right on a black field, so icons still have room.",
  },
  "wallpaper/nahin": {
    title: "Nahin",
    note: "Desktop wallpaper — caped chibi on black, drawn to sit quietly behind a full desktop.",
  },
  "wallpaper/dnd": {
    title: "DND",
    note: "Phone wallpaper — one character, one word, and a lot of black.",
  },
};

/** Turns "bazar-npc-bigframe2png" into "Bazar Npc Bigframe2png". */
function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function artwork(id: string): Artwork {
  const item = media(id);
  const detail = DETAILS[id];
  return {
    ...item,
    title: detail?.title ?? titleFromSlug(item.slug),
    note: detail?.note ?? "",
  };
}

/** A comic series, in reading order, with its pages already labelled. */
export function series(category: string, slug: string) {
  const pages = MEDIA.filter(
    (item) => item.category === category && item.series === slug,
  ).map((item) => artwork(item.id));
  return pages.length
    ? { slug, name: pages[0].seriesName ?? slug, pages }
    : undefined;
}

/** Every series in a category. */
export function allSeries(category: string) {
  const slugs: string[] = [];
  for (const item of MEDIA) {
    if (item.category === category && item.series && !slugs.includes(item.series)) {
      slugs.push(item.series);
    }
  }
  return slugs.map((slug) => series(category, slug)!).filter(Boolean);
}

/** Standalone pieces in a category — everything not part of a series. */
export function standaloneIn(category: string): readonly Artwork[] {
  return MEDIA.filter((item) => item.category === category && !item.series).map(
    (item) => artwork(item.id),
  );
}

export function artworksIn(category: string): readonly Artwork[] {
  return MEDIA.filter((item) => item.category === category).map((item) =>
    artwork(item.id),
  );
}

/** Ids that have media but no hand-written detail yet. */
export function missingArtworkDetails(): readonly string[] {
  return MEDIA.filter((item) => !DETAILS[item.id]).map((item) => item.id);
}

/**
 * Display names and blurbs for comic series. Keyed by "<category>/<series>".
 * A series with no entry falls back to its folder name.
 */
export const SERIES_DETAILS: Record<string, { title: string; note: string }> = {
  "comic/ants": {
    title: "Ants",
    note: "Five pages about a boy who kicks an anthill, gets hit by a car, and wakes up convinced he has become an ant. The ants have their own side of the story.",
  },
};
