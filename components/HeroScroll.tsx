"use client";

import { useEffect } from "react";

/**
 * Fallback for the hero sink in browsers without scroll-driven animations.
 *
 * Where `animation-timeline: scroll(root)` is supported the CSS in
 * globals.css owns the effect and this does nothing. Otherwise it runs a
 * rAF-coalesced scroll handler — one write per frame, one layout read of
 * `scrollY`, never an unthrottled per-scroll loop.
 */
export default function HeroScroll({ targetId }: { targetId: string }) {
  useEffect(() => {
    const supportsScrollTimeline =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("animation-timeline: scroll(root)");
    if (supportsScrollTimeline) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = document.getElementById(targetId);
    if (!el) return;

    let frame = 0;

    const paint = () => {
      frame = 0;
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / window.innerHeight),
      );
      el.style.transform = `scale(${1 - progress * 0.1}) translateY(${progress * -40}px)`;
      el.style.opacity = String(1 - progress * 0.35);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    paint();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "";
      el.style.opacity = "";
    };
  }, [targetId]);

  return null;
}
