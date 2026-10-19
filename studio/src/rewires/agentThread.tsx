// "Agent thread" film (9:16): one continuous glowing lime thread carries an AI agent through a real task
// (plan a Goa team offsite). Each beat starts where the last one ended (thread head at the frame centre),
// so the cuts read as one unbroken take. Pure motion design: no stock footage. Example task, illustrative data.
import React from "react";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";

const RED = "#E5484D";
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;
const CX = 540;
const CY = 960;

// ------------------------------------------------------------------ the thread
type Pt = [number, number];
/** Total length and point at fraction p along a polyline. */
const along = (pts: Pt[], p: number): { pts: Pt[]; head: Pt } => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  let want = Math.max(0, Math.min(1, p)) * total;
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < seg.length; i++) {
    if (want >= seg[i]) {
      out.push(pts[i + 1]);
      want -= seg[i];
    } else {
      const t = seg[i] ? want / seg[i] : 0;
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
      break;
    }
  }
  return { pts: out, head: out[out.length - 1] };
};
/** Smooth Catmull-Rom-ish sampling of control points into a dense polyline. */
const smooth = (ctrl: Pt[], n = 120): Pt[] => {
  if (ctrl.length < 3) return ctrl;
  const out: Pt[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    const steps = Math.ceil(n / (ctrl.length - 1));
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
};
const circle = (cx: number, cy: number, r: number, a0 = -Math.PI / 2, n = 120): Pt[] => new Array(n + 1).fill(0).map((_, i) => [cx + r * Math.cos(a0 + (i / n) * Math.PI * 2), cy + r * Math.sin(a0 + (i / n) * Math.PI * 2)] as Pt);

/** Glowing thread: a soft wide bloom, a crisp core and a haloed head point. */
const Thread: React.FC<{ pts: Pt[]; p: number; color?: string; width?: number; head?: boolean; dark?: boolean }> = ({ pts, p, color = C.lime, width = 4, head = true, dark = true }) => {
  const frame = useCurrentFrame();
  const a = along(pts, p);
  const d = a.pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
  const pulse = 1 + 0.25 * Math.sin(frame / 4);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {dark ? <path d={d} stroke={color} strokeWidth={width * 6} fill="none" opacity={0.18} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "blur(14px)" }} /> : null}
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {head && p > 0.001 ? (
        <>
          <circle cx={a.head[0]} cy={a.head[1]} r={26 * pulse} fill={color} opacity={dark ? 0.22 : 0.15} style={{ filter: "blur(10px)" }} />
          <circle cx={a.head[0]} cy={a.head[1]} r={9} fill={dark ? "#F6FFE8" : C.charcoal} />
        </>
      ) : null}
    </svg>
  );
};

// ------------------------------------------------------------------ shared bits
const Stage: React.FC<{ text: string; dark?: boolean; at?: number }> = ({ text, dark = true, at = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 10], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", gap: 12, opacity: o }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: dark ? C.lime : C.charcoal, border: `1.5px solid ${dark ? "rgba(167,255,63,0.5)" : "rgba(10,10,10,0.35)"}`, borderRadius: 999, padding: "7px 18px" }}>{text}</div>
      <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 18, letterSpacing: 3, color: dark ? C.grey : "#77756D", alignSelf: "center" }}>EXAMPLE TASK</div>
    </div>
  );
};
const Ambient: React.FC<{ dark?: boolean }> = ({ dark = true }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: dark ? C.charcoal : C.cream, overflow: "hidden" }}>
      {new Array(22).fill(0).map((_, i) => {
        const x = (i * 197) % 1000 + 40;
        const y = ((i * 311 + frame * (0.5 + (i % 4) * 0.2)) % 2000) - 40;
        return <div key={i} style={{ position: "absolute", left: x, top: 1920 - y, width: 4, height: 4, borderRadius: 2, background: dark ? C.lime : C.charcoal, opacity: dark ? 0.12 + (i % 3) * 0.08 : 0.08 }} />;
      })}
      <AbsoluteFill style={{ background: dark ? "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(167,255,63,0.06), rgba(0,0,0,0) 70%)" : "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(255,255,255,0.6), rgba(0,0,0,0) 70%)" }} />
    </AbsoluteFill>
  );
};
const Logo: React.FC<{ name: string; size: number }> = ({ name, size }) => <Img src={staticFile(`media/grok/${name}-c.svg`)} style={{ width: size, height: size }} />;
const pop = (frame: number, at: number, k = 1) => {
  const s = spring({ frame: frame - at, fps: 30, config: { damping: 13, stiffness: 190 } });
  return { opacity: frame < at ? 0 : Math.min(1, s * 1.6), scale: String(0.7 + 0.3 * s * k), translate: `0 ${(1 - s) * 24}px` } as React.CSSProperties;
};
const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

// ------------------------------------------------------------------ beat 1: the goal
const GoalBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const goal = "Plan a 3-day Goa offsite · 12 people · under ₹2 lakh · next month";
  const draw = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: EASE_IO });
  const typed = goal.slice(0, Math.max(0, Math.floor((frame - 20) * 1.9)));
  const lock = c("lakh", 70);
  const exit = interpolate(frame, [D - 14, D], [0, 1], { ...clamp, easing: EASE_IO });
  const path: Pt[] = [[CX, 1700], [CX, 1200], [CX, 760]];
  const exitPath: Pt[] = [[CX, 760], [CX, CY]];
  return (
    <>
      <Ambient />
      <Thread pts={path} p={draw} />
      {exit > 0 ? <Thread pts={exitPath} p={exit} /> : null}
      <div style={{ position: "absolute", left: 90, right: 90, top: 640, height: 240, borderRadius: 34, background: "rgba(20,24,18,0.9)", border: `2px solid ${frame > 20 ? C.lime : "rgba(167,255,63,0.25)"}`, boxShadow: `0 0 ${60 + 30 * Math.sin(frame / 6)}px rgba(167,255,63,0.22)`, padding: "26px 30px", ...pop(frame, 14) }}>
        <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: C.grey }}>AI AGENT · NEW TASK</div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: C.cream, marginTop: 12 }}>
          {typed}
          {typed.length < goal.length ? <span style={{ color: C.lime }}>▍</span> : null}
        </div>
      </div>
      {frame >= lock ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 920, display: "flex", justifyContent: "center", gap: 14 }}>
          {[["🔒", "BUDGET ₹2,00,000"], ["👥", "12 PEOPLE"], ["📍", "GOA"]].map(([i, t], k) => (
            <div key={t} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 2, color: C.charcoal, background: k === 0 ? C.lime : C.cream, borderRadius: 999, padding: "10px 18px", ...pop(frame, lock + k * 5) }}>
              {i} {t}
            </div>
          ))}
        </div>
      ) : null}
      <Stage text="THE GOAL" at={4} />
    </>
  );
};

// ------------------------------------------------------------------ beat 2: calendars
const CalendarBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const R = 300;
  const ring = circle(CX, CY, R);
  const draw = interpolate(frame, [0, 26], [0, 1], { ...clamp, easing: EASE_IO });
  const found = c("weekend", 90);
  const weeks = ["Nov 7-9", "Nov 14-16", "Nov 21-23", "Nov 28-30"];
  const scan = Math.min(2, Math.floor(interpolate(frame, [30, found], [0, 2.99], clamp)));
  const free = [7, 9, 12, 10];
  return (
    <>
      <Ambient />
      <Thread pts={[[CX, CY], [CX, CY - R]]} p={interpolate(frame, [0, 8], [1, 0], clamp)} head={false} />
      <Thread pts={ring} p={draw} />
      {new Array(12).fill(0).map((_, i) => {
        const a = -Math.PI / 2 + (i / 12) * Math.PI * 2 + frame / 160;
        const ok = frame >= found + 4 || (i < free[scan] && frame > 30);
        return (
          <div key={i} style={{ position: "absolute", left: CX + Math.cos(a) * R - 26, top: CY + Math.sin(a) * R - 26, width: 52, height: 52, borderRadius: "50%", background: ok ? C.lime : "#1F1F1F", border: `2px solid ${ok ? C.lime : "#3A3A3A"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 20, color: ok ? C.charcoal : C.grey, ...pop(frame, 6 + i * 2) }}>
            {"ARKPNSMDVTJY"[i]}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: CX - 190, top: CY - 120, width: 380, textAlign: "center", ...pop(frame, 20) }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Logo name="googlecalendar" size={36} />
          <span style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: C.grey }}>CALENDARS</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1.1, color: frame >= found ? C.lime : C.cream, marginTop: 14 }}>{frame >= found ? "Nov 21-23" : weeks[scan]}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: frame >= found ? C.lime : C.stone, marginTop: 8 }}>{frame >= found ? "12 / 12 FREE ✓" : `${free[scan]} / 12 free`}</div>
      </div>
      <Stage text="CALENDARS" />
    </>
  );
};

// ------------------------------------------------------------------ beat 3: flights
const FlightBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const goa: Pt = [470, 1130];
  const cities: { code: string; at: Pt; from: number; to: number; time: string }[] = [
    { code: "DEL", at: [600, 560], from: 9200, to: 6450, time: "lands 10:40" },
    { code: "BOM", at: [330, 890], from: 5400, to: 3820, time: "lands 09:15" },
    { code: "BLR", at: [700, 1260], from: 6100, to: 4380, time: "lands 11:05" },
  ];
  const pick = c("cheapest", 100);
  const t = interpolate(frame, [10, pick], [0, 1], { ...clamp, easing: EASE });
  return (
    <>
      <Ambient />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {cities.map((ct, i) => {
          const mid: Pt = [(ct.at[0] + goa[0]) / 2 - 120, (ct.at[1] + goa[1]) / 2 - 60];
          const pts = smooth([ct.at, mid, goa], 60);
          const a = along(pts, interpolate(frame, [6 + i * 6, 36 + i * 6], [0, 1], { ...clamp, easing: EASE_IO }));
          const d = a.pts.map((q, k) => `${k ? "L" : "M"}${q[0]},${q[1]}`).join(" ");
          return (
            <g key={ct.code}>
              <path d={d} stroke={C.lime} strokeWidth={14} opacity={0.15} fill="none" style={{ filter: "blur(8px)" }} />
              <path d={d} stroke={frame >= pick ? C.lime : C.stone} strokeWidth={3} strokeDasharray="10 9" strokeDashoffset={-frame * 2} fill="none" />
              <circle cx={a.head[0]} cy={a.head[1]} r={8} fill={C.cream} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: goa[0] - 70, top: goa[1] - 70, width: 140, height: 140, borderRadius: "50%", border: `2px solid ${C.lime}`, boxShadow: "0 0 50px rgba(167,255,63,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: C.lime, scale: String(1 + 0.04 * Math.sin(frame / 5)) }}>GOI</div>
      {cities.map((ct, i) => {
        const fare = ct.from + (ct.to - ct.from) * t;
        const win = frame >= pick;
        const right = ct.at[0] > 500;
        return (
          <div key={ct.code} style={{ position: "absolute", left: right ? ct.at[0] - 20 : ct.at[0] - 250, top: ct.at[1] - 40, width: 270, textAlign: right ? "left" : "right", ...pop(frame, 4 + i * 5) }}>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: C.cream }}>{ct.code}</div>
            <div style={{ fontFamily: SERIF, fontSize: 46, color: win ? C.lime : C.stone, fontVariantNumeric: "tabular-nums" }}>{fmt(fare)}</div>
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: win ? C.lime : C.grey }}>{win ? `✓ ${ct.time.toUpperCase()}` : "SEARCHING…"}</div>
          </div>
        );
      })}
      <Stage text="FLIGHTS" />
    </>
  );
};

// ------------------------------------------------------------------ beat 4: villas (cream act, orb flood)
const VillaArt: React.FC<{ hue: string; seed: number }> = ({ hue, seed }) => {
  const frame = useCurrentFrame();
  const w = Math.sin(frame / 10 + seed) * 4;
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice">
      <rect width="100" height="70" fill={hue} />
      <circle cx="78" cy="16" r="9" fill="#FFF3D6" opacity={0.85} />
      <path d="M10 44 L30 26 L50 44 Z" fill="#F6F4ED" opacity={0.95} />
      <rect x="14" y="44" width="32" height="14" fill="#F6F4ED" />
      <rect x="24" y="48" width="8" height="10" fill={hue} opacity={0.6} />
      <path d="M58 44 L66 18 M66 18 Q72 14 80 18 M66 18 Q60 13 54 17" stroke="#2D4A2A" strokeWidth="2.4" fill="none" />
      <rect x="0" y="58" width="100" height="12" fill="#5EC8D8" />
      <path d={`M0 ${62 + w * 0.2} Q25 ${60 - w * 0.3} 50 ${62 + w * 0.2} T100 ${62}`} stroke="#E8FBFF" strokeWidth="1.2" fill="none" opacity={0.8} />
    </svg>
  );
};
const VillaBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const flood = interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: EASE_IO });
  const tap = c("pick", 150);
  const villas = [
    { name: "Palm Court", price: "₹26k", night: "/night", hue: "#C98B5E", ok: [true, false, true] },
    { name: "Casa Laguna", price: "₹30k", night: "/night", hue: "#B5703F", ok: [true, true, true] },
    { name: "Sea Breeze", price: "₹34k", night: "/night", hue: "#8C6A4F", ok: [true, true, true] },
  ];
  const xs = [210, 540, 870];
  const string = smooth([[72, 520], [210, 600], [540, 560], [870, 600], [1008, 520]], 90);
  const picked = frame >= tap;
  return (
    <>
      <Ambient dark={false} />
      <div style={{ position: "absolute", left: CX - 40, top: CY - 40, width: 80, height: 80, borderRadius: "50%", background: C.lime, scale: String(flood < 1 ? flood * 50 : 0), opacity: 1 - flood, filter: "blur(4px)" }} />
      <Thread pts={string} p={interpolate(frame, [8, 34], [0, 1], { ...clamp, easing: EASE_IO })} color={C.charcoal} width={3} dark={false} />
      {villas.map((v, i) => {
        const at = 16 + i * 8;
        const swing = Math.sin((frame - at) / 9) * 6 * Math.exp(-Math.max(0, frame - at) / 40);
        const win = picked && i === 1;
        const lose = picked && i !== 1;
        return (
          <div key={v.name} style={{ position: "absolute", left: xs[i] - 145, top: 590, width: 290, transformOrigin: "50% 0%", rotate: `${swing}deg`, ...pop(frame, at), opacity: frame < at ? 0 : lose ? 0.45 : 1, scale: win ? "1.07" : String(pop(frame, at).scale) }}>
            <div style={{ width: 2, height: 30, background: C.charcoal, margin: "0 auto" }} />
            <div style={{ borderRadius: 22, background: "white", overflow: "hidden", boxShadow: win ? `0 0 0 5px ${C.lime}, 0 30px 70px rgba(0,0,0,0.25)` : "0 24px 60px rgba(0,0,0,0.18)" }}>
              <div style={{ height: 190 }}>
                <VillaArt hue={v.hue} seed={i} />
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 28, color: C.charcoal }}>{v.name}</div>
                <div style={{ fontFamily: SERIF, fontSize: 36, color: C.charcoal }}>
                  {v.price}
                  <span style={{ fontFamily: BODY, fontSize: 18, color: "#77756D" }}>{v.night}</span>
                </div>
                {["Pool", "Meeting room", "Sleeps 12"].map((f, k) => (
                  <div key={f} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 19, color: v.ok[k] ? "#2E7D32" : RED, marginTop: 4, opacity: frame >= at + 10 + k * 4 ? 1 : 0 }}>
                    {v.ok[k] ? "✓" : "✕"} {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {frame >= tap - 16 && frame < tap + 14 ? <div style={{ position: "absolute", left: interpolate(frame, [tap - 16, tap], [880, CX + 30], clamp), top: interpolate(frame, [tap - 16, tap], [1300, 1010], clamp), width: 50, height: 50, borderRadius: "50%", background: "rgba(10,10,10,0.75)", boxShadow: frame >= tap ? `0 0 0 ${(frame - tap) * 4}px rgba(167,255,63,${Math.max(0, 0.5 - (frame - tap) / 28)})` : undefined }} /> : null}
      {frame >= tap ? <div style={{ position: "absolute", left: 0, right: 0, top: 1160, display: "flex", justifyContent: "center", ...pop(frame, tap + 4) }}><div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: C.charcoal, background: C.lime, borderRadius: 999, padding: "10px 20px" }}>YOU PICKED · CASA LAGUNA</div></div> : null}
      <Stage text="THE STAY" dark={false} />
    </>
  );
};

// ------------------------------------------------------------------ beat 5: itinerary + invites (cream)
const PlanBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const sendAt = c("invite", 120);
  const days = [
    { d: "DAY 1", items: ["Land by noon", "Team lunch by the pool"] },
    { d: "DAY 2", items: ["Strategy session", "Beach dinner 🍽"] },
    { d: "DAY 3", items: ["Brunch", "Fly home"] },
  ];
  const ys = [440, 690, 940];
  const string = smooth([[CX, 360], [440, 470], [640, 720], [440, 970], [CX, 1140]], 100);
  const accepted = Math.round(interpolate(frame, [sendAt + 10, sendAt + 40], [0, 12], clamp));
  return (
    <>
      <Ambient dark={false} />
      <Thread pts={string} p={interpolate(frame, [0, 60], [0, 1], { ...clamp, easing: EASE_IO })} color={C.charcoal} width={3} dark={false} />
      {days.map((dd, i) => (
        <div key={dd.d} style={{ position: "absolute", left: i % 2 ? 470 : 110, top: ys[i], width: 500, borderRadius: 24, background: "white", padding: "18px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)", ...pop(frame, 10 + i * 16) }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: "#77756D" }}>{dd.d}</div>
          {dd.items.map((it, k) => (
            <div key={it} style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.charcoal, marginTop: 6, opacity: frame >= 16 + i * 16 + k * 5 ? 1 : 0 }}>
              <span style={{ color: "#4C8C00" }}>●</span> {it}
            </div>
          ))}
        </div>
      ))}
      {frame >= sendAt ? (
        <div style={{ position: "absolute", left: 110, right: 110, top: 1180, borderRadius: 26, background: C.charcoal, padding: "18px 24px", display: "flex", alignItems: "center", gap: 18, ...pop(frame, sendAt) }}>
          <Logo name="gmail" size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.cream }}>Invite sent to 12 people</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {new Array(12).fill(0).map((_, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: i < accepted ? C.lime : "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: C.charcoal }}>{i < accepted ? "✓" : ""}</div>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.lime }}>{accepted}/12</div>
        </div>
      ) : null}
      <Stage text="THE PLAN" dark={false} />
    </>
  );
};

// ------------------------------------------------------------------ beat 6: the budget (back to charcoal)
const BudgetBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const back = interpolate(frame, [0, 14], [1, 0], { ...clamp, easing: EASE_IO });
  const parts = [
    { k: "Flights", v: 68400 },
    { k: "Villa · 2 nights", v: 60000 },
    { k: "Beach dinner", v: 24000 },
    { k: "Meals + cabs", v: 31600 },
  ];
  const total = parts.reduce((a, b) => a + b.v, 0);
  const g = interpolate(frame, [12, c("under", 90)], [0, 1], { ...clamp, easing: EASE });
  const okAt = c("OK.", 170);
  const W = 860;
  let acc = 0;
  return (
    <>
      <Ambient />
      <AbsoluteFill style={{ background: C.cream, opacity: back }} />
      <div style={{ position: "absolute", left: 110, top: 420, ...pop(frame, 8) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.grey }}>TOTAL COST</div>
        <div style={{ fontFamily: SERIF, fontSize: 130, lineHeight: 1, color: C.cream, fontVariantNumeric: "tabular-nums" }}>{fmt(total * g)}</div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 640, width: W, height: 70, borderRadius: 18, background: "#1C1C1C", overflow: "hidden" }}>
        {parts.map((p, i) => {
          const w = (p.v / 200000) * W * g;
          const x = (acc / 200000) * W * g;
          acc += p.v;
          return <div key={p.k} style={{ position: "absolute", left: x, top: 0, bottom: 0, width: w, background: [C.lime, "#C9F28A", "#E8FFB8", "#8FD13A"][i], borderRight: "2px solid #0A0A0A" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 110 + W - 2, top: 620, width: 4, height: 110, background: RED }} />
      <div style={{ position: "absolute", left: 110 + W - 210, top: 740, width: 210, textAlign: "right", fontFamily: MONO, fontWeight: 700, fontSize: 20, color: RED }}>LIMIT ₹2,00,000</div>
      <div style={{ position: "absolute", left: 110, top: 740, display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
        {parts.map((p, i) => (
          <div key={p.k} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 24, color: C.stone, opacity: frame >= 14 + i * 8 ? 1 : 0 }}>
            <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: [C.lime, "#C9F28A", "#E8FFB8", "#8FD13A"][i], marginRight: 10 }} />
            {p.k} · {fmt(p.v)}
          </div>
        ))}
      </div>
      {g > 0.98 ? <div style={{ position: "absolute", left: 0, right: 0, top: 940, display: "flex", justifyContent: "center", ...pop(frame, c("under", 90)) }}><div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: C.charcoal, background: C.lime, borderRadius: 18, padding: "10px 24px" }}>₹16,000 SAVED</div></div> : null}
      {frame >= okAt - 20 ? (
        <div style={{ position: "absolute", left: 160, right: 160, top: 1060, borderRadius: 24, background: "rgba(20,24,18,0.95)", border: "1.5px solid rgba(167,255,63,0.45)", padding: "18px 22px", ...pop(frame, okAt - 20) }}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: C.lime }}>WAITING FOR YOU</div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.cream, marginTop: 6 }}>Pay {fmt(total)} for Goa offsite?</div>
          <div style={{ marginTop: 14, textAlign: "center", borderRadius: 14, padding: "12px 0", fontFamily: BODY, fontWeight: 800, fontSize: 24, background: frame >= okAt ? C.lime : "rgba(167,255,63,0.15)", color: frame >= okAt ? C.charcoal : C.lime }}>{frame >= okAt ? "✓ Approved by you" : "Approve payment"}</div>
        </div>
      ) : null}
      <Stage text="THE BUDGET" at={6} />
    </>
  );
};

// ------------------------------------------------------------------ beat 7: sign-off orbs
const OrbBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const k = interpolate(frame, [0, D - 6], [0, 1], { ...clamp, easing: EASE_IO });
  return (
    <>
      <Ambient />
      {new Array(9).fill(0).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + frame / 18;
        const r = 360 * (1 - k) + 10;
        const s = 120 * (1 - k * 0.7) + random(`ob${i}`) * 40;
        return <div key={i} style={{ position: "absolute", left: CX + Math.cos(a) * r - s / 2, top: CY + Math.sin(a) * r * 0.8 - s / 2, width: s, height: s, borderRadius: "50%", background: [C.lime, "#E8FFB8", "#8FD13A"][i % 3], filter: "blur(26px)", opacity: 0.55 }} />;
      })}
      <div style={{ position: "absolute", left: CX - 12, top: CY - 12, width: 24, height: 24, borderRadius: "50%", background: "#F6FFE8", boxShadow: `0 0 ${40 + 80 * k}px rgba(167,255,63,0.8)`, opacity: k }} />
    </>
  );
};

export const AgentThreadScene: React.FC<SceneProps> = ({ data }) => {
  const c = cueOf(data);
  const b = data.beat as string;
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      {b === "goal" ? <GoalBeat c={c} /> : null}
      {b === "calendar" ? <CalendarBeat c={c} /> : null}
      {b === "flights" ? <FlightBeat c={c} /> : null}
      {b === "villas" ? <VillaBeat c={c} /> : null}
      {b === "plan" ? <PlanBeat c={c} /> : null}
      {b === "budget" ? <BudgetBeat c={c} /> : null}
      {b === "orbs" ? <OrbBeat /> : null}
    </AbsoluteFill>
  );
};

export const AGENT_THREAD_SCENES: Record<string, React.FC<SceneProps>> = { aThread: AgentThreadScene };
