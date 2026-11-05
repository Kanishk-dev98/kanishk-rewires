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
import { Caption, Captions, HeadlineCaptions } from "./Captions";
import { Grain, SourceTag, Vignette } from "./fx";
import { LogoReveal } from "./LogoReveal";
import { isDark, SceneData, SCENES as TYPE_SCENES } from "./scenes";
import { CINE_SCENES } from "./cineScenes";
import { PROMO_SCENES } from "./promo";
import { HEAT_SCENES } from "./heat";
import { GEM_SCENES } from "./gemini";
import { DECOY_SCENES } from "./decoy";
import { AD_SCENES } from "./adBreak";
import { MARKET_SCENES } from "./market";
import { FK_SCENES } from "./flipkart";
import { DX_SCENES } from "./decoyReel";
import { GROK_SCENES } from "./grok";
import { AGENT_THREAD_SCENES } from "./agentThread";
import { EXPLAINER_SCENES } from "./explainer";
import { SALES_MACHINE_SCENES } from "./salesMachine";
import { SALES_TEAM_SCENES } from "./salesTeam";
import { DUET_SCENES } from "./duet";
import { PHP2SHELL_SCENES } from "./php2shell";
import { PHP_FILM_SCENES } from "./phpFilm";
import { TUT_SCENES } from "./tutScenes";
import { UI_SCENES } from "./uiScenes";
import { REVIEW_SCENES } from "./reviewAds";
import { ADS_SCENES } from "./reviewAds2";

const SCENES = { ...TYPE_SCENES, ...UI_SCENES, ...TUT_SCENES, ...CINE_SCENES, ...PROMO_SCENES, ...HEAT_SCENES, ...GEM_SCENES, ...DECOY_SCENES, ...AD_SCENES, ...MARKET_SCENES, ...FK_SCENES, ...DX_SCENES, ...GROK_SCENES, ...AGENT_THREAD_SCENES, ...EXPLAINER_SCENES, ...SALES_MACHINE_SCENES, ...SALES_TEAM_SCENES, ...DUET_SCENES, ...PHP2SHELL_SCENES, ...PHP_FILM_SCENES, ...REVIEW_SCENES, ...ADS_SCENES };

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
  musicDucked?: number;
  outro: { dur: number; sound: string | null; nodes?: string[]; cta?: string; size?: number; wordSize?: number };
  /** Small persistent brand mark, and an optional step rail (scene data.layer picks the active step). */
  chrome?: { bug?: boolean; rail?: string[] };
  captionStyle?: { top?: number; size?: number; maxWords?: number; weight?: number; mode?: "bottom" | "headline" };
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

export const Rewires: React.FC<RewiresProps> = ({ scenes, captions, showCaptions, music, musicVolume, musicDucked, outro, chrome, captionStyle }) => {
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
              {Scene ? <Scene data={{ ...s.data, _world: { i, starts, durs: scenes.map((x) => x.dur), cues: scenes.map((x) => x.data?.cues ?? {}) } }} /> : null}
              {/^(p|h|g|d|a|m|f|x|s)[A-Z]/.test(s.type) ? null : <Vignette strength={isDark(s.data) ? 0.5 : 0.12} />}
              {s.source ? <SourceTag text={s.source} dark={isDark(s.data)} captionTop={showCaptions && captionStyle?.mode !== "headline" ? captionStyle?.top : undefined} /> : null}
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
      {showCaptions && captionStyle?.mode === "headline" ? <HeadlineCaptions captions={captions} themes={themes} endFrame={bodyEnd} maxWords={captionStyle?.maxWords ?? 6} top={captionStyle?.top} size={captionStyle?.size} /> : null}
      {showCaptions && captionStyle?.mode !== "headline" ? <Captions captions={captions} themes={themes} endFrame={bodyEnd} maxWords={captionStyle?.maxWords ?? BRAND.captions.maxWordsPerPage} top={captionStyle?.top} size={captionStyle?.size} weight={captionStyle?.weight} /> : null}

      {music ? (
        <Audio
          src={staticFile(music)}
          volume={(f: number) => {
            // Voice first: duck the bed under every spoken word, with ~200 ms ramps so it never pumps.
            const ms = (f / fps) * 1000;
            let d = Infinity;
            for (const c of captions) {
              if (ms >= c.startMs - 120 && ms <= c.endMs + 180) { d = 0; break; }
              d = Math.min(d, Math.abs(ms - (c.startMs - 120)), Math.abs(ms - (c.endMs + 180)));
            }
            const duck = musicDucked ?? musicVolume * 0.45;
            const level = d === 0 ? duck : interpolate(d, [0, 220], [duck, musicVolume], clamp);
            return level * interpolate(f, [0, 12, bodyEnd - 10, bodyEnd + 20, durationInFrames], [0, 1, 1, 0.5, 0], clamp);
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
