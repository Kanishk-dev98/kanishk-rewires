import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Aurora,
  C,
  Chip,
  clamp,
  DotGrid,
  Dust,
  ease,
  Flash,
  GREEN_GRADIENT,
  Kinetic,
  L,
  lineOpacity,
  Logo,
  MONO,
  out,
  p,
  Plain,
  Scene,
  SceneProps,
  Sfx,
  Shockwave,
  Slam,
  Sparks,
  W,
} from "./kit";

const pop = (frame: number, at: number) => interpolate(frame - at, [0, 6, 11], [0.5, 1.06, 1], { ...clamp, easing: ease });

/* ============ 6. Settlement layer ============ */
const LAYERS = [
  { name: "Authority Gate", plain: "Decides if a payment is allowed.", chips: ["KYI", "Precepts", "Receipts"], line: 0 },
  { name: "Embedded Wallets", plain: "A secure wallet for every user and agent. No seed phrase to lose.", chips: ["ERC-4337", "Passkeys", "Social recovery"], line: 1 },
  { name: "Bundler", plain: "Packs actions together and test-runs them before they go live.", chips: ["UserOperations", "Pre-flight simulation"], line: 2 },
  { name: "Paymaster", plain: "Pays the network fees, inside the budgets you set.", chips: ["Per-agent budgets", "Daily caps", "Gas in USDC"], line: 3 },
  { name: "Relayer", plain: "Delivers every transaction, and retries if it gets stuck.", chips: ["Nonce management", "Gas bumping", "Auto-resubmit"], line: 4 },
];
const CHAINS = ["Ethereum", "Base", "Arbitrum", "Polygon"];

export const Settlement: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const active = Math.max(0, ch.lines.findIndex((l, i) => frame >= l.start - 4 && (!ch.lines[i + 1] || frame < ch.lines[i + 1].start - 4)));
  const activeLayer = Math.min(active, 4);
  const hits = [1, 2, 3, 4].map((i) => L(ch, i));
  const chainsOn = frame >= L(ch, 5) - 4;
  return (
    <Scene ch={ch} bg="#FFFFFF" light push={0.03} hits={hits} shake={5}>
      <Aurora light />
      <DotGrid light opacity={0.6} />
      {/* title zone */}
      <div style={{ position: "absolute", left: 120, top: 130, opacity: p(frame, L(ch, 0), 10) }}>
        <Kinetic line={ch.lines[0]} size={56} weight={700} color={C.ink} align="left" maxWidth={1600} accent={["settlement"]} accentColor={C.brandText} />
      </div>
      {/* zone left: isometric stack */}
      <div style={{ position: "absolute", left: 120, top: 330, width: 820, height: 640 }}>
        <div style={{ position: "absolute", left: 140, top: 80, width: 500, height: 500, transform: "perspective(1800px) rotateX(56deg) rotateZ(-36deg)", transformStyle: "preserve-3d" }}>
          {LAYERS.map((ly, i) => {
            const at = ly.line === 0 ? L(ch, 0, 0.4) : L(ch, ly.line);
            const drop = interpolate(frame - at, [0, 8, 12], [260, -8, 0], { ...clamp, easing: ease });
            const on = frame >= at;
            const isActive = activeLayer === ly.line && !chainsOn;
            const z = (4 - i) * 58;
            return (
              <div
                key={ly.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 30,
                  transform: `translateZ(${z + (on ? drop : 400)}px)`,
                  opacity: on ? 1 : 0,
                  background: isActive ? `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})` : i === 0 ? C.ink : "rgba(255,255,255,0.92)",
                  border: `2px solid ${isActive ? "#249361" : i === 0 ? C.ink : "#BDEBD5"}`,
                  boxShadow: isActive ? `0 0 80px ${C.brand}` : "0 30px 60px rgba(10,107,71,0.18)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 34,
                }}
              >
                <span style={{ fontSize: 44, fontWeight: 800, color: isActive ? C.ink : i === 0 ? C.brand : C.brandText }}>{ly.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* zone right: detail card for the active layer */}
      <div style={{ position: "absolute", left: 1000, right: 120, top: 300, height: 520 }}>
        {LAYERS.map((ly) => {
          const at = ly.line === 0 ? L(ch, 0, 0.4) : L(ch, ly.line);
          const visible = activeLayer === ly.line && !chainsOn;
          const o = visible ? p(frame, at, 10) : 0;
          return (
            <div key={ly.name} style={{ position: "absolute", inset: 0, opacity: o, translate: `${(1 - o) * 40}px 0px` }}>
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: C.brandText }}>LAYER {ly.line === 0 ? "0 · ON TOP" : ly.line}</div>
              <div style={{ fontSize: 88, fontWeight: 800, color: C.ink, letterSpacing: -3, marginTop: 10 }}>{ly.name}</div>
              <div style={{ fontSize: 40, fontWeight: 500, color: C.ink, lineHeight: 1.3, marginTop: 20, maxWidth: 780 }}>{ly.plain}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 34 }}>
                {ly.chips.map((c, j) => (
                  <Chip key={c} tone="brand" light style={{ fontSize: 22, opacity: p(frame, at + 10 + j * 5, 6) }}>
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
          );
        })}
        {/* chains replace the detail card at the end */}
        <div style={{ position: "absolute", inset: 0, opacity: chainsOn ? p(frame, L(ch, 5) - 4, 8) : 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: C.brandText }}>SETTLES ON</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 30 }}>
            {CHAINS.map((c) => {
              const at = W(ch, 5, c.toLowerCase());
              return (
                <div key={c} style={{ height: 130, borderRadius: 22, background: "white", border: `2px solid ${C.brandDeep}`, boxShadow: `0 20px 40px rgba(10,107,71,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, fontWeight: 800, color: C.ink, opacity: p(frame, at - 2, 6), scale: String(frame >= at - 2 ? pop(frame, at - 2) : 0.5) }}>
                  {c}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {hits.map((h) => (
        <Sfx key={h} name="whip" at={h} volume={0.12} />
      ))}
      {CHAINS.map((c) => (
        <Sfx key={c} name="tick" at={W(ch, 5, c.toLowerCase())} volume={0.18} />
      ))}
    </Scene>
  );
};

/* ============ 7. One payment, end to end ============ */
const Stamp: React.FC<{ text: string; at: number; color: string }> = ({ text, at, color }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = interpolate(frame - at, [0, 5, 9], [2.4, 0.92, 1], { ...clamp, easing: ease });
  return (
    <div style={{ padding: "10px 26px", border: `5px solid ${color}`, borderRadius: 14, color, fontSize: 44, fontWeight: 800, letterSpacing: 4, rotate: "-8deg", scale: String(s), opacity: interpolate(frame - at, [0, 3], [0, 1], clamp), background: "rgba(255,255,255,0.85)" }}>
      {text}
    </div>
  );
};

export const Demo: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const win = p(frame, L(ch, 0), 14);
  const denyReq = L(ch, 2, 0.02);
  const checking = W(ch, 2, "check");
  const denyAt = W(ch, 2, "denied");
  const humanAt = W(ch, 2, "human");
  const allowReq = L(ch, 3, 0.02);
  const allowAt = W(ch, 3, "allowed");
  const payAt = W(ch, 4, "paymaster");
  const relAt = W(ch, 4, "relayer");
  const recAt = L(ch, 5, 0.25);
  const spent = interpolate(frame, [allowAt, allowAt + 24], [0, 380], { ...clamp, easing: ease });
  const second = frame >= allowReq;
  const amount = second ? "$380.00" : "$620.00";
  const reqAt = second ? allowReq : denyReq;
  const reqO = frame >= denyReq ? p(frame, reqAt, 8) : 0;
  const decided = second ? frame >= allowAt : frame >= denyAt;
  const tone = second ? C.brandDeep : C.denyDeep;
  return (
    <Scene ch={ch} bg="#F4F7F5" light push={0.03} hits={[denyAt, allowAt]} shake={9}>
      <Aurora light intensity={0.7} />
      <div style={{ position: "absolute", left: 120, top: 120, opacity: Math.min(p(frame, L(ch, 0), 10), out(frame, L(ch, 1) - 6, 8)) }}>
        <Kinetic line={ch.lines[0]} size={52} weight={700} color={C.ink} align="left" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 190,
          bottom: 70,
          borderRadius: 28,
          background: "white",
          border: `1px solid ${C.border}`,
          boxShadow: "0 50px 120px rgba(10,107,71,0.18)",
          opacity: win,
          translate: `0px ${(1 - win) * 80}px`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ height: 70, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 30px", gap: 18, flexShrink: 0 }}>
          <Logo width={160} />
          <span style={{ color: C.border }}>|</span>
          <span style={{ fontSize: 22, color: C.muted }}>Authority Gate</span>
          <div style={{ flex: 1 }} />
          <Chip tone="brand" light>
            ● live
          </Chip>
        </div>
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* left: precept */}
          <div style={{ width: 540, borderRight: `1px solid ${C.border}`, padding: "34px 38px", fontFamily: MONO, flexShrink: 0 }}>
            <div style={{ fontSize: 20, letterSpacing: 3, color: C.brandText }}>PRECEPT · travel_agent</div>
            {[
              ["Cap", "$500 / month", W(ch, 1, "five")],
              ["Allowlist", "Airlines only", W(ch, 1, "airlines")],
              ["Valid until", "Dec 31", W(ch, 1, "valid")],
            ].map(([k, v, at]) => (
              <div key={k as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 30, marginTop: 30, opacity: p(frame, (at as number) - 2, 8) }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ color: C.ink }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 50, opacity: p(frame, L(ch, 1, 0.8), 8) }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: C.muted }}>
                <span>Spent this month</span>
                <span style={{ color: C.ink }}>${Math.round(spent)} / $500</span>
              </div>
              <div style={{ marginTop: 14, height: 18, borderRadius: 999, background: "#EAF5EF" }}>
                <div style={{ width: `${(spent / 500) * 100}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${C.brand}, ${C.brandDeep})`, boxShadow: `0 0 20px ${C.brand}` }} />
              </div>
            </div>
            <div style={{ marginTop: 40 }}>
              <Plain at={L(ch, 1, 0.9)} light style={{ padding: "10px 16px" }}>
                Like a company card, with rules.
              </Plain>
            </div>
          </div>
          {/* right: activity — fixed rows, no overlaps */}
          <div style={{ flex: 1, padding: "34px 40px", display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.muted }}>INCOMING PAYMENT</div>
            {/* row 1: request card */}
            <div style={{ height: 150, borderRadius: 20, flexShrink: 0, border: `2px solid ${decided ? tone : C.border}`, background: decided ? (second ? C.wash : "#FDEEEC") : "white", display: "flex", alignItems: "center", padding: "0 36px", gap: 30, opacity: reqO, translate: `${(1 - reqO) * 100}px 0px` }}>
              <div style={{ fontSize: 72, fontWeight: 800, color: C.ink, letterSpacing: -3 }}>{amount}</div>
              <div style={{ fontSize: 26, color: C.muted }}>Airline · LHR → JFK</div>
              <div style={{ flex: 1 }} />
              {!second && frame >= checking && frame < denyAt ? <Chip light>checking precept…</Chip> : null}
              <Stamp text={second ? "ALLOWED" : "DENIED"} at={second ? allowAt : denyAt} color={tone} />
            </div>
            {/* row 2: reason / routing */}
            <div style={{ height: 46, display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
              {!second ? (
                <>
                  <Chip tone="deny" light style={{ opacity: p(frame, denyAt + 4, 6) }}>
                    over the $500 cap
                  </Chip>
                  <Chip tone="review" light style={{ opacity: p(frame, humanAt, 6) }}>
                    ↗ sent to a human to approve
                  </Chip>
                </>
              ) : (
                <Chip tone="brand" light style={{ opacity: p(frame, allowAt + 4, 6) }}>
                  within cap · airline on allowlist · 31 ms
                </Chip>
              )}
            </div>
            {/* row 3: settlement steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
              {[
                { at: payAt, label: "Paymaster", v: "network fee covered" },
                { at: relAt, label: "Relayer", v: "landed on-chain · 0x6a2f…e19b" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", gap: 18, alignItems: "center", fontFamily: MONO, fontSize: 26, opacity: p(frame, s.at, 8), translate: `${(1 - p(frame, s.at, 8)) * 30}px 0px` }}>
                  <span style={{ width: 34, height: 34, borderRadius: "50%", background: C.brandDeep, color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✓</span>
                  <span style={{ color: C.ink, width: 170 }}>{s.label}</span>
                  <span style={{ color: C.muted }}>{s.v}</span>
                </div>
              ))}
            </div>
            {/* row 4: receipts side by side */}
            <div style={{ flex: 1, display: "flex", gap: 24, alignItems: "flex-end", minHeight: 0 }}>
              {[
                { d: "DENY", amt: "$620.00", c: C.denyDeep, delay: 0 },
                { d: "ALLOW", amt: "$380.00", c: C.brandText, delay: 8 },
              ].map((r) => {
                const o = p(frame, recAt + r.delay, 10);
                return (
                  <div key={r.d} style={{ width: 360, background: "#FAFAF8", border: `1px solid ${C.border}`, borderTop: `6px solid ${r.c}`, borderRadius: 10, padding: "18px 24px", fontFamily: MONO, fontSize: 22, lineHeight: 1.7, boxShadow: "0 24px 50px rgba(0,0,0,0.12)", opacity: o, translate: `0px ${(1 - o) * 60}px` }}>
                    <div style={{ color: C.muted, letterSpacing: 2, fontSize: 18 }}>SIGNED RECEIPT</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: r.c, fontWeight: 700 }}>{r.d}</span>
                      <span>{r.amt}</span>
                    </div>
                    <div style={{ color: C.brandText }}>✓ verifiable</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Sparks at={allowAt} x={1500} y={480} count={50} spread={0.7} />
      <Flash at={denyAt} color={C.deny} peak={0.15} len={6} />
      <Sfx name="mouse-click" at={denyReq} volume={0.2} />
      <Sfx name="whip" at={denyAt} volume={0.18} />
      <Sfx name="ding" at={allowAt} volume={0.2} />
      <Sfx name="tick" at={payAt} volume={0.18} />
      <Sfx name="tick" at={relAt} volume={0.18} />
      <Sfx name="shutter-modern" at={recAt} volume={0.15} />
    </Scene>
  );
};

/* ============ 8. The agent economy ============ */
const SERVICES = ["2Captcha", "AgentMail", "AgentPhone", "Alchemy", "Allium", "Anthropic", "Apollo", "Auor", "AviationStack", "Browserbase", "Browser Use", "BuiltWith"];

export const Economy: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const stmt = lineOpacity(frame, ch, 1);
  const storeAt = W(ch, 1, "economy");
  const x402 = W(ch, 2, "x402");
  const countAt = W(ch, 3, "fifty");
  const count = interpolate(frame, [countAt, countAt + 20], [0, 50], { ...clamp, easing: ease });
  const yoursAt = W(ch, 4, "list");
  const grid = Math.min(p(frame, L(ch, 0), 10), 1 - stmt);
  const cols = 5;
  const tw = 228;
  const th = 104;
  const gap = 20;
  const gx = 540;
  const gy = 270;
  const hub = { x: 300, y: 540 };
  return (
    <Scene ch={ch} bg={C.dark} push={0.05} hits={[storeAt, countAt]} shake={14}>
      <Aurora intensity={1} />
      <DotGrid opacity={0.45} />
      <Dust count={40} seed="eco" />
      {/* line 0 headline (top zone) */}
      <div style={{ position: "absolute", left: 120, top: 130, opacity: lineOpacity(frame, ch, 0) }}>
        <Kinetic line={ch.lines[0]} size={48} weight={600} align="left" maxWidth={1600} />
      </div>
      {/* network zone */}
      <AbsoluteFill style={{ opacity: grid }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {SERVICES.map((s, i) => {
            const tx = gx + (i % cols) * (tw + gap) + tw / 2;
            const ty = gy + Math.floor(i / cols) * (th + gap) + th / 2;
            const go = x402 + i * 4;
            const t = interpolate((frame - go) % 50, [0, 26], [0, 1], clamp);
            return frame > go ? (
              <g key={s}>
                <line x1={hub.x} y1={hub.y} x2={tx} y2={ty} stroke="#1F4A37" strokeWidth={1.5} />
                <circle cx={hub.x + (tx - hub.x) * t} cy={hub.y + (ty - hub.y) * t} r={7} fill={C.brand} opacity={1 - t * 0.3} style={{ filter: `drop-shadow(0 0 6px ${C.brand})` }} />
              </g>
            ) : null;
          })}
          <g opacity={p(frame, L(ch, 0), 10)}>
            <circle cx={hub.x} cy={hub.y} r={92} fill="#0F1C17" stroke={C.brand} strokeWidth={3} style={{ filter: `drop-shadow(0 0 20px ${C.brandDeep})` }} />
            <circle cx={hub.x} cy={hub.y} r={130} fill="none" stroke={C.brand} strokeOpacity={0.25} strokeDasharray="4 12" transform={`rotate(${frame} ${hub.x} ${hub.y})`} />
            <text x={hub.x} y={hub.y + 10} textAnchor="middle" fill="white" fontFamily={MONO} fontSize={30}>
              agent
            </text>
          </g>
        </svg>
        <div style={{ position: "absolute", left: gx, top: gy, display: "grid", gridTemplateColumns: `repeat(${cols}, ${tw}px)`, gap }}>
          {[...SERVICES, "+ 38 more", "", ""].map((s, i) => {
            const isYours = i === 14;
            const lit = s && !s.startsWith("+") && frame > x402 + i * 4 + 26;
            const o = p(frame, L(ch, 0) + 4 + i * 2, 8);
            if (isYours) {
              const yo = p(frame, yoursAt, 8);
              return (
                <div key={i} style={{ height: th, borderRadius: 18, border: `2px solid ${C.brand}`, background: `linear-gradient(135deg, #0F1C17, #12392A)`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 22px", opacity: yo, scale: String(frame >= yoursAt ? pop(frame, yoursAt) : 0.5), boxShadow: `0 0 50px ${C.brandDeep}88` }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.brand }}>Your service</div>
                  <div style={{ fontFamily: MONO, fontSize: 16, color: "#BDBDBD", marginTop: 4 }}>sold directly to agents</div>
                </div>
              );
            }
            return (
              <div key={i} style={{ height: th, borderRadius: 18, border: `1px solid ${lit ? C.brandDeep : C.borderDark}`, background: lit ? "#0F1C17" : s ? "#121212" : "transparent", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 22px", opacity: s ? o : 0, boxShadow: lit ? `0 0 24px ${C.brandDeep}44` : "none" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.startsWith("+") ? "#9A9A9A" : "white" }}>{s}</div>
                {lit ? <div style={{ fontFamily: MONO, fontSize: 16, color: C.brand, marginTop: 4 }}>paid via x402 ✓</div> : null}
              </div>
            );
          })}
        </div>
        {/* bottom zone: counter + plain words */}
        <div style={{ position: "absolute", left: 120, right: 120, top: 830, display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, opacity: p(frame, countAt, 6) }}>
            <span style={{ fontSize: 130, fontWeight: 800, letterSpacing: -5, background: GREEN_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>{Math.round(count)}+</span>
            <span style={{ fontSize: 30, color: "#CFCFCF" }}>services integrated</span>
          </div>
          <div style={{ flex: 1 }} />
          <Plain at={x402 + 10}>x402: payment built into the web request. No checkout.</Plain>
        </div>
      </AbsoluteFill>
      {/* statement — grid fully hidden meanwhile */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: stmt }}>
        <Slam text="Not a store." at={L(ch, 1)} size={120} weight={500} color="#BDBDBD" />
        <div style={{ height: 20 }} />
        <Slam text="An economy." at={storeAt} size={170} gradient={GREEN_GRADIENT} glow={C.brand} />
      </AbsoluteFill>
      <Shockwave at={storeAt} />
      <Sparks at={storeAt} count={80} />
      <Flash at={storeAt} color={C.brand} peak={0.3} />
      <Sfx name="whip" at={yoursAt} volume={0.18} />
    </Scene>
  );
};

/* ============ 9. Proof ============ */
const Laurel: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <svg width="80" height="150" viewBox="0 0 70 120" style={{ scale: flip ? "-1 1" : "1", filter: `drop-shadow(0 0 10px ${C.brandDeep})` }}>
    {new Array(6).fill(0).map((_, i) => (
      <ellipse key={i} cx={42 - i * 3} cy={14 + i * 17} rx={8} ry={16} fill={C.brand} transform={`rotate(${-40 + i * 6} ${42 - i * 3} ${14 + i * 17})`} />
    ))}
  </svg>
);

export const Proof: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const a = L(ch, 1);
  const b = L(ch, 2);
  const c = L(ch, 3);
  const vol = interpolate(frame, [a, a + 18], [0, 5], { ...clamp, easing: ease });
  const pct = interpolate(frame, [b, b + 18], [90, 99.9], { ...clamp, easing: ease });
  const txAt = W(ch, 2, "hundred");
  const txs = interpolate(frame, [txAt, txAt + 14], [0, 100], { ...clamp, easing: ease });
  const col = (at: number) => ({ opacity: p(frame, at, 6), scale: String(frame >= at ? pop(frame, at) : 0.5) });
  return (
    <Scene ch={ch} bg={C.dark} push={0.08} hits={[a, b, c]} shake={22}>
      <Aurora intensity={1.2} />
      <DotGrid opacity={0.4} />
      <Dust count={70} seed="pr" speed={1.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 160, display: "flex", justifyContent: "center", opacity: lineOpacity(frame, ch, 0, ch.dur) }}>
        <Kinetic line={ch.lines[0]} size={64} weight={600} accent={["proven"]} />
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 360, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 50 }}>
        <div style={{ ...col(a), textAlign: "center" }}>
          <div style={{ fontSize: 170, fontWeight: 800, letterSpacing: -7, color: "white" }}>${vol.toFixed(vol < 5 ? 1 : 0)}B+</div>
          <div style={{ fontSize: 32, color: "#CFCFCF" }}>routed volume</div>
        </div>
        <div style={{ ...col(b), textAlign: "center" }}>
          <div style={{ fontSize: 170, fontWeight: 800, letterSpacing: -7, background: GREEN_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>{pct.toFixed(1)}%</div>
          <div style={{ fontSize: 32, color: "#CFCFCF" }}>
            success across <span style={{ color: "white", fontWeight: 700 }}>{Math.round(txs)}k+</span> transactions
          </div>
        </div>
        <div style={{ ...col(c), display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Laurel />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 5, color: "#CFCFCF" }}>TOKEN2049</div>
            <div style={{ fontSize: 84, fontWeight: 800, color: "white", lineHeight: 1 }}>NEXUS</div>
            <div style={{ fontSize: 84, fontWeight: 800, color: C.brand, lineHeight: 1 }}>Top 50</div>
          </div>
          <Laurel flip />
        </div>
      </div>
      {[a, b, c].map((h, i) => (
        <React.Fragment key={h}>
          <Shockwave at={h} x={360 + i * 600} y={500} size={1000} rings={2} />
          <Sparks at={h} x={360 + i * 600} y={500} count={40} spread={0.8} />
          <Flash at={h} color={C.brand} peak={0.22} len={7} />
        </React.Fragment>
      ))}
    </Scene>
  );
};

/* ============ 10. Close ============ */
const VERBS = [
  ["Set", "what an agent may spend."],
  ["Prove", "who it is."],
  ["Check", "both before it pays."],
  ["Keep", "a receipt anyone can verify."],
];

export const Close: React.FC<SceneProps> = ({ ch, credit }) => {
  const frame = useCurrentFrame();
  const verbsO = Math.min(p(frame, L(ch, 1) - 4, 6), out(frame, L(ch, 2) - 6, 6));
  const q = lineOpacity(frame, ch, 2);
  const logoAt = L(ch, 3) - 4;
  const word = interpolate(frame, [logoAt + 6, logoAt + 26], [0, 1], { ...clamp, easing: ease });
  const markS = interpolate(frame - logoAt, [0, 8, 14], [2.4, 0.95, 1], { ...clamp, easing: ease });
  const verbHits = VERBS.map(([v]) => W(ch, 1, v.toLowerCase()));
  return (
    <Scene ch={ch} bg="#FFFFFF" light push={0.05} hits={[...verbHits, logoAt]} shake={8}>
      <Aurora light intensity={1} />
      <DotGrid light opacity={0.5} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: lineOpacity(frame, ch, 0) }}>
        <Kinetic line={ch.lines[0]} size={84} weight={700} color={C.ink} accent={["rules"]} accentColor={C.brandText} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 260, top: 200, opacity: verbsO }}>
        {VERBS.map(([v, rest], i) => {
          const at = verbHits[i];
          const o = p(frame, at - 2, 5);
          return (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 40, height: 170, opacity: o, translate: `${(1 - o) * -60}px 0px` }}>
              <div style={{ width: 380 }}>
                <Slam text={v} at={at - 2} size={140} gradient={`linear-gradient(120deg, ${C.brandDeep}, #249361 60%, ${C.brandText})`} />
              </div>
              <span style={{ fontSize: 60, fontWeight: 600, color: C.ink }}>{rest}</span>
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: q }}>
        <Kinetic line={ch.lines[2]} size={110} weight={800} color={C.ink} accent={["day", "one"]} accentColor={C.brandText} maxWidth={1500} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 46, opacity: p(frame, logoAt, 4) }}>
        <div style={{ scale: String(frame >= logoAt ? markS : 0), filter: `drop-shadow(0 20px 40px rgba(10,107,71,0.25))` }}>
          <Logo width={980} markIn={1} wordIn={word} />
        </div>
        <div style={{ fontSize: 42, fontWeight: 400, letterSpacing: 8, color: C.muted, opacity: p(frame, W(ch, 3, "superpowering"), 10) }}>
          Superpowering the <span style={{ color: C.brandText, fontWeight: 700 }}>agent economy</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 32, color: C.brandText, opacity: p(frame, W(ch, 3, "superpowering") + 20, 10) }}>abstraxn.com</div>
      </AbsoluteFill>
      <Shockwave at={logoAt} color={C.brandDeep} rings={4} size={2200} />
      <Sparks at={logoAt} count={100} spread={1.3} />
      <Flash at={logoAt} color={C.brand} peak={0.45} len={12} />
      {credit ? (
        <div style={{ position: "absolute", bottom: 64, width: "100%", textAlign: "center", fontSize: 24, letterSpacing: 2, color: C.muted, opacity: p(frame, ch.dur - 120, 14) }}>
          Produced by <span style={{ color: C.ink, fontWeight: 700 }}>{credit}</span>
        </div>
      ) : null}
      {verbHits.map((h) => (
        <Sfx key={h} name="whip" at={h} volume={0.14} />
      ))}
    </Scene>
  );
};
