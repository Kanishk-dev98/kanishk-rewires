import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Logo } from "../film/kit";
import { Burst, clamp, DotField, DotPaint, dist, ein, expo, FIG, MONO, pop, Push, Sfx, typed, Words } from "../film58/kit58";
import { A, Apolio, Card, Check, Chapter, Ico, ICON, Phone, Scenery } from "../apolio/kitA";
import { DPill } from "../apolio/scenesA";

export type SL = { B: (b: number) => number; dur: number };

const Diamond = () => <span style={{ display: "inline-block", width: 16, height: 16, background: "currentColor", rotate: "45deg" }} />;
const Dot = () => <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: "50%", background: "currentColor" }} />;

/* ===== L1 · Open: logo, then "See what's new" (0:00–0:08) ===== */
export const L1: React.FC<SL> = ({ B }) => {
  const f = useCurrentFrame();
  const logoAt = B(2);
  const cut = B(8);
  const logo = ein(f, logoAt, 16);
  const paint: DotPaint = (i, j, fr) => {
    const d = dist(i, j);
    const a = interpolate(fr, [d * 0.7, d * 0.7 + 10], [0, 0.5], clamp);
    const ring = fr > logoAt ? Math.max(0, 1 - Math.abs(d - (fr - logoAt) * 0.7) / 2.2) : 0;
    return ring > 0 ? { c: A.green, a: 0.4 + ring * 0.6, r: 2.4 + ring * 2 } : { c: "#3A3A3A", a };
  };
  if (f < cut) {
    return (
      <AbsoluteFill style={{ background: A.dark }}>
        <DotField paint={paint} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ opacity: logo, scale: String(0.94 + 0.06 * logo) }}>
            <Logo width={760} dark />
          </div>
        </AbsoluteFill>
        <Burst at={logoAt} x={960} y={540} />
        <Sfx name="impact" at={logoAt} volume={0.3} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Scenery />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, fontFamily: FIG }}>
          <Words size={110} color={A.ink} weight={700} words={[{ t: "See", at: cut + 2 }, { t: "what’s", at: cut + 6 }]} />
          <div style={{ marginTop: -6 }}>
            <Words size={64} weight={800} words={[{ t: "new", at: cut + 12, color: A.text }]} />
          </div>
        </div>
      </AbsoluteFill>
      <Sfx name="whoosh" at={cut} volume={0.3} />
    </AbsoluteFill>
  );
};

/* ===== L2 · Word roll: Your agent can now… (0:08–0:15) ===== */
const VERBS = [
  { w: "pay", card: { t: "Northline Supply", v: "$42.10", d: "allow" as const, l: "paid" } },
  { w: "book", card: { t: "Flight LHR → JFK", v: "$380.00", d: "allow" as const, l: "booked" } },
  { w: "subscribe", card: { t: "Market data Pro", v: "$29 / month", d: "ask" as const, l: "asks first" } },
  { w: "hire", card: { t: "Freight quotes agent", v: "0.03 USDC / call", d: "allow" as const, l: "hired" } },
];
export const L2: React.FC<SL> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const at = (k: number) => B(2 + k * 2.6);
  const active = VERBS.reduce((a, _, k) => (f >= at(k) ? k : a), -1);
  const resolved = f >= B(12.6);
  return (
    <AbsoluteFill>
      <Scenery drift={0.7} />
      <Push dur={dur} amount={0.02}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FIG, fontWeight: 700, fontSize: 96, color: A.ink, letterSpacing: -3 }}>
          <span style={{ opacity: ein(f, B(0.5), 10) }}>Your agent can now…&nbsp;</span>
          {!resolved ? (
            <span style={{ position: "relative", display: "inline-block", height: 116, minWidth: 470, overflow: "hidden" }}>
              {VERBS.map((v, k) => {
                const y = interpolate(f, [at(k) - 6, at(k)], [116, 0], { ...clamp, easing: expo }) + (k + 1 < VERBS.length ? interpolate(f, [at(k + 1) - 6, at(k + 1)], [0, -116], { ...clamp, easing: expo }) : 0);
                return (
                  <span key={v.w} style={{ position: "absolute", left: 0, top: 0, translate: `0px ${y}px`, color: A.text, whiteSpace: "nowrap" }}>
                    {v.w}
                  </span>
                );
              })}
            </span>
          ) : null}
        </div>
        {resolved ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", gap: 30, fontFamily: FIG, fontWeight: 800, fontSize: 64, color: A.text }}>
            {VERBS.map((v, k) => (
              <span key={v.w} style={{ opacity: ein(f, B(12.6) + k * 2, 8) }}>
                {v.w}
                {k < 3 ? <span style={{ color: A.muted, fontWeight: 400 }}>&nbsp;·</span> : null}
              </span>
            ))}
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 150, right: 150, top: 560, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 30 }}>
          {VERBS.map((v, k) => {
            const t = pop(f, at(k) + 2, 14);
            const lit = active === k && !resolved;
            return (
              <div key={v.w} style={{ opacity: f >= at(k) + 2 ? 1 : 0, scale: String(0.85 + 0.15 * t), translate: `0px ${(1 - t) * 60 + Math.sin(f / 22 + k) * 5}px` }}>
                <Card style={{ padding: "26px 28px", border: `1.5px solid ${lit ? A.green2 : A.border}` }}>
                  <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: A.muted }}>{v.w.toUpperCase()}</div>
                  <div style={{ marginTop: 14, fontFamily: FIG, fontWeight: 700, fontSize: 30, color: A.ink }}>{v.card.t}</div>
                  <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 24, color: A.ink }}>{v.card.v}</div>
                  <div style={{ marginTop: 18 }}>
                    <DPill d={v.card.d} label={v.card.l} size={18} />
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </Push>
      {VERBS.map((_, k) => (
        <Sfx key={k} name="tick" at={at(k)} volume={0.2} />
      ))}
    </AbsoluteFill>
  );
};

/* ===== L3 · ◆ Set the rules (0:15–0:30) ===== */
const SENTENCE = "Restock studio supplies every Monday. Up to $200 an order, only from Northline or Papercraft. Ask me before anything recurring, and check with me if bank details change.";
const CLAUSES = ["Up to $200 an order", "only from Northline or Papercraft", "Ask me before anything recurring", "check with me if bank details change"];
const RULES: { d: "allow" | "ask" | "deny"; t: string; k: string }[] = [
  { d: "allow", t: "≤ $200 per order", k: "AMOUNT" },
  { d: "allow", t: "Northline, Papercraft", k: "MERCHANTS" },
  { d: "ask", t: "Recurring: ask first", k: "SCHEDULE" },
  { d: "deny", t: "New payee details: hold", k: "PAYEE" },
];
export const L3: React.FC<SL> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const shown = typed(SENTENCE, f, B(2), 46);
  const done = shown.length >= SENTENCE.length;
  const lift = (k: number) => B(10.5 + k * 1.6);
  const tap = B(19.5);
  const seal = B(20);
  const body = () => {
    if (!done) return shown;
    const out: React.ReactNode[] = [];
    let rest = SENTENCE;
    CLAUSES.forEach((c, k) => {
      const i = rest.indexOf(c);
      out.push(rest.slice(0, i));
      const gone = f >= lift(k);
      out.push(
        <span key={k} style={{ color: gone ? "#B5B5B5" : A.text, background: gone ? "transparent" : A.wash, borderRadius: 6 }}>
          {c}
        </span>,
      );
      rest = rest.slice(i + c.length);
    });
    out.push(rest);
    return out;
  };
  return (
    <AbsoluteFill>
      <Scenery drift={0.5} />
      <div style={{ position: "absolute", left: 160, top: 90 }}>
        <Chapter icon={<Diamond />} label="Set the rules" at={B(0)} />
      </div>
      <Push dur={dur} amount={0.025}>
        <div style={{ position: "absolute", left: 220, right: 220, top: 180 }}>
          <Card style={{ padding: "26px 36px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: A.muted }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: A.green2 }} />
              AGENT INTERFACE · new instruction
            </div>
            <div style={{ marginTop: 18, padding: "22px 26px", borderRadius: 20, background: A.soft, fontFamily: FIG, fontWeight: 500, fontSize: 34, lineHeight: 1.45, color: A.ink, minHeight: 150 }}>
              {body()}
              {!done ? <span style={{ display: "inline-block", width: 3, height: 32, background: A.green2, marginLeft: 3, verticalAlign: "-4px" }} /> : null}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 20, marginTop: 18 }}>
              {f >= seal ? <Check at={seal + 6} size={26}>Rules sealed.</Check> : null}
              <div style={{ padding: "14px 30px", borderRadius: 999, background: f >= tap ? A.green2 : A.ink, color: A.white, fontFamily: FIG, fontWeight: 700, fontSize: 26, opacity: ein(f, B(17.5), 10), scale: f >= tap && f < tap + 4 ? "0.94" : "1" }}>Confirm &amp; seal</div>
            </div>
          </Card>
        </div>
        <div style={{ position: "absolute", left: 160, right: 160, top: 690, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {RULES.map((r, k) => {
            const t = ein(f, lift(k), 18);
            const sealed = f >= seal + k * 3;
            const sweep = interpolate(f, [seal + k * 3, seal + k * 3 + 12], [0, 1], clamp);
            return (
              <div key={k} style={{ position: "relative", overflow: "hidden", height: 140, borderRadius: 22, padding: "20px 24px", background: sealed ? A.wash : A.white, border: `1.5px solid ${sealed ? A.green2 : A.border}`, boxShadow: "0 24px 60px rgba(10,107,71,0.12)", opacity: f >= lift(k) ? 1 : 0, translate: `${(1 - t) * (k < 2 ? -380 : 380)}px ${(1 - t) * -330}px`, scale: String(0.85 + 0.15 * t) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <DPill d={r.d} label={r.k} size={15} />
                  {sealed ? <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 16, color: A.text }}>✓ sealed</span> : null}
                </div>
                <div style={{ marginTop: 16, fontFamily: FIG, fontWeight: 700, fontSize: 30, color: A.ink }}>{r.t}</div>
                <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sweep * 130 - 30}%`, width: "30%", background: `linear-gradient(90deg, transparent, ${A.mint}, transparent)`, opacity: sweep > 0 && sweep < 1 ? 1 : 0 }} />
              </div>
            );
          })}
        </div>
      </Push>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center" }}>
        <Words size={64} color={A.ink} words={["Set", "the", "rules", "once,", "in", "plain", "words."].map((t, k) => ({ t, at: B(22) + k * 3, color: k >= 5 ? A.text : undefined }))} />
      </div>
      <svg width="54" height="54" viewBox="0 0 24 24" style={{ position: "absolute", left: interpolate(f, [B(18.6), tap - 2], [1300, 1600], { ...clamp, easing: expo }), top: interpolate(f, [B(18.6), tap - 2], [1000, 545], { ...clamp, easing: expo }), opacity: f >= B(18.6) && f < seal + 20 ? 1 : 0 }}>
        <path d="M4 2l15 8.5-6.6 1.9L9.6 19z" fill={A.white} stroke={A.ink} strokeWidth="1.2" />
      </svg>
      {Array.from({ length: 16 }).map((_, k) => (
        <Sfx key={k} name="mouse-click" at={B(2) + k * 7} volume={0.05} />
      ))}
      {RULES.map((_, k) => (
        <Sfx key={`w${k}`} name="whip" at={lift(k)} volume={0.12} />
      ))}
      <Sfx name="mouse-click" at={tap} volume={0.4} />
      <Sfx name="ding" at={seal} volume={0.22} />
    </AbsoluteFill>
  );
};

/* ===== L4 · ● Every payment, checked (0:30–0:45) ===== */
type Row = { t: string; who: string; amt: string; d: "allow" | "ask" | "deny"; note?: string };
const ROWS: Row[] = [
  { t: "09:00:02", who: "Northline Supply", amt: "$42.10", d: "allow" },
  { t: "09:00:05", who: "Weather API", amt: "0.01 USDC", d: "allow" },
  { t: "09:00:07", who: "Papercraft", amt: "$18.60", d: "allow" },
  { t: "09:00:09", who: "Freight quotes", amt: "0.03 USDC", d: "allow" },
  { t: "09:00:12", who: "Papercraft Pro", amt: "$49 / month", d: "ask", note: "recurring" },
  { t: "09:00:14", who: "Web search", amt: "0.01 USDC", d: "allow" },
  { t: "09:00:16", who: "Northline Supply", amt: "$96.20", d: "deny", note: "payee changed" },
  { t: "09:00:19", who: "FX rates", amt: "0.02 USDC", d: "allow" },
];
const LEGEND = [
  { d: "allow" as const, title: "Allow", sub: "Inside your rules. Paid.", first: 0 },
  { d: "ask" as const, title: "Ask", sub: "You said ask first.", first: 4 },
  { d: "deny" as const, title: "Hold", sub: "Something changed. Held.", first: 6 },
];
export const L4: React.FC<SL> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const rowAt = (k: number) => B(2 + k * 1.6);
  const visible = ROWS.map((r, k) => ({ r, k })).filter(({ k }) => f >= rowAt(k) - 6);
  return (
    <AbsoluteFill>
      <Scenery drift={0.4} />
      <div style={{ position: "absolute", left: 160, top: 90 }}>
        <Chapter icon={<Dot />} label="Every payment, checked" at={B(0)} />
      </div>
      <Push dur={dur} amount={0.025}>
        <div style={{ position: "absolute", left: 160, top: 180, width: 1040 }}>
          <Card style={{ padding: "24px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: A.muted, marginBottom: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: A.green2 }} />
              KYI · DECISION STREAM · LIVE
            </div>
            <div style={{ position: "relative", height: 560, overflow: "hidden" }}>
              {visible
                .slice()
                .reverse()
                .map(({ r, k }, pos) => {
                  const at = rowAt(k);
                  const enter = ein(f, at - 6, 8);
                  const s = interpolate(f - at, [0, 4, 8], [1.6, 0.95, 1], clamp);
                  return (
                    <div key={k} style={{ position: "absolute", left: 0, right: 0, top: pos * 70, height: 64, display: "grid", gridTemplateColumns: "130px 1fr 190px 220px", alignItems: "center", fontFamily: MONO, fontSize: 23, color: A.ink, borderBottom: `1px solid ${A.border}`, opacity: enter, translate: `0px ${(1 - enter) * -30}px`, background: r.d === "deny" && f >= at ? A.denyWash : r.d === "ask" && f >= at ? A.soft : "transparent" }}>
                      <span style={{ color: A.muted }}>{r.t}</span>
                      <span style={{ fontFamily: FIG, fontWeight: 600, fontSize: 27 }}>{r.who}</span>
                      <span style={{ textAlign: "right" }}>{r.amt}</span>
                      <span style={{ textAlign: "right" }}>{f >= at ? <span style={{ display: "inline-block", scale: String(s) }}><DPill d={r.d} label={r.d === "allow" ? "ALLOW" : r.d === "ask" ? "ASK" : "HOLD"} size={18} /></span> : null}</span>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
        <div style={{ position: "absolute", left: 1260, right: 140, top: 180, display: "flex", flexDirection: "column", gap: 22 }}>
          {LEGEND.map((g) => {
            const at = rowAt(g.first);
            const t = pop(f, at + 4, 14);
            return (
              <div key={g.title} style={{ opacity: f >= at + 4 ? 1 : 0, scale: String(0.9 + 0.1 * t) }}>
                <Card style={{ padding: "24px 28px" }}>
                  <DPill d={g.d} label={g.title.toUpperCase()} size={20} />
                  <div style={{ marginTop: 14, fontFamily: FIG, fontWeight: 700, fontSize: 34, color: A.ink }}>{g.sub}</div>
                </Card>
              </div>
            );
          })}
          <div style={{ opacity: ein(f, B(16), 10), display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontFamily: FIG, fontWeight: 800, fontSize: 84, color: A.text, letterSpacing: -3 }}>&lt; 50 ms</span>
            <span style={{ fontFamily: FIG, fontSize: 26, color: A.muted }}>per check</span>
          </div>
        </div>
      </Push>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center" }}>
        <Words size={62} color={A.ink} words={["Every", "payment,", "checked", "before", "money", "moves."].map((t, k) => ({ t, at: B(19) + k * 3, color: k >= 3 ? A.text : undefined }))} />
      </div>
      {ROWS.map((_, k) => (
        <Sfx key={k} name="tick" at={rowAt(k)} volume={0.2} />
      ))}
    </AbsoluteFill>
  );
};

/* ===== L5 · Wallets that just work (0:45–0:55) ===== */
const SEED = "orbit maple frost lantern quarry velvet hinge cobalt drift amber pixel tundra".split(" ");
export const L5: React.FC<SL> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const corner = ein(f, B(2), 14);
  const scan = interpolate(f, [B(3), B(5)], [0, 1], { ...clamp, easing: expo });
  const ready = ein(f, B(5.5), 12);
  const gag = f >= B(6.5) && f < B(6.5) + 8;
  return (
    <AbsoluteFill>
      <Scenery drift={0.5} />
      <div style={{ position: "absolute", left: 160, top: 120 }}>
        <Chapter icon={<Ico d={ICON.wallet} size={24} />} label="Wallets that just work" at={B(0)} />
      </div>
      <div style={{ position: "absolute", left: 160, top: 320, width: 880 }}>
        <Words size={96} color={A.ink} words={[{ t: "One", at: B(1) }, { t: "tap.", at: B(1.5), color: A.text }]} />
        <div style={{ height: 8 }} />
        <Words size={96} color={A.ink} words={[{ t: "No", at: B(6.5) }, { t: "seed", at: B(7) }, { t: "phrase.", at: B(7.5), color: A.text }]} />
        <div style={{ marginTop: 44, display: "flex", gap: 18 }}>
          <Check at={B(10)} size={30}>Passkeys</Check>
          <Check at={B(11)} size={30}>Gas covered</Check>
          <Check at={B(12)} size={30}>Social recovery</Check>
        </div>
      </div>
      <Push dur={dur} amount={0.03}>
        <Phone style={{ left: 1240, top: 110 }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${A.white}, ${A.wash})` }}>
            <div style={{ position: "absolute", left: 30, right: 30, top: 80, display: "flex", alignItems: "center", gap: 12 }}>
              <Ico d={ICON.wallet} size={30} color={A.text} />
              <span style={{ fontFamily: FIG, fontWeight: 800, fontSize: 30, color: A.ink }}>Agent wallet</span>
              <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 16, color: ready > 0.5 ? A.text : A.muted }}>{ready > 0.5 ? "● Face ID ✓" : "Face ID"}</span>
            </div>
            {gag ? (
              <div style={{ position: "absolute", left: 24, right: 24, top: 160, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, filter: "blur(2px)" }}>
                {SEED.map((w, k) => (
                  <div key={k} style={{ position: "relative", fontFamily: MONO, fontSize: 18, color: A.muted, textAlign: "center", padding: "8px 0", border: `1px solid ${A.border}`, borderRadius: 8 }}>
                    {w}
                    <div style={{ position: "absolute", left: 4, right: 4, top: "50%", height: 3, background: A.deny }} />
                  </div>
                ))}
              </div>
            ) : null}
            <svg width={300} height={300} style={{ position: "absolute", left: 50, top: 200, opacity: 1 - ready }}>
              {[
                [10, 10, 1, 1],
                [290, 10, -1, 1],
                [10, 290, 1, -1],
                [290, 290, -1, -1],
              ].map(([x, y, dx, dy], k) => (
                <path key={k} d={`M ${x} ${y + dy * 60} L ${x} ${y} L ${x + dx * 60} ${y}`} fill="none" stroke={A.green2} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - corner} />
              ))}
              <rect x={24} y={10 + scan * 280} width={252} height={4} rx={2} fill={A.green2} opacity={scan > 0 && scan < 1 ? 1 : 0} />
              <g stroke="#C9C9C6" strokeWidth={5} fill="none" strokeLinecap="round">
                <path d="M 110 130 v 18 M 190 130 v 18 M 150 130 v 40 h -12 M 115 200 q 35 26 70 0" />
              </g>
            </svg>
            <div style={{ position: "absolute", left: 24, right: 24, top: 300, opacity: ready, scale: String(0.85 + 0.15 * pop(f, B(5.5), 14)) }}>
              <div style={{ borderRadius: 24, border: `2px solid ${A.green2}`, background: A.white, padding: "24px 24px", boxShadow: "0 20px 40px rgba(10,107,71,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FIG, fontWeight: 800, fontSize: 32, color: A.text }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: A.green2 }} />
                  Wallet ready
                </div>
                <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 21, color: A.ink }}>0x8f3a…21c4</div>
                <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 18, color: A.muted }}>No seed phrase</div>
              </div>
            </div>
          </div>
        </Phone>
      </Push>
      <Sfx name="switch" at={B(3)} volume={0.2} />
      <Sfx name="ding" at={B(5.5)} volume={0.22} />
    </AbsoluteFill>
  );
};

/* ===== L6 · Pay per call (0:55–1:05) ===== */
const TILES = [
  { n: "Weather", p: "0.01" },
  { n: "FX rates", p: "0.02" },
  { n: "Freight quotes", p: "0.03" },
  { n: "Market data", p: "0.02" },
  { n: "Web search", p: "0.01" },
  { n: "Translation", p: "0.02" },
];
const SORTED = [2, 3, 1, 0, 4, 5];
export const L6: React.FC<SL> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const resort = interpolate(f, [B(7), B(7) + 24], [0, 1], { ...clamp, easing: expo });
  const lifted = ein(f, B(8.5), 12);
  const chip = pop(f, B(10), 12);
  const tw = 380;
  const th = 160;
  const gx = (1920 - (tw * 3 + 60)) / 2;
  const pos = (s: number) => ({ x: gx + (s % 3) * (tw + 30), y: 330 + Math.floor(s / 3) * (th + 30) });
  return (
    <AbsoluteFill>
      <Scenery drift={0.5} />
      <div style={{ position: "absolute", left: 160, top: 90 }}>
        <Chapter icon={<span style={{ fontFamily: MONO, fontSize: 20 }}>¢</span>} label="Pay per call" at={B(0)} />
      </div>
      <Push dur={dur} amount={0.025}>
        <div style={{ position: "absolute", left: gx, width: tw * 3 + 60, top: 200, opacity: ein(f, B(3.5), 10) }}>
          <Card style={{ height: 80, borderRadius: 999, display: "flex", alignItems: "center", gap: 16, padding: "0 30px" }}>
            <Ico d="M10 3 a7 7 0 1 0 0.1 0 M15 15 L21 21" size={28} color={A.muted} />
            <span style={{ fontFamily: FIG, fontWeight: 500, fontSize: 32, color: A.ink }}>{typed("freight quote, 40 kg to Rotterdam", f, B(4), 28)}</span>
          </Card>
        </div>
        {TILES.map((t, k) => {
          const a = pos(k);
          const b = pos(SORTED.indexOf(k));
          const isF = k === 2;
          const enter = pop(f, B(1) + k * 7, 14);
          return (
            <div key={t.n} style={{ position: "absolute", left: interpolate(resort, [0, 1], [a.x, b.x]), top: interpolate(resort, [0, 1], [a.y, b.y]), width: tw, height: th, opacity: enter * (lifted > 0 && !isF ? 1 - 0.5 * lifted : 1), scale: String(enter * (isF ? 1 + 0.07 * lifted : 1)), translate: `0px ${isF ? -12 * lifted : 0}px`, zIndex: isF ? 2 : 1 }}>
              <Card style={{ height: "100%", borderRadius: 24, padding: "24px 26px", display: "flex", flexDirection: "column", justifyContent: "space-between", border: `1.5px solid ${isF && lifted > 0 ? A.green2 : A.border}`, boxShadow: isF && lifted > 0 ? `0 30px 70px rgba(10,107,71,${0.3 * lifted})` : undefined }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: A.wash, display: "flex", alignItems: "center", justifyContent: "center", color: A.text, fontFamily: MONO, fontSize: 20 }}>{t.n.slice(0, 2).toUpperCase()}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: FIG, fontWeight: 700, fontSize: 30, color: A.ink }}>{t.n}</span>
                  <span style={{ fontFamily: MONO, fontSize: 20, color: A.muted }}>{t.p} USDC</span>
                </div>
              </Card>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: pos(0).x + tw - 80, top: pos(0).y - 34, opacity: chip, scale: String(chip), zIndex: 3 }}>
          <DPill d="allow" label="Paid 0.03 USDC" size={24} />
        </div>
      </Push>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center", gap: 30 }}>
        <Words size={100} color={A.ink} words={[{ t: "Paid", at: B(12) }, { t: "in", at: B(12.5) }, { t: "cents.", at: B(13), color: A.text }, { t: "Per", at: B(14.5) }, { t: "call.", at: B(15), color: A.text }]} />
      </div>
      {TILES.map((_, k) => (
        <Sfx key={k} name="tick" at={B(1) + k * 7} volume={0.12} />
      ))}
      <Sfx name="whip" at={B(7)} volume={0.2} />
      <Sfx name="ding" at={B(10)} volume={0.22} />
    </AbsoluteFill>
  );
};

/* ===== L7 · One More Thing: the hold (1:05–1:15) ===== */
export const L7: React.FC<SL> = ({ B }) => {
  const f = useCurrentFrame();
  const stamp = B(5);
  const lift = interpolate(f, [B(6), B(6) + 20], [0, 1], { ...clamp, easing: expo });
  const printFrom = B(8);
  const tickAt = B(15);
  const tick = pop(f, tickAt, 14);
  const omt = f < B(4.4);
  const paint: DotPaint = (i, j, fr) => {
    const d = Math.hypot(i - 24, j - 9);
    const hit = fr >= stamp && fr < stamp + 30 ? Math.max(0, 1 - Math.abs(d - (fr - stamp) * 0.8) / 2) : 0;
    return hit > 0 ? { c: A.deny, a: 0.5 + hit * 0.5, r: 2.4 + hit * 2 } : { c: "#3A3A3A", a: 0.45 };
  };
  return (
    <AbsoluteFill style={{ background: A.dark }}>
      <DotField paint={paint} />
      {omt ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Words size={120} weight={700} words={[{ t: "One", at: B(0.5) }, { t: "more", at: B(1.2) }, { t: "thing.", at: B(1.9), color: A.green }]} />
        </AbsoluteFill>
      ) : (
        <>
          {/* the row that gets held */}
          <div style={{ position: "absolute", left: 360, right: 360, top: interpolate(lift, [0, 1], [420, 150]), scale: String(interpolate(lift, [0, 1], [1, 1.04])) }}>
            {lift < 0.05 ? (
              <div style={{ height: 80, borderRadius: 18, background: "rgba(255,255,255,0.06)", border: `1px solid ${A.borderDark}`, display: "grid", gridTemplateColumns: "150px 1fr 200px 170px", alignItems: "center", padding: "0 24px", fontFamily: MONO, fontSize: 24, color: A.white, opacity: ein(f, B(4.4), 6) }}>
                <span style={{ color: "#8A8A8A" }}>09:00:16</span>
                <span style={{ fontFamily: FIG, fontWeight: 600, fontSize: 28 }}>Northline Supply</span>
                <span style={{ textAlign: "right" }}>$96.20</span>
                <span style={{ textAlign: "right" }}>{f >= stamp ? <DPill d="deny" label="HELD" size={20} dark /> : <span style={{ color: "#8A8A8A" }}>checking…</span>}</span>
              </div>
            ) : (
              <div style={{ opacity: lift, borderRadius: 26, padding: "32px 38px", background: "linear-gradient(160deg, rgba(226,136,124,0.18), rgba(255,255,255,0.03))", border: `2px solid ${A.deny}`, boxShadow: "0 0 80px rgba(226,136,124,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: A.deny }}>
                  <span style={{ width: 22, height: 22, background: A.deny, borderRadius: 3 }} />
                  PAYMENT HELD
                </div>
                <div style={{ marginTop: 14, fontFamily: FIG, fontWeight: 800, fontSize: 52, color: A.white }}>
                  Northline Supply · <span style={{ fontFamily: MONO, fontWeight: 500 }}>$96.20</span>
                </div>
                <div style={{ marginTop: 10, fontFamily: FIG, fontWeight: 500, fontSize: 30, color: "#D4D4D8" }}>
                  Bank details changed 14 hours ago. <b style={{ color: A.white }}>Your rule: hold until you check.</b>
                </div>
              </div>
            )}
          </div>
          {/* receipt */}
          <div style={{ position: "absolute", left: 360, width: 760, top: 470, height: 520, overflow: "hidden" }}>
            <div style={{ translate: `0px ${interpolate(f, [printFrom, printFrom + 36], [-520, 0], { ...clamp, easing: expo })}px`, background: A.white, borderRadius: "0 0 16px 16px", padding: "28px 38px", fontFamily: MONO, fontSize: 26, lineHeight: 1.85, color: A.ink }}>
              <div style={{ fontSize: 18, letterSpacing: 4, color: A.muted }}>SIGNED RECEIPT</div>
              <div style={{ borderTop: `2px dashed ${A.border}`, margin: "10px 0" }} />
              {[
                ["decision", "held"],
                ["rule", "payee_changed"],
                ["passed", "amount, merchant"],
                ["receipt", "0x2b91…4e08"],
              ].map(([k, v], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", opacity: ein(f, printFrom + 22 + i * 12, 10) }}>
                  <span style={{ color: A.muted }}>{k}</span>
                  <span style={{ color: k === "decision" ? A.denyDeep : A.ink }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: `2px dashed ${A.border}`, margin: "10px 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: tick, scale: String(tick), transformOrigin: "left center" }}>
                <span style={{ width: 38, height: 38, borderRadius: "50%", background: A.green2, color: A.white, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>✓</span>
                <span style={{ color: A.text }}>signature valid · checked offline</span>
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 1180, right: 120, top: 520 }}>
            <Words size={150} words={[{ t: "Held.", at: B(15.6) }]} />
            <div style={{ height: 20 }} />
            <Words size={56} weight={700} words={["Before", "a", "cent", "moved."].map((t, k) => ({ t, at: B(16.6) + k * 4, color: A.deny }))} />
          </div>
        </>
      )}
      <AbsoluteFill style={{ background: A.deny, opacity: interpolate(f, [stamp, stamp + 1, stamp + 8], [0, 0.3, 0], clamp), pointerEvents: "none" }} />
      <Sfx name="impact" at={stamp} volume={0.55} />
      <Sfx name="shutter-modern" at={printFrom} volume={0.22} />
      <Sfx name="ding" at={tickAt} volume={0.35} />
    </AbsoluteFill>
  );
};

/* ===== L8 · Real world: a phone on a café table (1:15–1:22) ===== */
export const L8: React.FC<SL> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const tap = B(6);
  const approved = f >= tap + 3;
  const thumb = ein(f, B(4.5), 12);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${A.white} 0%, ${A.wash} 45%, ${A.soft} 46%, #ECECEA 100%)` }}>
      {/* window light + table edge */}
      <div style={{ position: "absolute", left: 1200, top: -200, width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(circle, ${A.mint}88, transparent 60%)`, filter: "blur(20px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 496, height: 4, background: A.border }} />
      {/* cup */}
      <div style={{ position: "absolute", left: 260, top: 560, width: 220, height: 220, borderRadius: "50%", background: A.white, boxShadow: "0 30px 60px rgba(0,0,0,0.12)", border: `10px solid ${A.soft}` }}>
        <div style={{ position: "absolute", inset: 26, borderRadius: "50%", background: `radial-gradient(circle at 40% 40%, #E4D9CC, #CDBBA6)` }} />
      </div>
      <Push dur={dur} amount={0.03}>
        <div style={{ position: "absolute", left: 760, top: 300, width: 420, height: 860, transform: "perspective(1800px) rotateX(38deg) rotateZ(-12deg)", transformOrigin: "50% 30%" }}>
          <Phone style={{ left: 0, top: 0 }}>
            <div style={{ position: "absolute", inset: 0, background: A.soft, padding: "90px 26px" }}>
              <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: A.muted }}>YOUR AGENT · NEEDS YOUR YES</div>
              <div style={{ marginTop: 18, borderRadius: 24, background: A.white, border: `1.5px solid ${approved ? A.green2 : A.border}`, padding: "22px 22px", opacity: ein(f, B(1), 10) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Apolio size={44} />
                  <span style={{ fontFamily: FIG, fontWeight: 800, fontSize: 26, color: A.ink }}>Your agent asked</span>
                </div>
                <div style={{ marginTop: 12, fontFamily: FIG, fontSize: 22, color: A.ink, lineHeight: 1.4 }}>Papercraft Pro · $49/month · recurring. Go ahead?</div>
                <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, height: 60, borderRadius: 16, background: A.green2, color: A.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FIG, fontWeight: 800, fontSize: 22, scale: f >= tap && f < tap + 4 ? "0.94" : "1" }}>Approve</div>
                  <div style={{ flex: 1, height: 60, borderRadius: 16, border: `1.5px solid ${A.border}`, color: A.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FIG, fontWeight: 700, fontSize: 22 }}>Not now</div>
                </div>
                <div style={{ marginTop: 16 }}>{approved ? <DPill d="allow" label="Approved by you" size={18} /> : <DPill d="ask" label="Waiting for you" size={18} />}</div>
              </div>
            </div>
            <div style={{ position: "absolute", left: 90, top: 420 + (1 - thumb) * 500, width: 120, height: 160, borderRadius: "60px 60px 46px 46px", background: "linear-gradient(180deg, #F1E3D3, #D9BFA5)", opacity: thumb * (f < tap + 16 ? 1 : 0.0), boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }} />
          </Phone>
        </div>
      </Push>
      <div style={{ position: "absolute", left: 1310, right: 80, top: 560 }}>
        <Words size={56} weight={600} color={A.muted} words={["Your", "agent", "asked."].map((t, k) => ({ t, at: B(1.5) + k * 3 }))} />
        <div style={{ height: 6 }} />
        <Words size={86} color={A.ink} words={["You", "said", "yes."].map((t, k) => ({ t, at: tap + 2 + k * 4, color: k === 2 ? A.text : undefined }))} />
      </div>
      <Sfx name="switch" at={B(1)} volume={0.2} />
      <Sfx name="mouse-click" at={tap} volume={0.4} />
      <Sfx name="ding" at={tap + 3} volume={0.22} />
    </AbsoluteFill>
  );
};

/* ===== L9 · Thesis and close (1:22–1:30) ===== */
export const L9: React.FC<SL> = ({ B }) => {
  const f = useCurrentFrame();
  const logoAt = B(9);
  const toDark = f >= logoAt - 2;
  const logo = ein(f, logoAt, 14);
  if (!toDark) {
    return (
      <AbsoluteFill>
        <Scenery drift={0.3} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <Words size={72} color={A.ink} weight={700} words={["Abstraxn", "gives", "your", "agent", "the"].map((t, k) => ({ t, at: B(0.4) + k * 3 }))} />
            <div style={{ marginTop: -4 }}>
              <Words size={44} weight={800} words={[{ t: "power", at: B(3), color: A.text }]} />
            </div>
            <Words size={72} color={A.ink} weight={700} words={[{ t: "to", at: B(3.5) }, { t: "spend.", at: B(4) }]} />
          </div>
          <Words size={110} color={A.ink} words={[{ t: "You", at: B(5.5), color: A.text }, { t: "keep", at: B(6) }, { t: "the", at: B(6.4) }, { t: "last", at: B(6.8) }, { t: "word.", at: B(7.2) }]} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: A.dark }}>
      <DotField paint={(i, j, fr) => {
        const d = dist(i, j);
        const w = fr < logoAt + 40 ? Math.max(0, 1 - Math.abs(d - (fr - logoAt) * 0.8) / 2) : 0;
        return w > 0 ? { c: A.green, a: 0.4 + w * 0.5, r: 2.4 + w * 2 } : { c: "#3A3A3A", a: 0.45 };
      }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 50 }}>
        <div style={{ opacity: logo, scale: String(0.94 + 0.06 * logo) }}>
          <Logo width={820} dark />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 34, color: A.green, opacity: ein(f, B(10.5), 12) }}>abstraxn.com</div>
      </AbsoluteFill>
      <Burst at={logoAt} x={960} y={500} />
      <Sfx name="impact" at={logoAt} volume={0.35} />
    </AbsoluteFill>
  );
};

