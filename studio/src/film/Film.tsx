import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, CalculateMetadataFunction, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { C, Chapter, clamp } from "./kit";
import { ColdOpen, Kyi, Problem, Reveal, Shift } from "./scenesA";
import { Close, Demo, Economy, Proof, Settlement } from "./scenesB";

export type FilmProps = { title: string; music: string | null; credit: string; chapters: Chapter[] };

export const calculateFilmMetadata: CalculateMetadataFunction<FilmProps> = ({ props }) => ({
  durationInFrames: Math.max(1, props.chapters.reduce((a, c) => a + c.dur, 0)),
});

const SCENES: Record<string, React.FC<{ ch: Chapter; credit?: string }>> = {
  cold_open: ColdOpen,
  reveal: Reveal,
  shift: Shift,
  problem: Problem,
  kyi: Kyi,
  settlement: Settlement,
  demo: Demo,
  economy: Economy,
  proof: Proof,
  close: Close,
};

export const Film: React.FC<FilmProps> = ({ music, credit, chapters }) => {
  const { fps, durationInFrames } = useVideoConfig();
  // Global narration windows, for ducking the score under the voice.
  const spans = chapters.flatMap((c) => c.lines.map((l) => [c.start + l.start, c.start + l.start + l.dur] as const));
  const duck = (f: number) => {
    // Distance (frames) to the nearest narration; 0 while the voice is speaking.
    const dist = Math.min(...spans.map(([a, b]) => (f < a ? a - f : f > b ? f - b : 0)));
    return 0.42 + 0.33 * Math.min(1, Math.max(0, (dist - 6) / 18));
  };
  return (
    <AbsoluteFill style={{ background: C.dark }}>
      {chapters.map((ch) => {
        const S = SCENES[ch.id];
        return S ? (
          <Sequence key={ch.id} from={ch.start} durationInFrames={ch.dur} premountFor={fps} name={ch.name}>
            <S ch={ch} credit={credit} />
          </Sequence>
        ) : null;
      })}
      {music ? (
        <Audio
          src={staticFile(music)}
          volume={(f) =>
            duck(f) * interpolate(f, [0, 30, durationInFrames - 90, durationInFrames], [0, 1, 1, 0], clamp)
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
