/**
 * Core timing helpers shared by every component: the easing family, ramps, springs, lerp, colour mix, typing.
 * All numbers are at 30 fps. Every component in this kit takes ABSOLUTE local frames (`at`, `...At`), so scenes
 * lay out from one timeline (the beat grid / VO timestamps written by the pipeline builder).
 */
import { Easing, interpolate, spring } from "remotion";

export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * The easing family. Pick by job, not by taste:
 * - cam:    camera moves, step changes, text exits          bezier(.6,.05,.35,1)
 * - in:     word reveals, dips, pops (easeOutQuart)         bezier(.25,1,.5,1)
 * - arrive: cut-in pull-backs, panel docking (easeOutExpo)  bezier(.16,1,.3,1)
 * - settle: every entrance (fast in, long soft landing)     bezier(.16,1,.3,1)
 * - flow:   position moves across a canvas (AE "Flow")      bezier(.84,0,.16,1)
 * - launch: accelerating exit in the last frames before a cut  bezier(.7,0,.84,0)
 * - wipe:   soft diagonal wipes (easeInOutSine)             bezier(.37,0,.63,1)
 * - panel:  card shrinking into a panel                     bezier(.6,0,.3,1)
 * - slide:  window slide-in with long tail                  bezier(.1,.8,.2,1)
 * - whip:   whip re-frames                                  bezier(.7,0,.3,1)
 */
export const E = {
  cam: Easing.bezier(0.6, 0.05, 0.35, 1),
  in: Easing.bezier(0.25, 1, 0.5, 1),
  arrive: Easing.bezier(0.16, 1, 0.3, 1),
  settle: Easing.bezier(0.16, 1, 0.3, 1),
  smooth: Easing.bezier(0.22, 1, 0.36, 1),
  flow: Easing.bezier(0.84, 0, 0.16, 1),
  flowSoft: Easing.bezier(0.76, 0, 0.24, 1),
  launch: Easing.bezier(0.7, 0, 0.84, 0),
  wipe: Easing.bezier(0.37, 0, 0.63, 1),
  panel: Easing.bezier(0.6, 0, 0.3, 1),
  slide: Easing.bezier(0.1, 0.8, 0.2, 1),
  whip: Easing.bezier(0.7, 0, 0.3, 1),
  inCubic: Easing.in(Easing.cubic),
  outCubic: Easing.out(Easing.cubic),
  inOutCubic: Easing.inOut(Easing.cubic),
  inOutQuad: Easing.inOut(Easing.quad),
  expoIn: Easing.in(Easing.exp),
};

/** Spring that settles camera arrivals: ~3% overshoot, ~18 frames. */
export const SETTLE = { damping: 18, stiffness: 120, mass: 1 };

/** 0 → 1 between `at` and `at + dur` with an easing (default settle). dur <= 0 is a step. */
export const r = (f: number, at: number, dur: number, ease: (t: number) => number = E.settle) =>
  dur <= 0 ? (f >= at ? 1 : 0) : interpolate(f, [at, at + dur], [0, 1], { ...cl, easing: ease });
/** Same as r, defaulting to the softer `smooth` curve (house text and element entrances). */
export const ramp = (f: number, at: number, dur: number, ease: (t: number) => number = E.smooth) => r(f, at, dur, ease);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const sp = (f: number, at: number, config: { damping?: number; stiffness?: number; mass?: number }) => spring({ frame: f - at, fps: 30, config });

/** Linear colour mix between two #RRGGBB colours (t clamped). */
export const mix = (a: string, b: string, t: number) => {
  const q = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [q(a), q(b)];
  const k = Math.max(0, Math.min(1, t));
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(",")})`;
};

/** Characters typed so far at a constant rate. Read-along text: 30 to 40 cps max in a VO film. */
export const typedCount = (f: number, at: number, len: number, cps = 30) => Math.max(0, Math.min(len, Math.floor(((f - at) * cps) / 30)));

/** Damped-sine bounce (amplitude .5, frequency 2, decay 4). t = frames since landing. Small UI pops only. */
export const bounce = (t: number, amp = 0.5, freq = 2, decay = 4) => (t <= 0 ? 0 : (amp * Math.sin((t / 30) * freq * Math.PI * 2)) / Math.exp((t / 30) * decay));

export type Rect = { x: number; y: number; w: number; h: number };
