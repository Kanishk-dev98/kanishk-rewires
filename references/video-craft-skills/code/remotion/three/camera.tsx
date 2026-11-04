/**
 * Frame-driven camera rigs. Every rig is a PURE function of the frame that returns a CamPose,
 * so the same pose can drive the 3D camera (<CameraRig/>) and 2D overlays (projectToScreen)
 * and preview == render, frame for frame. Never animate the camera from useFrame/clock time.
 */
import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { clamp01, easeInOutCubic, lerp, settle } from "./core3d";

export type Vec3 = [number, number, number];
export type CamPose = { position: Vec3; target: Vec3; fov: number; roll?: number };

const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Orbit around target. Angles in degrees; azimuth 0 = camera on +Z looking at target. */
export function orbit(opts: {
  frame: number;
  start?: number;
  dur: number;
  fromDeg: number;
  toDeg: number;
  radius: number;
  height?: number;
  target?: Vec3;
  fov?: number;
  ease?: (t: number) => number;
}): CamPose {
  const { frame, start = 0, dur, fromDeg, toDeg, radius, height = 0.4, target = [0, 0, 0], fov = 30, ease = easeInOutCubic } = opts;
  const t = ease(clamp01((frame - start) / dur));
  const a = THREE.MathUtils.degToRad(lerp(fromDeg, toDeg, t));
  return { position: [target[0] + Math.sin(a) * radius, target[1] + height, target[2] + Math.cos(a) * radius], target, fov };
}

/** Dolly: camera position moves from -> to along a line (constant fov). */
export function dolly(opts: { frame: number; start?: number; dur: number; from: Vec3; to: Vec3; target?: Vec3; fov?: number; ease?: (t: number) => number }): CamPose {
  const { frame, start = 0, dur, from, to, target = [0, 0, 0], fov = 30, ease = easeInOutCubic } = opts;
  return { position: lerp3(from, to, ease(clamp01((frame - start) / dur))), target, fov };
}

/**
 * Push with settle: travel from -> to and arrive with a single ~3% overshoot (the "camera
 * settles" beat). overshoot is a fraction of the travel.
 */
export function pushSettle(opts: { frame: number; start?: number; dur: number; from: CamPose; to: CamPose; overshoot?: number }): CamPose {
  const { frame, start = 0, dur, from, to, overshoot = 0.03 } = opts;
  const t = settle(clamp01((frame - start) / dur), overshoot);
  return {
    position: lerp3(from.position, to.position, t),
    target: lerp3(from.target, to.target, t),
    fov: lerp(from.fov, to.fov, t),
    roll: lerp(from.roll ?? 0, to.roll ?? 0, t),
  };
}

/** Add a slow continuous drift so no frame is ever static (amplitude in world units, period in frames). */
export function withDrift(p: CamPose, frame: number, amp = 0.04, period = 240): CamPose {
  const w = (frame / period) * Math.PI * 2;
  return { ...p, position: [p.position[0] + Math.sin(w) * amp, p.position[1] + Math.sin(w * 0.7 + 1) * amp * 0.5, p.position[2]] };
}

/** Sequence of keyed poses, each transition eased with settle; holds in between. */
export function keyed(frame: number, keys: { at: number; dur: number; pose: CamPose; overshoot?: number }[]): CamPose {
  let pose = keys[0].pose;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (frame >= k.at) pose = pushSettle({ frame, start: k.at, dur: k.dur, from: pose, to: k.pose, overshoot: k.overshoot ?? 0.03 });
  }
  return pose;
}

/** Applies a CamPose to the default camera. Mount inside the ThreeCanvas. */
export const CameraRig: React.FC<{ pose: CamPose }> = ({ pose }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pose.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(...pose.target);
    if (pose.roll) camera.rotateZ(THREE.MathUtils.degToRad(pose.roll));
    if (camera.fov !== pose.fov) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
  });
  return null;
};

/**
 * Focus value for PostFX dof: depth of a world point along the camera's look direction
 * (that is what BokehPass "focus" means). Lerp between two of these for a rack focus.
 */
export function focusDistance(pose: CamPose, point: Vec3) {
  const [x, y, z] = pose.position;
  const d = new THREE.Vector3(pose.target[0] - x, pose.target[1] - y, pose.target[2] - z).normalize();
  return d.dot(new THREE.Vector3(point[0] - x, point[1] - y, point[2] - z));
}

/**
 * Project a world point to screen pixels for a pose (for 2D labels that track 3D objects).
 * Returns {x, y, z} with z = camera-space depth (positive in front).
 */
export function projectToScreen(pose: CamPose, point: Vec3, width = 1920, height = 1080) {
  const cam = new THREE.PerspectiveCamera(pose.fov, width / height, 0.05, 200);
  cam.position.set(...pose.position);
  cam.lookAt(...pose.target);
  if (pose.roll) cam.rotateZ(THREE.MathUtils.degToRad(pose.roll));
  cam.updateMatrixWorld();
  const v = new THREE.Vector3(...point);
  const depth = v.clone().applyMatrix4(cam.matrixWorldInverse).z * -1;
  v.project(cam);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height, z: depth };
}
