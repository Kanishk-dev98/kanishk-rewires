// "Claude Duet" film (9:16, light). One continuous camera take: every beat lives on one big canvas, the camera
// whip-zooms between them with directional motion blur, and a lime signal thread (Duet) travels the whole path.
// Each beat is a pure function of the global frame, so nothing ever pops between scenes.
import React from "react";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadInstrumentItalic } from "@remotion/google-fonts/InstrumentSerif";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, SERIF } from "./brand";
import type { SceneProps } from "./scenes";

loadInstrumentItalic("italic", { weights: ["400"], subsets: ["latin"] });

export const INK = "#3E7A00";
export const MUTED = "#8A877E";
export const LINE = "#E4E0D5";
export const SHADOW = "0 34px 90px rgba(30,28,20,0.13), 0 3px 10px rgba(30,28,20,0.05)";
const M = 22; // camera move length (frames)

export type Cue = (name: string, fb: number) => number;
export type BeatProps = { f: number; D: number; c: Cue; g: number };

// ------------------------------------------------------------------ helpers
export const ez = (f: number, a: number, b: number, from = 0, to = 1, e = EASE) => interpolate(f, [a, b], [from, to], { ...clamp, easing: e });
export const rise = (f: number, at: number, dist = 34, dur = 16): React.CSSProperties => {
  const p = ez(f, at, at + dur);
  return { opacity: p, translate: `0 ${(1 - p) * dist}px`, filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined };
};
export const pop = (f: number, at: number, k = { damping: 13, stiffness: 170 }) => spring({ frame: f - at, fps: 30, config: k });
export const typed = (f: number, s: string, at: number, cps = 1.6) => s.slice(0, Math.max(0, Math.floor((f - at) * cps)));
export const Logo: React.FC<{ src: string; h: number; style?: React.CSSProperties }> = ({ src, h, style }) => <Img src={staticFile(`media/logos/${src}`)} style={{ height: h, width: "auto", ...style }} />;
export const card: React.CSSProperties = { position: "absolute", background: "white", border: `1px solid ${LINE}`, borderRadius: 30, boxShadow: SHADOW };
export const Tile: React.FC<{ size: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, children, style }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: "white", border: `1px solid ${LINE}`, boxShadow: "0 18px 44px rgba(30,28,20,0.12)", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>{children}</div>
);
export const Check: React.FC<{ p: number; size?: number; color?: string }> = ({ p, size = 34, color = C.lime }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: p > 0 ? color : "transparent", border: p > 0 ? "none" : `2px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "center", scale: String(0.6 + 0.4 * p) }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
      <path d="M4 12.5l5 5L20 6.5" fill="none" stroke={C.charcoal} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  </div>
);
export const Spinner: React.FC<{ g: number; size?: number }> = ({ g, size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ rotate: `${g * 14}deg` }}>
    <circle cx={12} cy={12} r={9} fill="none" stroke={LINE} strokeWidth={3} />
    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </svg>
);
export const Cursor: React.FC<{ x: number; y: number; press?: number }> = ({ x, y, press = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 20 }}>
    {press > 0 && press < 1 ? <div style={{ position: "absolute", left: -40 * press, top: -40 * press, width: 80 * press, height: 80 * press, borderRadius: "50%", border: `3px solid ${C.lime}`, opacity: 1 - press }} /> : null}
    <svg width={46} height={46} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))", scale: String(1 - 0.12 * Math.sin(Math.PI * Math.min(1, press))) }}>
      <path d="M4 2l15 9.5-6.6 1.4 3.9 7.3-2.9 1.5-3.9-7.3L4.6 18z" fill={C.charcoal} stroke="white" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  </div>
);
/** Figma-style selection box with corner handles, drawn on. */
export const Selection: React.FC<{ p: number; children: React.ReactNode; pad?: number }> = ({ p, children, pad = 14 }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    <span style={{ position: "absolute", left: -pad, right: -pad, top: 6, bottom: -2, background: `rgba(167,255,63,${0.55 * p})`, border: `3px solid rgba(10,10,10,${p})`, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }} />
    {[
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ].map(([x, y]) => (
      <span key={`${x}${y}`} style={{ position: "absolute", left: x ? undefined : -pad - 9, right: x ? -pad - 9 : undefined, top: y ? undefined : -3, bottom: y ? -11 : undefined, width: 18, height: 18, background: "white", border: `3px solid ${C.charcoal}`, opacity: p > 0.95 ? 1 : 0 }} />
    ))}
    <span style={{ position: "relative" }}>{children}</span>
  </span>
);
export const Icon: React.FC<{ kind: "send" | "pay" | "sign" | "delete" | "memory" | "skills" | "apps" | "cloud"; size: number; color?: string }> = ({ kind, size, color = C.charcoal }) => {
  const s = { fill: "none", stroke: color, strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {kind === "send" ? <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" {...s} /> : null}
      {kind === "pay" ? (
        <>
          <rect x={2.5} y={5} width={19} height={14} rx={2.5} {...s} />
          <path d="M2.5 9.5h19M6 15h4" {...s} />
        </>
      ) : null}
      {kind === "sign" ? <path d="M3 20c3-1 4-4 6-4s1 3 3 3 3-3 5-3M15 4l5 5-8 8H7v-5z" {...s} /> : null}
      {kind === "delete" ? <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" {...s} /> : null}
      {kind === "memory" ? (
        <>
          <rect x={4} y={3} width={16} height={18} rx={2.5} {...s} />
          <path d="M8 8h8M8 12h8M8 16h5" {...s} />
        </>
      ) : null}
      {kind === "skills" ? <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" {...s} /> : null}
      {kind === "apps" ? (
        <>
          <rect x={3.5} y={3.5} width={7} height={7} rx={1.8} {...s} />
          <rect x={13.5} y={3.5} width={7} height={7} rx={1.8} {...s} />
          <rect x={3.5} y={13.5} width={7} height={7} rx={1.8} {...s} />
          <rect x={13.5} y={13.5} width={7} height={7} rx={1.8} {...s} />
        </>
      ) : null}
      {kind === "cloud" ? <path d="M7 18h10a4 4 0 0 0 .6-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 18z" {...s} /> : null}
    </svg>
  );
};
export const Lock: React.FC<{ open: number; size: number }> = ({ open, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d={`M7.5 11V7.5a4.5 4.5 0 0 1 9 0V${11 - open * 3}`} fill="none" stroke={open > 0.5 ? INK : C.charcoal} strokeWidth={2} strokeLinecap="round" transform={`translate(0 ${-open * 2})`} />
    <rect x={5} y={11} width={14} height={10} rx={2.5} fill={open > 0.5 ? C.lime : C.charcoal} />
  </svg>
);

// ------------------------------------------------------------------ 0. hook: laptop closes, cloud keeps working
const Hook: React.FC<BeatProps> = ({ f, c, g }) => {
  const duet = c("duet", 52);
  const off = c("off", 167);
  const close = ez(f, off - 16, off + 4, 0, 1, EASE_IO);
  const sel = ez(f, duet + 2, duet + 16);
  const cloudIn = duet + 22;
  const tasks = ["Morning brief", "Unpaid invoices", "Meeting prep"];
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: 300, right: 60, color: C.charcoal }}>
        <div style={{ fontFamily: BODY, fontSize: 28, fontWeight: 600, color: MUTED, letterSpacing: 0.5, ...rise(f, 2, 16) }}>New from Anthropic</div>
        <div style={{ marginTop: 18, lineHeight: 1 }}>
          <span style={{ display: "inline-block", fontFamily: HEAD, fontWeight: 700, fontSize: 150, letterSpacing: -6, marginRight: 34, ...rise(f, 6, 50) }}>Claude</span>
          <span style={{ display: "inline-block", fontFamily: SERIF, fontStyle: "italic", fontSize: 176, letterSpacing: -2, ...rise(f, duet - 6, 50) }}>
            <Selection p={sel}>Duet</Selection>
          </span>
        </div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 96, letterSpacing: -3, marginTop: 12, ...rise(f, duet + 10, 40) }}>is here.</div>
      </div>
      {/* laptop, real CSS 3D: deck lies flat, lid hinges shut toward camera */}
      <div style={{ position: "absolute", left: 50, top: 860, width: 520, height: 470, perspective: 1500, perspectiveOrigin: "50% -20%", ...rise(f, 14, 60, 22) }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${14 - 6 * close}deg)` }}>
          <div style={{ position: "absolute", left: 20, top: 290, width: 480, height: 300, transformOrigin: "50% 0%", transform: "rotateX(90deg)", background: "linear-gradient(180deg,#E9E6DD,#D8D4C8)", borderRadius: 18, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>
            <div style={{ position: "absolute", left: 30, right: 30, top: 24, height: 150, borderRadius: 8, background: "repeating-linear-gradient(90deg,#CFCBBE 0 26px,transparent 26px 31px), repeating-linear-gradient(180deg,#CFCBBE 0 24px,transparent 24px 30px)", opacity: 0.8 }} />
            <div style={{ position: "absolute", left: 170, width: 140, top: 196, height: 84, borderRadius: 10, background: "#CFCBBE" }} />
          </div>
          <div style={{ position: "absolute", left: 30, top: 0, width: 460, height: 290, transformOrigin: "50% 100%", transform: `rotateX(${-12 - 78 * close}deg)`, transformStyle: "preserve-3d" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "#141513", padding: 14, backfaceVisibility: "hidden" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 8, background: `linear-gradient(160deg,#FBFAF6,#EEEBE2)`, opacity: 1 - close * 1.4, overflow: "hidden", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Logo src="claude.svg" h={26} />
                  <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 20, color: C.charcoal }}>Claude</div>
                </div>
                {[0.9, 0.7, 0.8, 0.5].map((w, i) => (
                  <div key={i} style={{ marginTop: 16, height: 12, width: `${w * 100}%`, borderRadius: 6, background: i === 1 ? "#E8FFB8" : "#E2DED3" }} />
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "linear-gradient(160deg,#E4E1D8,#CBC7BA)", transform: "rotateY(180deg)", backfaceVisibility: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.35)" }} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 450, height: 40, borderRadius: "50%", background: "radial-gradient(rgba(30,28,20,0.22), transparent 70%)" }} />
        <div style={{ position: "absolute", left: 200, top: 300, scale: String(pop(f, off + 4)), opacity: f > off + 4 ? 1 : 0 }}>
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, background: C.charcoal, color: C.cream, padding: "8px 22px", borderRadius: 12, letterSpacing: 2 }}>OFF</div>
        </div>
      </div>
      {/* the link from laptop to cloud: breaks when the laptop closes */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M520 1000 C 580 960, 600 960, 640 960" stroke={INK} strokeWidth={3} fill="none" strokeDasharray="6 9" strokeDashoffset={-g * 1.5} opacity={ez(f, cloudIn, cloudIn + 10) * (1 - close)} />
      </svg>
      <div style={{ ...card, left: 620, top: 860, width: 400, padding: "26px 26px 20px", ...rise(f, cloudIn, 40) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon kind="cloud" size={40} />
          <div>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal }}>Cloud computer</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: BODY, fontSize: 19, color: INK }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3BC14A", boxShadow: `0 0 0 ${4 + 3 * Math.sin(g / 5)}px rgba(59,193,74,0.18)` }} />
              Running
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: LINE, margin: "18px 0 8px" }} />
        {tasks.map((t, i) => {
          const done = off + 10 + i * 16;
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0" }}>
              {f >= done ? <Check p={ez(f, done, done + 8)} size={32} /> : f >= cloudIn + 10 + i * 6 ? <Spinner g={g} size={32} /> : <Check p={0} size={32} />}
              <div style={{ fontFamily: BODY, fontSize: 24, fontWeight: 600, color: f >= done ? C.charcoal : MUTED }}>{t}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 1. not a chatbot: bar morphs into the agent hub
const What: React.FC<BeatProps> = ({ f, c, g }) => {
  const agent = c("agent", 74);
  const m = ez(f, agent - 8, agent + 12, 0, 1, EASE_IO); // morph bar -> core
  const CX = 540;
  const CY = 760;
  const w = interpolate(m, [0, 1], [860, 220]);
  const h = interpolate(m, [0, 1], [124, 220]);
  const sats = [
    { logo: "gmail.svg", cue: c("email", 111), a: -90, hh: 52 },
    { logo: "google-calendar.svg", cue: c("calendar", 133), a: 0, hh: 64 },
    { logo: "slack.svg", cue: c("apps", 161), a: 180, hh: 60 },
    { logo: "stripe.svg", cue: c("apps", 161) + 6, a: 90, hh: 40 },
  ];
  const R = 330;
  const spin = g * 0.18;
  const hours = c("hours", 196);
  const needs = c("needs", 262);
  const sweepOn = ez(f, hours - 6, hours + 10);
  return (
    <>
      {/* radar sweep: the agent checking every few hours */}
      <div style={{ position: "absolute", left: CX - 420, top: CY - 420, width: 840, height: 840, borderRadius: "50%", opacity: sweepOn * 0.9, background: `conic-gradient(from ${g * 6}deg, rgba(167,255,63,0.0) 0deg, rgba(167,255,63,0.0) 290deg, rgba(167,255,63,0.42) 360deg)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#D9D6CC" strokeWidth={1.5} strokeDasharray="2 10" opacity={ez(f, agent, agent + 20)} />
        {sats.map((s) => {
          const a = ((s.a + spin) * Math.PI) / 180;
          const p = ez(f, s.cue, s.cue + 14);
          const x = CX + Math.cos(a) * R;
          const y = CY + Math.sin(a) * R;
          const pk = (g / 30 + s.a / 90) % 1;
          return (
            <g key={s.logo} opacity={p}>
              <line x1={CX} y1={CY} x2={CX + (x - CX) * p} y2={CY + (y - CY) * p} stroke={INK} strokeWidth={2} opacity={0.4} />
              <circle cx={x + (CX - x) * pk} cy={y + (CY - y) * pk} r={6} fill={INK} />
            </g>
          );
        })}
      </svg>
      {sats.map((s) => {
        const a = ((s.a + spin) * Math.PI) / 180;
        const p = pop(f, s.cue);
        return (
          <div key={s.logo} style={{ position: "absolute", left: CX + Math.cos(a) * R - 70, top: CY + Math.sin(a) * R - 70, scale: String(p), opacity: f >= s.cue ? 1 : 0 }}>
            <Tile size={140}>
              <Logo src={s.logo} h={s.hh} style={{ maxWidth: 100 }} />
            </Tile>
          </div>
        );
      })}
      {/* chat bar -> core */}
      <div style={{ position: "absolute", left: CX - w / 2, top: CY - h / 2, width: w, height: h, borderRadius: interpolate(m, [0, 1], [62, 58]), background: "white", border: m > 0.5 ? `3px solid ${C.lime}` : `1px solid ${LINE}`, boxShadow: m > 0.5 ? `0 0 0 ${14 + 4 * Math.sin(g / 8)}px rgba(167,255,63,0.2), ${SHADOW}` : SHADOW, overflow: "hidden", display: "flex", alignItems: "center", ...rise(f, 6, 40) }}>
        <div style={{ position: "absolute", left: 40, right: 110, fontFamily: BODY, fontSize: 32, color: f < 24 ? MUTED : C.charcoal, opacity: 1 - m * 2.5, whiteSpace: "nowrap" }}>{f < 24 ? "Ask anything" : typed(f, "What should I do today?", 24, 1.4)}</div>
        <div style={{ position: "absolute", right: 22, width: 76, height: 76, borderRadius: "50%", background: C.charcoal, opacity: 1 - m * 2.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={34} height={34} viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke={C.cream} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "center", opacity: ez(m, 0.5, 1), scale: String(interpolate(m, [0.5, 1], [0.6, 1], clamp)) }}>
          <Logo src="claude.svg" h={120} />
        </div>
      </div>
      {/* strike-through: "not a chatbot" */}
      <div style={{ position: "absolute", left: CX - 450, top: CY - 2, height: 5, width: 900 * ez(f, c("chatbot", 15) + 30, c("chatbot", 15) + 44), background: C.charcoal, borderRadius: 3, opacity: 1 - m * 3 }} />
      {/* time-lapse clock on the core */}
      <div style={{ position: "absolute", left: CX + 70, top: CY - 150, opacity: sweepOn, scale: String(0.6 + 0.4 * sweepOn) }}>
        <svg width={76} height={76} viewBox="0 0 40 40" style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.15))" }}>
          <circle cx={20} cy={20} r={18} fill="white" stroke={LINE} />
          <line x1={20} y1={20} x2={20 + 9 * Math.sin(g / 3)} y2={20 - 9 * Math.cos(g / 3)} stroke={C.charcoal} strokeWidth={2.4} strokeLinecap="round" />
          <line x1={20} y1={20} x2={20 + 6 * Math.sin(g / 36)} y2={20 - 6 * Math.cos(g / 36)} stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </svg>
      </div>
      {/* it comes to you */}
      <div style={{ ...card, left: 90, right: 90, top: 1190, padding: "22px 26px", display: "flex", gap: 18, ...rise(f, needs - 4, 60, 18) }}>
        <Tile size={66}>
          <Logo src="claude.svg" h={40} />
        </Tile>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontSize: 20, color: MUTED }}>
            <span style={{ fontWeight: 700, color: C.charcoal }}>Duet · needs you</span>
            <span>now</span>
          </div>
          <div style={{ fontFamily: BODY, fontSize: 25, lineHeight: 1.35, color: C.charcoal, marginTop: 6 }}>Invoice #204 is 14 days overdue. Want me to draft a reminder?</div>
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 2. morning brief: 3D phone at sunrise
const Brief: React.FC<BeatProps> = ({ f, c, g }) => {
  const morning = c("morning", 12);
  const enter = ez(f, 4, 34, 0, 1, EASE);
  const rows = [
    { dot: "#E5484D", k: "Urgent", t: "Contract renewal due at 5 PM", cue: c("urgent", 95) },
    { dot: "#F5A524", k: "Waiting", t: "Riya hasn't replied in 3 days", cue: c("waiting", 121) },
    { dot: C.lime, k: "Prepared", t: "Q4 board deck, first draft", cue: c("prepared", 158) },
  ];
  const sun = ez(f, morning - 10, morning + 50);
  const ry = interpolate(enter, [0, 1], [38, -10]) + Math.sin(g / 45) * 3;
  const rx = interpolate(enter, [0, 1], [14, 5]);
  return (
    <>
      <div style={{ position: "absolute", left: 540 - 380, top: interpolate(sun, [0, 1], [1100, 520]), width: 760, height: 760, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,255,184,0.95) 0%, rgba(232,255,184,0.5) 40%, rgba(246,244,237,0) 70%)", opacity: sun }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 1080, height: 2, background: `linear-gradient(90deg, transparent, ${LINE}, transparent)`, opacity: sun }} />
      <div style={{ position: "absolute", left: 540 - 225, top: 300, width: 450, height: 920, perspective: 1800, opacity: enter, translate: `0 ${(1 - enter) * 140}px` }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
          {/* thickness */}
          <div style={{ position: "absolute", right: -11, top: 40, width: 22, height: 840, background: "linear-gradient(90deg,#3A3B37,#1A1B19)", transform: "rotateY(90deg)", borderRadius: 8 }} />
          <div style={{ position: "absolute", left: -11, top: 40, width: 22, height: 840, background: "linear-gradient(90deg,#1A1B19,#3A3B37)", transform: "rotateY(-90deg)", borderRadius: 8 }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 70, background: "#161715", padding: 14, boxShadow: "0 60px 120px rgba(30,28,20,0.28)" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 58, background: "#FBFAF6", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: "50%", top: 14, width: 120, height: 34, marginLeft: -60, borderRadius: 20, background: "#161715" }} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 34px 0", fontFamily: BODY, fontWeight: 700, fontSize: 21, color: C.charcoal }}>
                <span>{f < morning + 8 ? "7:59" : "8:00"}</span>
                <span style={{ letterSpacing: 2 }}>●●●</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "40px 30px 0" }}>
                <Logo src="claude.svg" h={40} />
                <div>
                  <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal }}>Duet</div>
                  <div style={{ fontFamily: BODY, fontSize: 17, color: MUTED }}>Today</div>
                </div>
              </div>
              <div style={{ margin: "24px 24px 0", background: "white", border: `1px solid ${LINE}`, borderRadius: 24, padding: "20px 20px 10px", ...rise(f, morning + 4, 24) }}>
                <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 23, color: C.charcoal, minHeight: 32 }}>{typed(f, "Morning! 3 things for today:", morning + 8, 1.4)}</div>
                {rows.map((r) => (
                  <div key={r.k} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 0", borderTop: `1px solid ${LINE}`, marginTop: 10, ...rise(f, r.cue - 4, 18, 12) }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: r.dot, marginTop: 8, boxShadow: `0 0 0 6px ${r.dot}33` }} />
                    <div>
                      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 17, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>{r.k}</div>
                      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 22, lineHeight: 1.3, color: C.charcoal }}>{r.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* glass glare */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 70, background: `linear-gradient(${110 + ry * 2}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 60%)`, pointerEvents: "none" }} />
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 3. it does the work: depth stack of real outputs
const Work: React.FC<BeatProps> = ({ f, c, g }) => {
  const ats = [Math.min(c("follow", 50), 18), c("prep", 85), c("decks", 125), c("dash", 137) + 6];
  const edit = c("edit", 184);
  const n = ats.filter((a) => f >= a - 6).length;
  const W = 840;
  const H = 520;
  const layer = (i: number): React.CSSProperties => {
    const p = ez(f, ats[i] - 6, ats[i] + 12, 0, 1, EASE);
    // depth = how many newer cards sit in front, smoothly
    const depth = ats.slice(i + 1).reduce((a, t) => a + ez(f, t - 6, t + 12), 0);
    return {
      ...card,
      left: 540 - W / 2,
      top: 640 - H / 2 + (1 - p) * 220,
      width: W,
      height: H,
      opacity: p * (1 - depth * 0.18),
      scale: String((1 - depth * 0.075) * (0.9 + 0.1 * p)),
      translate: `0 ${-depth * 92}px`,
      filter: depth > 0.05 ? `blur(${depth * 1.6}px)` : p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
      overflow: "hidden",
      zIndex: i,
    };
  };
  const head = (logo: string, title: string, tag: string, h = 34) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 28px", borderBottom: `1px solid ${LINE}` }}>
      <Logo src={logo} h={h} />
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal, flex: 1 }}>{title}</div>
      <div style={{ fontFamily: BODY, fontSize: 19, color: MUTED }}>{tag}</div>
    </div>
  );
  const kpis = [
    { k: "Revenue", v: 48.2, fmt: (x: number) => `$${x.toFixed(1)}K` },
    { k: "Orders", v: 312, fmt: (x: number) => `${Math.round(x)}` },
    { k: "Churn", v: 2.1, fmt: (x: number) => `${x.toFixed(1)}%` },
  ];
  const chart = ez(f, ats[3] + 8, ats[3] + 40, 0, 1, EASE_IO);
  const pts = [0.62, 0.55, 0.6, 0.46, 0.5, 0.36, 0.4, 0.24, 0.28, 0.14];
  const path = pts.map((y, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * 760},${y * 200}`).join(" ");
  const press = ez(f, edit + 6, edit + 20);
  return (
    <>
      <div style={layer(0)}>
        {head("gmail.svg", "Follow-up", "Draft · not sent", 30)}
        <div style={{ padding: "22px 28px", fontFamily: BODY, fontSize: 24, color: C.charcoal, lineHeight: 1.5 }}>
          <div style={{ color: MUTED }}>To: Riya Mehta</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>Quick nudge on the renewal</div>
          <div style={{ marginTop: 12 }}>{typed(f, "Hi Riya, just checking you saw the renewal terms. Happy to walk you through them on a quick call this week?", ats[0] + 6, 2.2)}</div>
        </div>
      </div>
      <div style={layer(1)}>
        {head("google-calendar.svg", "Meeting prep", "Thu · 4:00 PM", 34)}
        <div style={{ padding: "18px 28px" }}>
          {["Last call: pricing was the concern", "Their Q3 revenue grew 18%", "Ask: move to an annual plan"].map((t, i) => (
            <div key={t} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: i < 2 ? `1px solid ${LINE}` : undefined, ...rise(f, ats[1] + 6 + i * 6, 14, 10) }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: INK }} />
              <div style={{ fontFamily: BODY, fontSize: 25, color: C.charcoal }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={layer(2)}>
        {head("claude.svg", "Q4 board deck", "12 slides", 32)}
        <div style={{ position: "relative", height: H - 80 }}>
          {[-1, 0, 1].map((k, i) => {
            const p = ez(f, ats[2] + 4 + i * 3, ats[2] + 20 + i * 3, 0, 1, EASE);
            return (
              <div key={k} style={{ position: "absolute", left: W / 2 - 170, top: 70, width: 340, height: 220, borderRadius: 14, background: k === 0 ? "#FBFAF6" : "#F1EEE5", border: `1px solid ${LINE}`, boxShadow: "0 16px 40px rgba(30,28,20,0.12)", transformOrigin: "50% 140%", rotate: `${k * 11 * p}deg`, translate: `${k * 150 * p}px ${Math.abs(k) * 16 * p}px`, zIndex: k === 0 ? 2 : 1, padding: 20 }}>
                <div style={{ height: 14, width: "60%", borderRadius: 7, background: C.charcoal, opacity: 0.85 }} />
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120, marginTop: 30 }}>
                  {[0.4, 0.65, 0.5, 0.9].map((h, j) => (
                    <div key={j} style={{ flex: 1, height: `${h * 100 * ez(f, ats[2] + 14 + j * 3, ats[2] + 30 + j * 3)}%`, borderRadius: 4, background: j === 3 ? C.lime : "#D9D6CC" }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...layer(3), border: press > 0 ? `3px solid ${C.lime}` : `1px solid ${LINE}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 28px", borderBottom: `1px solid ${LINE}` }}>
          <Logo src="stripe.svg" h={30} />
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal, flex: 1 }}>
            Weekly dashboard{f > edit + 20 ? <span style={{ color: INK }}>{typed(f, " · v2", edit + 20, 0.6)}</span> : null}
            {press > 0 && Math.floor(g / 8) % 2 === 0 ? <span style={{ color: INK }}>|</span> : null}
          </div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 19, padding: "8px 18px", borderRadius: 10, background: press > 0 ? C.lime : "#F1EEE5", color: C.charcoal }}>Edit</div>
        </div>
        <div style={{ display: "flex", padding: "22px 28px 0", gap: 18 }}>
          {kpis.map((k) => (
            <div key={k.k} style={{ flex: 1 }}>
              <div style={{ fontFamily: BODY, fontSize: 19, color: MUTED }}>{k.k}</div>
              <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 54, letterSpacing: -2, color: C.charcoal, fontVariantNumeric: "tabular-nums" }}>{k.fmt(k.v * ez(f, ats[3], ats[3] + 30))}</div>
            </div>
          ))}
        </div>
        <svg width={760} height={210} style={{ marginLeft: 40, marginTop: 14, overflow: "visible" }}>
          <defs>
            <linearGradient id="duetArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={C.lime} stopOpacity="0.45" />
              <stop offset="1" stopColor={C.lime} stopOpacity="0" />
            </linearGradient>
            <clipPath id="duetClip">
              <rect x={0} y={-10} width={760 * chart} height={240} />
            </clipPath>
          </defs>
          <g clipPath="url(#duetClip)">
            <path d={`${path} L760,210 L0,210 Z`} fill="url(#duetArea)" />
            <path d={path} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          </g>
          <circle cx={760 * chart} cy={interpolate(chart, pts.map((_, i) => i / (pts.length - 1)), pts.map((y) => y * 200))} r={8} fill={INK} opacity={chart > 0 && chart < 1 ? 1 : 0} />
        </svg>
      </div>
      {f > edit - 16 ? <Cursor x={interpolate(ez(f, edit - 16, edit + 6, 0, 1, EASE_IO), [0, 1], [900, 870])} y={interpolate(ez(f, edit - 16, edit + 6, 0, 1, EASE_IO), [0, 1], [1100, 640 - H / 2 + 34])} press={press} /> : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: BODY, fontSize: 22, color: MUTED, opacity: n >= 4 ? ez(f, ats[3] + 20, ats[3] + 34) : 0 }}>
        Illustrative example
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 4. safety: four actions locked, one approval
const Safety: React.FC<BeatProps> = ({ f, c }) => {
  const acts: { k: "send" | "pay" | "sign" | "delete"; label: string; cue: number }[] = [
    { k: "send", label: "Send", cue: c("sends", 18) },
    { k: "pay", label: "Pay", cue: c("pays", 42) },
    { k: "sign", label: "Sign", cue: c("signs", 68) },
    { k: "delete", label: "Delete", cue: c("deletes", 89) },
  ];
  const ok = c("ok", 134);
  const press = ez(f, ok + 2, ok + 16);
  const unlock = ez(f, ok + 8, ok + 20, 0, 1, EASE);
  const cur = ez(f, ok - 22, ok + 2, 0, 1, EASE_IO);
  return (
    <>
      {acts.map((a, i) => {
        const x = i % 2 ? 580 : 100;
        const y = i < 2 ? 330 : 690;
        const p = pop(f, a.cue - 4);
        const lockAt = a.cue + 8;
        const lp = pop(f, lockAt, { damping: 9, stiffness: 220 });
        const isOpen = i === 0 ? unlock : 0;
        return (
          <div key={a.k} style={{ ...card, left: x, top: y, width: 400, height: 320, scale: String(0.85 + 0.15 * p), opacity: Math.min(1, p * 1.4), border: isOpen > 0.5 ? `3px solid ${C.lime}` : `1px solid ${LINE}`, boxShadow: isOpen > 0.5 ? `0 0 0 12px rgba(167,255,63,0.22), ${SHADOW}` : SHADOW }}>
            <div style={{ position: "absolute", left: 40, top: 46, opacity: f >= lockAt && isOpen < 0.5 ? 0.35 : 1 }}>
              <Icon kind={a.k} size={110} color={C.charcoal} />
            </div>
            <div style={{ position: "absolute", left: 44, bottom: 40, fontFamily: HEAD, fontWeight: 700, fontSize: 52, letterSpacing: -1.5, color: f >= lockAt && isOpen < 0.5 ? MUTED : C.charcoal }}>{a.label}</div>
            <div style={{ position: "absolute", right: 30, top: 30 - (1 - lp) * 80, opacity: f >= lockAt ? 1 : 0 }}>
              <Lock open={isOpen} size={72} />
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center", ...rise(f, ok - 26, 30) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, background: "white", border: `1px solid ${LINE}`, borderRadius: 26, padding: "18px 20px 18px 30px", boxShadow: SHADOW }}>
          <div style={{ fontFamily: BODY, fontSize: 27, color: C.charcoal }}>Send this follow-up to Riya?</div>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 26, padding: "14px 28px", borderRadius: 16, background: press > 0 ? C.lime : C.charcoal, color: press > 0 ? C.charcoal : C.cream }}>{press > 0 ? "Approved" : "Approve"}</div>
        </div>
      </div>
      {f > ok - 22 ? <Cursor x={interpolate(cur, [0, 1], [1000, 860])} y={interpolate(cur, [0, 1], [1400, 1140])} press={press} /> : null}
    </>
  );
};

// ------------------------------------------------------------------ 5. the rivals on a launch timeline
const AGENTS = [
  { name: "Grok Bot", by: "xAI", logo: "xai.svg", date: "Aug 11", price: 30, pre: "$", post: "", sub: "X subscription", cueKey: "grok" },
  { name: "Muse", by: "Meta", logo: "meta.svg", date: "Sep 8", price: 0, pre: "", post: "", sub: "Personal errands", cueKey: "muse" },
  { name: "Dots", by: "OpenAI", logo: "openai.svg", date: "Sep 29", price: 100, pre: "$", post: "", sub: "ChatGPT Pro", cueKey: "dots" },
  { name: "Duet", by: "Anthropic", logo: "claude.svg", date: "Oct 21", price: 20, pre: "$", post: "", sub: "In Claude Pro", cueKey: "duet" },
];
const AgentCard: React.FC<{ a: (typeof AGENTS)[number]; f: number; at: number; w: number; ghost?: boolean; showPrice?: boolean }> = ({ a, f, at, w, ghost, showPrice = true }) => {
  const n = interpolate(f, [at + 4, at + 26], [0, a.price], { ...clamp, easing: EASE });
  return (
    <div style={{ width: w, height: 400, borderRadius: 28, background: ghost ? "transparent" : "white", border: ghost ? `2px dashed #CFCBBE` : `1px solid ${LINE}`, boxShadow: ghost ? "none" : SHADOW, padding: "28px 22px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ height: 76, display: "flex", alignItems: "center", opacity: ghost ? 0.35 : 1 }}>
        <Logo src={a.logo} h={a.logo === "meta.svg" ? 44 : 66} style={{ maxWidth: 110 }} />
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.charcoal, marginTop: 14, opacity: ghost ? 0.4 : 1 }}>{a.name}</div>
      <div style={{ fontFamily: BODY, fontSize: 20, color: MUTED }}>{a.by}</div>
      <div style={{ width: "70%", height: 1, background: LINE, margin: "20px 0 14px" }} />
      {showPrice && !ghost ? (
        <>
          <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 64, letterSpacing: -2.5, color: C.charcoal, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{a.price === 0 ? "Free" : `${a.pre}${Math.round(n)}`}</div>
          <div style={{ fontFamily: BODY, fontSize: 19, color: MUTED, marginTop: 10 }}>{a.price === 0 ? a.sub : `per month · ${a.sub}`}</div>
        </>
      ) : (
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 56, color: "#CFCBBE" }}>?</div>
      )}
    </div>
  );
};
const Rivals: React.FC<BeatProps> = ({ f, c, g }) => {
  const W = 222;
  const xs = [60, 300, 540, 780];
  const lineP = ez(f, 6, 40, 0, 1, EASE_IO);
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 330, fontFamily: BODY, fontWeight: 600, fontSize: 28, color: MUTED, ...rise(f, 4, 16) }}>Always-on AI agents, 2026</div>
      {AGENTS.map((a, i) => {
        const ghost = a.cueKey === "duet";
        const at = ghost ? 30 : c(a.cueKey, 60 + i * 80);
        const p = pop(f, at - 6, { damping: 15, stiffness: 140 });
        const early = rise(f, 6 + i * 4, 30);
        const filled = !ghost && f >= at - 6;
        return (
          <React.Fragment key={a.name}>
            <div style={{ position: "absolute", left: xs[i], top: 430, ...early, opacity: (early.opacity as number) * (filled ? 1 - p : 1) }}>
              <AgentCard a={a} f={f} at={at} w={W} ghost />
            </div>
            {filled ? (
              <div style={{ position: "absolute", left: xs[i], top: 430 + (1 - p) * -260, opacity: Math.min(1, p * 1.5), rotate: `${(1 - p) * (i % 2 ? 6 : -6)}deg` }}>
                <AgentCard a={a} f={f} at={at} w={W} />
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={60} y1={930} x2={60 + 960 * lineP} y2={930} stroke={C.charcoal} strokeWidth={2} opacity={0.5} />
        {AGENTS.map((a, i) => {
          const ghost = a.cueKey === "duet";
          const at = ghost ? 30 : c(a.cueKey, 60 + i * 80);
          const cx = xs[i] + W / 2;
          const ring = ez(f, at + 4, at + 30);
          return (
            <g key={a.name} opacity={f >= at ? 1 : 0}>
              <circle cx={cx} cy={930} r={10} fill={ghost ? "white" : C.charcoal} stroke={C.charcoal} strokeWidth={2} />
              {!ghost ? <circle cx={cx} cy={930} r={10 + 40 * ring} fill="none" stroke={INK} strokeWidth={2} opacity={1 - ring} /> : <circle cx={cx} cy={930} r={16 + 3 * Math.sin(g / 6)} fill="none" stroke={INK} strokeWidth={2} opacity={0.6} />}
            </g>
          );
        })}
      </svg>
      {AGENTS.map((a, i) => {
        const ghost = a.cueKey === "duet";
        const at = ghost ? 30 : c(a.cueKey, 60 + i * 80);
        return (
          <div key={a.name} style={{ position: "absolute", left: xs[i], width: W, top: 960, textAlign: "center", fontFamily: BODY, fontWeight: 600, fontSize: 24, color: ghost ? INK : C.charcoal, ...rise(f, at + 4, 12) }}>
            {a.date}
          </div>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ 6. why it's best: Pro plan card, your Claude flows in
const Best: React.FC<BeatProps> = ({ f, c }) => {
  const pro = c("pro", 49);
  const price = c("price", 73);
  const flip = ez(f, Math.min(pro - 14, 8), Math.min(pro - 14, 8) + 22, 0, 1, EASE);
  const hl = ez(f, price + 12, price + 28, 0, 1, EASE_IO);
  const tiles = [
    { k: "memory" as const, label: "Memory", cue: c("memory", 153), x: 110 },
    { k: "skills" as const, label: "Skills", cue: c("skills", 177), x: 400 },
    { k: "apps" as const, label: "Apps", cue: c("apps", 220), x: 690 },
  ];
  const rowY = 700; // the Duet row inside the plan card
  const arrived = tiles.filter((t) => f >= t.cue + 26).length;
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 300, width: 800, perspective: 1600 }}>
        <div style={{ ...card, position: "relative", padding: "34px 40px 26px", transform: `rotateY(${(1 - flip) * 70}deg)`, opacity: flip, transformOrigin: "50% 50%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo src="claude.svg" h={44} />
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 34, color: C.charcoal }}>Claude Pro</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 18 }}>
            <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 150, letterSpacing: -7, lineHeight: 1, color: C.charcoal, fontVariantNumeric: "tabular-nums", transformOrigin: "0 80%", scale: String(1 + 0.12 * Math.sin(Math.PI * ez(f, price - 2, price + 14))) }}>$20</div>
            <div style={{ fontFamily: BODY, fontSize: 30, color: MUTED }}>/ month</div>
          </div>
          <div style={{ height: 1, background: LINE, margin: "24px 0 6px" }} />
          {["Claude chat", "Claude Code", "Claude Duet"].map((t, i) => {
            const isDuet = i === 2;
            return (
              <div key={t} style={{ position: "relative", display: "flex", alignItems: "center", gap: 16, padding: "16px 12px", marginLeft: -12, marginRight: -12, borderRadius: 14 }}>
                {isDuet ? <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: C.lime, opacity: 0.55, clipPath: `inset(0 ${(1 - hl) * 100}% 0 0)`, boxShadow: arrived ? `0 0 0 ${arrived * 3}px rgba(167,255,63,0.25)` : undefined }} /> : null}
                <div style={{ position: "relative" }}>
                  <Check p={ez(f, price + i * 5, price + 8 + i * 5)} size={34} color={isDuet ? C.charcoal : C.lime} />
                </div>
                <div style={{ position: "relative", fontFamily: BODY, fontWeight: isDuet ? 800 : 600, fontSize: 30, color: C.charcoal, flex: 1 }}>{t}</div>
                {isDuet ? (
                  <div style={{ position: "relative", display: "flex", gap: 8 }}>
                    {tiles.map((tl, j) => (
                      <div key={tl.k} style={{ width: 44, height: 44, borderRadius: 12, background: "white", display: "flex", alignItems: "center", justifyContent: "center", scale: String(pop(f, tl.cue + 26)), opacity: j < arrived ? 1 : 0 }}>
                        <Icon kind={tl.k} size={28} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 1010, fontFamily: BODY, fontWeight: 600, fontSize: 26, color: MUTED, ...rise(f, c("knows", 122), 14), opacity: ez(f, c("knows", 122), c("knows", 122) + 14) * (1 - ez(f, c("apps", 220) + 20, c("apps", 220) + 32)) }}>Your Claude</div>
      {tiles.map((t) => {
        const appear = pop(f, t.cue - 4);
        const fly = ez(f, t.cue + 10, t.cue + 28, 0, 1, EASE_IO);
        const sx = t.x;
        const sy = 1060;
        const tx = 540 + 150 + tiles.indexOf(t) * 52 - 140;
        const ty = rowY + 16;
        const x = interpolate(fly, [0, 1], [sx, tx]);
        const y = interpolate(fly, [0, 1], [sy, ty]) - Math.sin(Math.PI * fly) * 160;
        const s = interpolate(fly, [0, 1], [1, 0.2]);
        return (
          <div key={t.k} style={{ position: "absolute", left: x, top: y, width: 280, height: 170, transformOrigin: "0 0", scale: String(s * (0.8 + 0.2 * appear)), opacity: f < t.cue - 4 ? 0 : fly > 0.96 ? 0 : 1 }}>
            <div style={{ ...card, position: "relative", width: 280, height: 170, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, borderRadius: 26 }}>
              <Icon kind={t.k} size={58} />
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.charcoal }}>{t.label}</div>
            </div>
          </div>
        );
      })}
      {/* trail sparks on each flight */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {tiles.map((t) => {
          const fly = ez(f, t.cue + 10, t.cue + 28, 0, 1, EASE_IO);
          if (fly <= 0 || fly >= 1) return null;
          const tx = 540 + 150 + tiles.indexOf(t) * 52 - 140 + 20;
          return [0, 0.06, 0.12, 0.18].map((d) => {
            const q = Math.max(0, fly - d);
            const x = interpolate(q, [0, 1], [t.x + 140, tx]);
            const y = interpolate(q, [0, 1], [1145, rowY + 36]) - Math.sin(Math.PI * q) * 160;
            return <circle key={`${t.k}${d}`} cx={x} cy={y} r={7 - d * 25} fill={INK} opacity={0.7 - d * 3} />;
          });
        })}
      </svg>
    </>
  );
};

// ------------------------------------------------------------------ 7. setup: three panels, camera pans inside the beat
const Setup: React.FC<BeatProps> = ({ f, c, g }) => {
  const wl = c("waitlist", 44);
  const email = c("email", 112);
  const invite = c("invite", 142);
  const open = c("open", 177);
  const job = c("job", 271);
  const apps = c("apps", 305);
  const pan = ez(f, invite - 14, invite + 4, 0, 1, EASE_IO) + ez(f, job - 22, job - 4, 0, 1, EASE_IO);
  const panBlur = Math.sin(Math.PI * (pan % 1)) * (pan % 1 > 0 ? 6 : 0);
  const joined = ez(f, email + 2, email + 14);
  const tap = ez(f, open + 2, open + 16);
  const dest = pop(f, open + 10);
  const toggles = [
    { logo: "stripe.svg", name: "Stripe", on: true, h: 30 },
    { logo: "gmail.svg", name: "Gmail", on: true, h: 30 },
    { logo: "google-calendar.svg", name: "Calendar", on: false, h: 36 },
    { logo: "slack.svg", name: "Slack", on: false, h: 34 },
    { logo: "hubspot.svg", name: "HubSpot", on: false, h: 24 },
  ];
  const steps = ["Join", "Invite", "First job"];
  const active = Math.round(pan);
  return (
    <>
      {/* step rail */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 300, display: "flex", gap: 14, ...rise(f, 4, 14) }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{ height: 6, borderRadius: 3, background: i <= active ? C.charcoal : LINE }} />
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: i === active ? C.charcoal : MUTED, marginTop: 10 }}>
              {i + 1}. {s}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 3240, height: 1920, translate: `${-pan * 1080}px 0`, filter: panBlur > 0.3 ? `blur(${panBlur}px)` : undefined }}>
        {/* A: waitlist */}
        <div style={{ ...card, left: 90, top: 440, width: 900, height: 640, overflow: "hidden", ...rise(f, 6, 40) }}>
          <div style={{ height: 60, background: "#F3F1EA", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 10, padding: "0 22px" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((cl) => (
              <div key={cl} style={{ width: 13, height: 13, borderRadius: "50%", background: cl }} />
            ))}
            <div style={{ marginLeft: 16, flex: 1, height: 36, borderRadius: 10, background: "white", border: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 16px", fontFamily: BODY, fontSize: 20, color: MUTED }}>claude.com/product/claude-duet</div>
          </div>
          <div style={{ padding: "50px 60px" }}>
            <Logo src="claude.svg" h={56} />
            <div style={{ fontFamily: SERIF, fontSize: 76, color: C.charcoal, marginTop: 14, lineHeight: 1 }}>Claude Duet</div>
            <div style={{ fontFamily: BODY, fontSize: 24, color: MUTED, marginTop: 10 }}>Research preview · Join the waitlist</div>
            <div style={{ marginTop: 40, height: 84, borderRadius: 16, border: `2px solid ${f > wl ? C.charcoal : LINE}`, display: "flex", alignItems: "center", padding: "0 24px", fontFamily: BODY, fontSize: 30, color: C.charcoal }}>
              {typed(f, "you@yourcompany.com", wl + 8, 0.45) || <span style={{ color: MUTED }}>Your Claude email</span>}
              {f > wl && f < email && Math.floor(g / 8) % 2 === 0 ? <span style={{ color: INK }}>|</span> : null}
            </div>
            <div style={{ marginTop: 18, height: 84, borderRadius: 16, background: joined > 0 ? C.lime : C.charcoal, color: joined > 0 ? C.charcoal : C.cream, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: BODY, fontWeight: 800, fontSize: 30, scale: String(1 - 0.04 * Math.sin(Math.PI * joined)) }}>
              {joined > 0 ? "You're on the waitlist" : "Join the waitlist"}
              {joined > 0 ? <Check p={joined} size={36} color="white" /> : null}
            </div>
          </div>
        </div>
        {/* B: invite lands, open the app or the web */}
        <div style={{ ...card, left: 1080 + 90, top: 470, width: 900, padding: "30px 34px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo src="gmail.svg" h={40} />
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal, flex: 1 }}>Inbox</div>
            <div style={{ fontFamily: BODY, fontSize: 20, color: MUTED }}>now</div>
          </div>
          <div style={{ marginTop: 22, padding: "22px 24px", borderRadius: 20, background: "#FBFAF6", border: `1px solid ${LINE}`, ...rise(f, invite, 20) }}>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: MUTED }}>Anthropic</div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 32, color: C.charcoal, marginTop: 4 }}>Your Claude Duet invite is here</div>
            <div style={{ display: "inline-block", marginTop: 18, padding: "14px 26px", borderRadius: 14, background: tap > 0 ? C.lime : C.charcoal, color: tap > 0 ? C.charcoal : C.cream, fontFamily: BODY, fontWeight: 800, fontSize: 24 }}>Get started</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 1080 + 150, top: 850, display: "flex", gap: 40, alignItems: "center", opacity: f > open + 8 ? 1 : 0 }}>
          <div style={{ textAlign: "center", scale: String(dest) }}>
            <Tile size={170} style={{ borderRadius: 44 }}>
              <Logo src="claude.svg" h={96} />
            </Tile>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal, marginTop: 14 }}>Duet app</div>
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 54, color: MUTED, opacity: dest }}>or</div>
          <div style={{ textAlign: "center", scale: String(pop(f, open + 18)) }}>
            <div style={{ width: 360, height: 170, borderRadius: 26, background: "white", border: `1px solid ${LINE}`, boxShadow: "0 18px 44px rgba(30,28,20,0.12)", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 44, background: "#F3F1EA", borderRadius: "26px 26px 0 0", display: "flex", alignItems: "center", padding: "0 18px", gap: 8 }}>
                <Logo src="claude.svg" h={20} />
                <div style={{ fontFamily: BODY, fontSize: 18, color: MUTED }}>claude.ai</div>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 48, color: C.charcoal }}>Duet</div>
            </div>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal, marginTop: 14 }}>On the web</div>
          </div>
        </div>
        {f > open - 20 && f < open + 30 ? <Cursor x={1080 + interpolate(ez(f, open - 20, open, 0, 1, EASE_IO), [0, 1], [900, 240])} y={interpolate(ez(f, open - 20, open, 0, 1, EASE_IO), [0, 1], [1100, 700])} press={tap} /> : null}
        {/* C: one job, minimum apps */}
        <div style={{ ...card, left: 2160 + 90, top: 440, width: 900, padding: "30px 36px" }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: MUTED }}>Duet's first job</div>
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 52, letterSpacing: -1.5, color: C.charcoal, marginTop: 6, minHeight: 64 }}>
            {typed(f, "Chase overdue invoices", job - 4, 1.2)}
            {f > job - 4 && f < job + 30 && Math.floor(g / 8) % 2 === 0 ? <span style={{ color: INK }}>|</span> : null}
          </div>
          <div style={{ height: 1, background: LINE, margin: "24px 0 6px" }} />
          {toggles.map((t, i) => {
            const on = t.on ? ez(f, apps - 6 + i * 6, apps + 4 + i * 6) : 0;
            return (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 18, padding: "15px 0", borderBottom: i < toggles.length - 1 ? `1px solid ${LINE}` : undefined, opacity: t.on ? 1 : interpolate(ez(f, apps, apps + 14), [0, 1], [1, 0.45]) }}>
                <div style={{ width: 120, display: "flex" }}>
                  <Logo src={t.logo} h={t.h} style={{ maxWidth: 110 }} />
                </div>
                <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 28, color: C.charcoal, flex: 1 }}>{t.name}</div>
                <div style={{ width: 84, height: 48, borderRadius: 24, background: on > 0.5 ? C.lime : "#E2DED3", position: "relative" }}>
                  <div style={{ position: "absolute", top: 5, left: 5 + on * 36, width: 38, height: 38, borderRadius: "50%", background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 8. the catch: halftone US map, plan cards, usage meter
const Catch: React.FC<BeatProps> = ({ f, c, g }) => {
  const us = c("us", 37);
  const pro = c("pro", 71);
  const max = c("max", 85);
  const limits = c("limits", 157);
  const pin = pop(f, us, { damping: 10, stiffness: 180 });
  const mapIn = ez(f, 4, 30);
  const bg = ez(f, limits - 40, limits + 6, 0, 1, EASE_IO);
  const used = 0.36 + 0.36 * bg;
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 330, width: 800, height: 495, opacity: mapIn, WebkitMaskImage: `url(${staticFile("media/duet/us.svg")})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", backgroundImage: `radial-gradient(circle, ${f >= us ? "#9AC761" : "#CFCBBE"} 3.4px, transparent 4px)`, backgroundSize: "12px 12px" }} />
      <div style={{ position: "absolute", left: 640 - 40, top: 470 - 110 - (1 - pin) * 200, opacity: f >= us ? 1 : 0, scale: String(0.7 + 0.3 * pin) }}>
        <svg width={80} height={110} viewBox="0 0 24 33">
          <path d="M12 32s10-12.2 10-20A10 10 0 0 0 2 12c0 7.8 10 20 10 20z" fill={C.charcoal} />
          <circle cx={12} cy={12} r={4.4} fill={C.lime} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 640 - 60 * ez(f, us + 6, us + 30), top: 470 - 14 * ez(f, us + 6, us + 30), width: 120 * ez(f, us + 6, us + 30), height: 28 * ez(f, us + 6, us + 30), borderRadius: "50%", border: `2px solid ${INK}`, opacity: 1 - ez(f, us + 6, us + 30) }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 860, display: "flex", gap: 18 }}>
        {[
          { t: "Claude Pro", at: pro, ok: true },
          { t: "Claude Max", at: max, ok: true },
          { t: "Team", at: max + 14, ok: false },
        ].map((p) => (
          <div key={p.t} style={{ flex: 1, height: 130, borderRadius: 24, background: p.ok ? "white" : "transparent", border: p.ok ? `1px solid ${LINE}` : `2px dashed #CFCBBE`, boxShadow: p.ok ? SHADOW : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, ...rise(f, p.at - 4, 24) }}>
            {p.ok ? <Logo src="claude.svg" h={34} /> : null}
            <div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: p.ok ? C.charcoal : MUTED }}>{p.t}</div>
              <div style={{ fontFamily: BODY, fontSize: 18, color: p.ok ? INK : MUTED }}>{p.ok ? "Waitlist" : "Not yet"}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...card, left: 90, right: 90, top: 1050, padding: "26px 30px", ...rise(f, limits - 46, 30) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal }}>Plan usage this week</div>
          <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 48, letterSpacing: -1.5, color: C.charcoal, fontVariantNumeric: "tabular-nums" }}>{Math.round(used * 100)}%</div>
        </div>
        <div style={{ position: "relative", height: 28, borderRadius: 14, background: "#EEEBE2", marginTop: 16, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "36%", background: C.charcoal }} />
          <div style={{ position: "absolute", left: "36%", top: 0, bottom: 0, width: `${36 * bg}%`, background: `repeating-linear-gradient(135deg, ${C.lime} 0 14px, #C6F27C 14px 28px)`, backgroundPosition: `${g}px 0` }} />
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 14, fontFamily: BODY, fontSize: 19, color: MUTED }}>
          <span>■ Chat</span>
          <span style={{ color: INK, opacity: bg }}>■ Duet in the background</span>
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 9. CTA: which would you trust with your inbox?
const Cta: React.FC<BeatProps> = ({ f, c, g }) => {
  const order = ["muse", "grok", "dots", "duet"];
  const byKey = Object.fromEntries(AGENTS.map((a) => [a.cueKey, a]));
  const duetAt = c("duet", 52);
  const lift = ez(f, duetAt + 6, duetAt + 22, 0, 1, EASE);
  const com = c("comments", 144);
  return (
    <>
      {order.map((k, i) => {
        const a = byKey[k];
        const at = c(k, 7 + i * 15);
        const p = pop(f, at - 4);
        const isDuet = k === "duet";
        const x = i % 2 ? 560 : 100;
        const y = i < 2 ? 300 : 750;
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y - (isDuet ? lift * 20 : 0), scale: String((0.8 + 0.2 * p) * (isDuet ? 1 + 0.05 * lift : 1 - 0.03 * lift)), opacity: Math.min(1, p * 1.4) * (isDuet ? 1 : 1 - 0.35 * lift), filter: isDuet ? `drop-shadow(0 0 ${30 * lift}px rgba(167,255,63,${0.8 * lift}))` : undefined }}>
            <div style={{ borderRadius: 30, outline: isDuet && lift > 0 ? `${3}px solid rgba(167,255,63,${lift})` : undefined, outlineOffset: 6 }}>
              <AgentCard a={a} f={f} at={-100} w={420} />
            </div>
          </div>
        );
      })}
      <div style={{ ...card, left: 90, right: 90, top: 1215, padding: "18px 22px", display: "flex", alignItems: "center", gap: 18, ...rise(f, com - 60, 40) }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: C.charcoal, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 20, color: C.lime }}>You</div>
        <div style={{ flex: 1, fontFamily: BODY, fontSize: 28, color: C.charcoal }}>
          {typed(f, "Duet. It already knows my work.", com - 50, 0.9) || <span style={{ color: MUTED }}>Add a comment…</span>}
          {f > com - 50 && Math.floor(g / 8) % 2 === 0 ? <span style={{ color: INK }}>|</span> : null}
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 24, color: f > com ? INK : MUTED }}>Post</div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ the world: camera, thread, parallax
const BEATS: Record<string, React.FC<BeatProps>> = { hook: Hook, what: What, brief: Brief, work: Work, safety: Safety, rivals: Rivals, best: Best, setup: Setup, catch: Catch, cta: Cta };
const ORDER = ["hook", "what", "brief", "work", "safety", "rivals", "best", "setup", "catch", "cta"];
const P: [number, number][] = [
  [0, 0],
  [1500, -450],
  [3000, 150],
  [3000, 2350],
  [4500, 1950],
  [6000, 2450],
  [7500, 1950],
  [9000, 2450],
  [10500, 1950],
  [12000, 2350],
];
type V = [number, number];
const seg = (j: number): [V, V, V, V] => {
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

export const DuetScene: React.FC<SceneProps> = ({ data }) => {
  const f = useCurrentFrame();
  const w = data._world as { i: number; starts: number[]; durs: number[]; cues: Record<string, number>[] };
  const i = ORDER.indexOf(data.beat as string);
  const g = w.starts[w.i] + f;
  const D = w.durs[w.i];
  // camera
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
    const sg = seg(i);
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
  const blur = bx + by > 0.4;
  const fid = `mb${w.i}`;
  const visible = ORDER.map((_, j) => j).filter((j) => Math.abs(j - i) <= 1);
  // parallax specks (screen space, depth k)
  const specks = new Array(34).fill(0).map((_, k) => {
    const depth = 0.35 + random(`dk${k}`) * 1.3;
    const sx = random(`dx${k}`) * 1400;
    const sy = random(`dy${k}`) * 2300;
    const x = ((((sx - pos[0] * depth * s) % 1400) + 1400) % 1400) - 160;
    const y = ((((sy - pos[1] * depth * s) % 2300) + 2300) % 2300) - 190;
    const r = 2 + depth * 3;
    const col = k % 3 === 0 ? C.lime : k % 3 === 1 ? "#CFCBBE" : C.charcoal;
    return <div key={k} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: k % 4 === 0 ? 2 : "50%", background: col, opacity: k % 3 === 2 ? 0.12 : 0.5, filter: depth > 1.2 ? `blur(${(depth - 1.1) * 4}px)` : undefined }} />;
  });
  return (
    <AbsoluteFill style={{ background: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(10,10,10,0.09) 1.3px, transparent 1.6px)", backgroundSize: `${46 * s}px ${46 * s}px`, backgroundPosition: `${540 - pos[0] * s}px ${960 - pos[1] * s}px`, maskImage: "radial-gradient(ellipse 75% 60% at 50% 46%, black, transparent 80%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 42%, rgba(255,255,255,0.85), rgba(246,244,237,0) 70%)" }} />
      <AbsoluteFill>{specks}</AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: blur ? `url(#${fid})` : undefined }}>
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(540px, 960px) rotate(${rot}deg) scale(${s}) translate(${-pos[0]}px, ${-pos[1]}px)` }}>
          {/* the Duet signal thread */}
          <svg style={{ position: "absolute", left: -2000, top: -2000, overflow: "visible" }} width={16000} height={6000}>
            <g transform="translate(2000 2000)">
              {ORDER.slice(1).map((_, k) => {
                const j = k + 1;
                if (j > i) return null;
                const sg = seg(j);
                const prog = j < i ? 1 : t;
                return (
                  <g key={j}>
                    <path d={segD(sg)} fill="none" stroke={C.lime} strokeWidth={16} strokeLinecap="round" opacity={0.35} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
                    <path d={segD(sg)} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
                  </g>
                );
              })}
              {i > 0 && t < 1
                ? (() => {
                    const h = bez(seg(i), t);
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
            const B = BEATS[ORDER[j]];
            const fj = g - w.starts[j];
            const cj: Cue = (n, fb) => (w.cues[j]?.[n] ?? fb) as number;
            return (
              <div key={j} style={{ position: "absolute", left: P[j][0] - 540, top: P[j][1] - 960, width: 1080, height: 1920 }}>
                <B f={fj} D={w.durs[j]} c={cj} g={g} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const DUET_SCENES: Record<string, React.FC<SceneProps>> = { dDuet: DuetScene };
