import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArtGallery from "@/components/ArtGallery";
import ArtViewerTrigger from "@/components/ArtViewerTrigger";
import { artwork, artworksIn } from "@/lib/artworks";
import { MEDIA } from "@/lib/media.generated";
import { WORKS } from "@/lib/works";

/** One page per piece, so every artwork has its own address. */
export function generateStaticParams() {
  return MEDIA.map((item) => ({
    category: item.category,
    slug: item.slug,
  }));
}

function find(category: string, slug: string) {
  const item = MEDIA.find((m) => m.category === category && m.slug === slug);
  return item ? artwork(item.id) : undefined;
}

export async function generateMetadata(
  props: PageProps<"/art/[category]/[slug]">,
): Promise<Metadata> {
  const { category, slug } = await props.params;
  const piece = find(category, slug);
  if (!piece) return {};
  return {
    title: piece.title,
    description: piece.note || undefined,
    openGraph: {
      title: `${piece.title} — Tortilla`,
      description: piece.note || undefined,
      images: [
        {
          url: piece.poster ?? piece.src,
          width: piece.width,
          height: piece.height,
          alt: piece.title,
        },
      ],
    },
  };
}

/**
 * Picks a handful of other pieces from the same category. Seeded from the
 * slug rather than Math.random so the server and client agree — a genuinely
 * random pick would differ between the two and trip hydration.
 */
function suggestions(category: string, excludeId: string, count = 4) {
  const pool = artworksIn(category).filter((p) => p.id !== excludeId);
  let seed = 0;
  for (let i = 0; i < excludeId.length; i++) seed = (seed * 31 + excludeId.charCodeAt(i)) >>> 0;
  const picked = [...pool];
  for (let i = picked.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked.slice(0, count);
}

export default async function ArtPage(
  props: PageProps<"/art/[category]/[slug]">,
) {
  const { category, slug } = await props.params;
  const piece = find(category, slug);
  if (!piece) notFound();

  const work = WORKS.find((w) => w.category === category);
  const more = suggestions(category, piece.id);

  return (
    <main className="pt-[78px]">
      <div className="mx-auto max-w-[1500px] px-7">
        <Link
          href={work ? `/work/${work.slug}` : "/#works"}
          className="font-mono mb-[34px] inline-flex items-center gap-[9px] text-[10px] text-ink opacity-60 hover:opacity-100"
          style={{ letterSpacing: ".2em" }}
        >
          <span aria-hidden>←</span> {work ? work.title.toUpperCase() : "ALL WORK"}
        </Link>

        <div
          className="flex flex-wrap items-end justify-between gap-[30px] pb-[26px]"
          style={{ borderBottom: "1px solid var(--hairline)" }}
        >
          <h1
            className="font-display m-0 text-[clamp(40px,7vw,110px)] uppercase"
            style={{ lineHeight: 0.92 }}
          >
            {piece.title}
          </h1>
          <p
            className="font-mono m-0 text-right text-[10px] opacity-60"
            style={{ letterSpacing: ".16em", lineHeight: 2 }}
          >
            {category.replace(/-/g, " ").toUpperCase()}
            <br />
            {piece.width} × {piece.height}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-7 pt-11">
        <ArtViewerTrigger
          item={{
            id: piece.id,
            src: piece.src,
            width: piece.width,
            height: piece.height,
            title: piece.title,
            note: piece.note,
            kind: piece.kind,
            thumb: piece.poster ?? piece.src,
          }}
        />

        {piece.note ? (
          <p className="prose-body mt-8 mb-0">{piece.note}</p>
        ) : null}
      </div>

      {more.length ? (
        <div className="mx-auto max-w-[1500px] px-7 pt-20 pb-20">
          <div
            className="mb-7 flex flex-wrap items-baseline justify-between gap-4 pb-4"
            style={{ borderBottom: "1px solid var(--hairline)" }}
          >
            <h2 className="eyebrow m-0">MORE FROM THIS SET</h2>
            {work ? (
              <Link
                href={`/work/${work.slug}`}
                className="font-mono text-[10px] text-ink opacity-55 hover:opacity-100"
                style={{ letterSpacing: ".16em" }}
              >
                SEE ALL ↗
              </Link>
            ) : null}
          </div>

          <ArtGallery
            items={more.map((other) => ({
              id: other.id,
              src: other.src,
              width: other.width,
              height: other.height,
              title: other.title,
              note: other.note,
              kind: other.kind,
              thumb: other.poster ?? other.src,
            }))}
            hrefs={Object.fromEntries(
              more.map((other) => [
                other.id,
                `/art/${other.category}/${other.slug}`,
              ]),
            )}
          />
        </div>
      ) : null}
    </main>
  );
}
