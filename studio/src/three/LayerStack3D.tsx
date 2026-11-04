/**
 * LayerStack3D: an architecture in one shot. Frosted glass slabs (e.g. Input / Gate / Output) stacked in depth,
 * with a glowing dot that travels down through them. The gate slab can ALLOW (dot passes, gate edge goes accent)
 * or HOLD (dot stops on the gate, gate tints deny, HELD square on its label, downstream slabs NOT SENT).
 * The "foundation stack" device: slabs revealed by a pull-back, one layer per VO clause.
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { B3, clamp01, easeInOutCubic, extrudeCentered, roundedRectShape } from "./core3d";
import { GlowSprite, makeFresnelMaterial } from "./env";
import { frosted } from "./materials";
import { MONO, roundRect, SANS, stateGlyph, text, useCanvasTexture } from "./texture";

const RADIUS = 0.09;
const BEVEL = 0.018;

export type StackLayer = { title: string; sub: string };

export const DEFAULT_LAYERS: StackLayer[] = [
  { title: "Request", sub: "Order 4182 · 96.20" },
  { title: "Policy gate", sub: "Rule: amount ≤ 200 · ALLOW" },
  { title: "Ledger", sub: "Posted · receipt 7F3A" },
];

export type LayerStack3DProps = {
  layers?: StackLayer[];
  /** 0..1 dot progress from above the top slab to below the bottom slab. */
  dot?: number;
  /** 0..1 build: slabs rise in one by one. */
  build?: number;
  gate?: "allow" | "held";
  /** Which slab is the gate (default 1, the middle of three). */
  gateIndex?: number;
  width?: number;
  length?: number;
  thickness?: number;
  gap?: number;
  tone?: "light" | "dark";
  /** Per-layer offset [x, z] so lower slabs step toward camera and their tops stay readable. */
  stagger?: [number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
};

type LabelState = "idle" | "passed" | "held" | "blocked";

/**
 * Front-face label: lives on the slab's front wall, so no slab above can ever cover it
 * (top-face labels were foreshortened and occluded). One line: index · title · sub, state chip right.
 * Sized so the sub line is >= 28 px on screen when the slab spans >= 900 px.
 */
const Label: React.FC<{ layer: StackLayer; w: number; h: number; z: number; state: LabelState; tone: "light" | "dark"; idx: number }> = ({ layer, w, h, z, state, tone, idx }) => {
  const W = 2048;
  const H = Math.round((W * h) / w);
  const tex = useCanvasTexture(
    (ctx) => {
      const ink = tone === "light" ? B3.ink : "#F4F6FC";
      const sub = tone === "light" ? "#3D414B" : "#B8C0D6";
      const base = Math.round(H * 0.66);
      text(ctx, `0${idx + 1}`, 60, base, { size: 66, weight: 500, color: state === "held" ? B3.denyDeep : tone === "light" ? B3.accentText : B3.accent, mono: true, tracking: 4 });
      text(ctx, layer.title, 190, base + 4, { size: 112, weight: 600, color: state === "blocked" ? (tone === "light" ? "#8A8F9A" : "#6F7A94") : ink });
      ctx.font = `600 112px ${SANS}`;
      const tw = ctx.measureText(layer.title).width;
      // sub line is truncated with an ellipsis so it never runs under the state chip
      const subX = 190 + tw + 50;
      const maxW = W - 480 - subX;
      ctx.font = `500 70px ${MONO}`;
      let subText = layer.sub;
      while (subText.length > 3 && ctx.measureText(subText).width > maxW) subText = subText.slice(0, -2);
      if (subText !== layer.sub) subText = subText.replace(/[\s·]+$/, "") + "…";
      text(ctx, subText, subX, base, { size: 70, weight: 500, color: sub, mono: true });
      if (state !== "idle") {
        const label = state === "passed" ? "PASSED" : state === "held" ? "HELD" : "NOT SENT";
        const glyph = state === "passed" ? "allow" : state === "held" ? "held" : "ask";
        ctx.font = `600 66px ${MONO}`;
        const lw = ctx.measureText(label).width;
        const bw = lw + 150;
        const bh = Math.min(H - 30, 124);
        const bx = W - 50 - bw;
        const by = (H - bh) / 2;
        ctx.fillStyle = state === "held" ? B3.denyWash : state === "blocked" ? "rgba(23,23,23,0.06)" : tone === "light" ? "#FFFFFF" : "rgba(120,150,255,0.2)";
        roundRect(ctx, bx, by, bw, bh, bh / 2);
        ctx.fill();
        const col = state === "held" ? B3.denyDeep : state === "blocked" ? "#6B6B6B" : B3.accentDeep;
        stateGlyph(ctx, glyph, bx + 62, by + bh / 2, 20, col);
        text(ctx, label, bx + 108, by + bh / 2 + 23, { size: 66, weight: 600, color: state === "passed" ? (tone === "light" ? B3.accentText : B3.accentBright) : col, mono: true });
      }
    },
    W,
    H,
    layer.title + layer.sub + tone + state,
  );
  return (
    <mesh position={[0, 0, z]} renderOrder={3}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

export const LayerStack3D: React.FC<LayerStack3DProps> = ({
  layers = DEFAULT_LAYERS,
  dot = 0,
  build = 1,
  gate = "allow",
  gateIndex = 1,
  width = 2.4,
  length = 1.3,
  thickness = 0.24,
  gap = 0.55,
  tone = "light",
  stagger = [0.18, 0.42],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const geo = useMemo(() => {
    const g = extrudeCentered(roundedRectShape(width, length, RADIUS), thickness, BEVEL, 6, 16);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [width, length, thickness]);
  const mats = useMemo(
    () =>
      layers.map((_, i) =>
        frosted({
          color: tone === "light" ? "#ECEFF8" : "#141A2B",
          roughness: 0.22 + i * 0.03,
          thickness: 0.35,
          attenuationColor: new THREE.Color(tone === "light" ? B3.accentSoft2 : B3.deep),
          attenuationDistance: tone === "light" ? 0.55 : 0.5,
          envMapIntensity: 0.8,
        }),
      ),
    [layers, tone],
  );
  const heldMat = useMemo(
    () =>
      frosted({
        color: tone === "light" ? "#FDF3F1" : "#2A1614",
        roughness: 0.25,
        thickness: 0.35,
        attenuationColor: new THREE.Color("#F2B3A9"),
        attenuationDistance: 1.4,
        envMapIntensity: 0.8,
      }),
    [tone],
  );
  const rimOn = useMemo(() => makeFresnelMaterial(B3.accentBright, 1.4, 2.2), []);
  const rimHeld = useMemo(() => makeFresnelMaterial(B3.deny, 1.4, 2.2), []);
  const rimOff = useMemo(() => makeFresnelMaterial(tone === "light" ? "#FFFFFF" : B3.accent, 0.35, 3), [tone]);

  const n = layers.length;
  const top = ((n - 1) * gap) / 2;
  const ys = layers.map((_, i) => top - i * gap);
  // dot path: from top + gap down to bottom - gap; held gate clamps it at the gate slab
  const gateIdx = Math.max(0, Math.min(layers.length - 1, gateIndex));
  const yStart = top + gap * 0.9;
  const yEnd = ys[n - 1] - gap * 0.9;
  const held = gate === "held";
  let dy = yStart + (yEnd - yStart) * easeInOutCubic(clamp01(dot));
  if (held) dy = Math.max(dy, ys[gateIdx] + thickness * 0.5 + 0.06);
  // continuous layer index of the dot, so it follows the stagger
  const li = Math.max(0, Math.min(n - 1, (top - dy) / gap));
  const dx = li * stagger[0];
  const dz = li * stagger[1];

  return (
    <group position={position} rotation={rotation}>
      {layers.map((layer, i) => {
        const b = clamp01(build * n - i);
        if (b <= 0) return null;
        const e = easeInOutCubic(b);
        const y = ys[i] - (1 - e) * 0.35;
        const reached = dy <= ys[i] + thickness * 0.5 + 0.07 ? 1 : 0;
        const isHeldGate = held && i === gateIdx && reached === 1;
        const heldNow = held && dy <= ys[gateIdx] + thickness * 0.5 + 0.07;
        const state: LabelState = isHeldGate ? "held" : heldNow && i > gateIdx ? "blocked" : reached ? "passed" : "idle";
        return (
          <group key={i} position={[i * stagger[0], y, i * stagger[1]]}>
            <mesh geometry={geo} material={isHeldGate ? heldMat : mats[i]} />
            <mesh geometry={geo} material={reached ? (isHeldGate ? rimHeld : rimOn) : rimOff} renderOrder={2} userData={{ noDepth: true }} />
            <Label layer={layer} w={width - 2 * RADIUS} h={thickness - 2 * BEVEL} z={length / 2 + BEVEL + 0.002} state={state} tone={tone} idx={i} />
          </group>
        );
      })}
      {dot > 0 && dot < 1.0001 ? (
        <group position={[dx, dy, dz]}>
          <mesh>
            <sphereGeometry args={[0.055, 48, 32]} />
            <meshStandardMaterial color="#FFFFFF" emissive={held && dy <= ys[gateIdx] + 0.2 ? B3.deny : B3.accentBright} emissiveIntensity={2.2} roughness={0.2} />
          </mesh>
          <GlowSprite size={0.5} color={held && dy <= ys[gateIdx] + 0.2 ? B3.deny : B3.accentDeep} opacity={0.9} />
          <pointLight intensity={2.5} distance={1.5} decay={2} color={B3.accentBright} />
        </group>
      ) : null}
    </group>
  );
};

/** World-space y of each slab top for a stack at the origin (to pin 2D captions with projectToScreen). */
export function stackLayerY(n = 3, gap = 0.55, thickness = 0.24) {
  const top = ((n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => top - i * gap + thickness / 2);
}

/** World-space anchor on the left edge of slab i (for pinned 2D captions), matching the default stagger. */
export function stackLayerAnchor(i: number, opts: { n?: number; gap?: number; thickness?: number; width?: number; stagger?: [number, number] } = {}): [number, number, number] {
  const { n = 3, gap = 0.55, thickness = 0.24, width = 2.4, stagger = [0.18, 0.42] } = opts;
  return [i * stagger[0] - width / 2, stackLayerY(n, gap, thickness)[i], i * stagger[1]];
}
