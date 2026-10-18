// "Market" scene family (9:16): terminal-style market news. Candles, a value counter, movers, causes,
// a bear vs bull split, a dot-com comparison chart and a bubble/reset meter. Labels and data only; captions carry the words.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";
import { usePop } from "./tut";

const RED = "#E5484D";
const GREEN = C.lime;
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;

/** Trading-terminal backdrop: faint grid, scrolling ticker at the top. */
const Terminal: React.FC<{ red?: number; ticker?: string[] }> = ({ red = 0.5, ticker = [] }) => {
  const frame = useCurrentFrame();
  const tape = ticker.join("    ·    ");
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(246,244,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(246,244,237,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: `0 ${frame * 0.6}px` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 50% at 50% 55%, rgba(229,72,77,${0.12 * red}), rgba(0,0,0,0) 70%)` }} />
      {ticker.length ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 210, height: 44, overflow: "hidden", borderTop: "1px solid #2A2A2A", borderBottom: "1px solid #2A2A2A" }}>
          <div style={{ position: "absolute", top: 8, left: 940 - ((frame * 4) % (tape.length * 14 + 940)), whiteSpace: "nowrap", fontFamily: MONO, fontSize: 22, color: C.stone }}>
            {tape.split(/(\s-[\d.]+%)/).map((t, i) => (
              <span key={i} style={{ color: /-[\d.]+%/.test(t) ? RED : C.stone }}>{t}</span>
            ))}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const Label: React.FC<{ text: string; at?: number; top: number; color?: string }> = ({ text, at = 0, top, color = C.stone }) => {
  const pop = usePop();
  return <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: 4, color, ...pop(at, { scale: 1, rise: 8 }) }}>{text}</div>;
};

// ------------------------------------------------------------------ hook: 8 red candles, then the 2008 echo
export const MCandlesScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const start = c("start", 4);
  const echo = c("echo", 70);
  const n = data.n as number;
  const per = Math.max(3, Math.floor((echo - start - 6) / n));
  const levels = data.levels as number[];
  const hi = Math.max(...levels);
  const lo = Math.min(...levels);
  const y = (v: number) => 380 + ((hi - v) / (hi - lo)) * 520;
  const shown = Math.min(n, Math.max(0, Math.floor((frame - start) / per) + 1));
  const pct = ((levels[shown] ?? levels[n]) / levels[0] - 1) * 100;
  return (
    <AbsoluteFill>
      <Terminal red={shown / n} ticker={data.ticker} />
      <Label text={data.label} top={300} />
      <AbsoluteFill style={{ scale: String(interpolate(frame, [0, D], [1, 1.05], clamp)) }}>
        {new Array(n).fill(0).map((_, i) => {
          if (i >= shown) return null;
          const o = levels[i];
          const cl = levels[i + 1];
          const x = 110 + i * 105;
          const p = interpolate(frame - start - i * per, [0, 8], [0, 1], { ...clamp, easing: EASE });
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: x + 33, top: y(o) - 18, width: 4, height: y(cl) - y(o) + 36, background: RED, opacity: 0.6 * p }} />
              <div style={{ position: "absolute", left: x, top: y(o), width: 70, height: (y(cl) - y(o)) * p + 4, background: RED, borderRadius: 4, boxShadow: "0 0 20px rgba(229,72,77,0.4)" }} />
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 170, lineHeight: 1, color: RED, fontVariantNumeric: "tabular-nums" }}>{shown ? pct.toFixed(1) : "0.0"}%</div>
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: C.stone, marginTop: 6 }}>{shown} / {n} SESSIONS RED</div>
      </div>
      {frame >= echo ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1210, display: "flex", justifyContent: "center", ...pop(echo, { rise: 20, scale: 0.6 }) }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: C.charcoal, background: C.cream, borderRadius: 12, padding: "8px 18px", rotate: "-3deg" }}>LAST SEEN: OCT 2008</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ value wiped: blocks evaporate, counter climbs
export const MWipeScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const at = c("go", 6);
  const g = interpolate(frame, [at, at + 40], [0, 1], { ...clamp, easing: EASE });
  return (
    <AbsoluteFill>
      <Terminal red={0.8} />
      <Label text={data.label} top={300} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 400, height: 420, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 10 }}>
        {new Array(60).fill(0).map((_, i) => {
          const r = random(`w${i}`);
          const gone = g > (i / 60) * 0.95;
          const t = gone ? interpolate(frame, [at + (i / 60) * 38, at + (i / 60) * 38 + 14], [0, 1], clamp) : 0;
          return <div key={i} style={{ height: 56, borderRadius: 8, background: gone ? RED : "#2E3A22", border: `1px solid ${gone ? RED : "#4A5E2E"}`, opacity: 1 - t, translate: `${(r - 0.5) * 80 * t}px ${-120 * t}px`, rotate: `${(r - 0.5) * 90 * t}deg` }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", ...pop(at, { scale: 0.8 }) }}>
        <div style={{ fontFamily: SERIF, fontSize: 170, lineHeight: 1, color: C.cream }}>
          −${(1.6 * g).toFixed(1)}T<span style={{ color: RED, opacity: g > 0.95 ? 1 : 0, fontSize: 90 }}> to $2T</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: C.grey, marginTop: 10 }}>{data.source}</div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ movers leaderboard
export const MMoversScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const at = c("go", 8);
  const rows = data.rows as { name: string; v: number; hl?: boolean }[];
  const max = Math.max(...rows.map((r) => Math.abs(r.v)));
  return (
    <AbsoluteFill>
      <Terminal red={0.6} ticker={data.ticker} />
      <Label text={data.label} top={300} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 400, display: "flex", flexDirection: "column", gap: 26 }}>
        {rows.map((r, i) => {
          const g = interpolate(frame, [at + i * 6, at + i * 6 + 22], [0, 1], { ...clamp, easing: EASE });
          return (
            <div key={r.name} style={pop(at - 6 + i * 6, { rise: 20, scale: 1 })}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: HEAD, fontWeight: 700, fontSize: 38, color: r.hl ? C.lime : C.cream }}>
                <span>{r.name}</span>
                <span style={{ color: r.hl ? C.lime : RED, fontVariantNumeric: "tabular-nums" }}>{(r.v * g).toFixed(1)}%</span>
              </div>
              <div style={{ height: 30, borderRadius: 10, background: "#1C1C1C", marginTop: 10, overflow: "hidden" }}>
                <div style={{ width: `${(Math.abs(r.v) / max) * 100 * g}%`, height: "100%", background: r.hl ? C.lime : RED, borderRadius: 10 }} />
              </div>
            </div>
          );
        })}
      </div>
      <Label text={data.note} at={at + 30} top={1240} color={C.grey} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ causes: pressure gauges
export const MCausesScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const items = data.items as { k: string; v: string; sub: string; cue: string }[];
  return (
    <AbsoluteFill>
      <Terminal red={0.5} />
      <Label text={data.label} top={300} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 390, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {items.map((it, i) => {
          const at = c(it.cue, 10 + i * 20);
          const shake = frame >= at && frame < at + 10 ? Math.sin(frame * 4) * 4 : 0;
          return (
            <div key={it.k} style={{ height: 300, borderRadius: 26, padding: "24px 24px", background: "#171717", border: `2px solid ${frame >= at ? RED : "#2A2A2A"}`, display: "flex", flexDirection: "column", justifyContent: "space-between", translate: `${shake}px 0`, ...pop(at, { rise: 30, scale: 0.88 }) }}>
              <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.grey }}>{it.k}</div>
              <div style={{ fontFamily: SERIF, fontSize: 86, lineHeight: 1, color: C.cream }}>{it.v}</div>
              <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 22, color: C.stone, lineHeight: 1.3 }}>{it.sub}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ bear vs bull
export const MDebateScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const bearAt = c("bear", 10);
  const bullAt = c("bull", 60);
  const side = (who: string, role: string, word: string, col: string, at: number, x: number, icon: string) => {
    const s = spring({ frame: frame - at, fps: 30, config: { damping: 12, stiffness: 180 } });
    return (
      <div style={{ position: "absolute", left: x, top: 420, width: 440, height: 460, borderRadius: 30, background: "#161616", border: `3px solid ${frame >= at ? col : "#2A2A2A"}`, padding: "30px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: frame >= at - 4 ? 1 : 0.35, scale: String(0.92 + 0.08 * s) }}>
        <div style={{ fontSize: 120, lineHeight: 1 }}>{icon}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: col }}>{word}</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 38, color: C.cream, textAlign: "center", marginTop: 20 }}>{who}</div>
        <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: C.grey, textAlign: "center" }}>{role}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <Terminal red={0.3} />
      <Label text={data.label} top={300} />
      {side(data.bear.who, data.bear.role, "BEAR", RED, bearAt, 70, "🐻")}
      {side(data.bull.who, data.bull.role, "BULL", GREEN, bullAt, 570, "🐂")}
      <div style={{ position: "absolute", left: 470, top: 600, width: 140, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: C.stone, ...pop(bearAt + 6, { scale: 0.5 }) }}>vs</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ dot-com comparison chart
export const MDotcomScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const drawAt = c("draw", 6);
  const nowAt = c("now", 90);
  const W = 920;
  const H = 480;
  // Nasdaq 2000 to 2015, normalised to the Mar 2000 peak (100): crash to 22, slow recovery.
  const pts: [number, number][] = [[0, 100], [0.06, 70], [0.12, 45], [0.18, 22], [0.3, 40], [0.45, 52], [0.55, 30], [0.62, 45], [0.75, 55], [0.88, 80], [1, 100]];
  const draw = interpolate(frame, [drawAt, drawAt + 50], [0, 1], { ...clamp, easing: EASE_IO });
  const path = pts.map(([x, v], i) => `${i ? "L" : "M"}${x * W},${H - (v / 100) * (H - 40)}`).join(" ");
  const nowG = interpolate(frame, [nowAt, nowAt + 20], [0, 1], { ...clamp, easing: EASE });
  return (
    <AbsoluteFill>
      <Terminal red={0.2} />
      <Label text={data.label} top={300} />
      <div style={{ position: "absolute", left: 80, top: 400, width: W, height: H }}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <line x1={0} y1={40} x2={W} y2={40} stroke="#3A3A3A" strokeDasharray="8 8" />
          <path d={path} fill="none" stroke={C.stone} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} strokeLinejoin="round" />
        </svg>
        <div style={{ position: "absolute", left: 0.18 * W - 60, top: H - 0.22 * (H - 40) + 10, fontFamily: HEAD, fontWeight: 700, fontSize: 44, color: RED, opacity: draw > 0.25 ? 1 : 0 }}>−78%</div>
        <div style={{ position: "absolute", left: 0, top: H + 14, fontFamily: MONO, fontSize: 20, color: C.grey }}>MAR 2000</div>
        <div style={{ position: "absolute", right: 0, top: H + 14, fontFamily: MONO, fontSize: 20, color: draw > 0.95 ? C.lime : C.grey }}>APR 2015 · RECOVERED</div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 990, display: "flex", gap: 20, ...pop(nowAt - 4, { rise: 24, scale: 0.94 }) }}>
        {[["CHIPS · LAST 8 DAYS", `−${(16 * nowG).toFixed(0)}%`, RED], ["CHIPS · 2026 SO FAR", `+${(64 * nowG).toFixed(0)}%`, C.lime]].map(([k, v, col]) => (
          <div key={k} style={{ flex: 1, borderRadius: 24, background: "#171717", border: `2px solid ${col}`, padding: "20px 22px" }}>
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: C.grey }}>{k}</div>
            <div style={{ fontFamily: SERIF, fontSize: 84, lineHeight: 1.1, color: col }}>{v}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ bubble or reset: a swinging needle, then founder rules
export const MMeterScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const settle = c("settle", 40);
  const rulesAt = c("rules", 80);
  const ang = frame < settle ? Math.sin(frame / 5) * 60 : interpolate(spring({ frame: frame - settle, fps: 30, config: { damping: 6, stiffness: 80 } }), [0, 1], [Math.sin(settle / 5) * 60, 0]);
  const rules = data.rules as string[];
  return (
    <AbsoluteFill>
      <Terminal red={0.15} />
      <Label text="NOT FINANCIAL ADVICE · DATA AS OF OCT 16 CLOSE" top={300} color={C.grey} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center" }}>
        <svg width={700} height={420} viewBox="0 0 700 420">
          <path d="M 60 350 A 290 290 0 0 1 640 350" stroke="#2A2A2A" strokeWidth={40} fill="none" />
          <path d="M 60 350 A 290 290 0 0 1 350 60" stroke={C.lime} strokeWidth={40} fill="none" opacity={0.7} />
          <path d="M 350 60 A 290 290 0 0 1 640 350" stroke={RED} strokeWidth={40} fill="none" opacity={0.7} />
          <g transform={`rotate(${ang} 350 350)`}>
            <line x1={350} y1={350} x2={350} y2={90} stroke={C.cream} strokeWidth={10} strokeLinecap="round" />
          </g>
          <circle cx={350} cy={350} r={24} fill={C.cream} />
          <text x={20} y={405} fill={C.lime} style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700 }}>RESET</text>
          <text x={560} y={405} fill={RED} style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700 }}>BUBBLE</text>
          <text x={350} y={30} fill={C.stone} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 22 }}>UNPROVEN</text>
        </svg>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 850, display: "flex", flexDirection: "column", gap: 16 }}>
        {rules.map((r, i) => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 16, background: "#171717", border: "2px solid #2A2A2A", borderRadius: 20, padding: "18px 22px", fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.cream, ...pop(rulesAt + i * 8, { rise: 20, scale: 0.94 }) }}>
            <span style={{ width: 40, height: 40, borderRadius: "50%", background: C.lime, color: C.charcoal, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, flexShrink: 0 }}>✓</span>
            {r}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ poll ask
export const MPollScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const at = c("go", 10);
  const a = 0.5 + 0.12 * Math.sin(frame / 9);
  return (
    <AbsoluteFill>
      <Terminal red={0.3} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 520, display: "flex", flexDirection: "column", gap: 26 }}>
        {[["🫧  Bubble", a, RED], ["🔁  Reset", 1 - a, C.lime]].map(([l, v, col], i) => (
          <div key={l as string} style={{ position: "relative", height: 130, borderRadius: 28, background: "#171717", border: `3px solid ${col}`, overflow: "hidden", ...pop(at + i * 8, { rise: 30, scale: 0.9 }) }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(v as number) * 100}%`, background: col as string, opacity: 0.22 }} />
            <div style={{ position: "absolute", left: 34, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 52, color: C.cream }}>{l}</div>
            <div style={{ position: "absolute", right: 34, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: 40, color: col as string }}>{Math.round((v as number) * 100)}%</div>
          </div>
        ))}
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.grey, textAlign: "center", marginTop: 6, ...pop(at + 20, { scale: 1, rise: 6 }) }}>VOTE IN THE COMMENTS</div>
      </div>
    </AbsoluteFill>
  );
};

export const MARKET_SCENES: Record<string, React.FC<SceneProps>> = {
  mCandles: MCandlesScene,
  mWipe: MWipeScene,
  mMovers: MMoversScene,
  mCauses: MCausesScene,
  mDebate: MDebateScene,
  mDotcom: MDotcomScene,
  mMeter: MMeterScene,
  mPoll: MPollScene,
};
