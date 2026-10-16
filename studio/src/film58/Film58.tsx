import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { bf, K } from "./kit58";
import { S, S1, S10, S11, S12, S2, S3, S4, S5, S6, S7, S8, S9 } from "./scenes58";

export const BRAND58_FRAMES = 1740; // 58 s at 30 fps

/** Scene start beats (118 BPM), quantized from the brief's timestamps. */
export const SCENES58: { id: string; from: number; C: React.FC<S> }[] = [
  { id: "S1 Agents do the work", from: 0, C: S1 },
  { id: "S2 They pay for it", from: 8, C: S2 },
  { id: "S3 So who said yes?", from: 16, C: S3 },
  { id: "S4 Agent Interface + rules", from: 22, C: S4 },
  { id: "S5 Embedded Wallet", from: 35, C: S5 },
  { id: "S6 Identity", from: 43, C: S6 },
  { id: "S7 Discovery + Payments", from: 51, C: S7 },
  { id: "S8 KYI allow", from: 61, C: S8 },
  { id: "S9 KYI ask", from: 69, C: S9 },
  { id: "S10 HERO hold", from: 77, C: S10 },
  { id: "S11 Stack coda", from: 90, C: S11 },
  { id: "S12 End card", from: 102, C: S12 },
];

export type Brand58Props = { music: string | null };

export const Brand58: React.FC<Brand58Props> = ({ music }) => {
  const { durationInFrames, fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      {SCENES58.map((s, k) => {
        const start = bf(s.from);
        const end = k + 1 < SCENES58.length ? bf(SCENES58[k + 1].from) : durationInFrames;
        const B = (b: number) => bf(s.from + b) - start;
        return (
          <Sequence key={s.id} from={start} durationInFrames={end - start} name={s.id} premountFor={fps}>
            <s.C B={B} dur={end - start} />
          </Sequence>
        );
      })}
      {music ? <Audio src={staticFile(music)} /> : null}
    </AbsoluteFill>
  );
};
