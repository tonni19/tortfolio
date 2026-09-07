"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox, { type LightboxItem } from "./Lightbox";

/**
 * Vertical page reader. Clicking a page opens it in the viewer, where the
 * whole series is loaded — so once zoomed in you can swipe left and right to
 * page through without dropping back out.
 */
export default function ComicReader({
  pages,
  title,
}: {
  pages: readonly LightboxItem[];
  title: string;
}) {
  const [open, setOpen] = useState(-1);

  return (
    <>
      <div className="comic-reader">
        {pages.map((page, i) => (
          <figure key={page.id} className="comic-page">
            <button
              type="button"
              className="comic-page-btn"
              onClick={() => setOpen(i)}
              aria-label={`Open page ${i + 1} of ${pages.length}`}
            >
              <span
                className="font-mono comic-page-num"
                style={{ letterSpacing: ".18em" }}
              >
                {String(i + 1).padStart(2, "0")} /{" "}
                {String(pages.length).padStart(2, "0")}
              </span>
              <Image
                src={page.src}
                alt={`${title}, page ${i + 1}`}
                width={page.width}
                height={page.height}
                priority={i === 0}
                sizes="(max-width: 1100px) 100vw, 1100px"
                className="block h-auto w-full bg-bone"
              />
            </button>
          </figure>
        ))}
      </div>

      {open >= 0 ? (
        <Lightbox
          items={pages}
          index={open}
          onIndexChange={setOpen}
          onClose={() => setOpen(-1)}
        />
      ) : null}
    </>
  );
}
