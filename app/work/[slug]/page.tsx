import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArtGallery from "@/components/ArtGallery";
import { SERIES_DETAILS, allSeries, standaloneIn } from "@/lib/artworks";
import {
  DETAIL_PROCESS_NOTE,
  WORKS,
  coverOf,
  getWork,
  nextWork,
} from "@/lib/works";

export function generateStaticParams() {
  return WORKS.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const work = getWork(slug);
  if (!work) return {};

  const cover = coverOf(work);
  return {
    title: work.title,
    description: work.brief,
    openGraph: {
      title: `${work.title} · Tortilla`,
      description: work.brief,
      images: [
        {
          url: cover.src,
          width: cover.width,
          height: cover.height,
          alt: work.title,
        },
      ],
    },
  };
}

export default async function WorkDetail(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const work = getWork(slug);
  if (!work) notFound();

  const cover = coverOf(work);
  const next = nextWork(work);
  // Standalone pieces, cover included — clicking the cover should open its
  // page like anything else, not just sit at the top as decoration.
  const pieces = work.category ? standaloneIn(work.category) : [];
  // Ordered page sets (comic series) are shown as readable comics, not as
  // loose thumbnails.
  const sets = work.category ? allSeries(work.category) : [];
  const total = pieces.length + sets.reduce((n, s) => n + s.pages.length, 0);

  return (
    <main className="pt-[78px]">
      <div className="mx-auto max-w-[1500px] px-7">
        <Link
          href="/#works"
          className="tap-link font-mono mb-[34px] inline-flex items-center gap-[9px] text-[10px] text-ink opacity-60 hover:opacity-100"
          style={{ letterSpacing: ".2em" }}
        >
          <span aria-hidden>←</span> BACK TO INDEX
        </Link>

        <div
          className="flex flex-wrap items-end justify-between gap-[30px] pb-[26px]"
          style={{ borderBottom: "1px solid var(--hairline)" }}
        >
          <h1
            className="font-display m-0 text-[clamp(48px,9vw,150px)] uppercase"
            style={{ lineHeight: 0.9 }}
          >
            {work.title}
          </h1>
          <p
            className="font-mono m-0 text-right text-[10px] opacity-60"
            style={{ letterSpacing: ".16em", lineHeight: 2 }}
          >
            {work.meta}
            <br />
            {work.tools}
            {total ? (
              <>
                <br />
                {total} PIECES
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-7 pt-11">
        <Image
          src={cover.src}
          alt={work.title}
          width={cover.width}
          height={cover.height}
          priority
          sizes="100vw"
          className="block w-full rounded-[4px] bg-bone object-contain"
          style={{ maxHeight: "78vh", height: "auto" }}
        />
      </div>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-12 px-7 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-[70px]">
        <div>
          <h2 className="eyebrow mb-5">THE BRIEF</h2>
          <p className="prose-body m-0 mb-4 max-w-none">{work.brief}</p>
          <p className="prose-body m-0 max-w-none">{DETAIL_PROCESS_NOTE}</p>
        </div>

        <div className="flex flex-col gap-[14px] self-start">
          <h2 className="eyebrow m-0">IN THIS SET</h2>
          <p
            className="m-0 text-[15px] opacity-60"
            style={{ lineHeight: 1.6, textWrap: "pretty" }}
          >
            {sets.length
              ? `${sets.length} series and ${pieces.length} standalone ${pieces.length === 1 ? "piece" : "pieces"}. Open a series to read it in order.`
              : `${total} pieces, each with its own page.`}
          </p>
        </div>
      </div>

      {/* Series read as comics; open one to page through it in order. */}
      {sets.length ? (
        <div className="mx-auto max-w-[1500px] px-7 pb-16">
          <div
            className="mb-7 pb-4"
            style={{ borderBottom: "1px solid var(--hairline)" }}
          >
            <h2 className="eyebrow m-0">SERIES</h2>
          </div>
          <div className="art-grid">
            {sets.map((set) => {
              const detail = SERIES_DETAILS[`${work.category}/${set.slug}`];
              return (
                <Link
                  key={set.slug}
                  href={`/comic/${set.slug}`}
                  className="art-thumb"
                >
                  <span className="art-thumb-frame">
                    <Image
                      src={set.pages[0].src}
                      alt={detail?.title ?? set.name}
                      fill
                      sizes="(max-width: 767px) 45vw, 22vw"
                      className="object-cover"
                    />
                    <span className="art-thumb-tag font-mono">
                      {set.pages.length}P
                    </span>
                  </span>
                  <span className="art-thumb-title font-mono">
                    {detail?.title ?? set.name} · READ
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Thumbnail grid — every piece links to its own page. */}
      {pieces.length ? (
        <div className="mx-auto max-w-[1500px] px-7 pb-20">
          <div
            className="mb-7 pb-4"
            style={{ borderBottom: "1px solid var(--hairline)" }}
          >
            <h2 className="eyebrow m-0">{sets.length ? "STANDALONE" : "ALL PIECES"}</h2>
          </div>

          <ArtGallery
            items={pieces.map((piece) => ({
              id: piece.id,
              src: piece.src,
              width: piece.width,
              height: piece.height,
              title: piece.title,
              note: piece.note,
              kind: piece.kind,
              thumb: piece.poster ?? piece.src,
            }))}
            hrefs={Object.fromEntries(
              pieces.map((piece) => [
                piece.id,
                `/art/${piece.category}/${piece.slug}`,
              ]),
            )}
          />
        </div>
      ) : null}

      <Link
        href={`/work/${next.slug}`}
        className="next-bar block px-7 py-[70px] text-center text-ink"
        style={{ borderTop: "1px solid var(--hairline)" }}
      >
        <span
          className="font-mono mb-[14px] block text-[10px] opacity-50"
          style={{ letterSpacing: ".24em" }}
        >
          NEXT PROJECT
        </span>
        <span
          className="font-display block text-[clamp(40px,7vw,110px)] text-sage uppercase"
          style={{ lineHeight: 0.95 }}
        >
          {next.title}
        </span>
      </Link>
    </main>
  );
}
