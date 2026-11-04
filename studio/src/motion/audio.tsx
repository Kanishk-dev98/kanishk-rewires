/**
 * Soundtrack: voice-over lines, music bed and SFX with ducking, plus the stem switch used by pipeline/mix_check.py.
 *
 * Mix standard (do not change the voice to fix a mix; move the bed):
 *   musicUnderVo 0.12 · musicBetween 0.5 · sfxUnderVo 0.2 · sfxBetween 0.75 (start gains)
 *   voice >= 10 dB over the bed in every line, >= 4 dB over the loudest 100 ms of bed inside the line
 *   no spoken word on a hit: the voice starts >= 20 f after any impact
 *
 * Props contract (written by pipeline/build_vo_timeline.py):
 *   vo:    [{ src: "vo/<tag>/<id>.wav", at: <frame file starts>, speech: [<first word frame>, <last word end frame>] }]
 *   music: "music/<tag>.wav" | null
 *   stem:  undefined (full mix) | "vo" (voice only) | "bed" (music + sfx, with all ducking)
 *
 * Put every <Sfx> inside <Soundtrack sfx={...}> so it is ducked under speech and muted in the "vo" stem.
 */
import { Audio } from "@remotion/media";
import React from "react";
import { interpolate, staticFile, useVideoConfig } from "remotion";
import { cl } from "./core";

export type VoLine = { src: string; at: number; speech: [number, number] };
export type Mix = { musicUnderVo: number; musicBetween: number; sfxUnderVo: number; sfxBetween: number; voGain?: number };
export const MIX_START: Mix = { musicUnderVo: 0.12, musicBetween: 0.5, sfxUnderVo: 0.2, sfxBetween: 0.75 };

/** Per-frame gain for every Sfx (ducking under speech). Provided by Soundtrack. */
export const SfxGain = React.createContext<((frame: number) => number) | null>(null);

/** One sound effect from public/sfx/<name>.wav at absolute frame `at`. Typical peaks ≈ −24 dBFS (volume ~0.2 to 0.35). */
export const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 0.3 }) => {
  const gain = React.useContext(SfxGain);
  const from = Math.max(0, Math.round(at));
  return <Audio from={from} src={staticFile(`sfx/${name}.wav`)} volume={gain ? (f) => volume * gain(from + f) : volume} />;
};

/** 0 while speech is on (with a 4 f guard), ramps to 1 over 14 f once the nearest line is that far away. */
export const awayFromSpeech = (vo: VoLine[], f: number, guard = 4, ramp = 14) => {
  const d = Math.min(1e9, ...vo.map(({ speech: [a, b] }) => (f < a ? a - f : f > b ? f - b : 0)));
  return Math.min(1, Math.max(0, (d - guard) / ramp));
};

/**
 * `dynamics`: optional [frame, level] keys for the bed (silence-then-slam, pre-reveal dips, the full drop on the
 * hero beat). Level multiplies the music only; 0 = silence (use ≤ 12 f gaps before a hit).
 */
export const Soundtrack: React.FC<{
  vo: VoLine[];
  music: string | null;
  mix?: Mix;
  stem?: "vo" | "bed";
  dynamics?: [number, number][];
  sfx?: React.ReactNode;
  muted?: boolean;
}> = ({ vo, music, mix = MIX_START, stem, dynamics, sfx, muted }) => {
  const { durationInFrames } = useVideoConfig();
  if (muted) return null;
  const vg = mix.voGain ?? 1;
  const dyn = (f: number) => (dynamics && dynamics.length > 1 ? interpolate(f, dynamics.map((k) => k[0]), dynamics.map((k) => k[1]), cl) : 1);
  const musicGain = (f: number) => {
    const a = awayFromSpeech(vo, f);
    const d = dyn(f);
    return (mix.musicUnderVo * Math.min(1, d) + (mix.musicBetween * d - mix.musicUnderVo * Math.min(1, d)) * a) * interpolate(f, [0, 2, durationInFrames - 4, durationInFrames], [0, 1, 1, 0], cl);
  };
  const sfxGain = (f: number) => (stem === "vo" ? 0 : mix.sfxUnderVo + (mix.sfxBetween - mix.sfxUnderVo) * awayFromSpeech(vo, f));
  return (
    <>
      <SfxGain.Provider value={sfxGain}>{sfx}</SfxGain.Provider>
      {stem === "bed" ? null : vo.map((l) => <Audio key={l.src} from={Math.max(0, l.at)} src={staticFile(l.src)} volume={vg} />)}
      {music && stem !== "vo" ? <Audio src={staticFile(music)} volume={(f) => musicGain(f)} /> : null}
    </>
  );
};
