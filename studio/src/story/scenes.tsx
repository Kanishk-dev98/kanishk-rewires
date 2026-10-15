import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BODY,
  Burst,
  Camera,
  clamp,
  CREAM,
  DISPLAY,
  easeInOut,
  easeOut,
  Flash,
  INK,
  MUTED,
  NIGHT,
  PALETTE,
  Particles,
  Shockwave,
  Streaks,
} from "./fx";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type SceneData = Record<string, any>;
export type SceneProps = { data: SceneData; accent: string };

const Sfx: React.FC<{ name: string; at?: number; volume?: number }> = ({ name, at = 0, volume = 1 }) => (
  <Audio from={Math.max(0, at)} src={staticFile(`sfx/${name}.wav`)} volume={volume} />
);

const Kicker: React.FC<{ children: React.ReactNode; color: string; opacity?: number }> = ({
  children,
  color,
  opacity = 1,
}) => (
  <div
    style={{
      fontFamily: BODY,
      fontSize: 40,
      fontWeight: 700,
      letterSpacing: 14,
      color,
      opacity,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

/** Massive word that slams in on the sync frame with blur + overshoot. */
const SlamText: React.FC<{ text: string; at: number; size: number; style?: React.CSSProperties }> = ({
  text,
  at,
  size,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 160 } });
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 0.95,
        textAlign: "center",
        scale: String(interpolate(s, [0, 1], [2.4, 1])),
        opacity: interpolate(frame - at, [0, 3], [0, 1], clamp),
        filter: `blur(${interpolate(frame - at, [0, 6], [18, 0], clamp)}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/* ---------------- slam ---------------- */
export const SlamScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const at = data.syncFrame ?? 8;
  const dark = data.dark !== false;
  const c = data.color as string;
  return (
    <AbsoluteFill style={{ background: dark ? NIGHT : CREAM }}>
      <Camera push={0.08} shakeAt={at} shakeAmount={26}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 45%, ${c}${dark ? "66" : "33"} 0%, transparent 55%)`,
            opacity: interpolate(frame, [at - 4, at + 6], [0.3, 1], clamp),
          }}
        />
        {dark ? <Streaks color={c} /> : null}
        <Particles count={40} color={dark ? c : PALETTE[3]} seed={`sl${c}`} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
          <Kicker color={dark ? "#C9CEDA" : MUTED} opacity={interpolate(frame, [0, 10], [0, 1], clamp)}>
            {data.kicker}
          </Kicker>
          <div style={{ height: 40 }} />
          <SlamText
            text={data.big}
            at={at}
            size={205}
            style={{
              background: dark
                ? `linear-gradient(180deg, #ffffff 0%, ${c} 85%)`
                : `linear-gradient(180deg, ${c} 0%, #057A55 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: `drop-shadow(0 0 40px ${c}88)`,
            }}
          />
        </AbsoluteFill>
      </Camera>
      {data.flash ? <Flash at={0} length={10} /> : null}
      <Flash at={at} length={8} color={c} />
      <Sfx name="whoosh" volume={0.7} />
      <Sfx name="impact" at={at} volume={0.9} />
    </AbsoluteFill>
  );
};

/* ---------------- title ---------------- */
export const TitleScene: React.FC<SceneProps> = ({ data, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  const shine = interpolate(frame, [10, 70], [-100, 200], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #12203A 0%, ${NIGHT} 70%)` }}>
      <Camera push={0.1}>
        <Particles count={90} color="#9CC9FF" seed="title" speed={0.6} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Kicker color="#9AA6BF" opacity={t}>
            {data.kicker}
          </Kicker>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 196,
              marginTop: 26,
              opacity: t,
              scale: String(interpolate(t, [0, 1], [0.85, 1])),
              letterSpacing: interpolate(t, [0, 1], [40, 2]),
              background: `linear-gradient(100deg, #8D97AD 0%, #ffffff ${shine - 20}%, ${accent} ${shine}%, #ffffff ${shine + 20}%, #8D97AD 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: `drop-shadow(0 10px 40px ${accent}55)`,
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 64,
              letterSpacing: 40,
              color: accent,
              marginTop: 10,
              opacity: interpolate(frame, [25, 40], [0, 1], clamp),
            }}
          >
            {data.sub}
          </div>
          <div
            style={{
              width: interpolate(frame, [20, 60], [0, 760], { ...clamp, easing: easeOut }),
              height: 4,
              marginTop: 40,
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }}
          />
        </AbsoluteFill>
      </Camera>
      <Sfx name="boom" volume={0.9} />
      <Sfx name="whoosh" at={4} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ---------------- counter ---------------- */
export const CounterScene: React.FC<SceneProps> = ({ data, accent }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [8, 80], [0, 1], { ...clamp, easing: easeInOut });
  const value = Math.round(p * data.to);
  const cols = 20;
  const rows = 15;
  const total = cols * rows;
  const lit = Math.round(p * total);
  const cmp = interpolate(frame, [70, 100], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Camera push={0.05}>
        <div
          style={{
            position: "absolute",
            top: 210,
            width: "100%",
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 170,
            color: INK,
            letterSpacing: 1,
          }}
        >
          {value.toLocaleString("en-US")}
        </div>
        <div style={{ position: "absolute", top: 420, width: "100%", textAlign: "center" }}>
          <Kicker color={MUTED}>{String(data.label).toUpperCase()}</Kicker>
        </div>
        <div
          style={{
            position: "absolute",
            top: 520,
            left: 120,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 32px)`,
            gap: 10,
          }}
        >
          {new Array(total).fill(0).map((_, i) => {
            const on = i < lit;
            const color = PALETTE[Math.floor(random(`d${i}`) * PALETTE.length)];
            return (
              <div
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: on ? color : "#E9E2D3",
                  scale: on ? "1" : "0.7",
                  boxShadow: on ? `0 4px 10px ${color}55` : undefined,
                }}
              />
            );
          })}
        </div>
        <div style={{ position: "absolute", top: 1470, left: 120, right: 120, opacity: cmp }}>
          {[
            { label: "Germany", v: 84, c: "#F4B400" },
            { label: "100M users", v: 100, c: accent },
          ].map((b) => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
              <div style={{ width: 230, fontFamily: BODY, fontWeight: 800, fontSize: 36, color: INK }}>
                {b.label}
              </div>
              <div
                style={{
                  height: 40,
                  width: (b.v / 100) * 560 * cmp,
                  borderRadius: 10,
                  background: b.c,
                }}
              />
              <div style={{ marginLeft: 16, fontFamily: BODY, fontWeight: 800, fontSize: 36, color: INK }}>
                {b.v}M
              </div>
            </div>
          ))}
        </div>
      </Camera>
      {new Array(18).fill(0).map((_, i) => (
        <Sfx key={i} name="tick" at={8 + i * 4} volume={0.25} />
      ))}
      <Sfx name="ding" at={82} volume={0.35} />
    </AbsoluteFill>
  );
};

/* ---------------- app ---------------- */
export const AppScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: easeOut });
  const target = parseFloat(data.num);
  const count = interpolate(frame, [6, 34], [0, target], { ...clamp, easing: easeOut });
  const shown = Number.isInteger(target) ? Math.round(count).toString() : count.toFixed(1);
  const nameS = spring({ frame: frame - 2, fps, config: { damping: 200 } });
  const factS = spring({ frame: frame - 26, fps, config: { damping: 14 } });
  const glitch = data.glitch ? Math.sin(frame * 1.7) * 8 * (random(`g${Math.floor(frame / 3)}`) > 0.6 ? 1 : 0) : 0;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(155deg, ${data.from} 0%, ${data.to} 100%)`,
        transform: `translateX(${interpolate(enter, [0, 1], [380, 0])}px) skewX(${interpolate(enter, [0, 1], [-8, 0])}deg)`,
        filter: `blur(${interpolate(enter, [0, 1], [12, 0])}px)`,
      }}
    >
      <Camera push={0.07}>
        {/* rotating ring + diagonal stripes for depth */}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              width: 1300,
              height: 1300,
              borderRadius: "50%",
              border: "3px dashed rgba(255,255,255,0.18)",
              rotate: `${frame * 0.4}deg`,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            background:
              "repeating-linear-gradient(-35deg, rgba(255,255,255,0.05) 0 60px, transparent 60px 140px)",
            translate: `${(frame * 2) % 200}px 0px`,
          }}
        />
        <Particles count={35} color="#ffffff" seed={data.name} speed={0.8} />
        <div style={{ position: "absolute", top: 150, left: 90 }}>
          <Kicker color="rgba(255,255,255,0.75)">{`CONTENDER #${data.rank}`}</Kicker>
        </div>
        <div
          style={{
            position: "absolute",
            top: 260,
            width: "100%",
            textAlign: "center",
            fontFamily: BODY,
            fontWeight: 900,
            fontSize: 120,
            color: "white",
            letterSpacing: -3,
            opacity: nameS,
            translate: `0px ${interpolate(nameS, [0, 1], [40, 0])}px`,
            textShadow: data.glitch ? `${glitch}px 0 #25F4EE, ${-glitch}px 0 #FE2C55` : "0 10px 40px rgba(0,0,0,0.35)",
          }}
        >
          {data.name}
        </div>
        <div
          style={{
            position: "absolute",
            top: 430,
            width: "100%",
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 520,
            lineHeight: 1,
            color: "white",
            textShadow: data.glitch
              ? `${glitch * 1.5}px 0 #25F4EE, ${-glitch * 1.5}px 0 #FE2C55, 0 20px 80px rgba(0,0,0,0.4)`
              : "0 20px 80px rgba(0,0,0,0.4)",
          }}
        >
          {shown}
        </div>
        <div
          style={{
            position: "absolute",
            top: 980,
            width: "100%",
            textAlign: "center",
            fontFamily: BODY,
            fontWeight: 900,
            fontSize: 84,
            letterSpacing: 30,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {data.unit}
        </div>
        <div style={{ position: "absolute", top: 1130, width: "100%", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              padding: "22px 44px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
              border: "2px solid rgba(255,255,255,0.35)",
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 44,
              color: "white",
              opacity: factS,
              scale: String(interpolate(factS, [0, 1], [0.8, 1])),
            }}
          >
            {data.fact}
          </div>
        </div>
      </Camera>
      <Sfx name="whip" volume={0.6} />
      <Sfx name="tick" at={34} volume={0.5} />
    </AbsoluteFill>
  );
};

/* ---------------- race ---------------- */
export const RaceScene: React.FC<SceneProps> = ({ data, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = data.items as { label: string; value: number; display: string; color: string }[];
  const max = Math.max(...items.map((i) => i.value));
  const last = items.length - 1;
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Camera push={0.05}>
        <div
          style={{
            position: "absolute",
            top: 190,
            left: 80,
            right: 80,
            fontFamily: DISPLAY,
            fontSize: 104,
            color: INK,
            lineHeight: 1,
            opacity: interpolate(frame, [0, 12], [0, 1], clamp),
          }}
        >
          {String(data.title).toUpperCase()}
        </div>
        <div style={{ position: "absolute", top: 360, left: 80, right: 80 }}>
          {items.map((it, i) => {
            const s = spring({ frame: frame - 8 - i * 6, fps, config: { damping: 200 } });
            const grow = interpolate(frame - 12 - i * 6, [0, 40], [0, 1], { ...clamp, easing: easeOut });
            const isQ = i === last;
            const pulse = isQ ? 1 + Math.sin(frame / 4) * 0.08 : 1;
            return (
              <div key={it.label} style={{ display: "flex", alignItems: "center", height: 120, opacity: s }}>
                <div
                  style={{
                    width: 290,
                    flexShrink: 0,
                    textAlign: "right",
                    paddingRight: 28,
                    fontFamily: BODY,
                    fontWeight: 800,
                    fontSize: 42,
                    whiteSpace: "nowrap",
                    color: isQ ? accent : INK,
                  }}
                >
                  {it.label}
                </div>
                <div
                  style={{
                    height: 70,
                    width: Math.max(isQ ? 0 : 16, (it.value / max) * 450 * grow),
                    borderRadius: 14,
                    background: `linear-gradient(90deg, ${it.color}CC, ${it.color})`,
                    boxShadow: `0 8px 20px ${it.color}44`,
                  }}
                />
                <div
                  style={{
                    marginLeft: 20,
                    fontFamily: isQ ? DISPLAY : BODY,
                    fontWeight: 800,
                    fontSize: isQ ? 96 : 42,
                    color: isQ ? accent : INK,
                    scale: String(pulse),
                    opacity: interpolate(frame - 30 - i * 6, [0, 10], [0, 1], clamp),
                  }}
                >
                  {it.display}
                </div>
              </div>
            );
          })}
        </div>
      </Camera>
      <Sfx name="whoosh" volume={0.5} />
      {items.map((_, i) => (
        <Sfx key={i} name="mouse-click" at={12 + i * 6} volume={0.3} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- buildup ---------------- */
export const BuildupScene: React.FC<SceneProps> = ({ data, accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const at = data.syncFrame ?? 20;
  const chars = Math.floor(interpolate(frame, [at, at + 24], [0, data.date.length], clamp));
  const beat = (frame % 30) / 30;
  const tension = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      <Camera push={0.14} shakeAt={durationInFrames - 30} shakeAmount={10}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          {[0, 1, 2].map((i) => {
            const p = (beat + i / 3) % 1;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 300 + p * 1100,
                  height: 300 + p * 1100,
                  borderRadius: "50%",
                  border: `3px solid ${accent}`,
                  opacity: (1 - p) * (0.3 + tension * 0.7),
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent} 0%, ${accent}00 70%)`,
              scale: String(1 + Math.max(0, Math.sin(beat * Math.PI * 2)) * 0.25),
              opacity: 0.5 + tension * 0.5,
            }}
          />
        </AbsoluteFill>
        <Particles count={50} color={accent} seed="build" speed={0.4 + tension * 2} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 320 }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 150, color: "white", letterSpacing: 4 }}>
            {data.date.slice(0, chars)}
            <span style={{ opacity: frame % 16 < 8 ? 1 : 0, color: accent }}>|</span>
          </div>
          <div
            style={{
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: 50,
              color: "#C9CEDA",
              marginTop: 20,
              opacity: interpolate(frame, [at + 30, at + 45], [0, 1], clamp),
            }}
          >
            {data.line}
          </div>
        </AbsoluteFill>
      </Camera>
      <Sfx name="riser" at={durationInFrames - 92} volume={0.7} />
      {new Array(data.date.length).fill(0).map((_: unknown, i: number) => (
        <Sfx key={i} name="mouse-click" at={at + Math.round((i * 24) / data.date.length)} volume={0.25} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- reveal ---------------- */
export const RevealScene: React.FC<SceneProps> = ({ data, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = data.syncFrame ?? 40;
  const chip = spring({ frame: frame - 2, fps, config: { damping: 200 } });
  const card = spring({ frame: frame - 8, fps, config: { damping: 15 } });
  const countIn = spring({ frame: frame - (at - 34), fps, config: { damping: 200 } });
  const count = interpolate(frame, [at - 30, at], [data.countFrom, data.countTo], {
    ...clamp,
    easing: easeInOut,
  });
  const sub = spring({ frame: frame - at - 30, fps, config: { damping: 200 } });
  const glow = interpolate(frame, [at, at + 12], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Camera push={0.05} shakeAt={at} shakeAmount={24}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accent}${glow > 0 ? "30" : "10"} 0%, ${CREAM} 55%)`,
          }}
        />
        <Shockwave at={at} color={accent} rings={3} />
        <Burst at={at} count={36} />

        {/* Chip */}
        <div style={{ position: "absolute", top: 190, width: "100%", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 34px",
              borderRadius: 999,
              background: INK,
              color: "white",
              fontFamily: BODY,
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: 3,
              opacity: chip,
              translate: `0px ${interpolate(chip, [0, 1], [-30, 0])}px`,
            }}
          >
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: accent, boxShadow: `0 0 16px ${accent}` }} />
            {data.chip}
          </div>
        </div>

        {/* Milestone 1 card */}
        <div style={{ position: "absolute", top: 330, left: 110, right: 110 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 36,
              padding: "36px 40px",
              borderRadius: 36,
              background: "white",
              boxShadow: "0 24px 60px rgba(20,22,28,0.12)",
              opacity: card,
              scale: String(interpolate(card, [0, 1], [0.85, 1])),
            }}
          >
            <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1, color: accent }}>{data.aNum}</div>
            <div style={{ fontFamily: BODY, color: INK }}>
              <div style={{ fontSize: 40, fontWeight: 600, color: MUTED }}>{data.aLabel}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 96, lineHeight: 1 }}>{data.aBig}</div>
            </div>
          </div>
        </div>

        {/* Milestone 2: counter + slam */}
        <div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center" }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 132,
              lineHeight: 1,
              color: INK,
              opacity: countIn,
              letterSpacing: 1,
            }}
          >
            {Math.round(count).toLocaleString("en-US")}
          </div>
          <div style={{ marginTop: 6, opacity: countIn }}>
            <Kicker color={MUTED}>{data.countLabel}</Kicker>
          </div>
          <div style={{ height: 40 }} />
          <SlamText
            text={data.big}
            at={at}
            size={215}
            style={{
              background: `linear-gradient(180deg, ${accent} 0%, #067A52 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: `drop-shadow(0 16px 44px ${accent}66)`,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: 1490,
            left: 120,
            right: 120,
            textAlign: "center",
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 38,
            color: INK,
            opacity: sub,
          }}
        >
          {data.sub}
        </div>
      </Camera>
      <Flash at={0} length={14} />
      <Flash at={at} length={8} />
      <Sfx name="shutter-modern" volume={0.5} />
      <Sfx name="whoosh" at={6} volume={0.4} />
      {new Array(10).fill(0).map((_, i) => (
        <Sfx key={i} name="tick" at={at - 30 + i * 3} volume={0.25} />
      ))}
      <Sfx name="impact" at={at} volume={1} />
      <Sfx name="boom" at={at} volume={0.8} />
    </AbsoluteFill>
  );
};

/* ---------------- chat ---------------- */
export const ChatScene: React.FC<SceneProps> = ({ data, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = spring({ frame, fps, config: { damping: 200 } });
  const typed = Math.floor(interpolate(frame, [10, 50], [0, data.prompt.length], clamp));
  const sent = frame >= 56;
  const answerWords = String(data.answer).split(" ");
  const shownWords = Math.floor(interpolate(frame, [64, 110], [0, answerWords.length], clamp));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${CREAM} 0%, #F1E9DA 100%)` }}>
      <Camera push={0.05}>
        <div
          style={{
            position: "absolute",
            top: 260,
            left: 80,
            right: 80,
            height: 860,
            borderRadius: 48,
            background: "white",
            boxShadow: "0 40px 100px rgba(20,22,28,0.15)",
            padding: 56,
            opacity: card,
            translate: `0px ${interpolate(card, [0, 1], [120, 0])}px`,
            fontFamily: BODY,
          }}
        >
          <div style={{ display: "flex", gap: 14, marginBottom: 50 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 22, height: 22, borderRadius: "50%", background: c }} />
            ))}
          </div>
          {sent ? (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
              <div
                style={{
                  background: INK,
                  color: "white",
                  borderRadius: 32,
                  padding: "26px 34px",
                  fontSize: 40,
                  fontWeight: 600,
                  maxWidth: 700,
                }}
              >
                {data.prompt}
              </div>
            </div>
          ) : null}
          {sent ? (
            <div style={{ display: "flex", gap: 22 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: `conic-gradient(${accent}, #1D9BF0, #7B61FF, ${accent})`,
                  rotate: `${frame * 3}deg`,
                }}
              />
              <div style={{ fontSize: 42, lineHeight: 1.4, color: INK, fontWeight: 500 }}>
                {answerWords.slice(0, shownWords).join(" ")}
              </div>
            </div>
          ) : null}
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              bottom: 40,
              borderRadius: 999,
              border: `3px solid ${sent ? "#E6E0D4" : accent}`,
              padding: "26px 34px",
              fontSize: 38,
              color: sent ? "#B0B4BE" : INK,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{sent ? "Ask anything…" : data.prompt.slice(0, typed)}</span>
            <span
              style={{
                width: 56,
                height: 56,
                marginTop: -8,
                borderRadius: "50%",
                background: accent,
                scale: frame >= 52 && frame < 58 ? "0.8" : "1",
              }}
            />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 1190,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: 20,
          }}
        >
          {(data.tags as string[]).map((tag, i) => {
            const s = spring({ frame: frame - 90 - i * 10, fps, config: { damping: 12 } });
            return (
              <div
                key={tag}
                style={{
                  padding: "20px 32px",
                  borderRadius: 999,
                  background: PALETTE[(i * 2 + 1) % PALETTE.length],
                  color: "white",
                  fontFamily: BODY,
                  fontWeight: 800,
                  fontSize: 36,
                  scale: String(s),
                  rotate: `${(i - 1) * 3}deg`,
                }}
              >
                {tag}
              </div>
            );
          })}
        </div>
      </Camera>
      <Sfx name="mouse-click" at={54} volume={0.6} />
      <Sfx name="switch" at={64} volume={0.3} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="tick" at={90 + i * 10} volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- cta ---------------- */
export const CtaScene: React.FC<SceneProps & { handle: string }> = ({ data, accent, handle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const btn = spring({ frame: frame - 18, fps, config: { damping: 12 } });
  const clickAt = 52;
  const followed = frame >= clickAt;
  const cursorX = interpolate(frame, [24, clickAt - 4], [900, 600], { ...clamp, easing: easeInOut });
  const cursorY = interpolate(frame, [24, clickAt - 4], [1700, 1265], { ...clamp, easing: easeInOut });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #11283A 0%, ${NIGHT} 75%)` }}>
      <Camera push={0.05}>
        <Particles count={70} color={accent} seed="cta" speed={0.5} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 200 }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 150,
              lineHeight: 1,
              color: "white",
              textAlign: "center",
              padding: "0 80px",
              opacity: title,
              translate: `0px ${interpolate(title, [0, 1], [50, 0])}px`,
            }}
          >
            {data.cta}
          </div>
          <div
            style={{
              marginTop: 60,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "26px 54px",
              borderRadius: 999,
              background: followed ? "rgba(255,255,255,0.12)" : accent,
              border: `3px solid ${accent}`,
              scale: String(btn * (frame >= clickAt && frame < clickAt + 6 ? 0.92 : 1)),
              boxShadow: `0 0 60px ${accent}66`,
            }}
          >
            <span style={{ fontFamily: BODY, fontWeight: 900, fontSize: 54, color: "white" }}>
              {followed ? "Following ✓" : "Follow"}
            </span>
            <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 44, color: followed ? accent : "white" }}>
              {handle}
            </span>
          </div>
        </AbsoluteFill>
        <svg
          width="70"
          height="70"
          viewBox="0 0 24 24"
          style={{ position: "absolute", left: cursorX, top: cursorY, opacity: interpolate(frame, [24, 30], [0, 1], clamp) }}
        >
          <path d="M4 2l16 9-7 2-3 7z" fill="white" stroke={INK} strokeWidth="1.2" />
        </svg>
      </Camera>
      <Shockwave at={clickAt} color={accent} rings={2} />
      <Sfx name="whoosh" volume={0.5} />
      <Sfx name="mouse-click" at={clickAt} volume={0.8} />
      <Sfx name="ding" at={clickAt + 2} volume={0.4} />
    </AbsoluteFill>
  );
};
