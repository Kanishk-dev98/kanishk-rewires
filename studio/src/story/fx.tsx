import { lightLeak } from "@remotion/effects/light-leak";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  Solid,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const { fontFamily: DISPLAY } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
export const { fontFamily: BODY } = loadInter("normal", {
  weights: ["500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const CREAM = "#FBF7F0";
export const INK = "#14161C";
export const MUTED = "#5E6472";
export const NIGHT = "#06070B";
export const PALETTE = ["#FF4D6D", "#FF9F1C", "#FFD60A", "#10C88A", "#1D9BF0", "#7B61FF", "#F15BB5"];

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Slow push-in plus optional decaying shake from a hit frame. */
export const Camera: React.FC<{
  children: React.ReactNode;
  push?: number;
  shakeAt?: number;
  shakeAmount?: number;
}> = ({ children, push = 0.06, shakeAt, shakeAmount = 22 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1 + push], clamp);
  let dx = 0;
  let dy = 0;
  if (shakeAt !== undefined && frame >= shakeAt) {
    const decay = Math.exp(-(frame - shakeAt) / 6);
    dx = (random(`sx${frame}`) - 0.5) * 2 * shakeAmount * decay;
    dy = (random(`sy${frame}`) - 0.5) * 2 * shakeAmount * decay;
  }
  return (
    <AbsoluteFill style={{ scale: String(zoom), translate: `${dx}px ${dy}px` }}>{children}</AbsoluteFill>
  );
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain${frame % 8}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed={frame % 8} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${frame % 8})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Drifting glowing dust particles. */
export const Particles: React.FC<{ count?: number; color?: string; seed?: string; speed?: number }> = ({
  count = 60,
  color = "#ffffff",
  seed = "p",
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * width;
        const y0 = random(`${seed}y${i}`) * height;
        const size = 2 + random(`${seed}s${i}`) * 6;
        const v = (0.3 + random(`${seed}v${i}`)) * speed;
        const y = (((y0 - frame * v * 2) % height) + height) % height;
        const x = x0 + Math.sin((frame + i * 20) / 40) * 20;
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin((frame + i * 13) / 25));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: twinkle * 0.8,
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Diagonal anamorphic light streaks that sweep across. */
export const Streaks: React.FC<{ color: string; seed?: string }> = ({ color, seed = "st" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {new Array(5).fill(0).map((_, i) => {
        const delay = random(`${seed}${i}`) * 20;
        const x = interpolate(frame - delay, [0, 40], [-900, 1600], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 200 + i * 330 + random(`${seed}t${i}`) * 100,
              left: x,
              width: 900,
              height: 6 + random(`${seed}h${i}`) * 10,
              rotate: "-12deg",
              background: `linear-gradient(90deg, transparent, ${color}, white, ${color}, transparent)`,
              filter: "blur(4px)",
              opacity: 0.8,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Full-frame white flash that decays. */
export const Flash: React.FC<{ at?: number; length?: number; color?: string }> = ({
  at = 0,
  length = 12,
  color = "white",
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: color,
        opacity: interpolate(frame, [at, at + 1, at + length], [0, 1, 0], clamp),
        pointerEvents: "none",
      }}
    />
  );
};

/** Expanding shockwave rings from the center. */
export const Shockwave: React.FC<{ at: number; color: string; rings?: number }> = ({ at, color, rings = 3 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
      {new Array(rings).fill(0).map((_, i) => {
        const p = interpolate(frame - at - i * 6, [0, 40], [0, 1], { ...clamp, easing: easeOut });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 200 + p * 1900,
              height: 200 + p * 1900,
              borderRadius: "50%",
              border: `${10 * (1 - p) + 1}px solid ${color}`,
              opacity: p === 0 ? 0 : 1 - p,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Multi-colour burst of particles flying outward. */
export const Burst: React.FC<{ at: number; count?: number }> = ({ at, count = 70 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame - at;
  if (t < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const angle = random(`ba${i}`) * Math.PI * 2;
        const speed = 18 + random(`bs${i}`) * 34;
        const dist = speed * t * Math.exp(-t / 30) * 1.6;
        const x = width / 2 + Math.cos(angle) * dist;
        const y = height * 0.42 + Math.sin(angle) * dist + t * t * 0.08;
        const size = 10 + random(`bz${i}`) * 18;
        const color = PALETTE[i % PALETTE.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size * (random(`bq${i}`) > 0.5 ? 1 : 0.45),
              borderRadius: random(`br${i}`) > 0.5 ? "50%" : 3,
              background: color,
              rotate: `${t * (random(`bw${i}`) * 20 - 10)}deg`,
              opacity: interpolate(t, [50, 80], [1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const LightLeak: React.FC<{ seed?: number; hueShift?: number }> = ({ seed = 0, hueShift = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, height, width } = useVideoConfig();
  return (
    <Solid
      width={width}
      height={height}
      effects={[
        lightLeak({
          seed,
          hueShift,
          progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp),
        }),
      ]}
    />
  );
};
