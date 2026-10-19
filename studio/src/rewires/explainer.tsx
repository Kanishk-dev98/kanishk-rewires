// "AI tool explainer" format (9:16), reverse-engineered from the benchmark ref-DepnbyJsLYK and rebuilt in the
// Kanishk.Rewires theme. Pair with captionStyle.mode = "headline": the spoken line is the headline at the top;
// each scene shows ONE designed object centred below it. No stock footage. Dark acts on charcoal, the twist
// flips to cream. All layouts are our own; only the grammar is borrowed.
import React from "react";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, BRAND, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";

const RED = "#E5484D";
type Tk = { light: boolean; bg: string; fg: string; sub: string; muted: string; card: string; cardBorder: string; ink: string; soft: string; chipBg: string; chipBorder: string; shadow: string };
const DARK: Tk = { light: false, bg: C.charcoal, fg: C.cream, sub: C.stone, muted: C.grey, card: "#141514", cardBorder: "#262826", ink: C.lime, soft: "rgba(167,255,63,0.12)", chipBg: "#151715", chipBorder: "#2E302E", shadow: "0 30px 80px rgba(0,0,0,0.6)" };
const LIGHT: Tk = { light: true, bg: C.cream, fg: C.charcoal, sub: "#55534C", muted: "#8A877E", card: "#FFFFFF", cardBorder: "#E4E0D5", ink: "#3E7A00", soft: "rgba(167,255,63,0.28)", chipBg: "#FFFFFF", chipBorder: "#DDD9CC", shadow: "0 30px 70px rgba(10,10,10,0.12)" };
const TCtx = React.createContext<Tk>(DARK);
const useT = () => React.useContext(TCtx);
const MID = 920; // vertical centre of the object zone (headline lives above, outro/IG UI below)
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;
const sp = (frame: number, at: number, cfg = { damping: 14, stiffness: 170 }) => spring({ frame: frame - at, fps: 30, config: cfg });
const enter = (frame: number, at: number, rise = 30): React.CSSProperties => {
  const s = sp(frame, at);
  return { opacity: frame < at ? 0 : Math.min(1, s * 1.5), translate: `0 ${(1 - s) * rise}px`, scale: String(0.94 + 0.06 * s), filter: `blur(${(1 - Math.min(1, s * 1.4)) * 8}px)` };
};

// ------------------------------------------------------------------ canvas
const Canvas: React.FC<{ light?: boolean }> = ({ light }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: light ? C.cream : C.charcoal }}>
      <AbsoluteFill style={{ background: light ? "radial-gradient(ellipse 70% 45% at 50% 48%, rgba(255,255,255,0.9), rgba(246,244,237,0) 70%)" : `radial-gradient(ellipse 65% 40% at 50% ${48 + Math.sin(frame / 60) * 2}%, rgba(167,255,63,0.07), rgba(10,10,10,0) 70%)` }} />
      <AbsoluteFill style={{ background: light ? "radial-gradient(ellipse 120% 90% at 50% 50%, rgba(0,0,0,0) 60%, rgba(10,10,10,0.06) 100%)" : "radial-gradient(ellipse 120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)" }} />
    </AbsoluteFill>
  );
};
const Pill: React.FC<{ text: string; tone?: "lime" | "red" | "ghost" | "dark"; icon?: string; style?: React.CSSProperties }> = ({ text, tone = "ghost", icon, style }) => {
  const T = useT();
  const tones = {
    lime: T.light ? { background: C.lime, color: C.charcoal, border: `1.5px solid ${C.lime}` } : { background: "rgba(167,255,63,0.12)", color: C.lime, border: "1.5px solid rgba(167,255,63,0.5)" },
    red: { background: "rgba(229,72,77,0.12)", color: RED, border: "1.5px solid rgba(229,72,77,0.5)" },
    ghost: T.light ? { background: "rgba(10,10,10,0.04)", color: T.sub, border: `1.5px solid ${T.cardBorder}` } : { background: "rgba(246,244,237,0.06)", color: T.sub, border: "1.5px solid rgba(246,244,237,0.16)" },
    dark: { background: C.charcoal, color: T.fg, border: "1.5px solid #333" },
  }[tone];
  return <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: MONO, fontWeight: 600, fontSize: 21, letterSpacing: 2, borderRadius: 999, padding: "8px 16px", ...tones, ...style }}>{icon ? <span>{icon}</span> : null}{text}</div>;
};
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; light?: boolean }> = ({ children, style, light }) => {
  const T = useT();
  const l = light || T.light;
  return <div style={{ position: "absolute", borderRadius: 26, background: l ? "white" : T.card, border: `1px solid ${l ? "#E4E0D5" : T.cardBorder}`, boxShadow: l ? LIGHT.shadow : DARK.shadow, overflow: "hidden", ...style }}>{children}</div>;
};
const Check: React.FC<{ on: boolean; size?: number }> = ({ on, size = 22 }) => (
  <span style={{ display: "inline-flex", width: size, height: size, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: on ? C.lime : "rgba(128,128,120,0.25)", color: C.charcoal, fontSize: size * 0.62, fontWeight: 900, transition: "none" }}>{on ? "✓" : ""}</span>
);

// ------------------------------------------------------------------ 1. brand ring intro
const LogoRing: React.FC<{ data: SceneProps["data"]; c: (n: string, f: number) => number }> = ({ data, c }) => {
  const T = useT();
  const frame = useCurrentFrame();
  const s = sp(frame, 0, { damping: 16, stiffness: 120 });
  const openAt = c("open", 20);
  const R = 210;
  return (
    <>
      <div style={{ position: "absolute", left: 540 - R, top: MID - R - 40, width: R * 2, height: R * 2, scale: String(0.8 + 0.2 * s), opacity: s }}>
        <div style={{ position: "absolute", inset: -40, borderRadius: "50%", background: `conic-gradient(from ${frame * 2}deg, rgba(167,255,63,0.45), rgba(127,216,255,0.25), rgba(246,244,237,0.15), rgba(167,255,63,0.45))`, filter: "blur(40px)", opacity: 0.6 }} />
        <svg width={R * 2} height={R * 2} style={{ position: "absolute", inset: 0 }}>
          <circle cx={R} cy={R} r={R - 4} stroke={T.light ? "rgba(10,10,10,0.18)" : "rgba(246,244,237,0.35)"} strokeWidth={2} fill={T.light ? "#FFFFFF" : "rgba(10,10,10,0.55)"} />
          <circle cx={R} cy={R} r={R - 4} stroke={T.light ? T.ink : C.lime} strokeWidth={4} fill="none" pathLength={1} strokeDasharray="0.18 0.82" strokeDashoffset={-frame / 90} />
        </svg>
        {new Array(10).fill(0).map((_, i) => {
          const a = (i / 10) * Math.PI * 2 + frame / 70;
          return <div key={i} style={{ position: "absolute", left: R + Math.cos(a) * (R + 26) - 3, top: R + Math.sin(a) * (R + 26) - 3, width: 6, height: 6, borderRadius: 3, background: C.lime, opacity: 0.5 + 0.5 * Math.sin(frame / 8 + i) }} />;
        })}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {data.logo ? <Img src={staticFile(data.logo)} style={{ width: R * 0.75, height: R * 0.75, objectFit: "contain" }} /> : <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 90, color: T.fg }}>{data.mark}</div>}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: MID - R - 110, display: "flex", justifyContent: "center", ...enter(frame, 6) }}>
        <Pill text={data.badge ?? "NEW · JUST RELEASED"} tone="red" icon="●" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: MID + R + 10, display: "flex", justifyContent: "center", ...enter(frame, openAt) }}>
        <Pill text={data.license ?? "OPEN SOURCE"} tone="lime" icon="🔓" style={{ fontSize: 24 }} />
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 2. hub with chips (+ optional repo card)
type Chip = { t: string; cue: string };
const Hub: React.FC<{ data: SceneProps["data"]; c: (n: string, f: number) => number }> = ({ data, c }) => {
  const T = useT();
  const frame = useCurrentFrame();
  const chips = data.chips as Chip[];
  const center = data.center as string;
  const ringAt = c(data.ringCue ?? "ring", 40);
  const prog = interpolate(frame, [ringAt, ringAt + 30], [0, 1], { ...clamp, easing: EASE_IO });
  const R = 290;
  const cy = data.repo ? MID + 80 : MID;
  return (
    <>
      {data.repo ? (
        <Card style={{ left: 170, right: 170, top: 420, padding: "18px 22px", ...enter(frame, 0) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {data.repo.logo ? <Img src={staticFile(data.repo.logo)} style={{ width: 44, height: 44 }} /> : null}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MONO, fontSize: 18, color: T.muted }}>{data.repo.owner} /</div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: T.fg }}>{data.repo.name}</div>
            </div>
            <Pill text="PUBLIC" tone="lime" style={{ fontSize: 16 }} />
          </div>
          <div style={{ fontFamily: BODY, fontSize: 20, color: T.sub, marginTop: 8 }}>{data.repo.desc}</div>
        </Card>
      ) : null}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={cy} r={R} stroke={T.light ? "rgba(10,10,10,0.15)" : "rgba(246,244,237,0.12)"} strokeWidth={2} strokeDasharray="4 10" fill="none" />
        {chips.map((ch, i) => {
          const a = -Math.PI / 2 + (i / chips.length) * Math.PI * 2;
          const at = c(ch.cue, 20 + i * 10);
          const k = interpolate(frame, [at, at + 10], [0, 1], clamp);
          return <line key={ch.t} x1={540 + Math.cos(a) * 92} y1={cy + Math.sin(a) * 92} x2={540 + Math.cos(a) * (92 + (R - 92) * k)} y2={cy + Math.sin(a) * (92 + (R - 92) * k)} stroke={T.ink} strokeWidth={2} opacity={0.6} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 540 - 90, top: cy - 90, width: 180, height: 180, borderRadius: "50%", background: T.card, border: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${50 * prog}px rgba(167,255,63,0.35)`, ...enter(frame, 2) }}>
        <svg width={196} height={196} style={{ position: "absolute", left: -8, top: -8 }}>
          <circle cx={98} cy={98} r={94} stroke={T.ink} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} strokeLinecap="round" transform="rotate(-90 98 98)" />
        </svg>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: T.fg, textAlign: "center", lineHeight: 1.1 }}>{center}</div>
        <div style={{ fontFamily: MONO, fontSize: 15, color: prog > 0.98 ? C.lime : C.grey, marginTop: 6 }}>{prog > 0.98 ? "● upgraded" : "● running"}</div>
      </div>
      {chips.map((ch, i) => {
        const a = -Math.PI / 2 + (i / chips.length) * Math.PI * 2;
        const at = c(ch.cue, 20 + i * 10);
        return (
          <div key={ch.t} style={{ position: "absolute", left: 540 + Math.cos(a) * R, top: cy + Math.sin(a) * R, translate: "-50% -50%", ...enter(frame, at, 14) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.chipBg, border: `1px solid ${T.chipBorder}`, borderRadius: 14, padding: "12px 18px", fontFamily: BODY, fontWeight: 700, fontSize: 27, color: T.fg, whiteSpace: "nowrap", boxShadow: T.shadow }}>
              {ch.t}
              <Check on={frame >= at + 10} size={20} />
            </div>
          </div>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ 3. weights stay frozen
const Weights: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const T = useT();
  const frame = useCurrentFrame();
  const strike = c("strike", 30);
  const k = interpolate(frame, [strike, strike + 12], [0, 1], { ...clamp, easing: EASE });
  return (
    <Card style={{ left: 120, right: 120, top: MID - 230, padding: "22px 26px", ...enter(frame, 0) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: T.sub }}>⚙ MODEL WEIGHTS</div>
        <Pill text={k > 0.9 ? "FROZEN" : "7B PARAMS"} tone={k > 0.9 ? "lime" : "ghost"} style={{ fontSize: 16 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginTop: 18 }}>
        {new Array(24).fill(0).map((_, i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 21, color: T.muted, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{(random(`w${i}`) * 2 - 1).toFixed(3)}</div>
        ))}
      </div>
      <div style={{ position: "relative", marginTop: 20, display: "flex", alignItems: "center", gap: 12, fontFamily: BODY, fontWeight: 700, fontSize: 26, color: k > 0.5 ? C.grey : C.cream }}>
        ↻ Retrain the model
        <div style={{ position: "absolute", left: 0, top: "50%", height: 4, width: `${k * 320}px`, background: RED, borderRadius: 2 }} />
      </div>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, fontFamily: BODY, fontWeight: 700, fontSize: 26, color: T.ink, opacity: interpolate(frame, [strike + 12, strike + 20], [0, 1], clamp) }}>
        <Check on size={26} /> Weights unchanged
      </div>
    </Card>
  );
};

// ------------------------------------------------------------------ 4. product reveal (flash)
const Reveal: React.FC<{ data: SceneProps["data"] }> = ({ data }) => {
  const T = useT();
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [4, 8, 20], [0, 0.9, 0], clamp);
  const s = sp(frame, 8, { damping: 10, stiffness: 180 });
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${(MID / 1920) * 100}%, rgba(246,255,232,${flash}), rgba(10,10,10,0) 55%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: MID - 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: frame >= 8 ? 1 : 0, scale: String(0.7 + 0.3 * s) }}>
        <div style={{ background: T.light ? C.charcoal : C.cream, borderRadius: 28, padding: "26px 44px", boxShadow: "0 0 80px rgba(167,255,63,0.35)" }}>
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 96, color: T.light ? C.cream : C.charcoal, letterSpacing: -3, lineHeight: 1 }}>
            {data.name}
            <sup style={{ fontSize: 50, color: T.light ? C.lime : "#4C8C00" }}>{data.sup}</sup>
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: T.sub, ...enter(frame, 18) }}>{data.tagline}</div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 5. browser frame with a slow pan across a recreated diagram
const Browser: React.FC<{ data: SceneProps["data"]; c: (n: string, f: number) => number; light?: boolean }> = ({ data, c, light }) => {
  const T = useT();
  void T;
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const nodes = data.nodes as { t: string; sub?: string; x: number; y: number; hl?: boolean; cue?: string }[];
  const panX = interpolate(frame, [0, D], [data.panFrom?.[0] ?? 0, data.panTo?.[0] ?? -120], { ...clamp, easing: EASE_IO });
  const panY = interpolate(frame, [0, D], [data.panFrom?.[1] ?? 0, data.panTo?.[1] ?? -40], { ...clamp, easing: EASE_IO });
  const zoom = interpolate(frame, [0, D], [1, data.zoom ?? 1.12], clamp);
  return (
    <Card light style={{ left: 80, right: 80, top: MID - 300, height: 600, ...enter(frame, 0) }}>
      <div style={{ height: 46, background: "#EEEBE3", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((col) => (
          <div key={col} style={{ width: 12, height: 12, borderRadius: "50%", background: col }} />
        ))}
        <div style={{ marginLeft: 12, flex: 1, textAlign: "center", fontFamily: BODY, fontSize: 17, color: "#77756D" }}>🔒 {data.url}</div>
      </div>
      <div style={{ position: "relative", height: 554, overflow: "hidden", background: light ? "#FBFAF6" : "white" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1300, height: 800, translate: `${panX}px ${panY}px`, scale: String(zoom), transformOrigin: "0 0" }}>
          <svg width={1300} height={800} style={{ position: "absolute", inset: 0 }}>
            {(data.edges as [number, number][]).map(([a, b], i) => (
              <path key={i} d={`M${nodes[a].x + 110},${nodes[a].y + 40} C${(nodes[a].x + nodes[b].x) / 2 + 110},${nodes[a].y + 40} ${(nodes[a].x + nodes[b].x) / 2 + 110},${nodes[b].y + 40} ${nodes[b].x},${nodes[b].y + 40}`} stroke="#9A9A93" strokeWidth={2} fill="none" strokeDasharray="6 6" strokeDashoffset={-frame} />
            ))}
          </svg>
          {nodes.map((n, i) => {
            const on = n.cue ? frame >= c(n.cue, 30) : false;
            return (
              <div key={n.t} style={{ position: "absolute", left: n.x, top: n.y, width: 220, borderRadius: 16, padding: "14px 16px", background: n.hl ? "#F4FFE6" : "white", border: `2px solid ${on ? "#4C8C00" : n.hl ? "#B9E36F" : "#E4E0D5"}`, boxShadow: on ? "0 0 0 6px rgba(167,255,63,0.35)" : undefined, opacity: interpolate(frame, [4 + i * 3, 12 + i * 3], [0, 1], clamp) }}>
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 24, color: C.charcoal }}>{n.t}</div>
                {n.sub ? <div style={{ fontFamily: BODY, fontSize: 16, color: "#77756D", marginTop: 4 }}>{n.sub}</div> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// ------------------------------------------------------------------ 6. tuning by hand (prompt editor, a cursor fiddling)
const Editor: React.FC<{ data: SceneProps["data"] }> = ({ data }) => {
  const T = useT();
  const frame = useCurrentFrame();
  const lines = data.lines as string[];
  const edit = data.edit as string;
  const t = Math.max(0, Math.floor((frame - 24) * 1.2));
  const shown = edit.slice(0, t);
  const del = frame > 24 + edit.length / 1.2 + 10 ? Math.min(edit.length, Math.floor((frame - (24 + edit.length / 1.2 + 10)) * 2)) : 0;
  const cur = del > 0 ? edit.slice(0, edit.length - del) : shown;
  return (
    <Card style={{ left: 110, right: 110, top: MID - 260, padding: "0 0 22px", ...enter(frame, 0) }}>
      <div style={{ height: 44, background: T.light ? "#EEEBE3" : "#1C1E1C", display: "flex", alignItems: "center", padding: "0 18px", gap: 10, fontFamily: MONO, fontSize: 17, color: T.muted }}>
        <span style={{ color: T.ink }}>●</span> system_prompt.md <span style={{ marginLeft: "auto" }}>v{12 + Math.floor(frame / 20)}</span>
      </div>
      <div style={{ padding: "18px 24px", fontFamily: MONO, fontSize: 23, lineHeight: 1.75, color: T.sub }}>
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
        <div style={{ color: T.fg }}>
          {cur}
          <span style={{ color: T.ink, opacity: Math.floor(frame / 8) % 2 }}>▍</span>
        </div>
      </div>
      <div style={{ padding: "0 24px", display: "flex", gap: 10 }}>
        <Pill text={`SCORE ${(61 + Math.sin(frame / 9) * 2).toFixed(1)}`} tone="ghost" style={{ fontSize: 16 }} />
        <Pill text="RE-RUN ↻" tone="ghost" style={{ fontSize: 16 }} />
      </div>
    </Card>
  );
};

// ------------------------------------------------------------------ 7. terminal command
const Terminal: React.FC<{ data: SceneProps["data"] }> = ({ data }) => {
  const T = useT();
  void T;
  const frame = useCurrentFrame();
  const cmd = data.cmd as string;
  const typed = cmd.slice(0, Math.max(0, Math.floor((frame - 6) * 1.7)));
  const w = interpolate(frame, [0, 12], [160, 900], { ...clamp, easing: EASE_IO });
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: MID - 50, width: w, height: 100, borderRadius: 22, background: "#101810", border: "1.5px solid rgba(167,255,63,0.45)", boxShadow: "0 0 60px rgba(167,255,63,0.15)", display: "flex", alignItems: "center", padding: "0 30px", overflow: "hidden" }}>
      <span style={{ fontFamily: MONO, fontSize: 30, color: C.lime, whiteSpace: "nowrap" }}>
        $ {typed}
        <span style={{ opacity: Math.floor(frame / 8) % 2 }}>▍</span>
      </span>
    </div>
  );
};

// ------------------------------------------------------------------ 8. the loop: step card + run log stack
const Loop: React.FC<{ data: SceneProps["data"]; c: (n: string, f: number) => number }> = ({ data, c }) => {
  const T = useT();
  const frame = useCurrentFrame();
  const steps = data.steps as { t: string; sub: string; cue: string }[];
  const log = data.log as { t: string; cue: string }[];
  const cur = steps.filter((s) => frame >= c(s.cue, 0)).length - 1;
  return (
    <>
      <Card light style={{ left: 80, right: 80, top: MID - 330, height: 360, ...enter(frame, 0) }}>
        <div style={{ height: 44, background: "#EEEBE3", display: "flex", alignItems: "center", padding: "0 18px", fontFamily: BODY, fontSize: 17, color: "#77756D" }}>🔒 {data.url}</div>
        <div style={{ display: "flex", gap: 16, padding: "36px 26px", alignItems: "center" }}>
          {steps.map((s, i) => {
            const on = i === cur;
            const done = i < cur;
            return (
              <React.Fragment key={s.t}>
                <div style={{ flex: 1, borderRadius: 18, padding: "18px 16px", border: `2px solid ${on ? "#4C8C00" : "#E4E0D5"}`, background: on ? "#F4FFE6" : done ? "#FAFAF7" : "white", scale: on ? "1.05" : "1", boxShadow: on ? "0 18px 40px rgba(76,140,0,0.18)" : undefined }}>
                  <div style={{ fontFamily: MONO, fontSize: 15, color: "#77756D" }}>0{i + 1}</div>
                  <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: C.charcoal }}>{s.t}</div>
                  <div style={{ fontFamily: BODY, fontSize: 17, color: "#55534C", marginTop: 6, lineHeight: 1.3 }}>{s.sub}</div>
                </div>
                {i < steps.length - 1 ? <div style={{ fontSize: 26, color: done || on ? "#4C8C00" : "#C9C5BA" }}>→</div> : null}
              </React.Fragment>
            );
          })}
        </div>
      </Card>
      <Card style={{ left: 120, right: 120, top: MID + 70, padding: "16px 22px", ...enter(frame, 6) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 17, color: T.muted }}>
          <span>{data.logTitle}</span>
          <span style={{ color: T.ink }}>● live</span>
        </div>
        {log.map((l) => {
          const at = c(l.cue, 30);
          return (
            <div key={l.t} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, fontFamily: MONO, fontSize: 21, color: T.fg, opacity: frame >= at ? 1 : 0 }}>
              <Check on={frame >= at + 8} size={20} /> {l.t}
            </div>
          );
        })}
      </Card>
    </>
  );
};

// ------------------------------------------------------------------ 9. benchmark stat count-up
const Stat: React.FC<{ data: SceneProps["data"]; c: (n: string, f: number) => number }> = ({ data, c }) => {
  const T = useT();
  void T;
  const frame = useCurrentFrame();
  const at = c("stat", 20);
  const v = interpolate(frame, [at - 8, at + 16], [0, data.value], { ...clamp, easing: EASE });
  const rows = data.rows as { k: string; v: string }[];
  return (
    <Card light style={{ left: 110, right: 110, top: MID - 250, padding: "26px 30px", ...enter(frame, 0) }}>
      <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: "#77756D" }}>{data.bench}</div>
      <div style={{ fontFamily: SERIF, fontSize: 170, lineHeight: 1, color: C.charcoal, fontVariantNumeric: "tabular-nums", marginTop: 8 }}>
        +{v.toFixed(1)}
        <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, color: "#77756D", marginLeft: 12 }}>{data.unit}</span>
      </div>
      <div style={{ height: 12, borderRadius: 6, background: "#EEEBE3", marginTop: 18, overflow: "hidden" }}>
        <div style={{ width: `${(v / data.value) * 100}%`, height: "100%", background: "#8FD13A" }} />
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
        {rows.map((r, i) => (
          <div key={r.k} style={{ flex: 1, borderRadius: 14, background: "#F6F4ED", padding: "10px 12px", opacity: interpolate(frame, [at + 10 + i * 5, at + 18 + i * 5], [0, 1], clamp) }}>
            <div style={{ fontFamily: MONO, fontSize: 14, color: "#77756D" }}>{r.k}</div>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: "#2E7D32" }}>{r.v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 15, color: "#9A9A93", marginTop: 14 }}>{data.note}</div>
    </Card>
  );
};

// ------------------------------------------------------------------ 10. act switch (charcoal -> cream circle)
const ActSwitch: React.FC<{ to: string }> = ({ to }) => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [0, 12], [0, 1500], { ...clamp, easing: EASE_IO });
  return <AbsoluteFill style={{ background: to === "cream" ? C.cream : C.charcoal, clipPath: `circle(${r}px at 50% ${(MID / 1920) * 100}%)` }} />;
};

// ------------------------------------------------------------------ 11. lessons memory (cream)
const Lessons: React.FC<{ data: SceneProps["data"]; c: (n: string, f: number) => number }> = ({ data, c }) => {
  const T = useT();
  void T;
  const frame = useCurrentFrame();
  const items = data.items as { t: string; cue: string }[];
  return (
    <>
      <Card light style={{ left: 140, top: MID - 300, width: 520, padding: "20px 22px", ...enter(frame, 0) }}>
        <div style={{ fontFamily: MONO, fontSize: 16, color: "#77756D" }}>{data.from}</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: C.charcoal, marginTop: 4 }}>{data.fromTitle}</div>
        {items.map((it) => {
          const at = c(it.cue, 30);
          return (
            <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontFamily: BODY, fontWeight: 600, fontSize: 22, color: "#3A3936", opacity: frame >= at ? 1 : 0 }}>
              <span style={{ color: "#4C8C00" }}>✦</span> {it.t}
            </div>
          );
        })}
      </Card>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M660 ${MID - 140} C 760 ${MID - 140}, 760 ${MID + 120}, 820 ${MID + 120}`} stroke="#4C8C00" strokeWidth={3} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(frame, [c("carry", 60), c("carry", 60) + 16], [0, 1], clamp)} />
      </svg>
      <Card light style={{ right: 100, top: MID + 60, width: 360, padding: "18px 20px", border: "2px solid #4C8C00", ...enter(frame, c("carry", 60) + 10) }}>
        <div style={{ fontFamily: MONO, fontSize: 16, color: "#4C8C00" }}>NEXT TASK</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 26, color: C.charcoal, marginTop: 4 }}>{data.toTitle}</div>
        <div style={{ fontFamily: BODY, fontSize: 18, color: "#55534C", marginTop: 6 }}>starts with {items.length} lessons loaded</div>
      </Card>
    </>
  );
};

// ------------------------------------------------------------------ 12. better-at-getting-better chart (cream)
const Chart: React.FC<{ data: SceneProps["data"] }> = ({ data }) => {
  const T = useT();
  void T;
  const frame = useCurrentFrame();
  const W = 820;
  const H = 420;
  const pts = data.points as number[];
  const base = data.baseline as number[];
  const toD = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${(i / (arr.length - 1)) * W},${H - (v / 100) * H}`).join(" ");
  const draw = interpolate(frame, [6, 50], [0, 1], { ...clamp, easing: EASE_IO });
  const lbl = sp(frame, 46);
  return (
    <Card light style={{ left: 90, right: 90, top: MID - 300, height: 600, padding: "24px 40px", ...enter(frame, 0) }}>
      <div style={{ fontFamily: MONO, fontSize: 18, color: "#77756D" }}>{data.title}</div>
      <svg width={W} height={H} style={{ marginTop: 40, overflow: "visible" }}>
        <path d={toD(base)} stroke="#B8B4A8" strokeWidth={3} strokeDasharray="8 8" fill="none" />
        <path d={toD(pts)} stroke="#4C8C00" strokeWidth={6} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} strokeLinecap="round" />
        <text x={W - 20} y={H - (pts[pts.length - 1] / 100) * H - 30} textAnchor="end" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 54, fill: C.charcoal, opacity: lbl }}>{data.label}</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 15, color: "#9A9A93", marginTop: 10 }}>
        <span>task 1</span>
        <span>task {pts.length}</span>
      </div>
    </Card>
  );
};

// ------------------------------------------------------------------ 13. CTA journey: follow -> comment keyword -> DM link
const Cta: React.FC<{ data: SceneProps["data"]; c: (n: string, f: number) => number }> = ({ data, c }) => {
  const T = useT();
  const frame = useCurrentFrame();
  const follow = c("follow", 20);
  const cAt = c("comment", 60);
  const dmAt = c("send", 110);
  const word = data.word as string;
  const typed = word.slice(0, Math.max(0, Math.floor((frame - cAt - 12) * 0.8)));
  const posted = frame >= cAt + 12 + word.length / 0.8 + 6;
  const following = frame >= follow + 6;
  const cur = frame < cAt ? { x: 640, y: MID - 40 } : { x: 860, y: MID + 270 };
  return (
    <>
      <Card style={{ left: 150, right: 150, top: MID - 380, padding: "20px 22px", opacity: frame < cAt + 6 ? 1 : 0.35, ...(frame < 2 ? { opacity: 0 } : {}) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.charcoal, border: `3px solid ${C.lime}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile(BRAND.logo.monogramPublic)} style={{ width: 60, height: 60 }} />
          </div>
          <div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 28, color: T.fg }}>kanishk.rewires</div>
            <div style={{ fontFamily: BODY, fontSize: 18, color: T.muted }}>AI · business · marketing, decoded</div>
          </div>
        </div>
        <div style={{ marginTop: 16, textAlign: "center", borderRadius: 12, padding: "12px 0", fontFamily: BODY, fontWeight: 800, fontSize: 22, background: following ? "#2A2A2A" : C.lime, color: following ? C.cream : C.charcoal, scale: Math.abs(frame - follow) < 4 ? "0.96" : "1" }}>{following ? "Following ✓" : "Follow"}</div>
      </Card>
      <Card style={{ left: 150, right: 150, top: MID - 60, padding: "18px 22px", ...enter(frame, cAt) }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 22, color: T.fg, textAlign: "center" }}>Comments</div>
        <div style={{ marginTop: 14, height: 64, borderRadius: 32, border: "1.5px solid #333", display: "flex", alignItems: "center", padding: "0 20px", fontFamily: BODY, fontSize: 24, color: typed ? C.cream : C.grey }}>
          {posted ? "Add a comment…" : typed || "Add a comment…"}
          <span style={{ marginLeft: "auto", fontWeight: 800, color: C.lime }}>Post</span>
        </div>
        {posted ? (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.stone }} />
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 24, color: T.fg, background: "#1F1F1F", borderRadius: 10, padding: "6px 14px" }}>{word}</div>
          </div>
        ) : null}
      </Card>
      {frame >= dmAt ? (
        <Card style={{ left: 150, right: 150, top: MID + 270, padding: "16px 20px", border: `1.5px solid ${C.lime}`, ...enter(frame, dmAt) }}>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 20, color: T.fg }}>kanishk.rewires · DM</div>
          <div style={{ fontFamily: BODY, fontSize: 21, color: T.sub, marginTop: 6 }}>{data.dm}</div>
          <div style={{ marginTop: 10, borderRadius: 12, background: "#1C1E1C", padding: "10px 14px", fontFamily: MONO, fontSize: 18, color: C.lime }}>🔗 {data.link}</div>
        </Card>
      ) : null}
      {frame < dmAt ? (
        <div style={{ position: "absolute", left: interpolate(frame, [follow - 14, follow, cAt + 4, cAt + 14], [760, cur.x, cur.x, 860], clamp), top: interpolate(frame, [follow - 14, follow, cAt + 4, cAt + 14], [MID + 200, MID - 40, MID - 40, MID + 70], clamp), width: 30, height: 30, borderRadius: "50%", background: "rgba(246,244,237,0.9)", boxShadow: Math.abs(frame - follow) < 8 ? `0 0 0 ${(frame - follow + 8) * 2}px rgba(167,255,63,0.35)` : undefined }} />
      ) : null}
    </>
  );
};

// ------------------------------------------------------------------ dispatcher
export const ExplainerScene: React.FC<SceneProps> = ({ data }) => {
  const c = cueOf(data);
  const k = data.kind as string;
  const T = data.theme === "cream" ? LIGHT : DARK;
  return (
    <TCtx.Provider value={T}>
      <AbsoluteFill>
        {k === "act" ? (
          <>
            <Canvas light={data.to !== "cream"} />
            <ActSwitch to={data.to ?? "cream"} />
          </>
        ) : (
          <Canvas light={T.light} />
        )}
        {k === "logo" ? <LogoRing data={data} c={c} /> : null}
        {k === "hub" ? <Hub data={data} c={c} /> : null}
        {k === "weights" ? <Weights c={c} /> : null}
        {k === "reveal" ? <Reveal data={data} /> : null}
        {k === "browser" ? <Browser data={data} c={c} /> : null}
        {k === "editor" ? <Editor data={data} /> : null}
        {k === "terminal" ? <Terminal data={data} /> : null}
        {k === "loop" ? <Loop data={data} c={c} /> : null}
        {k === "stat" ? <Stat data={data} c={c} /> : null}
        {k === "lessons" ? <Lessons data={data} c={c} /> : null}
        {k === "chart" ? <Chart data={data} /> : null}
        {k === "cta" ? <Cta data={data} c={c} /> : null}
      </AbsoluteFill>
    </TCtx.Provider>
  );
};

export const EXPLAINER_SCENES: Record<string, React.FC<SceneProps>> = { xBeat: ExplainerScene };
