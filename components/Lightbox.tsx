"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxItem = {
  id: string;
  src: string;
  width: number;
  height: number;
  title: string;
  note?: string;
  kind?: "image" | "gif" | "video";
  /** Still to use in grids; videos have no renderable image src. */
  thumb?: string;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
/** A horizontal drag shorter than this is a click, not a swipe. */
const SWIPE_PX = 60;

/**
 * Full-screen viewer with zoom, pan and swipe navigation.
 *
 * Zoom is applied as `translate(...) scale(...)` on a wrapper, so the browser
 * scales the already-decoded bitmap — no re-layout per frame. Panning is only
 * possible while zoomed in; at 1× a horizontal drag pages through the set
 * instead, which is what makes a comic readable on a phone.
 */
export default function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: readonly LightboxItem[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // Mirrors the drag ref, because render must not read a ref's current value.
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  // Live pointers, so two of them can be read as a pinch.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef({ active: false, startX: 0, startY: 0, ox: 0, oy: 0, moved: 0 });
  const pinch = useRef({ startDist: 0, startZoom: 1 });

  const item = items[index];
  const many = items.length > 1;

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (!many) return;
      reset();
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, many, onIndexChange, reset],
  );

  // Keyboard, and lock the page behind the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(MAX_ZOOM, z * 1.4));
      else if (e.key === "-") setZoom((z) => Math.max(MIN_ZOOM, z / 1.4));
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [go, onClose, reset]);

  // Zoom toward the cursor rather than the centre.
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    setZoom((z) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * (e.deltaY < 0 ? 1.18 : 1 / 1.18)));
      setOffset((o) =>
        next === 1
          ? { x: 0, y: 0 }
          : { x: o.x + (px - px * (next / z)), y: o.y + (py - py * (next / z)) },
      );
      return next;
    });
  }, []);

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (pointers.current.size === 2) {
      pinch.current = { startDist: distance(), startZoom: zoom };
      drag.current.active = false;
      setDragging(false);
      return;
    }
    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      ox: offset.x,
      oy: offset.y,
      moved: 0,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const d = distance();
      if (pinch.current.startDist > 0) {
        const next = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, (pinch.current.startZoom * d) / pinch.current.startDist),
        );
        setZoom(next);
        if (next === 1) setOffset({ x: 0, y: 0 });
      }
      return;
    }

    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    drag.current.moved = Math.max(drag.current.moved, Math.hypot(dx, dy));
    // Panning only makes sense once there is something to pan.
    if (zoom > 1) setOffset({ x: drag.current.ox + dx, y: drag.current.oy + dy });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = drag.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current.startDist = 0;
    if (!start.active) return;
    drag.current.active = false;
    setDragging(false);

    // At 1x a horizontal drag pages through the set.
    if (zoom === 1 && many) {
      const dx = e.clientX - start.startX;
      const dy = e.clientY - start.startY;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? 1 : -1);
      }
    }
  };

  if (!item) return null;
  const isVideo = item.kind === "video";

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={(e) => {
        // Only the backdrop closes; clicks on the media do not.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lightbox-bar">
        <span className="font-mono lightbox-title">{item.title}</span>
        <span className="lightbox-actions">
          {!isVideo ? (
            <>
              <button
                type="button"
                className="lightbox-btn font-mono"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z / 1.4))}
                aria-label="Zoom out"
              >
                −
              </button>
              <span className="font-mono lightbox-zoom">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                className="lightbox-btn font-mono"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.4))}
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                className="lightbox-btn font-mono"
                onClick={reset}
                aria-label="Reset zoom"
              >
                RESET
              </button>
            </>
          ) : null}
          <button
            type="button"
            className="lightbox-btn font-mono"
            onClick={onClose}
            aria-label="Close viewer"
          >
            CLOSE
          </button>
        </span>
      </div>

      <div
        ref={stageRef}
        className="lightbox-stage"
        onWheel={onWheel}
        onPointerDown={isVideo ? undefined : onPointerDown}
        onPointerMove={isVideo ? undefined : onPointerMove}
        onPointerUp={isVideo ? undefined : onPointerUp}
        onPointerCancel={isVideo ? undefined : onPointerUp}
        onDoubleClick={() => (zoom > 1 ? reset() : setZoom(2.5))}
        style={{
          cursor: isVideo ? "default" : zoom > 1 ? "grab" : "zoom-in",
          touchAction: zoom > 1 ? "none" : "pan-y",
        }}
      >
        <div
          className="lightbox-media"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: dragging ? "none" : "transform .25s var(--ease)",
          }}
        >
          {isVideo ? (
            <video
              src={item.src}
              controls
              loop
              playsInline
              className="lightbox-video"
            />
          ) : (
            <Image
              src={item.src}
              alt={item.title}
              width={item.width}
              height={item.height}
              unoptimized={item.kind === "gif"}
              sizes="100vw"
              className="lightbox-img"
              draggable={false}
              priority
            />
          )}
        </div>
      </div>

      {many ? (
        <>
          <button
            type="button"
            className="lightbox-nav is-prev font-mono"
            onClick={() => go(-1)}
            aria-label="Previous"
          >
            ←
          </button>
          <button
            type="button"
            className="lightbox-nav is-next font-mono"
            onClick={() => go(1)}
            aria-label="Next"
          >
            →
          </button>
        </>
      ) : null}

      <div className="lightbox-foot">
        {item.note ? (
          <p className="lightbox-note">{item.note}</p>
        ) : null}
        {many ? (
          <span className="font-mono lightbox-count">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
            {zoom === 1 ? " · SWIPE OR ← →" : " · DRAG TO PAN"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
