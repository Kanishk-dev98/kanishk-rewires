/**
 * LightStreaks: additive light streaks for transitions and energy beats.
 * - mode "sweep": diagonal streaks cross the frame (a light wipe of soft accent/white bars).
 * - mode "tunnel": streaks fly radially past the camera (push-through), ending in a flash.
 * Frame-driven and seeded; flagged noDepth so DOF ignores them. Looks best with bloom.
 */
import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { B3 } from "./core3d";

export type LightStreaksProps = {
  frame: number;
  mode?: "sweep" | "tunnel";
  count?: number;
  /** 0..1 intensity envelope (drive with an in/out curve). */
  intensity?: number;
  speed?: number;
  angleDeg?: number;
  colors?: string[];
  seed?: string;
  position?: [number, number, number];
};

const streakMat = (color: string) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { color: { value: new THREE.Color(color) }, alpha: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color; uniform float alpha; varying vec2 vUv;
      void main(){
        float head = smoothstep(0.0, 0.85, vUv.x) * (1.0 - smoothstep(0.92, 1.0, vUv.x));
        float core = exp(-pow((vUv.y - 0.5) * 7.0, 2.0));
        float a = head * core * alpha;
        gl_FragColor = vec4(color * a * 1.6, a);
      }`,
  });

export const LightStreaks: React.FC<LightStreaksProps> = ({
  frame,
  mode = "sweep",
  count = 26,
  intensity = 1,
  speed = 1,
  angleDeg = 18,
  colors = ["#FFFFFF", B3.accentBright, B3.accent, "#EEF2FF"],
  seed = "streaks",
  position = [0, 0, 0],
}) => {
  const mats = useMemo(() => colors.map(streakMat), [colors]);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: random(`${seed}-a${i}`),
        b: random(`${seed}-b${i}`),
        c: random(`${seed}-c${i}`),
        d: random(`${seed}-d${i}`),
        col: i % colors.length,
      })),
    [count, seed, colors.length],
  );
  mats.forEach((m) => (m.uniforms.alpha.value = intensity));
  if (intensity <= 0.001) return null;

  if (mode === "sweep") {
    const ang = THREE.MathUtils.degToRad(angleDeg);
    return (
      <group position={position} rotation={[0, 0, ang]}>
        {items.map((s, i) => {
          const len = 1.2 + s.b * 2.4;
          const travel = 12;
          const x = ((s.a * travel + frame * 0.11 * speed * (0.6 + s.c)) % travel) - travel / 2;
          const y = (s.d - 0.5) * 3.2;
          const z = (s.c - 0.5) * 1.5 - 0.3;
          const th = 0.012 + s.b * 0.03;
          return (
            <mesh key={i} position={[x, y, z]} material={mats[s.col]} userData={{ noDepth: true }} renderOrder={5}>
              <planeGeometry args={[len, th * 6]} />
            </mesh>
          );
        })}
      </group>
    );
  }
  // tunnel: streaks on a cylinder around -Z, moving toward the camera (+Z)
  return (
    <group position={position}>
      {items.map((s, i) => {
        const theta = s.a * Math.PI * 2;
        const r = 0.5 + s.b * 1.6;
        const depth = 14;
        const z = ((s.c * depth + frame * 0.22 * speed * (0.7 + s.d)) % depth) - depth + 2;
        const len = 1.5 + s.d * 3;
        return (
          <group key={i} position={[Math.cos(theta) * r, Math.sin(theta) * r, z]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh material={mats[s.col]} userData={{ noDepth: true }} renderOrder={5} rotation={[theta, 0, 0]}>
              <planeGeometry args={[len, 0.06 + s.b * 0.05]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
