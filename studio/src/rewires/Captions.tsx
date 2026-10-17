import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, ZONE } from "./brand";

export type Caption = { text: string; startMs: number; endMs: number; hl?: boolean };
export type ThemeSpan = { from: number; to: number; dark: boolean };

/** Group words into short pages: break on punctuation, pauses or the word limit. */
export const paginate = (captions: Caption[], maxWords: number): Caption[][] => {
  const pages: Caption[][] = [];
  let cur: Caption[] = [];
  captions.forEach((c, i) => {
    cur.push(c);
    const next = captions[i + 1];
    const gap = next ? next.startMs - c.endMs : Infinity;
    if (cur.length >= maxWords || /[.,?!:;]$/.test(c.text) || gap > 280) {
      pages.push(cur);
      cur = [];
    }
  });
  if (cur.length) pages.push(cur);
  return pages;
};

/**
 * Narration captions: modest size, fixed band below the content zone, no karaoke.
 * Only words flagged `hl` (chosen in the storyboard, at most one per scene) take the accent.
 */
export const Captions: React.FC<{ captions: Caption[]; themes: ThemeSpan[]; endFrame: number; maxWords: number }> = ({
  captions,
  themes,
  endFrame,
  maxWords,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  if (frame >= endFrame) return null;
  const ms = (frame / fps) * 1000;
  const pages = paginate(captions, maxWords);
  const idx = pages.findIndex((p, i) => {
    const nextStart = pages[i + 1]?.[0].startMs ?? Infinity;
    return ms >= p[0].startMs - 40 && ms < Math.min(nextStart - 40, p[p.length - 1].endMs + 450);
  });
  if (idx < 0) return null;
  const page = pages[idx];
  const startF = Math.round((page[0].startMs / 1000) * fps);
  const p = interpolate(frame, [startF - 1, startF + 5], [0, 1], { ...clamp, easing: EASE });
  const dark = (themes.find((t) => frame >= t.from && frame < t.to) ?? { dark: true }).dark;

  return (
    <div
      style={{
        position: "absolute",
        left: 80 * u,
        right: 80 * u,
        top: height * ZONE.captionTop,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: `0 ${14 * u}px`,
        opacity: p,
        translate: `0 ${(1 - p) * 10 * u}px`,
        fontFamily: BODY,
        fontWeight: 600,
        fontSize: 46 * u,
        lineHeight: 1.25,
        color: dark ? C.cream : C.charcoal,
        textAlign: "center",
      }}
    >
      {page.map((w) => (
        <span
          key={w.startMs}
          style={
            w.hl
              ? dark
                ? { color: C.lime }
                : { backgroundImage: `linear-gradient(${C.lime}, ${C.lime})`, backgroundSize: "100% 0.3em", backgroundPosition: "0 90%", backgroundRepeat: "no-repeat" }
              : undefined
          }
        >
          {w.text}
        </span>
      ))}
    </div>
  );
};
