// "Ad breakdown" scene family (9:16): recreates an ad's idea with our own motion graphics (no footage from the ad),
// then explains why it works. On-screen text is labels, quotes and data only; captions carry the narration.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";
import { usePop } from "./tut";

const AMBER = "#F5C451";
const HOT = "#E5484D";
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;

const Warm: React.FC<{ tint?: string }> = ({ tint = "rgba(245,196,81,0.10)" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 50% at ${50 + Math.sin(frame / 45) * 10}% ${45 + Math.cos(frame / 55) * 6}%, ${tint}, rgba(0,0,0,0) 72%)` }} />
    </AbsoluteFill>
  );
};
const Kicker: React.FC<{ text: string; at?: number; top?: number; color?: string }> = ({ text, at = 0, top = 290, color = C.stone }) => {
  const pop = usePop();
  return <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: 4, color, ...pop(at, { scale: 1, rise: 8 }) }}>{text}</div>;
};

/** Simple flat person: head + body, coloured. */
const Person: React.FC<{ x: number; y: number; s?: number; col: string; mood?: "ok" | "worry" | "happy"; at?: number }> = ({ x, y, s = 1, col, mood = "ok", at = 0 }) => {
  const pop = usePop();
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 9 + x) * 3;
  return (
    <div style={{ position: "absolute", left: x, top: y + bob, width: 120 * s, height: 220 * s, ...pop(at, { rise: 30, scale: 0.7 }) }}>
      <div style={{ position: "absolute", left: 30 * s, top: 0, width: 60 * s, height: 60 * s, borderRadius: "50%", background: "#C98E64" }}>
        <div style={{ position: "absolute", left: 16 * s, top: 24 * s, width: 7 * s, height: 7 * s, borderRadius: "50%", background: C.charcoal }} />
        <div style={{ position: "absolute", left: 37 * s, top: 24 * s, width: 7 * s, height: 7 * s, borderRadius: "50%", background: C.charcoal }} />
        <div style={{ position: "absolute", left: 20 * s, top: 40 * s, width: 20 * s, height: 8 * s, borderRadius: mood === "worry" ? "10px 10px 0 0" : "0 0 10px 10px", borderBottom: mood === "worry" ? "none" : `${3 * s}px solid ${C.charcoal}`, borderTop: mood === "worry" ? `${3 * s}px solid ${C.charcoal}` : "none" }} />
      </div>
      <div style={{ position: "absolute", left: 10 * s, top: 66 * s, width: 100 * s, height: 150 * s, borderRadius: `${40 * s}px ${40 * s}px ${14 * s}px ${14 * s}px`, background: col }} />
    </div>
  );
};

const Bubble: React.FC<{ text: string; at: number; x: number; y: number; size?: number; tail?: "left" | "right"; color?: string }> = ({ text, at, x, y, size = 60, tail = "left", color = C.cream }) => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - at, fps: 30, config: { damping: 11, stiffness: 190 } });
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, scale: String(0.5 + 0.5 * s), opacity: Math.min(1, s * 2), transformOrigin: tail === "left" ? "0% 100%" : "100% 100%" }}>
      <div style={{ background: color, color: C.charcoal, borderRadius: 34, padding: "20px 30px", fontFamily: SERIF, fontStyle: "italic", fontSize: size, lineHeight: 1.05, whiteSpace: "nowrap", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>{text}</div>
      <div style={{ position: "absolute", [tail]: 40, bottom: -18, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: `22px solid ${color}` }} />
    </div>
  );
};

// ------------------------------------------------------------------ hook: the line every Indian kid heard
export const ABubbleScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const echo = c("echo", 40);
  return (
    <AbsoluteFill>
      <Warm />
      <AbsoluteFill style={{ scale: String(interpolate(frame, [0, D], [1, 1.06], clamp)) }}>
        <Person x={140} y={760} s={1.5} col="#B5476B" at={0} />
        <Bubble text={data.line} at={6} x={290} y={560} size={84} />
        {new Array(6).fill(0).map((_, i) => {
          const r = random(`ab${i}`);
          return <Bubble key={i} text={data.line} at={echo + i * 5} x={i < 3 ? 120 + r * 420 : 480 + r * 220} y={i < 3 ? 300 + i * 72 : 760 + (i - 3) * 72} size={30} tail={r > 0.5 ? "right" : "left"} color={i % 2 ? AMBER : C.stone} />;
        })}
        <Person x={720} y={1000} s={0.85} col={C.lime} mood="worry" at={14} />
      </AbsoluteFill>
      <Kicker text={data.kicker} at={echo + 10} top={1240} color={C.grey} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the morph: a size-up school shirt becomes a size-up TV
export const ASizeScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const tvAt = c("tv", 70);
  const m = interpolate(frame, [tvAt - 8, tvAt + 16], [0, 1], { ...clamp, easing: EASE_IO });
  const sizes = data.mode === "tv" ? ['43"', '55"', '65"'] : ["S", "M", "L"];
  const stepAt = [c("s0", 10), c("s1", 30), c("s2", 50)];
  const idx = stepAt.filter((a) => frame >= a).length - 1;
  const grow = interpolate(frame, [stepAt[0], stepAt[2] + 10], [0.75, 1.15], { ...clamp, easing: EASE });
  return (
    <AbsoluteFill>
      <Warm tint={data.mode === "tv" ? "rgba(167,255,63,0.10)" : undefined} />
      <Kicker text={data.kicker} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, height: 560, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {data.mode === "tv" ? (
          <div style={{ width: 640 * grow, height: 380 * grow, borderRadius: 18, background: "#0E0E0E", border: `${10 * grow}px solid #2B2B2B`, boxShadow: `0 0 ${80 * grow}px rgba(167,255,63,${0.15 + 0.2 * (idx / 2)})`, position: "relative", overflow: "hidden", ...pop(0, { scale: 0.7 }) }}>
            <AbsoluteFill style={{ background: `linear-gradient(135deg, #1B4D3E, #0E2A4A ${50 + Math.sin(frame / 12) * 20}%, #3A1E4A)` }} />
            <div style={{ position: "absolute", left: "45%", top: "38%", width: 0, height: 0, borderTop: "40px solid transparent", borderBottom: "40px solid transparent", borderLeft: `64px solid ${C.cream}`, opacity: 0.85 }} />
            <div style={{ position: "absolute", left: "50%", bottom: -60, width: 120, height: 50, marginLeft: -60, background: "#2B2B2B" }} />
          </div>
        ) : (
          <svg width={460 * grow} height={480 * grow} viewBox="0 0 100 104" style={{ ...pop(0, { scale: 0.7 }), filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))" }}>
            <path d="M30 6 L42 2 Q50 10 58 2 L70 6 L96 22 L86 40 L76 34 L76 100 L24 100 L24 34 L14 40 L4 22 Z" fill={C.cream} />
            <path d="M42 2 Q50 14 58 2" stroke="#BFBBAE" strokeWidth={2} fill="none" />
            <rect x={60} y={40} width={10} height={12} rx={2} fill="none" stroke="#3D5A80" strokeWidth={1.5} />
            <path d="M24 100 L76 100" stroke="#BFBBAE" strokeWidth={2} />
          </svg>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, display: "flex", justifyContent: "center", gap: 22 }}>
        {sizes.map((s, i) => {
          const on = i === idx;
          return (
            <div key={s} style={{ minWidth: 130, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 56, padding: "14px 22px", borderRadius: 20, background: on ? (i === 2 ? C.lime : AMBER) : "#1C1C1C", color: on ? C.charcoal : "#555", scale: on ? "1.12" : "1", ...pop(stepAt[i] - 6, { rise: 20, scale: 0.6 }) }}>
              {s}
            </div>
          );
        })}
      </div>
      {data.mode !== "tv" && frame >= stepAt[2] + 6 ? <Kicker text={data.note} at={stepAt[2] + 6} top={1180} color={AMBER} /> : null}
      {data.mode === "tv" && frame >= stepAt[2] + 6 ? <Kicker text={data.note} at={stepAt[2] + 6} top={1180} color={C.lime} /> : null}
      <span style={{ display: "none" }}>{m}</span>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the four beats, as a storyboard strip
export const ABeatsScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const beats = data.beats as { tag: string; icon: string; text: string; cue: string }[];
  const cur = beats.filter((b, i) => frame >= c(b.cue, 10 + i * 30)).length - 1;
  return (
    <AbsoluteFill>
      <Warm />
      <Kicker text={data.kicker} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 370, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {beats.map((b, i) => {
          const at = c(b.cue, 10 + i * 30);
          const on = i === cur;
          return (
            <div key={b.tag} style={{ height: 330, borderRadius: 26, background: on ? C.cream : "#171717", color: on ? C.charcoal : C.cream, border: on ? `4px solid ${i === 3 ? C.lime : AMBER}` : "2px solid #2A2A2A", padding: "22px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", scale: on ? "1.03" : "1", ...pop(at, { rise: 30, scale: 0.85 }) }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: on ? "#77756D" : C.grey }}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{b.tag}</span>
              </div>
              <div style={{ fontSize: 96, textAlign: "center", lineHeight: 1 }}>{b.icon}</div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 25, lineHeight: 1.25 }}>{b.text}</div>
            </div>
          );
        })}
      </div>
      <Kicker text={data.note} at={20} top={1110} color={C.grey} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ why it works (three variants)
export const AWhyScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const kind = data.kind as "truth" | "objection" | "nostalgia";
  const hit = c("hit", 40);
  let body: React.ReactNode = null;
  if (kind === "truth") {
    body = (
      <div style={{ position: "absolute", left: 60, right: 60, top: 400, height: 700 }}>
        {new Array(12).fill(0).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const lit = frame >= hit + i * 3;
          return (
            <div key={i} style={{ position: "absolute", left: col * 240, top: row * 220, width: 200, height: 180, ...pop(4 + i * 2, { rise: 20, scale: 0.8 }) }}>
              <svg width={200} height={180} viewBox="0 0 100 90">
                <path d="M10 45 L50 10 L90 45 L90 88 L10 88 Z" fill={lit ? "#2A2418" : "#171717"} stroke={lit ? AMBER : "#333"} strokeWidth={2} />
                <rect x={42} y={60} width={16} height={28} fill={lit ? AMBER : "#2A2A2A"} />
              </svg>
              {lit ? <div style={{ position: "absolute", left: 30, top: -20, background: AMBER, color: C.charcoal, borderRadius: 12, padding: "4px 10px", fontFamily: SERIF, fontStyle: "italic", fontSize: 22, whiteSpace: "nowrap" }}>{data.line}</div> : null}
            </div>
          );
        })}
      </div>
    );
  } else if (kind === "objection") {
    const items = data.items as string[];
    body = (
      <div style={{ position: "absolute", left: 90, right: 90, top: 420, display: "flex", flexDirection: "column", gap: 22 }}>
        {items.map((t, i) => {
          const struck = frame >= hit + i * 8;
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 20, borderRadius: 24, padding: "24px 28px", background: "#171717", border: `2px solid ${struck ? C.lime : HOT}`, ...pop(6 + i * 6, { rise: 24, scale: 0.9 }) }}>
              <span style={{ fontSize: 40 }}>{struck ? "✅" : "😬"}</span>
              <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: struck ? C.grey : C.cream, textDecoration: struck ? "line-through" : "none", textDecorationColor: C.lime, textDecorationThickness: 5 }}>{t}</span>
            </div>
          );
        })}
        {frame >= hit + items.length * 8 ? (
          <div style={{ alignSelf: "center", marginTop: 20, ...pop(hit + items.length * 8, { rise: 20, scale: 0.6 }) }}>
            <Bubble text={data.line} at={hit + items.length * 8} x={-260} y={0} size={56} />
          </div>
        ) : null}
      </div>
    );
  } else {
    const g = interpolate(frame, [hit, hit + 30], [0, 1], { ...clamp, easing: EASE });
    body = (
      <div style={{ position: "absolute", left: 90, right: 90, top: 420 }}>
        <div style={{ height: 420, borderRadius: 30, overflow: "hidden", position: "relative", background: "#171717", border: "2px solid #2A2A2A", ...pop(0, { rise: 30, scale: 0.92 }) }}>
          <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(245,196,81,${0.35 * g}), rgba(181,71,107,${0.25 * g}))`, filter: `sepia(${g})` }} />
          <div style={{ position: "absolute", left: 60, right: 60, top: 70, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 120, lineHeight: 1, filter: `grayscale(${1 - g})` }}>🧸</div>
              <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.stone, marginTop: 14 }}>NOSTALGIA</div>
            </div>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 70, color: C.cream }}>→</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 120 * (1 - 0.35 * g), lineHeight: 1 }}>💸</div>
              <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.stone, marginTop: 14 }}>PRICE PAIN</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, bottom: 50, height: 26, borderRadius: 10, background: "#262626" }}>
            <div style={{ width: `${100 - 40 * g}%`, height: "100%", borderRadius: 10, background: `linear-gradient(90deg, ${C.lime}, ${HOT})` }} />
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 2, color: C.grey, marginTop: 18, textAlign: "center", ...pop(hit + 10, { scale: 1, rise: 6 }) }}>{data.source}</div>
      </div>
    );
  }
  return (
    <AbsoluteFill>
      <Warm tint={kind === "objection" ? "rgba(167,255,63,0.08)" : undefined} />
      <Kicker text={data.kicker} color={C.lime} />
      <AbsoluteFill style={{ scale: String(interpolate(frame, [0, D], [1, 1.04], clamp)) }}>{body}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ quote card
export const AQuoteScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const pop = usePop();
  const words = (data.quote as string).split(" ");
  return (
    <AbsoluteFill>
      <Warm />
      <div style={{ position: "absolute", left: 90, top: 330, fontFamily: SERIF, fontSize: 260, lineHeight: 1, color: C.lime, opacity: 0.9, ...pop(0, { scale: 0.5 }) }}>“</div>
      <div style={{ position: "absolute", left: 100, right: 100, top: 520, fontFamily: SERIF, fontSize: 62, lineHeight: 1.18, color: C.cream, translate: `0 ${interpolate(frame, [0, D], [10, -10])}px` }}>
        {words.map((w, i) => (
          <span key={i} style={{ opacity: interpolate(frame, [4 + i * 2, 10 + i * 2], [0.15, 1], clamp), color: (data.hl as string[]).includes(w.replace(/[^\w]/g, "")) ? C.lime : C.cream }}>
            {w}{" "}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 100, right: 100, top: 1080, ...pop(20, { rise: 16, scale: 1 }) }}>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: C.cream }}>{data.who}</div>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: C.grey, marginTop: 6 }}>{data.role}</div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ method: find your customer truth (field notebook)
export const AMethodScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const notes = data.notes as { text: string; cue: string; hl?: boolean }[];
  const ruleAt = c("rule", 120);
  return (
    <AbsoluteFill>
      <Warm />
      <Kicker text={data.kicker} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 370, borderRadius: 26, background: C.cream, padding: "30px 34px 34px", boxShadow: "0 30px 70px rgba(0,0,0,0.55)", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 55px, #E2DED2 55px 57px)", ...pop(0, { rise: 40, scale: 0.94 }) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: "#77756D" }}>FIELD NOTES · 1 DAY IN STORE</div>
        {notes.map((n, i) => {
          const at = c(n.cue, 20 + i * 25);
          const chars = Math.max(0, Math.floor((frame - at) * 2.2));
          return (
            <div key={i} style={{ fontFamily: BODY, fontWeight: n.hl ? 800 : 600, fontSize: 30, lineHeight: "57px", color: n.hl ? C.charcoal : "#3A3936", background: n.hl && frame >= ruleAt ? C.lime : "transparent", borderRadius: 8, padding: "0 6px", marginLeft: -6, minHeight: 57 }}>
              {n.text.slice(0, chars)}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ ask: comment thread of mum-isms
export const AAskScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const at = c("comments", 10);
  const replies = data.replies as { name: string; text: string }[];
  return (
    <AbsoluteFill>
      <Warm />
      <Person x={460} y={330} s={1} col="#B5476B" at={0} mood="happy" />
      <div style={{ position: "absolute", left: 90, right: 90, top: 640, display: "flex", flexDirection: "column", gap: 14 }}>
        {replies.map((r, i) => (
          <div key={r.name} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "#161616", border: "1.5px solid #2A2A2A", borderRadius: 20, padding: "14px 18px", ...pop(at + i * 9, { rise: 24, scale: 0.94 }) }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: [AMBER, C.lime, "#B5476B", C.stone][i % 4], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 22, color: C.charcoal, flexShrink: 0 }}>{r.name[0]}</div>
            <div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 21, color: C.grey }}>{r.name}</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: C.cream, marginTop: 2 }}>{r.text}</div>
            </div>
          </div>
        ))}
      </div>
      <span style={{ display: "none" }}>{frame}</span>
    </AbsoluteFill>
  );
};

export const AD_SCENES: Record<string, React.FC<SceneProps>> = {
  aBubble: ABubbleScene,
  aSize: ASizeScene,
  aBeats: ABeatsScene,
  aWhy: AWhyScene,
  aQuote: AQuoteScene,
  aMethod: AMethodScene,
  aAsk: AAskScene,
};
