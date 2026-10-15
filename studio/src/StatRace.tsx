import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export type StatItem = {
  label: string;
  value: number;
  display: string;
  color: string;
};

export type StatRaceTiming = {
  hookFrames: number;
  titleFrames: number;
  itemFrames: number[];
  revealFrames: number;
  ctaFrames: number;
};

export type StatRaceAudio = {
  hook: string;
  title: string;
  items: string[];
  reveal: string;
  cta: string;
  music: string;
} | null;

export type StatRaceProps = {
  hookTop: string;
  hookBig: string;
  title: string;
  items: StatItem[];
  revealBig: string;
  revealSub: string;
  cta: string;
  handle: string;
  source: string;
  accent: string;
  timing: StatRaceTiming;
  audio: StatRaceAudio;
};

// Light theme
const BG = "#FBF7F0";
const INK = "#14161C";
const MUTED = "#5E6472";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const schedule = (t: StatRaceTiming) => {
  const titleStart = t.hookFrames;
  const barsStart = titleStart + t.titleFrames;
  const barStarts = t.itemFrames.map(
    (_, i) => barsStart + t.itemFrames.slice(0, i).reduce((a, b) => a + b, 0),
  );
  const revealStart = barsStart + t.itemFrames.reduce((a, b) => a + b, 0);
  const ctaStart = revealStart + t.revealFrames;
  return { titleStart, barStarts, revealStart, ctaStart, total: ctaStart + t.ctaFrames };
};

export const calculateStatRaceMetadata: CalculateMetadataFunction<StatRaceProps> = ({ props }) => ({
  durationInFrames: schedule(props.timing).total,
});

const Background: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% ${28 + Math.sin(frame / 70) * 5}%, ${accent}1A 0%, ${BG} 50%, #F4EEE2 100%)`,
      }}
    />
  );
};

const Hook: React.FC<{ top: string; big: string; accent: string; end: number }> = ({
  top,
  big,
  accent,
  end,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = big.split(" ");
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
        textAlign: "center",
        opacity: interpolate(frame, [end - 10, end], [1, 0], clamp),
      }}
    >
      <div
        style={{
          fontSize: 60,
          fontWeight: 600,
          color: MUTED,
          marginBottom: 28,
          opacity: interpolate(frame, [0, 8], [0, 1], clamp),
        }}
      >
        {top}
      </div>
      <div style={{ fontSize: 124, fontWeight: 900, lineHeight: 1.05, color: INK, letterSpacing: -3 }}>
        {words.map((w, i) => {
          // Big line pops in roughly when the voiceover reaches its second sentence.
          const s = spring({ frame: frame - Math.round(end * 0.4) - i * 5, fps, config: { damping: 14 } });
          const isLast = i === words.length - 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 24,
                scale: String(interpolate(s, [0, 1], [0.6, 1])),
                opacity: s,
                color: isLast ? accent : INK,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const BarRow: React.FC<{
  item: StatItem;
  start: number;
  maxValue: number;
  isWinner: boolean;
  revealStart: number;
  accent: string;
}> = ({ item, start, maxValue, isWinner, revealStart, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - start;

  const enter = spring({ frame: local, fps, config: { damping: 200 } });
  const grow = interpolate(local, [6, 36], [0, 1], { ...clamp, easing: easeOut });
  const reveal = interpolate(frame, [revealStart, revealStart + 20], [0, 1], clamp);

  const BAR_MAX = 520;
  const width = Math.max(14, (item.value / maxValue) * BAR_MAX * grow);
  const color = isWinner ? accent : item.color;
  const dim = isWinner ? 1 : interpolate(reveal, [0, 1], [1, 0.25]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 120,
        opacity: enter * dim,
        translate: `${interpolate(enter, [0, 1], [-60, 0])}px 0px`,
        scale: isWinner ? String(interpolate(reveal, [0, 1], [1, 1.12])) : "1",
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          width: 250,
          fontSize: 46,
          fontWeight: 700,
          color: isWinner ? accent : INK,
          textAlign: "right",
          paddingRight: 28,
        }}
      >
        {item.label}
      </div>
      <div
        style={{
          width,
          height: 64,
          borderRadius: 12,
          background: `linear-gradient(90deg, ${color}D9, ${color})`,
          boxShadow: isWinner
            ? `0 0 ${12 + reveal * 36}px ${color}88`
            : `0 6px 16px ${color}33`,
        }}
      />
      <div
        style={{
          marginLeft: 22,
          fontSize: 44,
          fontWeight: 800,
          color: isWinner ? accent : INK,
          opacity: interpolate(local, [28, 40], [0, 1], clamp),
          whiteSpace: "nowrap",
        }}
      >
        {item.display}
      </div>
    </div>
  );
};

export const StatRace: React.FC<StatRaceProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { items, accent, timing, audio } = props;
  const { titleStart, barStarts, revealStart, ctaStart } = schedule(timing);

  const maxValue = Math.max(...items.map((i) => i.value));
  const winnerIndex = items.length - 1;

  const revealSpring = spring({ frame: frame - revealStart, fps, config: { damping: 12 } });
  const ctaSpring = spring({ frame: frame - ctaStart, fps, config: { damping: 200 } });
  const chartOut = interpolate(frame, [ctaStart - 10, ctaStart + 10], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: BG }}>
      <Background accent={accent} />

      {audio ? (
        <>
          <Audio
            src={staticFile(audio.music)}
            volume={interpolate(
              frame,
              [0, 20, durationInFrames - 45, durationInFrames],
              [0, 0.14, 0.14, 0],
              clamp,
            )}
          />
          <Audio src={staticFile(audio.hook)} premountFor={fps} />
          <Audio from={titleStart} src={staticFile(audio.title)} premountFor={fps} />
          {audio.items.map((src, i) => (
            <Audio key={src} from={barStarts[i]} src={staticFile(src)} premountFor={fps} />
          ))}
          <Audio from={revealStart} src={staticFile(audio.reveal)} premountFor={fps} />
          <Audio from={ctaStart} src={staticFile(audio.cta)} premountFor={fps} />
        </>
      ) : null}

      <Sequence durationInFrames={timing.hookFrames}>
        <Hook top={props.hookTop} big={props.hookBig} accent={accent} end={timing.hookFrames} />
      </Sequence>

      {/* Chart */}
      <AbsoluteFill style={{ opacity: chartOut }}>
        <div
          style={{
            position: "absolute",
            top: 230,
            left: 80,
            right: 80,
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1.08,
            color: INK,
            letterSpacing: -1.5,
            opacity: interpolate(frame, [titleStart, titleStart + 12], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [titleStart, titleStart + 15], [30, 0], { ...clamp, easing: easeOut })}px`,
          }}
        >
          {props.title}
        </div>
        <div style={{ position: "absolute", top: 540, left: 0, right: 80 }}>
          {items.map((item, i) => (
            <BarRow
              key={item.label}
              item={item}
              start={barStarts[i]}
              maxValue={maxValue}
              isWinner={i === winnerIndex}
              revealStart={revealStart}
              accent={accent}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            top: 1460,
            left: 80,
            right: 80,
            textAlign: "center",
            opacity: revealSpring,
            scale: String(interpolate(revealSpring, [0, 1], [0.7, 1])),
          }}
        >
          <div style={{ fontSize: 150, fontWeight: 900, color: accent, letterSpacing: -4 }}>
            {props.revealBig}
          </div>
          <div style={{ fontSize: 48, fontWeight: 600, color: INK, marginTop: 8 }}>
            {props.revealSub}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 110,
            left: 80,
            right: 80,
            textAlign: "center",
            fontSize: 28,
            color: MUTED,
            opacity: interpolate(frame, [titleStart + 20, titleStart + 40], [0, 1], clamp),
          }}
        >
          {props.source}
        </div>
      </AbsoluteFill>

      {/* CTA */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0 80px",
          opacity: ctaSpring,
          translate: `0px ${interpolate(ctaSpring, [0, 1], [60, 0])}px`,
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 900, color: INK, lineHeight: 1.1, letterSpacing: -2 }}>
          {props.cta}
        </div>
        <div
          style={{
            marginTop: 48,
            padding: "24px 52px",
            borderRadius: 999,
            background: accent,
            color: "white",
            fontSize: 56,
            fontWeight: 800,
            boxShadow: `0 12px 36px ${accent}55`,
          }}
        >
          {props.handle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
