// Tutorial kit: one big object at a time, every element cued to the spoken word that names it.
// Grammar studied from research/reference-videos/ref-1000319940, rebuilt in the Kanishk.Rewires theme.
import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";

export const L = { progressY: 210, kickerY: 250, titleY: 284, heroTop: 470, heroBottom: 1370, side: 80 };

/** Frame for a named cue (set by the pipeline from the narration), or a fallback. */
export const useCue = (cues: Record<string, number> | undefined) => (name: string, fallback: number) => cues?.[name] ?? fallback;

/** Spring pop: opacity, slight rise and a small overshoot. */
export const usePop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number, opts: { rise?: number; scale?: number } = {}): React.CSSProperties => {
    if (frame < at) return { opacity: 0 };
    const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 190, mass: 0.8 } });
    const o = interpolate(frame - at, [0, 6], [0, 1], clamp);
    return { opacity: o, translate: `0 ${(1 - p) * (opts.rise ?? 26)}px`, scale: String((opts.scale ?? 0.88) + (1 - (opts.scale ?? 0.88)) * p) };
  };
};

export const fadeOut = (frame: number, at: number, d = 8) => (frame < at ? 1 : interpolate(frame, [at, at + d], [1, 0], clamp));

/** Accent markup: *word* renders as italic lime serif (titles) or lime bold (body). */
export const Rich: React.FC<{ text: string; italic?: boolean }> = ({ text, italic }) => (
  <>
    {text.split(/(\*[^*]+\*)/g).map((p, i) =>
      p.startsWith("*") ? (
        <span key={i} style={{ color: C.lime, fontStyle: italic ? "italic" : undefined }}>
          {p.slice(1, -1)}
        </span>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </>
);

/** Seven-segment progress bar, "STEP N" and a serif title with one italic accent. */
export const StepHeader: React.FC<{ step: number; total: number; title: string }> = ({ step, total, title }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const fill = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: EASE });
  return (
    <>
      <div style={{ position: "absolute", left: L.side, right: L.side, top: L.progressY, display: "flex", gap: 10 }}>
        {new Array(total).fill(0).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: C.graphite, overflow: "hidden" }}>
            <div style={{ height: "100%", width: i < step - 1 ? "100%" : i === step - 1 ? `${fill * 100}%` : "0%", background: C.lime }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: L.side, top: L.kickerY, fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: 3, color: C.lime }}>STEP {step}</div>
      <div style={{ position: "absolute", left: L.side, right: L.side, top: L.titleY, fontFamily: SERIF, fontSize: 104, lineHeight: 1.0, color: C.cream, letterSpacing: -1, ...pop(1, { rise: 18, scale: 0.97 }) }}>
        <Rich text={title} italic />
      </div>
    </>
  );
};

/** Cream card with a soft shadow. */
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.cream, borderRadius: 28, boxShadow: "0 30px 70px rgba(0,0,0,0.55)", color: C.charcoal, overflow: "hidden", ...style }}>{children}</div>
);

export type TermLine = { at: number; text: string; kind?: "cmd" | "out" | "ok" | "err" | "tool" | "dim"; typing?: boolean };

/** Cream terminal window: "claude · ~/folder", lines that type or pop, and an input row. */
export const Terminal: React.FC<{ title?: string; lines: TermLine[]; input?: { at: number; text: string }; height?: number; chips?: { at: number; text: string }[]; style?: React.CSSProperties; enter?: number }> = ({
  title = "claude · ~/my-reels",
  lines,
  input,
  height = 330,
  chips = [],
  style,
  enter = -100,
}) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const color = (k?: string) => (k === "ok" ? "#2E7D32" : k === "err" ? "#C0392B" : k === "tool" ? C.charcoal : k === "dim" ? "#8A887F" : "#3A3A36");
  const dot = (k?: string) => (k === "ok" ? "#3FA34D" : k === "err" ? "#D64541" : k === "tool" ? C.charcoal : "transparent");
  const typed = (t: string, at: number, cpf = 1.6) => t.slice(0, Math.max(0, Math.floor((frame - at) * cpf)));
  const blink = Math.floor(frame / 9) % 2 === 0;
  return (
    <Card style={{ height, display: "flex", flexDirection: "column", ...(enter > -100 ? pop(enter, { rise: 40, scale: 0.94 }) : {}), ...style }}>
      <div style={{ height: 54, background: "#ECE9DF", display: "flex", alignItems: "center", padding: "0 22px", position: "relative", flexShrink: 0 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 15, height: 15, borderRadius: "50%", background: c, marginRight: 9 }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: 19, color: "#77756D" }}>{title}</div>
      </div>
      <div style={{ flex: 1, padding: "20px 28px 0", fontFamily: MONO, fontSize: 25, lineHeight: 1.55, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {lines
          .filter((l) => frame >= l.at)
          .map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 12, color: color(l.kind), fontWeight: l.kind === "tool" || l.kind === "cmd" ? 600 : 400, ...pop(l.at, { rise: 10, scale: 1 }) }}>
              {l.kind === "cmd" ? <span style={{ color: "#8A887F" }}>&gt;</span> : l.text.startsWith("✓") || l.text.startsWith("✻") ? null : <span style={{ width: 12, height: 12, borderRadius: "50%", background: dot(l.kind), marginTop: 13, flexShrink: 0 }} />}
              <span style={{ whiteSpace: "pre-wrap" }}>{l.typing ? typed(l.text, l.at) : l.text}</span>
            </div>
          ))}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0 6px" }}>
          {chips.map((c) => (
            <span key={c.text} style={{ fontSize: 19, padding: "4px 12px", borderRadius: 8, background: C.charcoal, color: C.lime, ...pop(c.at, { rise: 10 }) }}>
              {c.text}
            </span>
          ))}
        </div>
        <div style={{ borderTop: "2px solid #E2DED2", padding: "12px 0 16px", color: "#3A3A36", display: "flex", gap: 12 }}>
          <span style={{ color: "#8A887F" }}>&gt;</span>
          <span>
            {input && frame >= input.at ? typed(input.text, input.at, 1.4) : <span style={{ color: "#B3B0A6" }}>Type a prompt or drop files…</span>}
            {blink ? <span style={{ color: C.charcoal }}>▍</span> : null}
          </span>
        </div>
      </div>
    </Card>
  );
};

/** A real brand mark on a cream tile, with an optional status badge. */
export const LogoTile: React.FC<{ src: string; size?: number; at: number; badge?: { at: number; kind: "ok" | "err" }; label?: string; labelAccent?: string }> = ({ src, size = 150, at, badge, label, labelAccent }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, ...pop(at) }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.26, background: C.cream, boxShadow: "0 20px 44px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <Img src={staticFile(src)} style={{ width: size * 0.56, height: size * 0.56, objectFit: "contain" }} />
        {badge && frame >= badge.at ? (
          <div style={{ position: "absolute", right: -12, top: -12, width: 44, height: 44, borderRadius: "50%", background: badge.kind === "ok" ? C.lime : "#E5484D", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, fontWeight: 800, fontSize: 26, color: badge.kind === "ok" ? C.charcoal : "white", ...pop(badge.at, { rise: 0, scale: 0.4 }) }}>
            {badge.kind === "ok" ? "✓" : "✕"}
          </div>
        ) : null}
      </div>
      {label ? (
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.cream }}>
          {label} {labelAccent ? <span style={{ color: C.lime }}>{labelAccent}</span> : null}
        </div>
      ) : null}
    </div>
  );
};

/** Tilted lime sticker. */
export const Sticker: React.FC<{ at: number; text: string; sub?: string; rotate?: number; style?: React.CSSProperties; until?: number }> = ({ at, text, sub, rotate = -6, style, until }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  return (
    <div style={{ position: "absolute", rotate: `${rotate}deg`, background: C.lime, color: C.charcoal, borderRadius: 18, padding: "14px 24px", boxShadow: "0 16px 34px rgba(0,0,0,0.45)", fontFamily: BODY, fontWeight: 800, fontSize: 32, lineHeight: 1.1, ...pop(at, { rise: 20, scale: 0.6 }), opacity: frame < at ? 0 : Math.min(1, fadeOut(frame, until ?? 1e9)), ...style }}>
      {text}
      {sub ? <div style={{ fontWeight: 600, fontSize: 20, marginTop: 4 }}>{sub}</div> : null}
    </div>
  );
};

/** A connector line drawn between two points (px in the hero box). */
export const Wire: React.FC<{ from: [number, number]; to: [number, number]; at: number; color?: string; w?: number; h?: number }> = ({ from, to, at, color = C.lime, w = 920, h = 900 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: EASE_IO });
  const my = (from[1] + to[1]) / 2;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <path d={`M ${from[0]} ${from[1]} C ${from[0]} ${my}, ${to[0]} ${my}, ${to[0]} ${to[1]}`} stroke={color} strokeWidth={4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />
    </svg>
  );
};

/** Code card (e.g. a config or SKILL.md) whose lines appear on cue; one line can be highlighted. */
export const CodeCard: React.FC<{ file: string; badge?: { at: number; text: string }; lines: { at: number; text: string; hl?: boolean }[]; style?: React.CSSProperties; enter: number }> = ({ file, badge, lines, style, enter }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  return (
    <Card style={{ ...pop(enter, { rise: 40, scale: 0.94 }), ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 26px", borderBottom: "2px solid #E2DED2" }}>
        <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 23 }}>{file}</span>
        {badge && frame >= badge.at ? <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 19, background: C.charcoal, color: C.lime, borderRadius: 999, padding: "5px 14px", ...pop(badge.at, { scale: 0.5 }) }}>✓ {badge.text}</span> : null}
      </div>
      <div style={{ padding: "14px 0 18px" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 20, padding: "5px 26px", fontFamily: MONO, fontSize: 24, background: l.hl && frame >= l.at + 8 ? "rgba(167,255,63,0.35)" : "transparent", ...(frame >= l.at ? pop(l.at, { rise: 8, scale: 1 }) : { opacity: 0 }) }}>
            <span style={{ color: "#A9A69B", width: 26, textAlign: "right" }}>{i + 1}</span>
            <span style={{ color: "#2B2B28", whiteSpace: "pre" }}>{l.text}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

/** Lime caption band: big, two to four words, keywords in lime. */
export const SaveIcon: React.FC<{ at: number; size?: number }> = ({ at, size = 150 }) => {
  const pop = usePop();
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" style={{ ...pop(at, { rise: -60, scale: 0.6 }) }}>
      <path d="M4 3 h32 a2 2 0 0 1 2 2 v42 l-18 -12 l-18 12 v-42 a2 2 0 0 1 2 -2 z" fill={C.lime} />
    </svg>
  );
};

export const Phone: React.FC<{ children: React.ReactNode; at: number; style?: React.CSSProperties }> = ({ children, at, style }) => {
  const pop = usePop();
  return (
    <div style={{ width: 330, height: 640, borderRadius: 52, background: "#111", padding: 12, boxShadow: "0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 2px #2a2a2a", ...pop(at, { rise: 60, scale: 0.9 }), ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 42, overflow: "hidden", position: "relative", background: C.charcoal }}>{children}</div>
    </div>
  );
};

export const Waveform: React.FC<{ at: number; bars?: number; w?: number; h?: number }> = ({ at, bars = 38, w = 760, h = 120 }) => {
  const frame = useCurrentFrame();
  const on = interpolate(frame, [at, at + 10], [0, 1], clamp);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, width: w, height: h }}>
      {new Array(bars).fill(0).map((_, i) => {
        const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + frame * 0.35) * Math.cos(i * 0.6 - frame * 0.21));
        return <div key={i} style={{ flex: 1, height: h * v * on + 6, borderRadius: 4, background: i % 9 === 4 ? C.lime : C.charcoal }} />;
      })}
    </div>
  );
};

export const Ring: React.FC<{ from: number; to: number; at: number; dur: number; label: string; unit?: string; size?: number }> = ({ from, to, at, dur, label, unit = "%", size = 230 }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EASE_IO });
  const v = Math.round(from + (to - from) * p);
  const r = size / 2 - 14;
  return (
    <div style={{ width: size, height: size, position: "relative", ...pop(at - 4) }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.graphite} strokeWidth={14} fill={C.cream} />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.lime} strokeWidth={14} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - (v - from) / Math.max(1, to - from)} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.charcoal }}>
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: "#77756D" }}>{label}</div>
        <div style={{ fontFamily: SERIF, fontSize: 92, lineHeight: 1 }}>
          {v}
          <span style={{ fontSize: 36 }}>{unit}</span>
        </div>
      </div>
    </div>
  );
};

export const _keep = { HEAD, EASE };
