// "PHP2Shell" news reel (9:16, light + one charcoal twist). Built on the reusable world camera.
import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import { Check, Cursor, ez, Icon, INK, LINE, Logo, MUTED, pop, rise, Selection, Tile, typed } from "./duet";
import type { BeatProps } from "./duet";
import { makeWorldScene } from "./world";
import type { SceneProps } from "./scenes";

const SHADOW = "0 34px 90px rgba(30,28,20,0.13), 0 3px 10px rgba(30,28,20,0.05)";
const card = (dark: boolean): React.CSSProperties => ({ position: "absolute", background: dark ? "#16130F" : "white", border: `1px solid ${dark ? "#2A2620" : LINE}`, borderRadius: 30, boxShadow: SHADOW });

// 0. hook: grid of sites turns red, one gov site goes OFFLINE
const Hook: React.FC<BeatProps> = ({ f, c }) => {
  const bug = c("bug", 51);
  const sel = ez(f, bug + 2, bug + 16);
  const net = c("internet", 133);
  const off = c("offline", 216);
  const cols = 9;
  const rows = 8;
  const total = cols * rows;
  const litTo = Math.round(interpolate(f, [net - 10, net + 24], [0, total * 0.7], { ...clamp, easing: EASE }));
  const pct = Math.round(interpolate(f, [net - 10, net + 24], [0, 70], { ...clamp, easing: EASE }));
  return (
    <>
      <div style={{ position: "absolute", left: 90, right: 70, top: 300, color: C.charcoal }}>
        <div style={{ fontFamily: BODY, fontSize: 28, fontWeight: 700, color: INK, letterSpacing: 1 }}>BREAKING · AI SECURITY</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 96, letterSpacing: -4, lineHeight: 1.02, marginTop: 14 }}>
          70% of the internet<br />had a hidden{" "}
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 108 }}>
            <Selection p={sel}>bug</Selection>
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 640, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, ...rise(f, 6, 40) }}>
        {new Array(total).fill(0).map((_, k) => {
          const lit = k < litTo;
          const govCell = k === 40;
          return (
            <div key={k} style={{ aspectRatio: "3 / 2", borderRadius: 10, background: lit ? "#E8694A" : "white", border: `1px solid ${govCell ? C.lime : lit ? "#D9533A" : LINE}`, boxShadow: govCell ? `0 0 0 3px ${C.lime}` : "0 6px 16px rgba(30,28,20,0.06)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ width: "60%", height: 4, borderRadius: 2, background: lit ? "rgba(255,255,255,0.7)" : "#E2DED3" }} />
              {govCell && f >= off ? (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", scale: String(pop(f, off)) }}>
                  <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 15, background: C.charcoal, color: C.cream, padding: "2px 7px", borderRadius: 5, letterSpacing: 1, rotate: "-8deg" }}>OFFLINE</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 90, top: 1200, display: "flex", alignItems: "baseline", gap: 16, ...rise(f, net - 6, 20) }}>
        <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 150, letterSpacing: -6, color: "#E8694A", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, color: MUTED }}>of all websites<br />run the affected code</div>
      </div>
    </>
  );
};

// 1. what it is: PHP runs WordPress, shops, gov
const What: React.FC<BeatProps> = ({ f, c }) => {
  const nodes = [
    { logo: "wordpress.svg", label: "WordPress", cue: c("wp", 73), hh: 70, a: -140 },
    { k: "shop", label: "Online shops", cue: c("shops", 115), a: 0 },
    { k: "gov", label: "Government", cue: c("gov", 143), a: 140 },
  ];
  const R = 360;
  const CY = 980;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", ...rise(f, 2, 20) }}>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, color: MUTED }}>The code is called</div>
      </div>
      <div style={{ position: "absolute", left: 540 - 150, top: 440, width: 300, height: 170, ...rise(f, c("php", 16) - 4, 30) }}>
        <Tile size={300} style={{ borderRadius: 40, width: 300, height: 170 }}>
          <Logo src="php.svg" h={110} />
        </Tile>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {nodes.map((n) => {
          const a = (n.a * Math.PI) / 180;
          const x = 540 + Math.sin(a) * R * 0.78;
          const y = CY + 90 - Math.cos(a) * 0 + (n.a === 0 ? 320 : 180);
          const p = ez(f, n.cue, n.cue + 14);
          return <path key={n.label} d={`M540 620 C 540 ${720}, ${x} ${y - 120}, ${x} ${y - 40}`} stroke={INK} strokeWidth={2.5} fill="none" opacity={0.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
        })}
      </svg>
      {nodes.map((n) => {
        const a = (n.a * Math.PI) / 180;
        const x = 540 + Math.sin(a) * R * 0.78;
        const y = CY + 90 + (n.a === 0 ? 320 : 180);
        return (
          <div key={n.label} style={{ position: "absolute", left: x - 130, top: y - 40, width: 260, textAlign: "center", ...rise(f, n.cue, 24) }}>
            <Tile size={150} style={{ margin: "0 auto" }}>
              {n.logo ? <Logo src={n.logo} h={n.hh} /> : n.k === "shop" ? <Icon kind="pay" size={72} /> : <ShieldGlyph size={76} />}
            </Tile>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 27, color: C.charcoal, marginTop: 14 }}>{n.label}</div>
          </div>
        );
      })}
    </>
  );
};
const ShieldGlyph: React.FC<{ size: number; color?: string }> = ({ size, color = C.charcoal }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z" fill="none" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 2. danger: bypass login, leak secrets, severity 9.2
const Danger: React.FC<BeatProps> = ({ f, c }) => {
  const login = c("login", 87);
  const pw = c("pw", 124);
  const bypass = ez(f, login, login + 16);
  const sev = Math.min(9.2, interpolate(f, [c("flaws", 12), c("flaws", 12) + 40], [0, 9.2], clamp));
  const leaks = ["password", "API key", "token"];
  return (
    <>
      <div style={{ ...card(false), left: 110, right: 110, top: 380, height: 520, overflow: "hidden" }}>
        <div style={{ height: 60, background: "#F3F1EA", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 10, padding: "0 22px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((cl) => (
            <div key={cl} style={{ width: 13, height: 13, borderRadius: "50%", background: cl }} />
          ))}
          <div style={{ marginLeft: 12, fontFamily: MONO, fontSize: 18, color: MUTED }}>yoursite.com</div>
        </div>
        <div style={{ padding: "34px 40px" }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.charcoal }}>Log in</div>
          <div style={{ marginTop: 22, height: 70, borderRadius: 14, border: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 20px", fontFamily: BODY, fontSize: 24, color: MUTED }}>admin</div>
          <div style={{ marginTop: 16, height: 70, borderRadius: 14, border: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 20px", fontFamily: BODY, fontSize: 24, color: MUTED, letterSpacing: 6 }}>••••••••</div>
          {/* attacker skips straight past the login */}
          <div style={{ position: "absolute", left: 40, right: 40, top: 300, display: "flex", alignItems: "center", gap: 16, opacity: bypass }}>
            <div style={{ flex: 1, height: 3, background: INK, transformOrigin: "0 50%", transform: `scaleX(${bypass})` }} />
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 24, color: INK, whiteSpace: "nowrap" }}>no login needed</div>
          </div>
          <div style={{ position: "absolute", left: 160, top: 250, opacity: bypass, translate: `${bypass * 420}px ${bypass * 40}px`, rotate: `${bypass * 8}deg` }}>
            <ShieldBroken size={120} p={bypass} />
          </div>
        </div>
      </div>
      {/* secrets leak out */}
      {leaks.map((t, i) => {
        const at = pw + i * 7;
        const p = ez(f, at, at + 18, 0, 1, EASE_IO);
        return (
          <div key={t} style={{ position: "absolute", left: 540 - 120, top: 940, translate: `${(i - 1) * 300 * p}px ${-p * 40 - 20}px`, opacity: p * (1 - ez(f, at + 24, at + 40)), width: 240, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "white", border: `1px solid ${LINE}`, borderRadius: 14, padding: "12px 18px", boxShadow: SHADOW, fontFamily: MONO, fontSize: 22, color: C.charcoal }}>
              <Icon kind="skills" size={24} color={INK} /> {t}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center", ...rise(f, c("flaws", 12), 20) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "white", border: `2px solid #E8694A`, borderRadius: 22, padding: "18px 28px", boxShadow: SHADOW }}>
          <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 70, letterSpacing: -2, color: "#E8694A", fontVariantNumeric: "tabular-nums" }}>{sev.toFixed(1)}</div>
          <div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 26, color: C.charcoal }}>CRITICAL</div>
            <div style={{ fontFamily: BODY, fontSize: 20, color: MUTED }}>severity out of 10</div>
          </div>
        </div>
      </div>
    </>
  );
};
const ShieldBroken: React.FC<{ size: number; p: number }> = ({ size, p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z" fill="#FDECE7" stroke="#E8694A" strokeWidth={1.7} strokeLinejoin="round" />
    <path d={`M12 3 L${11 - p * 1.5} 10 L${13 + p} 13 L${11 - p} 21`} fill="none" stroke="#E8694A" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

// 3. AI found it: OpenAI + Wiz, race bar
const Found: React.FC<BeatProps> = ({ f, c }) => {
  const one = c("one", 118);
  const teamW = ez(f, one + 6, one + 34, 0, 1, EASE_IO);
  const aiW = ez(f, c("week", 158), c("week", 158) + 16, 0, 1, EASE_IO);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", ...rise(f, 2, 18) }}>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, color: MUTED }}>Found with AI by researchers at</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 430, display: "flex", justifyContent: "center", gap: 26 }}>
        {[
          { logo: "openai.svg", cue: c("openai", 60), h: 54 },
          { logo: "wiz.svg", cue: c("wiz", 90), h: 40 },
        ].map((x) => (
          <div key={x.logo} style={{ scale: String(pop(f, x.cue - 4)), opacity: f >= x.cue - 4 ? 1 : 0 }}>
            <div style={{ background: "white", border: `1px solid ${LINE}`, borderRadius: 24, padding: "24px 40px", boxShadow: SHADOW, display: "flex", alignItems: "center", height: 96 }}>
              <Logo src={x.logo} h={x.h} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 100, right: 100, top: 700 }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: MUTED, marginBottom: 16, ...rise(f, one - 4, 14) }}>Time to crack it</div>
        {[
          { label: "A world-class team", unit: "months", w: teamW, col: "#CFCBBE", txt: C.charcoal },
          { label: "1 researcher + AI", unit: "1 week", w: aiW, col: C.lime, txt: C.charcoal },
        ].map((r, i) => (
          <div key={r.label} style={{ marginTop: 22, ...rise(f, (i ? c("week", 158) : one) - 4, 16) }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontWeight: 700, fontSize: 25, color: C.charcoal }}>
              <span>{r.label}</span>
              <span style={{ color: i ? INK : MUTED }}>{r.unit}</span>
            </div>
            <div style={{ height: 40, borderRadius: 12, background: "#EEEBE2", marginTop: 10, overflow: "hidden" }}>
              <div style={{ width: `${(i ? 0.14 : 1) * 100 * r.w}%`, height: "100%", background: r.col, borderRadius: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// 4. twist (dark): if AI can find it, attackers can too; Europe offline
const Twist: React.FC<BeatProps & { dark: boolean }> = ({ f, c }) => {
  const flags = [
    { k: "flag-fr.svg", name: "France", x: 300, y: 760, cue: c("dutch", 130) - 24 },
    { k: "flag-dk.svg", name: "Denmark", x: 760, y: 700, cue: c("dutch", 130) - 14 },
    { k: "flag-fi.svg", name: "Finland", x: 840, y: 940, cue: c("dutch", 130) - 4 },
    { k: "flag-nl.svg", name: "Netherlands", x: 540, y: 900, cue: c("dutch", 130) + 6, star: true },
    { k: "flag-uk.svg", name: "UK", x: 250, y: 980, cue: c("dutch", 130) + 16 },
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 90, right: 90, top: 330, color: C.cream }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: C.lime, ...rise(f, c("scary", 9), 20) }}>The scary part?</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 72, letterSpacing: -2, lineHeight: 1.05, marginTop: 16, ...rise(f, c("attackers", 79) - 6, 30) }}>
          If AI can find it,<br />attackers can too.
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {flags.map((fl) => (
          <line key={fl.name} x1={540} y1={620} x2={fl.x} y2={fl.y} stroke={C.lime} strokeWidth={1.5} opacity={0.25 * ez(f, fl.cue, fl.cue + 10)} />
        ))}
      </svg>
      {flags.map((fl) => (
        <div key={fl.name} style={{ position: "absolute", left: fl.x - 90, top: fl.y - 60, width: 180, textAlign: "center", scale: String(pop(f, fl.cue)), opacity: f >= fl.cue ? 1 : 0 }}>
          <div style={{ position: "relative", width: 150, height: 100, margin: "0 auto", borderRadius: 14, overflow: "hidden", border: fl.star ? `3px solid ${C.lime}` : "1px solid rgba(255,255,255,0.15)", boxShadow: "0 18px 40px rgba(0,0,0,0.4)" }}>
            <Img src={staticFile(`media/logos/${fl.k}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.35)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 20, background: C.charcoal, color: C.cream, padding: "3px 10px", borderRadius: 6, letterSpacing: 1, rotate: "-6deg" }}>OFFLINE</div>
            </div>
          </div>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 22, color: fl.star ? C.lime : C.cream, marginTop: 10 }}>{fl.name}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 90, right: 90, top: 1480, textAlign: "center", fontFamily: BODY, fontSize: 24, color: "rgba(246,244,237,0.7)", ...rise(f, c("dutch", 130) + 20, 16) }}>
        Even the Dutch cyber security agency took its own site offline
      </div>
    </>
  );
};

// 5. do this today: ask your host, versions, WP != PHP
const Todo: React.FC<BeatProps> = ({ f, c }) => {
  const host = c("host", 57);
  const patched = c("patched", 111);
  const only = c("only", 201);
  const versions = ["8.5.12", "8.4.27", "8.3.36", "8.2.35"];
  return (
    <>
      <div style={{ position: "absolute", left: 90, right: 90, top: 330, fontFamily: HEAD, fontWeight: 700, fontSize: 60, letterSpacing: -2, color: C.charcoal, lineHeight: 1.05, ...rise(f, 2, 20) }}>
        Own a website?<br />Do this <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: INK }}>today.</span>
      </div>
      <div style={{ ...card(false), left: 110, right: 110, top: 520, padding: "22px 26px", ...rise(f, host - 4, 30) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <Icon kind="send" size={30} color={INK} />
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, color: C.charcoal }}>Message to your host</div>
        </div>
        <div style={{ background: "#F6F4ED", borderRadius: 16, padding: "18px 20px", fontFamily: BODY, fontSize: 26, lineHeight: 1.4, color: C.charcoal, minHeight: 90 }}>
          {typed(f, "Is our PHP patched against PHP2Shell (CVE-2026-109618/19)?", host + 8, 1.9)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 110, right: 110, top: 800, ...rise(f, patched - 4, 20) }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, color: MUTED, marginBottom: 14 }}>Safe PHP versions</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {versions.map((v, i) => {
            const at = patched + 4 + i * 6;
            return (
              <div key={v} style={{ display: "flex", alignItems: "center", gap: 10, background: "white", border: `1px solid ${LINE}`, borderRadius: 14, padding: "12px 18px", boxShadow: "0 8px 20px rgba(30,28,20,0.06)", ...rise(f, at, 14) }}>
                <Check p={ez(f, at, at + 8)} size={28} />
                <span style={{ fontFamily: MONO, fontSize: 26, color: C.charcoal }}>{v}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...card(false), left: 110, right: 110, top: 1010, padding: "24px 26px", display: "flex", alignItems: "center", gap: 18, border: `2px solid ${C.lime}`, ...rise(f, only - 6, 24) }}>
        <Logo src="wordpress.svg" h={48} />
        <div style={{ flex: 1, fontFamily: BODY, fontSize: 27, fontWeight: 600, color: C.charcoal }}>
          A WordPress update <span style={{ color: "#E8694A", fontWeight: 800 }}>won't</span> fix this. Only your host can.
        </div>
      </div>
    </>
  );
};

// 6. CTA
const Cta: React.FC<BeatProps> = ({ f, c }) => {
  const patch = c("patch", 16);
  const typeAt = patch - 40;
  const dm = c("message", 102);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontFamily: SERIF, fontSize: 70, color: C.charcoal, ...rise(f, 4, 20) }}>
        Keep your site{" "}
        <span style={{ fontFamily: HEAD, fontWeight: 700, background: C.lime, padding: "0 16px", borderRadius: 12 }}>safe</span>
      </div>
      <div style={{ ...card(false), left: 110, right: 110, top: 620, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18, ...rise(f, typeAt, 30) }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: C.charcoal, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 20, color: C.lime }}>You</div>
        <div style={{ flex: 1, fontFamily: BODY, fontSize: 30, color: C.charcoal }}>
          {typed(f, "PATCH", typeAt + 6, 0.5) || <span style={{ color: MUTED }}>Add a comment…</span>}
          {f > typeAt + 6 && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: INK }}>|</span> : null}
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 26, color: f > patch ? INK : MUTED }}>Post</div>
      </div>
      <div style={{ ...card(false), left: 110, right: 110, top: 760, padding: "22px 24px", display: "flex", gap: 16, ...rise(f, dm, 40) }}>
        <Tile size={66}>
          <Icon kind="send" size={34} color={INK} />
        </Tile>
        <div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 24, color: C.charcoal }}>kanishk.rewires</div>
          <div style={{ fontFamily: BODY, fontSize: 25, color: MUTED, marginTop: 4 }}>The 2-minute PHP check + the exact host message</div>
        </div>
      </div>
      {f > patch - 20 ? <Cursor x={interpolate(ez(f, patch - 20, patch, 0, 1, EASE_IO), [0, 1], [900, 880])} y={interpolate(ez(f, patch - 20, patch, 0, 1, EASE_IO), [0, 1], [1100, 690])} press={ez(f, patch, patch + 12)} /> : null}
    </>
  );
};

export const PHP2SHELL_SCENES: Record<string, React.FC<SceneProps>> = {
  dPhp: makeWorldScene({
    order: ["hook", "what", "danger", "found", "twist", "todo", "cta"],
    beats: { hook: Hook, what: What, danger: Danger, found: Found, twist: Twist, todo: Todo, cta: Cta },
    dark: ["twist"],
    positions: [
      [0, 0],
      [1500, -300],
      [3000, 150],
      [1700, 1900],
      [3300, 2250],
      [4900, 1850],
      [6400, 2300],
    ],
  }),
};
