"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_COLOR, THEME_KEY, type Theme } from "@/lib/theme";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/**
 * Wipe timing. These three values are load-bearing together, so a note on why
 * they are not the site's usual `cubic-bezier(.16,1,.3,1)` at 620ms.
 *
 * A wipe is not an element arriving. What the eye tracks is the *edge*, and
 * what it wants is for the edge to move at a roughly even speed. Expo-out
 * spends over half its duration in the last 3% of its travel, and that last
 * 3% of radius is the only part that lands in the corner furthest from the
 * button — so three corners cleared in 138ms and the fourth crept in over the
 * remaining 482ms, which read as the bottom-left corner lagging.
 *
 * A near-linear curve keeps the edge speed within about 2.8x across all four
 * corners. Overshooting the radius by 6% puts the easing's dead tail off
 * screen rather than in that last corner, and also covers subpixel rounding
 * so no sliver of the old theme can survive at the very edge.
 */
const WIPE_MS = 480;
const WIPE_EASING = "cubic-bezier(.45,.55,.55,1)";
const WIPE_OVERSHOOT = 1.06;

/**
 * The attribute on <html> is the source of truth — the inline script writes
 * it before React exists, and CSS reads it — so this subscribes to it rather
 * than keeping a second copy in state that could disagree.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const readTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** Nothing is rendered on the server that depends on the theme but this. */
const serverTheme = (): Theme => "light";

/**
 * Day/night switch for the nav pill.
 *
 * The *look* of it is pure CSS keyed off `data-theme` on <html> (see the
 * theme-toggle block in globals.css), so the dial is already in the right
 * place at first paint. This component only owns the click, the stored
 * choice and the accessible state — which is also why it renders both
 * labels and lets CSS choose: swapping the word in React would flash the
 * wrong one on every load.
 *
 * The flip itself is a circular wipe of the incoming theme, expanding from
 * the toggle. That needs the View Transitions API; without it, or under
 * reduced motion, the theme just changes.
 */
export default function ThemeToggle() {
  // Only drives aria — the dial itself is styled straight off the attribute.
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);

  const apply = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode. The choice just will not survive a reload.
    }
    // The <meta> tags are media-split for the system default; an explicit
    // choice has to overwrite both or the phone's chrome keeps the old one.
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", THEME_COLOR[next]));
  }, []);

  const toggle = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const next: Theme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      const doc = document as ViewTransitionDocument;

      if (
        typeof doc.startViewTransition !== "function" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        apply(next);
        return;
      }

      // Wipe from the middle of the button, out past whichever corner is
      // furthest away, so the circle clears the viewport with room to spare.
      const box = event.currentTarget.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      const radius =
        Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        ) * WIPE_OVERSHOOT;

      const transition = doc.startViewTransition(() => apply(next));
      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: WIPE_MS,
              easing: WIPE_EASING,
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {
          // A transition skipped mid-flight still applied the theme.
        });
    },
    [apply],
  );

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-pressed={theme === "dark"}
      aria-label={
        theme === "dark" ? "Switch to the day theme" : "Switch to the night theme"
      }
    >
      <span className="theme-toggle-track" aria-hidden>
        <span className="theme-toggle-dial" />
      </span>
      {/* md:grid, not md:inline — the label stacks both words in one cell so
          the pill cannot change width. See globals.css. */}
      <span className="theme-toggle-label hidden md:grid" aria-hidden>
        <span data-when="light">Day</span>
        <span data-when="dark">Night</span>
      </span>
    </button>
  );
}
