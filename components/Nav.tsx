import Link from "next/link";
import { NAV_ITEMS } from "@/lib/works";

/**
 * Fixed pill navbar, present on both the home page and detail pages.
 * On narrow screens the item list scrolls horizontally rather than
 * wrapping or collapsing into a menu — the pill keeps its shape.
 */
export default function Nav() {
  return (
    <header
      className="fixed top-[14px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-[100px] bg-sage px-3 py-[9px] pl-5 sm:gap-[30px]"
      style={{
        border: "1px solid rgba(246,241,231,.24)",
        boxShadow: "0 10px 30px rgba(42,39,35,.22)",
        maxWidth: "calc(100% - 28px)",
      }}
    >
      <Link
        href="/"
        className="font-display shrink-0 text-[19px] whitespace-nowrap text-cream uppercase hover:text-cream"
        style={{ letterSpacing: ".07em" }}
      >
        Tortilla<span className="text-sage-light">°</span>
      </Link>

      <nav
        aria-label="Sections"
        className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="font-mono flex shrink-0 items-baseline gap-[7px] rounded-[100px] px-[13px] py-2 text-[11px] whitespace-nowrap text-cream uppercase transition-[background-color,color] duration-250 hover:bg-cream hover:text-ink"
            style={{ letterSpacing: ".14em" }}
          >
            <span className="text-[9px] opacity-50">{item.num}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
