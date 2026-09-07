import Reveal from "./Reveal";
import { PROCESS_STEPS } from "@/lib/works";

/**
 * 4-up grid where the 1px gaps read as hairlines: the grid container
 * carries the hairline colour and each cell paints cream over it.
 *
 * The reveal wrapper and the cell are separate elements on purpose —
 * both need their own `transition`, and one element cannot hold two.
 */
export default function Process() {
  return (
    <section
      id="process"
      className="mx-auto max-w-[1500px] px-7 py-20 lg:py-[110px]"
    >
      <div className="eyebrow mb-9">03 / PROCESS</div>

      <div
        className="grid grid-cols-1 gap-px sm:grid-cols-2 xl:grid-cols-4"
        style={{
          background: "var(--hairline)",
          border: "1px solid var(--hairline)",
        }}
      >
        {PROCESS_STEPS.map((step) => (
          <Reveal key={step.num}>
            <div className="process-cell flex h-full min-h-[280px] flex-col gap-[14px] px-[26px] pt-[34px] pb-10">
              <span
                className="font-display text-[52px] text-sage opacity-85"
                style={{ lineHeight: 1 }}
              >
                {step.num}
              </span>
              <h3
                className="font-display m-0 text-[24px] uppercase"
                style={{ letterSpacing: ".02em" }}
              >
                {step.title}
              </h3>
              <p
                className="m-0 text-[14.5px] opacity-65"
                style={{ lineHeight: 1.6, textWrap: "pretty" }}
              >
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
