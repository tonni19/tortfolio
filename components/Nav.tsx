"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { NAV_ITEMS } from "@/lib/works";

/**
 * Pill navbar.
 *
 * On a phone the six items do not fit, and making the pill scroll sideways
 * hid half the menu behind a gesture nobody knows is there. Below `md` the
 * items collapse into a Menu button that opens a full-screen sheet with
 * finger-sized rows instead.
 */
export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header
        className="fixed top-[14px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-[100px] bg-sage px-3 py-[9px] pl-5 md:gap-[30px]"
        style={{
          border: "1px solid var(--pill-line)",
          boxShadow: "var(--pill-shadow)",
          maxWidth: "calc(100% - 28px)",
        }}
      >
        <Link
          href="/"
          className="nav-logo font-display shrink-0 text-[19px] whitespace-nowrap text-cream uppercase hover:text-cream"
          style={{ letterSpacing: ".07em" }}
          onClick={() => setOpen(false)}
        >
          Tortilla<span className="text-sage-light">°</span>
        </Link>

        {/* Desktop: the full set inline. */}
        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link font-mono flex shrink-0 items-baseline gap-[7px] rounded-[100px] px-[13px] py-2 text-[11px] whitespace-nowrap text-cream uppercase transition-[background-color,color] duration-250 hover:bg-cream hover:text-ink"
              style={{ letterSpacing: ".14em" }}
            >
              <span className="text-[9px] opacity-50">{item.num}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <span
          className="flex shrink-0 items-center gap-4 pl-4 md:gap-[22px] md:pl-[26px]"
          style={{ borderLeft: "1px solid var(--pill-line)" }}
        >
          <ThemeToggle />

          {/* Phone: one button, no hidden sideways scroll. */}
          <button
            type="button"
            className="nav-toggle font-mono md:hidden"
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </span>
      </header>

      <div
        id="nav-sheet"
        className={`nav-sheet${open ? " is-open" : ""}`}
        hidden={!open}
      >
        <nav aria-label="Sections">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-sheet-link"
              onClick={() => setOpen(false)}
            >
              <span className="font-mono nav-sheet-num">{item.num}</span>
              <span className="font-display nav-sheet-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
