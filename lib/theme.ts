/**
 * The two themes, and the one-liner that has to run before first paint.
 *
 * The theme is an attribute on <html> (`data-theme`), which app/globals.css
 * reads to re-point its colour tokens. Nothing else in the app knows the
 * theme exists.
 */

export type Theme = "light" | "dark";

/** localStorage key. Namespaced, because this is a *.vercel.app origin. */
export const THEME_KEY = "tortfolio-theme";

/** Browser chrome colour per theme — must match --color-cream in globals.css. */
export const THEME_COLOR: Record<Theme, string> = {
  light: "#f6f1e7",
  dark: "#191216",
};

/**
 * Runs synchronously in <body>, before anything paints, so the page never
 * flashes the wrong theme and the toggle is drawn in the right position from
 * the first frame. Stored choice wins; otherwise follow the system.
 *
 * Minified by hand because it ships inline on every page. Any failure —
 * private-mode localStorage throwing, a prehistoric browser without
 * matchMedia — falls through to light.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;
