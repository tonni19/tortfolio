/**
 * The reel's clips — all four now come from the managed media, so their
 * filenames and URLs read properly and ffmpeg keeps them small. The lightest
 * clip is deliberately first, because that is the one that autoplays.
 */

import { media } from "./media.generated";

export type Loop = {
  id: string;
  kind: "video" | "image";
  src: string;
  /** Still frame shown at rest. */
  poster?: string;
  ratio: number;
  file: string;
  note: string;
  meta: string;
  /** Clips with an audio track, so the player can offer a sound toggle. */
  hasAudio?: boolean;
};

const clip = (id: string) => {
  const item = media(id);
  return { src: item.src, ratio: item.width / item.height, poster: item.poster };
};

const hut = clip("animation/the-hut");
const kirby = clip("animation/late-for-8-am");
const stillMore = clip("animation/still-more");
const sunburst = clip("animation/sunburst");

export const LOOPS: readonly Loop[] = [
  {
    id: "the-hut",
    kind: "video",
    src: hut.src,
    poster: hut.poster,
    ratio: hut.ratio,
    file: "THE HUT",
    note: "HAND DRAWN · ON TWOS",
    meta: "FRAME BY FRAME",
    hasAudio: true,
  },
  {
    id: "late-for-8-am",
    kind: "video",
    src: kirby.src,
    poster: kirby.poster,
    ratio: kirby.ratio,
    file: "LATE FOR 8 AM",
    note: "PERSONAL · 2026",
    meta: "CHARACTER LOOP",
    hasAudio: true,
  },
  {
    id: "still-more",
    kind: "video",
    src: stillMore.src,
    poster: stillMore.poster,
    ratio: stillMore.ratio,
    file: "STILL MORE",
    note: "PERSONAL · 2026",
    meta: "HAND DRAWN · WITH SOUND",
    hasAudio: true,
  },
  {
    id: "sunburst",
    kind: "video",
    src: sunburst.src,
    poster: sunburst.poster,
    ratio: sunburst.ratio,
    file: "SUNBURST",
    note: "PERSONAL · 2026",
    meta: "HAND DRAWN · WITH SOUND",
    hasAudio: true,
  },
];
