/**
 * TileField3D: a field of ~1000 small extruded tiles ("many workers at work", scale beats).
 * One InstancedMesh (one draw call). `shape`: "square" grid (default) or "triangle" lattice.
 *
 * Activity is deterministic: each tile has a seeded phase (remotion random), and a work wave
 * sweeps across the field; active tiles lift, tilt and turn the bright accent. Optional "focus" tile
 * stays lit (the one we follow).
 */
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { B3, extrudeCentered, shapeFrom } from "./core3d";

export type TileField3DProps = {
  frame: number;
  cols?: number;
  rows?: number;
  size?: number;
  /** 0..1 build-in from the centre outwards. */
  build?: number;
  /** Activity amount 0..1. */
  activity?: number;
  /** wave speed (units per frame) */
  speed?: number;
  tone?: "light" | "dark";
  focus?: [number, number] | null;
  shape?: "square" | "triangle";
  seed?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

const tmp = new THREE.Object3D();
const cA = new THREE.Color();
const cB = new THREE.Color();

export const TileField3D: React.FC<TileField3DProps> = ({
  frame,
  cols = 44,
  rows = 22,
  size = 0.16,
  build = 1,
  activity = 1,
  speed = 0.035,
  tone = "dark",
  focus = null,
  shape = "square",
  seed = "tiles",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const w = size * 0.86;
    const h = shape === "triangle" ? (Math.sqrt(3) / 2) * w : w * 0.5;
    const pts =
      shape === "triangle"
        ? [new THREE.Vector2(-w / 2, -h / 3), new THREE.Vector2(w / 2, -h / 3), new THREE.Vector2(0, (2 * h) / 3)]
        : [new THREE.Vector2(-h / 2, -h / 2), new THREE.Vector2(h / 2, -h / 2), new THREE.Vector2(h / 2, h / 2), new THREE.Vector2(-h / 2, h / 2)];
    const g = extrudeCentered(shapeFrom(pts), size * 0.12, size * 0.025, 2, 1);
    g.rotateX(-Math.PI / 2); // lie flat on XZ
    return g;
  }, [size, shape]);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#FFFFFF",
        metalness: 0.55,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.2,
      }),
    [],
  );
  const cells = useMemo(() => {
    const out: { x: number; z: number; flip: boolean; ph: number; r: number }[] = [];
    const h = (Math.sqrt(3) / 2) * size;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const tri = shape === "triangle";
        const flip = tri && (i + j) % 2 === 1;
        out.push({
          x: (i - cols / 2) * (size / 2) + size / 4,
          z: tri ? (j - rows / 2) * h + (flip ? h / 6 : -h / 6) * -1 : (j - rows / 2) * (size / 2) + size / 4,
          flip,
          ph: random(`${seed}-p-${i}-${j}`),
          r: random(`${seed}-r-${i}-${j}`),
        });
      }
    return out;
  }, [cols, rows, size, seed, shape]);

  const span = (cols * size) / 2;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const base = tone === "dark" ? "#161E36" : "#D9DEEA";
    const lit = B3.accentBright;
    cells.forEach((c, k) => {
      const dist = Math.hypot(c.x, c.z) / span;
      const b = Math.max(0, Math.min(1, build * 1.6 - dist));
      // a work wave sweeping +x, plus seeded sparkle of individual tiles
      const wavePos = ((frame * speed) % (span * 3)) - span * 1.2;
      const wave = Math.exp(-Math.pow((c.x - wavePos) / (size * 3), 2));
      const own = Math.max(0, Math.sin(frame / 14 + c.ph * 40)) ** 8 * (c.r > 0.72 ? 1 : 0);
      let act = Math.min(1, (wave * 0.9 + own) * activity);
      if (focus && Math.abs(c.x - focus[0]) < size * 0.3 && Math.abs(c.z - focus[1]) < size * 0.4) act = 1;
      const lift = act * size * 0.5;
      tmp.position.set(c.x, lift - (1 - b) * 0.4, c.z);
      tmp.rotation.set(act * 0.35 * (c.ph - 0.5), c.flip ? Math.PI : 0, act * 0.25 * (c.r - 0.5));
      const s = 0.001 + b * (1 - act * 0.04);
      tmp.scale.set(s, s, s);
      tmp.updateMatrix();
      m.setMatrixAt(k, tmp.matrix);
      cA.set(base);
      cB.set(lit);
      m.setColorAt(k, cA.lerp(cB, act));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group position={position} rotation={rotation}>
      <instancedMesh ref={ref} args={[geo, mat, cells.length]} frustumCulled={false} />
    </group>
  );
};
