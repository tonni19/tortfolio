"use client";

import { useEffect } from "react";

/**
 * Everything is muted by default and stays muted unless the visitor asks for
 * sound.
 *
 * This used to force silence on every media element unconditionally. The reel
 * now has a sound toggle, so an element the player owns opts out by carrying
 * `data-allow-audio`. Everything else — hover previews, loop cards, anything
 * added later — is still forced silent, so nothing can start making noise on
 * its own.
 */

const MEDIA_EVENTS = [
  "play",
  "playing",
  "loadeddata",
  "volumechange",
  "canplay",
] as const;

type PatchedProto = HTMLMediaElement & { __tortillaMuteWrapped?: boolean };

/** The visitor asked for sound on this element, so leave it alone. */
function userControlled(el: HTMLMediaElement) {
  return el.dataset.allowAudio !== undefined;
}

function silence(el: EventTarget | null) {
  if (!(el instanceof HTMLMediaElement)) return;
  if (userControlled(el)) return;
  try {
    el.defaultMuted = true;
    if (el.muted !== true) el.muted = true;
    if (el.volume !== 0) el.volume = 0;
  } catch {
    /* element torn down mid-write */
  }
}

function silenceAll() {
  document.querySelectorAll("video, audio").forEach(silence);
}

export default function MuteGuard() {
  useEffect(() => {
    const onMediaEvent = (e: Event) => silence(e.target);

    for (const ev of MEDIA_EVENTS) {
      document.addEventListener(ev, onMediaEvent, true);
    }

    // Patch play() so a clip cannot start audible even for one frame.
    const proto = HTMLMediaElement.prototype as PatchedProto;
    if (!proto.__tortillaMuteWrapped) {
      const originalPlay = proto.play;
      proto.play = function patchedPlay(this: HTMLMediaElement) {
        silence(this);
        const result = originalPlay.apply(this);
        silence(this);
        return result;
      };
      proto.__tortillaMuteWrapped = true;
    }

    const sweep = window.setInterval(silenceAll, 500);
    silenceAll();

    return () => {
      for (const ev of MEDIA_EVENTS) {
        document.removeEventListener(ev, onMediaEvent, true);
      }
      window.clearInterval(sweep);
    };
  }, []);

  return null;
}
