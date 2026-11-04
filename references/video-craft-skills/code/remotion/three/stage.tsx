/**
 * Stage3D: the one entry point for a 3D layer in a Remotion composition.
 *
 *   <Stage3D mode="light" pose={pose} post={{ dof: { focus }, bloom: {} }}> ...objects </Stage3D>
 *
 * - opaque (default): draws the stage backdrop inside the scene, so glass refracts it, and
 *   PostFX (DOF/bloom/grain) can run.
 * - transparent: no backdrop, alpha canvas, composites over/under 2D Remotion layers.
 *   Glass falls back to env-only reflections; use GlowSprite instead of bloom.
 */
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { CameraRig, CamPose } from "./camera";
import { Backdrop, CastShadows, LightRig, StageMode, StudioEnv } from "./env";
import { PostFX, PostSettings } from "./post";

export type Stage3DProps = {
  mode?: StageMode;
  pose: CamPose;
  /** opaque: backdrop + optional post. transparent: alpha canvas for compositing. */
  transparent?: boolean;
  post?: Omit<PostSettings, "frame"> | null;
  envIntensity?: number;
  envRotation?: number;
  exposure?: number;
  lights?: boolean;
  rim?: number;
  backdropSpot?: [number, number];
  /** Backdrop hairline grid: square (default) or triangle lattice. Glass refracts it. */
  grid?: "square" | "triangle";
  /** Real soft shadow maps (PCF soft, 2048, radius 10) from the key light; add <ShadowFloor/>. */
  shadows?: boolean;
  shadowStrength?: number;
  keyPosition?: [number, number, number];
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export const Stage3D: React.FC<Stage3DProps> = ({
  mode = "light",
  pose,
  transparent = false,
  post = { grain: 0.022 },
  envIntensity = 1,
  envRotation = 0,
  exposure = 1,
  lights = true,
  rim = 1,
  backdropSpot,
  grid = "square",
  shadows = false,
  shadowStrength = 0.55,
  keyPosition,
  style,
  children,
}) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const usePost = !transparent && post;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      dpr={1}
      shadows={shadows ? "soft" : false}
      style={{ position: "absolute", inset: 0, ...style }}
      gl={{ antialias: true, alpha: transparent, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
      camera={{ fov: pose.fov, near: 0.05, far: 100, position: pose.position }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = exposure;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        if (transparent) gl.setClearColor(0x000000, 0);
      }}
    >
      <CameraRig pose={pose} />
      <StudioEnv mode={mode} intensity={envIntensity} rotationY={envRotation} />
      {lights ? <LightRig mode={mode} rim={rim} shadows={shadows} shadowStrength={shadowStrength} keyPosition={keyPosition} /> : null}
      {shadows ? <CastShadows /> : null}
      {!transparent ? <Backdrop mode={mode} aspect={width / height} spot={backdropSpot} gridKind={grid} /> : null}
      {children}
      {usePost ? <PostFX {...post} frame={frame} /> : null}
    </ThreeCanvas>
  );
};

/**
 * Layer3D: a transparent Stage3D in its own AbsoluteFill, for sandwiching between 2D layers:
 *
 *   <AbsoluteFill>
 *     <LightStageBg/>                 // 2D under
 *     <Layer3D pose={pose}>...</Layer3D>
 *     <Caption/>                      // 2D over (use projectToScreen(pose, p) to pin to 3D)
 *   </AbsoluteFill>
 */
export const Layer3D: React.FC<Omit<Stage3DProps, "transparent" | "post"> & { zIndex?: number }> = ({ zIndex, ...p }) => (
  <AbsoluteFill style={{ zIndex, pointerEvents: "none" }}>
    <Stage3D {...p} transparent post={null} />
  </AbsoluteFill>
);
