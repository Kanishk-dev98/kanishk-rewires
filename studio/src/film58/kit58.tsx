import { Audio } from "@remotion/media";
import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";

/* ---------- Brand system (brief) ---------- */
export const K = {
  bg: "#0A0A0A",
  text: "#F4F4F5",
  green: "#72E3AD",
  divider: "#3A3A3A",
  white: "#FFFFFF",
  ask: "#F5C25B",
  held: "#FF8A6B",
  grey: "#2A2A2A",
  muted: "#8B8B90",
  ink: "#0A0A0A",
};

export const { fontFamily: FIG } = loadFigtree("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });
export const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

/* ---------- Beat grid: 118 BPM at 30 fps ---------- */
export const BPM = 118;
export const FPB = (30 * 60) / BPM;
export const bf = (b: number) => Math.round(b * FPB);

export type Beat = (b: number) => number; // scene-local frame of a scene-relative beat

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const expo = Easing.out(Easing.exp);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Expo-out entrance, 0→1 over `len` frames (default 11 ≈ 370 ms). */
export const ein = (f: number, at: number, len = 11) => interpolate(f, [at, at + len], [0, 1], { ...clamp, easing: expo });
/** Spring-ish overshoot 0→1 for UI cards. */
export const pop = (f: number, at: number, len = 12) =>
  interpolate(f, [at, at + len * 0.6, at + len], [0, 1.06, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
export const fadeOut = (f: number, at: number, len = 8) => interpolate(f, [at, at + len], [1, 0], { ...clamp, easing: easeInOut });

/* ---------- Dot grid: the signature device ---------- */
export const COLS = 48;
export const ROWS = 27;
export const STEP = 40;
export type DotPaint = (i: number, j: number, f: number) => { c: string; a: number; r?: number } | null;

export const DotField: React.FC<{ paint: DotPaint; opacity?: number }> = ({ paint, opacity = 1 }) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 1920, 1080);
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const d = paint(i, j, f);
        if (!d || d.a <= 0.01) continue;
        const x = STEP / 2 + i * STEP;
        const y = STEP / 2 + j * STEP;
        const r = d.r ?? 2.4;
        ctx.globalAlpha = Math.min(1, d.a);
        if (r > 3) {
          ctx.shadowColor = d.c;
          ctx.shadowBlur = r * 3;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = d.c;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }, [f, paint]);
  return <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }} />;
};

/** Distance of dot (i,j) from the grid centre, in dots. */
export const dist = (i: number, j: number) => Math.hypot(i - (COLS - 1) / 2, j - (ROWS - 1) / 2);
export const idle: DotPaint = () => ({ c: "#3A3A3A", a: 0.55 });

/* ---------- Kinetic type ---------- */
export type Word = { t: React.ReactNode; at: number; color?: string };

/** Words land one at a time on given frames (expo-out rise). */
export const Words: React.FC<{ words: Word[]; size: number; color?: string; weight?: number; gap?: number; style?: React.CSSProperties }> = ({
  words,
  size,
  color = K.text,
  weight = 800,
  gap,
  style,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: `0 ${gap ?? size * 0.24}px`, fontFamily: FIG, fontWeight: weight, fontSize: size, lineHeight: 1.02, letterSpacing: -size * 0.03, color, ...style }}>
      {words.map((w, k) => {
        const t = ein(f, w.at, 10);
        return (
          <span key={k} style={{ display: "inline-block", opacity: f >= w.at ? 1 : 0, translate: `0px ${(1 - t) * size * 0.35}px`, color: w.color }}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Decision language ---------- */
export type Decision = "allow" | "ask" | "held";
export const DCOL: Record<Decision, string> = { allow: K.green, ask: K.ask, held: K.held };
export const DLABEL: Record<Decision, string> = { allow: "ALLOW", ask: "ASK", held: "HELD" };

export const Shape: React.FC<{ d: Decision; size?: number; color?: string }> = ({ d, size = 14, color }) => {
  const c = color ?? DCOL[d];
  if (d === "allow") return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: c }} />;
  if (d === "ask") return <span style={{ display: "inline-block", width: size * 0.78, height: size * 0.78, background: c, rotate: "45deg", margin: size * 0.11 }} />;
  return <span style={{ display: "inline-block", width: size * 0.86, height: size * 0.86, background: c, borderRadius: 2 }} />;
};

export const Pill: React.FC<{ d: Decision; label?: string; size?: number; style?: React.CSSProperties }> = ({ d, label, size = 22, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.45,
      padding: `${size * 0.32}px ${size * 0.7}px`,
      borderRadius: 999,
      background: `${DCOL[d]}1F`,
      border: `1.5px solid ${DCOL[d]}`,
      color: DCOL[d],
      fontFamily: MONO,
      fontSize: size,
      fontWeight: 500,
      letterSpacing: 1.5,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    <Shape d={d} size={size * 0.62} />
    {label ?? DLABEL[d]}
  </span>
);

/* ---------- Surfaces ---------- */
export const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      borderRadius: 28,
      background: "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
      backdropFilter: "blur(24px)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Soft glowing orb (Base44 grammar). */
export const Orb: React.FC<{ x: number; y: number; size: number; color?: string; opacity?: number }> = ({ x, y, size, color = K.green, opacity = 0.18 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2 + Math.sin(f / 60) * 20,
        top: y - size / 2 + Math.cos(f / 75) * 16,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        opacity,
        filter: "blur(30px)",
      }}
    />
  );
};

/** Slow 2–3% push-in for UI scenes plus gentle drift. */
export const Push: React.FC<{ dur: number; amount?: number; children: React.ReactNode }> = ({ dur, amount = 0.025, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ scale: String(interpolate(f, [0, dur], [1, 1 + amount], clamp)), translate: `${Math.sin(f / 50) * 4}px ${Math.cos(f / 60) * 3}px` }}>
      {children}
    </AbsoluteFill>
  );
};

/** Horizontal whip: content leaves left with motion blur. */
export const whipOut = (f: number, at: number) => {
  const t = interpolate(f, [at, at + 6], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return { translate: `${-t * 2200}px 0px`, filter: `blur(${t * 40}px)` };
};
export const whipIn = (f: number, at = 0) => {
  const t = interpolate(f, [at, at + 7], [1, 0], { ...clamp, easing: expo });
  return { translate: `${t * 2200}px 0px`, filter: `blur(${t * 40}px)` };
};

/** Typing text: shows the first n characters at frame f. */
export const typed = (text: string, f: number, from: number, cps: number) => text.slice(0, Math.max(0, Math.floor(((f - from) / 30) * cps)));

export const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.3 }) => (
  <Audio from={Math.max(0, Math.round(at))} src={staticFile(`sfx/${name}.wav`)} volume={volume} />
);

/** Spark burst (monday grammar, before the logo). */
export const Burst: React.FC<{ at: number; x?: number; y?: number; count?: number }> = ({ at, x = 960, y = 540, count = 70 }) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 45) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const a = random(`ba${i}`) * Math.PI * 2;
        const v = 14 + random(`bv${i}`) * 30;
        const d = v * t * Math.exp(-t / 14);
        const s = 3 + random(`bs${i}`) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d,
              top: y + Math.sin(a) * d,
              width: s,
              height: s,
              borderRadius: "50%",
              background: i % 4 === 0 ? K.white : K.green,
              opacity: interpolate(t, [25, 45], [1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
