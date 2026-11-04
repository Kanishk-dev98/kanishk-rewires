/**
 * Motion moves: techniques that recur across premium SaaS product films. Theme-agnostic: pass colours in.
 * All timings are local frames.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { FIG } from "../fonts";
import { SHAPE_PATH } from "../theme";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** Fast arrival, long soft settle: the easing every reference uses for entrances. */
export const settle = Easing.bezier(0.16, 1, 0.3, 1);
/** Accelerating exit, for the last frames before a cut. */
export const launch = Easing.bezier(0.7, 0, 0.84, 0);
/** The After Effects "Flow" ease, used for almost every move: slow out, fast middle, slow in. */
export const FLOW = Easing.bezier(0.84, 0, 0.16, 1);
export const FLOW_SOFT = Easing.bezier(0.76, 0, 0.24, 1);
const p = (f: number, a: number, d: number, e = settle) => interpolate(f, [a, a + d], [0, 1], { ...cl, easing: e });

/**
 * Speed-ramp shot: wrap a shot so it eases in fast-then-slow at its start and accelerates out at its end, both along
 * the same direction with directional blur. Consecutive shots read as one camera across hard cuts.
 */
export const SpeedRamp: React.FC<{ dur: number; dir?: [number, number]; dist?: number; inF?: number; outF?: number; zoom?: boolean; children: React.ReactNode }> = ({ dur, dir = [-1, 0], dist = 260, inF = 14, outF = 8, zoom, children }) => {
  const f = useCurrentFrame();
  const i = 1 - p(f, 0, inF);
  const o = p(f, dur - outF, outF, launch);
  const k = o - i; // -1 → 0 (arriving), 0 → 1 (leaving)
  const blur = Math.abs(k) * 18;
  return (
    <AbsoluteFill style={{ translate: zoom ? undefined : `${dir[0] * dist * k}px ${dir[1] * dist * k}px`, scale: zoom ? String(1 + k * (k > 0 ? 3 : 0.4)) : undefined, filter: `blur(${blur}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/** Iris transition through the brand shape (default: theme SHAPE_PATH). The shape scales from a point to cover the frame. */
export const ShapeIris: React.FC<{ at: number; dur?: number; path?: string; children: React.ReactNode; spin?: number }> = ({ at, dur = 24, path = SHAPE_PATH, children, spin = 45 }) => {
  const f = useCurrentFrame();
  const t = p(f, at, dur, Easing.bezier(0.55, 0, 0.45, 1));
  const s = interpolate(t, [0, 1], [0.001, 34]);
  if (t <= 0) return null;
  return (
    <AbsoluteFill style={{ WebkitMaskImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${path}' fill='black'/></svg>`)}")`, WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", WebkitMaskSize: `${s * 100}px ${s * 100}px`, rotate: `${(1 - t) * spin}deg` }}>
      {children}
    </AbsoluteFill>
  );
};

/** Typewriter whose newest letters glow in an accent colour and settle to ink. */
export const TailType: React.FC<{ text: string; at: number; fpc?: number; tail?: number; size?: number; weight?: number; ink: string; accent: string }> = ({ text, at, fpc = 1.7, tail = 5, size = 88, weight = 700, ink, accent }) => {
  const f = useCurrentFrame();
  const n = (f - at) / fpc;
  return (
    <div style={{ fontFamily: FIG, fontWeight: weight, fontSize: size, letterSpacing: -size * 0.03, whiteSpace: "pre" }}>
      {text.split("").map((ch, k) => {
        const age = n - k;
        if (age < 0) return <span key={k} style={{ opacity: 0 }}>{ch}</span>;
        const t = Math.min(1, age / tail);
        return <span key={k} style={{ color: t >= 1 ? ink : blend(accent, ink, t) }}>{ch}</span>;
      })}
    </div>
  );
};

/** Slam and settle: the word lands big and eases to size with no overshoot (section openers). */
export const Slam: React.FC<{ at: number; from?: number; dur?: number; children: React.ReactNode }> = ({ at, from = 2.5, dur = 8, children }) => {
  const f = useCurrentFrame();
  const t = p(f, at, dur);
  return <div style={{ scale: String(from + (1 - from) * t), opacity: Math.min(1, (f - at) / 2), filter: `blur(${(1 - t) * 10}px)` }}>{children}</div>;
};

/** Headline that slides so the newest word stays centred; words blur in on cue. */
export const FollowLine: React.FC<{ words: { t: string; at: number; color?: string }[]; size?: number; weight?: number; color: string; gap?: number }> = ({ words, size = 110, weight = 700, color, gap = 0.28 }) => {
  const f = useCurrentFrame();
  const ls = `${-size * 0.03}px`;
  const widths = words.map((w) => measureText({ text: w.t, fontFamily: FIG, fontSize: size, fontWeight: String(weight), letterSpacing: ls }).width + size * gap);
  const centres = widths.map((_, k) => widths.slice(0, k).reduce((s, v) => s + v, 0) + widths[k] / 2);
  const total = widths.reduce((s, v) => s + v, 0);
  let x = centres[0];
  words.forEach((w, k) => {
    if (k) x += (centres[k] - centres[k - 1]) * p(f, w.at, 12);
  });
  // once the line is complete, ease to the whole line centred
  const last = words[words.length - 1].at;
  x += (total / 2 - x) * p(f, last + 14, 16);
  return (
    <AbsoluteFill style={{ justifyContent: "center" }}>
      <div style={{ position: "absolute", left: 960 - x, display: "flex", fontFamily: FIG, fontWeight: weight, fontSize: size, letterSpacing: -size * 0.03, color, whiteSpace: "nowrap" }}>
        {words.map((w, k) => {
          const a = p(f, w.at, 9);
          return (
            <span key={k} style={{ width: widths[k], textAlign: "center", opacity: a, filter: `blur(${(1 - a) * 16}px)`, color: w.color ?? color }}>
              {w.t}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Letters start widely tracked and out of order, then lock in. */
export const TrackIn: React.FC<{ text: string; at: number; dur?: number; size?: number; weight?: number; color: string; spread?: number }> = ({ text, at, dur = 12, size = 120, weight = 300, color, spread = 0.5 }) => {
  const f = useCurrentFrame();
  const t = p(f, at, dur + 6);
  return (
    <div style={{ fontFamily: FIG, fontWeight: weight, fontSize: size, color, letterSpacing: `${(1 - t) * spread - 0.02}em`, whiteSpace: "pre" }}>
      {text.split("").map((ch, k) => (
        <span key={k} style={{ opacity: p(f, at + random(`ti${text}${k}`) * dur * 0.7, 6) }}>{ch}</span>
      ))}
    </div>
  );
};

/** "AI reads it": corner brackets, a scan band sweeping down, then outline boxes pop round key fields. */
export const Scan: React.FC<{ at: number; w: number; h: number; color: string; boxes?: { x: number; y: number; w: number; h: number }[]; children: React.ReactNode }> = ({ at, w, h, color, boxes = [], children }) => {
  const f = useCurrentFrame();
  const br = p(f, at, 8);
  const band = p(f, at + 6, 16, Easing.inOut(Easing.quad));
  const L = 28;
  const corner = (x: number, y: number, sx: number, sy: number) => <path d={`M${x} ${y + sy * L} L${x} ${y} L${x + sx * L} ${y}`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {children}
      <div style={{ position: "absolute", left: 0, right: 0, top: band * h - 60, height: 60, background: `linear-gradient(transparent, ${color}55)`, opacity: band > 0 && band < 1 ? 1 : 0 }} />
      {boxes.map((b, k) => {
        const a = p(f, at + 22 + k * 3, 6);
        return <div key={k} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, border: `2.5px solid ${color}`, borderRadius: 8, opacity: a, scale: String(1.15 - a * 0.15) }} />;
      })}
      <svg width={w + 40} height={h + 40} style={{ position: "absolute", left: -20, top: -20, opacity: br, scale: String(1.08 - br * 0.08) }}>
        {corner(4, 4, 1, 1)}
        {corner(w + 36, 4, -1, 1)}
        {corner(4, h + 36, 1, -1)}
        {corner(w + 36, h + 36, -1, -1)}
      </svg>
    </div>
  );
};

/** Cursor as a soft circle that shrinks as it lands, then a click: fill flash plus two ripples. */
export const ClickCursor: React.FC<{ path: [number, number, number][]; clickAt: number; color: string }> = ({ path, clickAt, color }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, path.map((q) => q[0]), path.map((q) => q[1]), { ...cl, easing: settle });
  const y = interpolate(f, path.map((q) => q[0]), path.map((q) => q[2]), { ...cl, easing: settle });
  const land = p(f, path[path.length - 1][0] - 8, 10);
  const r = 55 - land * 35 - (f >= clickAt && f < clickAt + 4 ? 6 : 0);
  return (
    <>
      {[0, 4].map((d) => {
        const t = p(f, clickAt + d, 12, Easing.out(Easing.quad));
        return t > 0 && t < 1 ? <div key={d} style={{ position: "absolute", left: x, top: y, width: 40 + t * 120, height: 40 + t * 120, translate: "-50% -50%", borderRadius: 999, border: `2px solid ${color}`, opacity: 1 - t }} /> : null;
      })}
      <div style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, translate: "-50% -50%", borderRadius: 999, background: `${color}55`, border: `2px solid ${color}`, backdropFilter: "blur(4px)" }} />
    </>
  );
};

/** Lift one element out of a UI: the target scales up and forward while everything else blurs and falls back. */
export const LiftOut: React.FC<{ at: number; dur?: number; base: React.ReactNode; item: React.ReactNode; itemBox: { x: number; y: number }; scale?: number }> = ({ at, dur = 16, base, item, itemBox, scale = 2.2 }) => {
  const f = useCurrentFrame();
  const t = p(f, at, dur);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `blur(${t * 14}px)`, scale: String(1 - t * 0.12), opacity: 1 - t * 0.55 }}>{base}</AbsoluteFill>
      <div style={{ position: "absolute", left: itemBox.x + (960 - itemBox.x) * t, top: itemBox.y + (540 - itemBox.y) * t, translate: "-50% -50%", scale: String(1 + (scale - 1) * t), boxShadow: `0 ${30 * t}px ${80 * t}px rgba(0,0,0,${0.25 * t})`, borderRadius: 14 }}>{item}</div>
    </AbsoluteFill>
  );
};

/** Floating UI window tilted in 3D with a rim light; pulls back from a close-up. */
export const TiltWindow: React.FC<{ at: number; rx?: number; ry?: number; rz?: number; from?: number; rim?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, rx = 12, ry = -14, rz = -4, from = 2.6, rim = "#ffffff", children, style }) => {
  const f = useCurrentFrame();
  const t = p(f, at, 16);
  return (
    <div style={{ perspective: 2200, ...style }}>
      <div style={{ transform: `rotateX(${rx * t}deg) rotateY(${ry * t}deg) rotateZ(${rz * t}deg) scale(${from + (1 - from) * t})`, opacity: Math.min(1, (f - at) / 3), borderRadius: 18, boxShadow: `0 40px 120px rgba(0,0,0,0.35), 0 0 0 1.5px ${rim}55, -10px -10px 40px ${rim}22`, overflow: "hidden", filter: `blur(${(1 - t) * 8}px)` }}>{children}</div>
    </div>
  );
};

/** Progress ring that completes and draws a check inside ("approved"). */
export const RingCheck: React.FC<{ at: number; size?: number; color: string; track?: string; dur?: number }> = ({ at, size = 160, color, track = "#ffffff22", dur = 26 }) => {
  const f = useCurrentFrame();
  const ring = p(f, at, dur, Easing.inOut(Easing.cubic));
  const tick = p(f, at + dur - 4, 10);
  const pop = 1 + Math.sin(Math.min(1, Math.max(0, (f - at - dur) / 10)) * Math.PI) * 0.08;
  const r = size / 2 - 8;
  return (
    <svg width={size} height={size} style={{ scale: String(pop) }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <path d={`M${size * 0.3} ${size * 0.52} L${size * 0.44} ${size * 0.65} L${size * 0.7} ${size * 0.38}`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tick} />
    </svg>
  );
};

/** Field of warning icons that flip to safe in random order, then gather into one (warnings → safe). */
export const IconFlip: React.FC<{ at: number; cols?: number; rows?: number; bad: React.ReactNode; good: React.ReactNode; gatherAt?: number; hero?: React.ReactNode }> = ({ at, cols = 12, rows = 6, bad, good, gatherAt, hero }) => {
  const f = useCurrentFrame();
  const g = gatherAt === undefined ? 0 : p(f, gatherAt, 20, Easing.inOut(Easing.cubic));
  const cells = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const flipAt = at + random(`if${k}`) * 30;
      const t = p(f, flipAt, 8);
      const x = 160 + (i * 1600) / (cols - 1);
      const y = 200 + (j * 680) / (rows - 1);
      cells.push(
        <div key={k} style={{ position: "absolute", left: x + (960 - x) * g, top: y + (540 - y) * g, translate: "-50% -50%", rotate: `y ${t * 180}deg`, opacity: 1 - g }}>
          {t < 0.5 ? bad : <div style={{ rotate: "y 180deg" }}>{good}</div>}
        </div>,
      );
    }
  return (
    <AbsoluteFill>
      {cells}
      {hero && g > 0.6 ? <div style={{ position: "absolute", left: 960, top: 540, translate: "-50% -50%", scale: String(interpolate(g, [0.6, 1], [0.3, 1])) }}>{hero}</div> : null}
    </AbsoluteFill>
  );
};

/** Three bouncing typing dots (chat bubbles, agent "thinking"). */
export const TypingDots: React.FC<{ color: string; size?: number }> = ({ color, size = 12 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: size * 0.7 }}>
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ width: size, height: size, borderRadius: 99, background: color, translate: `0px ${-Math.max(0, Math.sin((f - k * 4) / 4)) * size * 0.8}px`, opacity: 0.5 + 0.5 * Math.max(0, Math.sin((f - k * 4) / 4)) }} />
      ))}
    </div>
  );
};

/** Count-up with vertical motion blur while the digits move fast. */
export const BlurCount: React.FC<{ from: number; to: number; at: number; dur?: number; format?: (n: number) => string; style?: React.CSSProperties }> = ({ from, to, at, dur = 40, format = (n) => Math.round(n).toLocaleString("en-US"), style }) => {
  const f = useCurrentFrame();
  const t = p(f, at, dur, Easing.out(Easing.cubic));
  const speed = 1 - t;
  return <span style={{ display: "inline-block", fontVariantNumeric: "tabular-nums", filter: `blur(${speed * speed * 4}px)`, ...style }}>{format(from + (to - from) * t)}</span>;
};

/** Icons orbiting a centre on a tilted ellipse, with depth: back items smaller and blurred (integrations). */
export const Orbit: React.FC<{ items: React.ReactNode[]; rx?: number; ry?: number; speed?: number; at?: number; cx?: number; cy?: number }> = ({ items, rx = 560, ry = 180, speed = 0.006, at = 0, cx = 960, cy = 540 }) => {
  const f = useCurrentFrame();
  const a0 = p(f, at, 20);
  return (
    <AbsoluteFill>
      {items.map((it, k) => {
        const ang = (k / items.length) * Math.PI * 2 + f * speed;
        const z = Math.sin(ang); // -1 back … 1 front
        const s = 0.7 + 0.3 * (z + 1) / 2;
        return (
          <div key={k} style={{ position: "absolute", left: cx + Math.cos(ang) * rx * a0, top: cy + z * ry * a0, translate: "-50% -50%", scale: String(s), filter: `blur(${(1 - (z + 1) / 2) * 3}px)`, zIndex: Math.round(z * 100), opacity: a0 }}>
            {it}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

function blend(a: string, b: string, t: number) {
  const q = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [q(a), q(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
}

/** Each element keeps its own slow float so a held frame never looks frozen (own float per element). */
export const Float: React.FC<{ seed: string; amp?: number; period?: number; children: React.ReactNode }> = ({ seed, amp = 6, period = 110, children }) => {
  const f = useCurrentFrame();
  const ph = random(seed) * Math.PI * 2;
  return <div style={{ translate: `${Math.sin(f / period * Math.PI * 2 + ph) * amp * 0.6}px ${Math.cos(f / (period * 1.3) * Math.PI * 2 + ph) * amp}px` }}>{children}</div>;
};
