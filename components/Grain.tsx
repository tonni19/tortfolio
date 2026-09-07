/**
 * Global grain overlay. Fixed, above everything, never interactive.
 * 120x120 feTurbulence tile at .055 opacity, overlay blend.
 */
const GRAIN_TILE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='.85' numOctaves='3'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")";

export default function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-60"
      style={{
        opacity: 0.055,
        mixBlendMode: "overlay",
        backgroundImage: GRAIN_TILE,
      }}
    />
  );
}
