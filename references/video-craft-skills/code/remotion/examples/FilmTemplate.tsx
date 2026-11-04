/**
 * FilmTemplate: the composition shape the pipeline builder (pipeline/build_vo_timeline.py) writes props for.
 * Copy it per film, rename, and fill SCENES with one component per scene id.
 *
 * Props contract:
 *   totalFrames  total length (whole beats)
 *   scenes       [{ id, from, dur, lines: [{ at, end, text, words: [{ w, t, e }] }] }]   (frames; line/word frames are scene-local)
 *   vo           [{ src, at, speech: [a, b] }]                                          (absolute frames)
 *   music        "music/<tag>.wav" | null
 *   mix          start gains (see motion/audio.tsx)
 *   cues         { name: absoluteFrame } key moments computed once in the builder (hits, drops, reveals)
 *   stem         "vo" | "bed" for mix_check.py; qa: true for containment_check.py (flat black stages, no grain)
 */
import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, Sequence, useCurrentFrame } from "remotion";
import { BlurIn, FIG, LightStage, MIX_START, Mix, Soundtrack, T, VoLine, WordBuild } from "../motion";

export type Word = { w: string; t: number; e: number };
export type Line = { at: number; end: number; text: string; words: Word[] };
export type Scene = { id: string; from: number; dur: number; lines: Line[] };
export type FilmProps = { totalFrames: number; scenes: Scene[]; vo: VoLine[]; music: string | null; mix?: Mix; cues?: Record<string, number>; stem?: "vo" | "bed"; qa?: boolean };

export const calculateFilmMetadata: CalculateMetadataFunction<FilmProps> = ({ props }) => ({ durationInFrames: Math.max(1, props.totalFrames) });

/** Scene-local frame of the first word starting with `prefix` in line `li` (lock a visual to a spoken word). */
export const wordAt = (s: Scene, li: number, prefix: string, end = false) => {
  const w = s.lines[li]?.words.find((x) => x.w.toLowerCase().replace(/[.,:?!']/g, "").startsWith(prefix.toLowerCase()));
  if (!w) throw new Error(`${s.id}[${li}] has no word starting ${prefix}`);
  return end ? w.e : w.t;
};

/** Example scene: the line builds word by word on the VO word times (supers land 2 to 3 f before the word). */
const DefaultScene: React.FC<{ s: Scene; qa: boolean }> = ({ s, qa }) => {
  const f = useCurrentFrame();
  const line = s.lines.find((l) => f >= l.at - 6 && f <= l.end + 20) ?? s.lines[0];
  return (
    <LightStage qa={qa}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 160 }}>
        {line ? <WordBuild key={line.at} text={line.text} at={line.at - 3} every={Math.max(3, (line.end - line.at) / Math.max(1, line.words.length))} size={88} weight={700} /> : null}
      </AbsoluteFill>
      <BlurIn at={4} style={{ position: "absolute", left: 80, top: 80, fontFamily: FIG, fontSize: 26, color: T.muted }}>
        {s.id}
      </BlurIn>
    </LightStage>
  );
};

/** One entry per scene id. Each scene component receives its scene data and renders in scene-local frames. */
const SCENES: Record<string, React.FC<{ s: Scene; qa: boolean }>> = {};

export const FilmTemplate: React.FC<FilmProps> = ({ scenes, vo, music, mix = MIX_START, stem, qa = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {stem
      ? null
      : scenes.map((s) => {
          const C = SCENES[s.id] ?? DefaultScene;
          return (
            <Sequence key={s.id} from={s.from} durationInFrames={s.dur} premountFor={20}>
              <C s={s} qa={qa} />
            </Sequence>
          );
        })}
    <Soundtrack vo={vo} music={music} mix={mix} stem={stem} muted={qa} sfx={null} />
  </AbsoluteFill>
);
