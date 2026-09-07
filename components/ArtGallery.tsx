import Image from "next/image";
import Link from "next/link";
import type { LightboxItem } from "./Lightbox";

/**
 * Thumbnail grid. A thumb navigates to that piece's own page — the zoomable
 * viewer lives there, on the full-size image, rather than replacing the page.
 */
export default function ArtGallery({
  items,
  hrefs,
}: {
  items: readonly LightboxItem[];
  /** Per-item page link, keyed by item id. */
  hrefs: Record<string, string>;
}) {
  return (
    <div className="art-grid">
      {items.map((item) => (
        <Link key={item.id} href={hrefs[item.id]} className="art-thumb">
          <span className="art-thumb-frame">
            <Image
              src={item.thumb ?? item.src}
              alt={item.title}
              fill
              sizes="(max-width: 767px) 45vw, 22vw"
              className="object-cover"
              unoptimized={item.kind === "gif"}
            />
            {item.kind === "video" ? (
              <span className="art-thumb-tag font-mono">MP4</span>
            ) : null}
            {item.kind === "gif" ? (
              <span className="art-thumb-tag font-mono">GIF</span>
            ) : null}
          </span>
          <span className="art-thumb-title font-mono">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}
