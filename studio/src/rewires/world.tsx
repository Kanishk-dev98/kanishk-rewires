// Reusable continuous-take world (generalised from the Duet film). Every beat lives on one canvas; the camera
// whip-zooms between beat positions with directional motion blur; a lime signal thread draws the path; beats can
// be "dark" (a charcoal iris grows behind the world on entry, and a cream iris restores it on the next beat).
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, clamp, EASE, EASE_IO } from "./brand";
import { ez, INK } from "./duet";
import type { BeatProps, Cue } from "./duet";
import type { SceneProps } from "./scenes";

type V = [number, number];
export type WorldSpec = {
  order: string[];
  beats: Record<string, React.FC<BeatProps & { dark: boolean }>>;
  positions: V[];
  dark?: string[];
};
const M = 22;

const segOf = (P: V[], j: number): [V, V, V, V] => {
  const A = P[j - 1];
  const B = P[j];
  const dx = B[0] - A[0];
  const dy = B[1] - A[1];
  if (Math.abs(dx) < 1) return [A, [A[0] + 520, A[1] + dy * 0.3], [B[0] - 520, B[1] - dy * 0.3], B];
  return [A, [A[0] + dx * 0.55, A[1]], [B[0] - dx * 0.55, B[1]], B];
};
const bez = (s: [V, V, V, V], t: number): V => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]) as V;
};
const segD = (s: [V, V, V, V]) => `M${s[0][0]},${s[0][1]} C${s[1][0]},${s[1][1]} ${s[2][0]},${s[2][1]} ${s[3][0]},${s[3][1]}`;

export const makeWorldScene = (spec: WorldSpec): React.FC<SceneProps> => {
  const { order, beats, positions: P } = spec;
  const darkSet = new Set(spec.dark ?? []);
  const World: React.FC<SceneProps> = ({ data }) => {
    const f = useCurrentFrame();
    const w = data._world as { i: number; starts: number[]; durs: number[]; cues: Record<string, number>[] };
    const i = order.indexOf(data.beat as string);
    const g = w.starts[w.i] + f;
    const D = w.durs[w.i];
    let pos: V = P[i];
    let s = 1;
    let rot = 0;
    let bx = 0;
    let by = 0;
    let t = 1;
    if (i === 0) {
      s = interpolate(f, [0, 46], [1.16, 1], { ...clamp, easing: EASE });
    } else {
      t = ez(f, 0, M, 0, 1, EASE_IO);
      const sg = segOf(P, i);
      pos = bez(sg, t);
      const dip = Math.sin(Math.PI * t);
      s = 1 - 0.4 * dip;
      rot = (i % 2 ? 1 : -1) * 3.5 * dip;
      const a = bez(sg, Math.max(0, t - 0.04));
      const b = bez(sg, Math.min(1, t + 0.04));
      const vx = Math.abs(b[0] - a[0]);
      const vy = Math.abs(b[1] - a[1]);
      const v = Math.hypot(vx, vy) || 1;
      const amt = 26 * Math.pow(dip, 1.4);
      bx = (amt * vx) / v;
      by = (amt * vy) / v;
    }
    s *= interpolate(f, [M, Math.max(M + 1, D)], [1, 1.035], clamp);
    const fid = `wmb${w.i}`;
    // theme iris: dark beats grow a charcoal disc; the beat after a dark one grows cream back
    const isDark = darkSet.has(order[i]);
    const prevDark = i > 0 && darkSet.has(order[i - 1]);
    const iris = ez(f, 8, 26, 0, 1, EASE_IO);
    const R = 1300 * iris;
    const base = isDark ? (iris >= 1 ? C.charcoal : C.cream) : prevDark && iris < 1 ? C.charcoal : C.cream;
    const disc = isDark ? C.charcoal : prevDark ? C.cream : null;
    const darkNow = isDark ? iris > 0.5 : prevDark ? iris < 0.5 : false;
    const visible = order.map((_, j) => j).filter((j) => Math.abs(j - i) <= 1);
    const specks = new Array(34).fill(0).map((_, k) => {
      const depth = 0.35 + random(`dk${k}`) * 1.3;
      const sx = random(`dx${k}`) * 1400;
      const sy = random(`dy${k}`) * 2300;
      const x = ((((sx - pos[0] * depth * s) % 1400) + 1400) % 1400) - 160;
      const y = ((((sy - pos[1] * depth * s) % 2300) + 2300) % 2300) - 190;
      const r = 2 + depth * 3;
      const col = k % 3 === 0 ? C.lime : k % 3 === 1 ? (darkNow ? "#3A3B37" : "#CFCBBE") : darkNow ? C.cream : C.charcoal;
      return <div key={k} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: k % 4 === 0 ? 2 : "50%", background: col, opacity: k % 3 === 2 ? 0.12 : 0.5, filter: depth > 1.2 ? `blur(${(depth - 1.1) * 4}px)` : undefined }} />;
    });
    return (
      <AbsoluteFill style={{ background: base, overflow: "hidden" }}>
        {disc && iris > 0 && iris < 1 ? <div style={{ position: "absolute", left: 540 - R, top: 900 - R, width: R * 2, height: R * 2, borderRadius: "50%", background: disc }} /> : null}
        <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${darkNow ? "rgba(246,244,237,0.08)" : "rgba(10,10,10,0.09)"} 1.3px, transparent 1.6px)`, backgroundSize: `${46 * s}px ${46 * s}px`, backgroundPosition: `${540 - pos[0] * s}px ${960 - pos[1] * s}px`, maskImage: "radial-gradient(ellipse 75% 60% at 50% 46%, black, transparent 80%)" }} />
        {!darkNow ? <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 42%, rgba(255,255,255,0.85), rgba(246,244,237,0) 70%)" }} /> : <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 42%, rgba(167,255,63,0.07), rgba(10,10,10,0) 70%)" }} />}
        <AbsoluteFill>{specks}</AbsoluteFill>
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
          </filter>
        </svg>
        <AbsoluteFill style={{ filter: bx + by > 0.4 ? `url(#${fid})` : undefined }}>
          <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(540px, 960px) rotate(${rot}deg) scale(${s}) translate(${-pos[0]}px, ${-pos[1]}px)` }}>
            <svg style={{ position: "absolute", left: -2000, top: -2000, overflow: "visible" }} width={16000} height={6000}>
              <g transform="translate(2000 2000)">
                {order.slice(1).map((_, k) => {
                  const j = k + 1;
                  if (j > i) return null;
                  const sg = segOf(P, j);
                  const prog = j < i ? 1 : t;
                  return (
                    <g key={j}>
                      <path d={segD(sg)} fill="none" stroke={C.lime} strokeWidth={16} strokeLinecap="round" opacity={0.35} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
                      <path d={segD(sg)} fill="none" stroke={darkNow ? C.lime : INK} strokeWidth={3} strokeLinecap="round" opacity={0.8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
                    </g>
                  );
                })}
                {i > 0 && t < 1
                  ? (() => {
                      const h = bez(segOf(P, i), t);
                      return (
                        <g>
                          <circle cx={h[0]} cy={h[1]} r={46} fill={C.lime} opacity={0.25} />
                          <circle cx={h[0]} cy={h[1]} r={18} fill={C.lime} />
                          <circle cx={h[0]} cy={h[1]} r={7} fill="white" />
                        </g>
                      );
                    })()
                  : null}
              </g>
            </svg>
            {visible.map((j) => {
              const B = beats[order[j]];
              const fj = g - w.starts[j];
              const cj: Cue = (n, fb) => (w.cues[j]?.[n] ?? fb) as number;
              return (
                <div key={j} style={{ position: "absolute", left: P[j][0] - 540, top: P[j][1] - 960, width: 1080, height: 1920 }}>
                  <B f={fj} D={w.durs[j]} c={cj} g={g} dark={darkSet.has(order[j])} />
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  };
  return World;
};
