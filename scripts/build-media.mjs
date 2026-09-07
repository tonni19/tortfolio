/**
 * Media pipeline.
 *
 *   Categorized/<category>/<file>   →   public/art/<category>/<slug>.<ext>
 *                                   →   lib/media.generated.ts
 *
 * Categorized/ is the source of truth. Drop a new file into the right
 * category folder and run `npm run media` — it is copied, optimised, and
 * added to the manifest with its real dimensions. Then give it a title and
 * a note in lib/artworks.ts, which is keyed by the same id.
 *
 * A category may contain SERIES subfolders — Categorized/comic/ants/ — for
 * work that reads in order. Prefix those files with a number (01-, 02-, …)
 * and that is the reading order. Anything sitting loose in the category is a
 * standalone piece.
 *
 * A file whose name starts with "_" is kept on disk but not published —
 * useful for duplicates and alternates you want to hold on to.
 *
 * Nothing here edits Categorized/. Originals are never touched.
 *
 * Stills are re-encoded to WebP capped at 2200px on the long edge, which is
 * plenty for a full-bleed hero and keeps 36 MB masters out of the repo.
 * Animated GIFs are copied through and get a still poster. Videos are
 * re-encoded with ffmpeg to a web-sized H.264/AAC MP4 and given a poster
 * frame; the audio track is preserved, since the reel can play sound. If
 * ffmpeg is missing the video is copied as-is and the script says so.
 */
import { mkdir, readdir, stat, copyFile, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, parse } from "node:path";
import { readdirSync as require$readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import sharp from "sharp";

const SRC = "Categorized";
const OUT = join("public", "art");
const MANIFEST = join("lib", "media.generated.ts");

/** Long-edge cap for stills. */
const MAX_EDGE = 2200;
/** Anything above this is flagged; see VERCEL.md's launch checklist. */
const WEIGHT_WARN_BYTES = 3 * 1024 * 1024;

const VIDEO = /\.(mp4|webm|mov)$/i;
const STILL = /\.(png|jpe?g|webp|avif)$/i;
const GIF = /\.gif$/i;

/** Folder names are messy by nature; the URL should not be. */
const CATEGORY_SLUGS = {
  animation: "animation",
  comic: "comic",
  custom: "custom",
  "game character": "game-characters",
  my_avatars: "my-avatars",
  potrait: "portrait", // source folder is misspelled; the slug is not
  wallpaper: "wallpaper",
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Reads coded width/height straight out of the MP4 sample description. */
function videoDimensions(buffer) {
  for (const tag of ["avc1", "hev1", "hvc1", "mp4v", "av01"]) {
    let i = -1;
    while ((i = buffer.indexOf(tag, i + 1, "latin1")) !== -1) {
      const width = buffer.readUInt16BE(i + 4 + 24);
      const height = buffer.readUInt16BE(i + 4 + 26);
      if (width > 0 && height > 0 && width < 10000 && height < 10000) {
        return { width, height };
      }
    }
  }
  return null;
}

const kb = (n) => `${Math.round(n / 1024)} KB`;

/** Long edge for encoded video — 1080 keeps a 9:16 clip crisp on a phone. */
const VIDEO_MAX_EDGE = 1080;
const VIDEO_CRF = 26;

/** ffmpeg may be on PATH or tucked inside a winget package folder. */
function findFfmpeg() {
  const candidates = ["ffmpeg"];
  const wingetRoot = join(
    homedir(),
    "AppData",
    "Local",
    "Microsoft",
    "WinGet",
    "Packages",
  );
  try {
    for (const dir of require$readdirSync(wingetRoot)) {
      if (!/ffmpeg/i.test(dir)) continue;
      for (const build of require$readdirSync(join(wingetRoot, dir))) {
        const exe = join(wingetRoot, dir, build, "bin", "ffmpeg.exe");
        if (existsSync(exe)) candidates.push(exe);
      }
    }
  } catch {
    /* not on Windows, or no winget packages */
  }
  for (const cmd of candidates.reverse()) {
    try {
      execFileSync(cmd, ["-version"], { stdio: "ignore" });
      return cmd;
    } catch {
      /* try the next one */
    }
  }
  return null;
}

const FFMPEG = findFfmpeg();

async function main() {
  if (!existsSync(SRC)) {
    console.error(`No ${SRC}/ folder — nothing to build.`);
    process.exit(1);
  }

  // NEVER wipe public/art wholesale — it also holds files this script does
  // not own (public/art/legacy/), and they are not in git. Only the category
  // folders derived from Categorized/ are cleared and rebuilt, so deleting a
  // source file still removes it from the site.
  await mkdir(OUT, { recursive: true });

  const entries = [];
  const warnings = [];
  const seen = new Set();

  const categories = (await readdir(SRC, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const category of categories) {
    const categorySlug = CATEGORY_SLUGS[category] ?? slugify(category);
    if (!CATEGORY_SLUGS[category]) {
      warnings.push(
        `Category "${category}" has no explicit slug; using "${categorySlug}". ` +
          `Add it to CATEGORY_SLUGS to lock it in.`,
      );
    }

    const outDir = join(OUT, categorySlug);
    // Scoped rebuild: this folder is owned by this category, nothing else is.
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    const listing = await readdir(join(SRC, category), { withFileTypes: true });
    const seriesDirs = listing.filter((d) => d.isDirectory()).map((d) => d.name);
    const looseFiles = listing.filter((d) => d.isFile()).map((d) => d.name);

    /** [absolute path, filename, series slug | null, series name | null] */
    const work = [
      ...looseFiles.sort().map((f) => [join(SRC, category, f), f, null, null]),
      ...seriesDirs.sort().flatMap((dir) =>
        require$readdirSync(join(SRC, category, dir))
          .sort()
          .map((f) => [join(SRC, category, dir, f), f, slugify(dir), dir]),
      ),
    ];

    console.log(`\n${category}  ->  public/art/${categorySlug}/`);

    for (const [srcPath, file, seriesSlug, seriesName] of work) {
      // "_" parks a file: kept on disk, kept out of the site.
      if (file.startsWith("_")) {
        console.log(`  ${file.padEnd(32)} parked (leading underscore)`);
        continue;
      }
      const { name } = parse(file);
      const slug = seriesSlug ? `${seriesSlug}-${slugify(name)}` : slugify(name);
      const id = `${categorySlug}/${slug}`;
      // A leading number on a series file is its reading order.
      const orderMatch = /^(\d+)/.exec(name);
      const extra = seriesSlug
        ? {
            series: seriesSlug,
            seriesName,
            order: orderMatch ? Number(orderMatch[1]) : 0,
          }
        : {};

      if (seen.has(id)) {
        warnings.push(`Duplicate id "${id}" — "${file}" was skipped.`);
        continue;
      }
      seen.add(id);

      const sourceBytes = (await stat(srcPath)).size;

      try {
        if (VIDEO.test(file)) {
          const outName = `${slug}.mp4`;
          const outPath = join(outDir, outName);
          const posterName = `${slug}-poster.webp`;
          const { readFile } = await import("node:fs/promises");
          let dims = videoDimensions(await readFile(srcPath)) ?? {
            width: 1920,
            height: 1080,
          };

          if (FFMPEG) {
            // Scale the long edge down, keep even dimensions for H.264, and
            // move the moov atom up front so it can stream.
            execFileSync(
              FFMPEG,
              [
                "-y", "-loglevel", "error", "-i", srcPath,
                "-vf",
                `scale='if(gt(iw,ih),min(${VIDEO_MAX_EDGE},iw),-2)':'if(gt(iw,ih),-2,min(${VIDEO_MAX_EDGE},ih))':flags=lanczos`,
                "-c:v", "libx264", "-preset", "slow", "-crf", String(VIDEO_CRF),
                "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                "-c:a", "aac", "-b:a", "128k",
                outPath,
              ],
              { stdio: ["ignore", "ignore", "pipe"] },
            );
            // Poster frame a little way in — frame 0 is often a fade.
            try {
              execFileSync(
                FFMPEG,
                ["-y", "-loglevel", "error", "-ss", "1", "-i", outPath,
                 "-frames:v", "1", join(outDir, posterName)],
                { stdio: ["ignore", "ignore", "pipe"] },
              );
            } catch {
              /* clip shorter than a second; no poster */
            }
            dims = videoDimensions(await readFile(outPath)) ?? dims;
          } else {
            await copyFile(srcPath, outPath);
          }

          const outBytes = (await stat(outPath)).size;
          entries.push({
            id,
            category: categorySlug,
            slug,
            kind: "video",
            src: `/art/${categorySlug}/${outName}`,
            ...(existsSync(join(outDir, posterName))
              ? { poster: `/art/${categorySlug}/${posterName}` }
              : {}),
            ...extra,
            ...dims,
            bytes: outBytes,
          });

          if (!FFMPEG) {
            warnings.push(
              `${id} was copied as-is (${kb(outBytes)}) — ffmpeg not found, so it could not be compressed.`,
            );
          } else if (outBytes > WEIGHT_WARN_BYTES) {
            warnings.push(
              `${id} is still ${kb(outBytes)} after encoding — consider trimming it.`,
            );
          }
          console.log(
            `  ${file.padEnd(32)} video  ${kb(sourceBytes)} -> ${kb(outBytes)}` +
              (FFMPEG ? "" : "  (not compressed)"),
          );
          continue;
        }

        if (GIF.test(file)) {
          const meta = await sharp(srcPath).metadata();
          const animated = (meta.pages ?? 1) > 1;
          const outName = `${slug}.gif`;
          await copyFile(srcPath, join(outDir, outName));
          // Poster so the card can sit still until hovered.
          const posterName = `${slug}-poster.webp`;
          await sharp(srcPath, { pages: 1 })
            .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 82 })
            .toFile(join(outDir, posterName));
          entries.push({
            id,
            category: categorySlug,
            slug,
            kind: animated ? "gif" : "image",
            src: `/art/${categorySlug}/${outName}`,
            poster: `/art/${categorySlug}/${posterName}`,
            ...extra,
            width: meta.width,
            height: meta.height,
            bytes: sourceBytes,
          });
          console.log(
            `  ${file.padEnd(32)} gif    ${kb(sourceBytes)}${animated ? ` (${meta.pages}f)` : ""}`,
          );
          continue;
        }

        if (!STILL.test(file)) {
          warnings.push(`Skipped "${srcPath}" — unsupported file type.`);
          continue;
        }

        const outName = `${slug}.webp`;
        const info = await sharp(srcPath)
          .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(join(outDir, outName));

        entries.push({
          id,
          category: categorySlug,
          slug,
          kind: "image",
          src: `/art/${categorySlug}/${outName}`,
          ...extra,
          width: info.width,
          height: info.height,
          bytes: info.size,
        });
        console.log(
          `  ${file.padEnd(32)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)} ` +
            `${kb(sourceBytes)} -> ${kb(info.size)}`,
        );
      } catch (error) {
        warnings.push(`Failed on "${srcPath}": ${error.message}`);
      }
    }
  }

  entries.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    const as = a.series ?? "";
    const bs = b.series ?? "";
    if (as !== bs) return as.localeCompare(bs);
    if (as && (a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
    return a.id.localeCompare(b.id);
  });

  const byCategory = {};
  for (const e of entries) (byCategory[e.category] ??= []).push(e.id);

  const body = `// GENERATED by scripts/build-media.mjs — do not edit by hand.
// Source of truth is the Categorized/ folder. Run \`npm run media\` to rebuild.
// Titles and descriptions live in lib/artworks.ts, keyed by these ids.

export type MediaKind = "image" | "gif" | "video";

export type MediaItem = {
  /** Stable id: "<category>/<slug>". Also the key used by lib/artworks.ts. */
  id: string;
  category: string;
  slug: string;
  kind: MediaKind;
  src: string;
  /** Set when the piece lives in a series subfolder, e.g. comic/ants. */
  series?: string;
  /** The series folder's name as written, for display. */
  seriesName?: string;
  /** Reading order within the series, from the file's numeric prefix. */
  order?: number;
  /** Still frame for animated GIFs, so a card can rest without animating. */
  poster?: string;
  width: number;
  height: number;
};

export const MEDIA: readonly MediaItem[] = ${JSON.stringify(
    entries.map((entry) => {
      const rest = { ...entry };
      delete rest.bytes;
      return rest;
    }),
    null,
    2,
  )};

export const MEDIA_BY_ID: ReadonlyMap<string, MediaItem> = new Map(
  MEDIA.map((item) => [item.id, item]),
);

export const CATEGORIES = ${JSON.stringify(Object.keys(byCategory), null, 2)} as const;

export type Category = (typeof CATEGORIES)[number];

export function mediaIn(category: string): readonly MediaItem[] {
  return MEDIA.filter((item) => item.category === category);
}

/** Pieces in one series, already in reading order. */
export function seriesPages(category: string, series: string): readonly MediaItem[] {
  return MEDIA.filter((m) => m.category === category && m.series === series);
}

/** Distinct series within a category, in the order they first appear. */
export function seriesIn(category: string): readonly { slug: string; name: string; pages: readonly MediaItem[] }[] {
  const out: { slug: string; name: string; pages: MediaItem[] }[] = [];
  for (const item of MEDIA) {
    if (item.category !== category || !item.series) continue;
    let row = out.find((s) => s.slug === item.series);
    if (!row) {
      row = { slug: item.series, name: item.seriesName ?? item.series, pages: [] };
      out.push(row);
    }
    row.pages.push(item);
  }
  return out;
}

export function media(id: string): MediaItem {
  const item = MEDIA_BY_ID.get(id);
  if (!item) throw new Error(\`Unknown media id "\${id}" — run \\\`npm run media\\\`.\`);
  return item;
}
`;

  await writeFile(MANIFEST, body, "utf8");

  const total = entries.reduce((sum, e) => sum + e.bytes, 0);
  console.log(
    `\n${entries.length} items across ${categories.length} categories -> ${MANIFEST}`,
  );
  console.log(`Shipped weight: ${(total / 1024 / 1024).toFixed(1)} MB`);

  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  ! ${w}`);
  }
}

await main();
