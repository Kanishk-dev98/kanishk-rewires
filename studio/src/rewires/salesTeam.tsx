// "Sales team" film v2 (9:16, light theme). Each beat gets its own premium visual; the funnel appears only for
// the filtering beats and is drawn as a mature, layered frosted-glass funnel. Disciplined type: one scale, large
// tabular numbers, no stray chips. Official full-colour logos only.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";

const INK = "#3E7A00";
const MUTED = "#8A877E";
const LINE = "#E4E0D5";
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;
const sp = (f: number, at: number, k = { damping: 16, stiffness: 150 }) => spring({ frame: f - at, fps: 30, config: k });
/** Premium entrance: rise + soft blur, eased, no bounce. */
const rise = (f: number, at: number, dist = 30): React.CSSProperties => {
  const p = interpolate(f, [at, at + 16], [0, 1], { ...clamp, easing: EASE });
  return { opacity: p, translate: `0 ${(1 - p) * dist}px`, filter: `blur(${(1 - p) * 10}px)` };
};
const Logo: React.FC<{ src: string; h: number; style?: React.CSSProperties }> = ({ src, h, style }) => <Img src={staticFile(`media/logos/${src}`)} style={{ height: h, width: "auto", ...style }} />;
const typed = (f: number, s: string, at: number, cps = 1.8) => s.slice(0, Math.max(0, Math.floor((f - at) * cps)));

/** Calm cream stage with a slow light sweep and a faint grid: depth without clutter. */
const Stage: React.FC<{ children: React.ReactNode; push?: number }> = ({ children, push = 0.03 }) => {
  const f = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(10,10,10,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,0.035) 1px, transparent 1px)", backgroundSize: "54px 54px", maskImage: "radial-gradient(ellipse 70% 55% at 50% 48%, black, transparent 75%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 35% at ${30 + (f / D) * 40}% 40%, rgba(255,255,255,0.9), rgba(246,244,237,0) 70%)` }} />
      <AbsoluteFill style={{ scale: String(interpolate(f, [0, D], [1, 1 + push], clamp)) }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
const StepTag: React.FC<{ n: number; total?: number }> = ({ n, total = 8 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 90, top: 250, display: "flex", alignItems: "center", gap: 14, ...rise(f, 0, 10) }}>
      <div style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1, color: C.charcoal }}>{String(n).padStart(2, "0")}</div>
      <div style={{ width: 120, height: 3, background: LINE, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${(n / total) * 100}%`, height: "100%", background: INK }} />
      </div>
    </div>
  );
};
const Window: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; title?: string; dark?: boolean }> = ({ children, style, title, dark }) => (
  <div style={{ position: "absolute", borderRadius: 22, background: dark ? "#111311" : "white", border: `1px solid ${dark ? "#262826" : LINE}`, boxShadow: "0 40px 90px rgba(10,10,10,0.14), 0 2px 0 rgba(255,255,255,0.6) inset", overflow: "hidden", ...style }}>
    <div style={{ height: 46, display: "flex", alignItems: "center", gap: 8, padding: "0 18px", background: dark ? "#181A18" : "#F3F1EA", borderBottom: `1px solid ${dark ? "#262826" : LINE}` }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
      ))}
      {title ? <div style={{ marginLeft: 12, fontFamily: MONO, fontSize: 16, color: dark ? C.grey : MUTED }}>{title}</div> : null}
    </div>
    {children}
  </div>
);

// ------------------------------------------------------------------ hook: designed headline
const Hook: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const words = [
    { t: "Build", at: 2 },
    { t: "your", at: 6 },
    { t: "advanced", at: 10, accent: true },
    { t: "sales team", at: 16, accent: true },
    { t: "with", at: 24 },
  ];
  const logoAt = c("claude", 30);
  const s = sp(f, logoAt, { damping: 14, stiffness: 120 });
  return (
    <Stage push={0.05}>
      <div style={{ position: "absolute", left: 90, right: 90, top: 520, fontFamily: HEAD, fontWeight: 700, fontSize: 112, lineHeight: 1.04, letterSpacing: -4, color: C.charcoal }}>
        {words.map((w) => (
          <span key={w.t} style={{ display: "inline-block", marginRight: 26, ...rise(f, w.at, 40), ...(w.accent ? { fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, letterSpacing: -1, fontSize: 124 } : {}) }}>
            {w.accent && w.t === "sales team" ? (
              <span style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: -8, right: -8, bottom: 10, height: 34, background: C.lime, zIndex: 0, transformOrigin: "0 50%", scale: `${interpolate(f, [w.at + 6, w.at + 18], [0, 1], { ...clamp, easing: EASE })} 1` }} />
                <span style={{ position: "relative" }}>{w.t}</span>
              </span>
            ) : (
              w.t
            )}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, top: 1020, display: "flex", alignItems: "center", gap: 22, opacity: f < logoAt ? 0 : 1, translate: `0 ${(1 - s) * 30}px` }}>
        <div style={{ width: 120, height: 120, borderRadius: 30, background: "white", border: `1px solid ${LINE}`, boxShadow: `0 30px 70px rgba(217,119,87,${0.18 * s})`, display: "flex", alignItems: "center", justifyContent: "center", rotate: `${(1 - s) * -20}deg` }}>
          <Logo src="claude.svg" h={70} />
        </div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 84, letterSpacing: -2, color: C.charcoal }}>Claude Code</div>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ 1. tools: terminal + cables
const Tools: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const tools = [
    { k: "apollo", logo: "apollo.svg", name: "Apollo", role: "Leads" },
    { k: "gmail", logo: "gmail.svg", name: "Gmail", role: "Email" },
    { k: "hubspot", logo: "hubspot.svg", name: "HubSpot", role: "CRM" },
  ];
  return (
    <Stage>
      <StepTag n={1} />
      <Window dark title="~/sales — claude code" style={{ left: 90, right: 90, top: 400, height: 330, ...rise(f, 2) }}>
        <div style={{ padding: "22px 26px", fontFamily: MONO, fontSize: 26, lineHeight: 1.8, color: C.cream }}>
          {tools.map((t) => {
            const at = c(t.k, 30);
            const line = `claude mcp add ${t.k}`;
            return (
              <div key={t.k} style={{ opacity: f >= at - 10 ? 1 : 0 }}>
                <span style={{ color: C.lime }}>›</span> {typed(f, line, at - 10, 2.2)}
                {f >= at + 6 ? <span style={{ color: "#7FD39A" }}>{"  "}connected</span> : null}
              </div>
            );
          })}
        </div>
      </Window>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {tools.map((t, i) => {
          const at = c(t.k, 30) + 6;
          const x = 210 + i * 330;
          const p = interpolate(f, [at, at + 14], [0, 1], { ...clamp, easing: EASE_IO });
          return <path key={t.k} d={`M${x} 1000 C ${x} 880, 540 860, 540 735`} stroke={INK} strokeWidth={2.5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.7} />;
        })}
      </svg>
      {tools.map((t, i) => {
        const at = c(t.k, 30) + 2;
        return (
          <div key={t.k} style={{ position: "absolute", left: 210 + i * 330 - 120, top: 1000, width: 240, textAlign: "center", ...rise(f, at, 40) }}>
            <div style={{ height: 170, borderRadius: 28, background: "white", border: `1px solid ${LINE}`, boxShadow: "0 30px 70px rgba(10,10,10,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Logo src={t.logo} h={t.k === "hubspot" ? 40 : 76} style={{ maxWidth: 190 }} />
            </div>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal, marginTop: 14 }}>{t.name}</div>
            <div style={{ fontFamily: BODY, fontSize: 20, color: MUTED }}>{t.role}</div>
          </div>
        );
      })}
    </Stage>
  );
};

// ------------------------------------------------------------------ 2. ICP document
const Icp: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const rows = [
    { k: "Industry", v: "D2C and consumer brands", cue: "industry" },
    { k: "Company size", v: "11 to 200 people", cue: "size" },
    { k: "Region", v: "India, US, UK", cue: "region" },
    { k: "Buyers", v: "Head of Growth, CMO, Founder", cue: "titles" },
  ];
  return (
    <Stage>
      <StepTag n={2} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 400, perspective: 1600 }}>
        <div style={{ background: "white", borderRadius: 26, border: `1px solid ${LINE}`, boxShadow: "0 50px 100px rgba(10,10,10,0.14)", padding: "40px 46px", rotate: `x ${interpolate(f, [0, 30], [16, 4], { ...clamp, easing: EASE })}deg`, ...rise(f, 0, 50) }}>
          <div style={{ fontFamily: MONO, fontSize: 18, color: MUTED }}>ICP.md</div>
          <div style={{ fontFamily: SERIF, fontSize: 64, color: C.charcoal, marginTop: 10, lineHeight: 1 }}>Who we sell to</div>
          <div style={{ height: 1, background: LINE, margin: "28px 0 10px" }} />
          {rows.map((r) => {
            const at = c(r.cue, 30);
            return (
              <div key={r.k} style={{ display: "flex", justifyContent: "space-between", padding: "18px 0", borderBottom: `1px solid ${LINE}` }}>
                <span style={{ fontFamily: BODY, fontSize: 26, color: MUTED }}>{r.k}</span>
                <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.charcoal }}>
                  {typed(f, r.v, at, 2)}
                  {f >= at && typed(f, r.v, at, 2).length < r.v.length ? <span style={{ color: INK }}>|</span> : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ 3-5. the funnel (only here): a shaded, layered 3D funnel
type Layer = { label: string; count: number; note?: string; side: string; mid: string; top: string };
const LAYERS: Layer[] = [
  { label: "Matching companies", count: 2400, side: "#D9D6CC", mid: "#F3F1EA", top: "#FBFAF6" },
  { label: "Good fit", count: 1120, note: "the rest parked, not deleted", side: "#C9D9A8", mid: "#EEF6DD", top: "#F7FBEE" },
  { label: "Decision makers", count: 860, side: "#A9D466", mid: "#DDF5B4", top: "#EEFAD6" },
  { label: "Verified emails", count: 640, note: "no email: LinkedIn only", side: "#7DBF2A", mid: "#C6F27C", top: "#E2FBB4" },
];
const Funnel: React.FC<{ data: SceneProps["data"]; c: (n: string, f: number) => number }> = ({ data, c }) => {
  const f = useCurrentFrame();
  const upto = data.upto as number;
  const from = data.from as number;
  const step = data.step as number;
  const CX = 360;
  const H = 140;
  const GAP = 26;
  const top = 470;
  const RY = 0.16; // ellipse squash: perspective of looking slightly down
  const wAt = (i: number) => 600 * Math.pow(0.74, i);
  const rows = LAYERS.map((L, i) => {
    const at = i < from ? -40 : c(`l${i}`, 20 + (i - from) * 40);
    return { L, i, at, y: top + i * (H + GAP), p: interpolate(f, [at, at + 22], [0, 1], { ...clamp, easing: EASE }) };
  }).filter((r) => r.i < upto);
  return (
    <Stage push={0.025}>
      <StepTag n={step} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {LAYERS.map((L, i) => (
            <linearGradient key={i} id={`side${i}`} x1="0" x2="1">
              <stop offset="0" stopColor={L.side} />
              <stop offset="0.38" stopColor={L.mid} />
              <stop offset="0.62" stopColor={L.mid} />
              <stop offset="1" stopColor={L.side} />
            </linearGradient>
          ))}
          <radialGradient id="shadowF">
            <stop offset="0" stopColor="#0A0A0A" stopOpacity="0.16" />
            <stop offset="1" stopColor="#0A0A0A" stopOpacity="0" />
          </radialGradient>
        </defs>
        {(() => {
          const last = rows[rows.length - 1];
          const w = wAt(last.i + 1);
          return <ellipse cx={CX} cy={last.y + H + 40} rx={w * 0.75} ry={22} fill="url(#shadowF)" opacity={last.p} />;
        })()}
        {[...rows].reverse().map(({ L, i, y, p }) => {
          const wT = wAt(i);
          const wB = wAt(i + 1) * 1.04;
          const dy = (1 - p) * -60; // layers drop into place from above
          const yy = y + dy;
          const ryT = (wT / 2) * RY;
          const ryB = (wB / 2) * RY;
          const body = `M${CX - wT / 2},${yy} L${CX - wB / 2},${yy + H} A${wB / 2},${ryB} 0 0 0 ${CX + wB / 2},${yy + H} L${CX + wT / 2},${yy} Z`;
          return (
            <g key={L.label} opacity={p}>
              <path d={body} fill={`url(#side${i})`} />
              {/* specular streak on the left shoulder */}
              <path d={`M${CX - wT * 0.3},${yy + ryT * 0.6} L${CX - wB * 0.28},${yy + H + ryB * 0.5}`} stroke="white" strokeOpacity={0.55} strokeWidth={10} strokeLinecap="round" />
              <ellipse cx={CX} cy={yy} rx={wT / 2} ry={ryT} fill={L.top} stroke={L.side} strokeWidth={1.5} />
              <ellipse cx={CX} cy={yy + 4} rx={wT / 2 - 18} ry={ryT - 6} fill="none" stroke="#0A0A0A" strokeOpacity={0.05} strokeWidth={6} />
            </g>
          );
        })}
        {/* leader lines to the labels */}
        {rows.map(({ L, i, y, at }) => {
          const x0 = CX + (wAt(i) + wAt(i + 1)) / 4 + 14;
          const ly = y + H / 2 + 10;
          const p = interpolate(f, [at + 10, at + 26], [0, 1], { ...clamp, easing: EASE_IO });
          return <line key={L.label} x1={x0} y1={ly} x2={x0 + (700 - x0) * p} y2={ly} stroke={C.charcoal} strokeOpacity={0.35} strokeWidth={1.5} />;
        })}
      </svg>
      {rows.map(({ L, i, y, at }) => {
        const n = Math.round(interpolate(f, [at + 6, at + 36], [i < from ? L.count : 0, L.count], { ...clamp, easing: EASE }));
        const active = i >= from;
        const prev = i > 0 ? LAYERS[i - 1].count : 0;
        return (
          <React.Fragment key={L.label}>
            <div style={{ position: "absolute", left: 716, top: y + H / 2 - 40, width: 300, ...rise(f, at + 12, 16) }}>
              <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 64, lineHeight: 1, letterSpacing: -2, color: C.charcoal, fontVariantNumeric: "tabular-nums" }}>{n.toLocaleString("en-US")}</div>
              <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 23, color: active ? C.charcoal : MUTED, marginTop: 8 }}>{L.label}</div>
              {L.note && active ? <div style={{ fontFamily: BODY, fontSize: 19, color: MUTED, marginTop: 4 }}>{L.note}</div> : null}
            </div>
            {i > 0 ? (
              <div style={{ position: "absolute", left: CX - 60, width: 120, top: y - GAP / 2 - 30, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: INK, ...rise(f, at + 20, 8) }}>
                {Math.round((L.count / prev) * 100)}%
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </Stage>
  );
};

// ------------------------------------------------------------------ 6. three channels, layered perspective
const Channels: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const adAt = c("ads", 30);
  const mailAt = c("email", 110);
  const postAt = c("post", 170);
  const card = (at: number, x: number, y: number, rot: number): React.CSSProperties => {
    const p = interpolate(f, [at, at + 18], [0, 1], { ...clamp, easing: EASE_IO });
    return { position: "absolute", left: x, top: y, width: 560, opacity: p, translate: `${(1 - p) * 120}px ${(1 - p) * 40}px`, rotate: `${rot * p}deg`, filter: `blur(${(1 - p) * 8}px)` };
  };
  return (
    <Stage>
      <StepTag n={6} />
      <div style={{ ...card(adAt, 90, 400, -3) }}>
        <Window title="Audiences">
          <div style={{ padding: "22px 24px" }}>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal }}>Uploaded audience · 640 people</div>
            <div style={{ display: "flex", gap: 22, marginTop: 18, alignItems: "center" }}>
              <Logo src="linkedin.svg" h={52} />
              <Logo src="google-ads.svg" h={52} />
              <Logo src="meta.svg" h={36} />
            </div>
          </div>
        </Window>
      </div>
      <div style={{ ...card(mailAt, 430, 700, 2) }}>
        <Window title="New message">
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Logo src="gmail.svg" h={30} />
              <span style={{ fontFamily: BODY, fontSize: 20, color: MUTED }}>To: riya@northwind.co</span>
            </div>
            <div style={{ fontFamily: BODY, fontSize: 24, lineHeight: 1.45, color: C.charcoal, marginTop: 14, minHeight: 110 }}>{typed(f, "Hi Riya, saw Northwind is launching a new range. Quick idea on repeat orders?", mailAt + 6, 1.6)}</div>
          </div>
        </Window>
      </div>
      <div style={{ ...card(postAt, 130, 1010, -1.5) }}>
        <Window title="LinkedIn · post">
          <div style={{ padding: "20px 24px", display: "flex", gap: 16 }}>
            <Logo src="linkedin.svg" h={46} />
            <div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, color: C.charcoal }}>3 emails every D2C brand should send after the first order</div>
              <div style={{ fontFamily: BODY, fontSize: 19, color: MUTED, marginTop: 8 }}>Scheduled · every Tuesday</div>
            </div>
          </div>
        </Window>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ 7. signals: notification stack + Claude draft
const Signals: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const sigs = [
    { logo: "gmail.svg", app: "Gmail", t: "Riya Mehta replied", sub: "“Sounds interesting, tell me more”", cue: "replied" },
    { logo: "google-ads.svg", app: "Google Ads", t: "Northwind clicked your ad", sub: "Repeat-order guide", cue: "clicked" },
    { logo: "linkedin.svg", app: "LinkedIn", t: "Arjun Rao viewed your profile", sub: "CMO at Lumen Skin", cue: "viewed" },
  ];
  const draft = c("follow", 120);
  return (
    <Stage>
      <StepTag n={7} />
      {sigs.map((s, i) => {
        const at = c(s.cue, 30 + i * 30);
        return (
          <div key={s.t} style={{ position: "absolute", left: 100, right: 100, top: 400 + i * 150, ...rise(f, at, -30) }}>
            <div style={{ display: "flex", gap: 18, alignItems: "center", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", borderRadius: 26, border: `1px solid ${LINE}`, padding: "20px 22px", boxShadow: "0 24px 60px rgba(10,10,10,0.10)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "white", border: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Logo src={s.logo} h={40} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontSize: 18, color: MUTED }}>
                  <span>{s.app}</span>
                  <span>now</span>
                </div>
                <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.charcoal }}>{s.t}</div>
                <div style={{ fontFamily: BODY, fontSize: 21, color: MUTED }}>{s.sub}</div>
              </div>
            </div>
          </div>
        );
      })}
      <Window title="Claude Code · follow-up draft" style={{ left: 100, right: 100, top: 900, ...rise(f, draft, 40) }}>
        <div style={{ padding: "20px 24px", display: "flex", gap: 16 }}>
          <Logo src="claude.svg" h={40} />
          <div style={{ fontFamily: BODY, fontSize: 25, lineHeight: 1.45, color: C.charcoal }}>{typed(f, "Arjun, saw you checked out the repeat-order guide. Want the 3 emails that worked for Northwind?", draft + 6, 1.7)}</div>
        </div>
      </Window>
    </Stage>
  );
};

// ------------------------------------------------------------------ 8. CRM board + approval
const Crm: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const cols = ["New lead", "Replied", "Call booked"];
  const cards = [
    { col: 0, t: "Lumen Skin", at: 10 },
    { col: 0, t: "Kite Apparel", at: 16 },
    { col: 1, t: "Northwind Goods", at: 30 },
    { col: 2, t: "Northwind · Thu 4 PM", at: 50 },
  ];
  const appr = c("approve", 110);
  const s = sp(f, appr, { damping: 12, stiffness: 200 });
  return (
    <Stage>
      <StepTag n={8} />
      <Window title="HubSpot · Deals" style={{ left: 70, right: 70, top: 400, height: 560, ...rise(f, 0, 40) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 22px", borderBottom: `1px solid ${LINE}` }}>
          <Logo src="hubspot.svg" h={30} />
        </div>
        <div style={{ display: "flex", gap: 14, padding: 18 }}>
          {cols.map((cl, i) => (
            <div key={cl} style={{ flex: 1, background: "#F6F4ED", borderRadius: 14, padding: 12, minHeight: 380 }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 20, color: "#55534C" }}>{cl}</div>
              {cards
                .filter((k) => k.col === i)
                .map((k) => (
                  <div key={k.t} style={{ marginTop: 12, background: "white", borderRadius: 12, padding: "12px 12px", fontFamily: BODY, fontWeight: 700, fontSize: 19, color: i === 2 ? INK : C.charcoal, border: i === 2 ? `2px solid ${C.lime}` : `1px solid ${LINE}`, ...rise(f, k.at, 16) }}>
                    {k.t}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </Window>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, display: "flex", justifyContent: "center", ...rise(f, appr - 14, 20) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "white", border: `1px solid ${LINE}`, borderRadius: 22, padding: "16px 22px", boxShadow: "0 30px 70px rgba(10,10,10,0.12)" }}>
          <div style={{ fontFamily: BODY, fontSize: 22, color: C.charcoal }}>Send 12 emails?</div>
          <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 22, borderRadius: 12, padding: "10px 20px", background: f >= appr ? C.lime : C.charcoal, color: f >= appr ? C.charcoal : C.cream, scale: String(f >= appr ? 1 + 0.06 * (1 - s) : 1) }}>{f >= appr ? "Approved" : "Approve"}</div>
        </div>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ finale: the system map
const Finale: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const nodes = [
    { logo: "apollo.svg", a: -150 },
    { logo: "gmail.svg", a: -90 },
    { logo: "hubspot.svg", a: -30 },
    { logo: "linkedin.svg", a: 30 },
    { logo: "google-ads.svg", a: 90 },
    { logo: "meta.svg", a: 150 },
  ];
  const R = 330;
  const cy = 820;
  const rot = f / 9;
  return (
    <Stage push={0.04}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={cy} r={R} fill="none" stroke="#D9D6CC" strokeWidth={1.5} strokeDasharray="3 10" />
        {nodes.map((n, i) => {
          const a = ((n.a + rot) * Math.PI) / 180;
          const p = interpolate(f, [6 + i * 4, 20 + i * 4], [0, 1], clamp);
          const x = 540 + Math.cos(a) * R * p;
          const y = cy + Math.sin(a) * R * p;
          const pulse = ((f / 30) * 0.8 + i / 6) % 1;
          return (
            <g key={n.logo}>
              <line x1={540} y1={cy} x2={x} y2={y} stroke={INK} strokeWidth={2} opacity={0.35} />
              <circle cx={540 + (x - 540) * pulse} cy={cy + (y - cy) * pulse} r={5} fill={INK} opacity={0.8} />
            </g>
          );
        })}
      </svg>
      {nodes.map((n, i) => {
        const a = ((n.a + rot) * Math.PI) / 180;
        const p = interpolate(f, [6 + i * 4, 20 + i * 4], [0, 1], { ...clamp, easing: EASE });
        return (
          <div key={n.logo} style={{ position: "absolute", left: 540 + Math.cos(a) * R * p - 62, top: cy + Math.sin(a) * R * p - 62, width: 124, height: 124, borderRadius: 30, background: "white", border: `1px solid ${LINE}`, boxShadow: "0 20px 50px rgba(10,10,10,0.10)", display: "flex", alignItems: "center", justifyContent: "center", opacity: p }}>
            <Logo src={n.logo} h={n.logo === "hubspot.svg" ? 28 : 58} style={{ maxWidth: 96 }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 540 - 100, top: cy - 100, width: 200, height: 200, borderRadius: 52, background: "white", border: `2px solid ${C.lime}`, boxShadow: "0 0 0 14px rgba(167,255,63,0.18), 0 40px 90px rgba(217,119,87,0.22)", display: "flex", alignItems: "center", justifyContent: "center", ...rise(f, 0, 20) }}>
        <Logo src="claude.svg" h={110} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1230, textAlign: "center", fontFamily: SERIF, fontSize: 70, color: C.charcoal, ...rise(f, c("comment", 60), 20) }}>
        Comment <span style={{ fontFamily: HEAD, fontWeight: 700, background: C.lime, padding: "0 16px", borderRadius: 12 }}>SALES</span>
      </div>
    </Stage>
  );
};

export const SalesTeamScene: React.FC<SceneProps> = ({ data }) => {
  const c = cueOf(data);
  const b = data.beat as string;
  if (b === "hook") return <Hook c={c} />;
  if (b === "tools") return <Tools c={c} />;
  if (b === "icp") return <Icp c={c} />;
  if (b === "funnel") return <Funnel data={data} c={c} />;
  if (b === "channels") return <Channels c={c} />;
  if (b === "signals") return <Signals c={c} />;
  if (b === "crm") return <Crm c={c} />;
  return <Finale c={c} />;
};

export const SALES_TEAM_SCENES: Record<string, React.FC<SceneProps>> = { sTeam: SalesTeamScene };
