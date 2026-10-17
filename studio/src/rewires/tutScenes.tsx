// Tutorial scenes. Every element enters on the word that names it (data.cues, set by the pipeline).
import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, BRAND, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";
import { ApolloSearch, HubSpotBoard, Lead, LinkedInInvite, PostAndSchedule, ScoreCard } from "./real";
import { Card, CodeCard, L, LogoTile, Phone, Rich, Ring, SaveIcon, StepHeader, Sticker, Terminal, TermLine, usePop, Waveform, Wire } from "./tut";

const Bg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 40%, #1A1A1A 0%, ${C.charcoal} 70%)` }}>{children}</AbsoluteFill>
);
const Hero: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: L.side, top: L.heroTop, width: 920, height: L.heroBottom - L.heroTop }}>{children}</div>
);
const TERM_TOP = 520; // the terminal's fixed slot inside the hero box: it never moves between steps
const TERM_H = 380;

const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;
const lines = (d: SceneProps["data"], c: ReturnType<typeof cueOf>): TermLine[] =>
  (d.term ?? []).map((l: { cue: string; offset?: number; text: string; kind?: TermLine["kind"]; typing?: boolean }) => ({ ...l, at: c(l.cue, 0) + (l.offset ?? 0) }));

// ------------------------------------------------------------------ hook
export const TutHookScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const pop = usePop();
  const head = (data.lines as string[]) ?? [];
  const play = interpolate(frame, [6, D], [0.08, 0.86], clamp);
  return (
    <Bg>
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 26, letterSpacing: 5, color: C.lime, ...pop(0) }}>{data.kicker}</div>
        {head.map((l, i) => (
          <div key={i} style={{ fontFamily: SERIF, fontSize: data.size ?? 150, lineHeight: 0.98, color: C.cream, marginTop: i === 0 ? 26 : 0, ...pop(3 + i * 4, { rise: 30 }) }}>
            <Rich text={l} italic />
            {i === head.length - 1 && data.logo ? <Img src={staticFile(data.logo)} style={{ width: 96, height: 96, marginLeft: 18, verticalAlign: "middle", ...pop(16, { scale: 0.3 }) }} /> : null}
          </div>
        ))}
      </div>
      {data.motif === "leads" ? <LeadFlow /> : null}
      {/* edit timeline motif */}
      <div style={{ position: "absolute", left: 120, right: 120, top: 1200, height: 140, display: data.motif === "leads" ? "none" : undefined, ...pop(14) }}>
        <div style={{ display: "flex", gap: 10, height: 64 }}>
          {[1.2, 0.9, 1.6, 1, 1.1].map((w, i) => (
            <div key={i} style={{ flex: w, borderRadius: 12, background: i === 2 ? C.lime : C.graphite, border: `2px solid ${i === 2 ? C.lime : "#2c2c2c"}` }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 3, height: 40, alignItems: "center", marginTop: 14 }}>
          {new Array(80).fill(0).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6 + Math.abs(Math.sin(i * 1.3)) * 30, background: "#3a3a3a", borderRadius: 2 }} />
          ))}
        </div>
        <div style={{ position: "absolute", top: -24, bottom: -10, left: `${play * 100}%`, width: 4, background: C.cream, borderRadius: 2 }}>
          <div style={{ position: "absolute", top: -8, left: -8, width: 20, height: 20, borderRadius: "50%", background: C.cream }} />
        </div>
      </div>
    </Bg>
  );
};

/** Hook motif: prospect photos travel along a lime line into the pipeline. */
const LeadFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  return (
    <div style={{ position: "absolute", left: 100, right: 100, top: 1190, height: 170, ...pop(12) }}>
      <div style={{ position: "absolute", left: 0, right: 150, top: 78, height: 4, background: `linear-gradient(90deg, ${C.graphite}, ${C.lime})`, borderRadius: 2 }} />
      {new Array(6).fill(0).map((_, i) => {
        const t = ((frame * 0.012 + i / 6) % 1);
        return (
          <Img
            key={i}
            src={staticFile(`media/li2/person${i + 1}.jpg`)}
            style={{ position: "absolute", left: `${t * 78}%`, top: 50, width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: `3px solid ${C.cream}`, opacity: interpolate(t, [0, 0.08, 0.85, 1], [0, 1, 1, 0]) }}
          />
        );
      })}
      <div style={{ position: "absolute", right: 0, top: 20, width: 130, height: 120, borderRadius: 24, background: C.lime, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 600, fontSize: 18, color: C.charcoal }}>
        <div style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1 }}>{Math.min(50, Math.floor(frame / 3))}</div>
        LEADS
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ "So easy. Only 7 steps."
export const TutEasyScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const n = c("number", 30);
  const shown = Math.round(interpolate(frame, [n - 16, n], [data.from ?? 3, data.to ?? 7], { ...clamp, easing: EASE }));
  const swash = interpolate(frame, [6, 20], [0, 1], { ...clamp, easing: EASE_IO });
  return (
    <Bg>
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 200, color: C.cream, lineHeight: 1, ...pop(0) }}>
          <Rich text={data.title} italic />
        </div>
        <svg width={520} height={60} style={{ marginTop: -10 }}>
          <path d="M 20 40 C 160 10, 330 10, 500 34" stroke={C.lime} strokeWidth={6} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - swash} />
        </svg>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 44, color: C.grey, marginTop: 40, ...pop(n - 18) }}>only</div>
        <div style={{ fontFamily: SERIF, fontSize: 520, lineHeight: 0.9, color: C.lime, ...pop(n - 16, { rise: 60 }) }}>{shown}</div>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 56, color: C.cream, ...pop(n + 2) }}>steps</div>
      </div>
    </Bg>
  );
};

// ------------------------------------------------------------------ the seven steps
export const TutStepScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const c = cueOf(data);
  const pop = usePop();
  const hero = data.hero as string;
  const termTop = (data.termTop ?? TERM_TOP) as number;
  const termH = (data.termH ?? TERM_H) as number;
  const term = data.term ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: termTop }}>
      <Terminal lines={lines(data, c)} height={termH} input={data.input ? { at: c(data.input.cue, 0) + (data.input.offset ?? 0), text: data.input.text } : undefined} chips={(data.chips ?? []).map((x: { cue: string; text: string }) => ({ at: c(x.cue, 0), text: x.text }))} enter={data.termEnter ? 0 : undefined} />
    </div>
  ) : null;

  let top: React.ReactNode = null;
  const leads = (data.leads ?? []) as Lead[];
  const logos = (data.logos ?? {}) as Record<string, string>;
  if (hero === "connect") {
    const tiles: [string, string, number, string][] = [
      ["apollo", "Apollo", 70, "apollo"],
      ["hubspot", "HubSpot", 385, "hubspot"],
      ["publora", "Publora", 700, "publora"],
    ];
    top = (
      <div style={{ position: "relative", height: termTop - 20 }}>
        {tiles.map(([k, label, x, cue]) => (
          <div key={k} style={{ position: "absolute", left: x, top: 10 }}>
            <LogoTile src={logos[k]} size={150} at={c(cue, 20)} label={label} badge={{ at: c(cue, 20) + 14, kind: "ok" }} />
          </div>
        ))}
        {tiles.map(([k, , x, cue]) => (
          <Wire key={`w${k}`} from={[x + 75, 220]} to={[460, 330]} at={c(cue, 20) + 6} h={termTop} />
        ))}
        <div style={{ position: "absolute", left: 375, top: 330 }}>
          <LogoTile src="brand/logos/claude.svg" size={170} at={0} />
        </div>
      </div>
    );
  } else if (hero === "icp") {
    top = (
      <CodeCard
        enter={0}
        file="ICP.md"
        style={{ height: termTop - 30 }}
        badge={{ at: c("region", 30) + 14, text: "saved" }}
        lines={(data.icp as { text: string; cue: string; hl?: boolean }[]).map((l) => ({ text: l.text, at: c(l.cue, 10), hl: l.hl }))}
      />
    );
  } else if (hero === "apollo") {
    top = <ApolloSearch leads={leads} c={c} accent={data.apolloAccent ?? "#F7D046"} logo={logos.apollo} />;
  } else if (hero === "score") {
    top = <ScoreCard leads={leads} c={c} />;
  } else if (hero === "invite") {
    top = <LinkedInInvite lead={leads[0]} note={data.note} c={c} logo={logos.linkedin} limit={200} />;
  } else if (hero === "hubspot") {
    top = <HubSpotBoard leads={leads} c={c} logo={logos.hubspot} />;
  } else if (hero === "post") {
    top = <PostAndSchedule c={c} liLogo={logos.linkedin} post={data.post} days={["Mon", "Tue", "Wed", "Thu", "Fri"]} />;
  } else if (hero === "open") {
    top = (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 70 }}>
        <LogoTile src="brand/logos/claude.svg" size={250} at={c("logo", 6)} label="Claude" labelAccent="Code" />
      </div>
    );
  } else if (hero === "skills") {
    top = (
      <div style={{ position: "relative", height: 500 }}>
        <div style={{ position: "absolute", left: 90, top: 60 }}>
          <LogoTile src="brand/logos/claude.svg" size={190} at={0} label="Claude" />
        </div>
        <div style={{ position: "absolute", right: 90, top: 60 }}>
          <LogoTile src="brand/logos/remotion.svg" size={190} at={c("remotion", 20)} label="Remotion" badge={{ at: c("installed", 60), kind: "ok" }} />
        </div>
        <Wire from={[280, 155]} to={[640, 155]} at={c("animate", 50)} />
        <Sticker at={c("installed", 60)} text="12 skills" sub="remotion-dev/skills" rotate={-5} style={{ left: 330, top: 300 }} />
      </div>
    );
  } else if (hero === "reference") {
    const frames = ["f1", "f2", "f3", "f4", "f5", "f6"];
    top = (
      <div style={{ position: "relative", height: 500, display: "flex", gap: 34, alignItems: "flex-start", paddingTop: 10 }}>
        <div style={{ width: 260, flexShrink: 0, ...pop(c("reel", 4), { rise: 40 }) }}>
          <div style={{ width: 260, height: 462, borderRadius: 26, overflow: "hidden", boxShadow: "0 24px 50px rgba(0,0,0,0.6)", border: `3px solid ${C.cream}`, position: "relative", rotate: "-3deg" }}>
            <Img src={staticFile("media/thumb.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", left: 12, bottom: 12, fontFamily: MONO, fontSize: 17, background: C.cream, color: C.charcoal, borderRadius: 8, padding: "4px 10px" }}>reference.mp4</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, flex: 1 }}>
          {frames.map((f, i) => (
            <div key={f} style={{ height: 222, borderRadius: 14, overflow: "hidden", position: "relative", ...pop(c("frames", 30) + i * 3, { rise: 20 }) }}>
              <Img src={staticFile(`media/frames/${f}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", left: 6, top: 6, fontFamily: MONO, fontSize: 14, background: "rgba(10,10,10,0.75)", color: C.lime, borderRadius: 6, padding: "2px 7px" }}>0:{String(2 + i * 6).padStart(2, "0")}</div>
            </div>
          ))}
        </div>
        <Sticker at={c("cut", 80)} text="Every cut mapped" rotate={4} style={{ right: -10, top: 400 }} />
      </div>
    );
  } else if (hero === "brand") {
    const sw = Object.values(C) as string[];
    const fonts: [string, string][] = [["Space Grotesk", HEAD], ["Inter", BODY], ["IBM Plex Mono", MONO]];
    top = (
      <Card style={{ height: 470, padding: "26px 34px", ...pop(0, { rise: 40, scale: 0.94 }) }}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: "#77756D" }}>COLOURS</div>
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          {sw.map((col, i) => (
            <div key={col} style={{ width: 82, height: 82, borderRadius: "50%", background: col, border: "3px solid #DDD9CC", ...pop(c("colours", 10) + i * 2, { scale: 0.3, rise: 0 }) }} />
          ))}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: "#77756D", marginTop: 26 }}>FONTS</div>
        <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
          {fonts.map(([n, f], i) => (
            <span key={n} style={{ fontFamily: f, fontWeight: 600, fontSize: 30, background: C.charcoal, color: C.cream, borderRadius: 14, padding: "10px 18px", ...pop(c("fonts", 30) + i * 3, { scale: 0.6 }) }}>
              {n}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 26 }}>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: "#77756D" }}>LOGO</div>
          <Img src={staticFile(BRAND.logo.monogramPublic)} style={{ width: 100, height: 100, ...pop(c("logo", 50), { scale: 0.4 }) }} />
          <div style={{ marginLeft: "auto", fontFamily: BODY, fontWeight: 700, fontSize: 24, background: C.lime, color: C.charcoal, borderRadius: 999, padding: "8px 18px", ...pop(c("once", 70), { scale: 0.5 }) }}>✓ Saved</div>
        </div>
      </Card>
    );
  } else if (hero === "script") {
    const on = frame >= c("free", 40) + 4;
    const knob = interpolate(frame, [c("free", 40), c("free", 40) + 8], [0, 1], { ...clamp, easing: EASE });
    top = (
      <div>
        <Card style={{ padding: "22px 30px", height: 220, ...pop(0, { rise: 40, scale: 0.94 }) }}>
          <div style={{ fontFamily: MONO, fontSize: 19, color: "#77756D", letterSpacing: 2 }}>SCRIPT.TXT</div>
          {(data.script as string[]).map((t, i) => (
            <div key={i} style={{ fontFamily: BODY, fontSize: 28, fontWeight: 500, marginTop: 10, ...pop(c("paste", 4) + i * 4, { rise: 10, scale: 1 }) }}>
              {t}
            </div>
          ))}
        </Card>
        <Card style={{ marginTop: 22, padding: "18px 28px", height: 240, ...pop(c("free", 40) - 8, { rise: 30, scale: 0.94 }) }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30 }}>AI voice</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: on ? "#2E7D32" : "#77756D" }}>{on ? "● Free · Edge TTS" : "Off"}</div>
            </div>
            <div style={{ width: 92, height: 50, borderRadius: 25, background: on ? C.charcoal : "#D5D1C4", position: "relative" }}>
              <div style={{ position: "absolute", top: 5, left: 5 + knob * 42, width: 40, height: 40, borderRadius: "50%", background: on ? C.lime : C.cream }} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Waveform at={c("voice", 50)} w={860} h={70} />
          </div>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 24, color: "#55534C", marginTop: 6, ...pop(c("record", 70), { scale: 1 }) }}>🎙 or record your own</div>
        </Card>
      </div>
    );
  } else if (hero === "prompt") {
    const s = c("scene", 40);
    top = (
      <div style={{ position: "relative", height: 500 }}>
        <div style={{ display: "flex", gap: 8, height: 70, marginTop: 30 }}>
          {[1.1, 0.8, 1.4, 1, 0.9, 1.2, 0.7].map((w, i) => (
            <div key={i} style={{ flex: w, borderRadius: 12, background: i % 3 === 1 ? C.lime : C.cream, ...pop(s + i * 3, { rise: 20, scale: 0.6 }) }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 3, height: 34, alignItems: "center", marginTop: 12, opacity: interpolate(frame, [c("word", 60), c("word", 60) + 10], [0, 1], clamp) }}>
          {new Array(70).fill(0).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6 + Math.abs(Math.sin(i * 1.1 + frame * 0.2)) * 26, background: C.stone, borderRadius: 2 }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 345, top: 190 }}>
          <Ring from={0} to={100} at={c("renders", 90)} dur={34} label="RENDERING" />
        </div>
        <Sticker at={c("build", 20)} text="return ↵" rotate={-4} style={{ left: 40, top: 300, background: C.cream }} until={c("scene", 40) + 20} />
      </div>
    );
  } else if (hero === "changes") {
    top = (
      <div style={{ position: "relative", height: 500, display: "flex", justifyContent: "center" }}>
        <Phone at={0} style={{ width: 270, height: 500, borderRadius: 44 }}>
          <Video src={staticFile("media/linkedin-reel.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Phone>
        <Sticker at={c("done", 60)} text="v2 ✓" sub="intro faster" rotate={6} style={{ right: 70, top: 120 }} />
      </div>
    );
  }

  return (
    <Bg>
      <StepHeader step={data.step} total={data.total ?? 7} title={data.title} />
      <Hero>
        {top}
        {term}
      </Hero>
      <span style={{ display: "none" }}>{D}</span>
    </Bg>
  );
};

// ------------------------------------------------------------------ save
export const TutSaveScene: React.FC<SceneProps> = ({ data }) => {
  const pop = usePop();
  return (
    <Bg>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 220, color: C.lime, lineHeight: 1, ...pop(0) }}>{data.title}</div>
        <div style={{ marginTop: 60 }}>
          <SaveIcon at={8} size={170} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 3, color: C.stone, marginTop: 40, ...pop(16) }}>{data.sub}</div>
      </div>
    </Bg>
  );
};

// ------------------------------------------------------------------ comment CTA
export const TutCtaScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const word = data.word as string;
  const typed = word.slice(0, Math.max(0, Math.floor((frame - c("comment", 6) - 10) * 0.8)));
  const posted = frame >= c("comment", 6) + 10 + word.length / 0.8 + 4;
  const items = data.items as { text: string; cue: string }[];
  return (
    <Bg>
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 150, color: C.cream, lineHeight: 1, ...pop(0) }}>Comment</div>
        <div style={{ marginTop: 18, background: C.lime, color: C.charcoal, borderRadius: 30, padding: "14px 46px", fontFamily: HEAD, fontWeight: 700, fontSize: 132, letterSpacing: -2, boxShadow: "0 24px 60px rgba(167,255,63,0.18)", ...pop(c("comment", 6) + 2, { scale: 0.5 }) }}>{word}</div>
        <Card style={{ width: 860, marginTop: 50, padding: "20px 26px", ...pop(c("comment", 6) + 8, { rise: 30 }) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.charcoal, color: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 22 }}>you</div>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 32, flex: 1 }}>
              {typed}
              {!posted ? <span style={{ color: "#8A887F" }}>▍</span> : null}
            </div>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, borderRadius: 999, padding: "8px 18px", background: posted ? C.charcoal : "#E2DED2", color: posted ? C.lime : "#8A887F" }}>{posted ? "✓ Posted" : "Post"}</div>
          </div>
          {items.map((it) => (
            <div key={it.text} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, padding: "14px 18px", borderRadius: 16, background: "#ECE9DF", fontFamily: BODY, fontWeight: 600, fontSize: 30, ...pop(c(it.cue, 60), { rise: 16, scale: 0.95 }) }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: C.lime, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>✓</span>
              {it.text}
            </div>
          ))}
        </Card>
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 2, color: C.stone, marginTop: 30, ...pop(c(items[items.length - 1]?.cue ?? "x", 90) + 10) }}>{data.note}</div>
      </div>
    </Bg>
  );
};

export const TUT_SCENES: Record<string, React.FC<SceneProps>> = {
  tutHook: TutHookScene,
  tutEasy: TutEasyScene,
  tutStep: TutStepScene,
  tutSave: TutSaveScene,
  tutCta: TutCtaScene,
};

export const _k = { EASE };
