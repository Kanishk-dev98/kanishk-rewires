/**
 * Finishing helpers: grain / dither, directional motion blur, depth of field, the keyed tilted-plane camera and the
 * shape grid. These are what separate a "premium" frame from a flat one:
 * - Grain on every gradient (2 to 3% on light, 5 to 6% on dark) breaks 8-bit banding (no visible step > 8 px).
 * - Motion blur on anything moving faster than ~20 px/frame (180° shutter), or keep the move <= 45 px/frame.
 * - DOF: blur grows with distance from the focal row; the thing the VO talks about is never blurred.
 */
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ACCENT_SHAPE } from "../theme";
import { cl, E, r } from "./core";

/** Stable, CSS-safe unique id for SVG defs (React's useId has characters url(#…) does not accept). */
export const useUid = (prefix: string) => prefix + React.useId().replace(/[^a-zA-Z0-9]/g, "");

/* ---------- Depth of field ---------- */

/** Blur (px) for an element at screen y, given the focal row: 0 inside `band`, ramps to `max` (≈ 4 to 8 px). */
export const dofBlur = (y: number, focusY: number, band = 250, max = 6) => Math.min(max, Math.max(0, (Math.abs(y - focusY) - band) / 60) * max);

export const Focus: React.FC<{ blur: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ blur, children, style }) => (
  <div style={{ filter: blur > 0.05 ? `blur(${blur}px)` : undefined, ...style }}>{children}</div>
);

/* ---------- Motion blur ---------- */

/** Gaussian sigma for a 180° shutter at `v` px/frame, with a soft knee so slow moves stay crisp. */
export const blurSigma = (v: number, threshold = 20, shutter = 0.5) => {
  const a = Math.abs(v);
  const knee = threshold * 0.6;
  if (a <= knee) return 0;
  const k = Math.min(1, (a - knee) / (threshold - knee));
  return ((a * shutter) / 3) * k;
};

/** Screen velocity (px/frame) of something whose position is a pure function of frame. */
export const velocity = (pos: (f: number) => [number, number], f: number): [number, number] => {
  const a = pos(f);
  const b = pos(f - 1);
  return [a[0] - b[0], a[1] - b[1]];
};

/**
 * Directional motion blur: an anisotropic SVG gaussian whose x/y sigma follow the velocity (px/frame).
 * A no-op below ~12 px/frame. Put it OUTSIDE any preserve-3d context (a filter flattens 3D).
 */
export const MotionBlur: React.FC<{ vx: number; vy: number; threshold?: number; shutter?: number; fill?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ vx, vy, threshold = 20, shutter = 0.5, fill = true, children, style }) => {
  const id = useUid("mb");
  const sx = blurSigma(vx, threshold, shutter);
  const sy = blurSigma(vy, threshold, shutter);
  const on = sx > 0.25 || sy > 0.25;
  const base: React.CSSProperties = fill ? { position: "absolute", inset: 0 } : { position: "relative" };
  return (
    <>
      {on ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
          </filter>
        </svg>
      ) : null}
      <div style={{ ...base, filter: on ? `url(#${id})` : undefined, ...style }}>{children}</div>
    </>
  );
};

/* ---------- Grain ---------- */

/** Animated monochrome grain, re-seeded every frame. Use on every gradient and glow. */
export const Grain: React.FC<{ opacity?: number; blend?: React.CSSProperties["mixBlendMode"]; freq?: number }> = ({ opacity = 0.05, blend = "overlay", freq = 0.9 }) => {
  const f = useCurrentFrame();
  const id = useUid("grain");
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: blend, opacity }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={(f * 7) % 997} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- Keyed camera on a tilted plane ---------- */

/** Camera key: at frame `f`, move to translate (x, y) and scale `s` over `dur` (12) frames. `settle` = overshoot fraction. */
export type CamKey = { f: number; dur?: number; x: number; y: number; s: number; ease?: "cam" | "arrive"; settle?: number };

/**
 * Pure camera state at frame f: keys ease on E.cam (or E.arrive), optional overshoot settle (measured good value
 * 0.027: overshoot on the move, return over 10 f), plus a hold drift so no frame is static
 * (default: scale +1.7%/s, y −5 px/s).
 */
export const camAt = (keys: CamKey[], f: number, drift = { s: 0.017 / 30, y: -5 / 30 }) => {
  let x = keys[0].x;
  let y = keys[0].y;
  let s = keys[0].s;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const prev = keys[i - 1];
    const dur = k.dur ?? 12;
    const e = k.ease === "arrive" ? E.arrive : E.cam;
    let p = interpolate(f, [k.f, k.f + dur], [0, 1], { ...cl, easing: e });
    if (k.settle) p = p * (1 + k.settle) - k.settle * r(f, k.f + dur, 10, E.in);
    x += (k.x - prev.x) * p;
    y += (k.y - prev.y) * p;
    s *= 1 + (k.s / prev.s - 1) * p;
  }
  const t = Math.max(0, f - keys[0].f);
  return { x, y: y + drift.y * t, s: s * (1 + drift.s * t) };
};

/**
 * Keyed camera on a tilted plane (default rotateX 7°, rotateY 5.5°, perspective 2000), with velocity-scaled motion
 * blur applied automatically on fast moves. Children are laid out in screen coordinates at scale 1.
 */
export const TiltCamera: React.FC<{ keys: CamKey[]; drift?: { s: number; y: number }; rx?: number; ry?: number; rz?: number; blur?: boolean; children: React.ReactNode }> = ({ keys, drift, rx = 7, ry = 5.5, rz = 0, blur = true, children }) => {
  const f = useCurrentFrame();
  const c = camAt(keys, f, drift);
  const p = camAt(keys, f - 1, drift);
  const vx = Math.abs(c.x - p.x) + Math.abs(c.s - p.s) * 700;
  const vy = Math.abs(c.y - p.y) + Math.abs(c.s - p.s) * 450;
  const inner = (
    <AbsoluteFill style={{ perspective: 2000 }}>
      <AbsoluteFill style={{ transform: `translate(${c.x}px,${c.y}px) scale(${c.s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, transformStyle: "preserve-3d" }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
  return blur ? (
    <MotionBlur vx={vx} vy={vy}>
      {inner}
    </MotionBlur>
  ) : (
    inner
  );
};

/* ---------- Shape grid (canvas): the "system is working" field and the dark-stage texture ---------- */

export const GRID = { cols: 48, rows: 27, step: 40 };
export type GridPaint = (i: number, j: number, f: number) => { c: string; a: number; r?: number } | null;

/** Normalised accent shape (centred, unit size) for small grid glyphs. */
const GLYPH: [number, number][] = (() => {
  const xs = ACCENT_SHAPE.map((p) => p[0]);
  const ys = ACCENT_SHAPE.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const s = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  return ACCENT_SHAPE.map(([x, y]) => [(x - cx) / s, (y - cy) / s]);
})();

/**
 * A 48 x 27 field of small glyphs on a 40 px pitch, drawn on a canvas in useLayoutEffect (canvas drawing must not
 * happen in render). `glyph`: "dot" | "shape" (the theme's ACCENT_SHAPE). `paint` returns colour/alpha/size per cell
 * per frame; return null to skip. Dots above r 3 get a soft glow.
 */
export const ShapeGrid: React.FC<{ paint: GridPaint; glyph?: "dot" | "shape"; opacity?: number }> = ({ paint, glyph = "dot", opacity = 1 }) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 1920, 1080);
    for (let i = 0; i < GRID.cols; i++) {
      for (let j = 0; j < GRID.rows; j++) {
        const d = paint(i, j, f);
        if (!d || d.a <= 0.01) continue;
        const x = GRID.step / 2 + i * GRID.step;
        const y = GRID.step / 2 + j * GRID.step;
        const rad = d.r ?? 2.4;
        ctx.globalAlpha = Math.min(1, d.a);
        ctx.shadowColor = d.c;
        ctx.shadowBlur = rad > 3 ? rad * 3 : 0;
        ctx.fillStyle = d.c;
        ctx.beginPath();
        if (glyph === "dot") ctx.arc(x, y, rad, 0, Math.PI * 2);
        else GLYPH.forEach(([gx, gy], k) => (k ? ctx.lineTo(x + gx * rad * 3.1, y + gy * rad * 3.1) : ctx.moveTo(x + gx * rad * 3.1, y + gy * rad * 3.1)));
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }, [f, paint, glyph]);
  return <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }} />;
};
