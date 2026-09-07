/**
 * The reel's clips.
 *
 * `house` and `kirby` are the original web-sized exports. `animationn` and
 * `qweqeqeqeqe` come from the managed media because they carry sound and have
 * no lightweight counterpart — they are also very heavy (57 MB and 16 MB), so
 * the light clip is deliberately first: it is the one that autoplays, and the
 * heavy two only load when selected.
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

const stillMore = media("animation/animationn");
const sunburst = media("animation/qweqeqeqeqe");

export const LOOPS: readonly Loop[] = [
  {
    id: "house",
    kind: "image",
    src: "/art/legacy/house.gif",
    poster: "/art/legacy/house-poster.webp",
    ratio: 800 / 1422,
    file: "LOOP_HOUSE.GIF",
    note: "HAND DRAWN · ON TWOS",
    meta: "FRAME BY FRAME",
  },
  {
    id: "loop2",
    kind: "video",
    src: "/art/legacy/loop2.mp4",
    ratio: 1920 / 1080,
    file: "LOOP_KIRBY.MP4",
    note: "PERSONAL · 2026",
    meta: "CHARACTER LOOP",
    hasAudio: true,
  },
  {
    id: "still-more",
    kind: "video",
    src: stillMore.src,
    ratio: stillMore.width / stillMore.height,
    file: "STILL_MORE.MP4",
    note: "PERSONAL · 2026",
    meta: "HAND DRAWN · WITH SOUND",
    hasAudio: true,
  },
  {
    id: "sunburst",
    kind: "video",
    src: sunburst.src,
    ratio: sunburst.width / sunburst.height,
    file: "SUNBURST.MP4",
    note: "PERSONAL · 2026",
    meta: "HAND DRAWN · WITH SOUND",
    hasAudio: true,
  },
];
