/**
 * Global grain overlay. Fixed, above everything, never interactive.
 * 120x120 feTurbulence tile; strength and blend mode are theme tokens,
 * because `overlay` at .055 does nothing at all on a near-black ground.
 */
const GRAIN_TILE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='.85' numOctaves='3'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")";

export default function Grain() {
  return (
    <div
      aria-hidden
      className="grain pointer-events-none fixed inset-0 z-60"
      style={{ backgroundImage: GRAIN_TILE }}
    />
  );
}
