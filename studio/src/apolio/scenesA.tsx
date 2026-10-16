import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Burst, clamp, DotField, DotPaint, dist, ein, expo, FIG, MONO, pop, Push, Sfx, typed, Words } from "../film58/kit58";
import { A, Apolio, Bubble, Card, Check, Chapter, Ico, ICON, Phone, Scenery } from "./kitA";

export type SA = { B: (b: number) => number; dur: number };

/** Decision pill in the Abstraxn palette (shape + label). */
export const DPill: React.FC<{ d: "allow" | "ask" | "deny"; label: string; size?: number; dark?: boolean }> = ({ d, label, size = 22, dark }) => {
  const col = d === "allow" ? (dark ? A.green : A.text) : d === "deny" ? (dark ? A.deny : A.denyDeep) : dark ? A.white : A.ink;
  const bg = d === "allow" ? (dark ? "rgba(114,227,173,0.12)" : A.wash) : d === "deny" ? (dark ? "rgba(226,136,124,0.14)" : A.denyWash) : dark ? "rgba(255,255,255,0.08)" : A.soft;
  const shape =
    d === "allow" ? <span style={{ width: size * 0.6, height: size * 0.6, borderRadius: "50%", background: col }} /> : d === "ask" ? <span style={{ width: size * 0.48, height: size * 0.48, background: col, rotate: "45deg", margin: size * 0.06 }} /> : <span style={{ width: size * 0.54, height: size * 0.54, background: col, borderRadius: 2 }} />;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.45, padding: `${size * 0.32}px ${size * 0.7}px`, borderRadius: 999, background: bg, border: `1.5px solid ${col}`, color: col, fontFamily: MONO, fontSize: size, letterSpacing: 1, whiteSpace: "nowrap" }}>
      {shape}
      {label}
    </span>
  );
};

/* ===== S1 · Meet Apolio (0:00–0:05) ===== */
export const S1: React.FC<SA> = ({ B }) => {
  const f = useCurrentFrame();
  const born = B(2.5);
  const paint: DotPaint = (i, j, fr) => {
    const d = dist(i, j);
    const ring = Math.max(0, 1 - Math.abs(d - (fr - born) * 0.6) / 2.5);
    const base = interpolate(fr, [d * 0.6, d * 0.6 + 10], [0, 0.45], clamp);
    return fr > born && ring > 0 ? { c: A.green, a: 0.4 + ring * 0.6, r: 2.4 + ring * 2 } : { c: "#3A3A3A", a: base };
  };
  const av = pop(f, born, 14);
  const walletChip = pop(f, B(7.5), 12);
  return (
    <AbsoluteFill style={{ background: A.dark }}>
      <DotField paint={paint} />
      {/* triangles converge into Apolio */}
      {f < born + 2
        ? new Array(36).fill(0).map((_, i) => {
            const sx = random(`sx${i}`) * 1920;
            const sy = random(`sy${i}`) * 1080;
            const t = interpolate(f, [B(0), born], [0, 1], { ...clamp, easing: expo });
            const x = sx + (960 - sx) * t;
            const y = sy + (360 - sy) * t;
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: `16px solid ${i % 3 ? A.green : A.bright}`, rotate: `${(1 - t) * random(`r${i}`) * 360}deg`, opacity: 0.9 }} />;
          })
        : null}
      <div style={{ position: "absolute", left: 960 - 130, top: 230, opacity: av, scale: String(av) }}>
        <Apolio size={260} />
      </div>
      <Burst at={born} x={960} y={360} />
      <div style={{ position: "absolute", left: 1150, top: 300, opacity: walletChip, scale: String(walletChip) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 22px", borderRadius: 18, background: "rgba(114,227,173,0.12)", border: `1.5px solid ${A.green}`, color: A.green, fontFamily: MONO, fontSize: 22 }}>
          <Ico d={ICON.wallet} size={26} color={A.green} /> wallet · 0x7a4e…91b2
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", justifyContent: "center" }}>
        <Words size={130} words={[{ t: "Meet", at: B(3) }, { t: "Apolio.", at: B(3.5), color: A.green }]} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center" }}>
        <Words
          size={54}
          weight={600}
          color="#D4D4D8"
          words={["A", "personal", "agent", "with", "its", "own", "wallet."].map((t, k) => ({ t, at: B(6) + k * 3, color: k === 6 ? A.green : undefined }))}
        />
      </div>
      <Sfx name="impact" at={born} volume={0.3} />
      <Sfx name="ding" at={B(7.5)} volume={0.15} />
    </AbsoluteFill>
  );
};

/* ===== S2 · Lives where you already work (0:05–0:10) ===== */
const HOSTS = ["chat", "Claude", "ChatGPT", "any MCP tool"];
export const S2: React.FC<SA> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const rollAt = (k: number) => B(3 + k * 1.25);
  const active = HOSTS.reduce((a, _, k) => (f >= rollAt(k) ? k : a), -1);
  const resolved = f >= B(8);
  return (
    <AbsoluteFill>
      <Scenery />
      <Push dur={dur} amount={0.02}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}>
          <Words size={70} color={A.ink} words={["Apolio", "lives", "where", "you", "already", "work."].map((t, k) => ({ t, at: B(0.5) + k * 4, color: k === 5 ? A.text : undefined }))} />
        </div>
        {/* word roll, then the full sentence */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 236, height: 70, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FIG, fontSize: 46, fontWeight: 500, color: A.muted, opacity: ein(f, B(2.5), 10) }}>
          {!resolved ? (
            <>
              <span>Ask it from your&nbsp;</span>
              <span style={{ position: "relative", display: "inline-block", height: 60, overflow: "hidden", minWidth: 360 }}>
                {HOSTS.map((h, k) => {
                  const y = interpolate(f, [rollAt(k) - 6, rollAt(k)], [60, 0], { ...clamp, easing: expo }) + (k < active ? interpolate(f, [rollAt(k + 1) - 6, rollAt(k + 1)], [0, -60], { ...clamp, easing: expo }) : 0);
                  return (
                    <span key={h} style={{ position: "absolute", left: 0, top: 0, translate: `0px ${y}px`, color: A.text, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {h}
                    </span>
                  );
                })}
              </span>
            </>
          ) : (
            <span style={{ opacity: ein(f, B(8), 8) }}>
              Ask it from your chat, in <b style={{ color: A.ink }}>Claude</b>, <b style={{ color: A.ink }}>ChatGPT</b> or <b style={{ color: A.text }}>any MCP tool</b>.
            </span>
          )}
        </div>
        {/* the four places Apolio lives */}
        <div style={{ position: "absolute", left: 140, right: 140, top: 400, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 36 }}>
          {HOSTS.map((h, k) => {
            const t = pop(f, rollAt(k) - 2, 14);
            const lit = active === k || resolved;
            return (
              <div key={h} style={{ opacity: f >= rollAt(k) - 2 ? 1 : 0, scale: String(0.85 + 0.15 * t), translate: `0px ${(1 - t) * 60 + Math.sin(f / 24 + k) * 6}px` }}>
                <Card style={{ height: 270, padding: 24, border: `1.5px solid ${lit ? A.green2 : A.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 18, color: A.muted, letterSpacing: 2 }}>
                    <Ico d={ICON.chat} size={20} color={A.text} />
                    {h.toUpperCase()}
                  </div>
                  <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ alignSelf: "flex-end", padding: "12px 16px", borderRadius: 16, background: A.ink, color: A.white, fontFamily: FIG, fontSize: 21 }}>@Apolio track ETH for me</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", opacity: ein(f, rollAt(k) + 8, 8) }}>
                      <Apolio size={52} />
                      <div style={{ padding: "12px 16px", borderRadius: 16, background: A.wash, border: "1px solid #BDEBD5", fontFamily: FIG, fontSize: 21, color: A.ink }}>On it.</div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </Push>
      {HOSTS.map((_, k) => (
        <Sfx key={k} name="tick" at={rollAt(k)} volume={0.18} />
      ))}
    </AbsoluteFill>
  );
};

/* ===== S3 · One tap, a smart wallet (0:10–0:15) ===== */
export const S3: React.FC<SA> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const tap = B(3);
  const ready = ein(f, tap + 4, 12);
  return (
    <AbsoluteFill>
      <Scenery drift={0.6} />
      <div style={{ position: "absolute", left: 140, top: 150 }}>
        <Chapter icon={<Ico d={ICON.wallet} size={24} />} label="Embedded wallet" at={B(0)} />
      </div>
      <div style={{ position: "absolute", left: 140, top: 300, width: 900 }}>
        <Words size={46} weight={600} color={A.muted} words={[{ t: "One", at: B(0.5) }, { t: "tap,", at: B(0.8), color: A.text }]} />
        <div style={{ height: 10 }} />
        <Words size={84} color={A.ink} words={["and", "Apolio", "has", "a", "smart", "wallet."].map((t, k) => ({ t, at: B(1.2) + k * 3, color: k >= 4 ? A.text : undefined }))} />
        <div style={{ marginTop: 50, display: "flex", gap: 20 }}>
          <Check at={B(5.5)} size={34}>
            No seed phrase.
          </Check>
          <Check at={B(6.5)} size={34}>
            Gas covered.
          </Check>
        </div>
      </div>
      <Push dur={dur} amount={0.03}>
        <Phone style={{ left: 1220, top: 110 }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${A.white}, ${A.wash})`, padding: "90px 34px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Apolio size={150} mood={f > tap ? "happy" : "calm"} />
            <div style={{ marginTop: 24, fontFamily: FIG, fontWeight: 800, fontSize: 34, color: A.ink }}>Apolio</div>
            <div style={{ fontFamily: FIG, fontSize: 20, color: A.muted }}>personal agent</div>
            <div style={{ marginTop: 60, width: "100%", height: 86, borderRadius: 24, background: f >= tap ? A.green2 : A.ink, color: A.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FIG, fontWeight: 700, fontSize: 28, scale: f >= tap && f < tap + 4 ? "0.95" : "1", opacity: ein(f, B(1), 10) * (1 - ready) }}>
              Create wallet
            </div>
            <div style={{ marginTop: -86, width: "100%", opacity: ready, scale: String(0.9 + 0.1 * ready) }}>
              <div style={{ borderRadius: 24, border: `2px solid ${A.green2}`, background: A.white, padding: "22px 24px", boxShadow: "0 20px 40px rgba(10,107,71,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FIG, fontWeight: 800, fontSize: 28, color: A.text }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: A.green2 }} />
                  Smart wallet ready
                </div>
                <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 20, color: A.ink }}>0x7a4e…91b2</div>
                <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 16, color: A.muted }}>passkey · gas sponsored</div>
              </div>
            </div>
          </div>
          {f >= tap - 8 && f < tap + 16 ? (
            <div style={{ position: "absolute", left: 210 - (f - tap + 8) * 3, top: 480 - (f - tap + 8) * 3, width: (f - tap + 8) * 6, height: (f - tap + 8) * 6, borderRadius: "50%", border: `3px solid ${A.green2}`, opacity: f < tap ? 0.3 : 1 - (f - tap) / 16 }} />
          ) : null}
        </Phone>
      </Push>
      <Sfx name="mouse-click" at={tap} volume={0.4} />
      <Sfx name="ding" at={tap + 4} volume={0.2} />
    </AbsoluteFill>
  );
};

/* ===== S4 · On-chain identity (0:15–0:20) ===== */
const VERIFIERS = ["Price feed", "Data API", "Web search"];
export const S4: React.FC<SA> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const card = pop(f, B(1), 16);
  const fields: [string, string][] = [
    ["agent", "Apolio"],
    ["id", "did:abx:0x7a4e…91b2"],
    ["works for", "you"],
    ["status", "verified"],
  ];
  return (
    <AbsoluteFill style={{ background: A.dark }}>
      <DotField paint={(i, j, fr) => ({ c: "#3A3A3A", a: 0.45 + 0.15 * Math.sin(i * 0.7 + j + fr / 15) })} />
      <div style={{ position: "absolute", left: 140, top: 100 }}>
        <Chapter icon={<Ico d={ICON.id} size={24} />} label="On-chain identity" at={B(0)} dark />
      </div>
      <div style={{ position: "absolute", left: 140, top: 180 }}>
        <Words size={70} words={["Apolio", "gets", "an", "on-chain", "identity."].map((t, k) => ({ t, at: B(0.5) + k * 3, color: k >= 3 ? A.green : undefined }))} />
      </div>
      <Push dur={dur}>
        <div style={{ position: "absolute", left: 140, top: 340, width: 900, opacity: card, scale: String(0.9 + 0.1 * card) }}>
          <Card dark style={{ padding: "34px 40px", display: "flex", gap: 36, alignItems: "center", border: `1.5px solid ${A.green}` }}>
            <Apolio size={170} />
            <div style={{ flex: 1, fontFamily: MONO }}>
              {fields.map(([k, v], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 26, lineHeight: 2.1, borderBottom: `1px solid ${A.borderDark}`, opacity: ein(f, B(1.6) + i * 5, 8) }}>
                  <span style={{ color: "#8A8A8A" }}>{k}</span>
                  <span style={{ color: k === "status" ? A.green : A.white }}>{k === "status" ? "✓ verified" : v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {VERIFIERS.map((v, k) => {
            const at = B(4.5 + k * 0.9);
            const y = 380 + k * 170;
            const t = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: expo });
            return <line key={v} x1={1040} y1={540} x2={1040 + (1290 - 1040) * t} y2={540 + (y + 50 - 540) * t} stroke={A.green} strokeWidth={2} strokeDasharray="6 8" opacity={0.7} />;
          })}
        </svg>
        {VERIFIERS.map((v, k) => {
          const at = B(4.5 + k * 0.9);
          const t = pop(f, at + 6, 12);
          return (
            <div key={v} style={{ position: "absolute", left: 1290, top: 380 + k * 170, width: 480, opacity: f >= at + 6 ? 1 : 0, scale: String(0.9 + 0.1 * t) }}>
              <div style={{ height: 110, borderRadius: 22, background: A.white, display: "flex", alignItems: "center", padding: "0 26px", gap: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
                <span style={{ fontFamily: FIG, fontWeight: 700, fontSize: 28, color: A.ink, flex: 1 }}>{v}</span>
                <DPill d="allow" label="verified ✓" size={20} />
              </div>
            </div>
          );
        })}
      </Push>
      <div style={{ position: "absolute", left: 140, right: 140, top: 930 }}>
        <Words size={40} weight={600} color="#D4D4D8" words={["Any", "service", "can", "verify", "who", "it", "is", "and", "who", "it", "works", "for."].map((t, k) => ({ t, at: B(5) + k * 2, color: k >= 8 ? A.green : undefined }))} />
      </div>
      {VERIFIERS.map((_, k) => (
        <Sfx key={k} name="tick" at={B(4.5 + k * 0.9) + 6} volume={0.2} />
      ))}
    </AbsoluteFill>
  );
};

/* ===== S5 · Rules in plain words (0:20–0:27) ===== */
const RULE_MSG = "Spend up to $5 a day on market data. Only use services I’ve approved. Ask me before any new service or subscription.";
const RULES: { d: "allow" | "ask"; t: string }[] = [
  { d: "allow", t: "Up to $5 a day · market data" },
  { d: "allow", t: "Approved services only" },
  { d: "ask", t: "New service or subscription: ask first" },
];
export const S5: React.FC<SA> = ({ B, dur }) => {
  const f = useCurrentFrame();
  const typedMsg = typed(RULE_MSG, f, B(1), 58);
  const reply = B(6);
  const confirm = B(9);
  const tap = B(10.5);
  const seal = B(11);
  return (
    <AbsoluteFill>
      <Scenery drift={0.5} />
      <Push dur={dur} amount={0.025}>
        <div style={{ position: "absolute", left: 300, right: 300, top: 170 }}>
          <Card style={{ padding: "26px 40px 34px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 18, borderBottom: `1px solid ${A.border}` }}>
              <Apolio size={56} />
              <span style={{ fontFamily: FIG, fontWeight: 800, fontSize: 28, color: A.ink }}>Apolio</span>
              <span style={{ fontFamily: MONO, fontSize: 18, color: A.muted }}>· in Claude</span>
              <span style={{ marginLeft: "auto" }}>
                <Chapter icon={<Ico d={ICON.rules} size={22} />} label="Know Your Intent" at={B(0)} />
              </span>
            </div>
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 26 }}>
              <Bubble who="you" at={B(0.5)} size={30}>
                {typedMsg}
                {typedMsg.length < RULE_MSG.length ? <span style={{ display: "inline-block", width: 3, height: 30, background: A.green, marginLeft: 3, verticalAlign: "-4px" }} /> : null}
              </Bubble>
              <Bubble who="apolio" at={reply} size={30}>
                Here are your rules. Confirm?
              </Bubble>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 18, paddingLeft: 66 }}>
                {RULES.map((r, k) => {
                  const at = B(7 + k * 0.6);
                  const t = pop(f, at, 14);
                  const sealed = f >= seal + k * 3;
                  const sweep = interpolate(f, [seal + k * 3, seal + k * 3 + 12], [0, 1], clamp);
                  return (
                    <div key={k} style={{ position: "relative", overflow: "hidden", borderRadius: 18, padding: "18px 20px", background: sealed ? A.wash : A.white, border: `1.5px solid ${sealed ? A.green2 : A.border}`, opacity: f >= at ? 1 : 0, scale: String(0.85 + 0.15 * t), translate: `0px ${(1 - t) * 30}px` }}>
                      <DPill d={r.d} label={r.d === "allow" ? "RULE" : "ASK"} size={16} />
                      <div style={{ marginTop: 12, fontFamily: FIG, fontWeight: 700, fontSize: 25, color: A.ink, lineHeight: 1.25 }}>{r.t}</div>
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sweep * 130 - 30}%`, width: "30%", background: `linear-gradient(90deg, transparent, ${A.mint}, transparent)`, opacity: sweep > 0 && sweep < 1 ? 0.9 : 0 }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 24, paddingLeft: 66 }}>
                {f >= seal ? <Check at={seal + 6} size={30}>Rules sealed.</Check> : null}
                <div style={{ padding: "16px 34px", borderRadius: 999, background: f >= tap ? A.green2 : A.ink, color: A.white, fontFamily: FIG, fontWeight: 700, fontSize: 26, opacity: ein(f, confirm, 10), scale: f >= tap && f < tap + 4 ? "0.94" : "1" }}>Confirm</div>
              </div>
            </div>
          </Card>
        </div>
      </Push>
      <svg width="54" height="54" viewBox="0 0 24 24" style={{ position: "absolute", left: interpolate(f, [B(9.4), tap - 2], [1500, 1490], { ...clamp, easing: expo }), top: interpolate(f, [B(9.4), tap - 2], [1000, 838], { ...clamp, easing: expo }), opacity: f >= B(9.4) && f < seal + 20 ? 1 : 0 }}>
        <path d="M4 2l15 8.5-6.6 1.9L9.6 19z" fill={A.white} stroke={A.ink} strokeWidth="1.2" />
      </svg>
      {Array.from({ length: 10 }).map((_, k) => (
        <Sfx key={k} name="mouse-click" at={B(1) + k * 7} volume={0.05} />
      ))}
      <Sfx name="switch" at={reply} volume={0.18} />
      <Sfx name="mouse-click" at={tap} volume={0.4} />
      <Sfx name="ding" at={seal} volume={0.22} />
    </AbsoluteFill>
  );
};
