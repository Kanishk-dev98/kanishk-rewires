// "Decoy" scene family (9:16): 100 people flow into price cards, the decoy is removed and they re-flow.
// On-screen text is data and labels only; captions carry the narration.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";
import { usePop } from "./tut";

const HOT = "#E5484D";
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;

const Bg: React.FC<{ glow?: string }> = ({ glow = "rgba(167,255,63,0.10)" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at ${50 + Math.sin(frame / 50) * 8}% ${42 + Math.cos(frame / 60) * 5}%, ${glow}, rgba(0,0,0,0) 70%)` }} />
    </AbsoluteFill>
  );
};

const Label: React.FC<{ text: string; at: number; top: number; color?: string }> = ({ text, at, top, color = C.stone }) => {
  const pop = usePop();
  return <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: 4, color, ...pop(at, { scale: 1, rise: 8 }) }}>{text}</div>;
};

// ------------------------------------------------------------------ the Economist offer + 100 dots
type Offer = { name: string; sub: string; price: string };
const OFFERS: Offer[] = [
  { name: "Web", sub: "online only", price: "$59" },
  { name: "Print", sub: "paper only", price: "$125" },
  { name: "Print + Web", sub: "both", price: "$125" },
];
const CARD_W = 290;
const CARD_X = [72, 395, 718];
const CARD_Y = 400;
const DOT = 20;
const GAP = 6;

/** Dot i's slot in column `col` at index k (10 per row, under the card). */
const slot = (col: number, k: number) => [CARD_X[col] + 15 + (k % 10) * (DOT + GAP), CARD_Y + 360 + Math.floor(k / 10) * (DOT + GAP)];
/** Where each of 100 dots sits for a share split; -1 = crowd (unassigned). */
const layout = (shares: number[] | null) => {
  const out: [number, number, number][] = [];
  if (!shares) {
    for (let i = 0; i < 100; i++) out.push([90 + random(`cx${i}`) * 880, 1180 + random(`cy${i}`) * 180, -1]);
    return out;
  }
  let i = 0;
  shares.forEach((n, col) => {
    for (let k = 0; k < n; k++, i++) {
      const [x, y] = slot(col, k);
      out.push([x, y, col]);
    }
  });
  return out;
};

export const DOffersScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const mode = data.mode as "hook" | "intro" | "vote" | "remove";
  const from = layout(data.fromShares ?? null);
  const to = layout(data.shares ?? null);
  const flowAt = c("flow", 20);
  const killAt = c("kill", 10);
  const killed = mode === "remove";
  const fall = killed ? interpolate(frame, [killAt, killAt + 18], [0, 1], { ...clamp, easing: EASE_IO }) : 0;
  const dots = from.map((f, i) => {
    const t = to[i];
    const p = interpolate(frame, [flowAt + (i % 25) * 1.2, flowAt + 22 + (i % 25) * 1.2], [0, 1], { ...clamp, easing: EASE });
    const x = interpolate(p, [0, 1], [f[0], t[0]]);
    const y = interpolate(p, [0, 1], [f[1], t[1]]) - Math.sin(p * Math.PI) * 120;
    const col = p > 0.5 ? t[2] : f[2];
    return { x, y, col, k: i };
  });
  const prev = (data.fromShares as number[] | undefined) ?? [0, 0, 0];
  // Counters glide from the old split to the new one while the dots travel.
  const tp = interpolate(frame, [flowAt + 4, flowAt + 52], [0, 1], { ...clamp, easing: EASE_IO });
  const next = (data.shares as number[] | undefined) ?? prev;
  const shown = prev.map((v, i) => Math.round(v + (next[i] - v) * tp));
  const highlight = data.highlight as number | undefined;
  return (
    <AbsoluteFill>
      <Bg glow={killed && frame > killAt ? "rgba(229,72,77,0.10)" : undefined} />
      {data.label ? <Label text={data.label} at={0} top={300} /> : null}
      {OFFERS.map((o, i) => {
        const isDecoy = i === 1;
        const gone = isDecoy && killed;
        const target = i === 2;
        const glow = (mode === "vote" || mode === "hook") && target && frame > flowAt + 30;
        const hl = highlight === i;
        return (
          <div key={o.name} style={{ position: "absolute", left: CARD_X[i], top: CARD_Y, width: CARD_W, height: 320, borderRadius: 28, background: C.cream, color: C.charcoal, padding: "26px 24px", boxShadow: glow ? `0 0 0 5px ${C.lime}, 0 30px 70px rgba(167,255,63,0.25)` : hl ? `0 0 0 5px ${HOT}` : "0 30px 70px rgba(0,0,0,0.55)", opacity: gone ? 1 - fall : 1, translate: gone ? `0 ${fall * 500}px` : undefined, rotate: gone ? `${fall * 24}deg` : undefined, ...(mode === "intro" ? pop(c(`o${i}`, 10 + i * 8), { rise: 60, scale: 0.8 }) : {}) }}>
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: "#77756D" }}>{o.sub.toUpperCase()}</div>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 44, lineHeight: 1.05, marginTop: 10, minHeight: 96 }}>{o.name}</div>
            <div style={{ fontFamily: SERIF, fontSize: 92, lineHeight: 1 }}>{o.price}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, marginTop: 10, color: isDecoy && shown[i] === 0 && mode !== "intro" ? HOT : C.charcoal }}>{mode === "intro" ? " " : `${shown[i]} / 100`}</div>
          </div>
        );
      })}
      {dots.map((d) => (
        <div key={d.k} style={{ position: "absolute", left: d.x, top: d.y, width: DOT, height: DOT, borderRadius: "50%", background: d.col === 2 ? C.lime : d.col === 0 ? C.cream : "#6F6E68", opacity: interpolate(frame, [0, 8], [0, 1], clamp) }} />
      ))}
      {killed && frame > killAt + 4 ? (
        <div style={{ position: "absolute", left: CARD_X[1] + 30, top: CARD_Y + 120, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: HOT, border: `4px solid ${HOT}`, borderRadius: 12, padding: "6px 14px", rotate: "-12deg", opacity: interpolate(frame, [killAt + 4, killAt + 10, killAt + 30, killAt + 40], [0, 1, 1, 0], clamp) }}>REMOVED</div>
      ) : null}
      {data.note ? <Label text={data.note} at={flowAt + 30} top={1200} color={C.grey} /> : null}
      <span style={{ display: "none" }}>{D}</span>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ asymmetric dominance: the decoy loses on every row
export const DDominanceScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const rowsAt = c("rows", 20);
  const stealAt = c("steal", 70);
  const rows: [string, string, string][] = [["Print edition", "✓", "✓"], ["Web access", "✕", "✓"], ["Price", "$125", "$125"]];
  const s = spring({ frame: frame - stealAt, fps: 30, config: { damping: 10, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <Bg />
      <Label text="ASYMMETRIC DOMINANCE · HUBER, PAYNE & PUTO, 1982" at={0} top={300} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 400, display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 0, borderRadius: 28, overflow: "hidden", background: "#161616", border: "2px solid #2A2A2A", ...pop(0, { rise: 40, scale: 0.94 }) }}>
        {["", "DECOY", "TARGET"].map((h, i) => (
          <div key={i} style={{ padding: "22px 18px", fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4, textAlign: "center", color: i === 1 ? HOT : C.lime, background: "#1C1C1C" }}>{h}</div>
        ))}
        {rows.map(([n, a, b], r) => (
          <React.Fragment key={n}>
            <div style={{ padding: "26px 22px", fontFamily: BODY, fontWeight: 600, fontSize: 30, color: C.stone, borderTop: "1px solid #2A2A2A", ...pop(rowsAt + r * 8, { scale: 1, rise: 10 }) }}>{n}</div>
            <div style={{ padding: "26px 0", textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: a === "✕" ? HOT : C.cream, borderTop: "1px solid #2A2A2A", ...pop(rowsAt + r * 8 + 3, { scale: 0.6, rise: 0 }) }}>{a}</div>
            <div style={{ padding: "26px 0", textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: b === "✓" ? C.lime : C.cream, borderTop: "1px solid #2A2A2A", ...pop(rowsAt + r * 8 + 5, { scale: 0.6, rise: 0 }) }}>{b}</div>
          </React.Fragment>
        ))}
      </div>
      {frame >= stealAt ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, background: C.lime, color: C.charcoal, borderRadius: 26, padding: "18px 34px", fontFamily: HEAD, fontWeight: 700, fontSize: 56, rotate: `${(1 - s) * -10 - 2}deg`, scale: String(0.6 + 0.4 * s), boxShadow: "0 24px 60px rgba(167,255,63,0.3)" }}>
            Web <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400 }}>= $0</span>
          </div>
        </div>
      ) : null}
      {frame >= stealAt + 10 ? <Label text="SAME PRICE · MORE STUFF" at={stealAt + 10} top={1060} color={C.lime} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ everyday: a cinema menu (illustrative)
export const DMenuScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const items = data.items as { size: string; price: string; cue: string; h: number }[];
  const pickAt = c("pick", 90);
  return (
    <AbsoluteFill>
      <Bg glow="rgba(245,196,81,0.12)" />
      <Label text="ILLUSTRATIVE · CINEMA MENU" at={0} top={300} color={C.grey} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 420, height: 640, display: "flex", alignItems: "flex-end", justifyContent: "space-around" }}>
        {items.map((it, i) => {
          const at = c(it.cue, 10 + i * 14);
          const picked = i === items.length - 1 && frame >= pickAt;
          return (
            <div key={it.size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...pop(at, { rise: 50, scale: 0.7 }) }}>
              <svg width={it.h * 0.75} height={it.h} viewBox="0 0 75 100" style={{ filter: picked ? "drop-shadow(0 0 30px rgba(167,255,63,0.6))" : undefined }}>
                {new Array(9).fill(0).map((_, k) => (
                  <circle key={k} cx={14 + (k % 5) * 12 + (k > 4 ? 6 : 0)} cy={k > 4 ? 12 : 20} r={9} fill="#F6EBCF" />
                ))}
                <path d="M6 22 L69 22 L60 98 L15 98 Z" fill={picked ? C.lime : "#E5484D"} />
                {[0, 1, 2].map((k) => (
                  <path key={k} d={`M${18 + k * 15} 22 L${22 + k * 13} 98`} stroke="rgba(255,255,255,0.7)" strokeWidth={5} />
                ))}
              </svg>
              <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: C.stone }}>{it.size}</div>
              <div style={{ fontFamily: SERIF, fontSize: 70, lineHeight: 1, color: picked ? C.lime : C.cream }}>{it.price}</div>
            </div>
          );
        })}
      </div>
      {frame >= pickAt ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1120, display: "flex", justifyContent: "center", ...pop(pickAt + 4, { rise: 20, scale: 0.6 }) }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: C.charcoal, background: C.lime, borderRadius: 999, padding: "10px 24px" }}>{data.pill}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the honest size: 3.6M purchases, ~1%
export const DRealityScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const nAt = c("count", 10);
  const pAt = c("pct", 60);
  const n = Math.round(interpolate(frame, [nAt, nAt + 30], [0, 3600000], { ...clamp, easing: EASE }));
  const g = interpolate(frame, [pAt, pAt + 20], [0, 1], { ...clamp, easing: EASE });
  return (
    <AbsoluteFill>
      <Bg glow="rgba(229,72,77,0.08)" />
      <div style={{ position: "absolute", left: 80, right: 80, top: 330, display: "grid", gridTemplateColumns: "repeat(20, 1fr)", gap: 8, opacity: 0.9 }}>
        {new Array(160).fill(0).map((_, i) => {
          const on = frame >= nAt + (i / 160) * 30;
          return <div key={i} style={{ height: 34, borderRadius: "8px 8px 4px 4px", background: on ? (i % 9 === 0 ? "#7A1E2B" : "#3C1A20") : "#1A1A1A", transition: "none" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", ...pop(nAt, { scale: 0.8 }) }}>
        <div style={{ fontFamily: SERIF, fontSize: 150, lineHeight: 1, color: C.cream, fontVariantNumeric: "tabular-nums" }}>{n.toLocaleString("en-US")}</div>
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: C.grey, marginTop: 6 }}>REAL WINE PURCHASES · UK SUPERMARKETS</div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1000, ...pop(pAt - 4, { rise: 20, scale: 1 }) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: C.cream }}>
          <span>Choice shift</span>
          <span style={{ color: C.lime }}>~{(1 * g).toFixed(0)}%</span>
        </div>
        <div style={{ height: 30, borderRadius: 10, background: "#1E1E1E", marginTop: 12, overflow: "hidden" }}>
          <div style={{ width: `${8 * g}%`, height: "100%", background: C.lime }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: C.grey, marginTop: 14 }}>DEVINE ET AL., NPJ SCIENCE OF LEARNING, 2025</div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ how to: build your own pricing table with a decoy
export const DBuildScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const decoyAt = c("decoy", 30);
  const sideAt = c("side", 80);
  const testAt = c("test", 120);
  const plans = data.plans as { name: string; price: string; feats: string[]; role?: string }[];
  const ab = interpolate(frame, [testAt, testAt + 30], [0, 1], { ...clamp, easing: EASE });
  return (
    <AbsoluteFill>
      <Bg />
      <Label text="YOUR PRICING PAGE" at={0} top={300} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 380, display: "flex", gap: 16, alignItems: "flex-start" }}>
        {plans.map((p, i) => {
          const isDecoy = p.role === "decoy";
          const isTarget = p.role === "target";
          const at = isDecoy ? decoyAt : i * 5;
          return (
            <div key={p.name} style={{ flex: 1, borderRadius: 24, padding: "22px 18px", background: isTarget ? C.lime : C.graphite, color: isTarget ? C.charcoal : C.cream, border: isDecoy ? `3px dashed ${C.grey}` : "2px solid #2C2C2C", boxShadow: isTarget && frame >= sideAt ? "0 0 60px rgba(167,255,63,0.35)" : undefined, ...pop(at, { rise: 40, scale: isDecoy ? 0.5 : 0.9 }) }}>
              <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 3, opacity: 0.7, minHeight: 20 }}>{isDecoy ? "DECOY" : isTarget ? "TARGET" : " "}</div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 34, marginTop: 6 }}>{p.name}</div>
              <div style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1.1 }}>{p.price}</div>
              {p.feats.map((f, k) => (
                <div key={f} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 21, marginTop: 10, opacity: f.startsWith("✕") ? 0.5 : 1, ...pop((isDecoy ? decoyAt : sideAt - 20) + k * 3, { scale: 1, rise: 6 }) }}>
                  {f}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {frame >= testAt - 6 ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: 940, ...pop(testAt - 6, { rise: 20, scale: 0.95 }) }}>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.stone, marginBottom: 12 }}>A/B TEST · TARGET PLAN SHARE</div>
          {[["Without decoy", 38, "#5A5A55"], ["With decoy", 38 + 9 * ab, C.lime]].map(([l, v, col]) => (
            <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
              <span style={{ width: 230, fontFamily: BODY, fontWeight: 600, fontSize: 24, color: C.cream }}>{l}</span>
              <div style={{ flex: 1, height: 30, borderRadius: 10, background: "#1E1E1E", overflow: "hidden" }}>
                <div style={{ width: `${v as number}%`, height: "100%", background: col as string }} />
              </div>
              <span style={{ width: 70, fontFamily: MONO, fontSize: 24, color: C.cream }}>{Math.round(v as number)}%</span>
            </div>
          ))}
          <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: C.grey, marginTop: 12 }}>EXAMPLE NUMBERS · RUN YOUR OWN TEST</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const DECOY_SCENES: Record<string, React.FC<SceneProps>> = {
  dOffers: DOffersScene,
  dDominance: DDominanceScene,
  dMenu: DMenuScene,
  dReality: DRealityScene,
  dBuild: DBuildScene,
};
