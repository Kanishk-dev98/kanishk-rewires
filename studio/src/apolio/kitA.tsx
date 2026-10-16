import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { clamp, ein, FIG, MONO } from "../film58/kit58";

/* ---------- Abstraxn palette only (brand kit + abstraxn.com CSS) ---------- */
export const A = {
  dark: "#0A0A0A",
  ink: "#171717",
  muted: "#6B6B6B",
  white: "#FFFFFF",
  soft: "#F5F5F5",
  wash: "#F2FBF7",
  mint: "#AEF4D4",
  mint2: "#9BEFCA",
  green: "#72E3AD",
  green2: "#3ECF8E",
  bright: "#68F4B5",
  deep: "#249361",
  text: "#0A6B47",
  border: "#E7E7E5",
  borderDark: "#3A3A3A",
  deny: "#E2887C",
  denyDeep: "#A33F31",
  denyWash: "#FDEEEC",
};

/** 120 BPM at 30 fps: exactly 15 frames per beat. */
export const FB = 15;
export const beat = (b: number) => Math.round(b * FB);

/* ---------- Calm scenery (Manus grammar, painted in Abstraxn mint) ---------- */
const ridge = (seed: string, base: number, amp: number, n = 7) => {
  const pts: string[] = [];
  for (let x = -100; x <= 2100; x += 60) {
    let y = base;
    for (let k = 1; k <= n; k++) y += Math.sin(x / (180 * k) + random(`${seed}${k}`) * 6) * (amp / k);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M -100 1200 L ${pts.join(" L ")} L 2100 1200 Z`;
};
const R1 = ridge("r1", 600, 90);
const R2 = ridge("r2", 670, 70);
const R3 = ridge("r3", 735, 50);

export const Scenery: React.FC<{ drift?: number }> = ({ drift = 1 }) => {
  const f = useCurrentFrame();
  const px = (k: number) => `${-f * 0.15 * k * drift}px 0px`;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: `linear-gradient(180deg, ${A.white} 0%, ${A.wash} 55%, #E4F8EE 100%)` }}>
      <div style={{ position: "absolute", left: 1300, top: 160, width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${A.mint}AA 0%, transparent 62%)`, filter: "blur(10px)" }} />
      <svg width={2200} height={1080} style={{ position: "absolute", left: -100, top: 0 }}>
        <path d={R1} fill="#DDF5E9" style={{ translate: px(0.4) }} />
        <path d={R2} fill="#CDF0DE" style={{ translate: px(0.7) }} />
        <path d={R3} fill="#B9EAD2" style={{ translate: px(1) }} />
        <rect x={0} y={790} width={2200} height={300} fill="url(#water)" />
        <defs>
          <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#E9FAF2" />
            <stop offset="1" stopColor={A.white} />
          </linearGradient>
        </defs>
        {new Array(9).fill(0).map((_, i) => (
          <rect key={i} x={((random(`w${i}`) * 2000 + f * (0.4 + i * 0.05)) % 2300) - 100} y={820 + i * 26} width={160 + random(`ww${i}`) * 260} height={2} rx={1} fill={A.green} opacity={0.18} />
        ))}
      </svg>
      {[0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: ((f * (0.5 + i * 0.3) + i * 900) % 2600) - 700, top: 560 + i * 70, width: 900, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.55)", filter: "blur(30px)" }} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------- Apolio: the agent, built from the Abstraxn triangle ---------- */
export const Apolio: React.FC<{ size?: number; mood?: "calm" | "alert" | "happy"; style?: React.CSSProperties }> = ({ size = 220, mood = "calm", style }) => {
  const f = useCurrentFrame();
  const blink = f % 75 > 70 ? 0.15 : 1;
  const bob = Math.sin(f / 18) * size * 0.025;
  const eye = mood === "alert" ? A.denyDeep : A.ink;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", translate: `0px ${bob}px`, ...style }}>
      <defs>
        <linearGradient id="apg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={A.bright} />
          <stop offset="0.55" stopColor={A.green2} />
          <stop offset="1" stopColor={A.deep} />
        </linearGradient>
      </defs>
      <ellipse cx={100} cy={196} rx={58} ry={8} fill={A.deep} opacity={0.15} />
      <path d="M100 8 C 150 8 192 40 192 98 C 192 156 152 188 100 188 C 48 188 8 156 8 98 C 8 40 50 8 100 8 Z" fill="url(#apg)" />
      {/* the logo triangle as a facet highlight */}
      <path d="M150 140 L 92 108 L 126 30 Z" fill="white" opacity={0.22} />
      <rect x={58} y={84 + (1 - blink) * 10} width={18} height={30 * blink} rx={9} fill={eye} />
      <rect x={118} y={84 + (1 - blink) * 10} width={18} height={30 * blink} rx={9} fill={eye} />
      {mood === "happy" ? <path d="M78 132 Q 97 148 118 132" fill="none" stroke={A.ink} strokeWidth={6} strokeLinecap="round" /> : null}
      <path d="M160 18 L 186 4 L 182 34 Z" fill={A.text} />
    </svg>
  );
};

/* ---------- Light UI surfaces ---------- */
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({ children, style, dark }) => (
  <div
    style={{
      borderRadius: 28,
      background: dark ? "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))" : "rgba(255,255,255,0.92)",
      border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : A.border}`,
      boxShadow: dark ? "0 40px 120px rgba(0,0,0,0.6)" : "0 40px 100px rgba(10,107,71,0.14), 0 6px 18px rgba(0,0,0,0.05)",
      backdropFilter: "blur(18px)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Bubble: React.FC<{ who: "you" | "apolio"; children: React.ReactNode; at: number; size?: number; style?: React.CSSProperties }> = ({ who, children, at, size = 30, style }) => {
  const f = useCurrentFrame();
  const t = ein(f, at, 10);
  const you = who === "you";
  return (
    <div style={{ display: "flex", justifyContent: you ? "flex-end" : "flex-start", gap: 14, alignItems: "flex-end", opacity: f >= at ? 1 : 0, translate: `0px ${(1 - t) * 30}px`, ...style }}>
      {!you ? <Apolio size={size * 1.7} /> : null}
      <div style={{ maxWidth: "78%" }}>
        <div style={{ fontFamily: MONO, fontSize: size * 0.5, letterSpacing: 2, color: A.muted, marginBottom: 6, textAlign: you ? "right" : "left" }}>{you ? "YOU" : "APOLIO"}</div>
        <div style={{ padding: `${size * 0.55}px ${size * 0.75}px`, borderRadius: size * 0.9, borderBottomRightRadius: you ? 8 : size * 0.9, borderBottomLeftRadius: you ? size * 0.9 : 8, background: you ? A.ink : A.wash, border: you ? "none" : `1px solid #BDEBD5`, color: you ? A.white : A.ink, fontFamily: FIG, fontWeight: 500, fontSize: size, lineHeight: 1.4 }}>{children}</div>
      </div>
    </div>
  );
};

export const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; w?: number; h?: number }> = ({ children, style, w = 420, h = 860 }) => (
  <div style={{ position: "absolute", width: w, height: h, borderRadius: 64, background: A.white, border: `10px solid ${A.ink}`, boxShadow: "0 60px 140px rgba(10,107,71,0.22), 0 10px 30px rgba(0,0,0,0.12)", overflow: "hidden", ...style }}>
    <div style={{ position: "absolute", top: 16, left: w / 2 - 60, width: 120, height: 34, borderRadius: 999, background: A.ink, zIndex: 5 }} />
    {children}
  </div>
);

/** Small "tick" chip with a check, brand style. */
export const Check: React.FC<{ children: React.ReactNode; at: number; dark?: boolean; size?: number }> = ({ children, at, dark, size = 26 }) => {
  const f = useCurrentFrame();
  const t = interpolate(f - at, [0, 6, 10], [0.5, 1.08, 1], clamp);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: `${size * 0.4}px ${size * 0.8}px`, borderRadius: 999, background: dark ? "rgba(114,227,173,0.12)" : A.wash, border: `1.5px solid ${A.green2}`, color: dark ? A.green : A.text, fontFamily: FIG, fontWeight: 700, fontSize: size, opacity: f >= at ? 1 : 0, scale: String(f >= at ? t : 0.5), whiteSpace: "nowrap" }}>
      <span style={{ width: size * 0.95, height: size * 0.95, borderRadius: "50%", background: A.green2, color: A.white, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.6 }}>✓</span>
      {children}
    </span>
  );
};

/** Chapter tag, Manus style: icon + label, small and calm. */
export const Chapter: React.FC<{ icon: React.ReactNode; label: string; at: number; dark?: boolean; style?: React.CSSProperties }> = ({ icon, label, at, dark, style }) => {
  const f = useCurrentFrame();
  const t = ein(f, at, 10);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, fontFamily: FIG, fontWeight: 600, fontSize: 30, color: dark ? A.white : A.ink, opacity: t, translate: `0px ${(1 - t) * 12}px`, ...style }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: dark ? "rgba(114,227,173,0.14)" : A.wash, border: `1px solid ${dark ? "rgba(114,227,173,0.35)" : "#BDEBD5"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: dark ? A.green : A.text, fontSize: 24 }}>{icon}</span>
      {label}
    </div>
  );
};

/** A tiny line icon set (stroke = currentColor). */
export const Ico: React.FC<{ d: string; size?: number; color?: string }> = ({ d, size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const ICON = {
  wallet: "M3 7 H19 a2 2 0 0 1 2 2 V17 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 Z M3 7 V6 a2 2 0 0 1 2 -2 H16 M16 13 h2",
  id: "M4 5 H20 V19 H4 Z M8 10 a2 2 0 1 0 0.1 0 M6 16 c1 -2 3 -2 4 0 M13 9 H18 M13 13 H18",
  rules: "M5 4 H19 V20 H5 Z M8 8 H16 M8 12 H16 M8 16 H12",
  chart: "M3 20 V4 M3 20 H21 M7 15 L11 10 L14 13 L20 6",
  bell: "M6 16 V11 a6 6 0 0 1 12 0 V16 L20 18 H4 Z M10 21 h4",
  shield: "M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z",
  receipt: "M6 3 H18 V21 L15 19 L12 21 L9 19 L6 21 Z M9 8 H15 M9 12 H15",
  chat: "M4 5 H20 V16 H9 L5 20 V16 H4 Z",
  key: "M14 10 a4 4 0 1 0 -0.1 0 M11 13 L4 20 M7 17 L9 19",
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "multiply", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`gA${f % 6}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 6} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#gA${f % 6})`} />
      </svg>
    </AbsoluteFill>
  );
};
