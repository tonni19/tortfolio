"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Non-negotiable behaviour #3: reveal animations fail open.
 *
 * The server renders every element visible. The hidden state is only ever
 * applied on the client, and only once we know an IntersectionObserver was
 * constructed. A watchdog reveals the element anyway if that observer never
 * delivers its first callback — so nothing can be left stranded at opacity 0.
 */
export default function Reveal({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Anything already on screen at mount stays as it is — no flash.
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.92) return;

    const show = () => {
      el.dataset.reveal = "";
    };

    el.dataset.reveal = "hidden";

    let observerIsAlive = false;
    const io = new IntersectionObserver(
      (entries) => {
        observerIsAlive = true;
        for (const entry of entries) {
          // `top < 0` means the element is already above the viewport: the
          // user jumped past it via a nav anchor or a restored scroll
          // position. There is nothing left to animate into view, so show it
          // rather than leaving it stranded at opacity 0.
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            show();
            io.disconnect();
          }
        }
      },
      {
        // The huge top margin extends the root far above the viewport, so an
        // element the user jumped past (nav anchor, restored scroll position)
        // still counts as intersecting and reveals. Without it the ratio goes
        // from 0 (below) to 0 (above) without ever crossing the threshold, no
        // callback fires at all, and the element is stranded at opacity 0.
        // The -6% bottom margin is the real trigger line for scrolling down.
        rootMargin: "100000px 0px -6% 0px",
        threshold: 0.02,
      },
    );
    io.observe(el);

    // observe() always schedules an initial callback. If it has not arrived,
    // the observer is not working — reveal rather than hide forever.
    const watchdog = window.setTimeout(() => {
      if (!observerIsAlive) {
        show();
        io.disconnect();
      }
    }, 1500);

    return () => {
      window.clearTimeout(watchdog);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} data-reveal="" className={className} style={style}>
      {children}
    </div>
  );
}
