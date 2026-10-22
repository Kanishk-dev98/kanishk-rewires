// PHP2Shell v2: one fixed frame, one hero object per act that transforms in place (shared-element morphs),
// a shaded sphere iris for the charcoal twist, top headline captions. No camera flights, threads or particles.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";

const INK = "#3E7A00";
const MUTED = "#8A877E";
const LINE = "#E4E0D5";
const CORAL = "#E25C3B";
const SH = "0 40px 100px rgba(30,28,20,0.14), 0 2px 8px rgba(30,28,20,0.05)";
const e = (g: number, a: number, b: number, from = 0, to = 1, ease = EASE) => interpolate(g, [a, b], [from, to], { ...clamp, easing: ease });
const L: React.FC<{ src: string; h: number; style?: React.CSSProperties }> = ({ src, h, style }) => <Img src={staticFile(`media/logos/${src}`)} style={{ height: h, width: "auto", ...style }} />;
const typed = (g: number, s: string, at: number, cps = 1.6) => s.slice(0, Math.max(0, Math.floor((g - at) * cps)));

const CODE: [string, string][] = [
  ["2019", "static void request_shutdown(void)"],
  ["2019", "{"],
  ["2021", "    flush_output_buffers();"],
  ["2016", "    if (error_type == E_OUT_OF_MEMORY) {"],
  ["2016", "        reuse_worker_state();"],
  ["2016", "    }"],
  ["2022", "    release_request_memory();"],
  ["2020", "    log_request_end();"],
  ["2019", "}"],
  ["2023", ""],
  ["2023", "static void worker_loop(void)"],
  ["2023", "{"],
  ["2024", "    while (next_request()) handle();"],
  ["2023", "}"],
];
const BUG = 4; // highlighted line (illustrative)

export const PhpFilm: React.FC<SceneProps> = ({ data }) => {
  const f = useCurrentFrame();
  const w = data._world as { i: number; starts: number[]; durs: number[]; cues: Record<string, number>[] };
  const g = w.starts[w.i] + f;
  const T = (j: number, n: string, fb: number) => w.starts[j] + (w.cues[j]?.[n] ?? fb);
  const S = (j: number) => w.starts[j];

  // act boundaries (global frames)
  const tBug = T(0, "bug", 51);
  const tNet = T(0, "internet", 133);
  const tGov = T(0, "gov", 165);
  const tOff = T(0, "offline", 216);
  const tWhat = S(1);
  const tDanger = S(2);
  const tTwist = S(4);
  const tTodo = S(5);
  const tCta = S(6);

  // twist iris: charcoal sphere in, cream sphere back
  const irisIn = e(g, tTwist + 2, tTwist + 22, 0, 1, EASE_IO);
  const irisOut = e(g, tTodo + 2, tTodo + 22, 0, 1, EASE_IO);
  const dark = g >= tTwist + 12 && g < tTodo + 12;

  // ---------------- act 1: editor → ring → unavailable page
  const edIn = e(g, 4, 24);
  const scan = e(g, tBug - 26, tBug + 6, 0, 1, EASE_IO);
  const hl = e(g, tBug + 2, tBug + 14);
  const toRing = e(g, tNet - 24, tNet - 4, 0, 1, EASE_IO);
  const pct = Math.round(e(g, tNet - 6, tNet + 26) * 70);
  const toPage = e(g, tGov - 6, tGov + 14, 0, 1, EASE_IO);
  const actOneOut = e(g, tWhat - 4, tWhat + 14, 0, 1, EASE_IO);

  // ---------------- act 2: three sites
  const sites = [
    { k: "Blog", logo: "wordpress.svg", at: T(1, "wp", 73) },
    { k: "Shop checkout", at: T(1, "shops", 115) },
    { k: "Public services", at: T(1, "gov", 143) },
  ];
  const sitesIn = e(g, tWhat + 2, tWhat + 20, 0, 1, EASE_IO);
  const toAdvisory = e(g, tDanger - 2, tDanger + 18, 0, 1, EASE_IO);

  // ---------------- act 3/4: advisory card
  const advIn = toAdvisory;
  const sev = e(g, tDanger + 10, tDanger + 40) * 9.2;
  const rowLogin = e(g, T(2, "login", 87) - 4, T(2, "login", 87) + 10);
  const rowPw = e(g, T(2, "pw", 124) - 4, T(2, "pw", 124) + 10);
  const credit = e(g, T(3, "openai", 60) - 10, T(3, "wiz", 90) + 6, 0, 1, EASE_IO);
  const cal = e(g, T(3, "one", 118) - 6, T(3, "one", 118) + 20);
  const calCollapse = e(g, T(3, "week", 158) - 4, T(3, "week", 158) + 18, 0, 1, EASE_IO);
  const advOut = e(g, tTwist + 4, tTwist + 20, 0, 1, EASE_IO);

  // ---------------- act 5: tabs going unavailable
  const tabs = [
    { flag: "flag-fr.svg", name: "France · public services" },
    { flag: "flag-dk.svg", name: "Denmark · public services" },
    { flag: "flag-fi.svg", name: "Finland · public services" },
    { flag: "flag-uk.svg", name: "UK · government services" },
    { flag: "flag-nl.svg", name: "Netherlands · cyber security agency", star: true },
  ];
  const tDutch = T(4, "dutch", 130);
  const tabsIn = e(g, tTwist + 16, tTwist + 30);
  const tabsOut = e(g, tTodo - 2, tTodo + 14, 0, 1, EASE_IO);

  // ---------------- act 6: hosting panel
  const panelIn = e(g, tTodo + 14, tTodo + 34, 0, 1, EASE_IO);
  const tPatched = T(5, "patched", 111);
  const swap = e(g, tPatched + 4, tPatched + 16);
  const tWp = T(5, "wp", 136);
  const panelOut = e(g, tCta - 2, tCta + 14, 0, 1, EASE_IO);

  // ---------------- act 7: CTA journey
  const ctaIn = e(g, tCta + 4, tCta + 22, 0, 1, EASE_IO);
  const tPatch = T(6, "patch", 16);
  const follow = e(g, tCta + 22, tCta + 30);
  const dm = e(g, T(6, "message", 102) - 6, T(6, "message", 102) + 12, 0, 1, EASE_IO);

  return (
    <AbsoluteFill style={{ background: g >= tTwist + 22 && g < tTodo + 2 ? C.charcoal : C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${dark ? "rgba(246,244,237,0.04)" : "rgba(10,10,10,0.035)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(246,244,237,0.04)" : "rgba(10,10,10,0.035)"} 1px, transparent 1px)`, backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent 80%)" }} />

      {/* ACT 1 — editor (shrinks into the ring) */}
      {g < tWhat + 16 ? (
        <div style={{ position: "absolute", left: 80, top: 620, width: 920, transformOrigin: "460px 330px", transform: `scale(${interpolate(toRing, [0, 1], [1, 0.18])})`, opacity: edIn * (1 - toRing) * (1 - toPage), filter: edIn < 1 ? `blur(${(1 - edIn) * 12}px)` : undefined }}>
          <div style={{ background: "#FFFFFF", borderRadius: 26, border: `1px solid ${LINE}`, boxShadow: SH, overflow: "hidden" }}>
            <div style={{ height: 58, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: "#F3F1EA", borderBottom: `1px solid ${LINE}` }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((cl) => (
                <div key={cl} style={{ width: 13, height: 13, borderRadius: "50%", background: cl }} />
              ))}
              <div style={{ marginLeft: 14, fontFamily: MONO, fontSize: 19, color: MUTED }}>php engine · request lifecycle</div>
              <div style={{ marginLeft: "auto", fontFamily: BODY, fontSize: 16, color: MUTED, border: `1px solid ${LINE}`, borderRadius: 8, padding: "3px 10px" }}>illustrative</div>
            </div>
            <div style={{ position: "relative", padding: "18px 0" }}>
              {CODE.map(([yr, code], i) => {
                const isBug = i === BUG || i === BUG - 1;
                return (
                  <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", height: 40, fontFamily: MONO, fontSize: 22 }}>
                    {isBug ? <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: `rgba(226,92,59,${0.14 * hl})`, borderLeft: `4px solid rgba(226,92,59,${hl})` }} /> : null}
                    <div style={{ width: 70, textAlign: "right", color: "#B9B5A9", paddingRight: 16, position: "relative" }}>{i + 41}</div>
                    <div style={{ width: 80, color: isBug && hl > 0.5 ? CORAL : "#C9C5BA", fontSize: 17, position: "relative" }}>{yr}</div>
                    <div style={{ color: isBug ? "#1A1A1A" : "#55524A", position: "relative", whiteSpace: "pre" }}>{code}</div>
                  </div>
                );
              })}
              {/* x-ray scan line */}
              {scan > 0 && scan < 1 ? <div style={{ position: "absolute", left: 0, right: 0, top: 18 + scan * 40 * (BUG + 0.5), height: 3, background: CORAL, boxShadow: `0 0 24px 6px rgba(226,92,59,0.35)` }} /> : null}
              {hl > 0 ? (
                <div style={{ position: "absolute", right: 24, top: 18 + 40 * (BUG - 1) + 6, opacity: hl, translate: `${(1 - hl) * 20}px 0`, fontFamily: BODY, fontWeight: 700, fontSize: 19, color: "white", background: CORAL, borderRadius: 8, padding: "6px 12px" }}>hidden since 2016</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      {/* ring 70% */}
      {toRing > 0 && g < tWhat + 16 ? (
        <div style={{ position: "absolute", left: 540 - 280, top: 620 + 330 - 280, width: 560, height: 560, opacity: toRing * (1 - toPage) }}>
          <svg width={560} height={560} viewBox="0 0 560 560">
            <circle cx={280} cy={280} r={240} fill="none" stroke={LINE} strokeWidth={22} />
            <circle cx={280} cy={280} r={240} fill="none" stroke={CORAL} strokeWidth={22} strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - pct} transform="rotate(-90 280 280)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <L src="php.svg" h={64} />
            <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 130, letterSpacing: -6, lineHeight: 1, color: C.charcoal, marginTop: 10, fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 24, color: MUTED, marginTop: 6 }}>of websites run on PHP</div>
          </div>
        </div>
      ) : null}
      {/* unavailable page (grows out of the ring) */}
      {toPage > 0 && g < tWhat + 16 ? (
        <div style={{ position: "absolute", left: 100, top: 660, width: 880, transformOrigin: "440px 290px", transform: `scale(${interpolate(toPage, [0, 1], [0.6, 1]) * interpolate(actOneOut, [0, 1], [1, 0.5])})`, opacity: toPage * (1 - actOneOut) }}>
          <Browser url="public-services · portal" dark={false}>
            <div style={{ padding: "54px 50px", height: 420 }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: MUTED, letterSpacing: 1 }}>SERVICE NOTICE</div>
              <div style={{ fontFamily: SERIF, fontSize: 62, lineHeight: 1.05, color: C.charcoal, marginTop: 14 }}>Temporarily unavailable</div>
              <div style={{ fontFamily: BODY, fontSize: 26, lineHeight: 1.45, color: "#55524A", marginTop: 18 }}>This service is offline for urgent security maintenance. Please try again later.</div>
              <div style={{ display: "flex", gap: 12, marginTop: 30, alignItems: "center", opacity: e(g, tOff - 6, tOff + 6) }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: CORAL }} />
                <div style={{ fontFamily: MONO, fontSize: 20, color: CORAL }}>503 · maintenance</div>
              </div>
            </div>
          </Browser>
        </div>
      ) : null}

      {/* ACT 2 — three sites, each runs on PHP */}
      {g >= tWhat - 4 && g < tDanger + 20
        ? sites.map((s, i) => {
            const x = 70 + i * 320;
            const p = e(g, Math.min(s.at, tWhat + 20 + i * 8) - 8, Math.min(s.at, tWhat + 20 + i * 8) + 10);
            const fold = toAdvisory;
            return (
              <div key={s.k} style={{ position: "absolute", left: interpolate(fold, [0, 1], [x, 540 - 140]), top: interpolate(fold, [0, 1], [760, 820]), width: 300, opacity: sitesIn * (1 - fold) , transform: `translateY(${(1 - p) * 40}px) scale(${interpolate(fold, [0, 1], [1, 0.7])})`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined }}>
                <div style={{ background: "white", borderRadius: 20, border: `1px solid ${LINE}`, boxShadow: SH, overflow: "hidden" }}>
                  <div style={{ height: 34, background: "#F3F1EA", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{ width: 8, height: 8, borderRadius: "50%", background: "#D9D6CC" }} />
                    ))}
                  </div>
                  <SiteThumb kind={i} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderTop: `1px solid ${LINE}` }}>
                    <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 20, color: C.charcoal }}>{s.k}</div>
                    <L src="php.svg" h={22} style={{ opacity: p }} />
                  </div>
                </div>
              </div>
            );
          })
        : null}
      {g >= tWhat && g < tDanger + 10 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", opacity: e(g, T(1, "php", 16) - 4, T(1, "php", 16) + 10) * (1 - toAdvisory) }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, fontFamily: BODY, fontSize: 26, color: MUTED }}>
            all running on <L src="php.svg" h={40} />
          </div>
        </div>
      ) : null}

      {/* ACT 3/4 — security advisory */}
      {advIn > 0 && g < tTwist + 22 ? (
        <div style={{ position: "absolute", left: 100, top: 600, width: 880, opacity: advIn * (1 - advOut), transform: `translateY(${(1 - advIn) * 50}px) scale(${1 - advOut * 0.1})` }}>
          <div style={{ background: "white", borderRadius: 26, border: `1px solid ${LINE}`, boxShadow: SH, padding: "34px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 20, letterSpacing: 1.5, color: MUTED }}>SECURITY ADVISORY · 21 OCT 2026</div>
              <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 18, color: "white", background: CORAL, borderRadius: 8, padding: "5px 12px" }}>CRITICAL</div>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 76, lineHeight: 1, color: C.charcoal, marginTop: 18 }}>PHP2Shell</div>
            <div style={{ height: 1, background: LINE, margin: "26px 0 6px" }} />
            <Row k="Severity" v={<span style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 40, color: CORAL, fontVariantNumeric: "tabular-nums" }}>{sev.toFixed(1)} / 10</span>} />
            <Row k="Login needed to attack" v={<b style={{ color: CORAL }}>No</b>} hl={rowLogin} />
            <Row k="Data at risk" v={<b>Stored passwords & keys</b>} hl={rowPw} />
            <Row
              k="Found by"
              v={
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 16 }}>
                  <span style={{ position: "absolute", left: -8, right: -8, top: 4, bottom: 4, background: "rgba(167,255,63,0.55)", clipPath: `inset(0 ${(1 - credit) * 100}% 0 0)`, borderRadius: 6 }} />
                  <span style={{ position: "relative" }}>Calif</span>
                  <L src="openai.svg" h={30} style={{ position: "relative", opacity: e(g, T(3, "openai", 60) - 4, T(3, "openai", 60) + 8) }} />
                  <L src="wiz.svg" h={24} style={{ position: "relative", opacity: e(g, T(3, "wiz", 90) - 4, T(3, "wiz", 90) + 8) }} />
                </span>
              }
            />
            {/* calendar: 90 days by hand -> 7 days with AI */}
            <div style={{ marginTop: 22, opacity: cal, height: 190 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontWeight: 700, fontSize: 21, color: calCollapse > 0.5 ? INK : MUTED }}>
                <span>{calCollapse > 0.5 ? "1 researcher + AI" : "A world-class team, by hand"}</span>
                <span>{calCollapse > 0.5 ? "1 week" : "months"}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, width: 800 }}>
                {new Array(90).fill(0).map((_, k) => {
                  const keep = k < 7;
                  const filled = e(g, T(3, "one", 118) + k * 0.35, T(3, "one", 118) + k * 0.35 + 6);
                  return <div key={k} style={{ width: 20, height: 20, borderRadius: 4, background: keep && calCollapse > 0.3 ? C.lime : filled > 0.5 ? "#CFCBBE" : "#EEEBE2", opacity: keep ? 1 : 1 - calCollapse, transform: `scale(${keep ? 1 + calCollapse * 0.6 : 1 - calCollapse})` }} />;
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ACT 5 — tabs going unavailable (dark) */}
      {tabsIn > 0 && g < tTodo + 16 ? (
        <div style={{ position: "absolute", left: 90, top: 640, width: 900, opacity: tabsIn * (1 - tabsOut), transformOrigin: "450px 300px", transform: `scale(${1 + e(g, tTwist + 20, tTodo) * 0.07}) translateY(${-e(g, tTwist + 20, tTodo) * 30}px)` }}>
          {tabs.map((t, i) => {
            const at = i < 4 ? tTwist + 24 + i * 14 : tDutch;
            const p = e(g, at, at + 12);
            const gone = e(g, at + 8, at + 20);
            const big = t.star ? e(g, tDutch + 4, tDutch + 22, 0, 1, EASE_IO) : 0;
            return (
              <div key={t.name} style={{ marginTop: i ? 14 : 0, opacity: p, transform: `translateX(${(1 - p) * 40}px)`, background: t.star ? `rgba(167,255,63,${0.06 + 0.06 * big})` : "rgba(246,244,237,0.05)", border: `1px solid ${t.star && big > 0.2 ? C.lime : "rgba(246,244,237,0.12)"}`, boxShadow: t.star && big > 0.5 ? `0 0 ${30 + 16 * Math.sin(g / 7)}px rgba(167,255,63,${0.18 + 0.1 * Math.sin(g / 7)})` : undefined, borderRadius: 18, padding: `${18 + big * 22}px 22px`, display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
                <div style={{ width: 54, height: 36, borderRadius: 6, overflow: "hidden", filter: `grayscale(${gone})`, flex: "none" }}>
                  <Img src={staticFile(`media/logos/${t.flag}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 25 + big * 4, color: C.cream, opacity: 1 - gone * 0.35 }}>{t.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 18, color: gone > 0.5 ? "#F0A08B" : "rgba(246,244,237,0.5)", marginTop: 4 }}>{gone > 0.5 ? "temporarily unavailable" : "loading…"}</div>
                </div>
                {t.star && big > 0 ? (
                  <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.charcoal, background: C.lime, padding: "8px 16px", borderRadius: 8, transform: `rotate(-6deg) scale(${interpolate(big, [0, 0.6, 1], [1.8, 0.92, 1])})`, opacity: big }}>OFFLINE</div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ACT 6 — hosting panel */}
      {panelIn > 0 && g < tCta + 16 ? (
        <div style={{ position: "absolute", left: 100, top: 660, width: 880, opacity: panelIn * (1 - panelOut), transform: `translateY(${(1 - panelIn) * 40}px)` }}>
          <div style={{ background: "white", borderRadius: 26, border: `1px solid ${LINE}`, boxShadow: SH, padding: "30px 36px" }}>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 20, letterSpacing: 1.5, color: MUTED }}>HOSTING · SERVER SETTINGS</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.charcoal }}>PHP version</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, border: `2px solid ${swap > 0.5 ? C.lime : LINE}`, borderRadius: 14, padding: "12px 18px", background: swap > 0.5 ? "rgba(167,255,63,0.12)" : "white" }}>
                <span style={{ fontFamily: MONO, fontSize: 28, color: C.charcoal }}>{swap > 0.5 ? "8.3.36" : "8.3.12"}</span>
                <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 20, color: swap > 0.5 ? INK : CORAL }}>{swap > 0.5 ? "Patched" : "Vulnerable"}</span>
              </div>
            </div>
            <div style={{ height: 1, background: LINE, margin: "24px 0" }} />
            <div style={{ fontFamily: BODY, fontSize: 21, color: MUTED }}>Message to your host</div>
            <div style={{ marginTop: 10, background: "#F6F4ED", borderRadius: 16, padding: "18px 20px", fontFamily: BODY, fontSize: 26, lineHeight: 1.4, color: C.charcoal, minHeight: 80 }}>{typed(g, "Hi, is our PHP patched against PHP2Shell?", T(5, "host", 57) + 6, 1.4)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, opacity: e(g, tWp - 4, tWp + 10) }}>
              <L src="wordpress.svg" h={36} />
              <div style={{ fontFamily: BODY, fontSize: 24, color: C.charcoal }}>
                A WordPress update <b style={{ color: CORAL }}>doesn't</b> change your PHP version.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ACT 7 — CTA journey */}
      {ctaIn > 0 ? (
        <div style={{ position: "absolute", left: 100, top: 700, width: 880, opacity: ctaIn, transform: `translateY(${(1 - ctaIn) * 40}px)` }}>
          <div style={{ background: "white", borderRadius: 26, border: `1px solid ${LINE}`, boxShadow: SH, padding: "28px 32px", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 92, height: 92, borderRadius: "50%", background: C.charcoal, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 32, color: C.lime }}>K·R</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 30, color: C.charcoal }}>kanishk.rewires</div>
              <div style={{ fontFamily: BODY, fontSize: 21, color: MUTED }}>AI that actually matters to your business</div>
            </div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 24, borderRadius: 12, padding: "12px 22px", background: follow > 0.5 ? "#EEEBE2" : C.charcoal, color: follow > 0.5 ? C.charcoal : C.cream }}>{follow > 0.5 ? "Following" : "Follow"}</div>
          </div>
          <div style={{ marginTop: 18, background: "white", borderRadius: 22, border: `1px solid ${LINE}`, boxShadow: SH, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, opacity: e(g, tPatch - 30, tPatch - 18) }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#EEEBE2" }} />
            <div style={{ flex: 1, fontFamily: BODY, fontSize: 30, color: C.charcoal }}>{typed(g, "PATCH", tPatch - 14, 0.45) || <span style={{ color: MUTED }}>Add a comment…</span>}</div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 24, color: g > tPatch + 6 ? INK : MUTED }}>Post</div>
          </div>
          <div style={{ marginTop: 18, background: C.charcoal, borderRadius: 22, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, opacity: dm, transform: `translateY(${(1 - dm) * -30}px)` }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 18, color: C.charcoal }}>DM</div>
            <div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: C.cream }}>kanishk.rewires sent you a message</div>
              <div style={{ fontFamily: BODY, fontSize: 21, color: "rgba(246,244,237,0.7)" }}>Your 2-minute PHP check + host message</div>
            </div>
          </div>
        </div>
      ) : null}
      {/* sphere iris */}
      {irisIn > 0 && irisIn < 1 ? <Sphere r={irisIn * 1250} color={C.charcoal} /> : null}
      {irisOut > 0 && irisOut < 1 ? (
        <>
          <AbsoluteFill style={{ background: C.charcoal }} />
          <Sphere r={irisOut * 1250} color={C.cream} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const Sphere: React.FC<{ r: number; color: string }> = ({ r, color }) => (
  <div style={{ position: "absolute", left: 540 - r, top: 960 - r, width: r * 2, height: r * 2, borderRadius: "50%", background: color === C.charcoal ? `radial-gradient(circle at 35% 30%, #3A3B37 0%, ${C.charcoal} 55%)` : `radial-gradient(circle at 35% 30%, #FFFFFF 0%, ${C.cream} 55%)`, boxShadow: `0 0 120px rgba(0,0,0,0.25)` }} />
);
const Browser: React.FC<{ url: string; dark: boolean; children: React.ReactNode }> = ({ url, children }) => (
  <div style={{ background: "white", borderRadius: 26, border: `1px solid ${LINE}`, boxShadow: SH, overflow: "hidden" }}>
    <div style={{ height: 58, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: "#F3F1EA", borderBottom: `1px solid ${LINE}` }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((cl) => (
        <div key={cl} style={{ width: 13, height: 13, borderRadius: "50%", background: cl }} />
      ))}
      <div style={{ marginLeft: 14, flex: 1, height: 34, borderRadius: 10, background: "white", border: `1px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 14px", fontFamily: BODY, fontSize: 18, color: MUTED }}>{url}</div>
    </div>
    {children}
  </div>
);
const Row: React.FC<{ k: string; v: React.ReactNode; hl?: number }> = ({ k, v, hl = 1 }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${LINE}`, opacity: 0.35 + 0.65 * hl }}>
    <span style={{ fontFamily: BODY, fontSize: 25, color: MUTED }}>{k}</span>
    <span style={{ fontFamily: BODY, fontSize: 27, color: C.charcoal }}>{v}</span>
  </div>
);
const SiteThumb: React.FC<{ kind: number }> = ({ kind }) => (
  <div style={{ height: 230, padding: 16, position: "relative" }}>
    {kind === 0 ? (
      <>
        <div style={{ height: 90, borderRadius: 10, background: "linear-gradient(135deg,#E9E4D6,#D9D2BF)" }} />
        <div style={{ height: 14, width: "80%", background: "#2B2B2B", borderRadius: 4, marginTop: 14 }} />
        {[0.95, 0.9, 0.7].map((wv, i) => (
          <div key={i} style={{ height: 9, width: `${wv * 100}%`, background: "#E2DED3", borderRadius: 4, marginTop: 9 }} />
        ))}
      </>
    ) : kind === 1 ? (
      <>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 80, height: 80, borderRadius: 10, background: "#E9E4D6" }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, width: "80%", background: "#2B2B2B", borderRadius: 4 }} />
            <div style={{ height: 9, width: "50%", background: "#E2DED3", borderRadius: 4, marginTop: 10 }} />
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 22, color: C.charcoal, marginTop: 10 }}>₹2,499</div>
          </div>
        </div>
        <div style={{ height: 40, borderRadius: 10, border: `1px solid ${LINE}`, marginTop: 16 }} />
        <div style={{ height: 46, borderRadius: 10, background: C.charcoal, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, fontWeight: 700, fontSize: 18, color: C.cream }}>Pay now</div>
      </>
    ) : (
      <>
        <div style={{ height: 14, width: "60%", background: "#2B2B2B", borderRadius: 4 }} />
        {["Apply for a permit", "Pay a tax bill", "Book an appointment"].map((t) => (
          <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${LINE}`, padding: "13px 0", fontFamily: BODY, fontSize: 17, color: C.charcoal }}>
            {t}
            <span style={{ color: MUTED }}>›</span>
          </div>
        ))}
      </>
    )}
  </div>
);

export const PHP_FILM_SCENES: Record<string, React.FC<SceneProps>> = { dPhp2: PhpFilm };
