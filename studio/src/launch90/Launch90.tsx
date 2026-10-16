import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Sweep } from "../film/kit";
import { A, beat } from "../apolio/kitA";
import { L1, L2, L3, L4, L5, L6, L7, L8, L9, SL } from "./scenes";

export const LAUNCH90_FRAMES = 2700; // 90 s at 30 fps = 180 beats at 120 BPM

/** Chapter start beats from the storyboard (0:00, 0:08, 0:15, 0:30, 0:45, 0:55, 1:05, 1:15, 1:22). */
const SCENES: { id: string; from: number; C: React.FC<SL>; sweep?: boolean }[] = [
  { id: "Open", from: 0, C: L1 },
  { id: "Word roll", from: 16, C: L2 },
  { id: "Set the rules", from: 30, C: L3, sweep: true },
  { id: "Every payment, checked", from: 60, C: L4, sweep: true },
  { id: "Wallets that just work", from: 90, C: L5, sweep: true },
  { id: "Pay per call", from: 110, C: L6, sweep: true },
  { id: "One more thing", from: 130, C: L7 },
  { id: "Real world", from: 150, C: L8, sweep: true },
  { id: "Thesis and close", from: 164, C: L9 },
];

export const Launch90: React.FC<{ music: string | null }> = ({ music }) => {
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
