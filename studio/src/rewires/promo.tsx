// 16:9 product-promo motion library (rebuilt from research/reference-videos/ref-1000320070 in the Kanishk.Rewires theme).
// Kinetic sentences, logo cloud, pixel mosaic, bracket reveal, card stacks, agent logs, inline UI, avatar collage,
// terminal and IDE, tilted window with list, gradient bands, focus checklist, score rows, card burst, pill morph.
import React from "react";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, BRAND, C, clamp, EASE, EASE_IO, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";

const ERR = "#E5484D";
const isDarkScene = (d: SceneProps["data"]) => d.theme === "dark";
const bgOf = (dark: boolean) => (dark ? C.charcoal : C.cream);
const inkOf = (dark: boolean) => (dark ? C.cream : C.charcoal);

/** Blur-in: opacity, blur and a small rise; the house entrance for every element. */
const useBlurIn = () => {
  const frame = useCurrentFrame();
  return (at: number, dur = 10, rise = 14): React.CSSProperties => {
    const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EASE });
    return { opacity: p, filter: `blur(${(1 - p) * 12}px)`, translate: `0 ${(1 - p) * rise}px` };
  };
};

/** Accent word: italic serif. Lime on dark; charcoal with a lime marker on cream. */
const AccentWord: React.FC<{ text: string; dark: boolean; size: number }> = ({ text, dark, size }) => (
  <span
    style={{
      fontFamily: SERIF,
      fontStyle: "italic",
      fontSize: size * 1.12,
      color: dark ? C.lime : C.charcoal,
      backgroundImage: dark ? undefined : `linear-gradient(${C.lime}, ${C.lime})`,
      backgroundSize: "100% 0.28em",
      backgroundPosition: "0 88%",
      backgroundRepeat: "no-repeat",
      padding: "0 0.04em",
    }}
  >
    {text}
  </span>
);

const Shell: React.FC<{ dark: boolean; children: React.ReactNode }> = ({ dark, children }) => (
  <AbsoluteFill style={{ background: bgOf(dark), fontFamily: BODY, color: inkOf(dark) }}>{children}</AbsoluteFill>
);

/** Floating particles: lime specks, or code symbols. */
const Particles: React.FC<{ kind: "specks" | "symbols"; dark: boolean; n?: number }> = ({ kind, dark, n = 12 }) => {
  const frame = useCurrentFrame();
  const glyphs = ["{", "}", "*", "<", ">", "\\", "]"];
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const r = (k: string) => random(`${kind}${i}${k}`);
        const x = 0.12 + 0.76 * r("x");
        const y = 0.12 + 0.76 * r("y");
        const dx = (r("dx") - 0.5) * 60 * (frame / 30);
        const dy = (r("dy") - 0.5) * 40 * (frame / 30);
        const op = interpolate(frame, [2 + r("t") * 10, 10 + r("t") * 10], [0, 0.9], clamp);
        return kind === "specks" ? (
          <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, width: 10 + r("w") * 10, height: 10, background: C.lime, opacity: op, translate: `${dx}px ${dy}px` }} />
        ) : (
          <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, fontFamily: MONO, fontSize: 30, color: i % 4 === 0 ? C.lime : dark ? C.grey : "#7A7870", opacity: op, translate: `${dx}px ${dy}px` }}>
            {glyphs[i % glyphs.length]}
          </div>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ kinetic sentence
/** Words land one by one with a little baseline jitter that settles; one accent word; optional scramble or brackets. */
export const PKineticScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const dark = isDarkScene(data);
  const words: string[] = data.words;
  const accent: number = data.accent ?? -1;
  const step: number = data.step ?? 4;
  const size: number = data.size ?? 56;
  const scramble: boolean = data.scramble ?? false;
  const start = scramble ? 14 : 2;
  const blur = useBlurIn();
  const glyphs = "[]&<>*&*<>*&&%#<>";
  return (
    <Shell dark={dark}>
      {data.particles ? <Particles kind={data.particles} dark={dark} /> : null}
      {scramble && frame < start + 2 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 44, color: dark ? C.lime : C.charcoal, letterSpacing: 6 }}>
          <div>{glyphs.slice(0, 8 + (frame % 5)).split("").map((g, i) => <span key={i} style={{ opacity: random(`g${i}${Math.floor(frame / 2)}`) > 0.3 ? 1 : 0.2 }}>{g}</span>)}</div>
        </AbsoluteFill>
      ) : null}
      {dark ? <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 40% at ${40 + 20 * Math.sin(frame / 25)}% ${55 + 10 * Math.cos(frame / 30)}%, rgba(167,255,63,0.10), rgba(0,0,0,0) 70%)` }} /> : null}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", scale: String(1 + 0.0016 * frame) }}>
        <div style={{ display: "flex", gap: size * 0.28, alignItems: "baseline", fontSize: size, fontWeight: 500, letterSpacing: -0.5 }}>
          {data.prefix ? <span style={{ ...blur(start, 8), color: C.grey, fontFamily: MONO }}>{data.prefix}</span> : null}
          {words.map((w, i) => {
            const at = start + i * step;
            const jitter = interpolate(frame, [at, at + 10], [(random(`j${i}`) - 0.5) * 30, 0], { ...clamp, easing: EASE });
            return (
              <span key={i} style={{ ...blur(at, 10), translate: `0 ${jitter}px` }}>
                {i === accent ? <AccentWord text={w} dark={dark} size={size} /> : w}
              </span>
            );
          })}
          {data.suffix ? <span style={{ ...blur(start + words.length * step, 8), color: C.grey, fontFamily: MONO }}>{data.suffix}</span> : null}
          {data.icon ? <span style={{ ...blur(start + words.length * step, 10, 30) }}>{data.icon === "plane" ? <Plane /> : null}</span> : null}
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

const Plane: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 24 24" style={{ marginLeft: 10 }}>
    <path d="M3 11 L21 3 L14 21 L11 13 Z" fill="none" stroke={C.charcoal} strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M11 13 L21 3" stroke={C.lime} strokeWidth={1.8} />
  </svg>
);

// ------------------------------------------------------------------ logo cloud in depth
export const PLogoCloudScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const blur = useBlurIn();
  const logos: string[] = data.logos;
  return (
    <Shell dark>
      {logos.map((l, i) => {
        const r = (k: string) => random(`lc${i}${k}`);
        const z = 0.45 + r("z") * 0.9; // depth
        const size = 190 * z + 70;
        const x = 0.1 + (i % 5) * 0.2 + (r("x") - 0.5) * 0.1;
        const y = 0.2 + Math.floor(i / 5) * 0.55 + (r("y") - 0.5) * 0.18;
        const drift = (frame / 30) * (40 + 80 * z);
        const p = interpolate(frame, [i * 0.6 - 4, i * 0.6 + 8], [0, 1], { ...clamp, easing: EASE });
        return (
          <div key={i} style={{ position: "absolute", left: `calc(${x * 100}% - ${size / 2}px)`, top: `calc(${y * 100}% - ${size / 2}px)`, width: size, height: size, borderRadius: size * 0.26, background: z > 0.9 ? C.graphite : "#141414", border: `2px solid ${z > 1 ? "rgba(167,255,63,0.45)" : "rgba(246,244,237,0.08)"}`, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", translate: `${-drift}px ${(1 - p) * 120}px`, opacity: p, filter: `blur(${z < 0.7 ? 3 : 0}px)` }}>
            <Img src={staticFile(l)} style={{ width: size * 0.5, height: size * 0.5, objectFit: "contain" }} />
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontSize: 64 }}>
        <div style={{ ...blur(6), background: "rgba(10,10,10,0.55)", padding: "6px 22px", borderRadius: 14 }}>
          {data.pre} <AccentWord text={data.accentWord} dark size={54} />
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

// ------------------------------------------------------------------ pixel mosaic frame
export const PPixelScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const cell = 34;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const prog = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: EASE_IO });
  const sq: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const edge = Math.min(r, c, rows - 1 - r, cols - 1 - c);
      const thr = prog * 6 - edge + (random(`px${r}-${c}`) - 0.5) * 1.6;
      if (thr > 0 && edge < 6) sq.push(<div key={`${r}-${c}`} style={{ position: "absolute", left: c * cell + 4, top: r * cell + 4, width: cell - 10, height: cell - 10, background: C.lime, opacity: Math.min(1, thr) * (edge < 3 ? 1 : 0.55) }} />);
    }
  return (
    <AbsoluteFill>
      <PKineticScene data={{ ...data, particles: undefined, step: 3, theme: data.theme }} />
      {sq}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ corner brackets "Meet"
export const PBracketScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: EASE });
  const blur = useBlurIn();
  const B: React.FC<{ flip?: boolean }> = ({ flip }) => (
    <div style={{ width: 190, height: 190, borderLeft: `48px solid ${C.charcoal}`, borderTop: `48px solid ${C.charcoal}`, rotate: flip ? "180deg" : "0deg" }}>
      <div style={{ position: "absolute", left: -48, top: -48, width: 48, height: 48, background: C.lime }} />
    </div>
  );
  return (
    <Shell dark={false}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 720, height: 330 }}>
          <div style={{ position: "absolute", left: 0, top: 0, translate: `${(1 - p) * -260}px ${(1 - p) * -120}px` }}>
            <B />
          </div>
          <div style={{ position: "absolute", right: 0, bottom: 0, translate: `${(1 - p) * 260}px ${(1 - p) * 120}px` }}>
            <B flip />
          </div>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 120, ...blur(4) }}>{data.word}</AbsoluteFill>
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

// ------------------------------------------------------------------ brand reveal (K·R + wordmark)
export const PBrandScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const dark = isDarkScene(data);
  const name = `${BRAND.wordmark.left}${BRAND.wordmark.dot}${BRAND.wordmark.right}`;
  const n = Math.max(0, Math.min(name.length, Math.floor((frame - 3) * 1.8)));
  const logoP = spring({ frame: frame + 4, fps: 30, config: { damping: 13 } });
  return (
    <Shell dark={dark}>
      {dark ? <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 70% 60%, rgba(167,255,63,0.08), rgba(0,0,0,0) 70%)" }} /> : null}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Img src={staticFile(BRAND.logo.monogramPublic)} style={{ width: 96, height: 96, scale: String(0.6 + 0.4 * logoP), opacity: logoP }} />
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 72, color: inkOf(dark), letterSpacing: -1 }}>
            {name.slice(0, n).split("").map((ch, i) => (
              <span key={i} style={{ color: ch === "." ? C.lime : undefined }}>
                {ch}
              </span>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

// ------------------------------------------------------------------ stacked log cards over a graded photo
export const PCardStackScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const blur = useBlurIn();
  const cards: [string, string][] = data.cards;
  const scroll = interpolate(frame, [0, D], [0, 260], { ...clamp, easing: EASE_IO });
  return (
    <Shell dark>
      <AbsoluteFill style={{ scale: "1.1" }}>
        <Img src={staticFile(data.photo)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.1) brightness(0.5)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(120deg, rgba(167,255,63,0.35), rgba(10,10,10,0.55))`, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "rgba(167,255,63,0.12)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 560, width: 800, top: 60 - scroll }}>
        {cards.map(([t, s], i) => (
          <div key={t} style={{ background: C.cream, borderRadius: 18, padding: "20px 26px", marginBottom: 18, display: "flex", gap: 18, alignItems: "flex-start", boxShadow: "0 18px 40px rgba(0,0,0,0.35)", ...blur(i * 4, 10, 30) }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, border: `2.5px solid ${C.charcoal}`, background: i % 3 === 0 ? C.lime : "transparent", marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 26, fontWeight: 500, color: C.charcoal }}>{t}</div>
              <div style={{ fontSize: 19, color: "#8A887F", marginTop: 4 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ agent log chaos with error pills
export const PAgentLogScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const blur = useBlurIn();
  const lines: string[] = data.lines;
  const pills: string[] = data.pills;
  const scroll = frame * 3.2;
  return (
    <Shell dark>
      <div style={{ position: "absolute", left: 560, top: 70, width: 800, height: 940, borderRadius: 18, border: "1.5px solid rgba(246,244,237,0.1)", background: "#111", overflow: "hidden", ...blur(0) }}>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 16, color: C.grey, padding: 12, borderBottom: "1px solid rgba(246,244,237,0.08)" }}>claude code</div>
        <div style={{ padding: "18px 26px", translate: `0 ${-scroll}px` }}>
          {new Array(4).fill(0).flatMap((_, k) =>
            lines.map((l, i) => (
              <div key={`${k}-${i}`} style={{ fontFamily: MONO, fontSize: 19, lineHeight: 1.75, color: l.startsWith("●") ? C.cream : l.startsWith("×") ? ERR : C.grey }}>
                {l}
              </div>
            )),
          )}
        </div>
      </div>
      {pills.map((p, i) => {
        const at = 6 + i * 6;
        const x = 520 + (i % 2) * 560 + (random(`pl${i}`) - 0.5) * 120;
        const y = 120 + i * 120;
        return (
          <div key={p} style={{ position: "absolute", left: x, top: y, padding: "12px 22px", borderRadius: 10, background: "rgba(229,72,77,0.18)", border: `1.5px solid ${ERR}`, color: ERR, fontFamily: MONO, fontSize: 24, display: "flex", gap: 10, alignItems: "center", ...blur(at, 8, 20) }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${ERR}` }} />
            {p}
          </div>
        );
      })}
    </Shell>
  );
};

/** Cursor with a name tag (multiplayer style). */
const NamedCursor: React.FC<{ x: number; y: number; name: string; dark: boolean; press?: number }> = ({ x, y, name, dark, press = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 20 }}>
    <svg width={40} height={44} viewBox="0 0 22 24" style={{ scale: String(press), transformOrigin: "0 0" }}>
      <path d="M2 2 L20 9 L12 12 L9 21 Z" fill={dark ? C.lime : C.charcoal} stroke={dark ? C.charcoal : C.cream} strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
    <div style={{ marginLeft: 26, marginTop: -8, display: "inline-block", padding: "4px 14px", borderRadius: 999, background: dark ? C.lime : C.charcoal, color: dark ? C.charcoal : C.lime, fontSize: 20, fontWeight: 600 }}>{name}</div>
  </div>
);

const cursorPath = (frame: number, pts: [number, number, number][]) => ({
  x: interpolate(frame, pts.map((p) => p[0]), pts.map((p) => p[1]), { ...clamp, easing: EASE_IO }),
  y: interpolate(frame, pts.map((p) => p[0]), pts.map((p) => p[2]), { ...clamp, easing: EASE_IO }),
});
const pressAt = (frame: number, at: number) => (frame >= at && frame < at + 8 ? interpolate(frame - at, [0, 3, 8], [1, 0.82, 1], clamp) : 1);

// ------------------------------------------------------------------ inline icon sentence, zooming into a task window
export const PInlineTaskScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const blur = useBlurIn();
  const zoomAt = Math.round(D * 0.42);
  const z = interpolate(frame, [zoomAt, zoomAt + 14], [0, 1], { ...clamp, easing: EASE_IO });
  return (
    <Shell dark={false}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - z }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, fontSize: 56 }}>
          <span style={blur(2)}>{data.before}</span>
          <div style={{ width: 170, height: 170, borderRadius: 40, background: C.cream, boxShadow: "0 24px 50px rgba(10,10,10,0.18)", border: "1.5px solid #E2DED2", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", ...blur(6, 10, 30), scale: String(1 + z * 3) }}>
            <Img src={staticFile(data.icon)} style={{ width: 96, height: 96 }} />
            <div style={{ position: "absolute", right: -40, bottom: -10 }}>
              <NamedCursor x={0} y={0} name="You" dark={false} />
            </div>
          </div>
          <span style={blur(10)}>{data.after}</span>
        </div>
      </AbsoluteFill>
      {/* task window */}
      <div style={{ position: "absolute", left: 300, top: 140, width: 1320, height: 860, borderRadius: 18, background: "white", boxShadow: "0 30px 80px rgba(10,10,10,0.18)", overflow: "hidden", opacity: z, scale: String(0.9 + 0.1 * z) }}>
        <div style={{ height: 54, background: C.charcoal, display: "flex", alignItems: "center", gap: 12, padding: "0 22px" }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.lime }} />
          <span style={{ color: C.cream, fontSize: 18 }}>{data.org}</span>
        </div>
        <div style={{ padding: "34px 44px" }}>
          <div style={{ fontSize: 40, fontWeight: 600, color: C.charcoal }}>
            {data.title.split(" ").slice(0, 1).join(" ")} <span style={{ backgroundImage: `linear-gradient(${C.lime}, ${C.lime})`, backgroundSize: "100% 0.3em", backgroundPosition: "0 88%", backgroundRepeat: "no-repeat" }}>{data.title.split(" ").slice(1).join(" ")}</span>
          </div>
          <div style={{ fontSize: 22, color: "#77756D", marginTop: 10 }}>{data.subtitle}</div>
          <div style={{ marginTop: 30, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: C.charcoal }}>OVERVIEW</div>
          <div style={{ fontSize: 21, lineHeight: 1.55, color: "#3A3A36", marginTop: 10, maxWidth: 1150 }}>{data.overview}</div>
          {data.repoLines ? (
            <div style={{ marginTop: 30, borderRadius: 14, height: 330, background: C.charcoal, padding: "22px 28px", fontFamily: MONO, fontSize: 21, lineHeight: 1.75 }}>
              {(data.repoLines as string[]).map((l, i) => (
                <div key={i} style={{ color: l.startsWith("✓") ? C.lime : l.startsWith("#") ? C.grey : C.cream, opacity: interpolate(frame, [zoomAt + 10 + i * 3, zoomAt + 16 + i * 3], [0, 1], clamp) }}>{l}</div>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 30, borderRadius: 14, overflow: "hidden", height: 330, background: "#F3F1EA", display: data.repoLines ? "none" : "flex", gap: 16, padding: 20 }}>
            {(data.photos as string[]).map((p, i) => (
              <div key={p} style={{ flex: 1, borderRadius: 12, overflow: "hidden", opacity: interpolate(frame, [zoomAt + 10 + i * 3, zoomAt + 18 + i * 3], [0, 1], clamp) }}>
                <Img src={staticFile(p)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ prompt bar -> coding agent chips
export const PPromptAgentsScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const text: string = data.text;
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - 4) * 1.6)));
  const swap = Math.round(D * 0.5);
  const s = interpolate(frame, [swap, swap + 10], [0, 1], { ...clamp, easing: EASE });
  const cur = cursorPath(frame, [[0, 1500, 700], [swap - 6, 980, 690], [swap + 18, 1000, 650]]);
  return (
    <Shell dark={false}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 240, background: `linear-gradient(90deg, ${C.charcoal}, ${C.graphite})` }} />
      <div style={{ position: "absolute", left: 240, top: 432, padding: "26px 38px", borderRadius: 18, background: "white", fontSize: 44, color: C.charcoal, boxShadow: "0 20px 50px rgba(0,0,0,0.3)", opacity: 1 - s, minWidth: 900 }}>
        {text.slice(0, n)}
        {n < text.length ? <span style={{ color: C.lime }}>▍</span> : null}
      </div>
      <div style={{ position: "absolute", left: 760, top: 440, display: "flex", gap: 18, opacity: s }}>
        {(data.chips as string[]).map((c, i) => (
          <div key={c} style={{ width: 130, height: 130, borderRadius: "50%", background: c === "+" ? C.graphite : C.cream, display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid rgba(246,244,237,0.2)", scale: String(spring({ frame: frame - swap - i * 4, fps: 30, config: { damping: 12 } })) }}>
            {c === "+" ? <span style={{ color: C.lime, fontSize: 70, fontWeight: 300 }}>+</span> : <Img src={staticFile(c)} style={{ width: 70, height: 70 }} />}
          </div>
        ))}
      </div>
      <NamedCursor x={cur.x} y={cur.y} name="You" dark press={pressAt(frame, swap - 4)} />
    </Shell>
  );
};

// ------------------------------------------------------------------ avatar collage with word pill
export const PAvatarCollageScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const blur = useBlurIn();
  const people: { n: number; name: string; role: string }[] = data.people;
  const slots = [
    [0.12, 0.08, 1.25], [0.62, 0.06, 0.8], [0.84, 0.16, 0.7], [0.08, 0.66, 0.9], [0.38, 0.7, 0.75], [0.72, 0.62, 1.1], [0.9, 0.55, 0.6], [0.3, 0.12, 0.6],
  ];
  return (
    <Shell dark={false}>
      {slots.map(([x, y, z], i) => {
        const p = people[i % people.length];
        const drift = (frame / 30) * 30 * z;
        const w = 300 * z;
        return (
          <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, width: w + 220 * z, height: w * 0.8, borderRadius: 18 * z, border: "1.5px solid #E2DED2", background: "rgba(246,244,237,0.8)", display: "flex", gap: 16 * z, padding: 14 * z, translate: `${-drift}px ${drift * 0.3}px`, filter: `blur(${z < 0.75 ? 2.5 : 0}px)`, ...blur(i * 2, 12, 30) }}>
            <Img src={staticFile(`media/li2/person${p.n}.jpg`)} style={{ width: w * 0.62, height: w * 0.62, borderRadius: 12 * z, objectFit: "cover" }} />
            <div style={{ fontSize: 22 * z, marginTop: w * 0.3 }}>
              <div style={{ color: "#8A887F" }}>{p.name}</div>
              <div style={{ color: C.charcoal, fontWeight: 600 }}>{p.role}</div>
            </div>
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 50, background: "rgba(246,244,237,0.85)", padding: "10px 24px", borderRadius: 16, ...blur(8) }}>
          {data.before}
          <span style={{ background: C.charcoal, color: C.lime, padding: "6px 22px", borderRadius: 999 }}>{data.pill}</span>
          {data.after}
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

// ------------------------------------------------------------------ task card with a Start button pressed by a named cursor
export const PStartTaskScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const blur = useBlurIn();
  const click = Math.round(D * 0.55);
  const cur = cursorPath(frame, [[0, 1100, 900], [click - 4, 640, 690], [D, 660, 700]]);
  const pressed = frame >= click;
  return (
    <Shell dark>
      <div style={{ position: "absolute", left: 240, right: 240, top: 120, height: 680, borderRadius: 22, border: "1.5px solid rgba(246,244,237,0.1)", background: "#121212", padding: "40px 50px", ...blur(0) }}>
        <div style={{ fontSize: 30, lineHeight: 1.6, color: C.stone }}>{data.body}</div>
        <div style={{ position: "absolute", left: 50, bottom: 50, display: "flex", gap: 40, alignItems: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 600, padding: "16px 30px", borderRadius: 14, background: pressed ? C.lime : C.cream, color: C.charcoal, scale: String(pressAt(frame, click)) }}>Start task →</div>
          <div style={{ fontSize: 28, color: C.grey }}>Save for later</div>
        </div>
      </div>
      <NamedCursor x={cur.x} y={cur.y} name="Candidate" dark />
    </Shell>
  );
};

/** A small pixel creature (our own sprite). */
const PixelMascot: React.FC<{ size: number }> = ({ size }) => {
  const g = ["0011111100", "0111111110", "1101111011", "1111111111", "0111111110", "0101001010", "0100000010"];
  const s = size / 10;
  return (
    <div style={{ position: "relative", width: size, height: s * g.length }}>
      {g.flatMap((row, y) => row.split("").map((v, x) => (v === "1" ? <div key={`${x}-${y}`} style={{ position: "absolute", left: x * s, top: y * s, width: s, height: s, background: C.lime }} /> : null)))}
    </div>
  );
};

// ------------------------------------------------------------------ mascot terminal typing a prompt
export const PMascotTerminalScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const blur = useBlurIn();
  const text: string = data.prompt;
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - 14) * 1.4)));
  const z = interpolate(frame, [0, D], [1, 1.35], { ...clamp, easing: EASE_IO });
  const pan = interpolate(frame, [20, D], [0, -Math.max(0, text.length * 22 - 900)], { ...clamp, easing: EASE_IO });
  return (
    <Shell dark>
      <AbsoluteFill style={{ scale: String(z), transformOrigin: "40% 55%" }}>
        <div style={{ position: "absolute", left: 300, top: 300, ...blur(0) }}>
          <PixelMascot size={150} />
        </div>
        <div style={{ position: "absolute", left: 520, top: 330, fontFamily: MONO, fontSize: 24, color: C.lime, ...blur(4) }}>{data.version}</div>
        <div style={{ position: "absolute", left: 300, right: 120, top: 470, height: 110, borderRadius: 14, border: "1.5px solid rgba(246,244,237,0.12)", background: "#121212", overflow: "hidden", ...blur(8) }}>
          <div style={{ fontFamily: MONO, fontSize: 36, color: C.cream, padding: "32px 30px", whiteSpace: "nowrap", translate: `${pan}px 0` }}>
            <span style={{ color: C.grey }}>&gt; </span>
            {text.slice(0, n)}
            <span style={{ color: C.lime }}>▍</span>
          </div>
        </div>
        <NamedCursor x={interpolate(frame, [0, D], [1300, 900], clamp)} y={interpolate(frame, [0, D], [640, 560], clamp)} name="Candidate" dark />
      </AbsoluteFill>
    </Shell>
  );
};

// ------------------------------------------------------------------ IDE split: files, code, agent panel
export const PIdeScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const blur = useBlurIn();
  const code: string[] = data.code;
  const panel: string[] = data.panel;
  const scroll = frame * 1.4;
  return (
    <Shell dark>
      <div style={{ position: "absolute", inset: 40, borderRadius: 18, border: "1.5px solid rgba(246,244,237,0.1)", background: "#0F0F0F", display: "flex", overflow: "hidden", ...blur(0) }}>
        <div style={{ width: 240, borderRight: "1px solid rgba(246,244,237,0.08)", padding: 22, fontFamily: MONO, fontSize: 17, color: C.grey, lineHeight: 2 }}>
          {(data.files as string[]).map((f) => (
            <div key={f} style={{ color: f.startsWith("›") ? C.cream : undefined }}>{f}</div>
          ))}
        </div>
        <div style={{ flex: 1.4, padding: "26px 30px", fontFamily: MONO, fontSize: 19, lineHeight: 1.75, overflow: "hidden" }}>
          <div style={{ translate: `0 ${-scroll}px` }}>
            {code.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 22, background: i === 9 || i === 10 ? "rgba(167,255,63,0.08)" : "transparent" }}>
                <span style={{ color: "#4A4A46", width: 30, textAlign: "right" }}>{i + 1}</span>
                <span style={{ color: /^(import|export|const|return|if|function)/.test(l.trim()) ? C.lime : C.stone, whiteSpace: "pre" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, borderLeft: "1px solid rgba(246,244,237,0.08)", padding: 26 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <PixelMascot size={90} />
            <div style={{ fontFamily: MONO, fontSize: 17, color: C.grey }}>Tips for getting started</div>
          </div>
          {panel.map((l, i) => (
            <div key={i} style={{ fontFamily: MONO, fontSize: 18, lineHeight: 1.7, marginTop: 10, color: l.startsWith("●") ? C.cream : C.grey, ...blur(10 + i * 8, 8, 10) }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ Submit button with a pixel glow
export const PSubmitScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const click = Math.round(D * 0.45);
  const done = frame >= click + 6;
  const cur = cursorPath(frame, [[0, 1150, 700], [click - 3, 1000, 560], [D, 960, 620]]);
  return (
    <Shell dark>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          {!done
            ? new Array(60).fill(0).map((_, i) => (
                <div key={i} style={{ position: "absolute", left: -120 + (i % 15) * 38, top: -60 + Math.floor(i / 15) * 40, width: 26, height: 26, background: C.lime, opacity: 0.12 + 0.2 * random(`sg${i}${Math.floor(frame / 3)}`) }} />
              ))
            : null}
          <div style={{ position: "relative", padding: "26px 52px", borderRadius: 18, fontSize: 46, fontWeight: 600, display: "flex", gap: 18, alignItems: "center", background: done ? C.cream : C.lime, color: C.charcoal, scale: String(pressAt(frame, click)), boxShadow: done ? "none" : "0 0 60px rgba(167,255,63,0.35)" }}>
            {data.label} <span style={{ fontSize: 40 }}>➤</span>
          </div>
        </div>
      </AbsoluteFill>
      <NamedCursor x={cur.x} y={cur.y} name="Candidate" dark press={pressAt(frame, click)} />
    </Shell>
  );
};

// ------------------------------------------------------------------ tilted window over a landscape with a changing list
export const PTiltListScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const blur = useBlurIn();
  const items: string[] = data.items;
  const per = D / items.length;
  const active = Math.min(items.length - 1, Math.floor(frame / per));
  const local = frame - active * per;
  const panels: React.ReactNode[] = [
    <div key="g" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: 24 }}>{(data.gallery as string[]).map((g, i) => <Img key={i} src={staticFile(g)} style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 10, ...blur(i * 2, 8, 10) }} />)}</div>,
    <div key="c" style={{ padding: 26, fontFamily: MONO, fontSize: 18, lineHeight: 1.7, color: C.stone }}>{(data.code as string[]).map((l, i) => <div key={i} style={{ whiteSpace: "pre", color: /^(const|import|export|return)/.test(l.trim()) ? C.lime : undefined }}>{l}</div>)}</div>,
    <div key="a" style={{ padding: 30, display: "flex", gap: 24 }}><PixelMascot size={110} /><div style={{ fontFamily: MONO, fontSize: 18, lineHeight: 1.8, color: C.stone }}>{(data.agent as string[]).map((l, i) => <div key={i} style={{ color: l.startsWith("●") ? C.cream : undefined }}>{l}</div>)}</div></div>,
    <div key="r" style={{ padding: 26 }}><div style={{ fontFamily: MONO, fontSize: 16, color: C.grey, marginBottom: 12 }}>Rubric Results</div>{(data.rubric as [string, string][]).map(([k, v], i) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "16px 4px", borderBottom: "1px solid rgba(246,244,237,0.08)", fontSize: 22, color: C.cream, ...blur(i * 4, 8, 10) }}><span>{k}</span><span style={{ fontSize: 17, padding: "4px 14px", borderRadius: 999, background: v === "Excellent" ? C.lime : C.graphite, color: v === "Excellent" ? C.charcoal : C.stone }}>{v}</span></div>)}</div>,
  ];
  return (
    <Shell dark={false}>
      <div style={{ position: "absolute", left: 120, top: 360 }}>
        {items.map((it, i) => (
          <div key={it} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 36, lineHeight: 1.7, color: i === active ? C.charcoal : "#8A887F", fontWeight: i === active ? 600 : 400 }}>
            <span style={{ width: 14, height: 14, background: i === active ? C.lime : "transparent", border: i === active ? `2px solid ${C.charcoal}` : "none" }} />
            {it}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 720, top: 90, width: 1080, height: 900, borderRadius: 34, overflow: "hidden", perspective: 1800, ...blur(0, 14, 40) }}>
        <Img src={staticFile(data.photo)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.55) contrast(1.05) brightness(0.85)" }} />
        <AbsoluteFill style={{ background: "linear-gradient(160deg, rgba(167,255,63,0.18), rgba(10,10,10,0.25))", mixBlendMode: "soft-light" }} />
        <div style={{ position: "absolute", left: 90, top: 110, right: 90, bottom: 110, borderRadius: 20, background: "rgba(14,14,14,0.94)", border: "1.5px solid rgba(246,244,237,0.12)", overflow: "hidden", transform: "rotateX(6deg) rotateY(-8deg)", translate: `0 ${interpolate(local, [0, 10], [30, 0], { ...clamp, easing: EASE })}px`, opacity: interpolate(local, [0, 8], [0.4, 1], clamp) }}>
          {panels[active % panels.length]}
        </div>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ gradient bands with an inline spinner
export const PBandsScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const blur = useBlurIn();
  return (
    <Shell dark>
      <div style={{ position: "absolute", left: -100, right: -100, top: -60, height: 460, background: `radial-gradient(ellipse 60% 70% at ${50 + Math.sin(frame / 20) * 10}% 60%, ${C.lime}, ${C.paleLime} 35%, ${C.stone} 60%, ${C.charcoal} 100%)`, filter: "blur(40px)", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: -100, right: -100, bottom: -60, height: 460, background: `radial-gradient(ellipse 60% 70% at ${50 - Math.sin(frame / 22) * 10}% 40%, ${C.lime}, ${C.paleLime} 35%, ${C.stone} 60%, ${C.charcoal} 100%)`, filter: "blur(40px)", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, height: 280, background: C.charcoal, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, fontSize: 50, color: C.cream }}>
        <span style={blur(2)}>{data.pre}</span>
        <svg width={56} height={56} viewBox="0 0 40 40" style={{ rotate: `${frame * 12}deg`, ...blur(6) }}>
          <path d="M20 4 A16 16 0 0 1 36 20" stroke={C.lime} strokeWidth={4} fill="none" strokeLinecap="round" />
        </svg>
        <span style={blur(10)}>
          <AccentWord text={data.accentWord} dark size={50} /> {data.post}
        </span>
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ focus-scroll checklist
export const PChecklistScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const items: string[] = data.items;
  const rowH = 96;
  const pos = interpolate(frame, [0, D - 6], [1, items.length - 1.5], { ...clamp, easing: EASE_IO });
  return (
    <Shell dark={false}>
      <div style={{ position: "absolute", left: 140, top: 540 - pos * rowH }}>
        {items.map((it, i) => {
          const dist = Math.abs(i - pos);
          const focus = Math.max(0, 1 - dist);
          const checked = i < pos + 0.4;
          return (
            <div key={it} style={{ height: rowH, display: "flex", alignItems: "center", gap: 28, fontSize: 70, fontWeight: 500, color: C.charcoal, opacity: 0.18 + 0.82 * focus, scale: String(0.86 + 0.14 * focus), transformOrigin: "0 50%" }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, border: `4px solid ${checked ? C.charcoal : "#B9B6AC"}`, background: checked ? C.lime : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800 }}>{checked ? "✓" : ""}</div>
              {it}
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// ------------------------------------------------------------------ score rows, then "and score them" reorder
export const PScoreRowsScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const blur = useBlurIn();
  const rows: { n: number; name: string; role: string; grade: string; rank: number }[] = data.rows;
  const sortAt = Math.round(D * 0.4);
  const s = interpolate(frame, [sortAt, sortAt + 14], [0, 1], { ...clamp, easing: EASE_IO });
  const gradeColor = (g: string) => (g === "Excellent" ? C.lime : g === "Great" ? C.paleLime : g === "Average" ? "#E9E5DA" : "#F1EEE5");
  return (
    <Shell dark={false}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontSize: 50, ...blur(sortAt) }}>{data.title}</div>
      {rows.map((r, i) => {
        const y = interpolate(s, [0, 1], [170 + i * 150, 240 + r.rank * 170]);
        const big = interpolate(s, [0, 1], [1, r.rank === 0 ? 1.12 : 1]);
        return (
          <div key={r.name} style={{ position: "absolute", left: 560, width: 800, top: y, height: 124, borderRadius: 22, border: "1.5px solid #E2DED2", background: r.rank === 0 && s > 0.5 ? "#EFFFD6" : "#FBFAF6", display: "flex", alignItems: "center", gap: 24, padding: "0 28px", scale: String(big), opacity: s > 0.5 && r.rank > 2 ? 1 - s : 1, ...blur(i * 3, 10, 24) }}>
            <Img src={staticFile(`media/li2/person${r.n}.jpg`)} style={{ width: 82, height: 82, borderRadius: 14, objectFit: "cover" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 32, fontWeight: 600, color: C.charcoal }}>{r.name}</div>
              <div style={{ fontSize: 20, color: "#8A887F" }}>{r.role}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, padding: "8px 20px", borderRadius: 999, background: gradeColor(r.grade), color: C.charcoal, border: "1.5px solid rgba(10,10,10,0.08)" }}>{r.grade}</div>
          </div>
        );
      })}
    </Shell>
  );
};

// ------------------------------------------------------------------ meeting cards drifting around a line, then burst into a cluster
export const PMeetingsScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const blur = useBlurIn();
  const cards: string[] = data.cards;
  const burst: boolean = data.burst ?? false;
  const gather = burst ? interpolate(frame, [4, D - 6], [0, 1], { ...clamp, easing: EASE_IO }) : 0;
  return (
    <Shell dark={false}>
      {cards.map((c, i) => {
        const r = (k: string) => random(`mc${i}${k}`);
        const x0 = 80 + r("x") * 1620;
        const y0 = 60 + r("y") * 920;
        const x1 = 860 + (r("cx") - 0.5) * 300;
        const y1 = 470 + (r("cy") - 0.5) * 260;
        const x = interpolate(gather, [0, 1], [x0 - frame * (1 + r("v")) * 1.4, x1]);
        const y = interpolate(gather, [0, 1], [y0, y1]);
        const lilac = i % 3 === 1;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 230, borderRadius: 10, padding: "10px 14px", background: lilac ? "#EFFFD6" : "#F1EEE5", borderLeft: `5px solid ${lilac ? C.lime : C.charcoal}`, boxShadow: "0 8px 20px rgba(10,10,10,0.08)", scale: String(interpolate(gather, [0, 1], [0.6 + r("z") * 0.5, 0.75])), filter: `blur(${r("z") < 0.3 && !burst ? 2 : 0}px)`, ...blur(i, 10, 20) }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: C.charcoal }}>{c}</div>
            <div style={{ fontSize: 15, color: "#8A887F" }}>◷ {10 + (i % 7)}:30 to {11 + (i % 7)}:30</div>
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {burst ? (
          <div style={{ display: "flex", gap: 720, fontSize: 52 }}>
            <span style={blur(0)}>{data.left}</span>
            <span style={blur(6)}>{data.right}</span>
          </div>
        ) : (
          <div style={{ fontSize: 52, background: "rgba(246,244,237,0.85)", padding: "8px 22px", borderRadius: 14, ...blur(4) }}>{data.line}</div>
        )}
      </AbsoluteFill>
    </Shell>
  );
};

// ------------------------------------------------------------------ pill word morph -> brand
export const PPillScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const words: string[] = data.words;
  const shown = Math.min(words.length, Math.floor(frame / 5) + 1);
  const close = interpolate(frame, [D - 10, D], [1, 0], clamp);
  return (
    <Shell dark={false}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ padding: "16px 34px", borderRadius: 999, border: `3px solid ${C.charcoal}`, fontSize: 50, overflow: "hidden", whiteSpace: "nowrap", maxWidth: `${close * 900}px`, opacity: 0.3 + 0.7 * close, boxShadow: `inset 0 -6px 0 ${C.lime}` }}>
          {words.slice(0, shown).map((w, i) => (i === data.accent ? <AccentWord key={i} text={w} dark={false} size={50} /> : <span key={i}>{w} </span>))}
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

// ------------------------------------------------------------------ a real tool's logo, animated (mark pop + ring pulse, wordmark wipe)
export const PToolBrandScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const dark = isDarkScene(data);
  const markP = spring({ frame: frame - 1, fps: 30, config: { damping: 12, stiffness: 160 } });
  const ring = interpolate(frame, [4, 22], [0, 1], clamp);
  const wipe = interpolate(frame, [8, 22], [0, 1], { ...clamp, easing: EASE });
  const h: number = data.height ?? 110;
  return (
    <Shell dark={dark}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {data.mark ? (
            <div style={{ position: "relative", width: h, height: h }}>
              <div style={{ position: "absolute", inset: -h * 0.4 * ring, borderRadius: "50%", border: `3px solid ${C.lime}`, opacity: 1 - ring }} />
              <Img src={staticFile(data.mark)} style={{ width: h, height: h, objectFit: "contain", scale: String(0.5 + 0.5 * markP), rotate: `${(1 - markP) * -40}deg`, opacity: Math.min(1, markP * 1.4) }} />
            </div>
          ) : null}
          {data.logo ? (
            <div style={{ clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
              <Img src={staticFile(data.logo)} style={{ height: (data.logoHeight ?? h * 0.8), objectFit: "contain", filter: dark && data.invert ? "invert(1)" : undefined }} />
            </div>
          ) : (
            <div style={{ fontSize: h * 0.7, fontWeight: 600, letterSpacing: -1, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>{data.name}</div>
          )}
        </div>
        {data.sub ? <div style={{ marginTop: 30, fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: C.grey, opacity: interpolate(frame, [18, 28], [0, 1], clamp) }}>{data.sub}</div> : null}
      </AbsoluteFill>
    </Shell>
  );
};

export const PROMO_SCENES: Record<string, React.FC<SceneProps>> = {
  pToolBrand: PToolBrandScene,
  pKinetic: PKineticScene,
  pLogoCloud: PLogoCloudScene,
  pPixel: PPixelScene,
  pBracket: PBracketScene,
  pBrand: PBrandScene,
  pCardStack: PCardStackScene,
  pAgentLog: PAgentLogScene,
  pInlineTask: PInlineTaskScene,
  pPromptAgents: PPromptAgentsScene,
  pAvatars: PAvatarCollageScene,
  pStartTask: PStartTaskScene,
  pMascotTerminal: PMascotTerminalScene,
  pIde: PIdeScene,
  pSubmit: PSubmitScene,
  pTiltList: PTiltListScene,
  pBands: PBandsScene,
  pChecklist: PChecklistScene,
  pScoreRows: PScoreRowsScene,
  pMeetings: PMeetingsScene,
  pPill: PPillScene,
};
