import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Process from "@/components/Process";
import ReelLoops from "@/components/ReelLoops";
import WorkIndex from "@/components/WorkIndex";

const SERVICES = [
  "2D Animation",
  "Character Design",
  "Illustration",
  "Frame by Frame",
];

// Software from the artist's CV, not the prototype's placeholder list.
const TOOLS = [
  "Aseprite",
  "Clip Studio",
  "Krita",
  "Illustrator",
  "Godot",
  "Blender",
];

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Everything below the hero is one cream sheet that slides up over it. */}
      <div className="page-sheet">
        <Marquee
          items={SERVICES}
          duration="26s"
          separator="✦"
          gap={44}
          label="Services"
          className="bg-sage py-3 text-cream"
          itemClassName="font-display text-[46px] tracking-[.02em] uppercase"
          style={{ borderTop: "2px solid var(--matte)" }}
        />

        <About />
        <WorkIndex />
        <Process />
        <ReelLoops />

        <Marquee
          items={TOOLS}
          duration="34s"
          gap={56}
          label="Software"
          highlightItems
          className="py-[26px]"
          itemClassName="font-display text-[30px] tracking-[.04em] uppercase"
          style={{
            borderTop: "1px solid var(--hairline)",
            borderBottom: "1px solid var(--hairline)",
          }}
        />

        <Contact />
      </div>
    </main>
  );
}
