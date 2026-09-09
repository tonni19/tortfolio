import Reveal from "./Reveal";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/works";

export default function Contact() {
  return (
    <section
      id="contact"
      className="mx-auto max-w-[1500px] px-7 pt-20 pb-[70px] text-center lg:pt-[120px]"
    >
      <h2 className="eyebrow mb-[26px]">05 / CONTACT</h2>

      <Reveal>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-display mx-auto inline-block w-fit text-[clamp(52px,11vw,168px)] text-ink uppercase transition-colors duration-300 hover:text-sage"
          style={{ lineHeight: 0.92 }}
        >
          Let&apos;s draw
          <br />
          something
        </a>
      </Reveal>

      <nav
        aria-label="Elsewhere"
        className="font-mono mt-11 flex flex-wrap justify-center gap-[30px] text-[11px]"
        style={{ letterSpacing: ".18em" }}
      >
        <a className="tap-link" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL.toUpperCase()}
        </a>
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            className="tap-link"
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <p
        className="font-mono mt-[70px] mb-0 text-[10px] opacity-35"
        style={{ letterSpacing: ".18em" }}
      >
        ©2026 TORTILLA · ALL DRAWINGS MINE
      </p>
    </section>
  );
}
