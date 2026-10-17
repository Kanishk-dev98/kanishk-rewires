import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, MONO, ZONE } from "./brand";

/** Scale unit: 1 at 1080 px on the short side, so layouts hold across 9:16, 4:5, 1:1 and 16:9. */
export const useU = () => {
  const { width, height } = useVideoConfig();
  return Math.min(width, height) / 1080;
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const id = `rg${frame % 6}`;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 6} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Edge darkening only. Black stays black: no grey gradients over empty areas. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.45 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** Slow camera push with a little horizontal drift. */
export const Camera: React.FC<{ children: React.ReactNode; push?: number; drift?: number }> = ({
  children,
  push = 0.04,
  drift = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ scale: String(1 + push * t), translate: `${drift * width * (t - 0.5)}px 0px` }}>
      {children}
    </AbsoluteFill>
  );
};

/**
 * The brand motif: a few fine cream strands drifting across the frame.
 * The same strands converge into the K·R monogram in the outro.
 */
export const Wires: React.FC<{ count?: number; opacity?: number; seed?: string; color?: string }> = ({
  count = 7,
  opacity = 0.16,
  seed = "w",
  color = C.cream,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const u = Math.min(W, H) / 1080;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <svg width={W} height={H}>
        {new Array(count).fill(0).map((_, i) => {
          const r = (k: string) => random(`${seed}${i}${k}`);
          const y0 = H * (0.1 + 0.8 * r("a"));
          const y1 = H * (0.1 + 0.8 * r("b"));
          const amp = H * 0.12 * (r("c") - 0.5);
          const ph = frame / (90 + 60 * r("d")) + r("e") * 6;
          const c1 = y0 + amp * Math.sin(ph);
          const c2 = y1 - amp * Math.cos(ph * 0.8);
          return (
            <path
              key={i}
              d={`M ${-50} ${y0} C ${W * 0.35} ${c1}, ${W * 0.65} ${c2}, ${W + 50} ${y1}`}
              stroke={color}
              strokeWidth={(0.8 + 1.2 * r("f")) * u}
              fill="none"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Reveals children by sliding them up out of a clipping mask. */
export const MaskUp: React.FC<{ at: number; children: React.ReactNode; dist?: number; dur?: number; style?: React.CSSProperties }> = ({
  at,
  children,
  dist = 1.1,
  dur = 16,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EASE });
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em", ...style }}>
      <div style={{ translate: `0 ${(1 - p) * dist * 100}%` }}>{children}</div>
    </div>
  );
};

export const fadeIn = (frame: number, at: number, dur = 12) =>
  interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EASE });

/** Small mono label, e.g. a kicker or a data annotation. */
export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.grey,
  size = 26,
  style,
}) => {
  const u = useU();
  return (
    <div
      style={{
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: size * u,
        letterSpacing: `${0.22 * size * u}px`,
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Discreet source label, fixed position above the platform UI zone. */
export const SourceTag: React.FC<{ text: string; dark: boolean }> = ({ text, dark }) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();
  const u = useU();
  return (
    <div
      style={{
        position: "absolute",
        left: 80 * u,
        right: 80 * u,
        top: height * ZONE.sourceY,
        opacity: fadeIn(frame, 10, 14) * 0.85,
        display: "flex",
        alignItems: "center",
        gap: 14 * u,
        maxWidth: width - 160 * u,
      }}
    >
      <div style={{ width: 22 * u, height: 2 * u, background: C.lime }} />
      <div
        style={{
          fontFamily: MONO,
          fontSize: 21 * u,
          letterSpacing: `${2.2 * u}px`,
          textTransform: "uppercase",
          color: dark ? C.grey : "#6E6E68",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Renders text where words wrapped in *asterisks* get the lime accent (or a lime underline on cream). */
export const Accent: React.FC<{ text: string; dark: boolean }> = ({ text, dark }) => (
  <>
    {text.split(/(\*[^*]+\*)/g).map((part, i) =>
      part.startsWith("*") && part.endsWith("*") ? (
        <span
          key={i}
          style={
            dark
              ? { color: C.lime }
              : { backgroundImage: `linear-gradient(${C.lime}, ${C.lime})`, backgroundSize: "100% 0.32em", backgroundPosition: "0 88%", backgroundRepeat: "no-repeat" }
          }
        >
          {part.slice(1, -1)}
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);

export const bodyStyle = (u: number, dark: boolean): React.CSSProperties => ({
  fontFamily: BODY,
  fontWeight: 500,
  fontSize: 40 * u,
  lineHeight: 1.35,
  color: dark ? C.stone : C.graphite,
});
