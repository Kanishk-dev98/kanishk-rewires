// Demonstration scenes: each one shows the step being narrated with an illustrative, animated interface.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO } from "./brand";
import { Accent, MaskUp, useU, Wires } from "./fx";
import type { SceneProps } from "./scenes";
import { appear, Avatar, Check, Chip, Cursor, FocusCam, Illustrative, kf, LayerHead, Panel, Retype, TiltCard, Typed } from "./ui";

const T = { contentTop: 230, uiTop: 400, uiH: 880, w: 920 };

const Shell: React.FC<{ seed: string; children: React.ReactNode }> = ({ seed, children }) => (
  <AbsoluteFill style={{ background: C.charcoal }}>
    <Wires seed={seed} opacity={0.1} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 48%, rgba(167,255,63,0.035), rgba(0,0,0,0) 70%)" }} />
    {children}
  </AbsoluteFill>
);

/** Absolute box in design pixels (1080 wide), scaled by u. */
const Box: React.FC<{ x: number; y: number; w: number; h?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, children, style }) => {
  const u = useU();
  return <div style={{ position: "absolute", left: x * u, top: y * u, width: w * u, height: h !== undefined ? h * u : undefined, ...style }}>{children}</div>;
};

const sy = (d: SceneProps["data"], i: number, fallback: number) => (d.syncFrames?.[i] ?? fallback) as number;
const txt = (u: number, size: number, color: string = C.cream, weight = 500): React.CSSProperties => ({ fontFamily: BODY, fontWeight: weight, fontSize: size * u, color, lineHeight: 1.3 });
const mono = (u: number, size = 17, color: string = C.grey): React.CSSProperties => ({ fontFamily: MONO, fontSize: size * u, letterSpacing: 0.14 * size * u, color, textTransform: "uppercase" });

// =============================================================== hook: profile → five-layer system
export const SystemHookScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const u = useU();
  const layers: string[] = data.layers;
  const fillAt = Math.round(D * 0.38);
  const line = interpolate(frame, [fillAt - 4, fillAt + layers.length * 5 + 6], [0, 1], { ...clamp, easing: EASE_IO });
  return (
    <Shell seed="hook">
      <Box x={80} y={T.contentTop} w={920}>
        {(data.lines as string[]).map((l, i) => (
          <MaskUp key={i} at={i * 5}>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 76 * u, lineHeight: 1.0, letterSpacing: -2.4 * u, color: C.cream }}>
              <Accent text={l} dark />
            </div>
          </MaskUp>
        ))}
      </Box>
      {/* profile card */}
      <Box x={80} y={560} w={380} h={500}>
        <TiltCard at={4} from="left">
          <Panel title="Profile" pad={24} style={{ height: 500 * u, borderColor: frame > fillAt ? "rgba(167,255,63,0.55)" : undefined }}>
            <div style={{ height: 90 * u, borderRadius: 14 * u, background: `linear-gradient(120deg, ${C.graphite}, #2a2a2a)` }} />
            <div style={{ marginTop: -36 * u, marginLeft: 18 * u }}>
              <Avatar initials="YN" size={78} />
            </div>
            <div style={{ ...txt(u, 28, C.cream, 700), marginTop: 14 * u }}>Your Name</div>
            {[0.9, 0.7, 0.8, 0.55].map((w, i) => (
              <div key={i} style={{ height: 14 * u, width: `${w * 100}%`, borderRadius: 7 * u, background: "rgba(246,244,237,0.12)", marginTop: 16 * u }} />
            ))}
          </Panel>
        </TiltCard>
      </Box>
      {/* connector */}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080 * u} height={1920 * u}>
        <path d={`M ${460 * u} ${810 * u} C ${500 * u} ${810 * u}, ${500 * u} ${600 * u}, ${540 * u} ${600 * u}`} stroke={C.lime} strokeWidth={3 * u} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, line * 3)} />
      </svg>
      {/* five-step pipeline */}
      <Box x={530} y={560} w={470}>
        <TiltCard at={8} from="right">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 * u, position: "relative" }}>
            <div style={{ position: "absolute", left: 40 * u, top: 40 * u, width: 3 * u, height: `${line * 80}%`, background: C.lime }} />
            {layers.map((l, i) => {
              const p = appear(frame, fillAt + i * 5, 8);
              return (
                <div
                  key={l}
                  style={{
                    height: 82 * u,
                    borderRadius: 18 * u,
                    border: `${2 * u}px ${p > 0.5 ? "solid" : "dashed"} ${p > 0.5 ? "rgba(246,244,237,0.16)" : "rgba(246,244,237,0.12)"}`,
                    background: p > 0.5 ? "#151515" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 22 * u,
                    padding: `0 ${22 * u}px`,
                    position: "relative",
                  }}
                >
                  <div style={{ width: 38 * u, height: 38 * u, borderRadius: "50%", background: p > 0.5 ? C.lime : C.graphite, display: "flex", alignItems: "center", justifyContent: "center", ...mono(u, 15, C.charcoal), letterSpacing: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ ...txt(u, 27, C.cream, 600), opacity: p, translate: `${(1 - p) * 20 * u}px 0` }}>{l}</div>
                </div>
              );
            })}
          </div>
        </TiltCard>
      </Box>
    </Shell>
  );
};

// =============================================================== 01 profile
export const ProfileScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const u = useU();
  const kw = sy(data, 0, 50);
  const out = sy(data, 1, 100);
  const act = sy(data, 2, 150);
  const retypeAt = 14;
  const after = frame >= retypeAt;
  const keywords: string[] = data.keywords;
  const about: [string, string][] = data.about;
  return (
    <Shell seed="profile">
      <Box x={80} y={T.contentTop} w={920}>
        <LayerHead num="01" name="PROFILE" line={data.line} />
      </Box>
      <Box x={80} y={T.uiTop} w={920} h={T.uiH}>
        <TiltCard at={0} tilt={0.6}>
          <FocusCam
            style={{ height: T.uiH * u }}
            keys={[
              { at: 0, x: 0.5, y: 0.3, s: 1 },
              { at: retypeAt + 6, x: 0.45, y: 0.34, s: 1.12 },
              { at: kw + 8, x: 0.45, y: 0.42, s: 1.1 },
              { at: out + 2, x: 0.5, y: 0.7, s: 1.06 },
              { at: act + 4, x: 0.5, y: 0.9, s: 1.1 },
              { at: D - 6, x: 0.5, y: 0.5, s: 1 },
            ]}
          >
            <Panel title="Your profile" tag="Illustrative" pad={0} style={{ height: T.uiH * u }}>
              {/* banner */}
              <div style={{ height: 150 * u, position: "relative", background: `linear-gradient(115deg, #1b1b1b, ${C.graphite} 60%, #26301a)` }}>
                <div style={{ position: "absolute", right: 34 * u, top: 44 * u, textAlign: "right" }}>
                  <div style={{ ...mono(u, 14), opacity: appear(frame, out - 6) }}>Banner</div>
                  <Typed text={data.banner} at={out - 4} cpf={2} caret={false} style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 34 * u, color: C.cream }} />
                </div>
              </div>
              <div style={{ padding: `0 ${34 * u}px` }}>
                <div style={{ marginTop: -48 * u, display: "flex", alignItems: "flex-end", gap: 20 * u }}>
                  <div style={{ border: `${5 * u}px solid #151515`, borderRadius: "50%" }}>
                    <Avatar initials="YN" size={110} />
                  </div>
                  <div style={{ ...txt(u, 34, C.cream, 700), paddingBottom: 8 * u }}>Your Name</div>
                </div>
                {/* headline */}
                <div style={{ marginTop: 22 * u, ...mono(u, 15, after ? C.lime : C.grey) }}>{after ? "After · headline" : "Before · headline"}</div>
                <div style={{ marginTop: 8 * u, minHeight: 84 * u, ...txt(u, 30, C.cream, 500) }}>
                  <Retype from={data.before} to={data.after} at={retypeAt} cpf={1.9} />
                </div>
                {/* keywords */}
                <div style={{ display: "flex", gap: 10 * u, flexWrap: "wrap", marginTop: 16 * u, minHeight: 50 * u }}>
                  {keywords.map((k, i) => (
                    <Chip key={k} p={appear(frame, kw + i * 4, 8)} on={frame > kw + i * 4 + 6} size={20}>
                      {k}
                    </Chip>
                  ))}
                </div>
                {/* about */}
                <div style={{ marginTop: 26 * u, borderTop: `${1.5 * u}px solid rgba(246,244,237,0.08)`, paddingTop: 20 * u }}>
                  <div style={mono(u, 15)}>About</div>
                  {about.map(([k, v], i) => {
                    const p = appear(frame, out + i * 6, 10);
                    return (
                      <div key={k} style={{ display: "flex", gap: 18 * u, marginTop: 14 * u, opacity: p, translate: `${(1 - p) * 24 * u}px 0` }}>
                        <span style={{ ...mono(u, 15, C.lime), width: 150 * u, paddingTop: 5 * u, flexShrink: 0 }}>{k}</span>
                        <span style={txt(u, 25, C.stone)}>{v}</span>
                      </div>
                    );
                  })}
                </div>
                {/* CTA */}
                <div style={{ marginTop: 26 * u, display: "flex", alignItems: "center", gap: 16 * u }}>
                  <div
                    style={{
                      ...txt(u, 26, C.charcoal, 700),
                      background: C.lime,
                      borderRadius: 999,
                      padding: `${14 * u}px ${30 * u}px`,
                      opacity: appear(frame, act - 4),
                      scale: String(interpolate(frame, [act - 4, act + 2, act + 6, act + 10], [0.8, 1.06, 0.96, 1], clamp)),
                    }}
                  >
                    {data.cta}
                  </div>
                  <span style={{ ...mono(u, 15), opacity: appear(frame, act + 6) }}>One clear next step</span>
                </div>
              </div>
            </Panel>
            <Cursor
              path={[
                { at: 2, x: 700 * u, y: 520 * u },
                { at: retypeAt - 2, x: 620 * u, y: 330 * u, click: true },
                { at: kw, x: 300 * u, y: 420 * u },
                { at: act - 8, x: 200 * u, y: 760 * u },
                { at: act, x: 180 * u, y: 770 * u, click: true },
              ]}
            />
          </FocusCam>
        </TiltCard>
      </Box>
    </Shell>
  );
};

// =============================================================== 02 prospects
type Lead = { name: string; role: string; company: string; fit: number; signal: string };
export const ProspectsScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const u = useU();
  const icpAt = sy(data, 0, 20);
  const listAt = sy(data, 1, 80);
  const prioAt = sy(data, 2, 140);
  const filters: [string, string][] = data.filters;
  const leads: Lead[] = data.leads;
  const sorted = [...leads].map((l, i) => ({ ...l, i })).sort((a, b) => b.fit - a.fit);
  const rank = new Map(sorted.map((l, r) => [l.i, r]));
  const sortP = interpolate(frame, [prioAt + 6, prioAt + 22], [0, 1], { ...clamp, easing: EASE_IO });
  const rowH = 80;
  const prio = (fit: number) => (fit >= 80 ? "High" : fit >= 65 ? "Med" : "Low");
  return (
    <Shell seed="prospects">
      <Box x={80} y={T.contentTop} w={920}>
        <LayerHead num="02" name="PROSPECTS" line={data.line} />
      </Box>
      <Box x={80} y={T.uiTop} w={920} h={T.uiH}>
        <TiltCard at={0} tilt={0.6}>
          <FocusCam
            style={{ height: T.uiH * u }}
            keys={[
              { at: 0, x: 0.5, y: 0.2, s: 1.08 },
              { at: listAt - 6, x: 0.5, y: 0.2, s: 1.08 },
              { at: listAt + 10, x: 0.5, y: 0.62, s: 1.02 },
              { at: prioAt + 4, x: 0.6, y: 0.6, s: 1.08 },
              { at: D - 4, x: 0.5, y: 0.55, s: 1 },
            ]}
          >
            <Panel title="Lead search" tag={data.tool} pad={26} style={{ height: T.uiH * u }}>
              <div style={mono(u, 15, C.lime)}>Ideal customer profile</div>
              <div style={{ display: "grid", gridTemplateColumns: `${190 * u}px 1fr`, rowGap: 8 * u, marginTop: 12 * u, alignItems: "center" }}>
                {filters.map(([k, v], i) => (
                  <React.Fragment key={k}>
                    <span style={mono(u, 15)}>{k}</span>
                    <span>
                      <Chip p={appear(frame, icpAt + i * 6, 8)} size={21}>
                        {v}
                      </Chip>
                    </span>
                  </React.Fragment>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 26 * u, borderTop: `${1.5 * u}px solid rgba(246,244,237,0.08)`, paddingTop: 16 * u }}>
                <span style={mono(u, 14)}>Name · Role · Company</span>
                <span style={{ display: "flex", gap: 28 * u }}>
                  <span style={mono(u, 14)}>ICP fit</span>
                  <span style={mono(u, 14)}>Priority</span>
                </span>
              </div>
              <div style={{ position: "relative", height: leads.length * rowH * u, marginTop: 10 * u }}>
                {leads.map((l, i) => {
                  const p = appear(frame, listAt + i * 4, 10);
                  const y = interpolate(sortP, [0, 1], [i, rank.get(i)!]) * rowH;
                  const pr = prio(l.fit);
                  const showP = sortP > 0.6;
                  return (
                    <div
                      key={l.name}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: y * u,
                        height: (rowH - 10) * u,
                        display: "flex",
                        alignItems: "center",
                        gap: 16 * u,
                        padding: `0 ${14 * u}px`,
                        borderRadius: 14 * u,
                        background: showP && pr === "High" ? "rgba(167,255,63,0.07)" : "rgba(246,244,237,0.03)",
                        opacity: p,
                        translate: `${(1 - p) * 40 * u}px 0`,
                      }}
                    >
                      <Avatar initials={l.name.split(" ").map((s) => s[0]).join("")} size={48} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...txt(u, 23, C.cream, 600), whiteSpace: "nowrap" }}>
                          {l.name} <span style={{ color: C.grey, fontWeight: 500 }}>· {l.role}</span>
                        </div>
                        <div style={{ ...txt(u, 19, C.grey, 500), whiteSpace: "nowrap" }}>
                          {l.company} · <span style={{ color: C.stone }}>{l.signal}</span>
                        </div>
                      </div>
                      <div style={{ width: 96 * u }}>
                        <div style={{ ...mono(u, 17, C.cream), letterSpacing: 0 }}>{Math.round(l.fit * appear(frame, listAt + i * 4 + 4, 14))}%</div>
                        <div style={{ height: 6 * u, background: C.graphite, borderRadius: 3 * u, marginTop: 4 * u }}>
                          <div style={{ height: "100%", width: `${l.fit * appear(frame, listAt + i * 4 + 4, 14)}%`, background: l.fit >= 80 ? C.lime : C.stone, borderRadius: 3 * u }} />
                        </div>
                      </div>
                      <div style={{ width: 92 * u, display: "flex", justifyContent: "center" }}>
                        {showP ? (
                          <Chip on={pr === "High"} size={17} p={appear(frame, prioAt + 14 + rank.get(i)! * 2, 6)}>
                            {pr}
                          </Chip>
                        ) : (
                          <span style={mono(u, 15)}>·</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 * u }}>
                <Illustrative text="Illustrative data" />
                <div
                  style={{
                    ...txt(u, 21, frame >= prioAt ? C.charcoal : C.cream, 700),
                    background: frame >= prioAt ? C.lime : C.graphite,
                    border: `${1.5 * u}px solid ${C.lime}`,
                    borderRadius: 999,
                    padding: `${10 * u}px ${22 * u}px`,
                    opacity: appear(frame, listAt + 20),
                  }}
                >
                  ✦ AI prioritize
                </div>
              </div>
            </Panel>
            <Cursor
              path={[
                { at: icpAt - 6, x: 600 * u, y: 200 * u },
                { at: icpAt, x: 330 * u, y: 120 * u, click: true },
                { at: icpAt + 12, x: 330 * u, y: 230 * u, click: true },
                { at: listAt + 20, x: 650 * u, y: 600 * u },
                { at: prioAt - 2, x: 800 * u, y: 790 * u, click: true },
                { at: D, x: 760 * u, y: 700 * u },
              ]}
            />
          </FocusCam>
        </TiltCard>
      </Box>
    </Shell>
  );
};

// =============================================================== 03 personalize
export const PersonalizeScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const u = useU();
  const resAt = sy(data, 0, 14);
  const draftAt = sy(data, 1, 50);
  const revAt = sy(data, 2, 110);
  const research: string[] = data.research;
  const pick = resAt + 18;
  const strike = interpolate(frame, [draftAt - 10, draftAt], [0, 1], { ...clamp, easing: EASE });
  const typedEnd = draftAt + 4 + data.personalized.length / 3.2;
  const approved = appear(frame, revAt + 16, 10);
  return (
    <Shell seed="personalize">
      <Box x={80} y={T.contentTop} w={920}>
        <LayerHead num="03" name="PERSONALIZE" line={data.line} />
      </Box>
      <Box x={80} y={T.uiTop} w={920} h={T.uiH}>
        <TiltCard at={0} tilt={0.6}>
          <FocusCam
            style={{ height: T.uiH * u }}
            keys={[
              { at: 0, x: 0.5, y: 0.25, s: 1.06 },
              { at: draftAt - 8, x: 0.5, y: 0.3, s: 1.06 },
              { at: draftAt + 6, x: 0.5, y: 0.62, s: 1.08 },
              { at: revAt + 6, x: 0.5, y: 0.85, s: 1.08 },
              { at: D, x: 0.5, y: 0.6, s: 1.02 },
            ]}
          >
            <Panel title="Prospect record" tag="Illustrative" pad={26} style={{ height: T.uiH * u }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 * u }}>
                <Avatar initials="SC" size={68} />
                <div>
                  <div style={txt(u, 28, C.cream, 700)}>{data.prospect.name}</div>
                  <div style={txt(u, 21, C.grey)}>{data.prospect.title}</div>
                </div>
              </div>
              <div style={{ ...mono(u, 15, C.lime), marginTop: 22 * u }}>Research · public business info</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 * u, marginTop: 12 * u }}>
                {research.map((r, i) => {
                  const p = appear(frame, resAt + i * 5, 8);
                  const chosen = i === 0 && frame >= pick;
                  return (
                    <div
                      key={r}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: `${12 * u}px ${18 * u}px`,
                        borderRadius: 14 * u,
                        border: `${1.5 * u}px solid ${chosen ? C.lime : "rgba(246,244,237,0.1)"}`,
                        opacity: p * (frame >= pick && !chosen ? 0.45 : 1),
                        translate: `${(1 - p) * 30 * u}px 0`,
                      }}
                    >
                      <span style={txt(u, 22, C.stone)}>{r}</span>
                      {chosen ? <Check p={appear(frame, pick, 8)} size={28} /> : null}
                    </div>
                  );
                })}
              </div>
              {/* generic vs AI draft */}
              <div style={{ marginTop: 22 * u, position: "relative" }}>
                <div style={mono(u, 14)}>Generic</div>
                <div style={{ position: "relative", display: "inline-block", marginTop: 8 * u, ...txt(u, 23, C.grey), opacity: 1 - 0.5 * strike }}>
                  “{data.generic}”
                  <div style={{ position: "absolute", left: 0, top: "52%", height: 2.5 * u, width: `${strike * 100}%`, background: C.lime }} />
                </div>
              </div>
              <div style={{ marginTop: 18 * u, borderRadius: 18 * u, background: C.graphite, padding: `${18 * u}px ${22 * u}px`, border: `${1.5 * u}px solid ${frame >= revAt ? "rgba(167,255,63,0.5)" : "rgba(246,244,237,0.08)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={mono(u, 14, C.lime)}>✦ AI draft</span>
                  <span style={mono(u, 14)}>{Math.min(data.personalized.length, Math.max(0, Math.floor((frame - draftAt - 4) * 3.2)))} / {data.limit ?? 200}</span>
                </div>
                <div style={{ marginTop: 10 * u, minHeight: 130 * u, ...txt(u, 24, C.cream) }}>
                  <Typed text={data.personalized} at={draftAt + 4} cpf={3.2} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 * u, opacity: appear(frame, Math.min(typedEnd, revAt - 6)) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 * u }}>
                  <Check p={approved} size={30} />
                  <span style={mono(u, 15, approved > 0.5 ? C.lime : C.grey)}>{approved > 0.5 ? "Reviewed by you" : "Human review"}</span>
                </div>
                <div style={{ display: "flex", gap: 12 * u }}>
                  <span style={{ ...txt(u, 21, C.stone, 600), border: `${1.5 * u}px solid rgba(246,244,237,0.2)`, borderRadius: 999, padding: `${8 * u}px ${20 * u}px` }}>Edit</span>
                  <span style={{ ...txt(u, 21, C.charcoal, 700), background: approved > 0.5 ? C.lime : C.stone, borderRadius: 999, padding: `${8 * u}px ${20 * u}px` }}>Approve</span>
                </div>
              </div>
            </Panel>
            <Cursor
              path={[
                { at: resAt + 6, x: 640 * u, y: 330 * u },
                { at: pick - 2, x: 560 * u, y: 228 * u, click: true },
                { at: draftAt + 10, x: 760 * u, y: 520 * u },
                { at: revAt, x: 700 * u, y: 700 * u },
                { at: revAt + 8, x: 640 * u, y: 790 * u, click: true },
                { at: revAt + 14, x: 820 * u, y: 790 * u, click: true },
              ]}
            />
          </FocusCam>
        </TiltCard>
      </Box>
    </Shell>
  );
};

// =============================================================== 04 automate
type WNode = { label: string; kind: string; human?: boolean };
export const WorkflowScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const u = useU();
  const [crmAt, repAt, folAt, stopAt] = [sy(data, 0, 10), sy(data, 1, 60), sy(data, 2, 100), sy(data, 3, 140)];
  const chain: WNode[] = data.chain;
  const no: WNode = data.noReply;
  const yes: WNode = data.reply;
  const nodeAt = [crmAt, crmAt + 14, crmAt + 28, repAt];
  const W = 860;
  const nh = 84;
  const gap = 34;
  const ys = chain.map((_, i) => 20 + i * (nh + gap));
  const by = ys[ys.length - 1] + nh + 70;
  const node = (n: WNode, at: number, x: number, y: number, w: number, accent = false) => {
    const p = appear(frame, at, 10);
    return (
      <div
        key={n.label}
        style={{
          position: "absolute",
          left: x * u,
          top: y * u,
          width: w * u,
          height: nh * u,
          borderRadius: 18 * u,
          background: "#1a1a1a",
          border: `${2 * u}px solid ${accent && p > 0.5 ? C.lime : "rgba(246,244,237,0.12)"}`,
          display: "flex",
          alignItems: "center",
          gap: 16 * u,
          padding: `0 ${20 * u}px`,
          opacity: p,
          scale: String(0.9 + 0.1 * p),
          boxShadow: `0 ${16 * u}px ${30 * u}px rgba(0,0,0,0.4)`,
        }}
      >
        <div style={{ width: 46 * u, height: 46 * u, borderRadius: 12 * u, background: n.human ? C.stone : C.graphite, border: `${1.5 * u}px solid rgba(246,244,237,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", ...mono(u, 13, n.human ? C.charcoal : C.lime), letterSpacing: 0 }}>
          {n.kind}
        </div>
        <div style={{ ...txt(u, 23, C.cream, 600), lineHeight: 1.15 }}>{n.label}</div>
      </div>
    );
  };
  const edge = (x1: number, y1: number, x2: number, y2: number, at: number, key: string) => {
    const p = interpolate(frame, [at - 8, at + 2], [0, 1], { ...clamp, easing: EASE_IO });
    const my = (y1 + y2) / 2;
    return <path key={key} d={`M ${x1 * u} ${y1 * u} C ${x1 * u} ${my * u}, ${x2 * u} ${my * u}, ${x2 * u} ${y2 * u}`} stroke={C.stone} strokeOpacity={0.5} strokeWidth={2.5 * u} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
  };
  // a lime pulse travelling down the built chain
  const pulseT = ((frame - repAt) % 40) / 40;
  const pulseY = ys[0] + nh + pulseT * (ys[3] - ys[0]);
  const status = frame >= stopAt + 6 ? data.status[2] : frame >= folAt + 6 ? data.status[1] : data.status[0];
  return (
    <Shell seed="workflow">
      <Box x={80} y={T.contentTop} w={920}>
        <LayerHead num="04" name="AUTOMATE" line={data.line} />
      </Box>
      <Box x={80} y={T.uiTop} w={920} h={T.uiH}>
        <TiltCard at={0} tilt={0.7}>
          <FocusCam
            style={{ height: T.uiH * u }}
            keys={[
              { at: 0, x: 0.5, y: 0.2, s: 1.08 },
              { at: repAt, x: 0.5, y: 0.45, s: 1.04 },
              { at: folAt, x: 0.3, y: 0.78, s: 1.1 },
              { at: stopAt + 4, x: 0.7, y: 0.78, s: 1.1 },
              { at: D, x: 0.5, y: 0.6, s: 1 },
            ]}
          >
            <Panel title="Workflow" tag={data.tool} pad={0} style={{ height: T.uiH * u, backgroundImage: `radial-gradient(rgba(246,244,237,0.07) ${1.4 * u}px, transparent ${1.6 * u}px)`, backgroundSize: `${28 * u}px ${28 * u}px` }}>
              <div style={{ position: "relative", height: (T.uiH - 70) * u }}>
                <svg style={{ position: "absolute", inset: 0 }} width={920 * u} height={(T.uiH - 70) * u}>
                  {chain.slice(1).map((_, i) => edge(460, ys[i] + nh, 460, ys[i + 1], nodeAt[i + 1], `e${i}`))}
                  {edge(460, ys[3] + nh, 245, by, folAt, "no")}
                  {edge(460, ys[3] + nh, 675, by, stopAt, "yes")}
                  {frame > repAt && frame < folAt ? <circle cx={460 * u} cy={pulseY * u} r={7 * u} fill={C.lime} /> : null}
                </svg>
                {chain.map((n, i) => node(n, nodeAt[i], (920 - W) / 2, ys[i], W, i === 3))}
                {node(no, folAt, 30, by, 420, true)}
                {node(yes, stopAt, 470, by, 420, true)}
                <div style={{ position: "absolute", left: 230 * u, top: (ys[3] + nh + 18) * u, ...mono(u, 14, C.grey), opacity: appear(frame, folAt) }}>No reply</div>
                <div style={{ position: "absolute", left: 560 * u, top: (ys[3] + nh + 18) * u, ...mono(u, 14, C.grey), opacity: appear(frame, stopAt) }}>Replied</div>
              </div>
              {/* CRM record that updates */}
              <div style={{ position: "absolute", left: 30 * u, right: 30 * u, bottom: 22 * u, height: 70 * u, borderRadius: 16 * u, background: C.graphite, display: "flex", alignItems: "center", gap: 16 * u, padding: `0 ${20 * u}px`, opacity: appear(frame, crmAt + 6) }}>
                <span style={mono(u, 14, C.lime)}>CRM</span>
                <span style={txt(u, 22, C.cream, 600)}>Sarah Chen</span>
                <span style={{ marginLeft: "auto", ...txt(u, 21, C.stone) }}>{status}</span>
              </div>
            </Panel>
          </FocusCam>
        </TiltCard>
      </Box>
    </Shell>
  );
};

// =============================================================== 05 convert
export const ConvertScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const u = useU();
  const [qAt, bAt, tAt] = [sy(data, 0, 30), sy(data, 1, 70), sy(data, 2, 110)];
  const cols: string[] = data.columns;
  const colW = 280;
  const stage = frame >= bAt + 18 ? 2 : frame >= qAt ? 1 : 0;
  const moveP = (at: number) => interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: EASE_IO });
  const x = interpolate(moveP(qAt) + moveP(bAt + 18), [0, 1, 2], [0, 1, 2]) * (colW + 20);
  const steps: string[] = data.steps;
  return (
    <Shell seed="convert">
      <Box x={80} y={T.contentTop} w={920}>
        <LayerHead num="05" name="CONVERT" line={data.line} />
      </Box>
      <Box x={80} y={T.uiTop} w={920} h={T.uiH}>
        <TiltCard at={0} tilt={0.6}>
          <FocusCam
            style={{ height: T.uiH * u }}
            keys={[
              { at: 0, x: 0.5, y: 0.15, s: 1.08 },
              { at: qAt + 4, x: 0.4, y: 0.45, s: 1.04 },
              { at: bAt + 4, x: 0.75, y: 0.5, s: 1.08 },
              { at: tAt + 4, x: 0.5, y: 0.88, s: 1.06 },
              { at: D, x: 0.5, y: 0.55, s: 1 },
            ]}
          >
            <Panel title="Pipeline" tag="Illustrative" pad={26} style={{ height: T.uiH * u }}>
              {/* the reply */}
              <div style={{ display: "flex", gap: 14 * u, alignItems: "flex-start", opacity: appear(frame, 2), translate: `0 ${(1 - appear(frame, 2)) * 20 * u}px` }}>
                <Avatar initials="SC" size={52} />
                <div style={{ background: C.graphite, borderRadius: `${4 * u}px ${20 * u}px ${20 * u}px ${20 * u}px`, padding: `${12 * u}px ${18 * u}px`, ...txt(u, 23, C.cream) }}>{data.reply}</div>
              </div>
              <div style={{ alignSelf: "flex-end", display: "flex", justifyContent: "flex-end", marginTop: 10 * u, opacity: appear(frame, bAt - 2), translate: `0 ${(1 - appear(frame, bAt - 2)) * 20 * u}px` }}>
                <div style={{ background: C.lime, color: C.charcoal, borderRadius: `${20 * u}px ${4 * u}px ${20 * u}px ${20 * u}px`, padding: `${12 * u}px ${18 * u}px`, ...txt(u, 22, C.charcoal, 600) }}>{data.answer}</div>
              </div>
              {/* kanban */}
              <div style={{ position: "relative", marginTop: 22 * u, height: 330 * u }}>
                {cols.map((c, i) => (
                  <div key={c} style={{ position: "absolute", left: i * (colW + 20) * u, top: 0, width: colW * u, height: 330 * u, borderRadius: 16 * u, background: "rgba(246,244,237,0.03)", border: `${1.5 * u}px solid ${stage === i && i > 0 ? "rgba(167,255,63,0.4)" : "rgba(246,244,237,0.07)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: `${14 * u}px ${16 * u}px` }}>
                      <span style={mono(u, 14, i === 2 ? C.lime : C.stone)}>{c}</span>
                      <span style={mono(u, 14)}>{(data.counts[i] as number) + (stage === i ? 1 : 0)}</span>
                    </div>
                    {i === 0 ? [0, 1].map((k) => <div key={k} style={{ margin: `${10 * u}px ${14 * u}px`, height: 56 * u, borderRadius: 12 * u, background: "rgba(246,244,237,0.05)", marginTop: (k === 0 ? 96 : 10) * u }} />) : null}
                  </div>
                ))}
                {/* Sarah's card moving across */}
                <div style={{ position: "absolute", left: (x + 14) * u, top: 56 * u, width: (colW - 28) * u, borderRadius: 14 * u, background: "#202020", border: `${2 * u}px solid ${stage === 2 ? C.lime : "rgba(246,244,237,0.16)"}`, padding: `${12 * u}px ${14 * u}px`, boxShadow: `0 ${14 * u}px ${30 * u}px rgba(0,0,0,0.5)`, rotate: `${Math.sin(moveP(qAt) * Math.PI) * 3 + Math.sin(moveP(bAt + 18) * Math.PI) * 3}deg` }}>
                  <div style={txt(u, 22, C.cream, 700)}>Sarah Chen</div>
                  <div style={txt(u, 18, C.grey)}>Northwind Goods</div>
                  <div style={{ marginTop: 8 * u }}>
                    <Chip on={stage > 0} size={15}>{data.tags[stage]}</Chip>
                  </div>
                </div>
                {/* booking popover */}
                <div style={{ position: "absolute", right: 0, top: 200 * u, width: 300 * u, borderRadius: 16 * u, background: C.graphite, border: `${1.5 * u}px solid rgba(246,244,237,0.12)`, padding: `${12 * u}px ${14 * u}px`, opacity: Math.min(appear(frame, bAt), 1 - appear(frame, bAt + 30)), boxShadow: `0 ${20 * u}px ${40 * u}px rgba(0,0,0,0.6)` }}>
                  <div style={mono(u, 13, C.lime)}>Booking link · slots</div>
                  <div style={{ display: "flex", gap: 8 * u, marginTop: 10 * u }}>
                    {data.slots.map((s: string, i: number) => (
                      <Chip key={s} size={15} on={i === 1 && frame >= bAt + 12}>
                        {s}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
              {/* step tracker */}
              <div style={{ marginTop: 26 * u, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {steps.map((s, i) => {
                  const at = i === 0 ? 4 : i === 1 ? qAt : i === 2 ? bAt : i === 3 ? bAt + 18 : tAt;
                  const p = appear(frame, at, 8);
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * u, width: 150 * u }}>
                        <Check p={p} size={30} />
                        <span style={{ ...mono(u, 12, p > 0.5 ? C.cream : C.grey), textAlign: "center", letterSpacing: 1 * u }}>{s}</span>
                      </div>
                      {i < steps.length - 1 ? <div style={{ flex: 1, height: 2 * u, background: p > 0.5 ? C.lime : C.graphite, marginBottom: 30 * u }} /> : null}
                    </React.Fragment>
                  );
                })}
              </div>
            </Panel>
          </FocusCam>
        </TiltCard>
      </Box>
    </Shell>
  );
};

export const UI_SCENES: Record<string, React.FC<SceneProps>> = {
  systemHook: SystemHookScene,
  profile: ProfileScene,
  prospects: ProspectsScene,
  personalize: PersonalizeScene,
  workflow: WorkflowScene,
  convert: ConvertScene,
};

export const _unused = { kf, EASE };
