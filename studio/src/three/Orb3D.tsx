/**
 * Orb3D: a clear tinted glass sphere with an inner glow core, holding the logo (Logo3D, metal).
 * The "assistant / identity orb" device as a real volume object, not a gradient disc.
 *
 * pulse: frame-driven 0..1 brightness of the core; works with or without bloom (GlowSprite).
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { B3 } from "./core3d";
import { GlowSprite, makeFresnelMaterial } from "./env";
import { glass } from "./materials";
import { Logo3D, Logo3DProps } from "./Logo3D";

export type Orb3DProps = {
  radius?: number;
  /** Core brightness 0..1 (drive it from frame). */
  pulse?: number;
  /** Frame for the inner mark's slow spin. */
  frame?: number;
  showMark?: boolean;
  /** Logo source for the inner object (defaults to the theme ACCENT_SHAPE). */
  logo?: Pick<Logo3DProps, "svg" | "polygons">;
  rim?: number;
  position?: [number, number, number];
  scale?: number;
};

export const Orb3D: React.FC<Orb3DProps> = ({ radius = 0.5, pulse = 0.6, frame = 0, showMark = true, logo, rim = 1, position = [0, 0, 0], scale = 1 }) => {
  const shell = useMemo(
    () =>
      glass({
        color: "#F4F6FF",
        roughness: 0.03,
        thickness: radius * 1.2,
        ior: 1.35,
        attenuationColor: new THREE.Color(B3.accentBright),
        attenuationDistance: radius * 3,
        dispersion: 0.25,
        envMapIntensity: 1.5,
      }),
    [radius],
  );
  const core = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0B1640", emissive: new THREE.Color(B3.accentBright), emissiveIntensity: 1, roughness: 0.5 }), []);
  core.emissiveIntensity = 0.6 + pulse * 2.4;
  const rimMat = useMemo(() => makeFresnelMaterial(B3.accentBright, rim, 3.2), [rim]);
  return (
    <group position={position} scale={scale}>
      <mesh material={shell}>
        <sphereGeometry args={[radius, 96, 64]} />
      </mesh>
      <mesh material={rimMat} renderOrder={2} userData={{ noDepth: true }}>
        <sphereGeometry args={[radius * 1.001, 96, 64]} />
      </mesh>
      {showMark ? (
        <Logo3D {...logo} finish="metal" rim={0.6} scale={radius * 0.95} rotation={[0.25, Math.sin(frame / 70) * 0.5 - 0.2, 0.05]} wave={frame} />
      ) : (
        <mesh material={core}>
          <icosahedronGeometry args={[radius * 0.28, 4]} />
        </mesh>
      )}
      <pointLight intensity={1.5 + pulse * 3} distance={radius * 6} decay={2} color={B3.accentBright} />
      <GlowSprite size={radius * (2.2 + pulse * 0.6)} color={B3.accentDeep} opacity={0.35 + pulse * 0.25} />
    </group>
  );
};
