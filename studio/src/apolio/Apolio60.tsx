import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Sweep } from "../film/kit";
import { A, beat } from "./kitA";
import { S1, S2, S3, S4, S5, SA } from "./scenesA";
import { S10, S6, S7, S8, S9 } from "./scenesB";

export const APOLIO_FRAMES = 1800; // 60 s at 30 fps = 120 beats at 120 BPM

/** Scene start beats: the script's timestamps land exactly on beats at 120 BPM. */
const SCENES: { id: string; from: number; C: React.FC<SA>; sweep?: boolean }[] = [
  { id: "S1 Meet Apolio", from: 0, C: S1 },
  { id: "S2 Where you work", from: 10, C: S2, sweep: true },
  { id: "S3 Smart wallet", from: 20, C: S3 },
  { id: "S4 Identity", from: 30, C: S4, sweep: true },
  { id: "S5 Rules", from: 40, C: S5, sweep: true },
  { id: "S6 Paid per call", from: 54, C: S6 },
  { id: "S7 You decide", from: 66, C: S7 },
  { id: "S8 Denied", from: 78, C: S8, sweep: true },
  { id: "S9 Receipts", from: 96, C: S9, sweep: true },
  { id: "S10 Close", from: 108, C: S10, sweep: true },
];

export type ApolioProps = { music: string | null };

export const Apolio60: React.FC<ApolioProps> = ({ music }) => {
  const { durationInFrames, fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: A.dark }}>
      {SCENES.map((s, k) => {
        const start = beat(s.from);
        const end = k + 1 < SCENES.length ? beat(SCENES[k + 1].from) : durationInFrames;
        return (
          <Sequence key={s.id} from={start} durationInFrames={end - start} name={s.id} premountFor={fps}>
            <s.C B={(b) => beat(b)} dur={end - start} />
          </Sequence>
        );
      })}
      {SCENES.filter((s) => s.sweep).map((s) => (
        <Sequence key={`sw${s.id}`} from={beat(s.from) - 8} durationInFrames={22} name={`sweep ${s.id}`}>
          <Sweep />
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(music)} /> : null}
    </AbsoluteFill>
  );
};
