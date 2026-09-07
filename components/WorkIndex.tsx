"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { coverOf, WORKS } from "@/lib/works";

/**
 * Section 02.
 *
 * The preview follows the cursor across the section and fades in only while a
 * row is hovered.
 *
 * Two traps, both handled here:
 *  - All images are mounted once and cross-faded by opacity. Swapping `src`
 *    would show the previous project's image for a frame.
 *  - Position is written straight to the DOM inside a rAF, so a mousemove
 *    never triggers a React render. Only `row` (rare) is state.
 *
 * The outer element carries position and has no transition, so tracking is
 * instant; the inner element carries the transitioned rotate/scale/opacity.
 */
export default function WorkIndex() {
  const [row, setRow] = useState(-1);
  const positionRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const pointRef = useRef({ x: 0, y: 0 });

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    pointRef.current = { x: e.clientX, y: e.clientY };
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const el = positionRef.current;
      if (!el) return;
      const { x, y } = pointRef.current;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }, []);

  const active = row >= 0;

  return (
    <section
      id="works"
      className="relative mx-auto max-w-[1500px] px-7 pb-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRow(-1)}
    >
      <div
        className="flex items-baseline justify-between pb-4"
        style={{ borderBottom: "1px solid var(--hairline)" }}
      >
        <h2 className="eyebrow m-0">02 / SELECTED WORKS</h2>
        <span
          className="font-mono text-[10px] opacity-40"
          style={{ letterSpacing: ".18em" }}
        >
          2021 — 2026
        </span>
      </div>

      <Reveal>
        <div className="work-list">
          {WORKS.map((work, i) => (
            <Link
              key={work.slug}
              href={`/work/${work.slug}`}
              className="work-row"
              onMouseEnter={() => setRow(i)}
              onFocus={() => setRow(i)}
              onBlur={() => setRow(-1)}
            >
              <span
                className="font-mono w-[38px] flex-none text-[10px] opacity-45"
                style={{ letterSpacing: ".16em" }}
              >
                {work.num}
              </span>
              <span
                className="font-display flex-1 text-[clamp(34px,5vw,78px)] uppercase"
                style={{ lineHeight: 1 }}
              >
                {work.title}
              </span>
              <span
                className="font-mono hidden w-[220px] flex-none text-right text-[10px] leading-[1.7] opacity-55 lg:block"
                style={{ letterSpacing: ".16em" }}
              >
                {work.meta} · {work.kind}
              </span>
              <span
                aria-hidden
                className="font-mono w-[26px] flex-none text-right text-[14px] opacity-50"
              >
                ↗
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      <div ref={positionRef} aria-hidden className="work-preview">
        <div
          className="work-preview-inner"
          style={{
            opacity: active ? 1 : 0,
            transform: `rotate(${active ? -4 : -14}deg) scale(${active ? 1 : 0.85})`,
          }}
        >
          {WORKS.map((work, i) => (
            <Image
              key={work.slug}
              src={coverOf(work).src}
              alt=""
              fill
              sizes="240px"
              className="object-cover"
              style={{
                opacity: row === i ? 1 : 0,
                transition: "opacity .18s linear",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
