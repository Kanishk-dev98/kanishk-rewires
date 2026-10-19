import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, SERIF, ZONE } from "./brand";

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
export const Captions: React.FC<{ captions: Caption[]; themes: ThemeSpan[]; endFrame: number; maxWords: number; top?: number; size?: number; weight?: number }> = ({
  captions,
  themes,
  endFrame,
  maxWords,
  top = ZONE.captionTop,
  size = 46,
  weight = 600,
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
        top: height * top,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: `0 ${14 * u}px`,
        opacity: p,
        translate: `0 ${(1 - p) * 10 * u}px`,
        fontFamily: BODY,
        fontWeight: weight,
        fontSize: size * u,
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

/**
 * Headline-mode captions (benchmark: ref-DepnbyJsLYK): the spoken line builds word by word near the top
 * as the on-screen headline, so text never appears twice. Accent words (`hl`) switch to italic serif lime
 * and the first one on each page gets a design-tool selection box with corner handles.
 */
export const HeadlineCaptions: React.FC<{ captions: Caption[]; themes: ThemeSpan[]; endFrame: number; maxWords: number; top?: number; size?: number }> = ({
  captions,
  themes,
  endFrame,
  maxWords,
  top = 0.115,
  size = 50,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  if (frame >= endFrame) return null;
  const ms = (frame / fps) * 1000;
  const pages = paginate(captions, maxWords);
  const idx = pages.findIndex((p, i) => {
    const nextStart = pages[i + 1]?.[0].startMs ?? Infinity;
    return ms >= p[0].startMs - 60 && ms < Math.min(nextStart - 60, p[p.length - 1].endMs + 600);
  });
  if (idx < 0) return null;
  const page = pages[idx];
  const dark = (themes.find((t) => frame >= t.from && frame < t.to) ?? { dark: true }).dark;
  const nextStart = pages[idx + 1]?.[0].startMs;
  const out = nextStart != null ? interpolate(ms, [nextStart - 160, nextStart - 60], [0, 1], clamp) : 0;
  const firstHl = page.findIndex((w) => w.hl);
  return (
    <div style={{ position: "absolute", left: 70 * u, right: 70 * u, top: height * top, display: "flex", justifyContent: "center", flexWrap: "wrap", alignItems: "baseline", gap: `0 ${13 * u}px`, fontFamily: BODY, fontSize: size * u, lineHeight: 1.3, textAlign: "center", opacity: 1 - out, filter: `blur(${out * 8}px)` }}>
      {page.map((w, i) => {
        const f0 = (w.startMs / 1000) * fps;
        const p = interpolate(frame, [f0 - 2, f0 + 5], [0, 1], { ...clamp, easing: EASE });
        const sel = i === firstHl ? interpolate(frame, [f0 + 2, f0 + 9], [0, 1], { ...clamp, easing: EASE }) : 0;
        const base: React.CSSProperties = { position: "relative", opacity: p, filter: `blur(${(1 - p) * 10}px)`, translate: `0 ${(1 - p) * 8 * u}px` };
        if (w.hl) {
          return (
            <span key={w.startMs} style={{ ...base, fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: size * 1.12 * u, color: dark ? C.lime : C.charcoal, padding: `0 ${6 * u}px` }}>
              {sel > 0 ? (
                <span style={{ position: "absolute", inset: `${2 * u}px ${-2 * u}px`, background: dark ? "rgba(167,255,63,0.14)" : "rgba(10,10,10,0.08)", border: `${2 * u}px solid ${dark ? C.lime : C.charcoal}`, opacity: sel, transformOrigin: "0 50%", scale: `${sel} 1` }}>
                  {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], k) => (
                    <span key={k} style={{ position: "absolute", [x ? "right" : "left"]: -5 * u, [y ? "bottom" : "top"]: -5 * u, width: 8 * u, height: 8 * u, background: dark ? C.charcoal : C.cream, border: `${2 * u}px solid ${dark ? C.lime : C.charcoal}` }} />
                  ))}
                </span>
              ) : null}
              <span style={{ position: "relative" }}>{w.text.replace(/[.,!?;:]$/, "")}</span>
            </span>
          );
        }
        return (
          <span key={w.startMs} style={{ ...base, fontWeight: 600, color: dark ? C.cream : C.charcoal }}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
