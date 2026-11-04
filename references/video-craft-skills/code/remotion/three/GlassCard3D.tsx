/**
 * GlassCard3D: a record / receipt / profile card as a real glass slab (rounded, bevelled, refractive)
 * with crisp canvas-drawn content on its front face.
 *
 * Content is data (title, rows, footer), drawn at 2048 px width so body text is >= 64 tex px.
 * Frame the card at >= 45% of frame width for >= 28 px on screen (see texture.tsx).
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { B3, clamp01, extrudeCentered, roundedRectShape } from "./core3d";
import { makeFresnelMaterial } from "./env";
import { frosted, slabGlass } from "./materials";
import { MONO, roundRect, SANS, stateGlyph, text, useCanvasTexture } from "./texture";

export type CardRow = { label: string; value: string; state?: "allow" | "ask" | "held"; mono?: boolean };
export type CardContent = { eyebrow?: string; title: string; rows: CardRow[]; footer?: string; badge?: { text: string; state: "allow" | "ask" | "held" } };

export type GlassCard3DProps = {
  content: CardContent;
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  finish?: "glass" | "frosted";
  /** dark = white text on smoked glass; light = ink text on frosted white glass. */
  tone?: "light" | "dark";
  /** 0..1 reveal of rows (staggered). */
  reveal?: number;
  rim?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

const TEX_W = 2048;

export const GlassCard3D: React.FC<GlassCard3DProps> = ({
  content,
  width = 1.6,
  height = 1.0,
  depth = 0.05,
  radius = 0.07,
  finish = "frosted",
  tone = "light",
  reveal = 1,
  rim = 0.6,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const texH = Math.round((TEX_W * height) / width);
  const geo = useMemo(() => extrudeCentered(roundedRectShape(width, height, radius), depth, Math.min(0.012, depth / 3), 6, 16), [width, height, depth, radius]);
  const body = useMemo(
    () =>
      finish === "glass"
        ? slabGlass({ color: tone === "light" ? "#F6F8FF" : "#A3B0D0" })
        : frosted({
            color: tone === "light" ? "#FFFFFF" : "#161B2C",
            roughness: tone === "light" ? 0.5 : 0.4,
            attenuationColor: new THREE.Color(tone === "light" ? "#E4E9F8" : B3.deep),
            attenuationDistance: tone === "light" ? 2 : 0.4,
            thickness: depth * 1.5,
          }),
    [finish, tone, depth],
  );
  const rimMat = useMemo(() => makeFresnelMaterial(B3.accentBright, rim, 3), [rim]);

  // quantise reveal so the texture redraws only when a row appears (not every frame)
  const step = Math.round(clamp01(reveal) * (content.rows.length + 1));
  const key = JSON.stringify(content) + tone + step;
  const ink = tone === "light" ? B3.ink : "#F4F6FC";
  const sub = tone === "light" ? "#5B5F6B" : "#A5AEC4";
  const line = tone === "light" ? "rgba(23,23,23,0.10)" : "rgba(220,228,255,0.16)";

  const tex = useCanvasTexture(
    (ctx, w, h) => {
      const pad = 120;
      // inner panel: lifts legibility above the refraction
      ctx.fillStyle = tone === "light" ? "rgba(255,255,255,0.62)" : "rgba(6,8,16,0.55)";
      roundRect(ctx, 28, 28, w - 56, h - 56, 72);
      ctx.fill();
      let y = pad + 40;
      if (content.eyebrow) {
        text(ctx, content.eyebrow.toUpperCase(), pad, y, { size: 46, weight: 500, color: tone === "light" ? B3.accentText : B3.accent, mono: true, tracking: 6 });
        y += 110;
      }
      text(ctx, content.title, pad, y, { size: 104, weight: 600, color: ink });
      if (content.badge) {
        const bw = 330;
        const bx = w - pad - bw;
        const by = y - 86;
        const held = content.badge.state === "held";
        ctx.fillStyle = held ? B3.denyWash : tone === "light" ? B3.accentSoft : "rgba(120,150,255,0.18)";
        roundRect(ctx, bx, by, bw, 104, 52);
        ctx.fill();
        stateGlyph(ctx, content.badge.state, bx + 58, by + 52, 17, held ? B3.denyDeep : B3.accentDeep);
        text(ctx, content.badge.text, bx + 96, by + 70, { size: 50, weight: 600, color: held ? B3.denyDeep : tone === "light" ? B3.accentText : B3.accent });
      }
      y += 70;
      const rowH = 150;
      content.rows.forEach((r, i) => {
        if (i + 1 > step) return;
        const ry = y + i * rowH;
        ctx.fillStyle = line;
        ctx.fillRect(pad, ry, w - pad * 2, 3);
        text(ctx, r.label, pad, ry + 98, { size: 64, weight: 400, color: sub });
        const vx = w - pad;
        text(ctx, r.value, vx, ry + 98, { size: r.mono ? 60 : 68, weight: r.mono ? 500 : 600, color: ink, mono: r.mono, align: "right" });
        if (r.state) {
          ctx.font = `${r.mono ? 500 : 600} ${r.mono ? 60 : 68}px ${r.mono ? MONO : SANS}`;
          const tw = ctx.measureText(r.value).width;
          stateGlyph(ctx, r.state, vx - tw - 50, ry + 76, 16, r.state === "held" ? B3.denyDeep : r.state === "ask" ? B3.ink : B3.accentDeep);
        }
      });
      if (content.footer && step > content.rows.length) {
        text(ctx, content.footer, pad, h - pad + 10, { size: 46, weight: 500, color: sub, mono: true });
      }
    },
    TEX_W,
    texH,
    key,
  );

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geo} material={body} />
      {rim > 0 ? <mesh geometry={geo} material={rimMat} renderOrder={2} userData={{ noDepth: true }} /> : null}
      <mesh position={[0, 0, depth / 2 + 0.0015]} renderOrder={3}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
};
