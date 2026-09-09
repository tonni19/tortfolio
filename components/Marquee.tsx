"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

/**
 * A marquee that never shows a gap, loops forever when dragged, pauses on
 * click, and can highlight individual items on hover.
 *
 * Two layout problems solved here:
 *
 * 1. The gap. With only two copies the track animates by one copy width, so
 *    at the end of the cycle the visible region runs past the content
 *    whenever a copy is narrower than the viewport — which tore open a blank
 *    stretch after "Blender". We measure a copy against the container and
 *    render as many as it takes to cover it, then shift by exactly one copy
 *    (100 / copies percent), which keeps the speed identical regardless.
 *
 * 2. The dead end. Native overflow scrolling stops at the last copy. Because
 *    the content is periodic, scrollLeft and scrollLeft ± one copy width look
 *    identical, so we keep the scroll position inside a middle band and wrap
 *    it by exactly one copy whenever it leaves.
 *
 * Playback pauses on click rather than hover, so hovering an individual item
 * to highlight it does not stop the roll.
 */
export default function Marquee({
  items,
  duration,
  separator,
  className,
  itemClassName,
  gap,
  style,
  highlightItems = false,
  label,
}: {
  items: readonly string[];
  /** Time to travel one copy width, e.g. "26s". Speed is copy-count agnostic. */
  duration: string;
  separator?: string;
  className?: string;
  itemClassName?: string;
  gap: number;
  style?: CSSProperties;
  /** Give each item its own hover state, picking up the accent colour. */
  highlightItems?: boolean;
  /** Describes the strip for assistive tech, since clicking it toggles motion. */
  label: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const copyWidthRef = useRef(0);
  const centredRef = useRef(false);
  const dragRef = useRef({ active: false, lastX: 0, travelled: 0 });
  const [copies, setCopies] = useState(2);
  const [paused, setPaused] = useState(false);

  // Measure inside a ResizeObserver callback rather than the effect body, so
  // this reacts to viewport and font-load changes and never renders in a loop.
  useEffect(() => {
    const container = scrollRef.current;
    const copy = copyRef.current;
    if (!container || !copy) return;

    const recount = () => {
      const copyWidth = copy.getBoundingClientRect().width;
      const containerWidth = container.getBoundingClientRect().width;
      if (!copyWidth || !containerWidth) return;
      copyWidthRef.current = copyWidth;

      // Three copy widths of offset can stack before the container is even
      // drawn, and every one of them has to still land on content:
      //   - up to 1 copy from the animation's transform
      //   - up to 2 copies from the scroll wrap band, which sits at
      //     [copyWidth, 2 * copyWidth) so a leftward drag has somewhere to go
      // So the track must span 3 * copy + container, i.e. n >= 3 + C/W.
      // Getting this wrong is what reopened the blank stretch after
      // "Blender" at certain points in the cycle.
      const needed = Math.ceil(containerWidth / copyWidth) + 3;
      setCopies((prev) => {
        const next = Math.min(Math.max(needed, 4), 20);
        return next === prev ? prev : next;
      });

      // Park one copy in, so there is room to drag backwards immediately.
      if (!centredRef.current) {
        centredRef.current = true;
        container.scrollLeft = copyWidth;
      }
    };

    const observer = new ResizeObserver(recount);
    observer.observe(container);
    observer.observe(copy);
    return () => observer.disconnect();
  }, []);

  /** Keep the scroll offset within [copyWidth, 2 * copyWidth). */
  const wrap = useCallback(() => {
    const el = scrollRef.current;
    const width = copyWidthRef.current;
    if (!el || !width) return;
    if (el.scrollLeft >= width * 2) el.scrollLeft -= width;
    else if (el.scrollLeft < width) el.scrollLeft += width;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Touch already scrolls this natively; only take over for a mouse.
    if (e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = { active: true, lastX: e.clientX, travelled: 0 };
    el.setPointerCapture(e.pointerId);
  }, []);

  // Applied as a delta rather than from a fixed origin, so a wrap mid-drag
  // cannot desync the pointer from the content.
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = scrollRef.current;
    if (!drag.active || !el) return;
    const dx = e.clientX - drag.lastX;
    drag.travelled += Math.abs(dx);
    el.scrollLeft -= dx;
    drag.lastX = e.clientX;
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }, []);

  const togglePaused = useCallback(() => {
    // A click that dragged the strip is not a click. Without this, letting go
    // after a drag would also toggle playback.
    if (dragRef.current.travelled > 5) return;
    setPaused((p) => !p);
  }, []);

  const copy = (ref?: React.Ref<HTMLDivElement>, hidden = false) => (
    <div
      ref={ref}
      aria-hidden={hidden || undefined}
      className={`flex items-center whitespace-nowrap ${itemClassName ?? ""}`}
      style={{ gap, paddingRight: gap }}
    >
      {items.map((item) => (
        <Fragment key={item}>
          <span className={highlightItems ? "marquee-item" : undefined}>
            {item}
          </span>
          {separator ? <span style={{ opacity: 0.45 }}>{separator}</span> : null}
        </Fragment>
      ))}
    </div>
  );

  return (
    <div
      ref={scrollRef}
      role="button"
      tabIndex={0}
      aria-pressed={paused}
      aria-label={`${label}, ${paused ? "paused, activate to resume" : "scrolling, activate to pause"}`}
      className={`marquee ${className ?? ""}`}
      style={style}
      onScroll={wrap}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={togglePaused}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setPaused((p) => !p);
        }
      }}
    >
      <div
        className="marquee-track"
        style={
          {
            "--marquee-duration": duration,
            "--marquee-shift": `${100 / copies}%`,
            animationPlayState: paused ? "paused" : "running",
          } as CSSProperties
        }
      >
        {copy(copyRef)}
        {Array.from({ length: copies - 1 }, (_, i) => (
          <Fragment key={i}>{copy(undefined, true)}</Fragment>
        ))}
      </div>
    </div>
  );
}
