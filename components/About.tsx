import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { media } from "@/lib/media.generated";

export default function About() {
  return (
    <section
      id="about"
      className="mx-auto grid max-w-[1500px] grid-cols-1 items-start gap-14 px-7 pt-20 pb-[70px] lg:grid-cols-[1.15fr_.85fr] lg:gap-[70px] lg:pt-[120px] lg:pb-[110px]"
    >
      <div>
        <Reveal className="eyebrow mb-7">01 / ABOUT</Reveal>

        <Reveal>
          <h2
            className="font-display m-0 mb-[30px] text-[clamp(38px,4.4vw,74px)]"
            style={{ lineHeight: 1.02, textWrap: "balance" }}
          >
            Hi, I&apos;m Tortilla — a 2D digital artist and illustrator making
            characters that refuse to sit still.
          </h2>
        </Reveal>

        <p className="prose-body m-0 mb-[18px]">
          I draw people, animals and the odd sentient matchstick — character
          design and turnarounds, sprites and tilesets, UI and icon art, comic
          pages. Most of it starts as a scribble in a sketchbook and ends as a
          finished asset, coloured loud and drawn with a bit of a swagger.
        </p>
        <p className="prose-body m-0 mb-[34px]">
          Commissions, character sheets, game art, comics. I work in whatever the
          brief calls for — line art, painted, vector or pixel — and every final
          ships with its layered source file.
        </p>

        <Link
          href="/#contact"
          className="cta-pill font-display inline-flex items-center gap-[10px] rounded-[100px] px-[26px] py-[15px] text-[16px] text-cream uppercase"
          style={{ letterSpacing: ".06em" }}
        >
          Get in touch <span aria-hidden>→</span>
        </Link>
      </div>

      <Reveal className="relative">
        <Image
          src={media("my-avatars/tortilla").src}
          alt="Tortilla, drawn by herself"
          width={media("my-avatars/tortilla").width}
          height={media("my-avatars/tortilla").height}
          sizes="(max-width: 1023px) 100vw, 40vw"
          className="block h-auto w-full rounded-[4px]"
        />

        <div
          className="bob absolute -top-[26px] -right-[14px] flex size-[104px] items-center justify-center rounded-full bg-sage"
          style={{
            border: "1px solid rgba(246,241,231,.3)",
            animation: "t-bob 5s ease-in-out infinite",
          }}
        >
          <span
            className="font-mono text-center text-[9px] text-cream"
            style={{ lineHeight: 1.5, letterSpacing: ".14em" }}
          >
            OPEN
            <br />
            FOR
            <br />
            WORK
          </span>
        </div>
      </Reveal>
    </section>
  );
}
