import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, C, clamp, EASE, EASE_IO, MONO } from "./brand";

/** The kanishk.rewires wordmark: one typeface (IBM Plex Mono), always lowercase, lime dot. */
export const Wordmark: React.FC<{ size: number; color?: string }> = ({ size, color = C.cream }) => (
  <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap", color, fontFamily: MONO, fontWeight: 500, fontSize: size, letterSpacing: `${-0.01 * size}px`, textTransform: "lowercase" }}>
    <span>{BRAND.wordmark.left}</span>
    <span style={{ color: C.lime, fontWeight: 600 }}>{BRAND.wordmark.dot}</span>
    <span>{BRAND.wordmark.right}</span>
  </div>
);

/**
 * Signature ending. Phases as fractions of `durationInFrames`:
 * strands converge (0 to 0.38) → circle closes and monogram resolves (0.3 to 0.55)
 * → wordmark and tagline (0.5 to 0.72) → still lockup.
 */
export const LogoReveal: React.FC<{ size?: number; strands?: number; tagline?: boolean; nodes?: string[]; cta?: string; wordSize?: number }> = ({
  size = 380,
  strands = 18,
  tagline = true,
  nodes,
  cta,
  wordSize = 84,
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
  const ctaIn = interpolate(frame, [f(0.68), f(0.8)], [0, 1], { ...clamp, easing: EASE });
  // System variant: the five layers sit on a wide ring, link up, then contract into the monogram's ring.
  const sysLink = interpolate(frame, [f(0.04), f(0.26)], [0, 1], { ...clamp, easing: EASE_IO });
  const sysPull = interpolate(frame, [f(0.24), f(0.42)], [0, 1], { ...clamp, easing: EASE_IO });
  const ringR = R * (2.15 - 1.15 * sysPull);
  const nodePos = (i: number, n: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [cx + ringR * Math.cos(a), cy + ringR * Math.sin(a)];
  };

  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {nodes
          ? nodes.map((_, i) => {
              const [x1, y1] = nodePos(i, nodes.length);
              const [x2, y2] = nodePos((i + 1) % nodes.length, nodes.length);
              const seg = interpolate(sysLink, [i / nodes.length, (i + 1) / nodes.length], [0, 1], clamp);
              return (
                <line key={`l${i}`} x1={x1} y1={y1} x2={x1 + (x2 - x1) * seg} y2={y1 + (y2 - y1) * seg} stroke={C.lime} strokeOpacity={0.7 * strandsOut} strokeWidth={2 * u} />
              );
            })
          : null}
        {nodes
          ? nodes.map((n, i) => {
              const [x, y] = nodePos(i, nodes.length);
              const shrink = 1 - sysPull;
              return (
                <g key={`n${i}`} opacity={strandsOut}>
                  <circle cx={x} cy={y} r={(9 + 9 * shrink) * u} fill={C.charcoal} stroke={C.lime} strokeWidth={2.4 * u} />
                  <text x={x} y={y + (y < cy ? -30 : 44) * u} textAnchor="middle" fill={C.stone} opacity={shrink} style={{ fontFamily: MONO, fontSize: 20 * u, letterSpacing: 3 * u }}>
                    {n}
                  </text>
                </g>
              );
            })
          : null}
        {(nodes ? [] : new Array(strands).fill(0)).map((_, i) => {
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
            <Wordmark size={Math.min(wordSize * u, W * 0.075)} />
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
        {cta ? (
          <div style={{ marginTop: 56 * u, opacity: ctaIn, translate: `0 ${(1 - ctaIn) * 12 * u}px`, fontFamily: MONO, fontSize: 22 * u, letterSpacing: `${3 * u}px`, color: C.grey, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 14 * u }}>
            <span style={{ width: 10 * u, height: 10 * u, borderRadius: "50%", background: C.lime, display: "inline-block" }} />
            {cta}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
