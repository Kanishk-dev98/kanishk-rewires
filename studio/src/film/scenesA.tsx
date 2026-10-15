import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  SANS as SANS_FONT,
  Aurora,
  C,
  Chip,
  clamp,
  DEEP_GRADIENT,
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
  Trails,
  W,
} from "./kit";

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 160px", ...style }}>
    {children}
  </AbsoluteFill>
);

/* ============ 1. Cold open ============ */
const Icon: React.FC<{ kind: "sign" | "card" | "click"; draw: number }> = ({ kind, draw }) => {
  const common = {
    fill: "none",
    stroke: C.brand,
    strokeWidth: 5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - draw,
  };
  return (
    <svg width={160} height={120} viewBox="0 0 160 120" style={{ filter: `drop-shadow(0 0 14px ${C.brandDeep})` }}>
      {kind === "sign" ? <path d="M10 85 C 30 20, 45 20, 50 70 S 70 110, 85 50 S 110 30, 120 75 L 150 70" {...common} /> : null}
      {kind === "card" ? (
        <>
          <rect x={15} y={20} width={130} height={82} rx={10} {...common} />
          <path d="M15 45 L145 45" {...common} />
        </>
      ) : null}
      {kind === "click" ? (
        <>
          <path d="M60 20 L60 95 L78 78 L92 108 L104 102 L90 72 L114 72 Z" {...common} />
          <path d="M30 30 L42 42 M28 60 L44 58 M50 10 L52 26" {...common} />
        </>
      ) : null}
    </svg>
  );
};

export const ColdOpen: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const changeAt = W(ch, 2, "changing");
  const spendAt = W(ch, 4, "spend");
  const verbs = [
    { w: "Search", at: W(ch, 3, "search") },
    { w: "Negotiate", at: W(ch, 3, "negotiate") },
    { w: "Buy", at: W(ch, 3, "buy") },
  ];
  const icons: { k: "sign" | "card" | "click"; label: string; at: number }[] = [
    { k: "sign", label: "A signature.", at: W(ch, 1, "signature") },
    { k: "card", label: "A card.", at: W(ch, 1, "card") },
    { k: "click", label: "A click.", at: W(ch, 1, "click") },
  ];
  return (
    <Scene ch={ch} bg={C.dark} push={0.1} hits={[changeAt, spendAt]} shake={14}>
      <Aurora intensity={interpolate(frame, [0, ch.dur], [0.25, 0.9], clamp)} />
      <DotGrid opacity={0.4} />
      <Trails count={18} start={L(ch, 3)} seed="co" />
      <Dust count={30} seed="cod" speed={0.6} />
      {frame < L(ch, 0) ? (
        <Center>
          <div style={{ width: 5, height: 70, background: Math.floor(frame / 8) % 2 === 0 ? C.brand : "transparent", boxShadow: `0 0 20px ${C.brand}` }} />
        </Center>
      ) : null}
      <Center style={{ opacity: lineOpacity(frame, ch, 0) }}>
        <Kinetic line={ch.lines[0]} size={80} weight={600} maxWidth={1400} />
      </Center>
      <Center style={{ opacity: lineOpacity(frame, ch, 1) }}>
        <div style={{ display: "flex", gap: 120 }}>
          {icons.map((ic) => {
            const o = p(frame, ic.at - 2, 8);
            return (
              <div key={ic.k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: o, scale: String(0.7 + 0.3 * o) }}>
                <Icon kind={ic.k} draw={p(frame, ic.at, 14)} />
                <div style={{ fontSize: 56, fontWeight: 700 }}>{ic.label}</div>
              </div>
            );
          })}
        </div>
      </Center>
      <Center style={{ opacity: lineOpacity(frame, ch, 2) }}>
        <div style={{ display: "flex", gap: 34, alignItems: "baseline" }}>
          <Slam text="That is" at={L(ch, 2)} size={120} weight={700} />
          <Slam text="changing." at={changeAt} size={120} gradient={GREEN_GRADIENT} glow={C.brandDeep} />
        </div>
      </Center>
      <AbsoluteFill style={{ opacity: lineOpacity(frame, ch, 3) }}>
        <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", justifyContent: "center" }}>
          <Kinetic line={{ ...ch.lines[3], text: "Software is learning to act on our behalf.", words: ch.lines[3].words.slice(0, 8) }} size={68} weight={600} />
        </div>
        <div style={{ position: "absolute", top: 520, width: "100%", display: "flex", justifyContent: "center", gap: 40 }}>
          {verbs.map((v) => (
            <div
              key={v.w}
              style={{
                padding: "26px 54px",
                borderRadius: 999,
                border: `2px solid ${C.brand}`,
                background: "rgba(114,227,173,0.08)",
                boxShadow: `0 0 40px ${C.brandDeep}55`,
                opacity: p(frame, v.at - 2, 6),
                scale: String(interpolate(frame - v.at, [-2, 5, 10], [1.6, 0.95, 1], { ...clamp, easing: ease })),
              }}
            >
              <span style={{ fontSize: 72, fontWeight: 800, color: "white" }}>{v.w}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Center style={{ opacity: lineOpacity(frame, ch, 4, ch.dur) }}>
        <div style={{ display: "flex", gap: 40, alignItems: "baseline" }}>
          <Slam text="And soon, to" at={L(ch, 4)} size={110} weight={700} />
          <Slam text="spend." at={spendAt} size={220} gradient={GREEN_GRADIENT} glow={C.brand} />
        </div>
      </Center>
      <Shockwave at={spendAt} />
      <Sparks at={spendAt} count={80} />
      <Flash at={spendAt} color={C.brand} peak={0.5} />
      <Flash at={changeAt} len={6} peak={0.25} />
      {verbs.map((v) => (
        <Sfx key={v.w} name="whip" at={v.at} volume={0.15} />
      ))}
    </Scene>
  );
};

/* ============ 2. Brand reveal ============ */
export const REVEAL_HIT = 30;

export const Reveal: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const hit = REVEAL_HIT;
  const markS = interpolate(frame - hit, [0, 8, 14], [2.6, 0.94, 1], { ...clamp, easing: ease });
  const markO = interpolate(frame - hit, [0, 3], [0, 1], clamp);
  const word = interpolate(frame, [hit + 6, hit + 26], [0, 1], { ...clamp, easing: ease });
  const tag = p(frame, L(ch, 1), 12);
  const converge = interpolate(frame, [0, hit], [0, 1], { ...clamp, easing: ease });
  return (
    <Scene ch={ch} bg={C.dark} push={0.08} hits={[hit]} shake={24}>
      <Aurora intensity={frame < hit ? 0.3 : 1} />
      <DotGrid opacity={0.5} />
      {frame < hit + 6 ? <Trails count={16} start={-30} seed="rv" converge={converge} /> : null}
      <Dust count={60} seed="rvd" speed={1.2} />
      <Center style={{ flexDirection: "column", gap: 50 }}>
        <div style={{ scale: String(frame < hit ? 0 : markS), opacity: markO, filter: `drop-shadow(0 0 50px ${C.brandDeep}88)` }}>
          <Logo width={1000} dark markIn={1} wordIn={word} />
        </div>
        <div style={{ fontSize: 44, fontWeight: 400, letterSpacing: 8, color: "#E5E5E5", opacity: tag, translate: `0px ${(1 - tag) * 20}px` }}>
          Superpowering the <span style={{ color: C.brand, fontWeight: 600 }}>agent economy</span>
        </div>
      </Center>
      <Flash at={hit} len={14} />
      <Shockwave at={hit} rings={4} size={2200} />
      <Sparks at={hit} count={110} spread={1.4} />
    </Scene>
  );
};

/* ============ 3. The shift ============ */
const NODES = [
  { label: "Travel", tag: "TRV", x: 1580, y: 300 },
  { label: "APIs", tag: "API", x: 1730, y: 560 },
  { label: "Data", tag: "DATA", x: 1560, y: 820 },
  { label: "Invoices", tag: "INV", x: 1180, y: 850 },
  { label: "Compute", tag: "GPU", x: 1130, y: 260 },
];
const HUB = { x: 1400, y: 560 };

export const Shift: React.FC<SceneProps> = ({ ch }) => {
  const frame = useCurrentFrame();
  const hubIn = interpolate(frame - L(ch, 0), [0, 8, 12], [0, 1.15, 1], { ...clamp, easing: ease });
  const peopleAt = W(ch, 3, "people");
  const broken = p(frame, peopleAt, 14);
  const speed = interpolate(frame, [L(ch, 1), L(ch, 2)], [0.7, 2.6], clamp) * (1 - broken);
  return (
    <Scene ch={ch} bg={C.dark} push={0.07} hits={[peopleAt]} shake={10}>
      <Aurora intensity={0.7 * (1 - broken * 0.5)} />
      <DotGrid opacity={0.45} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <filter id="glowS">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {NODES.map((n, i) => {
          const at = L(ch, 1, 0.08 + i * 0.13);
          const o = interpolate(frame - at, [0, 6, 10], [0, 1.2, 1], { ...clamp, easing: ease });
          const linkColor = broken > 0 ? C.deny : C.brandDeep;
          return (
            <g key={n.label} opacity={Math.min(1, o)}>
              <line x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y} stroke={linkColor} strokeOpacity={0.5 - broken * 0.3} strokeWidth={2} strokeDasharray={broken > 0 ? "6 10" : undefined} />
              {frame > at + 6 && broken < 1
                ? [0, 0.25, 0.5, 0.75].map((off) => {
                    const t = (((frame - at) * 0.011 * speed + off + i * 0.13) % 1 + 1) % 1;
                    return <circle key={off} cx={HUB.x + (n.x - HUB.x) * t} cy={HUB.y + (n.y - HUB.y) * t} r={6} fill={C.brand} filter="url(#glowS)" />;
                  })
                : null}
              <g transform={`translate(${n.x} ${n.y}) scale(${o})`}>
                <circle r={58} fill="#0F1C17" stroke={broken > 0 ? "#555" : C.brand} strokeWidth={2} />
                <text y={8} textAnchor="middle" fill={broken > 0 ? "#777" : C.brand} fontFamily={MONO} fontSize={22}>
                  {n.tag}
                </text>
                <text y={96} textAnchor="middle" fill="#CFCFCF" fontFamily="inherit" fontSize={26} fontWeight={600}>
                  {n.label}
                </text>
              </g>
            </g>
          );
        })}
        <g transform={`translate(${HUB.x} ${HUB.y}) scale(${hubIn})`}>
          {[150, 200].map((r, i) => (
            <circle key={r} r={r} fill="none" stroke={C.brand} strokeOpacity={0.18} strokeDasharray="4 14" transform={`rotate(${frame * (i ? -0.6 : 0.9)})`} />
          ))}
          <circle r={100} fill="url(#hubG)" stroke={C.brand} strokeWidth={3} filter="url(#glowS)" />
          <defs>
            <radialGradient id="hubG">
              <stop offset="0" stopColor="#249361" />
              <stop offset="1" stopColor="#0F1C17" />
            </radialGradient>
          </defs>
          <text y={10} textAnchor="middle" fill="white" fontFamily={MONO} fontSize={30}>
            agent
          </text>
        </g>
      </svg>
      {/* text zone: left column */}
      <div style={{ position: "absolute", left: 120, top: 300, width: 820, height: 480 }}>
        <div style={{ position: "absolute", top: 40, opacity: lineOpacity(frame, ch, 0) }}>
          <Slam text="AI agents are" at={L(ch, 0)} size={96} weight={700} />
          <div style={{ height: 14 }} />
          <Slam text="no longer demos." at={W(ch, 0, "no")} size={96} gradient={GREEN_GRADIENT} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", top: 40, opacity: lineOpacity(frame, ch, i, i === 3 ? ch.dur : undefined) }}>
            <Kinetic
              line={ch.lines[i]}
              size={i === 3 ? 64 : 58}
              weight={i === 3 ? 700 : 600}
              align="left"
              maxWidth={820}
              accent={i === 3 ? ["people"] : i === 2 ? ["hold", "spend"] : ["machine", "speed"]}
              accentColor={i === 3 ? C.deny : C.brand}
            />
          </div>
        ))}
      </div>
      <Flash at={peopleAt} color={C.deny} peak={0.18} len={8} />
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
  const fourthAt = W(ch, 4, "none");
  const noRule = L(ch, 5);
  const logAt = L(ch, 6);
  const log = p(frame, logAt, 14);
  const cardHits = [1, 2, 3].map((i) => L(ch, i));
  return (
    <Scene ch={ch} bg="#FFFFFF" light push={0.04} hits={[...cardHits, fourthAt]} shake={6}>
      <Aurora light intensity={0.8} />
      <DotGrid light opacity={0.6} />
      {/* zone A: title */}
      <div style={{ position: "absolute", left: 120, top: 140, opacity: p(frame, L(ch, 0), 10) }}>
        <Kinetic line={ch.lines[0]} size={64} weight={700} color={C.ink} align="left" maxWidth={1500} accent={["three"]} accentColor={C.brandText} />
      </div>
      {/* zone B: cards */}
      <div style={{ position: "absolute", left: 120, right: 120, top: 270, height: 380, display: "flex", gap: 30 }}>
        {QUESTIONS.map((q, i) => {
          const at = L(ch, i + 1);
          const s = interpolate(frame - at, [0, 6, 11], [0.6, 1.04, 1], { ...clamp, easing: ease });
          return (
            <div
              key={q.code}
              style={{
                flex: 1,
                borderRadius: 26,
                background: "white",
                border: `1px solid ${C.border}`,
                boxShadow: "0 30px 60px rgba(10,107,71,0.10)",
                padding: "34px 34px 30px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                opacity: p(frame, at, 6),
                scale: String(frame < at ? 0.6 : s),
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 58, color: C.brandText }}>{q.code}</div>
              <div style={{ fontSize: 26, color: C.muted }}>{q.name}</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 34, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{q.answer}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Chip tone="brand" light>
                  WHO ✓
                </Chip>
                <Chip tone="deny" light style={{ opacity: p(frame, noRule + i * 5, 8) }}>
                  no rule to stop it
                </Chip>
              </div>
            </div>
          );
        })}
        <div
          style={{
            flex: 1,
            borderRadius: 26,
            border: `3px dashed ${C.denyDeep}`,
            background: `rgba(253,238,236,${0.75 + Math.sin(frame / 5) * 0.2})`,
            padding: "34px 34px 30px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            opacity: p(frame, fourthAt, 6),
            scale: String(interpolate(frame - fourthAt, [0, 6, 11], [1.5, 0.96, 1], { ...clamp, easing: ease })),
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 58, color: C.denyDeep }}>???</div>
          <div style={{ fontSize: 26, color: C.denyDeep }}>Nobody answers</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 34, fontWeight: 700, color: C.denyDeep, lineHeight: 1.2 }}>What was authorised?</div>
        </div>
      </div>
      {/* zone C: takeaway, then the log */}
      <div style={{ position: "absolute", left: 120, right: 120, top: 700, height: 300 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", opacity: Math.min(p(frame, fourthAt, 10), out(frame, logAt - 8, 8)) }}>
          <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 40 }}>
            They tell you <span style={{ color: C.brandText }}>who</span>. Not <span style={{ color: C.denyDeep }}>what was allowed</span>.
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 240,
            right: 240,
            top: 0,
            borderRadius: 20,
            background: "#111",
            color: "#CFCFCF",
            padding: "24px 36px",
            fontFamily: MONO,
            fontSize: 24,
            lineHeight: 1.75,
            opacity: log,
            translate: `0px ${(1 - log) * 40}px`,
            boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ color: "#8A8A8A" }}>spend.log · read the next morning</div>
          {[
            ["02:14:07", "$1,240.00", "data-provider", false],
            ["02:15:31", "$4,980.00", "unknown-vendor", true],
            ["02:16:02", "$2,115.50", "unknown-vendor", true],
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 36, opacity: p(frame, logAt + 6 + i * 5, 6) }}>
              <span style={{ color: "#6B6B6B" }}>{r[0] as string}</span>
              <span>agent_7f3a</span>
              <span style={{ color: r[3] ? C.deny : "#CFCFCF" }}>{r[1] as string}</span>
              <span style={{ color: "#8A8A8A" }}>{r[2] as string}</span>
            </div>
          ))}
          <div style={{ color: C.deny }}>⚠ already paid · too late to stop</div>
        </div>
      </div>
      {cardHits.map((h) => (
        <Sfx key={h} name="whip" at={h} volume={0.12} />
      ))}
      <Sfx name="ding" at={fourthAt} volume={0.12} />
    </Scene>
  );
};

/* ============ 5. Know Your Intent ============ */
const PRECEPT = [
  ["cap", "$500 / month", "max it can spend"],
  ["period", "30 days", "when the limit resets"],
  ["allowlist", "airlines", "where it may pay"],
  ["expiry", "2026-12-31", "when authority ends"],
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
  const kyiAt = W(ch, 0, "know");
  const introOut = out(frame, L(ch, 1) - 8, 8);
  const work = Math.min(p(frame, L(ch, 1), 10), out(frame, L(ch, 5) - 8, 8));
  const flipAt = L(ch, 4, 0.25);
  const flip = interpolate(frame, [flipAt, flipAt + 14], [0, 1], { ...clamp, easing: ease });
  const fiftyAt = W(ch, 3, "fifty");
  const finaleAt = W(ch, 5, "intent");
  return (
    <Scene ch={ch} bg={C.dark} push={0.06} hits={[kyiAt, fiftyAt, finaleAt]} shake={12}>
      <Aurora intensity={0.85} />
      <DotGrid opacity={0.45} />
      <Dust count={40} seed="kyi" />
      {/* Phase A: the fourth layer */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: introOut }}>
        <div style={{ display: "flex", gap: 46, marginBottom: 30, opacity: p(frame, L(ch, 0), 10) }}>
          {["KYC", "KYT", "KYA"].map((k) => (
            <span key={k} style={{ fontFamily: MONO, fontSize: 48, color: "#5A5A5A", textDecoration: frame > kyiAt ? "line-through" : "none" }}>
              {k}
            </span>
          ))}
        </div>
        <Slam text="KYI" at={kyiAt} size={300} gradient={GREEN_GRADIENT} glow={C.brand} />
        <div style={{ fontSize: 64, fontWeight: 600, marginTop: 10, opacity: p(frame, kyiAt + 6, 10) }}>Know Your Intent</div>
        <div style={{ marginTop: 34 }}>
          <Plain at={kyiAt + 14}>Rules an agent can't break, checked before it pays.</Plain>
        </div>
      </AbsoluteFill>
      {kyiAt <= frame ? <Shockwave at={kyiAt} /> : null}
      <Sparks at={kyiAt} count={70} />
      <Flash at={kyiAt} color={C.brand} peak={0.35} />

      {/* Phase B — zone left: precept → receipt (flip) */}
      <div style={{ position: "absolute", left: 120, top: 190, width: 640, height: 640, opacity: work, perspective: 1600 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 26,
            border: `1px solid #1F4A37`,
            background: "linear-gradient(160deg, #0F1C17, #0A0A0A)",
            padding: 38,
            fontFamily: MONO,
            boxShadow: `0 0 60px ${C.brandDeep}33`,
            rotate: `y ${flip * 90}deg`,
            opacity: flip < 0.5 ? 1 : 0,
            translate: `${(1 - p(frame, L(ch, 1), 12)) * -60}px 0px`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 26, letterSpacing: 4, color: C.brand }}>PRECEPT</span>
            <Chip tone="brand" style={{ opacity: p(frame, L(ch, 1, 0.92), 8) }}>
              ✓ signed
            </Chip>
          </div>
          <div style={{ fontFamily: "inherit", fontSize: 20, color: "#8A8A8A", marginTop: 8 }}>travel_agent_01 · did:agent:7f3a</div>
          <div style={{ marginTop: 26 }}>
            {PRECEPT.map(([k, v, hint], i) => {
              const at = W(ch, 1, k === "allowlist" ? "allowlist" : k === "cap" ? "cap" : k);
              const o = p(frame, at - 2, 8);
              return (
                <div key={k} style={{ height: 100, borderBottom: "1px solid #1E1E1E", display: "flex", flexDirection: "column", justifyContent: "center", opacity: o, translate: `${(1 - o) * 20}px 0px` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32 }}>
                    <span style={{ color: "#8A8A8A" }}>{k}</span>
                    <span style={{ color: "white" }}>{v}</span>
                  </div>
                  <div style={{ fontSize: 18, color: C.brand, opacity: 0.8, marginTop: 4 }}>↳ {hint}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 14,
            background: "#F7F7F5",
            color: C.ink,
            padding: "40px 42px",
            fontFamily: MONO,
            fontSize: 26,
            lineHeight: 2,
            rotate: `y ${(1 - flip) * -90}deg`,
            opacity: flip >= 0.5 ? 1 : 0,
            boxShadow: `0 0 80px ${C.brandDeep}44`,
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 4, color: C.muted }}>SIGNED RECEIPT</div>
          <div style={{ borderTop: `2px dashed ${C.border}`, margin: "14px 0" }} />
          {[
            ["decision", "DENY"],
            ["reason", "vendor not allowed"],
            ["amount", "$1,240.00"],
            ["latency", "34 ms"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.muted }}>{k}</span>
              <span style={{ color: k === "decision" ? C.denyDeep : C.ink, fontWeight: k === "decision" ? 700 : 400 }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: `2px dashed ${C.border}`, margin: "14px 0" }} />
          <div style={{ color: C.brandText }}>✓ anyone can verify · 0x4be1…09dc</div>
          <div style={{ marginTop: 16 }}>
            <Plain at={flipAt + 16} light style={{ padding: "8px 14px" }}>
              Proof of every yes and every no.
            </Plain>
          </div>
        </div>
      </div>

      {/* zone centre: gate */}
      <div style={{ position: "absolute", left: 820, top: 190, width: 6, height: 640, opacity: work * p(frame, L(ch, 2), 10), background: `linear-gradient(${C.brand}, ${C.brandDeep})`, boxShadow: `0 0 40px ${C.brand}, 0 0 90px ${C.brandDeep}` }} />
      <div style={{ position: "absolute", left: 760, top: 150, width: 130, textAlign: "center", fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: C.brand, opacity: work * p(frame, L(ch, 2), 10) }}>
        GATE
      </div>

      {/* zone right: stream + < 50 ms */}
      <div style={{ position: "absolute", left: 880, right: 120, top: 190, opacity: work, fontFamily: MONO }}>
        {STREAM.map((r, i) => {
          const at = L(ch, 2) + 6 + i * 11;
          const o = p(frame, at, 8);
          const tone = r.d === "ALLOW" ? "brand" : r.d === "DENY" ? "deny" : "review";
          const stamp = interpolate(frame - at - 6, [0, 5], [1.6, 1], { ...clamp, easing: ease });
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "170px 1fr 190px 100px", alignItems: "center", height: 74, borderBottom: "1px solid #1E1E1E", fontSize: 25, opacity: o, translate: `${(1 - o) * 120}px 0px` }}>
              <span style={{ scale: String(frame > at + 6 ? stamp : 0), display: "inline-block", transformOrigin: "left center" }}>
                <Chip tone={tone}>{r.d}</Chip>
              </span>
              <span style={{ color: "#BDBDBD" }}>{r.to}</span>
              <span style={{ color: "white", textAlign: "right" }}>{r.amt}</span>
              <span style={{ color: "#6B6B6B", textAlign: "right" }}>{r.ms}ms</span>
            </div>
          );
        })}
        <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 26, fontFamily: SANS_FONT }}>
          <Slam text="< 50 ms" at={fiftyAt} size={130} gradient={GREEN_GRADIENT} glow={C.brandDeep} style={{ fontFamily: "inherit" }} />
          <div style={{ fontFamily: "inherit", fontSize: 28, color: "#BDBDBD", lineHeight: 1.3, opacity: p(frame, fiftyAt + 6, 10) }}>
            per decision,
            <br />
            <span style={{ color: "white" }}>before money moves</span>
          </div>
        </div>
      </div>

      {/* Phase C: statement */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: p(frame, L(ch, 5) - 4, 8) }}>
        <Slam text={<span>Identity tells you <span style={{ color: "white" }}>who.</span></span>} at={L(ch, 5)} size={92} weight={600} color="#BDBDBD" />
        <div style={{ height: 30 }} />
        <Slam text={<span>Intent tells you <span style={{ background: GREEN_GRADIENT, WebkitBackgroundClip: "text", color: "transparent" }}>what they authorised.</span></span>} at={finaleAt} size={92} weight={700} />
      </AbsoluteFill>
      <Flash at={finaleAt} color={C.brand} peak={0.3} />
      {STREAM.map((_, i) => (
        <Sfx key={i} name="tick" at={L(ch, 2) + 12 + i * 11} volume={0.12} />
      ))}
      <Sfx name="shutter-modern" at={flipAt} volume={0.15} />
    </Scene>
  );
};

export { DEEP_GRADIENT };
