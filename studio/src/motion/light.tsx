/**
 * House kit: calm light-theme components (hairlines, one accent, blur-to-sharp entrances, one canvas + one camera).
 * Every component takes absolute local frames (`at`) so scenes can be laid out from a timeline.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FIG, MONO } from "../fonts";
import { T } from "../theme";
import { cl, E, mix, ramp } from "./core";

/** Light-theme palette derived from the theme tokens. `red` is only for rejected or breaking items. */
export const L = {
  bg: "#FAFAFA",
  ink: "#111111",
  grey: "#8A8A8A",
  soft: "#BDBDBD",
  hair: T.hair,
  accent: T.accentDeep,
  accentSoft: T.accentSoft,
  red: "#E5484D",
};

/** Fast start, long soft landing (out-quint): the default for text and element entrances. */
export const smooth = E.smooth;

/** Blur to sharp with a small rise (their default text and element entrance). Optional blur-out exit. */
export const BlurIn: React.FC<{ at: number; dur?: number; rise?: number; blur?: number; out?: number; outDur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 16, rise = 18, blur = 14, out, outDur = 12, children, style }) => {
  const f = useCurrentFrame();
  const i = ramp(f, at, dur);
  const o = out === undefined ? 0 : ramp(f, out, outDur);
  return (
    <div style={{ opacity: i * (1 - o), filter: `blur(${(1 - i) * blur + o * blur}px)`, translate: `0px ${(1 - i) * rise - o * rise * 0.5}px`, ...style }}>
      {children}
    </div>
  );
};

/** Headline built word by word; each word arrives light grey and darkens to ink. */
export const WordBuild: React.FC<{ text: string; at: number; every?: number; size?: number; weight?: number; color?: string; align?: "center" | "left"; lineHeight?: number; maxWidth?: number }> = ({ text, at, every = 5, size = 96, weight = 800, color = L.ink, align = "center", lineHeight = 1.08, maxWidth = 1500 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ fontFamily: FIG, fontWeight: weight, fontSize: size, letterSpacing: -size * 0.035, lineHeight, textAlign: align, maxWidth, color }}>
      {text.split(" ").map((w, k) => {
        const s = at + k * every;
        const a = ramp(f, s, 8);
        const dark = ramp(f, s + 4, 14);
        return (
          <span key={k} style={{ display: "inline-block", marginRight: size * 0.24, opacity: a, filter: `blur(${(1 - a) * 6}px)`, color: dark < 1 ? mix(L.soft, color, dark) : color }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** A line that later shrinks, greys and moves up to become the context header for the next line. */
export const HeaderShift: React.FC<{ at: number; shiftAt: number; children: React.ReactNode; to?: { y: number; scale: number }; dur?: number }> = ({ at, shiftAt, children, to = { y: -150, scale: 0.5 }, dur = 18 }) => {
  const f = useCurrentFrame();
  const s = ramp(f, shiftAt, dur);
  return (
    <div style={{ opacity: ramp(f, at, 10), translate: `0px ${s * to.y}px`, scale: String(1 - s * (1 - to.scale)), filter: `grayscale(1) opacity(${1 - s * 0.55})` }}>
      {children}
    </div>
  );
};

/** Accent marker block behind a word: grows left to right like a text selection. */
export const Mark: React.FC<{ at: number; children: React.ReactNode; color?: string; dur?: number }> = ({ at, children, color = L.accentSoft, dur = 10 }) => {
  const f = useCurrentFrame();
  const w = ramp(f, at, dur);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ position: "absolute", left: "-0.06em", right: "-0.06em", top: "0.08em", bottom: "0.02em", background: color, transformOrigin: "left", scale: `${w} 1`, borderRadius: 3 }} />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

/** Slot-machine roll for lists: each item rolls up out of the line with vertical motion blur. */
export const SlotRoll: React.FC<{ items: string[]; at: number[]; size?: number; weight?: number; color?: string; dur?: number }> = ({ items, at, size = 96, weight = 800, color = L.ink, dur = 12 }) => {
  const f = useCurrentFrame();
  const lh = size * 1.15;
  let pos = 0;
  let moving = 0;
  at.forEach((t, k) => {
    const p = ramp(f, t, dur);
    pos += k === 0 ? 0 : p;
    if (p > 0 && p < 1) moving = Math.sin(p * Math.PI);
  });
  return (
    <div style={{ height: lh, overflow: "hidden", fontFamily: FIG, fontWeight: weight, fontSize: size, letterSpacing: -size * 0.035, color, lineHeight: `${lh}px` }}>
      <div style={{ translate: `0px ${-pos * lh}px`, filter: `blur(${moving * 5}px)` }}>
        {items.map((s, k) => (
          <div key={k} style={{ whiteSpace: "nowrap", textAlign: "center" }}>{s}</div>
        ))}
      </div>
    </div>
  );
};

/** Typed text with a blinking caret. */
export const Typed: React.FC<{ text: string; at: number; cps?: number; size?: number; weight?: number; color?: string; caretUntil?: number }> = ({ text, at, cps = 18, size = 40, weight = 500, color = L.ink, caretUntil }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor(((f - at) / 30) * cps)));
  const caret = (caretUntil === undefined || f < caretUntil) && f >= at - 10 && Math.floor(f / 15) % 2 === 0;
  return (
    <span style={{ fontFamily: FIG, fontWeight: weight, fontSize: size, color, letterSpacing: -size * 0.02 }}>
      {text.slice(0, n)}
      <span style={{ display: "inline-block", width: Math.max(2, size * 0.05), height: size * 1.05, marginLeft: 3, verticalAlign: "-0.15em", background: caret ? color : "transparent" }} />
    </span>
  );
};

/** Small uppercase mono label (system words: STATUS, INTEGRATIONS 34). */
export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 18, color = L.ink, style }) => (
  <span style={{ fontFamily: MONO, fontSize: size, letterSpacing: size * 0.12, textTransform: "uppercase", color, ...style }}>{children}</span>
);

/** Outlined pill with a mono label; optional status tag (PENDING, REJECTED). */
export const Pill: React.FC<{ label: string; x: number; y: number; at: number; tag?: string; tagColor?: string; size?: number }> = ({ label, x, y, at, tag, tagColor = L.grey, size = 16 }) => {
  const f = useCurrentFrame();
  const a = ramp(f, at, 12);
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", display: "flex", gap: 8, alignItems: "center", opacity: a, scale: String(0.9 + a * 0.1) }}>
      <div style={{ border: `1.5px solid ${L.ink}66`, borderRadius: 999, padding: `${size * 0.35}px ${size * 0.8}px`, background: "#FFFFFFCC" }}>
        <Mono size={size}>{label}</Mono>
      </div>
      {tag ? (
        <div style={{ border: `1px solid ${L.hair}`, borderRadius: 999, padding: `2px ${size * 0.6}px` }}>
          <Mono size={size * 0.7} color={tagColor}>• {tag}</Mono>
        </div>
      ) : null}
    </div>
  );
};

/** Hairline path that draws itself (trim path). `d` in canvas coordinates. */
export const Draw: React.FC<{ d: string; at: number; dur?: number; color?: string; width?: number; dash?: string; opacity?: number }> = ({ d, at, dur = 24, color = L.ink, width = 1.5, dash, opacity = 0.45 }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, dur);
  if (dash) {
    // dashed lines reveal with a clip instead of dashoffset (dashoffset is taken by the dash pattern)
    return (
      <g style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} opacity={opacity} />
      </g>
    );
  }
  return <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={opacity * (p > 0 ? 1 : 0)} strokeLinecap="round" />;
};

/** Icon tile: rounded square with an inner glyph. */
export const Tile: React.FC<{ x: number; y: number; at: number; size?: number; children?: React.ReactNode; label?: string }> = ({ x, y, at, size = 56, children, label }) => {
  const f = useCurrentFrame();
  const a = ramp(f, at, 12);
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: a }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.26, border: `2px solid ${L.ink}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", scale: String(0.85 + a * 0.15) }}>{children}</div>
      {label ? <Mono size={16}>{label}</Mono> : null}
    </div>
  );
};

/** Counter that ticks up between keys: [[frame, value], ...]. */
export const Counter: React.FC<{ keys: [number, number][]; pad?: number; suffixAbove?: number; suffix?: string }> = ({ keys, pad = 2, suffixAbove, suffix = "+" }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, keys.map((k) => k[0]), keys.map((k) => k[1]), cl));
  if (suffixAbove !== undefined && v > suffixAbove) return <>{suffixAbove}{suffix}</>;
  return <>{String(v).padStart(pad, "0")}</>;
};

/**
 * One big canvas, one camera. Keys are camera targets in canvas coordinates; the frame shows that point at
 * screen centre at the given zoom. Moves ease with `smooth`. This is the continuous-take grammar.
 */
export const Camera: React.FC<{ keys: { at: number; x: number; y: number; zoom: number }[]; dur?: number; width: number; height: number; children: React.ReactNode }> = ({ keys, dur = 36, width, height, children }) => {
  const f = useCurrentFrame();
  let cam = keys[0];
  for (let k = 1; k < keys.length; k++) {
    const p = ramp(f, keys[k].at, dur);
    cam = { at: 0, x: cam.x + (keys[k].x - cam.x) * p, y: cam.y + (keys[k].y - cam.y) * p, zoom: cam.zoom + (keys[k].zoom - cam.zoom) * p };
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width, height, transformOrigin: "0 0", transform: `translate(${960 - cam.x * cam.zoom}px, ${540 - cam.y * cam.zoom}px) scale(${cam.zoom})` }}>{children}</div>
    </AbsoluteFill>
  );
};

/** Soft accent corner gradients that bloom in when the brand arrives ("the world calms down"). */
export const CornerBloom: React.FC<{ at: number; dur?: number }> = ({ at, dur = 30 }) => {
  const f = useCurrentFrame();
  const a = ramp(f, at, dur);
  return (
    <AbsoluteFill style={{ opacity: a, background: `radial-gradient(60% 70% at 0% 0%, ${L.accent}22, transparent 60%), radial-gradient(60% 70% at 100% 100%, ${L.accent}26, transparent 60%)` }} />
  );
};

/**
 * Word morph as a punchline: `head` + `drop` + `tail` becomes `head` + `insert` + `tail`. The `drop` letters grey
 * (12 f), the word breathes apart, each dropped letter collapses its own width (12 f, no guessed metrics), the
 * accent `insert` opens and drops in (14 f), the word closes up. Example: head "every", drop "thing", insert
 * "one" turns "everything" into "everyone". Timings in local frames from `at`. Use once, as the name reveal.
 */
export const LetterMorph: React.FC<{ at: number; head: string; drop: string; insert: string; tail?: string; size?: number; weight?: number }> = ({ at, head, drop, insert, tail = "", size = 200, weight = 800 }) => {
  const f = useCurrentFrame() - at;
  const grey = ramp(f, 0, 12);
  const gone = ramp(f, 16, 12);
  const x = ramp(f, 22, 14);
  const part = Math.sin(Math.min(1, Math.max(0, (f - 12) / 26)) * Math.PI); // the word breathes apart, then closes
  const clip = (w: number, maxEm: number): React.CSSProperties => ({ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", maxWidth: `${w * maxEm}em` });
  return (
    <div style={{ display: "flex", alignItems: "flex-end", whiteSpace: "nowrap", fontFamily: FIG, fontWeight: weight, fontSize: size, letterSpacing: -size * 0.03, color: L.ink, lineHeight: 1.1 }}>
      <span style={{ marginRight: `${part * 0.12}em` }}>{head}</span>
      {drop.split("").map((ch, k) => (
        <span key={k} style={{ ...clip(1 - gone, 0.8), color: mix(L.ink, L.soft, grey), opacity: 1 - gone, filter: `blur(${gone * 6}px)` }}>{ch}</span>
      ))}
      <span style={{ ...clip(x, 0.8 * Math.max(1, insert.length)), color: L.accent, opacity: x, translate: `0px ${(1 - x) * -0.4}em` }}>{insert}</span>
      {tail ? <span style={{ marginLeft: `${part * 0.12}em` }}>{tail}</span> : null}
    </div>
  );
};

/**
 * Isometric slab (calm 3D): a flat box seen from above at 55°/-45°, with optional top content.
 * `dark` = the top (product) slab; light = the layer underneath, with an accent edge.
 */
export const IsoSlab: React.FC<{ x: number; y: number; w?: number; h?: number; depth?: number; dark?: boolean; at: number; lift?: number; children?: React.ReactNode }> = ({ x, y, w = 420, h = 280, depth = 26, dark, at, lift = 0, children }) => {
  const f = useCurrentFrame();
  const a = ramp(f, at, 20);
  const top = dark ? "#151515" : "#FFFFFF";
  const side = dark ? "#000" : "#EDEDED";
  return (
    <div style={{ position: "absolute", left: x, top: y - lift * a, opacity: a, translate: `0px ${(1 - a) * 40}px`, perspective: 4000 }}>
      <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d", transform: "rotateX(55deg) rotateZ(-45deg)" }}>
        <div style={{ position: "absolute", inset: 0, background: top, border: dark ? "none" : `1.5px solid ${L.ink}55`, transform: `translateZ(${depth}px)`, overflow: "hidden" }}>{children}</div>
        <div style={{ position: "absolute", left: 0, top: h, width: w, height: depth, background: side, borderTop: dark ? "none" : `2px solid ${L.accent}`, transformOrigin: "top", transform: `rotateX(-90deg) translateZ(${-depth}px)` }} />
        <div style={{ position: "absolute", left: w, top: 0, width: depth, height: h, background: dark ? "#0a0a0a" : "#E2E2E2", transformOrigin: "left", transform: `rotateY(90deg) translateZ(${-depth}px)` }} />
      </div>
    </div>
  );
};
