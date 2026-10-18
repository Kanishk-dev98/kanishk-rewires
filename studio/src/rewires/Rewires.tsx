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
import { Img } from "remotion";
import { BRAND, C, clamp, EASE, EASE_IO, MONO } from "./brand";
import { Caption, Captions } from "./Captions";
import { Grain, SourceTag, Vignette } from "./fx";
import { LogoReveal } from "./LogoReveal";
import { isDark, SceneData, SCENES as TYPE_SCENES } from "./scenes";
import { CINE_SCENES } from "./cineScenes";
import { PROMO_SCENES } from "./promo";
import { HEAT_SCENES } from "./heat";
import { GEM_SCENES } from "./gemini";
import { TUT_SCENES } from "./tutScenes";
import { UI_SCENES } from "./uiScenes";

const SCENES = { ...TYPE_SCENES, ...UI_SCENES, ...TUT_SCENES, ...CINE_SCENES, ...PROMO_SCENES, ...HEAT_SCENES, ...GEM_SCENES };

export type Sfx = { src: string; at: number; volume?: number };
export type RewiresScene = {
  type: string;
  dur: number;
  vo: string | null;
  voAt?: number;
  data: SceneData;
  source?: string;
  transition?: "cut" | "wipe" | "fade" | "rise";
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
  outro: { dur: number; sound: string | null; nodes?: string[]; cta?: string; size?: number; wordSize?: number };
  /** Small persistent brand mark, and an optional step rail (scene data.layer picks the active step). */
  chrome?: { bug?: boolean; rail?: string[] };
  captionStyle?: { top?: number; size?: number; maxWords?: number; weight?: number };
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
  if (kind === "rise") {
    const p = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: EASE });
    return <AbsoluteFill style={{ opacity: 0.35 + 0.65 * p, translate: `0 ${(1 - p) * 70}px` }}>{children}</AbsoluteFill>;
  }
  if (kind === "fade") {
    return <AbsoluteFill style={{ opacity: interpolate(frame, [0, 9], [0, 1], clamp) }}>{children}</AbsoluteFill>;
  }
  return <>{children}</>;
};

/** Small brand mark, top left: the monogram plus the wordmark in mono. Deliberately quiet. */
const BrandBug: React.FC<{ until: number }> = ({ until }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  if (frame >= until) return null;
  const op = interpolate(frame, [4, 16, until - 10, until], [0, 0.9, 0.9, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 80 * u, top: 140 * u, display: "flex", alignItems: "center", gap: 12 * u, opacity: op }}>
      <Img src={staticFile(BRAND.logo.monogramPublic)} style={{ width: 40 * u, height: 40 * u }} />
      <span style={{ fontFamily: MONO, fontSize: 17 * u, letterSpacing: 3 * u, color: C.stone }}>{BRAND.wordmark.left + BRAND.wordmark.dot + BRAND.wordmark.right}</span>
    </div>
  );
};

/** Five-step progress rail, top right. */
const Rail: React.FC<{ steps: string[]; active: number; until: number }> = ({ steps, active, until }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  if (frame >= until) return null;
  const op = interpolate(frame, [4, 16, until - 10, until], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", right: 80 * u, top: 150 * u, display: "flex", gap: 8 * u, opacity: op }}>
      {steps.map((s, i) => (
        <div
          key={s}
          style={{
            width: (i === active ? 64 : 30) * u,
            height: 8 * u,
            borderRadius: 4 * u,
            background: i === active ? C.lime : i < active ? C.stone : C.graphite,
          }}
        />
      ))}
    </div>
  );
};

export const Rewires: React.FC<RewiresProps> = ({ scenes, captions, showCaptions, music, musicVolume, outro, chrome, captionStyle }) => {
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
              {/^(p|h|g)[A-Z]/.test(s.type) ? null : <Vignette strength={isDark(s.data) ? 0.5 : 0.12} />}
              {s.source ? <SourceTag text={s.source} dark={isDark(s.data)} captionTop={showCaptions ? captionStyle?.top : undefined} /> : null}
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
        <LogoReveal nodes={outro.nodes} cta={outro.cta} size={outro.size} wordSize={outro.wordSize} />
        {outro.sound ? <Audio src={staticFile(outro.sound)} volume={0.8} /> : null}
      </Sequence>

      {chrome?.bug ? <BrandBug until={bodyEnd} /> : null}
      {chrome?.rail
        ? (() => {
            const idx = scenes.findIndex((s, i) => frame >= starts[i] && frame < starts[i] + s.dur);
            const active = idx >= 0 ? (scenes[idx].data.layer ?? -1) : -1;
            return <Rail steps={chrome.rail} active={active} until={bodyEnd} />;
          })()
        : null}
      <Grain opacity={0.06} />
      {showCaptions ? <Captions captions={captions} themes={themes} endFrame={bodyEnd} maxWords={captionStyle?.maxWords ?? BRAND.captions.maxWordsPerPage} top={captionStyle?.top} size={captionStyle?.size} weight={captionStyle?.weight} /> : null}

      {music ? (
        <Audio
          src={staticFile(music)}
          volume={interpolate(frame, [0, 12, bodyEnd - 10, bodyEnd + 20, durationInFrames], [0, musicVolume, musicVolume, musicVolume * 0.5, 0], clamp)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
