import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  C,
  Chip,
  clamp,
  DotGrid,
  ease,
  Glow,
  Kinetic,
  L,
  lineOpacity,
  Logo,
  MONO,
  out,
  p,
  Scene,
  SceneProps,
  Sfx,
  W,
} from "./kit";

/* ============ 6. Settlement layer ============ */
const LAYERS = [
  { name: "Authority Gate", sub: "KYI · Precepts · Checks · Receipts", chips: [], line: 0, gate: true },
  { name: "Embedded Wallets", sub: "Smart accounts for users and agents", chips: ["ERC-4337", "Passkeys", "Social recovery", "No seed phrases"], line: 1 },
  { name: "Bundler", sub: "Managed UserOperation bundling", chips: ["UserOperations", "Pre-flight simulation"], line: 2 },
  { name: "Paymaster", sub: "Gas sponsorship", chips: ["Per-agent budgets", "Daily caps", "Gas in USDC"], line: 3 },
  { name: "Relayer", sub: "Transactions that land", chips: ["Nonce management", "Gas bumping", "Auto-resubmit"], line: 4 },
];
const CHAINS = ["Ethereum", "Base", "Arbitrum", "Polygon"];

export const Settlement: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const active = ch.lines.findIndex((l, i) => frame >= l.start - 6 && (!ch.lines[i + 1] || frame < ch.lines[i + 1].start - 6));
  return (
    <Scene ch={ch} bg={C.surface} light>
      <DotGrid light opacity={0.6} />
      <div style={{ position: "absolute", left: 120, top: 150, opacity: p(frame, L(ch, 0), 20) }}>
        <Kinetic line={ch.lines[0]} size={52} weight={600} color={C.ink} align="left" maxWidth={1500} />
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 260, display: "flex", flexDirection: "column", gap: 16 }}>
        {LAYERS.map((layer, i) => {
          const at = layer.line === 0 ? L(ch, 0, 0.3) : L(ch, layer.line);
          const o = p(frame, at, 22);
          const isActive = active === layer.line;
          return (
            <div
              key={layer.name}
              style={{
                height: 108,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                padding: "0 36px",
                gap: 36,
                background: layer.gate ? C.ink : isActive ? C.wash : "white",
                border: `${isActive && !layer.gate ? 2 : 1}px solid ${layer.gate ? C.ink : isActive ? C.brandDeep : C.border}`,
                boxShadow: isActive ? "0 18px 40px rgba(10,107,71,0.12)" : "0 8px 20px rgba(0,0,0,0.04)",
                opacity: o,
                translate: `0px ${(1 - o) * 50}px`,
              }}
            >
              <div style={{ width: 300 }}>
                <div style={{ fontSize: 34, fontWeight: 600, color: layer.gate ? C.brand : C.ink }}>{layer.name}</div>
                <div style={{ fontSize: 20, color: layer.gate ? "#9A9A9A" : C.muted, marginTop: 4 }}>{layer.sub}</div>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {layer.chips.map((c, j) => (
                  <Chip key={c} tone={isActive ? "brand" : "neutral"} light style={{ opacity: p(frame, at + 14 + j * 10, 12) }}>
                    {c}
                  </Chip>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ fontFamily: MONO, fontSize: 20, color: layer.gate ? C.brand : C.muted }}>
                {layer.gate ? "AUTHORIZE" : `L${i}`}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, bottom: 70, display: "flex", gap: 20, alignItems: "center" }}>
        <span style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.muted, opacity: p(frame, L(ch, 5) - 6, 14) }}>
          SETTLES ON
        </span>
        {CHAINS.map((c, i) => (
          <div
            key={c}
            style={{
              padding: "12px 26px",
              borderRadius: 999,
              border: `1px solid ${C.border}`,
              fontSize: 28,
              fontWeight: 600,
              color: C.ink,
              background: "white",
              opacity: p(frame, W(ch, 5, c.toLowerCase()), 12),
              translate: `0px ${(1 - p(frame, W(ch, 5, c.toLowerCase()), 12)) * 20}px`,
            }}
          >
            {c}
          </div>
        ))}
      </div>
      {LAYERS.slice(1).map((l) => (
        <Sfx key={l.name} name="switch" at={L(ch, l.line)} volume={0.1} />
      ))}
    </Scene>
  );
};

/* ============ 7. One payment, end to end ============ */
export const Demo: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const win = p(frame, L(ch, 0), 26);
  const deny = { req: L(ch, 2, 0.05), check: L(ch, 2, 0.42), result: W(ch, 2, "denied"), human: W(ch, 2, "human") };
  const allow = { req: L(ch, 3, 0.05), result: W(ch, 3, "allowed") };
  const pay = W(ch, 4, "paymaster");
  const rel = W(ch, 4, "relayer");
  const rec = L(ch, 5, 0.3);
  const spent = interpolate(frame, [allow.result, allow.result + 30], [0, 380], { ...clamp, easing: ease });
  const showDenyCard = frame < allow.req;
  const card = (amt: string, at: number) => ({ o: p(frame, at, 16), amt });
  const reqDeny = card("$620.00", deny.req);
  const reqAllow = card("$380.00", allow.req);
  const checking = frame >= deny.check && frame < deny.result;
  return (
    <Scene ch={ch} bg="#F5F5F3" light>
      <div style={{ position: "absolute", left: 120, top: 140, opacity: p(frame, L(ch, 0), 18) * out(frame, L(ch, 1) - 6, 12) }}>
        <Kinetic line={ch.lines[0]} size={48} weight={600} color={C.ink} align="left" />
      </div>
      {/* App window */}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 210,
          bottom: 90,
          borderRadius: 24,
          background: "white",
          border: `1px solid ${C.border}`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.10)",
          opacity: win,
          translate: `0px ${(1 - win) * 60}px`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ height: 64, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 18 }}>
          <Logo width={150} />
          <span style={{ color: C.border }}>|</span>
          <span style={{ fontSize: 20, color: C.muted }}>Authority Gate</span>
          <div style={{ flex: 1 }} />
          <Chip tone="brand" light>
            ● live
          </Chip>
        </div>
        <div style={{ flex: 1, display: "flex" }}>
          {/* Precept panel */}
          <div style={{ width: 520, borderRight: `1px solid ${C.border}`, padding: 36, fontFamily: MONO }}>
            <div style={{ fontSize: 18, letterSpacing: 3, color: C.muted }}>PRECEPT · travel_agent</div>
            {[
              ["Cap", "$500 / month", 0.25],
              ["Allowlist", "Airlines only", 0.5],
              ["Valid until", "Dec 31", 0.75],
            ].map(([k, v, f]) => (
              <div
                key={k as string}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 26,
                  marginTop: 28,
                  opacity: p(frame, L(ch, 1, f as number), 14),
                }}
              >
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ color: C.ink }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 52, opacity: p(frame, L(ch, 1, 0.85), 14) }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: C.muted }}>
                <span>Spent this month</span>
                <span style={{ color: C.ink }}>${Math.round(spent)} / $500</span>
              </div>
              <div style={{ marginTop: 14, height: 14, borderRadius: 999, background: "#EFEFEC" }}>
                <div style={{ width: `${(spent / 500) * 100}%`, height: "100%", borderRadius: 999, background: C.brandDeep }} />
              </div>
            </div>
          </div>
          {/* Activity */}
          <div style={{ flex: 1, padding: 36, position: "relative" }}>
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: C.muted }}>INCOMING PAYMENT</div>
            {/* request card */}
            {[
              { r: reqDeny, show: showDenyCard, to: "Airline · LHR → JFK", result: deny.result, ok: false },
              { r: reqAllow, show: !showDenyCard, to: "Airline · LHR → JFK", result: allow.result, ok: true },
            ].map((c, i) =>
              c.show ? (
                <div
                  key={i}
                  style={{
                    marginTop: 22,
                    height: 150,
                    borderRadius: 18,
                    border: `1px solid ${frame >= c.result ? (c.ok ? C.brandDeep : C.denyDeep) : C.border}`,
                    background: frame >= c.result ? (c.ok ? C.wash : "#FDEEEC") : "white",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 36px",
                    gap: 30,
                    opacity: c.r.o,
                    translate: `${(1 - c.r.o) * 80}px 0px`,
                  }}
                >
                  <div style={{ fontSize: 64, fontWeight: 600, color: C.ink, letterSpacing: -2 }}>{c.r.amt}</div>
                  <div style={{ fontSize: 24, color: C.muted }}>{c.to}</div>
                  <div style={{ flex: 1 }} />
                  {checking && !c.ok ? (
                    <Chip light>checking against precept…</Chip>
                  ) : frame >= c.result ? (
                    <Chip tone={c.ok ? "brand" : "deny"} light style={{ fontSize: 26, padding: "12px 22px" }}>
                      {c.ok ? "ALLOWED · 31 ms" : "DENIED · over cap"}
                    </Chip>
                  ) : null}
                </div>
              ) : null,
            )}
            {/* routed to human */}
            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 14,
                alignItems: "center",
                opacity: p(frame, deny.human, 14) * (showDenyCard ? 1 : 0),
              }}
            >
              <Chip tone="review" light>
                ↗ routed to human for approval
              </Chip>
            </div>
            {/* settlement steps */}
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { at: pay, label: "Paymaster", v: "gas sponsored · 0.00041 ETH" },
                { at: rel, label: "Relayer", v: "landed · block 21,904,377 · 0x6a2f…e19b" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    gap: 18,
                    alignItems: "center",
                    fontFamily: MONO,
                    fontSize: 24,
                    opacity: p(frame, s.at, 14),
                    translate: `${(1 - p(frame, s.at, 14)) * 30}px 0px`,
                  }}
                >
                  <span style={{ color: C.brandText }}>✓</span>
                  <span style={{ color: C.ink, width: 160 }}>{s.label}</span>
                  <span style={{ color: C.muted }}>{s.v}</span>
                </div>
              ))}
            </div>
            {/* receipts */}
            {[
              { d: "DENY", amt: "$620.00", c: C.denyDeep, dx: 0 },
              { d: "ALLOW", amt: "$380.00", c: C.brandText, dx: 1 },
            ].map((r) => {
              const o = p(frame, rec + r.dx * 14, 22);
              return (
                <div
                  key={r.d}
                  style={{
                    position: "absolute",
                    right: 36 + r.dx * 40,
                    bottom: 30 + r.dx * 40,
                    width: 400,
                    background: "#FAFAF8",
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "22px 26px",
                    fontFamily: MONO,
                    fontSize: 20,
                    lineHeight: 1.8,
                    boxShadow: "0 24px 50px rgba(0,0,0,0.12)",
                    opacity: o,
                    translate: `0px ${(1 - o) * 60}px`,
                  }}
                >
                  <div style={{ color: C.muted, letterSpacing: 2 }}>SIGNED RECEIPT</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: r.c }}>{r.d}</span>
                    <span>{r.amt}</span>
                  </div>
                  <div style={{ color: C.brandText }}>✓ verifiable</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Sfx name="mouse-click" at={deny.req} volume={0.15} />
      <Sfx name="whip" at={deny.result} volume={0.12} />
      <Sfx name="ding" at={allow.result} volume={0.15} />
      <Sfx name="tick" at={pay} volume={0.15} />
      <Sfx name="tick" at={rel} volume={0.15} />
      <Sfx name="shutter-modern" at={rec} volume={0.12} />
    </Scene>
  );
};

/* ============ 8. The agent economy ============ */
const SERVICES = [
  "2Captcha", "AgentMail", "AgentPhone", "Alchemy", "Allium", "Anthropic",
  "Apollo", "Auor", "AviationStack", "Browserbase", "Browser Use", "BuiltWith",
];

export const Economy: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const grid = p(frame, L(ch, 0), 30);
  const statement = lineOpacity(frame, ch, 1);
  const x402 = L(ch, 2);
  const count = interpolate(frame, [L(ch, 3), L(ch, 3) + 40], [0, 50], { ...clamp, easing: ease });
  const yours = p(frame, L(ch, 4, 0.3), 22);
  const cols = 6;
  const tileW = 236;
  const tileH = 110;
  const gx = (1920 - (cols * tileW + (cols - 1) * 24)) / 2;
  const gy = 330;
  const agent = { x: 960, y: 240 };
  return (
    <Scene ch={ch} bg={C.dark}>
      <DotGrid opacity={0.5} />
      <Glow y="30%" size={1000} opacity={0.18} />
      <div style={{ position: "absolute", left: 120, top: 140, opacity: lineOpacity(frame, ch, 0) }}>
        <Kinetic line={ch.lines[0]} size={44} weight={500} align="left" maxWidth={1300} />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: grid * (1 - statement * 0.7) }}>
        {SERVICES.map((s, i) => {
          const tx = gx + (i % cols) * (tileW + 24) + tileW / 2;
          const ty = gy + Math.floor(i / cols) * (tileH + 24);
          const go = x402 + (i % 6) * 9 + Math.floor(i / 6) * 5;
          const t = interpolate((frame - go) % 70, [0, 40], [0, 1], clamp);
          return frame > go ? (
            <g key={s}>
              <line x1={agent.x} y1={agent.y} x2={tx} y2={ty} stroke="#1F3A2E" strokeWidth={1} />
              <circle cx={agent.x + (tx - agent.x) * t} cy={agent.y + (ty - agent.y) * t} r={5} fill={C.brand} opacity={1 - t * 0.3} />
            </g>
          ) : null;
        })}
        <circle cx={agent.x} cy={agent.y} r={42} fill="#0F1C17" stroke={C.brand} strokeWidth={2} opacity={p(frame, x402 - 20, 20)} />
        <text x={agent.x} y={agent.y + 8} textAnchor="middle" fill={C.brand} fontFamily={MONO} fontSize={20} opacity={p(frame, x402 - 20, 20)}>
          agent
        </text>
      </svg>
      <div style={{ position: "absolute", left: gx, top: gy, width: cols * tileW + (cols - 1) * 24, opacity: grid * (1 - statement * 0.7) }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${tileW}px)`, gap: 24 }}>
          {[...SERVICES, "+ 38 more", "", "", "", "", ""].slice(0, 18).map((s, i) => {
            const isYours = i === 17;
            const go = x402 + (i % 6) * 9 + Math.floor(i / 6) * 5 + 40;
            const lit = s && !s.startsWith("+") && frame > go ? 1 : 0;
            const o = p(frame, L(ch, 0) + i * 2, 16);
            if (isYours) {
              return (
                <div
                  key={i}
                  style={{
                    height: tileH,
                    borderRadius: 16,
                    border: `2px solid ${C.brand}`,
                    background: "#0F1C17",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 20px",
                    opacity: yours,
                    scale: String(0.9 + yours * 0.1),
                    boxShadow: `0 0 ${30 * yours}px ${C.brandDeep}66`,
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 600, color: C.brand }}>Your service</div>
                  <div style={{ fontFamily: MONO, fontSize: 16, color: "#8A8A8A", marginTop: 6 }}>listed to agents</div>
                </div>
              );
            }
            return (
              <div
                key={i}
                style={{
                  height: tileH,
                  borderRadius: 16,
                  border: `1px solid ${lit ? "#2E5A46" : C.borderDark}`,
                  background: s ? "#111" : "#0D0D0D",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "0 20px",
                  opacity: s ? o : o * 0.35,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 600, color: s.startsWith("+") ? "#8A8A8A" : "white" }}>{s}</div>
                {lit ? (
                  <div style={{ fontFamily: MONO, fontSize: 16, color: C.brand, marginTop: 6 }}>paid via x402 ✓</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {/* statement */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: statement }}>
        <div style={{ fontSize: 110, fontWeight: 300, color: "#BDBDBD", letterSpacing: -2, opacity: p(frame, L(ch, 1), 14) }}>
          Not a store.
        </div>
        <div style={{ fontSize: 130, fontWeight: 600, color: C.brand, letterSpacing: -3, opacity: p(frame, W(ch, 1, "an"), 14) }}>
          An economy.
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 120,
          bottom: 70,
          display: "flex",
          alignItems: "baseline",
          gap: 20,
          opacity: p(frame, L(ch, 3), 16),
        }}
      >
        <span style={{ fontSize: 110, fontWeight: 600, color: "white", letterSpacing: -4 }}>{Math.round(count)}+</span>
        <span style={{ fontSize: 28, color: "#9A9A9A" }}>services integrated · discovered and paid on-chain via x402</span>
      </div>
      <Sfx name="boom" at={L(ch, 1)} volume={0.2} />
    </Scene>
  );
};

/* ============ 9. Proof ============ */
const Laurel: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <svg width="70" height="120" viewBox="0 0 70 120" style={{ scale: flip ? "-1 1" : "1" }}>
    {new Array(6).fill(0).map((_, i) => (
      <ellipse key={i} cx={42 - i * 3} cy={14 + i * 17} rx={8} ry={16} fill={C.brand} opacity={0.85} transform={`rotate(${-40 + i * 6} ${42 - i * 3} ${14 + i * 17})`} />
    ))}
  </svg>
);

export const Proof: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const vol = interpolate(frame, [L(ch, 1), L(ch, 1) + 45], [0, 5], { ...clamp, easing: ease });
  const pct = interpolate(frame, [L(ch, 2), L(ch, 2) + 45], [90, 99.9], { ...clamp, easing: ease });
  const txs = interpolate(frame, [W(ch, 2, "hundred"), W(ch, 2, "hundred") + 30], [0, 100], { ...clamp, easing: ease });
  const stat = (at: number) => ({ opacity: p(frame, at, 18), translate: `0px ${(1 - p(frame, at, 18)) * 40}px` });
  return (
    <Scene ch={ch} bg={C.dark}>
      <DotGrid opacity={0.4} />
      <Glow y="55%" size={1500} opacity={0.2} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center", opacity: lineOpacity(frame, ch, 0, ch.dur - 20) }}>
        <Kinetic line={ch.lines[0]} size={56} weight={400} color="#CFCFCF" />
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 380, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}>
        <div style={stat(L(ch, 1))}>
          <div style={{ fontSize: 150, fontWeight: 600, color: "white", letterSpacing: -6 }}>${vol.toFixed(vol < 5 ? 1 : 0)}B+</div>
          <div style={{ fontSize: 30, color: "#9A9A9A", marginTop: 8 }}>routed volume</div>
        </div>
        <div style={stat(L(ch, 2))}>
          <div style={{ fontSize: 150, fontWeight: 600, color: C.brand, letterSpacing: -6 }}>{pct.toFixed(1)}%</div>
          <div style={{ fontSize: 30, color: "#9A9A9A", marginTop: 8 }}>
            submission success across <span style={{ color: "white" }}>{Math.round(txs)}k+</span> transactions
          </div>
        </div>
        <div style={{ ...stat(L(ch, 3)), display: "flex", alignItems: "center", gap: 10 }}>
          <Laurel />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 4, color: "#9A9A9A" }}>TOKEN2049</div>
            <div style={{ fontSize: 64, fontWeight: 600, color: "white", lineHeight: 1.05, marginTop: 8 }}>NEXUS</div>
            <div style={{ fontSize: 64, fontWeight: 600, color: C.brand, lineHeight: 1.05 }}>Top 50</div>
          </div>
          <Laurel flip />
        </div>
      </div>
      <Sfx name="impact" at={L(ch, 1)} volume={0.25} />
      <Sfx name="impact" at={L(ch, 2)} volume={0.25} />
      <Sfx name="ding" at={L(ch, 3)} volume={0.2} />
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
  const verbsOut = out(frame, L(ch, 2) - 10, 14);
  const q = lineOpacity(frame, ch, 2);
  const logoAt = L(ch, 3) - 4;
  const mark = p(frame, logoAt, 24);
  const word = interpolate(frame, [logoAt + 8, logoAt + 40], [0, 1], { ...clamp, easing: ease });
  const creditAt = ch.dur - 140;
  return (
    <Scene ch={ch} bg={C.surface} light>
      <DotGrid light opacity={0.5} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: lineOpacity(frame, ch, 0) }}>
        <Kinetic line={ch.lines[0]} size={72} weight={500} color={C.ink} accent={["rules"]} accentColor={C.brandText} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 300, top: 250, opacity: p(frame, L(ch, 1) - 4, 10) * verbsOut }}>
        {VERBS.map(([v, rest], i) => {
          const at = W(ch, 1, v.toLowerCase());
          const o = p(frame, at - 2, 14);
          return (
            <div key={v} style={{ display: "flex", alignItems: "baseline", gap: 28, height: 140, opacity: o, translate: `${(1 - o) * -30}px 0px` }}>
              <span style={{ width: 300, fontSize: 104, fontWeight: 600, color: C.brandText, letterSpacing: -3 }}>{v}</span>
              <span style={{ fontSize: 52, fontWeight: 400, color: C.ink }}>{rest}</span>
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: q }}>
        <Kinetic line={ch.lines[2]} size={96} weight={600} color={C.ink} accent={["day", "one"]} accentColor={C.brandText} maxWidth={1500} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 44, opacity: mark }}>
        <Logo width={900} markIn={mark} wordIn={word} />
        <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: 5, color: C.muted, opacity: p(frame, W(ch, 3, "superpowering"), 20) }}>
          Superpowering the agent economy
        </div>
        <div style={{ fontFamily: MONO, fontSize: 28, color: C.brandText, opacity: p(frame, W(ch, 3, "superpowering") + 30, 20) }}>
          abstraxn.com
        </div>
      </AbsoluteFill>
      {credit ? (
        <div
          style={{
            position: "absolute",
            bottom: 64,
            width: "100%",
            textAlign: "center",
            fontSize: 22,
            letterSpacing: 2,
            color: C.muted,
            opacity: p(frame, creditAt, 24),
          }}
        >
          Produced by <span style={{ color: C.ink, fontWeight: 600 }}>{credit}</span>
        </div>
      ) : null}
      <Sfx name="impact" at={logoAt} volume={0.2} />
    </Scene>
  );
};
