/**
 * Canvas-drawn textures for text and UI on 3D surfaces.
 *
 * Why not HTML-in-3D: CSS3D/Html overlays don't take part in depth, refraction or DOF.
 * A CanvasTexture does, renders headless, and stays crisp if you size it right:
 *   on-screen px = texture px * (surface on-screen width / texture width).
 *   Rule: author text at >= 64 texture px on a 2048 px-wide texture and frame the surface
 *   so it spans >= 45% of the frame width -> >= 28 px on screen.
 */
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { useDelayRender } from "remotion";
import * as THREE from "three";
import { FIG as SANS, MONO } from "../fonts";

export { MONO, SANS };

export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** Returns a CanvasTexture drawn after the theme fonts are ready; holds the render until then. */
export function useCanvasTexture(draw: Draw, width: number, height: number, key: string) {
  const advance = useThree((s) => s.advance);
  const { delayRender, continueRender } = useDelayRender();
  const { tex, canvas } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    return { tex: t, canvas: c };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, key]);

  useEffect(() => {
    const h = delayRender(`3D text texture ${key}`);
    let done = false;
    Promise.all([
      document.fonts.load(`600 64px ${SANS}`),
      document.fonts.load(`400 64px ${SANS}`),
      document.fonts.load(`500 48px ${MONO}`),
    ])
      .catch(() => undefined)
      .then(() => {
        if (done) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, width, height);
        draw(ctx, width, height);
        tex.needsUpdate = true;
        advance(performance.now());
        continueRender(h);
      });
    return () => {
      done = true;
      continueRender(h);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tex]);
  return tex;
}

/* ---------- 2D drawing helpers ---------- */

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  o: { size: number; weight?: number; color: string; mono?: boolean; align?: CanvasTextAlign; tracking?: number },
) {
  ctx.font = `${o.weight ?? 500} ${o.size}px ${o.mono ? MONO : SANS}`;
  ctx.fillStyle = o.color;
  ctx.textAlign = o.align ?? "left";
  ctx.textBaseline = "alphabetic";
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${o.tracking ?? 0}px`;
  ctx.fillText(s, x, y);
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
}

/** State glyphs: ALLOW circle, ASK diamond, HELD square (decision state language). */
export function stateGlyph(ctx: CanvasRenderingContext2D, kind: "allow" | "ask" | "held", cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (kind === "allow") ctx.arc(cx, cy, r, 0, Math.PI * 2);
  else if (kind === "ask") {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
  } else ctx.rect(cx - r * 0.85, cy - r * 0.85, r * 1.7, r * 1.7);
  ctx.closePath();
  ctx.fill();
}
