"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Reveal from "./Reveal";
import { LOOPS } from "@/lib/loops";

/**
 * Section 04 — the player and the loop shelf, merged.
 *
 * They were two sections sharing one piece of state, which read as two
 * unrelated blocks. The player sits on a fixed-height ink stage with an info
 * rail beside it, and the shelf of loop cards sits underneath.
 *
 * Non-negotiable behaviour #2 still holds: loop cards animate on hover only.
 * At rest a video sits paused on its first frame (forced by the #t=0.001
 * fragment) and a GIF shows its exported poster. Four clips never run at once.
 */

function ratioOf(ratios: Record<string, number>, id: string, fallback: number) {
  return ratios[id] ?? fallback;
}

export default function ReelLoops() {
  const [featured, setFeatured] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hoverLoop, setHoverLoop] = useState(-1);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  // Off by default: autoplay is only allowed while muted, and nothing should
  // make noise until it is asked to.
  const [soundOn, setSoundOn] = useState(false);
  const reelVideoRef = useRef<HTMLVideoElement>(null);

  const current = LOOPS[featured];

  /** Correct the baked-in ratio if a file is ever swapped for a different one. */
  const measure = useCallback((id: string, w: number, h: number) => {
    if (!w || !h) return;
    const next = w / h;
    setRatios((prev) =>
      Math.abs((prev[id] ?? 0) - next) > 0.01 ? { ...prev, [id]: next } : prev,
    );
  }, []);

  const toggleReel = useCallback(() => {
    const video = reelVideoRef.current;
    if (current.kind === "image" || !video) {
      setPlaying((p) => !p);
      return;
    }
    if (video.paused) {
      // Respect the sound toggle — do not silently undo it on every play.
      video.muted = !soundOn;
      video.volume = soundOn ? 1 : 0;
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [current.kind, soundOn]);

  /**
   * Behaviour #2 in one place: pointer or keyboard focus on a card starts
   * that clip and nothing else; leaving returns it to a still.
   */
  const hoverCard = useCallback(
    (index: number, card: HTMLElement, on: boolean) => {
      setHoverLoop(on ? index : -1);
      const video = card.querySelector("video");
      if (!video) return; // GIF cards swap poster/source via `hoverLoop`
      if (on) {
        video.muted = true;
        video.volume = 0;
        void video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    },
    [],
  );

  const selectLoop = useCallback((index: number, card: HTMLElement | null) => {
    // The card stops animating the moment it becomes the player source.
    card?.querySelector("video")?.pause();
    setHoverLoop(-1);
    setFeatured(index);
    // A GIF cannot really be paused, so for an image loop "playing" means
    // "show the animated file"; pausing swaps back to the poster. A video
    // corrects this itself through onPlay / onPause.
    setPlaying(true);
  }, []);

  const showAnimatedImage = current.kind === "image" && playing;

  /**
   * React does not reliably set the `muted` DOM property from its prop, and
   * this element opts out of MuteGuard, so nothing else would catch it. Drive
   * it from the effect instead — otherwise a clip could load audible.
   */
  useEffect(() => {
    const video = reelVideoRef.current;
    if (!video) return;
    video.muted = !soundOn;
    video.volume = soundOn ? 1 : 0;
  }, [soundOn, featured]);

  /**
   * `data-allow-audio` tells MuteGuard to stop forcing this element silent;
   * the muted property is then ours to drive.
   */
  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      const video = reelVideoRef.current;
      if (video) {
        video.muted = !next;
        video.volume = next ? 1 : 0;
      }
      return next;
    });
  }, []);

  return (
    <section
      id="reel"
      className="mx-auto max-w-[1500px] px-7 pb-20 lg:pb-[110px]"
    >
      <div
        className="flex items-baseline justify-between gap-4 pb-4"
        style={{ borderBottom: "1px solid var(--hairline)" }}
      >
        <h2 className="eyebrow m-0">04 / REEL &amp; LOOPS</h2>
        <span
          className="font-mono text-[10px] opacity-40"
          style={{ letterSpacing: ".18em" }}
        >
          {String(featured + 1).padStart(2, "0")} /{" "}
          {String(LOOPS.length).padStart(2, "0")}
        </span>
      </div>

      <Reveal>
        <div className="grid grid-cols-1 gap-8 pt-10 lg:grid-cols-[1fr_320px] lg:gap-12">
          {/* The stage. A fixed height with the clip contained inside, so
              portrait and landscape clips both sit in the same frame. */}
          <div
            role="button"
            tabIndex={0}
            aria-label={
              playing ? `Pause ${current.file}` : `Play ${current.file}`
            }
            onClick={toggleReel}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleReel();
              }
            }}
            className="reel-stage"
          >
            {current.kind === "video" ? (
              <video
                key={current.src}
                ref={reelVideoRef}
                src={current.src}
                autoPlay
                loop
                muted={!soundOn}
                data-allow-audio=""
                playsInline
                preload="auto"
                onLoadedMetadata={(e) =>
                  measure(
                    current.id,
                    e.currentTarget.videoWidth,
                    e.currentTarget.videoHeight,
                  )
                }
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onCanPlay={(e) => setPlaying(!e.currentTarget.paused)}
                className="h-full w-auto max-w-full object-contain"
              />
            ) : (
              <Image
                key={showAnimatedImage ? current.src : current.poster}
                src={
                  showAnimatedImage
                    ? current.src
                    : (current.poster ?? current.src)
                }
                alt={current.file}
                fill
                unoptimized={showAnimatedImage}
                sizes="(max-width: 1023px) 100vw, 60vw"
                className="object-contain"
              />
            )}
          </div>

          {/* Info rail — fills what used to be dead space beside the clip. */}
          <div className="flex flex-col gap-6 lg:pt-2">
            <div>
              <div className="eyebrow mb-3">NOW PLAYING</div>
              <p
                className="font-display m-0 text-[clamp(26px,2.4vw,38px)] uppercase"
                style={{ lineHeight: 1.05 }}
              >
                {current.file}
              </p>
              <p
                className="font-mono mt-3 mb-0 text-[10px] text-sage"
                style={{ letterSpacing: ".18em" }}
              >
                {current.meta}
              </p>
              <p
                className="font-mono mt-2 mb-0 text-[10px] opacity-50"
                style={{ letterSpacing: ".16em" }}
              >
                {current.note}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleReel}
                className="reel-control font-mono rounded-[100px] px-[22px] py-[11px] text-[10px] uppercase"
                style={{ letterSpacing: ".2em" }}
              >
                {playing ? "Pause" : "Play"}
              </button>

              {current.hasAudio ? (
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-pressed={soundOn}
                  className={`reel-control font-mono rounded-[100px] px-[22px] py-[11px] text-[10px] uppercase${
                    soundOn ? " is-on" : ""
                  }`}
                  style={{ letterSpacing: ".2em" }}
                >
                  {soundOn ? "Sound on" : "Sound off"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>

      {/* The shelf. */}
      <div
        className="mt-14 pt-10"
        style={{ borderTop: "1px solid var(--hairline)" }}
      >
        <div className="mb-7 flex flex-wrap items-baseline gap-[18px]">
          <h3 className="eyebrow m-0">ALL LOOPS</h3>
          <span className="meta opacity-45">
            HOVER TO PREVIEW · CLICK TO SEND IT TO THE PLAYER
          </span>
        </div>

        <Reveal>
          <div className="loop-row">
            {LOOPS.map((loop, i) => {
              const ratio = ratioOf(ratios, loop.id, loop.ratio);
              const isFeatured = featured === i;
              const isHovered = hoverLoop === i;

              return (
                <figure
                  key={loop.id}
                  className="m-0 flex flex-col gap-[10px]"
                  style={{
                    transition: "transform .45s var(--ease)",
                    transform: `translateY(${isFeatured ? "-4px" : "0"})`,
                  }}
                  onMouseEnter={(e) => hoverCard(i, e.currentTarget, true)}
                  onMouseLeave={(e) => hoverCard(i, e.currentTarget, false)}
                >
                  <button
                    type="button"
                    aria-pressed={isFeatured}
                    aria-label={`Play ${loop.file} in the player`}
                    onClick={(e) => selectLoop(i, e.currentTarget)}
                    onFocus={(e) => hoverCard(i, e.currentTarget, true)}
                    onBlur={(e) => hoverCard(i, e.currentTarget, false)}
                    className="loop-frame relative flex flex-none cursor-pointer items-center justify-center overflow-hidden bg-bone p-0"
                    style={
                      {
                        border: isFeatured
                          ? "2px solid var(--color-sage)"
                          : "1px solid rgba(42,39,35,.18)",
                        "--loop-ratio": ratio,
                      } as CSSProperties
                    }
                  >
                    {loop.kind === "video" ? (
                      <video
                        // #t=0.001 makes the browser paint the first frame
                        // while still only preloading metadata.
                        src={`${loop.src}#t=0.001`}
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) =>
                          measure(
                            loop.id,
                            e.currentTarget.videoWidth,
                            e.currentTarget.videoHeight,
                          )
                        }
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Image
                        src={isHovered ? loop.src : (loop.poster ?? loop.src)}
                        alt={loop.file}
                        fill
                        unoptimized={isHovered}
                        sizes="(max-width: 767px) 60vw, 25vw"
                        className="object-contain"
                        onLoad={(e) =>
                          measure(
                            loop.id,
                            e.currentTarget.naturalWidth,
                            e.currentTarget.naturalHeight,
                          )
                        }
                      />
                    )}

                    <span
                      className="font-mono absolute top-[10px] left-[10px] rounded-[100px] px-[10px] py-[5px] text-[9px]"
                      style={{
                        letterSpacing: ".16em",
                        background: isFeatured
                          ? "var(--color-sage)"
                          : "rgba(246,241,231,.9)",
                        color: isFeatured
                          ? "var(--color-cream)"
                          : "var(--color-ink)",
                      }}
                    >
                      {isFeatured ? "IN PLAYER" : "PLAY"}
                    </span>
                  </button>

                  <figcaption
                    className="font-mono flex flex-col gap-[3px] text-[9.5px] opacity-55"
                    style={{ letterSpacing: ".16em" }}
                  >
                    <span>{loop.file}</span>
                    <span>{loop.note}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
