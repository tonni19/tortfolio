import Image from "next/image";
import Link from "next/link";
import HeroScroll from "./HeroScroll";
import { coverOf, HERO_WORKS } from "@/lib/works";

const CAPTION_SHADOW = "0 4px 24px rgba(0,0,0,.6)";

export default function Hero() {
  return (
    <section
      id="hero"
      className="sticky top-0 z-0 h-screen min-h-[660px] overflow-hidden"
    >
      <div id="heroInner" className="hero-inner hero-strip absolute inset-0">
        {HERO_WORKS.map((work) => {
          const art = coverOf(work);

          return (
            <Link
              key={work.slug}
              href={`/work/${work.slug}`}
              className="hero-panel"
              aria-label={`${work.title}, ${work.kind}`}
            >
              <Image
                src={art.src}
                alt=""
                fill
                priority
                sizes="(max-width: 767px) 78vw, 60vw"
                className="object-cover"
                style={{ filter: "grayscale(.15) contrast(1.05)" }}
              />

              <div
                className="absolute inset-0"
                style={{ backgroundImage: "var(--scrim)" }}
              />

              <div className="hero-caption absolute right-0 bottom-[26px] left-0 flex flex-col items-center gap-[2px] px-3 text-center">
                <span
                  className="hero-caption-line font-display text-[clamp(26px,3.1vw,52px)] text-panel-ink"
                  style={{
                    lineHeight: 0.86,
                    letterSpacing: ".01em",
                    textShadow: CAPTION_SHADOW,
                  }}
                >
                  {work.a}
                </span>
                <span
                  className="hero-caption-line font-display text-[clamp(26px,3.1vw,52px)] text-sage-mid"
                  style={{ lineHeight: 0.86, textShadow: CAPTION_SHADOW }}
                >
                  {work.b}
                </span>
                <span
                  className="hero-caption-kind font-mono mt-[10px] text-[11px] text-on-media uppercase opacity-90"
                  style={{
                    letterSpacing: ".2em",
                    textShadow: "0 2px 10px rgba(0,0,0,.85)",
                  }}
                >
                  {work.kind}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <HeroScroll targetId="heroInner" />
    </section>
  );
}
