"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox, { type LightboxItem } from "./Lightbox";

/** The piece's own hero — click it to open the viewer and zoom in. */
export default function ArtViewerTrigger({ item }: { item: LightboxItem }) {
  const [open, setOpen] = useState(false);

  if (item.kind === "video") {
    return (
      <div
        className="relative overflow-hidden rounded-[4px] bg-bone"
        style={{ aspectRatio: `${item.width} / ${item.height}` }}
      >
        <video
          src={item.src}
          controls
          loop
          muted
          playsInline
          preload="metadata"
          poster={item.thumb}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Zoom into ${item.title}`}
        className="relative block w-full overflow-hidden rounded-[4px] border-0 bg-bone p-0"
        style={{
          aspectRatio: `${item.width} / ${item.height}`,
          cursor: "zoom-in",
        }}
      >
        <Image
          src={item.src}
          alt={item.title}
          fill
          priority
          unoptimized={item.kind === "gif"}
          sizes="(max-width: 1180px) 100vw, 1180px"
          className="object-contain"
        />
      </button>

      {open ? (
        <Lightbox
          items={[item]}
          index={0}
          onIndexChange={() => {}}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
