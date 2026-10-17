import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";

/** The KANISHK.REWIRES wordmark, set in the brand type (no artwork file exists yet). */
export const Wordmark: React.FC<{ size: number; color?: string }> = ({ size, color = C.cream }) => (
  <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap", color }}>
    <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: size, letterSpacing: `${-0.02 * size}px` }}>{BRAND.wordmark.left}</span>
    <span
      style={{
        display: "inline-block",
        width: size * 0.2,
        height: size * 0.2,
        borderRadius: "50%",
        background: C.lime,
        margin: `0 ${size * 0.05}px 0 ${size * 0.07}px`,
      }}
    />
    <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: size * 1.06, letterSpacing: `${-0.01 * size}px` }}>{BRAND.wordmark.right}</span>
  </div>
);

/**
 * Signature ending. Phases as fractions of `durationInFrames`:
 * strands converge (0 to 0.38) → circle closes and monogram resolves (0.3 to 0.55)
 * → wordmark and tagline (0.5 to 0.72) → still lockup.
 */
export const LogoReveal: React.FC<{ size?: number; strands?: number; tagline?: boolean }> = ({
  size = 380,
  strands = 18,
  tagline = true,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, durationInFrames: D } = useVideoConfig();
  const u = Math.min(W, H) / 1080;
  const portrait = H > W;
  const R = (size * u) / 2;
  const cx = W / 2;
  const cy = portrait ? H * 0.4 : H * 0.4;
  const f = (a: number) => a * D;

  const circleP = interpolate(frame, [f(0.22), f(0.42)], [0, 1], { ...clamp, easing: EASE_IO });
  const strandsOut = interpolate(frame, [f(0.4), f(0.55)], [1, 0], clamp);
  const logoIn = interpolate(frame, [f(0.34), f(0.52)], [0, 1], { ...clamp, easing: EASE });
  const ringOut = interpolate(frame, [f(0.48), f(0.58)], [1, 0], clamp);
  const wordIn = interpolate(frame, [f(0.5), f(0.66)], [0, 1], { ...clamp, easing: EASE });
  const tagIn = interpolate(frame, [f(0.6), f(0.74)], [0, 1], { ...clamp, easing: EASE });
  const pulse = interpolate(frame, [f(0.5), f(0.68)], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {new Array(strands).fill(0).map((_, i) => {
          const r = (k: string) => random(`strand${i}${k}`);
          const theta = (i / strands) * Math.PI * 2 + r("t") * 0.3;
          const tx = cx + R * Math.cos(theta);
          const ty = cy + R * Math.sin(theta);
          const far = Math.max(W, H) * (0.7 + 0.4 * r("d"));
          const sa = theta + (r("s") - 0.5) * 1.4;
          const sx = cx + far * Math.cos(sa);
          const sy = cy + far * Math.sin(sa);
          const bend = (r("b") - 0.5) * far * 0.6;
          const c1x = (sx + tx) / 2 + bend * Math.sin(theta);
          const c1y = (sy + ty) / 2 - bend * Math.cos(theta);
          const delay = r("w") * 0.12;
          const p = interpolate(frame, [f(delay), f(0.3 + delay * 0.6)], [0, 1], { ...clamp, easing: EASE_IO });
          return (
            <path
              key={i}
              d={`M ${sx} ${sy} Q ${c1x} ${c1y} ${tx} ${ty}`}
              stroke={C.cream}
              strokeOpacity={0.55 * strandsOut}
              strokeWidth={(0.8 + r("w2")) * u}
              fill="none"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
            />
          );
        })}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          stroke={C.cream}
          strokeOpacity={0.8 * ringOut}
          strokeWidth={1.6 * u}
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - circleP}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* one restrained lime pulse as the monogram lands */}
        <circle cx={cx} cy={cy} r={R * (1 + 0.18 * pulse)} stroke={C.lime} strokeOpacity={0.5 * (1 - pulse) * (pulse > 0 ? 1 : 0)} strokeWidth={2 * u} fill="none" />
      </svg>

      <Img
        src={staticFile(BRAND.logo.monogramPublic)}
        style={{
          position: "absolute",
          left: cx - R,
          top: cy - R,
          width: R * 2,
          height: R * 2,
          opacity: logoIn,
          scale: String(interpolate(logoIn, [0, 1], [0.94, 1])),
          clipPath: `circle(${interpolate(logoIn, [0, 1], [30, 51])}% at 50% 50%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cy + R + 90 * u,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ overflow: "hidden", paddingBottom: 8 * u }}>
          <div style={{ translate: `0 ${(1 - wordIn) * 105}%`, opacity: wordIn }}>
            <Wordmark size={Math.min(84 * u, W * 0.075)} />
          </div>
        </div>
        {tagline ? (
          <div
            style={{
              marginTop: 34 * u,
              opacity: tagIn,
              fontFamily: MONO,
              fontSize: 24 * u,
              letterSpacing: `${0.5 * 24 * u}px`,
              color: C.stone,
              textTransform: "uppercase",
            }}
          >
            {BRAND.tagline}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
