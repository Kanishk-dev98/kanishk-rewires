import { Audio } from "@remotion/media";
import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { LOGO_H, LOGO_W, LogoMarkPaths, MARK_W, WORDMARK_D } from "./logoPaths";

/* ---------- Abstraxn brand tokens (abstraxn.com/brand-kit) ---------- */
export const C = {
  brand: "#72E3AD",
  brandDeep: "#3ECF8E",
  brandText: "#0A6B47",
  ink: "#171717",
  muted: "#6B6B6B",
  surface: "#FFFFFF",
  dark: "#0A0A0A",
  border: "#E7E7E5",
  borderDark: "#3A3A3A",
  wash: "#F2FBF7",
  washDark: "#0F1C17",
  deny: "#E2887C",
  denyDeep: "#A33F31",
  review: "#E8B65A",
};

export const { fontFamily: SANS } = loadFigtree("normal", {
  weights: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});
export const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

/* ---------- Types ---------- */
export type Word = { w: string; s: number; e: number };
export type Line = { text: string; start: number; dur: number; src: string; words: Word[] };
export type Chapter = {
  id: string;
  name: string;
  index: number;
  start: number;
  dur: number;
  illustrative: boolean;
  lines: Line[];
};
export type SceneProps = { ch: Chapter; credit?: string };

/* ---------- Timing helpers ---------- */
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 eased progress starting at `at` over `len` frames. */
export const p = (frame: number, at: number, len = 12) =>
  interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: ease });

/** 1→0 eased progress (fade out) starting at `at`. */
export const out = (frame: number, at: number, len = 14) =>
  interpolate(frame, [at, at + len], [1, 0], { ...clamp, easing: easeInOut });

/** Frame (chapter-local) where line i starts, or a fraction into it. */
export const L = (ch: Chapter, i: number, frac = 0) => ch.lines[i].start + Math.round(ch.lines[i].dur * frac);

/** Frame where a spoken word (first match, case-insensitive prefix) begins in line i. */
export const W = (ch: Chapter, i: number, word: string, nth = 0) => {
  const line = ch.lines[i];
  const hits = line.words.filter((w) => w.w.toLowerCase().replace(/[^a-z0-9$.%]/g, "").startsWith(word.toLowerCase()));
  const hit = hits[Math.min(nth, hits.length - 1)];
  return line.start + (hit ? hit.s : 0);
};

/* ---------- Scene frame ---------- */
export const Scene: React.FC<{
  ch: Chapter;
  bg: string;
  children: React.ReactNode;
  light?: boolean;
  push?: number;
  hits?: number[];
  shake?: number;
}> = ({ ch, bg, children, light, push = 0.06, hits = [], shake = 16 }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(p(frame, 0, 6), out(frame, ch.dur - 6, 6));
  return (
    <AbsoluteFill style={{ background: bg, opacity, fontFamily: SANS, color: light ? C.ink : "white", overflow: "hidden" }}>
      <Camera dur={ch.dur} push={push} hits={hits} amount={shake}>
        {children}
      </Camera>
      {ch.index > 1 ? <ChapterTag ch={ch} light={light} /> : null}
      {ch.illustrative ? <Illustrative light={light} /> : null}
      {ch.lines.map((l) => (
        <Audio key={l.src} from={l.start} src={staticFile(l.src)} />
      ))}
    </AbsoluteFill>
  );
};

const ChapterTag: React.FC<{ ch: Chapter; light?: boolean }> = ({ ch, light }) => {
  const frame = useCurrentFrame();
  const o = Math.min(p(frame, 10, 20), out(frame, ch.dur - 30, 20));
  return (
    <div
      style={{
        position: "absolute",
        top: 72,
        left: 120,
        display: "flex",
        gap: 18,
        alignItems: "center",
        fontFamily: MONO,
        fontSize: 20,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: light ? C.muted : "#8A8A8A",
        opacity: o,
      }}
    >
      <span style={{ color: light ? C.brandText : C.brand }}>{String(ch.index - 1).padStart(2, "0")}</span>
      <span style={{ width: 40, height: 1, background: light ? C.border : C.borderDark }} />
      <span>{ch.name}</span>
    </div>
  );
};

const Illustrative: React.FC<{ light?: boolean }> = ({ light }) => (
  <div
    style={{
      position: "absolute",
      top: 64,
      right: 120,
      fontFamily: MONO,
      fontSize: 18,
      letterSpacing: 2,
      textTransform: "uppercase",
      padding: "8px 16px",
      borderRadius: 999,
      border: `1px solid ${light ? C.border : C.borderDark}`,
      color: light ? C.muted : "#8A8A8A",
    }}
  >
    Illustrative example
  </div>
);

/* ---------- Typography ---------- */

/** Words fade + rise + unblur exactly when spoken. */
export const Kinetic: React.FC<{
  line: Line;
  size?: number;
  weight?: number;
  color?: string;
  accent?: string[];
  accentColor?: string;
  align?: "left" | "center";
  maxWidth?: number;
  hideAt?: number;
  style?: React.CSSProperties;
}> = ({ line, size = 72, weight = 500, color = "white", accent = [], accentColor = C.brand, align = "center", maxWidth = 1400, hideAt, style }) => {
  const frame = useCurrentFrame();
  const words = line.text.split(" ");
  const fade = hideAt !== undefined ? out(frame, hideAt, 14) : 1;
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.12,
        letterSpacing: -size * 0.02,
        textAlign: align,
        maxWidth,
        color,
        opacity: fade,
        textWrap: "balance",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const timing = line.words[Math.min(i, line.words.length - 1)];
        const at = line.start + (timing ? timing.s : 0) - 3;
        const t = p(frame, at, 14);
        const isAccent = accent.some((a) => w.toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(a));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: size * 0.26,
              opacity: t,
              translate: `0px ${(1 - t) * size * 0.25}px`,
              filter: `blur(${(1 - t) * 8}px)`,
              color: isAccent ? accentColor : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Visible while narration of line i plays (with fade in/out). */
export const lineOpacity = (frame: number, ch: Chapter, i: number, holdUntil?: number) => {
  const start = ch.lines[i].start - 6;
  const end = holdUntil ?? (ch.lines[i + 1] ? ch.lines[i + 1].start - 4 : ch.dur - 20);
  return Math.min(p(frame, start, 8), out(frame, end - 8, 8));
};

/* ---------- Logo (official paths, animated in parts) ---------- */
export const Logo: React.FC<{
  width: number;
  dark?: boolean;
  markIn?: number;
  wordIn?: number;
  style?: React.CSSProperties;
}> = ({ width, dark, markIn = 1, wordIn = 1, style }) => {
  const h = (width / LOGO_W) * LOGO_H;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} style={{ overflow: "visible", ...style }}>
      <defs>
        <clipPath id="abxWordClip">
          <rect x={MARK_W} y={-20} width={(LOGO_W - MARK_W) * wordIn + 1} height={LOGO_H + 40} />
        </clipPath>
      </defs>
      <g
        style={{
          opacity: markIn,
          transformOrigin: `${MARK_W / 2}px ${LOGO_H / 2}px`,
          transformBox: "view-box",
          scale: String(0.82 + 0.18 * markIn),
        }}
      >
        <LogoMarkPaths />
      </g>
      <g clipPath="url(#abxWordClip)" style={{ opacity: Math.min(1, wordIn * 3) }}>
        <path d={WORDMARK_D} fill={dark ? "white" : "black"} />
      </g>
    </svg>
  );
};

/* ---------- Ambient ---------- */

/** Soft green radial glow that breathes. */
export const Glow: React.FC<{ x?: string; y?: string; size?: number; opacity?: number; color?: string }> = ({
  x = "50%",
  y = "50%",
  size = 900,
  opacity = 0.35,
  color = C.brandDeep,
}) => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame / 50) * 0.05;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        opacity,
        scale: String(breathe),
        filter: "blur(40px)",
      }}
    />
  );
};

/** Fine dot grid, the "infrastructure" texture. */
export const DotGrid: React.FC<{ light?: boolean; opacity?: number }> = ({ light, opacity = 1 }) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(${light ? "#00000014" : "#ffffff12"} 1.2px, transparent 1.2px)`,
      backgroundSize: "36px 36px",
      opacity,
      maskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)",
    }}
  />
);

/** Green light trails drawing across the frame. */
export const Trails: React.FC<{ count: number; start: number; seed?: string; converge?: number }> = ({
  count,
  start,
  seed = "t",
  converge = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`tg${seed}`} x1="0" x2="1">
          <stop offset="0" stopColor={C.brand} stopOpacity="0" />
          <stop offset="0.7" stopColor={C.brand} stopOpacity="0.9" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <filter id={`tf${seed}`}>
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {new Array(count).fill(0).map((_, i) => {
        const delay = start + i * 9 + random(`${seed}d${i}`) * 12;
        const prog = interpolate(frame - delay, [0, 70], [0, 1], { ...clamp, easing: ease });
        if (prog <= 0) return null;
        const y0 = 120 + random(`${seed}y${i}`) * 840;
        const y1 = 120 + random(`${seed}z${i}`) * 840;
        const cy = (y0 + y1) / 2 + (random(`${seed}c${i}`) - 0.5) * 500;
        // converge pulls endpoints to the centre
        const ex = interpolate(converge, [0, 1], [2000, 960]);
        const ey = interpolate(converge, [0, 1], [y1, 540]);
        const d = `M -80 ${y0} Q 960 ${cy} ${ex} ${ey}`;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={`url(#tg${seed})`}
            strokeWidth={1.5 + random(`${seed}w${i}`) * 2}
            pathLength={1}
            strokeDasharray="0.35 1"
            strokeDashoffset={interpolate(prog, [0, 1], [0.35, -1])}
            filter={`url(#tf${seed})`}
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
};

/* ---------- UI primitives ---------- */
export const Chip: React.FC<{
  children: React.ReactNode;
  tone?: "brand" | "deny" | "review" | "neutral";
  light?: boolean;
  style?: React.CSSProperties;
}> = ({ children, tone = "neutral", light, style }) => {
  const map = {
    brand: { fg: light ? C.brandText : C.brand, bg: light ? C.wash : "#0F1C17", bd: light ? "#BDEBD5" : "#1F4A37" },
    deny: { fg: light ? C.denyDeep : C.deny, bg: light ? "#FDEEEC" : "#2A1512", bd: light ? "#F3C9C2" : "#5A2A24" },
    review: { fg: light ? "#8A5A00" : C.review, bg: light ? "#FFF6E3" : "#2A2110", bd: light ? "#F1D9A3" : "#5A4520" },
    neutral: { fg: light ? C.ink : "#DADADA", bg: light ? "#F5F5F4" : "#161616", bd: light ? C.border : C.borderDark },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 999,
        fontFamily: MONO,
        fontSize: 20,
        whiteSpace: "nowrap",
        color: map.fg,
        background: map.bg,
        border: `1px solid ${map.bd}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.3 }) => (
  <Audio from={Math.max(0, Math.round(at))} src={staticFile(`sfx/${name}.wav`)} volume={volume} />
);


/* ================= Cinematic FX ================= */

/** Slow push-in plus decaying shake after each hit frame. */
export const Camera: React.FC<{ dur: number; push: number; hits: number[]; amount: number; children: React.ReactNode }> = ({
  dur,
  push,
  hits,
  amount,
  children,
}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, dur], [1, 1 + push], clamp);
  let dx = 0;
  let dy = 0;
  let kick = 0;
  for (const h of hits) {
    if (frame >= h && frame < h + 30) {
      const d = Math.exp(-(frame - h) / 5);
      dx += (random(`cx${h}-${frame}`) - 0.5) * 2 * amount * d;
      dy += (random(`cy${h}-${frame}`) - 0.5) * 2 * amount * d;
      kick = Math.max(kick, d * 0.03);
    }
  }
  return <AbsoluteFill style={{ scale: String(zoom + kick), translate: `${dx}px ${dy}px` }}>{children}</AbsoluteFill>;
};

/** Moving brand-green aurora: layered radial blobs drifting slowly. */
export const Aurora: React.FC<{ light?: boolean; intensity?: number }> = ({ light, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const blobs = [
    { c: light ? "#BDF5DA" : C.brandDeep, x: 25, y: 30, s: 1100, sp: 90 },
    { c: light ? "#D9FBEA" : "#249361", x: 75, y: 70, s: 1300, sp: 120 },
    { c: light ? "#E9FDF3" : "#68F4B5", x: 60, y: 20, s: 800, sp: 70 },
    { c: light ? "#C8F7E0" : C.brandText, x: 15, y: 85, s: 1000, sp: 110 },
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {blobs.map((b, i) => {
        const x = b.x + Math.sin(frame / b.sp + i) * 8;
        const y = b.y + Math.cos(frame / (b.sp * 1.3) + i * 2) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: b.s,
              height: b.s,
              marginLeft: -b.s / 2,
              marginTop: -b.s / 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.c} 0%, transparent 62%)`,
              opacity: (light ? 0.9 : i === 2 ? 0.22 : 0.32) * intensity,
              filter: "blur(30px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Full-frame flash that decays. */
export const Flash: React.FC<{ at: number; len?: number; color?: string; peak?: number }> = ({ at, len = 10, color = "white", peak = 0.85 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ background: color, opacity: interpolate(frame, [at - 1, at, at + len], [0, peak, 0], clamp), pointerEvents: "none" }}
    />
  );
};

/** Expanding rings from a point. */
export const Shockwave: React.FC<{ at: number; x?: number; y?: number; color?: string; rings?: number; size?: number }> = ({
  at,
  x = 960,
  y = 540,
  color = C.brand,
  rings = 3,
  size = 1800,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(rings).fill(0).map((_, i) => {
        const t = interpolate(frame - at - i * 5, [0, 36], [0, 1], { ...clamp, easing: ease });
        if (t <= 0 || t >= 1) return null;
        const d = 80 + t * size;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - d / 2,
              top: y - d / 2,
              width: d,
              height: d,
              borderRadius: "50%",
              border: `${8 * (1 - t) + 1}px solid ${color}`,
              opacity: 1 - t,
              boxShadow: `0 0 ${30 * (1 - t)}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Burst of green sparks from a point. */
export const Sparks: React.FC<{ at: number; x?: number; y?: number; count?: number; spread?: number }> = ({
  at,
  x = 960,
  y = 540,
  count = 60,
  spread = 1,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 70) return null;
  const palette = [C.brand, "#68F4B5", C.brandDeep, "#FFFFFF", "#B8F5D8"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const a = random(`sa${at}${i}`) * Math.PI * 2;
        const v = (10 + random(`sv${at}${i}`) * 26) * spread;
        const d = v * t * Math.exp(-t / 22);
        const size = 3 + random(`sz${at}${i}`) * 7;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d,
              top: y + Math.sin(a) * d + t * t * 0.03,
              width: size,
              height: size,
              borderRadius: "50%",
              background: palette[i % palette.length],
              boxShadow: `0 0 ${size * 2}px ${C.brand}`,
              opacity: interpolate(t, [40, 70], [1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Ambient drifting particles. */
export const Dust: React.FC<{ count?: number; color?: string; seed?: string; speed?: number }> = ({
  count = 50,
  color = C.brand,
  seed = "d",
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * 1920;
        const y0 = random(`${seed}y${i}`) * 1080;
        const v = (0.3 + random(`${seed}v${i}`)) * speed;
        const y = (((y0 - frame * v * 1.5) % 1080) + 1080) % 1080;
        const size = 2 + random(`${seed}s${i}`) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + Math.sin((frame + i * 30) / 50) * 20,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: 0.25 + 0.5 * Math.abs(Math.sin((frame + i * 17) / 30)),
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Big word that slams in with overshoot, blur and glow. */
export const Slam: React.FC<{
  text: React.ReactNode;
  at: number;
  size: number;
  color?: string;
  gradient?: string;
  weight?: number;
  glow?: string;
  style?: React.CSSProperties;
}> = ({ text, at, size, color = "white", gradient, weight = 800, glow, style }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const s = interpolate(t, [0, 7, 12], [2.1, 0.95, 1], { ...clamp, easing: ease });
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1,
        letterSpacing: -size * 0.035,
        color: gradient ? "transparent" : color,
        background: gradient,
        WebkitBackgroundClip: gradient ? "text" : undefined,
        backgroundClip: gradient ? "text" : undefined,
        scale: String(t < 0 ? 0 : s),
        opacity: interpolate(t, [0, 3], [0, 1], clamp),
        filter: `blur(${interpolate(t, [0, 6], [14, 0], clamp)}px)${glow ? ` drop-shadow(0 0 40px ${glow})` : ""}`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

export const GREEN_GRADIENT = `linear-gradient(120deg, #B8F5D8 0%, ${C.brand} 35%, ${C.brandDeep} 70%, #249361 100%)`;
export const DEEP_GRADIENT = `linear-gradient(120deg, ${C.brandDeep} 0%, #249361 50%, ${C.brandText} 100%)`;

/** "In plain words" explainer label for non-experts. */
export const Plain: React.FC<{ children: React.ReactNode; at: number; light?: boolean; style?: React.CSSProperties }> = ({
  children,
  at,
  light,
  style,
}) => {
  const frame = useCurrentFrame();
  const o = p(frame, at, 12);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 22px",
        borderRadius: 14,
        background: light ? "#F2FBF7" : "rgba(114,227,173,0.08)",
        border: `1px solid ${light ? "#BDEBD5" : "rgba(114,227,173,0.3)"}`,
        opacity: o,
        translate: `0px ${(1 - o) * 14}px`,
        ...style,
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: light ? C.brandText : C.brand }}>IN PLAIN WORDS</span>
      <span style={{ fontSize: 26, fontWeight: 500, color: light ? C.ink : "white" }}>{children}</span>
    </div>
  );
};

/** Green light-sweep transition overlay (placed across a chapter cut). */
export const Sweep: React.FC = () => {
  const frame = useCurrentFrame();
  const bands = [
    { c: "#249361", w: 520, d: 0 },
    { c: C.brandDeep, w: 360, d: 2 },
    { c: C.brand, w: 220, d: 4 },
    { c: "#E9FDF3", w: 90, d: 6 },
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {bands.map((b, i) => {
        const x = interpolate(frame - b.d, [0, 16], [-900, 2600], { ...clamp, easing: easeInOut });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -400,
              left: x,
              width: b.w,
              height: 1900,
              rotate: "18deg",
              background: b.c,
              opacity: 0.92,
              boxShadow: `0 0 80px ${b.c}`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: "white", opacity: interpolate(frame, [7, 9, 14], [0, 0.35, 0], clamp) }} />
    </AbsoluteFill>
  );
};
