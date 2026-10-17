// "Heat" scene family (9:16): graded real footage with a live thermometer, a creeping dashboard,
// then-and-collapse timeline cards, an industry heat grid and a thermostat with a jump line.
// Built for the boiling-frog film; reusable for any "slow decline" story.
import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, BRAND, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";

const HOT = "#E5484D";
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t)))).join(",")})`;
};
const heatColor = (t: number) => (t < 0.5 ? mix(C.lime, "#F5C451", t * 2) : mix("#F5C451", HOT, (t - 0.5) * 2));
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;

const useBlurIn = () => {
  const frame = useCurrentFrame();
  return (at: number, dur = 10, rise = 18): React.CSSProperties => {
    const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EASE });
    return { opacity: p, filter: `blur(${(1 - p) * 14}px)`, translate: `0 ${(1 - p) * rise}px` };
  };
};

/** Words that land one by one; `*word*` is the accent (italic serif, coloured). */
const Line: React.FC<{ text: string; at: number; size: number; accentColor?: string; step?: number; serifAll?: boolean }> = ({ text, at, size, accentColor = C.lime, step = 3, serifAll }) => {
  const blur = useBlurIn();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.26}px`, fontFamily: serifAll ? SERIF : HEAD, fontWeight: serifAll ? 400 : 700, fontSize: size, lineHeight: 1.06, color: C.cream, letterSpacing: serifAll ? 0 : -1.5, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>
      {words.map((w, i) => {
        const acc = w.startsWith("*");
        const clean = w.replace(/\*/g, "");
        return (
          <span key={i} style={{ ...blur(at + i * step), ...(acc ? { fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: accentColor, fontSize: size * 1.12 } : {}) }}>
            {clean}
          </span>
        );
      })}
    </div>
  );
};

/** Live thermometer: tube, ticks, fill colour from cool lime to hot red, °C readout. */
export const Thermometer: React.FC<{ temp: number; x?: number; y?: number; h?: number }> = ({ temp, x = 900, y = 520, h = 720 }) => {
  const t = (temp - 10) / 90;
  const col = heatColor(t);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 110, height: h + 120 }}>
      <div style={{ position: "absolute", left: 35, top: 0, width: 40, height: h, borderRadius: 20, background: "rgba(246,244,237,0.12)", border: "2px solid rgba(246,244,237,0.35)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 6, right: 6, bottom: 6, height: `${Math.max(4, t * 100)}%`, borderRadius: 14, background: col, boxShadow: `0 0 30px ${col}` }} />
      </div>
      <div style={{ position: "absolute", left: 15, top: h - 30, width: 80, height: 80, borderRadius: "50%", background: col, boxShadow: `0 0 40px ${col}` }} />
      {[20, 40, 60, 80, 100].map((v) => (
        <div key={v} style={{ position: "absolute", left: -48, top: h - ((v - 10) / 90) * h - 10, fontFamily: MONO, fontSize: 18, color: "rgba(246,244,237,0.6)" }}>
          {v}°
        </div>
      ))}
      <div style={{ position: "absolute", left: -10, top: h + 70, width: 130, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 34, color: col }}>{Math.round(temp)}°C</div>
    </div>
  );
};

/** Full-bleed graded footage with a push-in, optional heat tint, kinetic text and a thermometer. */
export const HFootageScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const heat = interpolate(frame, [0, D], data.heat ?? [0, 0], clamp);
  const temp = data.thermo ? interpolate(frame, [c(data.thermo.cue ?? "", 0) + (data.thermo.offset ?? 0), D - 4], [data.thermo.from, data.thermo.to], { ...clamp, easing: data.thermo.ease === "in" ? (x: number) => x * x : EASE_IO }) : 0;
  // Manual cover-fit: the Video element ignores objectFit, so size the box from the clip's aspect.
  const W = 1080;
  const H = 1920;
  const aspect: number = data.aspect ?? 16 / 9;
  const vw = Math.max(W, H * aspect);
  const vh = vw / aspect;
  const [fx, fy] = (data.focus ?? "50% 45%").split(" ").map((v: string) => parseFloat(v) / 100);
  const lines = (data.lines ?? []) as { text: string; cue?: string; at?: number; size?: number; serif?: boolean }[];
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <AbsoluteFill style={{ scale: String(interpolate(frame, [0, D], [1.06, 1.18], clamp)), transformOrigin: data.focus ?? "50% 45%" }}>
        <div style={{ position: "absolute", left: (W - vw) * fx, top: (H - vh) * fy, width: vw, height: vh }}>
          <Video src={staticFile(data.clip)} muted trimBefore={Math.round((data.startFrom ?? 0) * 30)} playbackRate={data.rate ?? 1} style={{ width: "100%", height: "100%", filter: `saturate(${data.saturate ?? 0.75}) contrast(1.12) brightness(${data.brightness ?? 0.82})` }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.05) 35%, rgba(10,10,10,0.15) 60%, rgba(10,10,10,0.85) 100%)` }} />
      <AbsoluteFill style={{ background: HOT, mixBlendMode: "soft-light", opacity: heat * 0.85 }} />
      <AbsoluteFill style={{ background: C.lime, mixBlendMode: "soft-light", opacity: (data.coolTint ?? 0.12) * (1 - heat) }} />
      {data.thermo ? <Thermometer temp={temp} /> : null}
      {data.kicker ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: 8, color: data.kickerHot ? HOT : C.lime, ...useBlurIn()(2) }}>{data.kicker}</div>
      ) : null}
      <div style={{ position: "absolute", left: 70, right: data.thermo ? 200 : 70, top: data.textTop ?? 1040, display: "flex", flexDirection: "column", gap: 18 }}>
        {lines.map((l, i) => (
          <Line key={i} text={l.text} at={l.cue ? c(l.cue, 6) : l.at ?? 4 + i * 14} size={l.size ?? 84} serifAll={l.serif} accentColor={data.accentHot ? HOT : C.lime} />
        ))}
      </div>
      {data.credit ? <div style={{ position: "absolute", right: 60, top: 175, fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: "rgba(246,244,237,0.5)" }}>{data.credit}</div> : null}
    </AbsoluteFill>
  );
};

/** Business metrics that worsen a little at a time while the frame slowly heats. */
export const HDashboardScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const blur = useBlurIn();
  const t = interpolate(frame, [0, D], [0, 1], clamp);
  const metrics = data.metrics as { label: string; from: number; to: number; unit: string; dec?: number; worseUp?: boolean }[];
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 80%, ${mix("#1A1A18", "#3A0E0F", t)}, ${C.charcoal} 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: 8, color: C.stone, ...blur(0) }}>{data.kicker}</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 320, display: "grid", gap: 22 }}>
        {metrics.map((m, i) => {
          const v = interpolate(t, [0, 1], [m.from, m.to]);
          const pts = new Array(24).fill(0).map((_, k) => {
            const p = k / 23;
            const shown = p <= t;
            const val = m.from + (m.to - m.from) * p + Math.sin(k * 1.7 + i) * Math.abs(m.to - m.from) * 0.05;
            return shown ? `${k === 0 ? "M" : "L"}${p * 360},${70 - ((val - Math.min(m.from, m.to)) / (Math.abs(m.to - m.from) || 1)) * 56}` : "";
          }).join(" ");
          return (
            <div key={m.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "26px 30px", borderRadius: 24, background: "rgba(246,244,237,0.05)", border: `2px solid ${mix("#2C2C2A", HOT, t * 0.8)}`, ...blur(4 + i * 5, 10, 30) }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: C.grey }}>{m.label}</div>
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 76, color: C.cream, fontVariantNumeric: "tabular-nums" }}>
                  {v.toFixed(m.dec ?? 0)}
                  <span style={{ fontSize: 34, color: C.grey, marginLeft: 8 }}>{m.unit}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <svg width={360} height={80} style={{ display: "block" }}>
                  <path d={pts} stroke={heatColor(t)} strokeWidth={5} fill="none" strokeLinecap="round" />
                </svg>
                <div style={{ fontFamily: MONO, fontSize: 22, color: heatColor(t) }}>{m.worseUp ? "▲" : "▼"} a little each month</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1120, textAlign: "center" }}>
        <Line text={data.line} at={cueOf(data)("line", 30)} size={78} accentColor={HOT} />
      </div>
    </AbsoluteFill>
  );
};

/** A company's two moments: the opportunity and the collapse, with the heat rising between. */
export const HTimelineScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const blur = useBlurIn();
  const second = c("second", Math.round(D * 0.5));
  const line = interpolate(frame, [10, second], [0, 1], { ...clamp, easing: EASE_IO });
  const stamp = spring({ frame: frame - second, fps: 30, config: { damping: 11, stiffness: 200 } });
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.charcoal} 30%, ${mix("#141414", "#3A0E0F", line)} 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 10, color: C.stone, ...blur(0) }}>{data.company}</div>
      <div style={{ position: "absolute", left: 110, top: 360, bottom: 520, width: 8, borderRadius: 4, background: "rgba(246,244,237,0.12)" }}>
        <div style={{ width: "100%", height: `${line * 100}%`, borderRadius: 4, background: `linear-gradient(${C.lime}, ${HOT})` }} />
      </div>
      <div style={{ position: "absolute", left: 170, right: 80, top: 330, ...blur(4, 12, 30) }}>
        <div style={{ fontFamily: SERIF, fontSize: 170, lineHeight: 1, color: C.lime }}>{data.y1}</div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 44, lineHeight: 1.25, color: C.cream, marginTop: 10 }}>{data.e1}</div>
      </div>
      <div style={{ position: "absolute", left: 170, right: 80, top: 860, opacity: frame >= second ? 1 : 0, scale: String(interpolate(stamp, [0, 1], [1.5, 1])) }}>
        <div style={{ fontFamily: SERIF, fontSize: 170, lineHeight: 1, color: HOT }}>{data.y2}</div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 44, lineHeight: 1.25, color: C.cream, marginTop: 10 }}>{data.e2}</div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1330, fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: C.grey, opacity: interpolate(frame, [second + 10, second + 20], [0, 1], clamp) }}>{data.source}</div>
    </AbsoluteFill>
  );
};

/** Industries heating up one tile at a time. */
export const HHeatGridScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const blur = useBlurIn();
  const tiles: string[] = data.tiles;
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 300, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22 }}>
        {tiles.map((t, i) => {
          const r = random(`hg${i}`);
          const h = interpolate(frame, [8 + r * 20, D - 10 - (1 - r) * 20], [0, 0.55 + r * 0.45], clamp);
          return (
            <div key={t} style={{ height: 160, borderRadius: 24, padding: "22px 26px", background: `linear-gradient(135deg, ${mix("#1A1A18", "#4A1214", h)}, ${mix("#151515", "#2A0A0B", h)})`, border: `2px solid ${heatColor(h)}`, display: "flex", flexDirection: "column", justifyContent: "space-between", ...blur(i * 3, 10, 24) }}>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 42, color: C.cream }}>{t}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 24, color: heatColor(h) }}>
                <span>{Math.round(20 + h * 80)}°C</span>
                <span>{h > 0.6 ? "HOT" : h > 0.3 ? "WARM" : "OK"}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1130, textAlign: "center" }}>
        <Line text={data.line} at={cueOf(data)("line", 20)} size={78} accentColor={HOT} />
      </div>
    </AbsoluteFill>
  );
};

/** Thermostat dial: the needle climbs, crosses your jump line, and "JUMP" lands. */
export const HThermostatScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const lineAt = c("line", 20);
  const cross = Math.round(D * 0.62);
  const needle = interpolate(frame, [0, cross, D], [-120, 38, 52], { ...clamp, easing: EASE_IO });
  const jumpP = spring({ frame: frame - cross, fps: 30, config: { damping: 10, stiffness: 220 } });
  const R = 300;
  const cx = 540;
  const cy = 760;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [cx + R * Math.sin((a * Math.PI) / 180), cy - R * Math.cos((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="dial" x1="0" x2="1">
            <stop offset="0" stopColor={C.lime} />
            <stop offset="0.6" stopColor="#F5C451" />
            <stop offset="1" stopColor={HOT} />
          </linearGradient>
        </defs>
        <path d={arc(-120, 120)} stroke="rgba(246,244,237,0.12)" strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={arc(-120, Math.max(-119, needle))} stroke="url(#dial)" strokeWidth={34} fill="none" strokeLinecap="round" />
        {frame >= lineAt ? (
          <g opacity={interpolate(frame, [lineAt, lineAt + 8], [0, 1], clamp)}>
            <line x1={cx + (R - 60) * Math.sin((30 * Math.PI) / 180)} y1={cy - (R - 60) * Math.cos((30 * Math.PI) / 180)} x2={cx + (R + 60) * Math.sin((30 * Math.PI) / 180)} y2={cy - (R + 60) * Math.cos((30 * Math.PI) / 180)} stroke={C.cream} strokeWidth={8} strokeLinecap="round" />
            <text x={cx + (R + 90) * Math.sin((30 * Math.PI) / 180)} y={cy - (R + 90) * Math.cos((30 * Math.PI) / 180)} fill={C.cream} style={{ fontFamily: MONO, fontSize: 28, fontWeight: 600 }} textAnchor="middle">
              YOUR JUMP LINE
            </text>
          </g>
        ) : null}
        <g transform={`rotate(${needle} ${cx} ${cy})`}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - R + 40} stroke={C.cream} strokeWidth={10} strokeLinecap="round" />
        </g>
        <circle cx={cx} cy={cy} r={30} fill={C.cream} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: C.grey }}>{data.metric}</div>
      {frame >= cross ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: HEAD, fontWeight: 700, fontSize: 150, letterSpacing: -4, color: C.charcoal, background: C.lime, padding: "6px 50px", borderRadius: 28, scale: String(interpolate(jumpP, [0, 1], [0.5, 1])), rotate: `${(1 - jumpP) * -8}deg`, boxShadow: "0 0 80px rgba(167,255,63,0.4)" }}>JUMP</span>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 70, right: 70, top: 1180, textAlign: "center" }}>
        <Line text={data.text} at={4} size={70} />
      </div>
    </AbsoluteFill>
  );
};

export const HEAT_SCENES: Record<string, React.FC<SceneProps>> = {
  hFootage: HFootageScene,
  hDashboard: HDashboardScene,
  hTimeline: HTimelineScene,
  hHeatGrid: HHeatGridScene,
  hThermostat: HThermostatScene,
};

/** 9:16 grid-safe cover: real frog, heat grade, thermometer, headline inside the 3:4 centre crop. */
export const ThumbFrog: React.FC<{ photo: string; kicker: string; line1: string; accent: string; temp: number; guides?: boolean }> = ({ photo, kicker, line1, accent, temp, guides }) => (
  <AbsoluteFill style={{ background: C.charcoal, color: C.cream }}>
    <Img src={staticFile(photo)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover", filter: "saturate(1.05) contrast(1.1) brightness(0.9)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.1) 22%, rgba(10,10,10,0.1) 45%, rgba(10,10,10,0.92) 68%, #0A0A0A 100%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 40% at 50% 100%, rgba(229,72,77,0.45), rgba(0,0,0,0) 70%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 34, letterSpacing: 8, color: C.lime }}>{kicker}</div>
    <Thermometer temp={temp} x={890} y={420} h={560} />
    <div style={{ position: "absolute", left: 60, right: 60, top: 1080, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 112, lineHeight: 1.02, letterSpacing: -3, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>
      <div>{line1}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: HOT, fontSize: 150, lineHeight: 1.05 }}>{accent}</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1580, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
      <Img src={staticFile(BRAND.logo.monogramPublic)} style={{ width: 56, height: 56 }} />
      <span style={{ fontFamily: MONO, fontSize: 30, color: C.stone }}>
        {BRAND.wordmark.left}
        <span style={{ color: C.lime }}>{BRAND.wordmark.dot}</span>
        {BRAND.wordmark.right}
      </span>
    </div>
    {guides ? <div style={{ position: "absolute", left: 0, right: 0, top: 240, height: 1440, border: "4px dashed #E5484D" }} /> : null}
  </AbsoluteFill>
);

/** Grid-matching 9:16 cover (Thumb916 grammar, no photo): kicker, headline with a lime serif accent, a heat bar with the jump line, wordmark. */
export const ThumbHeat: React.FC<{ kicker: string; line1: string; line2: string; accent: string; guides?: boolean }> = ({ kicker, line1, line2, accent, guides }) => {
  const mark = 0.72;
  return (
    <AbsoluteFill style={{ background: C.charcoal, fontFamily: BODY, color: C.cream }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 45% at 50% 62%, rgba(167,255,63,0.16), rgba(0,0,0,0) 70%)" }} />
      {new Array(48).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 120 + (i % 12) * 72, top: 1290 + Math.floor(i / 12) * 72, width: 40, height: 40, background: C.lime, opacity: 0.04 + 0.42 * random(`v${i}`) * (Math.floor(i / 12) / 4 + 0.2) }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 34, letterSpacing: 8, color: C.lime }}>{kicker}</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 420, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 118, lineHeight: 1.02, letterSpacing: -3 }}>
        <div>{line1}</div>
        <div style={{ marginTop: 26 }}>{line2}</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: C.lime, fontSize: 150, lineHeight: 1.0 }}>{accent}</div>
      </div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 1040, padding: "30px 36px 26px", borderRadius: 26, background: C.graphite, border: "2px solid rgba(167,255,63,0.4)" }}>
        <div style={{ position: "relative", height: 26, borderRadius: 13, background: `linear-gradient(90deg, ${C.lime}, #F5C451 60%, ${HOT})` }}>
          <div style={{ position: "absolute", left: `${mark * 100}%`, top: -14, width: 8, height: 54, marginLeft: -4, borderRadius: 4, background: C.cream, boxShadow: "0 0 18px rgba(246,244,237,0.7)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: C.grey }}>
          <span>COMFORTABLE</span>
          <span style={{ color: C.cream }}>YOUR JUMP LINE</span>
          <span style={{ color: HOT }}>TOO LATE</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1580, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
        <Img src={staticFile(BRAND.logo.monogramPublic)} style={{ width: 56, height: 56 }} />
        <span style={{ fontFamily: MONO, fontSize: 30, color: C.stone }}>
          {BRAND.wordmark.left}
          <span style={{ color: C.lime }}>{BRAND.wordmark.dot}</span>
          {BRAND.wordmark.right}
        </span>
      </div>
      {guides ? <div style={{ position: "absolute", left: 0, right: 0, top: 240, height: 1440, border: "4px dashed #E5484D" }} /> : null}
    </AbsoluteFill>
  );
};
