// Cinematic news format ("newsjacking"): 3D hero shots, graded stock footage and premium motion graphics.
import React from "react";
import { Video } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import { Cine3D } from "./cine3d";
import type { SceneProps } from "./scenes";
import { Rich, usePop } from "./tut";

const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;

/** Letterbox bars, grain-friendly vignette and a thin lime timecode: the cinematic frame. */
const Letterbox: React.FC<{ label?: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "#000" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)", pointerEvents: "none" }} />
      {label ? (
        <div style={{ position: "absolute", left: 80, top: 172, fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: C.stone, display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: frame % 30 < 18 ? "#E5484D" : "transparent" }} />
          {label}
        </div>
      ) : null}
    </>
  );
};

const Stamp: React.FC<{ at: number; text: string; size?: number; color?: string; style?: React.CSSProperties }> = ({ at, text, size = 200, color = C.lime, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 220 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: size, letterSpacing: -2, color, scale: String(interpolate(s, [0, 1], [1.8, 1])), opacity: interpolate(frame - at, [0, 3], [0, 1], clamp), textShadow: `0 0 60px rgba(167,255,63,0.35)`, ...style }}>
      {text}
    </div>
  );
};

// ------------------------------------------------------------------ hook: the car arrives
export const CineHookScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const flare = interpolate(frame, [4, 12, 30], [0, 1, 0.55], clamp);
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <Cine3D mode="approach" model={data.model} hdr={data.hdr} fit={data.fit} />
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: flare, background: "radial-gradient(ellipse 60% 6% at 46% 52%, rgba(246,244,237,0.55), rgba(0,0,0,0) 70%)" }} />
      <Letterbox />
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontFamily: MONO, fontSize: 30, letterSpacing: 8, color: C.stone, opacity: interpolate(frame, [c("buy", 40) - 6, c("buy", 40) + 4], [0, 1], clamp) }}>{data.kicker}</div>
      <Stamp at={c("year", 70) + 10} text="2028" size={230} style={{ top: 580 }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the flip
export const CineFlipScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const pop = usePop();
  const thr = Math.round(D * 0.62);
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <CameraMotionBlur samples={data.blur ?? 5} shutterAngle={160}>
        <Cine3D mode="flip" model={data.model} hdr={data.hdr} fit={data.fit} />
      </CameraMotionBlur>
      <Letterbox label={data.tag} />
      <div style={{ position: "absolute", right: 80, top: 172, fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: C.grey, textAlign: "right" }}>
        VISUALIZATION
        <div style={{ fontSize: 13, letterSpacing: 1.5, marginTop: 6, color: "rgba(154,154,147,0.75)" }}>{data.credit}</div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1180, display: "flex", alignItems: "center", gap: 14, ...pop(thr, { rise: 16, scale: 0.8 }), opacity: frame < thr ? 0 : interpolate(frame, [thr, thr + 4, thr + 60, thr + 70], [0, 1, 1, 0], clamp) }}>
        <div style={{ width: 54, height: 3, background: C.lime }} />
        <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 3, color: C.lime }}>COLD GAS THRUSTERS</span>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ specs shatter into phones
export const CineSpecsScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const brk = c("stages", 40);
  const pop = usePop();
  const shards = 9;
  const specs = data.specs as [string, string][];
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      {/* phone grid behind */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 300, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
        {new Array(9).fill(0).map((_, i) => (
          <div key={i} style={{ height: 500, borderRadius: 34, background: "#111", padding: 8, boxShadow: "0 24px 50px rgba(0,0,0,0.6)", ...pop(brk + 4 + i * 2, { rise: 40, scale: 0.7 }) }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 26, overflow: "hidden", position: "relative" }}>
              <Video src={staticFile(data.clip)} muted loop style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", left: 10, bottom: 10, fontFamily: BODY, fontWeight: 800, fontSize: 20, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                ♥ {Math.floor(interpolate(frame, [brk + 6, brk + 90], [1, 40 + i * 13], clamp))}K
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* spec sheet that shatters */}
      {new Array(shards).fill(0).map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const t = Math.max(0, frame - brk);
        const dx = (random(`sx${i}`) - 0.5) * 1400 * (t / 30);
        const dy = (random(`sy${i}`) - 0.3) * 1600 * (t / 30) + t * t * 0.6;
        const rot = (random(`sr${i}`) - 0.5) * 120 * (t / 30);
        if (t > 40) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 100, top: 560, width: 880, height: 600, clipPath: `inset(${(row * 100) / 3}% ${100 - ((col + 1) * 100) / 3}% ${100 - ((row + 1) * 100) / 3}% ${(col * 100) / 3}%)`, translate: `${dx}px ${dy}px`, rotate: `${rot}deg`, opacity: interpolate(t, [0, 30, 40], [1, 1, 0], clamp), ...(frame < brk ? pop(0, { rise: 40, scale: 0.94 }) : {}) }}>
            <div style={{ width: 880, height: 600, background: C.cream, borderRadius: 30, padding: "40px 48px", boxSizing: "border-box", boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: "#77756D" }}>SPEC SHEET · TESLA CLAIMS</div>
              {specs.map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid #E2DED2", padding: "26px 0" }}>
                  <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 34, color: "#55534C" }}>{k}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 74, color: C.charcoal }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {frame >= brk && frame < brk + 6 ? <AbsoluteFill style={{ background: C.cream, opacity: interpolate(frame - brk, [0, 6], [0.5, 0], clamp) }} /> : null}
      <Letterbox />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 9 years of delays
export const CineTimelineScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const years = data.years as { y: string; label: string }[];
  const flipAt = c("anticipation", 60);
  const pan = interpolate(frame, [0, D], [0, 1], { ...clamp, easing: EASE_IO });
  const step = 300;
  const x0 = 540 - pan * step * (years.length - 1);
  const hype = interpolate(frame, [4, D - 6], [0.06, 1], { ...clamp, easing: EASE });
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <div style={{ position: "absolute", top: 860, left: 0, right: 0, height: 4, background: C.graphite }} />
      {years.map((yr, i) => {
        const x = x0 + i * step;
        const isLast = i === years.length - 1;
        const flipped = frame >= flipAt + i * 2;
        const flipP = interpolate(frame, [flipAt + i * 2, flipAt + i * 2 + 8], [0, 1], clamp);
        return (
          <div key={yr.y} style={{ position: "absolute", left: x - 140, top: 640, width: 280, textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontSize: isLast ? 130 : 96, color: isLast ? C.lime : C.cream, lineHeight: 1 }}>{yr.y}</div>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: isLast ? C.lime : C.stone, margin: "44px auto 0" }} />
            {!isLast ? (
              <div style={{ marginTop: 40, display: "inline-block", rotate: "-8deg", fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 3, padding: "8px 16px", borderRadius: 8, border: `3px solid ${flipped ? C.lime : "#E5484D"}`, color: flipped ? C.lime : "#E5484D", transform: `rotateX(${flipP < 0.5 ? flipP * 180 : (1 - flipP) * 180}deg)` }}>
                {flipP < 0.5 ? yr.label : "HYPE"}
              </div>
            ) : (
              <div style={{ marginTop: 40, fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 3, color: C.charcoal, background: C.lime, borderRadius: 8, padding: "8px 16px", display: "inline-block" }}>REVEAL</div>
            )}
          </div>
        );
      })}
      {/* hype meter */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1120 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: C.stone }}>
          <span>ANTICIPATION</span>
          <span style={{ color: C.lime }}>{Math.round(hype * 100)}%</span>
        </div>
        <div style={{ height: 18, borderRadius: 9, background: C.graphite, marginTop: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${hype * 100}%`, background: `linear-gradient(90deg, ${C.stone}, ${C.lime})`, borderRadius: 9 }} />
        </div>
      </div>
      <Letterbox />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the press did the advertising
export const CinePressScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const heads = data.headlines as { outlet: string; logo?: string; text: string }[];
  const calAt = c("earnings", 90);
  const drift = interpolate(frame, [0, 200], [0, -60], clamp);
  return (
    <AbsoluteFill style={{ background: C.charcoal, perspective: 1800 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 260 + drift, transform: "rotateX(14deg) rotateZ(-4deg)", transformOrigin: "50% 0%" }}>
        {heads.map((h, i) => (
          <div key={h.text} style={{ background: i % 2 ? "#F1EEE4" : C.cream, borderRadius: 18, padding: "22px 26px", marginBottom: 18, marginLeft: (i % 3) * 40, width: 860, boxShadow: "0 20px 40px rgba(0,0,0,0.55)", ...pop(c("press", 10) + i * 5, { rise: 60, scale: 0.85 }), opacity: frame >= calAt ? 0.35 : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {h.logo ? (
                <div style={{ width: 46, height: 46, borderRadius: 10, background: C.charcoal, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Img src={staticFile(h.logo)} style={{ width: 30, height: 30 }} />
                </div>
              ) : null}
              <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 26, color: C.charcoal }}>{h.outlet}</span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.08, color: C.charcoal, marginTop: 10 }}>{h.text}</div>
          </div>
        ))}
      </div>
      {frame >= calAt - 2 ? (
        <div style={{ position: "absolute", left: 290, top: 620, width: 500, borderRadius: 34, overflow: "hidden", background: C.cream, boxShadow: "0 40px 90px rgba(0,0,0,0.75)", ...pop(calAt, { rise: 80, scale: 0.6 }) }}>
          <div style={{ background: C.lime, padding: "18px 0", textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 34, letterSpacing: 6, color: C.charcoal }}>OCT</div>
          <div style={{ textAlign: "center", fontFamily: SERIF, fontSize: 260, lineHeight: 1.05, color: C.charcoal }}>21</div>
          <div style={{ textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: "#55534C", paddingBottom: 26 }}>EARNINGS</div>
        </div>
      ) : null}
      <Letterbox />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the lesson: real crowd footage, graded to brand
export const CineLessonScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const lines = data.lines as { text: string; cue: string }[];
  const push = interpolate(frame, [0, 240], [1.05, 1.18], clamp);
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <AbsoluteFill style={{ scale: String(push) }}>
        <Video src={staticFile(data.footage)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.25) brightness(0.55)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.15) 40%, rgba(10,10,10,0.92) 100%)` }} />
      <AbsoluteFill style={{ mixBlendMode: "overlay", background: `radial-gradient(ellipse 70% 40% at 50% 30%, rgba(167,255,63,0.45), rgba(0,0,0,0) 70%)` }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 760 }}>
        {lines.map((l, i) => {
          const at = c(l.cue, 10 + i * 30);
          const p = interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: EASE });
          return (
            <div key={i} style={{ overflow: "hidden", paddingBottom: 6 }}>
              <div style={{ fontFamily: i === 0 ? MONO : SERIF, fontSize: i === 0 ? 30 : i === 1 ? 96 : 104, letterSpacing: i === 0 ? 5 : -1, lineHeight: 1.02, color: i === 0 ? C.lime : C.cream, translate: `0 ${(1 - p) * 105}%`, opacity: p, marginTop: i === 0 ? 0 : 14 }}>
                <Rich text={l.text} italic />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", right: 80, top: 172, fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: "rgba(246,244,237,0.5)" }}>{data.credit}</div>
      <Letterbox />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ viral: followers, growth curve, avatar swarm, notifications
export const CineViralScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const go = c("viral", 10);
  const t = interpolate(frame, [go - 10, D - 4], [0, 1], { ...clamp, easing: Easing2 });
  const followers = Math.round(1200 + t * t * 998800);
  const fmt = followers >= 1e6 ? `${(followers / 1e6).toFixed(1)}M` : followers >= 1e3 ? `${(followers / 1e3).toFixed(followers >= 1e5 ? 0 : 1)}K` : String(followers);
  const W = 920;
  const H = 360;
  const pts = new Array(60).fill(0).map((_, i) => {
    const x = (i / 59) * W;
    const v = Math.pow(i / 59, 3.2);
    return [x, H - v * (H - 20) - Math.sin(i * 1.7) * 6 * (1 - v)] as [number, number];
  });
  const shown = Math.max(2, Math.floor(t * 60));
  const d = pts.slice(0, shown).map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const notes = data.notes as string[];
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      {/* avatar swarm */}
      {new Array(36).fill(0).map((_, i) => {
        const at = go + i * 2;
        if (frame < at) return null;
        const ang = random(`a${i}`) * Math.PI * 2;
        const r = 390 + random(`r${i}`) * 160;
        const p = spring({ frame: frame - at, fps: 30, config: { damping: 14 } });
        return (
          <Img key={i} src={staticFile(`media/li2/person${(i % 6) + 1}.jpg`)} style={{ position: "absolute", left: 540 + Math.cos(ang) * r * p - 30, top: 560 + Math.sin(ang) * r * 0.75 * p - 30, width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: `3px solid ${i % 5 === 0 ? C.lime : C.cream}`, opacity: 0.35 + 0.5 * p }} />
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: C.stone, ...pop(go - 6) }}>FOLLOWERS</div>
        <div style={{ fontFamily: SERIF, fontSize: 250, lineHeight: 1, color: C.lime, ...pop(go - 6, { scale: 0.8 }), textShadow: "0 0 80px rgba(167,255,63,0.35)" }}>{fmt}</div>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", left: 80, top: 860 }}>
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={C.lime} stopOpacity={0.45} />
            <stop offset="1" stopColor={C.lime} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`${d} L${pts[shown - 1][0]},${H} L0,${H} Z`} fill="url(#g)" />
        <path d={d} stroke={C.lime} strokeWidth={6} fill="none" strokeLinecap="round" />
        <circle cx={pts[shown - 1][0]} cy={pts[shown - 1][1]} r={12} fill={C.lime} />
      </svg>
      {notes.map((n, i) => (
        <div key={n} style={{ position: "absolute", left: i % 2 ? 560 : 100, top: 220 + Math.floor(i / 2) * 84, background: C.cream, color: C.charcoal, borderRadius: 999, padding: "12px 24px", fontFamily: BODY, fontWeight: 800, fontSize: 28, boxShadow: "0 16px 30px rgba(0,0,0,0.5)", ...pop(go + 8 + i * 9, { rise: 30, scale: 0.6 }), opacity: frame < go + 8 + i * 9 ? 0 : 1 }}>
          {n}
        </div>
      ))}
      <Letterbox />
    </AbsoluteFill>
  );
};
const Easing2 = (x: number) => x;

export const CINE_SCENES: Record<string, React.FC<SceneProps>> = {
  cineHook: CineHookScene,
  cineFlip: CineFlipScene,
  cineSpecs: CineSpecsScene,
  cineTimeline: CineTimelineScene,
  cinePress: CinePressScene,
  cineLesson: CineLessonScene,
  cineViral: CineViralScene,
};
