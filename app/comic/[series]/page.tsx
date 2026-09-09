import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ComicReader from "@/components/ComicReader";
import { SERIES_DETAILS, allSeries, series } from "@/lib/artworks";

const CATEGORY = "comic";

export function generateStaticParams() {
  return allSeries(CATEGORY).map((s) => ({ series: s.slug }));
}

function titleOf(slug: string, fallback: string) {
  return SERIES_DETAILS[`${CATEGORY}/${slug}`]?.title ?? fallback;
}

export async function generateMetadata(
  props: PageProps<"/comic/[series]">,
): Promise<Metadata> {
  const { series: slug } = await props.params;
  const found = series(CATEGORY, slug);
  if (!found) return {};
  const detail = SERIES_DETAILS[`${CATEGORY}/${slug}`];
  return {
    title: titleOf(slug, found.name),
    description: detail?.note,
    openGraph: {
      title: `${titleOf(slug, found.name)} · Tortilla`,
      description: detail?.note,
      images: [{ url: found.pages[0].src, alt: titleOf(slug, found.name) }],
    },
  };
}

/**
 * A comic reader: pages stacked in reading order in one column, the way a
 * webcomic reads, rather than scattered through a gallery grid.
 */
export default async function ComicSeries(
  props: PageProps<"/comic/[series]">,
) {
  const { series: slug } = await props.params;
  const found = series(CATEGORY, slug);
  if (!found) notFound();

  const detail = SERIES_DETAILS[`${CATEGORY}/${slug}`];
  const title = titleOf(slug, found.name);
  const others = allSeries(CATEGORY).filter((s) => s.slug !== slug);

  return (
    <main className="pt-[78px]">
      <div className="mx-auto max-w-[1500px] px-7">
        <Link
          href="/work/comic"
          className="tap-link font-mono mb-[34px] inline-flex items-center gap-[9px] text-[10px] text-ink opacity-60 hover:opacity-100"
          style={{ letterSpacing: ".2em" }}
        >
          <span aria-hidden>←</span> ALL COMICS
        </Link>

        <div
          className="flex flex-wrap items-end justify-between gap-[30px] pb-[26px]"
          style={{ borderBottom: "1px solid var(--hairline)" }}
        >
          <h1
            className="font-display m-0 text-[clamp(40px,7vw,110px)] uppercase"
            style={{ lineHeight: 0.92 }}
          >
            {title}
          </h1>
          <p
            className="font-mono m-0 text-right text-[10px] opacity-60"
            style={{ letterSpacing: ".16em", lineHeight: 2 }}
          >
            COMIC SERIES
            <br />
            {found.pages.length} PAGES
          </p>
        </div>

        {detail?.note ? (
          <p className="prose-body mt-8 mb-0">{detail.note}</p>
        ) : null}
      </div>

      {/* The reader. Click a page to open it in the viewer, where the whole
          series is loaded so you can swipe through it zoomed in. */}
      <ComicReader
        title={title}
        pages={found.pages.map((page, i) => ({
          id: page.id,
          src: page.src,
          width: page.width,
          height: page.height,
          title: `${title}, page ${i + 1}`,
          note: page.note,
          kind: page.kind,
        }))}
      />

      <div
        className="mx-auto max-w-[1100px] px-7 pb-16 text-center"
        style={{ borderTop: "1px solid var(--hairline)", paddingTop: 48 }}
      >
        <p
          className="font-mono m-0 text-[10px] opacity-45"
          style={{ letterSpacing: ".22em" }}
        >
          END · {found.pages.length} PAGES
        </p>
      </div>

      {others.length ? (
        <div className="mx-auto max-w-[1500px] px-7 pb-20">
          <div
            className="mb-7 pb-4"
            style={{ borderBottom: "1px solid var(--hairline)" }}
          >
            <h2 className="eyebrow m-0">OTHER SERIES</h2>
          </div>
          <div className="art-grid">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/comic/${other.slug}`}
                className="art-thumb"
              >
                <span className="art-thumb-frame">
                  <Image
                    src={other.pages[0].src}
                    alt={titleOf(other.slug, other.name)}
                    fill
                    sizes="(max-width: 767px) 45vw, 22vw"
                    className="object-cover"
                  />
                  <span className="art-thumb-tag font-mono">
                    {other.pages.length}P
                  </span>
                </span>
                <span className="art-thumb-title font-mono">
                  {titleOf(other.slug, other.name)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
