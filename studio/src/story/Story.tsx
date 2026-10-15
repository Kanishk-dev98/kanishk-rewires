import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BODY, clamp, Grain, LightLeak, Vignette } from "./fx";
import {
  AppScene,
  BuildupScene,
  ChatScene,
  CounterScene,
  CtaScene,
  RaceScene,
  RevealScene,
  SceneData,
  SlamScene,
  TitleScene,
} from "./scenes";

export type StoryScene = { type: string; dur: number; vo: string | null; data: SceneData };
export type StoryCaption = { text: string; startMs: number; endMs: number };
export type StoryProps = {
  handle: string;
  accent: string;
  source: string;
  music: string | null;
  scenes: StoryScene[];
  captions: StoryCaption[];
};

export const calculateStoryMetadata: CalculateMetadataFunction<StoryProps> = ({ props }) => ({
  durationInFrames: Math.max(1, props.scenes.reduce((a, s) => a + s.dur, 0)),
});

// Scenes on a dark background get a light leak at their cut and a stronger vignette.
const DARK = new Set(["title", "buildup", "cta"]);
const LEAK_INTO = new Set(["title", "reveal", "cta"]);

const renderScene = (s: StoryScene, accent: string, handle: string) => {
  const props = { data: s.data, accent };
  switch (s.type) {
    case "slam":
      return <SlamScene {...props} />;
    case "title":
      return <TitleScene {...props} />;
    case "counter":
      return <CounterScene {...props} />;
    case "app":
      return <AppScene {...props} />;
    case "race":
      return <RaceScene {...props} />;
    case "buildup":
      return <BuildupScene {...props} />;
    case "reveal":
      return <RevealScene {...props} />;
    case "chat":
      return <ChatScene {...props} />;
    case "cta":
      return <CtaScene {...props} handle={handle} />;
    default:
      return null;
  }
};

/** Word-by-word captions in pages of up to 3 words; active word pops in the accent colour. */
const Captions: React.FC<{ captions: StoryCaption[]; accent: string }> = ({ captions, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const pages: StoryCaption[][] = [];
  let cur: StoryCaption[] = [];
  captions.forEach((c, i) => {
    cur.push(c);
    const next = captions[i + 1];
    const gap = next ? next.startMs - c.endMs : Infinity;
    if (cur.length === 3 || /[.,?!]$/.test(c.text) || gap > 250) {
      pages.push(cur);
      cur = [];
    }
  });
  if (cur.length) pages.push(cur);

  const page = pages.find((p, i) => {
    const end = pages[i + 1] ? Math.min(pages[i + 1][0].startMs, p[p.length - 1].endMs + 400) : p[p.length - 1].endMs + 400;
    return ms >= p[0].startMs && ms < end;
  });
  if (!page) return null;

  const pageIn = spring({ frame: frame - Math.round((page[0].startMs / 1000) * fps), fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", top: 1330, pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 34px",
          maxWidth: 900,
          scale: String(interpolate(pageIn, [0, 1], [0.85, 1])),
        }}
      >
        {page.map((w) => {
          const active = ms >= w.startMs && ms < w.endMs + 80;
          return (
            <span
              key={w.startMs}
              style={{
                fontFamily: BODY,
                fontWeight: 900,
                fontSize: 74,
                textTransform: "uppercase",
                color: active ? accent : "white",
                WebkitTextStroke: "14px #0B0C10",
                paintOrder: "stroke fill",
                scale: active ? "1.06" : "1",
                textShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Story: React.FC<StoryProps> = ({ handle, accent, source, music, scenes, captions }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const starts = scenes.map((_, i) => scenes.slice(0, i).reduce((a, s) => a + s.dur, 0));

  return (
    <AbsoluteFill style={{ background: "black" }}>
      {scenes.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={s.dur} premountFor={fps} name={`${i} ${s.type}`}>
          {renderScene(s, accent, handle)}
          <Vignette strength={DARK.has(s.type) ? 0.6 : 0.25} />
          {s.vo ? <Audio src={staticFile(s.vo)} premountFor={fps} /> : null}
        </Sequence>
      ))}

      {scenes.map((s, i) =>
        LEAK_INTO.has(s.type) ? (
          <Sequence key={`leak${i}`} from={Math.max(0, starts[i] - 12)} durationInFrames={36} premountFor={fps}>
            <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.85 }}>
              <LightLeak seed={i} hueShift={s.type === "reveal" ? 120 : 0} />
            </AbsoluteFill>
          </Sequence>
        ) : null,
      )}

      <Grain opacity={0.08} />
      <Captions captions={captions} accent={accent} />

      {/* Source credit + progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          width: "100%",
          textAlign: "center",
          fontFamily: BODY,
          fontSize: 24,
          fontWeight: 600,
          color: "rgba(255,255,255,0.75)",
          textShadow: "0 1px 6px rgba(0,0,0,0.6)",
        }}
      >
        {source}
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "rgba(0,0,0,0.15)" }}>
        <div
          style={{
            height: "100%",
            width: `${(frame / durationInFrames) * 100}%`,
            background: `linear-gradient(90deg, #FF4D6D, #FFD60A, ${accent}, #1D9BF0)`,
          }}
        />
      </div>

      {music ? (
        <Audio
          src={staticFile(music)}
          loop
          volume={interpolate(frame, [0, 20, durationInFrames - 60, durationInFrames], [0, 0.16, 0.16, 0], clamp)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
