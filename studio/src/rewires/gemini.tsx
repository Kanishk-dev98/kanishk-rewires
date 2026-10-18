// "Gem" scene family (9:16): a news breakdown built around Gemini's Chat → Task toggle.
// One visual idea per scene. On-screen text is UI, data and labels only: it never repeats the narration (captions carry the words).
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";
import { usePop } from "./tut";
import { Pointer } from "./chromeUi";

const GEM = ["#4285F4", "#9B72CB", "#D96570"];
const GEM_GRAD = `linear-gradient(90deg, ${GEM[0]}, ${GEM[1]}, ${GEM[2]})`;
const HOT = "#E5484D";
const SPARK = "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81";
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;
const typed = (frame: number, text: string, at: number, cps = 1.8) => text.slice(0, Math.max(0, Math.floor((frame - at) * cps)));

/** Gemini sparkle in the brand gradient. */
export const Spark: React.FC<{ size: number; spin?: number; id?: string }> = ({ size, spin = 0, id = "g" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ rotate: `${spin}deg`, overflow: "visible" }}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={GEM[0]} />
        <stop offset="0.55" stopColor={GEM[1]} />
        <stop offset="1" stopColor={GEM[2]} />
      </linearGradient>
    </defs>
    <path d={SPARK} fill={`url(#${id})`} />
  </svg>
);

/** Soft drifting gradient blobs: something is always moving. */
const Aura: React.FC<{ strength?: number }> = ({ strength = 0.32 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.charcoal, overflow: "hidden" }}>
      {GEM.map((col, i) => (
        <div key={col} style={{ position: "absolute", width: 760, height: 760, borderRadius: "50%", background: col, opacity: strength, filter: "blur(170px)", left: 160 + Math.sin(frame / 40 + i * 2.1) * 260 - 380 + i * 300, top: 520 + Math.cos(frame / 47 + i * 1.7) * 220 + i * 120 }} />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(10,10,10,0) 0%, rgba(10,10,10,0.85) 100%)" }} />
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ text: string; at: number; top?: number; color?: string }> = ({ text, at, top = 260, color = C.stone }) => {
  const pop = usePop();
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 26, letterSpacing: 6, color, ...pop(at, { scale: 1, rise: 10 }) }}>{text}</div>;
};

/** The Chat | Task segmented toggle. p: 0 = Chat, 1 = Task. */
const Toggle: React.FC<{ p: number; scale?: number }> = ({ p, scale = 1 }) => {
  const W = 620 * scale;
  const H = 150 * scale;
  return (
    <div style={{ position: "relative", width: W, height: H, borderRadius: H / 2, background: "#1E1F20", border: `${3 * scale}px solid #3C4043`, boxShadow: p > 0.5 ? `0 0 ${90 * scale}px rgba(155,114,203,${0.5 * p})` : "0 20px 60px rgba(0,0,0,0.5)" }}>
      <div style={{ position: "absolute", top: 10 * scale, bottom: 10 * scale, width: W / 2 - 14 * scale, left: 10 * scale + p * (W / 2 - 6 * scale), borderRadius: H / 2, background: p > 0.5 ? GEM_GRAD : "#3C4043" }} />
      {["Chat", "Task"].map((t, i) => (
        <div key={t} style={{ position: "absolute", top: 0, bottom: 0, left: i * (W / 2), width: W / 2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 58 * scale, color: (i === 1 ? p : 1 - p) > 0.5 ? "white" : "#9AA0A6" }}>
          {t}
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------ hook: the switch
export const GToggleScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const flip = c("flip", 40);
  const p = spring({ frame: frame - flip, fps: 30, config: { damping: 13, stiffness: 160 } });
  const pop = usePop();
  const push = interpolate(frame, [0, D], [1, 1.08], clamp);
  return (
    <AbsoluteFill>
      <Aura strength={0.12 + 0.3 * p} />
      <AbsoluteFill style={{ scale: String(push) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", ...pop(0, { scale: 0.5 }) }}>
          <Spark size={190} spin={frame * 0.6 + p * 180} id="gt" />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", ...pop(6, { rise: 40 }) }}>
          <Toggle p={p} />
        </div>
        <Pointer x={interpolate(frame, [8, flip - 2], [900, 700], { ...clamp, easing: EASE_IO })} y={interpolate(frame, [8, flip - 2], [1250, 880], { ...clamp, easing: EASE_IO })} press={Math.abs(frame - flip) < 4} />
        {p > 0.1
          ? new Array(14).fill(0).map((_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const r = 160 + (frame - flip) * 14;
              return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r * 1.6, top: 865 + Math.sin(a) * r * 0.6, width: 14, height: 14, borderRadius: 3, background: GEM[i % 3], opacity: interpolate(frame - flip, [0, 24], [1, 0], clamp) }} />;
            })
          : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ launch card: model, date, plans
export const GLaunchScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const dateAt = c("date", 50);
  const plansAt = c("plans", 90);
  const plans: [string, string, boolean][] = [["Free", "", false], ["AI Plus", "", false], ["AI Pro", "₹1,950/mo", true], ["AI Ultra", "from ₹6,500/mo", true]];
  return (
    <AbsoluteFill>
      <Aura strength={0.22} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", alignItems: "center", justifyContent: "center", gap: 26, scale: String(interpolate(frame, [0, D], [1, 1.04], clamp)) }}>
        <div style={pop(0, { scale: 0.4 })}>
          <Spark size={120} spin={frame * 0.5} id="gl" />
        </div>
        <div style={{ ...pop(4, { rise: 30 }) }}>
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 104, color: C.cream, letterSpacing: -3, lineHeight: 1 }}>Gemini 4</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 120, lineHeight: 0.95, background: GEM_GRAD, WebkitBackgroundClip: "text", color: "transparent" }}>Argon</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 640, width: 250, borderRadius: 26, overflow: "hidden", background: C.cream, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", ...pop(dateAt, { rise: 40, scale: 0.7 }), rotate: "-4deg" }}>
        <div style={{ background: GEM_GRAD, color: "white", fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, textAlign: "center", padding: "10px 0" }}>OCT 2026</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 150, color: C.charcoal, textAlign: "center", lineHeight: 1.15 }}>13</div>
      </div>
      <div style={{ position: "absolute", left: 410, right: 90, top: 650, display: "flex", flexDirection: "column", gap: 14, ...pop(dateAt + 6, { scale: 1, rise: 10 }) }}>
        {["Frontier model", "1M-token context", "Gemini app · AI Mode · API"].map((t, i) => (
          <div key={t} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, color: C.stone, display: "flex", alignItems: "center", gap: 12, ...pop(dateAt + 8 + i * 5, { scale: 1, rise: 10 }) }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: GEM[i] }} />
            {t}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1000, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {plans.map(([name, price, on], i) => {
          const lit = on && frame >= plansAt + i * 4;
          return (
            <div key={name} style={{ height: 210, borderRadius: 24, padding: "18px 14px", background: lit ? "#1E1F20" : "#141414", border: lit ? `3px solid ${GEM[1]}` : "2px solid #262626", boxShadow: lit ? "0 0 50px rgba(155,114,203,0.35)" : undefined, display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: frame >= plansAt - 10 ? (on ? 1 : 0.45) : 0, ...pop(plansAt - 10 + i * 3, { rise: 20, scale: 0.9 }) }}>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 32, color: C.cream }}>{name}</div>
              <div style={{ fontFamily: MONO, fontSize: 17, color: C.grey }}>{price}</div>
              <div style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, fontWeight: 900, fontSize: 28, background: lit ? C.lime : "#262626", color: lit ? C.charcoal : "#555" }}>{lit ? "✓" : "✕"}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ benchmark bars
export const GBenchScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const go = c("go", 20);
  const rows = data.rows as { name: string; v: number; hero?: boolean }[];
  const max = Math.max(...rows.map((r) => r.v));
  return (
    <AbsoluteFill>
      <Aura strength={0.12} />
      <Tag text={data.bench} at={0} top={330} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 430, display: "flex", flexDirection: "column", gap: 34, scale: String(interpolate(frame, [0, D], [1, 1.04], clamp)) }}>
        {rows.map((r, i) => {
          const g = interpolate(frame, [go + i * 4, go + i * 4 + 26], [0, 1], { ...clamp, easing: EASE });
          return (
            <div key={r.name} style={pop(go - 8 + i * 4, { rise: 20, scale: 1 })}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: HEAD, fontWeight: 700, fontSize: 36, color: r.hero ? C.cream : C.grey, marginBottom: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {r.hero ? <Spark size={40} id={`gb${i}`} /> : null}
                  {r.name}
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{(r.v * g).toFixed(1)}%</span>
              </div>
              <div style={{ height: r.hero ? 54 : 40, borderRadius: 14, background: "#1C1C1C", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(r.v / max) * 100 * g}%`, borderRadius: 14, background: r.hero ? GEM_GRAD : "#4A4A46", boxShadow: r.hero ? "0 0 40px rgba(155,114,203,0.5)" : undefined }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1230, fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: C.grey, textAlign: "center", ...pop(go + 30, { scale: 1, rise: 6 }) }}>{data.note}</div>
    </AbsoluteFill>
  );
};

/** Gemini app prompt box with the Chat | Task toggle under it. */
const GeminiBox: React.FC<{ task: number; text: string; caret: boolean; chips: { t: string; at: number }[]; submitted: boolean }> = ({ task, text, caret, chips, submitted }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  return (
    <div style={{ background: "#1E1F20", borderRadius: 36, padding: "26px 28px 20px", border: "2px solid #3C4043", boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
      <div style={{ minHeight: 150, fontFamily: BODY, fontSize: 32, lineHeight: 1.4, color: text ? "#E3E3E3" : "#80868B" }}>
        {text || "Ask Gemini"}
        {caret ? <span style={{ color: GEM[0] }}>▍</span> : null}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", minHeight: 44 }}>
        {chips.map((ch) => (frame >= ch.at ? <span key={ch.t} style={{ fontFamily: MONO, fontSize: 20, color: "#E3E3E3", background: "#2D2F31", border: `1.5px solid ${GEM[1]}`, borderRadius: 12, padding: "6px 12px", ...pop(ch.at, { scale: 0.7, rise: 6 }) }}>{ch.t}</span> : null))}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
        <Toggle p={task} scale={0.42} />
        <div style={{ marginLeft: "auto", width: 66, height: 66, borderRadius: "50%", background: submitted ? GEM_GRAD : "#3C4043", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 32, fontWeight: 900 }}>↑</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ task mode: hand off the job, close the laptop
export const GTaskScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const tAt = c("task", 20);
  const jobAt = c("job", 50);
  const closeAt = c("close", 120);
  const prompt = data.prompt as string;
  const t = frame >= jobAt ? typed(frame, prompt, jobAt, 2.4) : "";
  const doneTyping = t.length >= prompt.length;
  const submit = jobAt + Math.ceil(prompt.length / 2.4) + 6;
  const task = spring({ frame: frame - tAt, fps: 30, config: { damping: 14, stiffness: 180 } });
  const lid = interpolate(frame, [closeAt, closeAt + 22], [0, 1], { ...clamp, easing: EASE_IO });
  const prog = interpolate(frame, [closeAt + 10, D], [0.08, 0.92], clamp);
  return (
    <AbsoluteFill>
      <Aura strength={0.16 + 0.12 * task} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 300, perspective: 1600 }}>
        <div style={{ transformOrigin: "50% 100%", rotate: `x ${lid * -88}deg`, opacity: 1 - lid * 0.6, ...pop(0, { rise: 40, scale: 0.94 }) }}>
          <div style={{ borderRadius: 30, border: "10px solid #2B2B2B", background: "#131314", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <Spark size={44} id="gtk" />
              <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 32, color: "#E3E3E3" }}>Gemini</span>
              <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 18, color: "#9AA0A6" }}>4 Argon</span>
            </div>
            <GeminiBox task={task} text={t} caret={frame >= jobAt && !doneTyping} submitted={frame >= submit} chips={(data.chips as { t: string; cue: string; offset?: number }[]).map((ch) => ({ t: ch.t, at: submit - 4 + (ch.offset ?? 0) }))} />
          </div>
        </div>
        <div style={{ height: 26, margin: "0 -40px", borderRadius: "0 0 26px 26px", background: "linear-gradient(#3A3A3A, #1E1E1E)", ...pop(0, { rise: 40, scale: 0.94 }) }} />
      </div>
      {frame >= closeAt + 8 ? (
        <div style={{ position: "absolute", left: 110, right: 110, top: 760, background: "#1E1F20", borderRadius: 28, padding: "26px 30px", border: `2px solid ${GEM[1]}`, boxShadow: "0 0 70px rgba(155,114,203,0.35)", ...pop(closeAt + 8, { rise: 30, scale: 0.9 }) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Spark size={46} spin={frame * 3} id="gtr" />
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: C.cream }}>{data.taskTitle}</div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 21, color: C.grey, marginTop: 12 }}>
            {data.taskMeta} · {prog < 0.9 ? "running" : "done"}
          </div>
          <div style={{ height: 14, borderRadius: 7, background: "#2D2F31", marginTop: 18, overflow: "hidden" }}>
            <div style={{ width: `${prog * 100}%`, height: "100%", background: GEM_GRAD }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            {(data.ticks as string[]).map((tk, i) => (
              <span key={tk} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 21, color: C.cream, background: "#2D2F31", borderRadius: 10, padding: "6px 12px", ...pop(closeAt + 24 + i * 12, { scale: 0.7, rise: 6 }) }}>
                <span style={{ color: C.lime }}>✓</span> {tk}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {lid > 0.5 ? <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: C.stone, opacity: interpolate(frame, [closeAt + 16, closeAt + 26], [0, 1], clamp) }}>LAPTOP CLOSED · STILL RUNNING</div> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ up to 15 tasks at once
export const GStackScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const countAt = c("count", 10);
  const n = Math.round(interpolate(frame, [countAt - 6, countAt + 24], [1, 15], { ...clamp, easing: EASE }));
  const cards = data.cards as { icon: string; title: string; meta: string; cue: string }[];
  return (
    <AbsoluteFill>
      <Aura strength={0.14} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 260, lineHeight: 1, background: GEM_GRAD, WebkitBackgroundClip: "text", color: "transparent", ...pop(countAt - 6, { scale: 0.6 }) }}>{n}</div>
        <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: C.stone, marginTop: -6, ...pop(countAt, { scale: 1, rise: 6 }) }}>TASKS RUNNING</div>
      </div>
      <div style={{ position: "absolute", left: 300, right: 300, top: 650, height: 40, display: "flex", gap: 6, ...pop(countAt, { scale: 1, rise: 6 }) }}>
        {new Array(15).fill(0).map((_, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 4, background: i < n ? GEM[i % 3] : "#262626", opacity: i < n ? 0.65 + 0.35 * Math.sin(frame / 6 + i) : 1 }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 740, display: "flex", flexDirection: "column", gap: 18, translate: `0 ${interpolate(frame, [0, D], [10, -10])}px` }}>
        {cards.map((cd, i) => {
          const at = c(cd.cue, 40 + i * 20);
          const r = random(`gs${i}`);
          return (
            <div key={cd.title} style={{ display: "flex", alignItems: "center", gap: 20, background: "#1E1F20", border: "2px solid #34363A", borderRadius: 24, padding: "20px 24px", rotate: `${(r - 0.5) * 3}deg`, ...pop(at, { rise: 30, scale: 0.9 }) }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: GEM[i % 3], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{cd.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: C.cream }}>{cd.title}</div>
                <div style={{ fontFamily: MONO, fontSize: 19, color: C.grey, marginTop: 4 }}>{cd.meta}</div>
              </div>
              <span style={{ fontFamily: BODY, fontWeight: 900, fontSize: 30, color: C.lime }}>✓</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Google's "Paperwork" demo: folder → deck → email → workflow
export const GFolderScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const deckAt = c("deck", 40);
  const mailAt = c("mail", 90);
  const flowAt = c("flow", 130);
  const files = ["brief_v3_FINAL.docx", "notes call 2.txt", "pricing.xlsx", "IMG_2291.png", "scope (old).pdf", "client email.eml", "timeline.csv"];
  const gather = interpolate(frame, [deckAt - 10, deckAt + 14], [0, 1], { ...clamp, easing: EASE_IO });
  return (
    <AbsoluteFill>
      <Aura strength={0.12} />
      <Tag text={data.tag} at={0} top={250} color={C.stone} />
      {files.map((f, i) => {
        const r1 = random(`ff${i}`);
        const r2 = random(`fg${i}`);
        const x0 = 90 + r1 * 640;
        const y0 = 340 + i * 62 + Math.sin(frame / 14 + i) * 6;
        const x = interpolate(gather, [0, 1], [x0, 360]);
        const y = interpolate(gather, [0, 1], [y0, 560]);
        return (
          <div key={f} style={{ position: "absolute", left: x, top: y, rotate: `${(r2 - 0.5) * 14 * (1 - gather)}deg`, opacity: 1 - gather, scale: String(1 - gather * 0.6), fontFamily: MONO, fontSize: 22, color: C.cream, background: "#1E1F20", border: "1.5px solid #3C4043", borderRadius: 12, padding: "10px 16px", whiteSpace: "nowrap", ...pop(i * 2, { rise: 16, scale: 0.8 }) }}>
            {f}
          </div>
        );
      })}
      {frame >= deckAt ? (
        <div style={{ position: "absolute", left: 150, top: 380, width: 520, ...pop(deckAt, { rise: 30, scale: 0.7 }) }}>
          {[2, 1, 0].map((k) => (
            <div key={k} style={{ position: "absolute", left: k * 26, top: k * 26, width: 520, height: 292, borderRadius: 18, background: k === 0 ? C.cream : "#D9D6CC", boxShadow: "0 24px 50px rgba(0,0,0,0.5)", padding: 26, opacity: 1 - k * 0.2 }}>
              {k === 0 ? (
                <>
                  <div style={{ width: 60, height: 8, borderRadius: 4, background: GEM_GRAD }} />
                  <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 38, color: C.charcoal, marginTop: 18, lineHeight: 1.1 }}>{data.deckTitle}</div>
                  <div style={{ fontFamily: BODY, fontSize: 20, color: "#55534C", marginTop: 12 }}>Scope · Timeline · Pricing</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                    {[60, 90, 45, 75].map((h, j) => (
                      <div key={j} style={{ width: 50, height: h, alignSelf: "flex-end", borderRadius: 6, background: GEM[j % 3], opacity: 0.85 }} />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {frame >= mailAt ? (
        <div style={{ position: "absolute", right: 90, top: 720, width: 420, background: "#1E1F20", border: "2px solid #34363A", borderRadius: 22, padding: "20px 22px", ...pop(mailAt, { rise: 30, scale: 0.8 }) }}>
          <div style={{ fontFamily: MONO, fontSize: 18, color: C.grey }}>To: client@acme.co</div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, color: C.cream, marginTop: 8 }}>Your proposal deck 📎</div>
          <div style={{ marginTop: 14, display: "inline-block", fontFamily: BODY, fontWeight: 800, fontSize: 20, background: frame >= mailAt + 18 ? C.lime : "#3C4043", color: frame >= mailAt + 18 ? C.charcoal : C.cream, borderRadius: 999, padding: "6px 16px" }}>{frame >= mailAt + 18 ? "✓ Sent" : "Sending…"}</div>
        </div>
      ) : null}
      {frame >= flowAt ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: 1000, height: 170, ...pop(flowAt, { rise: 20, scale: 0.9 }) }}>
          <svg width={900} height={170} style={{ position: "absolute", inset: 0 }}>
            <path d="M 120 85 L 390 85 L 660 85 C 760 85, 760 10, 450 10 C 160 10, 120 40, 120 85" stroke={GEM[1]} strokeWidth={4} fill="none" strokeDasharray="10 10" strokeDashoffset={-frame * 2} />
          </svg>
          {["New request", "Build deck", "Email client"].map((t, i) => (
            <div key={t} style={{ position: "absolute", left: 20 + i * 270, top: 52, width: 210, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 23, color: C.cream, background: "#1E1F20", border: `2px solid ${GEM[i]}`, borderRadius: 16, padding: "14px 6px", ...pop(flowAt + 4 + i * 5, { scale: 0.7, rise: 6 }) }}>
              {t}
            </div>
          ))}
          <div style={{ position: "absolute", right: 0, top: -36, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: C.lime }}>↻ SCHEDULED TASK</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the catch
export const GCatchScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const mAt = c("mistakes", 20);
  const codeAt = c("coding", 60);
  const expAt = c("experimental", 100);
  const glitch = frame >= mAt && frame < mAt + 30 ? Math.round(Math.sin(frame * 3) * 8) : 0;
  const g = interpolate(frame, [codeAt, codeAt + 24], [0, 1], { ...clamp, easing: EASE });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 50% at 50% 50%, rgba(229,72,77,0.16), ${C.charcoal} 75%)` }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 300, display: "flex", flexDirection: "column", gap: 26, translate: `0 ${interpolate(frame, [0, D], [8, -8])}px` }}>
        <div style={{ background: "#1E1F20", borderRadius: 24, padding: "22px 26px", border: "2px solid #34363A", ...pop(mAt - 6, { rise: 24, scale: 0.92 }) }}>
          <div style={{ fontFamily: MONO, fontSize: 19, color: C.grey, letterSpacing: 2 }}>GEMINI SAYS</div>
          <div style={{ fontFamily: BODY, fontSize: 28, color: C.cream, marginTop: 10, lineHeight: 1.4 }}>
            Your Q3 revenue grew <span style={{ background: frame >= mAt + 10 ? "rgba(229,72,77,0.3)" : "transparent", color: frame >= mAt + 10 ? HOT : C.cream, textDecoration: frame >= mAt + 10 ? "line-through" : "none", display: "inline-block", translate: `${glitch}px 0` }}>41%</span>
            {frame >= mAt + 16 ? <span style={{ color: C.lime, fontWeight: 700 }}> 14%</span> : null}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: HOT, marginTop: 8, ...pop(mAt + 16, { scale: 1, rise: 4 }) }}>⚠ model card: hallucinations</div>
        </div>
        <div style={{ background: "#1E1F20", borderRadius: 24, padding: "22px 26px", border: "2px solid #34363A", ...pop(codeAt - 6, { rise: 24, scale: 0.92 }) }}>
          <div style={{ fontFamily: MONO, fontSize: 19, color: C.grey, letterSpacing: 2 }}>TERMINAL-BENCH 4.0</div>
          {[["Claude Opus 5.5", 66.4, false], ["Gemini 4 Argon", 57.4, true]].map(([n, v, a]) => (
            <div key={n as string} style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: HEAD, fontWeight: 700, fontSize: 26, color: a ? HOT : C.cream }}>
                <span>{n}</span>
                <span>{((v as number) * g).toFixed(1)}%</span>
              </div>
              <div style={{ height: 22, borderRadius: 8, background: "#2A2A2A", marginTop: 6 }}>
                <div style={{ width: `${((v as number) / 66.4) * 100 * g}%`, height: "100%", borderRadius: 8, background: a ? HOT : "#8A8A84" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {frame >= expAt ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: 8, color: HOT, border: `5px solid ${HOT}`, borderRadius: 16, padding: "14px 30px", rotate: "-6deg", scale: String(interpolate(spring({ frame: frame - expAt, fps: 30, config: { damping: 9, stiffness: 220 } }), [0, 1], [1.8, 1])) }}>EXPERIMENTAL</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ comment ask: live reply thread
export const GAskScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const at = c("comments", 30);
  const replies = data.replies as { name: string; text: string; yes: boolean }[];
  const yes = replies.filter((r, i) => r.yes && frame >= at + i * 9).length;
  const no = replies.filter((r, i) => !r.yes && frame >= at + i * 9).length;
  return (
    <AbsoluteFill>
      <Aura strength={0.18} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 280, display: "flex", justifyContent: "center", ...pop(0, { rise: 30 }) }}>
        <Toggle p={0.5 + 0.5 * Math.sin(frame / 10)} scale={0.8} />
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 470, display: "flex", gap: 18, ...pop(at - 4, { rise: 16, scale: 1 }) }}>
        {[["DELEGATE", yes, C.lime], ["NO WAY", no, HOT]].map(([l, v, col]) => (
          <div key={l as string} style={{ flex: 1, borderRadius: 22, background: "#1E1F20", border: `2px solid ${col}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: col as string }}>{l}</span>
            <span style={{ fontFamily: SERIF, fontSize: 64, color: C.cream, lineHeight: 1 }}>{v as number}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 640, display: "flex", flexDirection: "column", gap: 14 }}>
        {replies.map((r, i) => (
          <div key={r.name} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "#161616", border: "1.5px solid #2A2A2A", borderRadius: 20, padding: "14px 18px", ...pop(at + i * 9, { rise: 24, scale: 0.94 }) }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: GEM[i % 3], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 22, color: "white", flexShrink: 0 }}>{r.name[0]}</div>
            <div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 21, color: C.grey }}>{r.name}</div>
              <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 27, color: C.cream, marginTop: 2 }}>{r.text}</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const GEM_SCENES: Record<string, React.FC<SceneProps>> = {
  gToggle: GToggleScene,
  gLaunch: GLaunchScene,
  gBench: GBenchScene,
  gTask: GTaskScene,
  gStack: GStackScene,
  gFolder: GFolderScene,
  gCatch: GCatchScene,
  gAsk: GAskScene,
};
