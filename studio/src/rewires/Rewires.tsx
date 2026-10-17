import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND, C, clamp, EASE_IO } from "./brand";
import { Caption, Captions } from "./Captions";
import { Grain, SourceTag, Vignette } from "./fx";
import { LogoReveal } from "./LogoReveal";
import { isDark, SceneData, SCENES } from "./scenes";

export type Sfx = { src: string; at: number; volume?: number };
export type RewiresScene = {
  type: string;
  dur: number;
  vo: string | null;
  voAt?: number;
  data: SceneData;
  source?: string;
  transition?: "cut" | "wipe" | "fade";
  sfx?: Sfx[];
};
export type RewiresProps = {
  width: number;
  height: number;
  scenes: RewiresScene[];
  captions: Caption[];
  showCaptions: boolean;
  music: string | null;
  musicVolume: number;
  outro: { dur: number; sound: string | null };
};

export const calculateRewiresMetadata: CalculateMetadataFunction<RewiresProps> = ({ props }) => ({
  width: props.width,
  height: props.height,
  durationInFrames: Math.max(1, props.scenes.reduce((a, s) => a + s.dur, 0) + props.outro.dur),
});

/** Scene entrance: a hard cut by default; a wipe or a fade from black when the storyboard asks. */
const Entrance: React.FC<{ kind: RewiresScene["transition"]; children: React.ReactNode }> = ({ kind, children }) => {
  const frame = useCurrentFrame();
  if (kind === "wipe") {
    const p = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: EASE_IO });
    return <AbsoluteFill style={{ clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }}>{children}</AbsoluteFill>;
  }
  if (kind === "fade") {
    return <AbsoluteFill style={{ opacity: interpolate(frame, [0, 9], [0, 1], clamp) }}>{children}</AbsoluteFill>;
  }
  return <>{children}</>;
};

export const Rewires: React.FC<RewiresProps> = ({ scenes, captions, showCaptions, music, musicVolume, outro }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const starts = scenes.map((_, i) => scenes.slice(0, i).reduce((a, s) => a + s.dur, 0));
  const bodyEnd = scenes.reduce((a, s) => a + s.dur, 0);
  const themes = scenes.map((s, i) => ({ from: starts[i], to: starts[i] + s.dur, dark: isDark(s.data) }));

  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      {scenes.map((s, i) => {
        const Scene = SCENES[s.type];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={s.dur} premountFor={fps} name={`${i} ${s.type}`}>
            <Entrance kind={s.transition}>
              {Scene ? <Scene data={s.data} /> : null}
              <Vignette strength={isDark(s.data) ? 0.5 : 0.12} />
              {s.source ? <SourceTag text={s.source} dark={isDark(s.data)} /> : null}
            </Entrance>
            {s.vo ? (
              <Sequence from={s.voAt ?? 0} premountFor={fps}>
                <Audio src={staticFile(s.vo)} />
              </Sequence>
            ) : null}
            {(s.sfx ?? []).map((x, j) => (
              <Sequence key={j} from={x.at} premountFor={fps}>
                <Audio src={staticFile(x.src)} volume={x.volume ?? 0.35} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}

      <Sequence from={bodyEnd} durationInFrames={outro.dur} name="outro" premountFor={fps}>
        <LogoReveal />
        {outro.sound ? <Audio src={staticFile(outro.sound)} volume={0.8} /> : null}
      </Sequence>

      <Grain opacity={0.06} />
      {showCaptions ? <Captions captions={captions} themes={themes} endFrame={bodyEnd} maxWords={BRAND.captions.maxWordsPerPage} /> : null}

      {music ? (
        <Audio
          src={staticFile(music)}
          volume={interpolate(frame, [0, 12, bodyEnd - 10, bodyEnd + 20, durationInFrames], [0, musicVolume, musicVolume, musicVolume * 0.5, 0], clamp)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
