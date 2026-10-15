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
  Trails,
  W,
} from "./kit";

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 160px", ...style }}>
    {children}
  </AbsoluteFill>
);

/* ============ 1. Cold open ============ */
export const ColdOpen: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const cursorOn = frame < L(ch, 0) - 4 && Math.floor(frame / 15) % 2 === 0;
  const spendAt = W(ch, 4, "spend");
  return (
    <Scene ch={ch} bg={C.dark}>
      <Glow y="55%" size={1400} opacity={interpolate(frame, [L(ch, 3), ch.dur], [0, 0.25], clamp)} />
      <Trails count={14} start={L(ch, 3)} seed="co" />
      {frame < L(ch, 0) ? (
        <Center>
          <div style={{ width: 4, height: 64, background: cursorOn ? C.brand : "transparent" }} />
        </Center>
      ) : null}
      {ch.lines.map((line, i) => (
        <Center key={i} style={{ opacity: lineOpacity(frame, ch, i, i === 4 ? ch.dur - 6 : undefined) }}>
          <Kinetic
            line={line}
            size={i === 2 ? 96 : i === 4 ? 104 : 76}
            weight={i === 4 ? 600 : 400}
            accent={i === 4 ? ["spend"] : i === 2 ? ["changing"] : []}
          />
        </Center>
      ))}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${C.brand}55, transparent 40%)`,
          opacity: interpolate(frame, [spendAt, spendAt + 6, spendAt + 40], [0, 1, 0.2], clamp),
        }}
      />
      <Sfx name="riser" at={spendAt - 80} volume={0.12} />
    </Scene>
  );
};

/* ============ 2. Brand reveal ============ */
export const Reveal: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const markAt = L(ch, 0) - 8;
  const mark = p(frame, markAt, 26);
  const word = interpolate(frame, [L(ch, 0) + 6, L(ch, 0) + 40], [0, 1], { ...clamp, easing: ease });
  const tag = p(frame, L(ch, 1), 24);
  const converge = interpolate(frame, [0, markAt], [0, 1], { ...clamp, easing: ease });
  return (
    <Scene ch={ch} bg={C.dark}>
      <DotGrid opacity={0.6 * mark} />
      <div style={{ opacity: 1 - mark }}>
        <Trails count={12} start={-20} seed="rv" converge={converge} />
      </div>
      <Glow size={1200} opacity={0.18 + 0.25 * mark} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 48%, white, ${C.brand} 8%, transparent 30%)`,
          opacity: interpolate(frame, [markAt, markAt + 4, markAt + 30], [0, 0.9, 0], clamp),
        }}
      />
      <Center style={{ flexDirection: "column", gap: 56 }}>
        <Logo
          width={980}
          dark
          markIn={mark}
          wordIn={word}
          style={{ filter: `drop-shadow(0 0 ${40 * mark}px ${C.brandDeep}66)` }}
        />
        <div
          style={{
            fontSize: 40,
            fontWeight: 300,
            letterSpacing: 6,
            color: "#CFCFCF",
            opacity: tag,
            translate: `0px ${(1 - tag) * 16}px`,
          }}
        >
          Superpowering the agent economy
        </div>
      </Center>
      <Sfx name="impact" at={markAt} volume={0.35} />
      <Sfx name="boom" at={markAt} volume={0.4} />
    </Scene>
  );
};

/* ============ 3. The shift ============ */
const SERVICES = [
  { label: "Travel", x: 1500, y: 300 },
  { label: "APIs", x: 1640, y: 560 },
  { label: "Data", x: 1470, y: 800 },
  { label: "Invoices", x: 1130, y: 860 },
  { label: "Compute", x: 1080, y: 230 },
];
const AGENT = { x: 1300, y: 540 };

export const Shift: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const agentIn = p(frame, L(ch, 0), 24);
  const grey = p(frame, L(ch, 3), 30);
  const speed = interpolate(frame, [L(ch, 1), L(ch, 2)], [0.6, 2.2], clamp) * (1 - grey);
  return (
    <Scene ch={ch} bg={C.dark}>
      <DotGrid opacity={0.5} />
      <Glow x={`${AGENT.x}px`} y={`${AGENT.y}px`} size={900} opacity={0.22 * (1 - grey)} />
      <svg width={1920} height={1080} style={{ position: "absolute", filter: `grayscale(${grey})` }}>
        {SERVICES.map((s, i) => {
          const at = L(ch, 1, 0.12 + i * 0.14);
          const o = p(frame, at, 18);
          const pulses = [0, 0.33, 0.66];
          return (
            <g key={s.label} opacity={o}>
              <line x1={AGENT.x} y1={AGENT.y} x2={s.x} y2={s.y} stroke={C.borderDark} strokeWidth={1.5} />
              {frame > at + 10
                ? pulses.map((off) => {
                    const t = (((frame - at) * 0.012 * speed + off + i * 0.1) % 1 + 1) % 1;
                    return (
                      <circle
                        key={off}
                        cx={AGENT.x + (s.x - AGENT.x) * t}
                        cy={AGENT.y + (s.y - AGENT.y) * t}
                        r={5}
                        fill={C.brand}
                        opacity={grey > 0.9 ? 0 : 0.9}
                      />
                    );
                  })
                : null}
              <circle cx={s.x} cy={s.y} r={46} fill="#111" stroke={C.borderDark} strokeWidth={1.5} />
              <text x={s.x} y={s.y + 82} textAnchor="middle" fill="#BDBDBD" fontFamily={MONO} fontSize={22}>
                {s.label}
              </text>
              <circle cx={s.x} cy={s.y} r={8} fill={C.brand} opacity={0.8} />
            </g>
          );
        })}
        <g opacity={agentIn}>
          <circle cx={AGENT.x} cy={AGENT.y} r={88} fill="#0F1C17" stroke={C.brand} strokeWidth={2} />
          <circle cx={AGENT.x} cy={AGENT.y} r={120 + Math.sin(frame / 12) * 6} fill="none" stroke={C.brand} strokeOpacity={0.25} />
          <text x={AGENT.x} y={AGENT.y + 8} textAnchor="middle" fill={C.brand} fontFamily={MONO} fontSize={24}>
            agent
          </text>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 120, top: 330, width: 760 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", top: 0, opacity: lineOpacity(frame, ch, i, i === 3 ? ch.dur - 10 : undefined) }}>
            <Kinetic
              line={ch.lines[i]}
              size={i === 0 ? 76 : 54}
              weight={i === 0 ? 600 : 400}
              align="left"
              maxWidth={760}
              accent={i === 3 ? ["people"] : i === 2 ? ["hold", "spend"] : []}
            />
          </div>
        ))}
      </div>
    </Scene>
  );
};

/* ============ 4. The problem ============ */
const QUESTIONS = [
  { code: "KYC", name: "Know Your Customer", answer: "Who a person is" },
  { code: "KYT", name: "Know Your Transaction", answer: "Where money moved" },
  { code: "KYA", name: "Know Your Agent", answer: "Which software is acting" },
];

export const Problem: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const head = p(frame, L(ch, 0), 20);
  const fourth = p(frame, L(ch, 4, 0.45), 22);
  const noRule = p(frame, L(ch, 5), 20);
  const logPhase = p(frame, L(ch, 6), 26);
  return (
    <Scene ch={ch} bg={C.surface} light>
      <DotGrid light opacity={0.7} />
      <div style={{ position: "absolute", left: 120, top: 150, opacity: head * (1 - logPhase * 0.6) }}>
        <Kinetic line={ch.lines[0]} size={60} weight={600} color={C.ink} align="left" maxWidth={1400} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 330,
          display: "flex",
          gap: 28,
          scale: String(1 - logPhase * 0.08),
          translate: `0px ${-logPhase * 40}px`,
          opacity: 1 - logPhase * 0.55,
        }}
      >
        {QUESTIONS.map((q, i) => {
          const o = p(frame, L(ch, i + 1), 20);
          return (
            <div
              key={q.code}
              style={{
                flex: 1,
                height: 380,
                borderRadius: 24,
                border: `1px solid ${C.border}`,
                background: "white",
                boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
                padding: 36,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                opacity: o,
                translate: `0px ${(1 - o) * 40}px`,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 52, color: C.ink }}>{q.code}</div>
              <div style={{ fontSize: 26, color: C.muted }}>{q.name}</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 32, fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>{q.answer}</div>
              <div style={{ display: "flex", gap: 10 }}>
                <Chip tone="brand" light>
                  WHO ✓
                </Chip>
                <Chip tone="deny" light style={{ opacity: noRule }}>
                  no enforceable rule
                </Chip>
              </div>
            </div>
          );
        })}
        <div
          style={{
            flex: 1,
            height: 380,
            borderRadius: 24,
            border: `2px dashed ${fourth > 0 ? C.denyDeep : C.border}`,
            padding: 36,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            opacity: fourth,
            background: `rgba(253,238,236,${0.6 + Math.sin(frame / 8) * 0.2})`,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 52, color: C.denyDeep }}>???</div>
          <div style={{ fontSize: 26, color: C.muted }}>Missing</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 32, fontWeight: 600, color: C.denyDeep, lineHeight: 1.2 }}>What was authorised?</div>
        </div>
      </div>
      {/* A log read afterwards */}
      <div
        style={{
          position: "absolute",
          left: 420,
          right: 420,
          top: 520,
          borderRadius: 20,
          background: "#111",
          color: "#CFCFCF",
          padding: "28px 36px",
          fontFamily: MONO,
          fontSize: 22,
          lineHeight: 1.9,
          opacity: logPhase,
          translate: `0px ${(1 - logPhase) * 60}px`,
          boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ color: "#8A8A8A", marginBottom: 6 }}>spend.log · reviewed next morning</div>
        {[
          ["02:14:07", "agent_7f3a", "$1,240.00", "data-provider"],
          ["02:14:09", "agent_7f3a", "$1,240.00", "data-provider"],
          ["02:15:31", "agent_7f3a", "$4,980.00", "unknown-vendor"],
          ["02:16:02", "agent_7f3a", "$2,115.50", "unknown-vendor"],
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 32, opacity: p(frame, L(ch, 6) + 8 + i * 6, 10) }}>
            <span style={{ color: "#6B6B6B" }}>{r[0]}</span>
            <span>{r[1]}</span>
            <span style={{ color: i >= 2 ? C.deny : "#CFCFCF" }}>{r[2]}</span>
            <span style={{ color: "#8A8A8A" }}>{r[3]}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, color: C.deny }}>⚠ already settled · cannot be reversed</div>
      </div>
      <Sfx name="ding" at={L(ch, 4, 0.45)} volume={0.12} />
    </Scene>
  );
};

/* ============ 5. Know Your Intent ============ */
const PRECEPT = [
  ["agent", "travel_agent_01"],
  ["cap", "$500 / month"],
  ["period", "30 days"],
  ["allowlist", "[airlines]"],
  ["expiry", "2026-12-31"],
];
const STREAM = [
  { d: "ALLOW", amt: "$42.00", to: "data-api", ms: 31 },
  { d: "ALLOW", amt: "$8.50", to: "browser-session", ms: 28 },
  { d: "DENY", amt: "$1,240.00", to: "unknown-vendor", ms: 34 },
  { d: "ALLOW", amt: "$120.00", to: "airline", ms: 36 },
  { d: "REVIEW", amt: "$499.00", to: "airline", ms: 29 },
  { d: "ALLOW", amt: "$3.20", to: "email-api", ms: 33 },
];

export const Kyi: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const intro = p(frame, L(ch, 0), 22);
  const kyiAt = W(ch, 0, "know");
  const kyiOn = p(frame, kyiAt, 24);
  const introOut = out(frame, L(ch, 1) - 10, 16);
  const precept = p(frame, L(ch, 1), 22);
  const streamIn = p(frame, L(ch, 3) - 10, 22);
  const receipt = p(frame, L(ch, 4, 0.35), 30);
  const finale = p(frame, L(ch, 5) - 6, 20);
  const work = 1 - finale;
  return (
    <Scene ch={ch} bg={C.dark}>
      <DotGrid opacity={0.5} />
      <Glow x="50%" y="40%" size={1300} opacity={0.2} />
      {/* Intro: the fourth layer */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: intro * introOut }}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
          {["KYC", "KYT", "KYA"].map((k) => (
            <div key={k} style={{ fontFamily: MONO, fontSize: 64, color: "#4A4A4A" }}>
              {k}
            </div>
          ))}
          <div
            style={{
              fontFamily: MONO,
              fontSize: 64 + kyiOn * 60,
              color: C.brand,
              textShadow: `0 0 ${40 * kyiOn}px ${C.brandDeep}`,
              opacity: kyiOn,
            }}
          >
            KYI
          </div>
        </div>
        <div style={{ marginTop: 34, fontSize: 56, fontWeight: 300, color: "white", opacity: kyiOn, letterSpacing: 1 }}>
          Know Your Intent
        </div>
      </AbsoluteFill>

      {/* Precept card */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 200,
          width: 620,
          borderRadius: 24,
          border: `1px solid ${C.borderDark}`,
          background: "#0F0F0F",
          padding: 36,
          opacity: precept * work,
          translate: `${(1 - precept) * -40}px 0px`,
          fontFamily: MONO,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <span style={{ fontSize: 22, letterSpacing: 3, color: C.brand }}>PRECEPT</span>
          <Chip tone="brand" style={{ opacity: p(frame, L(ch, 1, 0.9), 14) }}>
            ✓ signed
          </Chip>
        </div>
        {PRECEPT.map(([k, v], i) => {
          const o = p(frame, L(ch, 1, 0.18 + i * 0.15), 12);
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 28, lineHeight: 2.1, opacity: o }}>
              <span style={{ color: "#7A7A7A" }}>{k}</span>
              <span style={{ color: "white" }}>{v}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 18, fontSize: 20, color: "#5A5A5A", opacity: p(frame, L(ch, 1, 0.9), 14) }}>
          sig 0x9f3c…a71e · bound to did:agent:7f3a
        </div>
      </div>

      {/* Gate */}
      <div
        style={{
          position: "absolute",
          left: 800,
          top: 200,
          width: 4,
          height: 640,
          background: `linear-gradient(${C.brand}, ${C.brandDeep})`,
          boxShadow: `0 0 30px ${C.brand}`,
          opacity: p(frame, L(ch, 2), 20) * work,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 150,
          fontFamily: MONO,
          fontSize: 18,
          letterSpacing: 3,
          color: C.brand,
          opacity: p(frame, L(ch, 2), 20) * work,
        }}
      >
        AUTHORITY GATE
      </div>

      {/* Decision stream */}
      <div
        style={{
          position: "absolute",
          left: 860,
          right: 120,
          top: 200,
          opacity: p(frame, L(ch, 2) + 10, 20) * work,
          fontFamily: MONO,
        }}
      >
        {STREAM.map((r, i) => {
          const at = L(ch, 2) + 14 + i * 16;
          const o = p(frame, at, 12);
          const tone = r.d === "ALLOW" ? "brand" : r.d === "DENY" ? "deny" : "review";
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr 200px 110px",
                alignItems: "center",
                height: 72,
                borderBottom: `1px solid #1E1E1E`,
                fontSize: 24,
                opacity: o,
                translate: `${(1 - o) * 60}px 0px`,
              }}
            >
              <Chip tone={tone}>{r.d}</Chip>
              <span style={{ color: "#BDBDBD", paddingLeft: 20 }}>{r.to}</span>
              <span style={{ color: "white", textAlign: "right" }}>{r.amt}</span>
              <span style={{ color: "#6B6B6B", textAlign: "right" }}>{r.ms} ms</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 860,
          top: 680,
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          opacity: streamIn * work,
        }}
      >
        <span style={{ fontSize: 120, fontWeight: 600, color: C.brand, letterSpacing: -4 }}>&lt; 50 ms</span>
        <span style={{ fontSize: 26, color: "#9A9A9A" }}>per decision, before money moves</span>
      </div>

      {/* Receipt */}
      <div
        style={{
          position: "absolute",
          right: 160,
          top: interpolate(receipt, [0, 1], [-520, 160]),
          width: 520,
          background: "#F7F7F5",
          color: C.ink,
          borderRadius: 6,
          padding: "34px 36px",
          fontFamily: MONO,
          fontSize: 22,
          lineHeight: 1.9,
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
          opacity: receipt * work,
          rotate: `${(1 - receipt) * -4}deg`,
        }}
      >
        <div style={{ fontSize: 20, letterSpacing: 3, color: C.muted }}>SIGNED RECEIPT</div>
        <div style={{ borderTop: `1px dashed ${C.border}`, margin: "12px 0" }} />
        {[
          ["decision", "DENY"],
          ["reason", "vendor not on allowlist"],
          ["amount", "$1,240.00"],
          ["precept", "pr_8c21"],
          ["latency", "34 ms"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.muted }}>{k}</span>
            <span style={{ color: k === "decision" ? C.denyDeep : C.ink }}>{v}</span>
          </div>
        ))}
        <div style={{ borderTop: `1px dashed ${C.border}`, margin: "12px 0" }} />
        <div style={{ color: C.brandText }}>✓ verifiable · 0x4be1…09dc</div>
      </div>

      {/* Finale statement */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: finale }}>
        <div style={{ fontSize: 84, fontWeight: 300, color: "#CFCFCF", opacity: p(frame, L(ch, 5), 16) }}>
          Identity tells you <span style={{ color: "white", fontWeight: 600 }}>who.</span>
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 84,
            fontWeight: 300,
            color: "#CFCFCF",
            opacity: p(frame, W(ch, 5, "intent"), 16),
          }}
        >
          Intent tells you <span style={{ color: C.brand, fontWeight: 600 }}>what they authorised.</span>
        </div>
      </AbsoluteFill>
      <Sfx name="mouse-click" at={L(ch, 1, 0.9)} volume={0.2} />
      {STREAM.map((_, i) => (
        <Sfx key={i} name="tick" at={L(ch, 2) + 14 + i * 16} volume={0.1} />
      ))}
      <Sfx name="shutter-modern" at={L(ch, 4, 0.35)} volume={0.15} />
    </Scene>
  );
};
