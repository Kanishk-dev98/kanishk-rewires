import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Logo } from "../film/kit";
import {
  Beat,
  Burst,
  clamp,
  COLS,
  dist,
  DotField,
  DotPaint,
  ein,
  expo,
  fadeOut,
  FIG,
  Glass,
  idle,
  K,
  MONO,
  Orb,
  Pill,
  pop,
  Push,
  ROWS,
  Sfx,
  Shape,
  typed,
  whipIn,
  whipOut,
  Words,
} from "./kit58";

export type S = { B: Beat; dur: number };

const Full: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", ...style }}>{children}</AbsoluteFill>
);

/* ===== S1 · Agents do the work ===== */
export const S1: React.FC<S> = ({ B }) => {
  const paint: DotPaint = (i, j, fr) => {
    const d = dist(i, j);
    const a = interpolate(fr, [B(0) + d * 0.9, B(0) + d * 0.9 + 10], [0, 0.55], clamp);
    if (i === 24 && j === 13) {
      const pulse = Math.max(0, 1 - ((fr % 15) / 15) * 1.6);
      return { c: K.green, a: Math.max(a, 0.9), r: 3 + pulse * 5 };
    }
    return { c: "#3A3A3A", a };
  };
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <DotField paint={paint} />
      <Full>
        <Words
          size={190}
          words={[
            { t: "Agents", at: B(2) },
            { t: "do", at: B(3) },
            { t: "the", at: B(4) },
            { t: "work.", at: B(5), color: K.green },
          ]}
        />
      </Full>
      {[2, 3, 4, 5].map((b) => (
        <Sfx key={b} name="tick" at={B(b)} volume={0.25} />
      ))}
    </AbsoluteFill>
  );
};

/* ===== S2 · They pay for it, too. → explosion ===== */
const Coin: React.FC<{ size: number }> = ({ size }) => (
  <span style={{ display: "inline-flex", width: size * 0.62, height: size * 0.62, borderRadius: "50%", border: `${size * 0.07}px solid ${K.green}`, background: "#0F1C17", alignItems: "center", justifyContent: "center", verticalAlign: "-0.05em", margin: `0 ${size * 0.03}px` }}>
    <span style={{ fontFamily: MONO, fontSize: size * 0.32, color: K.green, fontWeight: 500 }}>$</span>
  </span>
);

export const S2: React.FC<S> = ({ B }) => {
  const f = useCurrentFrame();
  const whip = B(5);
  const coinOn = f >= B(1) + 4 && f < B(1) + 10;
  const size = 170;
  const paint: DotPaint = (i, j, fr) => {
    const t = fr - whip;
    if (t < 0) return null;
    const d = dist(i, j);
    const reach = Math.pow(t / (B(8) - whip), 1.6) * 30;
    if (d > reach) return { c: "#2A2A2A", a: 0.35 };
    const speed = 0.25 + (t / (B(8) - whip)) * 0.9;
    const wave = Math.sin(d * 0.9 - t * speed) * 0.5 + 0.5;
    const flick = random(`fl${i}-${j}-${Math.floor(t / 2)}`) > 0.35 ? 1 : 0.3;
    return { c: K.green, a: (0.25 + wave * 0.75) * flick, r: 2.4 + wave * 2 };
  };
  return (
    <AbsoluteFill style={{ background: f < whip ? K.white : K.bg }}>
      {f < whip + 7 ? (
        <AbsoluteFill style={{ background: K.white, ...whipOut(f, whip) }}>
          <Full>
            <Words
              size={size}
              color={K.ink}
              words={[
                { t: "They", at: B(0) },
                { t: coinOn ? <span>p<Coin size={size} />y</span> : "pay", at: B(1) },
                { t: "for", at: B(2) },
                { t: "it,", at: B(2.5) },
                { t: "too.", at: B(3) },
              ]}
            />
          </Full>
        </AbsoluteFill>
      ) : null}
      {f >= whip ? <DotField paint={paint} /> : null}
      <Sfx name="ding" at={B(1) + 4} volume={0.15} />
      <Sfx name="whoosh" at={whip - 2} volume={0.4} />
    </AbsoluteFill>
  );
};

/* ===== S3 · So who said yes? ===== */
export const S3: React.FC<S> = ({ B }) => (
  <AbsoluteFill style={{ background: K.bg }}>
    <DotField paint={() => ({ c: "#3A3A3A", a: 0.5 })} />
    <Full>
      <Words
        size={196}
        words={[
          { t: "So", at: B(1) },
          { t: "who", at: B(1.5) },
          { t: "said", at: B(2) },
          { t: "yes?", at: B(2.5) },
        ]}
      />
    </Full>
  </AbsoluteFill>
);

/* ===== S4 · Agent Interface + KYI rules ===== */
const SENTENCE =
  "Restock studio supplies every Monday. Up to $200 an order, only from Northline or Papercraft. Ask me before anything recurring, and check with me if bank details change.";
const CLAUSES = ["Up to $200 an order", "only from Northline or Papercraft", "Ask me before anything recurring", "check with me if bank details change"];
const RULES: { d: "allow" | "ask" | "held"; text: string; kind: string }[] = [
  { d: "allow", text: "≤ $200 per order", kind: "AMOUNT" },
  { d: "allow", text: "Northline, Papercraft", kind: "MERCHANTS" },
  { d: "ask", text: "Recurring: ask first", kind: "SCHEDULE" },
  { d: "held", text: "New payee details: hold", kind: "PAYEE" },
];

export const S4: React.FC<S> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const typeFrom = B(2);
  const shown = typed(SENTENCE, f, typeFrom, 72);
  const done = shown.length >= SENTENCE.length;
  const lift = (k: number) => B(7.6 + k * 0.5);
  const tap = B(10.5);
  const seal = B(11);
  const panelIn = pop(f, B(0.5), 16);
  // highlight clauses as they lift
  const renderSentence = () => {
    if (!done) return shown;
    let out: React.ReactNode[] = [];
    let rest = SENTENCE;
    CLAUSES.forEach((c, k) => {
      const idx = rest.indexOf(c);
      out.push(rest.slice(0, idx));
      const lifted = f >= lift(k);
      out.push(
        <span key={k} style={{ color: lifted ? "#4A4A4E" : K.green, background: lifted ? "transparent" : "rgba(114,227,173,0.12)", borderRadius: 6, transition: "none" }}>
          {c}
        </span>,
      );
      rest = rest.slice(idx + c.length);
    });
    out.push(rest);
    return out;
  };
  const cursorX = interpolate(f, [B(9.4), tap - 2], [1320, 1500], { ...clamp, easing: expo });
  const cursorY = interpolate(f, [B(9.4), tap - 2], [980, 582], { ...clamp, easing: expo });
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <DotField paint={idle} opacity={0.6} />
      <Orb x={960} y={520} size={1100} opacity={0.14} />
      {/* far layer: big type */}
      <div style={{ position: "absolute", left: 160, top: 96 }}>
        <Words
          size={118}
          words={[
            { t: "Say", at: B(0.5) },
            { t: "what's", at: B(1) },
            { t: "allowed.", at: B(1.5) },
            { t: "Once.", at: B(11.5), color: K.green },
          ]}
        />
      </div>
      <Push dur={dur}>
        {/* mid layer: glass chat panel */}
        <div style={{ position: "absolute", left: 220, right: 220, top: 290, opacity: panelIn, scale: String(0.92 + 0.08 * panelIn), translate: `0px ${(1 - panelIn) * 60}px` }}>
          <Glass style={{ padding: "26px 34px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: K.muted }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: K.green }} />
              AGENT INTERFACE · new instruction
            </div>
            <div style={{ marginTop: 18, padding: "22px 28px", borderRadius: 20, background: "rgba(255,255,255,0.06)", fontFamily: FIG, fontWeight: 500, fontSize: 34, lineHeight: 1.45, color: K.text, minHeight: 150 }}>
              {renderSentence()}
              {!done ? <span style={{ display: "inline-block", width: 3, height: 34, background: K.green, marginLeft: 4, verticalAlign: "-4px" }} /> : null}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <div style={{ padding: "14px 30px", borderRadius: 999, background: f >= tap ? K.green : "rgba(114,227,173,0.14)", border: `1.5px solid ${K.green}`, color: f >= tap ? K.ink : K.green, fontFamily: FIG, fontWeight: 700, fontSize: 26, opacity: ein(f, B(9.2), 10), scale: f >= tap && f < tap + 4 ? "0.94" : "1" }}>
                Confirm &amp; seal
              </div>
            </div>
          </Glass>
        </div>
        {/* rule cards */}
        <div style={{ position: "absolute", left: 160, right: 160, top: 790, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {RULES.map((r, k) => {
            const at = lift(k);
            const t = ein(f, at, 12);
            const sealed = f >= seal + k * 3;
            const sweep = interpolate(f, [seal + k * 3, seal + k * 3 + 10], [0, 1], clamp);
            return (
              <div
                key={k}
                style={{
                  position: "relative",
                  height: 130,
                  borderRadius: 20,
                  padding: "20px 24px",
                  background: "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
                  border: `1.5px solid ${sealed ? K.green : "rgba(255,255,255,0.14)"}`,
                  boxShadow: sealed ? `0 0 40px rgba(114,227,173,0.25)` : "0 20px 50px rgba(0,0,0,0.5)",
                  opacity: f >= at ? 1 : 0,
                  translate: `${(1 - t) * (k < 2 ? -420 : 420)}px ${(1 - t) * -360}px`,
                  scale: String(0.85 + 0.15 * t),
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: K.muted }}>
                  <Shape d={r.d} size={16} />
                  {r.kind}
                  {sealed ? <span style={{ marginLeft: "auto", color: K.green }}>✓ sealed</span> : null}
                </div>
                <div style={{ marginTop: 18, fontFamily: FIG, fontWeight: 700, fontSize: 32, color: K.text }}>{r.text}</div>
                <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sweep * 120 - 20}%`, width: "30%", background: "linear-gradient(90deg, transparent, rgba(114,227,173,0.45), transparent)", opacity: sweep > 0 && sweep < 1 ? 1 : 0 }} />
              </div>
            );
          })}
        </div>
      </Push>
      {/* cursor */}
      <svg width="54" height="54" viewBox="0 0 24 24" style={{ position: "absolute", left: cursorX, top: cursorY, opacity: f >= B(9.4) && f < seal + 20 ? 1 : 0 }}>
        <path d="M4 2l15 8.5-6.6 1.9L9.6 19z" fill="white" stroke="#0A0A0A" strokeWidth="1.2" />
      </svg>
      {f >= tap && f < tap + 14 ? (
        <div style={{ position: "absolute", left: 1520 - 40 - (f - tap) * 4, top: 600 - 40 - (f - tap) * 4, width: 80 + (f - tap) * 8, height: 80 + (f - tap) * 8, borderRadius: "50%", border: `2px solid ${K.green}`, opacity: 1 - (f - tap) / 14 }} />
      ) : null}
      {Array.from({ length: 14 }).map((_, k) => (
        <Sfx key={k} name="mouse-click" at={typeFrom + k * 11} volume={0.06} />
      ))}
      {RULES.map((_, k) => (
        <Sfx key={`w${k}`} name="whip" at={lift(k)} volume={0.12} />
      ))}
      <Sfx name="mouse-click" at={tap} volume={0.4} />
      <Sfx name="ding" at={seal} volume={0.22} />
    </AbsoluteFill>
  );
};

/* ===== S5 · Embedded Wallet ===== */
const SEED = "orbit maple frost lantern quarry velvet hinge cobalt drift amber pixel tundra ripple saddle ember gravel nectar plume harbor zenith copper meadow sable fable".split(" ");

export const S5: React.FC<S> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const corner = ein(f, B(0), 14);
  const scan = interpolate(f, [B(1), B(2.6)], [0, 1], { ...clamp, easing: expo });
  const morph = ein(f, B(3), 12);
  const gagOn = f >= B(3.4) && f < B(3.4) + 6;
  const cx = 960;
  const cy = 450;
  const s = 300;
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <DotField paint={idle} opacity={0.5} />
      <Orb x={cx} y={cy} size={900} opacity={0.12 + 0.12 * morph} />
      <Push dur={dur}>
        {gagOn ? (
          <div style={{ position: "absolute", left: cx - 520, top: cy - 170, width: 1040, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, filter: "blur(3px)", opacity: 0.8 }}>
            {SEED.map((w, k) => (
              <div key={k} style={{ position: "relative", fontFamily: MONO, fontSize: 24, color: K.muted, textAlign: "center", padding: "10px 0", border: "1px solid #2A2A2A", borderRadius: 10 }}>
                {k + 1}. {w}
                <div style={{ position: "absolute", left: 6, right: 6, top: "50%", height: 3, background: K.held }} />
              </div>
            ))}
          </div>
        ) : null}
        {/* Face ID frame */}
        <svg width={s + 40} height={s + 40} style={{ position: "absolute", left: cx - s / 2 - 20, top: cy - s / 2 - 20, opacity: 1 - morph }}>
          {[
            [20, 20, 1, 1],
            [s + 20, 20, -1, 1],
            [20, s + 20, 1, -1],
            [s + 20, s + 20, -1, -1],
          ].map(([x, y, dx, dy], k) => (
            <path key={k} d={`M ${x} ${y + dy * 70} L ${x} ${y} L ${x + dx * 70} ${y}`} fill="none" stroke={K.green} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - corner} />
          ))}
          <g opacity={scan > 0 && scan < 1 ? 1 : 0}>
            <rect x={36} y={20 + scan * s} width={s - 32} height={4} rx={2} fill={K.green} />
            <rect x={36} y={20 + scan * s - 40} width={s - 32} height={40} fill="url(#scanG)" />
          </g>
          <defs>
            <linearGradient id="scanG" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={K.green} stopOpacity="0" />
              <stop offset="1" stopColor={K.green} stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <g stroke="#5A5A5E" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9}>
            <path d={`M ${s / 2 - 40} ${s / 2 - 10} v 20 M ${s / 2 + 80} ${s / 2 - 10} v 20`} />
            <path d={`M ${s / 2 + 20} ${s / 2 - 10} v 50 h -14`} />
            <path d={`M ${s / 2 - 30} ${s / 2 + 80} q 50 36 100 0`} />
          </g>
        </svg>
        {/* Wallet ready card */}
        <div style={{ position: "absolute", left: cx - 360, top: cy - 110, width: 720, opacity: morph, scale: String(0.6 + 0.4 * pop(f, B(3), 14)) }}>
          <Glass style={{ padding: "34px 40px", border: `1.5px solid ${K.green}`, boxShadow: `0 0 60px rgba(114,227,173,0.25), 0 40px 120px rgba(0,0,0,0.6)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Shape d="allow" size={22} />
              <span style={{ fontFamily: FIG, fontWeight: 800, fontSize: 52, color: K.text }}>Wallet ready</span>
            </div>
            <div style={{ marginTop: 16, fontFamily: MONO, fontSize: 30, color: K.green }}>0x8f3a…21c4 · No seed phrase</div>
          </Glass>
        </div>
      </Push>
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, display: "flex", justifyContent: "center" }}>
        <Words
          size={104}
          words={[
            { t: "A", at: B(4) },
            { t: "wallet", at: B(4.5) },
            { t: "in", at: B(5) },
            { t: "one", at: B(5.5) },
            { t: "tap.", at: B(6), color: K.green },
          ]}
        />
      </div>
      <Sfx name="switch" at={B(1)} volume={0.2} />
      <Sfx name="ding" at={B(3)} volume={0.22} />
    </AbsoluteFill>
  );
};

/* ===== S6 · Identity (the only light scene) ===== */
export const S6: React.FC<S> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const badge = ein(f, B(2), 12);
  const tick = interpolate(f, [B(2.6), B(3.2)], [0, 1], clamp);
  const items = [
    ["Sketch paper A3 × 4", "$58.40"],
    ["Ink set", "$28.00"],
    ["Masking tape", "$16.00"],
  ];
  return (
    <AbsoluteFill style={{ background: "#F2F2F0", ...whipIn(f, 0) }}>
      <DotField paint={() => ({ c: "#D6D6D2", a: 0.8 })} />
      <Push dur={dur} amount={0.03}>
        <div style={{ position: "absolute", left: 140, top: 170, width: 1040, height: 720, perspective: 2000 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "white", boxShadow: "0 60px 140px rgba(0,0,0,0.18), 0 10px 30px rgba(0,0,0,0.08)", transform: `rotateY(${8 - f * 0.04}deg) rotateX(3deg)`, overflow: "hidden", fontFamily: FIG, color: "#1A1A1A" }}>
            <div style={{ height: 54, background: "#F4F4F2", display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: "1px solid #E6E6E2" }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                <span key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
              ))}
              <span style={{ marginLeft: 20, padding: "6px 18px", borderRadius: 8, background: "white", fontFamily: MONO, fontSize: 16, color: "#777" }}>northline.supply/checkout</span>
            </div>
            <div style={{ padding: "34px 46px" }}>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>Northline Supply</div>
              <div style={{ fontSize: 20, color: "#888", marginTop: 4 }}>Checkout</div>
              <div style={{ marginTop: 30, borderTop: "1px solid #EEE" }}>
                {items.map(([n, p], k) => (
                  <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 26, padding: "18px 0", borderBottom: "1px solid #EEE", opacity: ein(f, B(0.5) + k * 3, 8) }}>
                    <span>{n}</span>
                    <span style={{ fontFamily: MONO }}>{p}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 800, marginTop: 24 }}>
                <span>Total</span>
                <span style={{ fontFamily: MONO }}>$102.40</span>
              </div>
              <div style={{ marginTop: 30, height: 70, borderRadius: 14, background: "#1A1A1A", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700 }}>Pay $102.40</div>
            </div>
          </div>
        </div>
      </Push>
      {/* right column: badge + type */}
      <div style={{ position: "absolute", left: 1250, right: 110, top: 300, opacity: badge, translate: `${(1 - badge) * 200}px 0px` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: "20px 28px", borderRadius: 20, background: "white", border: "1.5px solid #CDEFDD", boxShadow: "0 30px 70px rgba(0,0,0,0.14)" }}>
          <svg width="46" height="52" viewBox="0 0 46 52">
            <path d="M23 2 L42 9 V25 C42 38 33 46 23 50 C13 46 4 38 4 25 V9 Z" fill="#0A6B47" />
            <path d="M13 26 L20 33 L34 18" fill="none" stroke={K.green} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} />
          </svg>
          <div style={{ fontFamily: FIG }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1A1A1A" }}>Verified agent</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: "#555" }}>acting for Studio Ivy</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 1250, right: 110, top: 470 }}>
        <Words
          size={86}
          color={K.ink}
          words={[
            { t: "Recognised", at: B(3.5) },
            { t: "at", at: B(4) },
            { t: "every", at: B(4.5) },
            { t: "checkout.", at: B(5), color: "#0A6B47" },
          ]}
        />
      </div>
      <Sfx name="whoosh" at={0} volume={0.4} />
      <Sfx name="ding" at={B(2.6)} volume={0.2} />
    </AbsoluteFill>
  );
};

/* ===== S7 · Discovery + Payments ===== */
const TILES = [
  { n: "Weather", p: "0.01", g: "M6 18 a5 5 0 0 1 1-10 a7 7 0 0 1 13 2 a4 4 0 0 1 0 8 Z" },
  { n: "FX rates", p: "0.02", g: "M4 8 H20 L16 4 M20 16 H4 L8 20" },
  { n: "Freight quotes", p: "0.03", g: "M2 7 H14 V17 H2 Z M14 10 H19 L22 13 V17 H14 M6 19 a2 2 0 1 0 0.1 0 M18 19 a2 2 0 1 0 0.1 0" },
  { n: "Market data", p: "0.02", g: "M3 20 V4 M3 20 H21 M7 15 L11 10 L14 13 L20 6" },
  { n: "Web search", p: "0.01", g: "M10 3 a7 7 0 1 0 0.1 0 M15 15 L21 21" },
  { n: "Translation", p: "0.02", g: "M3 5 H13 M8 3 V5 M5 5 C6 10 9 13 13 14 M11 5 C10 10 7 13 3 14 M13 21 L17 11 L21 21 M14.5 18 H19.5" },
];
const SORTED = [2, 3, 1, 0, 4, 5]; // relevance order after the freight query
const QUERY = "freight quote, 40 kg to Rotterdam";

export const S7: React.FC<S> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const resort = interpolate(f, [B(5), B(5) + 12], [0, 1], { ...clamp, easing: expo });
  const lifted = ein(f, B(5.6), 10);
  const chip = pop(f, B(6.4), 12);
  const tw = 380;
  const th = 170;
  const gx = (1920 - (tw * 3 + 30 * 2)) / 2;
  const pos = (slot: number) => ({ x: gx + (slot % 3) * (tw + 30), y: 290 + Math.floor(slot / 3) * (th + 30) });
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <DotField paint={idle} opacity={0.55} />
      <Orb x={960} y={470} size={1200} opacity={0.12} />
      <Push dur={dur}>
        {/* search */}
        <div style={{ position: "absolute", left: gx, width: tw * 3 + 60, top: 170, opacity: ein(f, B(2), 10) }}>
          <Glass style={{ height: 76, borderRadius: 999, display: "flex", alignItems: "center", gap: 18, padding: "0 30px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24">
              <path d={TILES[4].g} fill="none" stroke={K.muted} strokeWidth={2} strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: FIG, fontWeight: 500, fontSize: 30, color: K.text }}>{typed(QUERY, f, B(2.5), 30)}</span>
          </Glass>
        </div>
        {TILES.map((t, k) => {
          const from = pos(k);
          const to = pos(SORTED.indexOf(k));
          const x = interpolate(resort, [0, 1], [from.x, to.x]);
          const y = interpolate(resort, [0, 1], [from.y, to.y]);
          const isF = k === 2;
          const enter = pop(f, B(0) + k * 4, 14);
          return (
            <div
              key={t.n}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: tw,
                height: th,
                opacity: enter * (lifted > 0 && !isF ? 1 - 0.55 * lifted : 1),
                scale: String(enter * (isF ? 1 + 0.07 * lifted : 1)),
                translate: `0px ${isF ? -14 * lifted : 0}px`,
                zIndex: isF ? 2 : 1,
              }}
            >
              <Glass style={{ height: "100%", borderRadius: 24, padding: "24px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between", border: isF && lifted > 0 ? `1.5px solid ${K.green}` : undefined, boxShadow: isF && lifted > 0 ? `0 0 60px rgba(114,227,173,${0.35 * lifted})` : undefined }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(114,227,173,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="30" height="30" viewBox="0 0 24 24">
                    <path d={t.g} fill="none" stroke={K.green} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: FIG, fontWeight: 700, fontSize: 30, color: K.text }}>{t.n}</span>
                  <span style={{ fontFamily: MONO, fontSize: 20, color: K.muted }}>{t.p} USDC</span>
                </div>
              </Glass>
            </div>
          );
        })}
        {/* receipt chip popping out of freight (slot 0) */}
        <div style={{ position: "absolute", left: pos(0).x + tw - 60, top: pos(0).y - 34, opacity: chip, scale: String(chip), zIndex: 3 }}>
          <Pill d="allow" label="Paid 0.03 USDC" size={24} style={{ background: "#0F1C17" }} />
        </div>
      </Push>
      <div style={{ position: "absolute", left: 0, right: 0, top: 750, display: "flex", justifyContent: "center", gap: 40 }}>
        <Words
          size={110}
          words={[
            { t: "Pays", at: B(7) },
            { t: "per", at: B(7.5) },
            { t: "call.", at: B(8) },
            { t: "In", at: B(8.5), color: K.green },
            { t: "cents.", at: B(9), color: K.green },
          ]}
        />
      </div>
      {TILES.map((_, k) => (
        <Sfx key={k} name="tick" at={B(0) + k * 4} volume={0.12} />
      ))}
      <Sfx name="whip" at={B(5)} volume={0.2} />
      <Sfx name="ding" at={B(6.4)} volume={0.22} />
    </AbsoluteFill>
  );
};

/* ===== Decision stream (shared by S8 and S10) ===== */
type Row = { time: string; what: string; amt: string; d: "allow" | "ask" | "held" };
const STREAM: Row[] = [
  { time: "09:00:02", what: "Northline Supply", amt: "$42.10", d: "allow" },
  { time: "09:00:03", what: "Weather", amt: "0.01 USDC", d: "allow" },
  { time: "09:00:05", what: "Papercraft", amt: "$18.60", d: "allow" },
  { time: "09:00:06", what: "Freight quotes", amt: "0.03 USDC", d: "allow" },
  { time: "09:00:09", what: "Northline Supply", amt: "$102.40", d: "allow" },
  { time: "09:00:11", what: "FX rates", amt: "0.02 USDC", d: "allow" },
  { time: "09:00:12", what: "Web search", amt: "0.01 USDC", d: "allow" },
  { time: "09:00:14", what: "Papercraft", amt: "$64.00", d: "allow" },
];

const Stream: React.FC<{ rows: Row[]; stampAt: (k: number) => number; dimExcept?: number; dim?: number; liftOut?: number }> = ({ rows, stampAt, dimExcept, dim = 0, liftOut = 0 }) => {
  const f = useCurrentFrame();
  const visible = rows.filter((_, k) => f >= stampAt(k) - 6);
  return (
    <Glass style={{ padding: "26px 34px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: K.muted, marginBottom: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: K.green }} />
        KYI · DECISION STREAM · LIVE
      </div>
      <div style={{ height: 430, overflow: "hidden", position: "relative" }}>
        {visible
          .map((r, k) => ({ r, k }))
          .reverse()
          .map(({ r, k }, pos) => {
            const at = stampAt(k);
            const enter = ein(f, at - 6, 8);
            const stamp = f >= at;
            const s = interpolate(f - at, [0, 4, 8], [1.7, 0.94, 1], clamp);
            const isTarget = dimExcept === k;
            const op = isTarget ? 1 - liftOut : 1 - dim * 0.85;
            return (
              <div key={k} style={{ position: "absolute", left: 0, right: 0, top: pos * 72, height: 64, display: "grid", gridTemplateColumns: "150px 1fr 200px 170px", alignItems: "center", fontFamily: MONO, fontSize: 24, color: K.text, borderBottom: `1px solid ${K.divider}`, opacity: enter * op, translate: `0px ${(1 - enter) * -30}px` }}>
                <span style={{ color: K.muted }}>{r.time}</span>
                <span style={{ fontFamily: FIG, fontWeight: 600, fontSize: 28 }}>{r.what}</span>
                <span style={{ textAlign: "right" }}>{r.amt}</span>
                <span style={{ textAlign: "right" }}>{stamp ? <span style={{ display: "inline-block", scale: String(s) }}><Pill d={r.d} size={20} /></span> : null}</span>
              </div>
            );
          })}
      </div>
    </Glass>
  );
};

/* ===== S8 · KYI allow ===== */
export const S8: React.FC<S> = ({ B, dur }) => {
  const order = (i: number, j: number) => j * COLS + i;
  const total = COLS * ROWS;
  const paint: DotPaint = (i, j, fr) => {
    const beat = (fr - B(0)) / (B(1) - B(0));
    const lit = order(i, j) < (Math.floor(beat) + 1) / 8 * total;
    const flash = Math.max(0, 1 - (beat % 1) * 3);
    return lit ? { c: K.green, a: 0.45 + 0.4 * flash, r: 2.4 + flash * 1.2 } : { c: "#3A3A3A", a: 0.5 };
  };
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <DotField paint={paint} />
      <Push dur={dur}>
        <div style={{ position: "absolute", left: 360, right: 360, top: 150 }}>
          <Stream rows={STREAM} stampAt={(k) => B(k)} />
        </div>
      </Push>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, display: "flex", justifyContent: "center" }}>
        <Words
          size={104}
          words={[
            { t: "Every", at: B(1) },
            { t: "action,", at: B(1.5) },
            { t: "checked", at: B(2) },
            { t: "first.", at: B(2.5), color: K.green },
          ]}
        />
      </div>
      {STREAM.map((_, k) => (
        <Sfx key={k} name="tick" at={B(k)} volume={0.2} />
      ))}
    </AbsoluteFill>
  );
};

/* ===== S9 · KYI ask ===== */
export const S9: React.FC<S> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const phone = ein(f, B(0), 14);
  const card = pop(f, B(1.5), 14);
  const tap = B(3.5);
  const approved = f >= tap + 3;
  const flip = interpolate(f, [tap + 3, tap + 9], [0, 1], clamp);
  const thumbIn = ein(f, B(2.6), 12);
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <DotField paint={idle} opacity={0.5} />
      <Orb x={1350} y={560} size={900} color={approved ? K.green : K.ask} opacity={0.14} />
      <div style={{ position: "absolute", left: 150, top: 380, width: 900 }}>
        <Words
          size={104}
          words={[
            { t: "It", at: B(4.5) },
            { t: "asks", at: B(5), color: K.ask },
            { t: "when", at: B(5.5) },
            { t: "it", at: B(6) },
            { t: "should.", at: B(6.5) },
          ]}
        />
      </div>
      <Push dur={dur}>
        <div style={{ position: "absolute", left: 1170, top: 150, width: 380, height: 780, translate: `0px ${(1 - phone) * 700}px`, rotate: `${(1 - phone) * 6}deg` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 60, background: "#111113", border: "2px solid #2E2E32", boxShadow: "0 60px 140px rgba(0,0,0,0.7), inset 0 0 0 8px #18181B" }}>
            <div style={{ position: "absolute", top: 22, left: 140, width: 100, height: 30, borderRadius: 999, background: "#000" }} />
            <div style={{ position: "absolute", top: 90, left: 28, right: 28, fontFamily: MONO, fontSize: 16, color: K.muted, letterSpacing: 2 }}>STUDIO IVY · AGENT</div>
            {/* amber card */}
            <div style={{ position: "absolute", top: 150 + (1 - card) * -120, left: 22, right: 22, opacity: card, scale: String(0.9 + 0.1 * card) }}>
              <div style={{ borderRadius: 26, padding: "24px 24px", background: "linear-gradient(160deg, rgba(245,194,91,0.16), rgba(255,255,255,0.04))", border: `1.5px solid ${approved ? K.green : K.ask}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FIG, fontWeight: 800, fontSize: 28, color: K.text }}>
                  <Shape d="ask" size={20} />
                  Needs your yes
                </div>
                <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 21, lineHeight: 1.6, color: K.text }}>
                  Papercraft Pro · $49/month · recurring
                </div>
                <div style={{ marginTop: 22, display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, height: 58, borderRadius: 16, background: K.green, color: K.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FIG, fontWeight: 800, fontSize: 24, scale: f >= tap && f < tap + 4 ? "0.93" : "1" }}>Approve</div>
                  <div style={{ flex: 1, height: 58, borderRadius: 16, border: "1.5px solid #3A3A3A", color: K.muted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FIG, fontWeight: 700, fontSize: 24 }}>Decline</div>
                </div>
              </div>
              <div style={{ marginTop: 22, display: "flex", justifyContent: "center", perspective: 600 }}>
                <div style={{ rotate: `x ${flip < 0.5 ? flip * 180 : (1 - flip) * 180}deg` }}>
                  {flip < 0.5 ? <Pill d="ask" label="Waiting for you" size={20} /> : <Pill d="allow" label="Approved by you" size={20} />}
                </div>
              </div>
            </div>
          </div>
          {/* thumb */}
          <div style={{ position: "absolute", left: 60, top: 470 + (1 - thumbIn) * 400, width: 130, height: 170, borderRadius: "65px 65px 50px 50px", background: "linear-gradient(180deg, #E9C9AE, #C99A7A)", opacity: thumbIn * (f < tap + 18 ? 1 : fadeOut(f, tap + 18, 8)), boxShadow: "0 20px 40px rgba(0,0,0,0.5)", scale: f >= tap && f < tap + 4 ? "0.95" : "1" }} />
          {f >= tap && f < tap + 16 ? (
            <div style={{ position: "absolute", left: 125 - (f - tap) * 4, top: 400 - (f - tap) * 4, width: (f - tap) * 8, height: (f - tap) * 8, borderRadius: "50%", border: `2px solid ${K.green}`, opacity: 1 - (f - tap) / 16 }} />
          ) : null}
        </div>
      </Push>
      <Sfx name="whoosh" at={B(0)} volume={0.25} />
      <Sfx name="switch" at={B(1.5)} volume={0.2} />
      <Sfx name="mouse-click" at={tap} volume={0.4} />
      <Sfx name="ding" at={tap + 3} volume={0.22} />
    </AbsoluteFill>
  );
};

/* ===== S10 · HERO: the hold ===== */
const HELD_ROW = 4;
const S10ROWS: Row[] = [...STREAM.slice(0, 4), { time: "09:00:16", what: "Northline Supply", amt: "$96.20", d: "held" }];
const RECEIPT = [
  ["decision", "held"],
  ["rule", "payee_changed"],
  ["passed", "amount, merchant"],
  ["receipt", "0x2b91…4e08"],
];

export const S10: React.FC<S> = ({ B }) => {
  const f = useCurrentFrame();
  const stamp = B(0);
  const dim = interpolate(f, [B(0.4), B(1.4)], [0, 1], { ...clamp, easing: expo });
  const lift = interpolate(f, [B(1.4), B(1.4) + 20], [0, 1], { ...clamp, easing: expo });
  const printFrom = B(3.6);
  const tickAt = B(9);
  const tick = pop(f, tickAt, 14);
  const paint: DotPaint = (i, j, fr) => {
    const d = Math.hypot(i - 14, j - 13);
    if (fr >= stamp && fr < B(1.4) && d < 3) return { c: K.held, a: 0.9, r: 3.5 };
    return { c: "#3A3A3A", a: 0.5 * (1 - dim * 0.7) };
  };
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <DotField paint={paint} />
      {/* stream, then dimmed */}
      <div style={{ position: "absolute", left: 360, right: 360, top: 150, opacity: 1 - lift * 0.9, scale: String(1 - lift * 0.05) }}>
        <Stream rows={S10ROWS} stampAt={(k) => (k === HELD_ROW ? stamp : -100 + k)} dimExcept={HELD_ROW} dim={dim} liftOut={lift} />
      </div>
      {/* the held card, lifted forward */}
      <div style={{ position: "absolute", left: 140, width: 1000, top: interpolate(lift, [0, 1], [235, 150]), opacity: lift, scale: String(0.85 + 0.15 * lift) }}>
        <div style={{ borderRadius: 26, padding: "32px 38px", background: "linear-gradient(160deg, rgba(255,138,107,0.16), rgba(255,255,255,0.03))", border: `2px solid ${K.held}`, boxShadow: `0 0 80px rgba(255,138,107,0.25), 0 50px 120px rgba(0,0,0,0.7)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: K.held }}>
            <Shape d="held" size={24} />
            PAYMENT HELD
          </div>
          <div style={{ marginTop: 16, fontFamily: FIG, fontWeight: 800, fontSize: 54, color: K.text, letterSpacing: -1 }}>
            Northline Supply · <span style={{ fontFamily: MONO, fontWeight: 500 }}>$96.20</span>
          </div>
          <div style={{ marginTop: 14, fontFamily: FIG, fontWeight: 500, fontSize: 30, lineHeight: 1.45, color: "#D4D4D8" }}>
            Bank details changed 14 hours ago. <span style={{ color: K.text, fontWeight: 700 }}>Your rule: hold until you check.</span>
          </div>
        </div>
      </div>
      {/* receipt printing beneath */}
      <div style={{ position: "absolute", left: 240, width: 800, top: 540, height: 470, overflow: "hidden" }}>
        <div style={{ translate: `0px ${interpolate(f, [printFrom, printFrom + 40], [-470, 0], { ...clamp, easing: expo })}px`, background: "#F4F4F2", borderRadius: "0 0 16px 16px", padding: "30px 40px 26px", fontFamily: MONO, fontSize: 28, lineHeight: 1.85, color: "#1A1A1A", boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 18, letterSpacing: 4, color: "#777" }}>SIGNED RECEIPT</div>
          <div style={{ borderTop: "2px dashed #CFCFCB", margin: "10px 0" }} />
          {RECEIPT.map(([k, v], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", opacity: ein(f, printFrom + 26 + i * 12, 12) }}>
              <span style={{ color: "#777" }}>{k}</span>
              <span style={{ color: k === "decision" ? "#C2452B" : "#1A1A1A" }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: "2px dashed #CFCFCB", margin: "10px 0" }} />
          <div style={{ height: 50, display: "flex", alignItems: "center", gap: 14, opacity: tick, scale: String(tick), transformOrigin: "left center" }}>
            <span style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A6B47", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✓</span>
            <span style={{ color: "#0A6B47" }}>signature valid · checked offline</span>
          </div>
        </div>
      </div>
      {/* type */}
      <div style={{ position: "absolute", left: 1220, right: 100, top: 300 }}>
        <Words size={210} words={[{ t: "Held.", at: B(9.6) }]} />
        <div style={{ height: 30 }} />
        <Words
          size={76}
          weight={700}
          words={[
            { t: "Before", at: B(10.4), color: K.held },
            { t: "a", at: B(10.7), color: K.held },
            { t: "cent", at: B(11), color: K.held },
            { t: "moved.", at: B(11.3), color: K.held },
          ]}
        />
      </div>
      <Sfx name="impact" at={stamp} volume={0.55} />
      <Sfx name="shutter-modern" at={printFrom} volume={0.25} />
      {RECEIPT.map((_, i) => (
        <Sfx key={i} name="tick" at={printFrom + 26 + i * 12} volume={0.18} />
      ))}
      <Sfx name="ding" at={tickAt} volume={0.35} />
    </AbsoluteFill>
  );
};

/* ===== S11 · Stack coda ===== */
export const STACK: { n: string; row: number; col: number; span: number }[] = [
  { n: "Embedded Wallets", row: 0, col: 0, span: 1 },
  { n: "Bundler", row: 0, col: 1, span: 1 },
  { n: "Paymaster", row: 0, col: 2, span: 1 },
  { n: "Relayer", row: 0, col: 3, span: 1 },
  { n: "Agent Interface", row: 1, col: 0, span: 1 },
  { n: "Identity", row: 1, col: 1, span: 1 },
  { n: "Discovery", row: 1, col: 2, span: 1 },
  { n: "Payments", row: 1, col: 3, span: 1 },
  { n: "Know Your Intent", row: 2, col: 0, span: 4 },
];
export const blockRect = (b: { row: number; col: number; span: number }) => {
  const w = 400;
  const gap = 20;
  const x0 = (1920 - (4 * w + 3 * gap)) / 2;
  const heights = [96, 96, 130];
  const ys = [850, 734, 584];
  return { x: x0 + b.col * (w + gap), y: ys[b.row], w: b.span * w + (b.span - 1) * gap, h: heights[b.row] };
};

export const S11: React.FC<S> = ({ B }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <DotField paint={idle} opacity={0.5} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
        <Words
          size={88}
          words={[
            { t: "One", at: B(9.5) },
            { t: "stack", at: B(9.8) },
            { t: "for", at: B(10.1) },
            { t: "the", at: B(10.4) },
            { t: "agent", at: B(10.7), color: K.green },
            { t: "economy.", at: B(11), color: K.green },
          ]}
        />
      </div>
      {STACK.map((b, k) => {
        const at = B(k === 8 ? 8 : k);
        const isK = k === 8;
        const shrink = interpolate(f, [at + 4, at + 13], [0, 1], { ...clamp, easing: expo });
        const r = blockRect(b);
        if (f < at) return null;
        const bigSize = isK ? 200 : 170;
        const smallSize = isK ? 52 : 30;
        const cx = interpolate(shrink, [0, 1], [960, r.x + r.w / 2]);
        const cy = interpolate(shrink, [0, 1], [540, r.y + r.h / 2]);
        const fill = isK ? interpolate(f, [at + 10, at + 18], [0, 1], clamp) : 0;
        return (
          <React.Fragment key={b.n}>
            <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 18, border: `1.5px solid ${isK ? K.green : K.divider}`, background: isK ? `rgba(114,227,173,${fill})` : "rgba(255,255,255,0.04)", opacity: shrink, boxShadow: isK ? `0 0 ${60 * fill}px rgba(114,227,173,0.4)` : "none" }} />
            <div style={{ position: "absolute", left: cx, top: cy, translate: "-50% -50%", whiteSpace: "nowrap", fontFamily: FIG, fontWeight: 800, fontSize: interpolate(shrink, [0, 1], [bigSize, smallSize]), letterSpacing: -2, color: isK && fill > 0.5 ? K.ink : isK ? K.green : K.text }}>
              {b.n}
            </div>
          </React.Fragment>
        );
      })}
      {STACK.map((_, k) => (
        <Sfx key={k} name="whip" at={B(k)} volume={k === 8 ? 0.3 : 0.14} />
      ))}
    </AbsoluteFill>
  );
};

/* ===== S12 · End card ===== */
export const S12: React.FC<S> = ({ B }) => {
  const f = useCurrentFrame();
  const collapse = interpolate(f, [B(0), B(1.2)], [0, 1], { ...clamp, easing: expo });
  const logo = ein(f, B(1.2), 14);
  const calm = interpolate(f, [B(1), B(3)], [1, 0], clamp);
  const paint: DotPaint = (i, j, fr) => {
    const d = dist(i, j);
    const glow = calm * Math.max(0, Math.sin(d * 0.6 - fr * 0.3));
    return glow > 0.2 ? { c: K.green, a: 0.3 + glow * 0.5 } : { c: "#3A3A3A", a: 0.45 };
  };
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <DotField paint={paint} />
      {collapse < 1
        ? STACK.map((b) => {
            const r = blockRect(b);
            const x = interpolate(collapse, [0, 1], [r.x, 960 - 10]);
            const y = interpolate(collapse, [0, 1], [r.y, 400 - 10]);
            const w = interpolate(collapse, [0, 1], [r.w, 20]);
            const h = interpolate(collapse, [0, 1], [r.h, 20]);
            const isK = b.row === 2;
            return <div key={b.n} style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, border: `1.5px solid ${isK ? K.green : K.divider}`, background: isK ? K.green : "rgba(255,255,255,0.04)", opacity: 1 - collapse * 0.6 }} />;
          })
        : null}
      <Burst at={B(1.1)} x={960} y={400} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", opacity: logo, scale: String(0.94 + 0.06 * logo) }}>
        <Logo width={760} dark />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Words size={72} words={[{ t: "Your", at: B(2.5) }, { t: "agent", at: B(2.8) }, { t: "spends.", at: B(3.1) }]} />
        <Words
          size={72}
          words={[
            { t: "You", at: B(3.6), color: K.green },
            { t: "keep", at: B(3.85), color: K.green },
            { t: "the", at: B(4.1), color: K.green },
            { t: "last", at: B(4.35), color: K.green },
            { t: "word.", at: B(4.6), color: K.green },
          ]}
        />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, opacity: ein(f, B(5), 12) }}>
        <div style={{ padding: "18px 40px", borderRadius: 999, background: K.green, color: K.ink, fontFamily: FIG, fontWeight: 800, fontSize: 32 }}>Build your agent</div>
        <div style={{ fontFamily: MONO, fontSize: 30, color: K.text }}>abstraxn.com</div>
      </div>
      <Sfx name="impact" at={B(1.1)} volume={0.35} />
    </AbsoluteFill>
  );
};
