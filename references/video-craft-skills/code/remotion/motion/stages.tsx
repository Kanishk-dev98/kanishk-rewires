/**
 * Stages, decision states and small brand pieces shared by patterns.tsx.
 * - LightStage: never a flat white. Wash + soft accent corner blooms (top-right, bottom-left) + a lighter spot
 *   behind the subject + grain.
 * - DarkStage: the "under the hood" world. Near-black to a tinted centre, an accent glow from the top-right corner
 *   (same diagonal as the light stage blooms, so light ↔ dark cuts feel continuous), a ~6 to 7% shape grid, grain.
 * - States: ALLOW ● circle / ASK ◆ diamond / HELD ■ square. Always shape + label, so they read without colour.
 * - `qa`: flat black, no grain, for containment_check.py renders.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { FIG, MONO } from "../fonts";
import { ACCENT_SHAPE, SHAPE_PATH, T, rgb } from "../theme";
import { mix } from "./core";
import { Grain, GridPaint, ShapeGrid } from "./fx";


/** Small filled accent shape (shards, chip notch, send button, working marker). */
export const AccentShape: React.FC<{ size: number; fill?: string; style?: React.CSSProperties }> = ({ size, fill = T.accentDeep, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible", ...style }}>
    <path d={SHAPE_PATH} fill={fill} strokeLinejoin="round" />
  </svg>
);

/** Anchor of the accent shape to grow/zoom about (incentre for triangles, vertex mean otherwise). */
export const SHAPE_CENTRE: [number, number] = (() => {
  if (ACCENT_SHAPE.length === 3) {
    const [A, B, C] = ACCENT_SHAPE;
    const d = (p: number[], q: number[]) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    const a = d(B, C);
    const b = d(C, A);
    const c = d(A, B);
    const s = a + b + c;
    return [(a * A[0] + b * B[0] + c * C[0]) / s, (a * A[1] + b * B[1] + c * C[1]) / s];
  }
  const n = ACCENT_SHAPE.length;
  return [ACCENT_SHAPE.reduce((s, p) => s + p[0], 0) / n, ACCENT_SHAPE.reduce((s, p) => s + p[1], 0) / n];
})();

/* ---------- Stages: never plain white ---------- */

export const LightStage: React.FC<{ grain?: number; spot?: [number, number]; qa?: boolean; children?: React.ReactNode }> = ({ grain = 0.035, spot = [50, 48], qa, children }) => (
  <AbsoluteFill style={{ background: qa ? "#000" : T.wash }}>
    {qa ? null : (
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(42% 52% at ${spot[0]}% ${spot[1]}%, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)`,
            `radial-gradient(55% 70% at 100% 0%, rgba(${rgb(T.accentSoft)},0.7), rgba(${rgb(T.accentSoft)},0) 62%)`,
            `radial-gradient(50% 65% at 0% 100%, rgba(${rgb(T.accentSoft2)},0.6), rgba(${rgb(T.accentSoft2)},0) 60%)`,
            `linear-gradient(180deg, ${T.wash}, ${mix(T.wash, T.accentSoft, 0.35)})`,
          ].join(","),
        }}
      />
    )}
    {grain > 0 && !qa ? <Grain opacity={grain} blend="soft-light" /> : null}
    {children}
  </AbsoluteFill>
);

const gridPaint = (alpha: number, color: string): GridPaint => (i, j) => ({ c: color, a: alpha * (0.6 + (0.4 * ((i * 7 + j * 13) % 5)) / 4) });

export const DarkStage: React.FC<{ grid?: number; glyph?: "dot" | "shape"; glow?: number; grain?: number; qa?: boolean; children?: React.ReactNode }> = ({ grid = 0.07, glyph = "dot", glow = 1, grain = 0.06, qa, children }) => {
  const paint = React.useMemo(() => gridPaint(grid, T.accent), [grid]);
  return (
    <AbsoluteFill style={{ background: qa ? "#000" : T.dark }}>
      {qa ? null : (
        <>
          <AbsoluteFill style={{ background: `radial-gradient(70% 75% at 50% 45%, ${T.darkTint} 0%, rgba(10,10,10,0) 75%)` }} />
          <AbsoluteFill style={{ opacity: glow, background: `radial-gradient(45% 55% at 100% 0%, rgba(${rgb(T.accentDeep)},0.22), rgba(${rgb(T.accentDeep)},0) 70%)` }} />
          {grid > 0 ? <ShapeGrid paint={paint} glyph={glyph} /> : null}
          {grain > 0 ? <Grain opacity={grain} blend="overlay" /> : null}
        </>
      )}
      {children}
    </AbsoluteFill>
  );
};

/* ---------- Decision states: always shape + label ---------- */
export type State = "allow" | "ask" | "held";
export const STATE_LABEL: Record<State, string> = { allow: "ALLOW", ask: "ASK", held: "HELD" };
export const stateColor = (s: State, dark = false) => (s === "allow" ? (dark ? T.accent : T.accentDeep) : s === "ask" ? (dark ? "#F5F5F5" : T.ink) : dark ? T.deny : T.denyDeep);

/** ● circle / ◆ diamond / ■ square. */
export const StateGlyph: React.FC<{ s: State; size?: number; color?: string; dark?: boolean }> = ({ s, size = 22, color, dark }) => {
  const c = color ?? stateColor(s, dark);
  if (s === "allow") return <span style={{ display: "inline-block", flex: "none", width: size, height: size, borderRadius: "50%", background: c }} />;
  if (s === "ask") return <span style={{ display: "inline-block", flex: "none", width: size * 0.74, height: size * 0.74, margin: size * 0.13, background: c, rotate: "45deg", borderRadius: 2 }} />;
  return <span style={{ display: "inline-block", flex: "none", width: size * 0.9, height: size * 0.9, margin: size * 0.05, background: c, borderRadius: 3 }} />;
};

/** State pill: glyph + mono label on a tinted surface per state. */
export const StatePill: React.FC<{ s: State; label?: string; size?: number; dark?: boolean; style?: React.CSSProperties }> = ({ s, label, size = 26, dark, style }) => {
  const c = stateColor(s, dark);
  const bg = s === "allow" ? (dark ? `rgba(${rgb(T.accent)},0.14)` : mix("#FFFFFF", T.accentSoft, 0.6)) : s === "ask" ? (dark ? "rgba(255,255,255,0.10)" : T.soft) : dark ? `rgba(${rgb(T.deny)},0.16)` : T.denyWash;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.45, padding: `${size * 0.3}px ${size * 0.7}px`, borderRadius: 999, background: bg, border: `1.5px solid ${c}55`, color: s === "allow" && !dark ? T.accentText : c, fontFamily: MONO, fontWeight: 500, fontSize: size, letterSpacing: size * 0.08, whiteSpace: "nowrap", ...style }}>
      <StateGlyph s={s} size={size * 0.7} color={c} />
      {label ?? STATE_LABEL[s]}
    </span>
  );
};

/** Rounded tag chip with the accent-shape notch at its left. `sel` 0 → 1 = selected (fill → ink, label → accent). */
export const TagChip: React.FC<{ label: string; sel?: number; size?: number; state?: State; style?: React.CSSProperties }> = ({ label, sel = 0, size = 30, state, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.4,
      height: size * 1.9,
      padding: `0 ${size * 0.75}px 0 ${size * 0.5}px`,
      borderRadius: 999,
      background: mix("#FFFFFF", T.ink, sel),
      border: `1.5px solid ${mix(T.border, T.ink, sel)}`,
      color: mix(T.ink, T.accentBright, sel),
      fontFamily: FIG,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: -size * 0.01,
      whiteSpace: "nowrap",
      boxShadow: "0 6px 18px rgba(10,20,60,0.08)",
      ...style,
    }}
  >
    <AccentShape size={size * 0.95} fill={sel > 0.5 ? T.accentBright : T.accentDeep} />
    <span>{label}</span>
    {state ? <StateGlyph s={state} size={size * 0.62} dark={sel > 0.5} /> : null}
  </div>
);

/** White product card used across demos (radius 22, soft long shadow). */
export const UICard: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties; pad?: number }> = ({ w, children, style, pad = 36 }) => (
  <div style={{ width: w, background: "#FFFFFF", border: `1px solid ${T.border}`, borderRadius: 22, padding: pad, boxShadow: "0 30px 80px rgba(10,20,60,0.12), 0 2px 6px rgba(0,0,0,0.04)", fontFamily: FIG, color: T.ink, ...style }}>{children}</div>
);

/** Small mono label for lab / demo scenes, bottom-left inside the safe area. */
export const LabLabel: React.FC<{ n: number; name: string; dark?: boolean }> = ({ n, name, dark }) => (
  <div style={{ position: "absolute", left: 80, bottom: 80, fontFamily: MONO, fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: dark ? "#8F95A5" : T.muted }}>{`${String(n).padStart(2, "0")} · ${name}`}</div>
);
