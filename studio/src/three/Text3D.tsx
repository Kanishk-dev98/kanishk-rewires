/**
 * Text3D: extruded display type with real depth and bevel (the "3D extruded words" device:
 * letters arrive staggered ~1 f and settle into one line).
 *
 * Fonts: a three.js typeface JSON (convert a static TTF/OTF offline, e.g. with facetype.js, keep the licence
 * file next to it) placed in public/fonts/. Default URLs: fonts/Display-Bold.typeface.json and
 * fonts/Display-SemiBold.typeface.json, or pass `fontUrl`. Loaded with staticFile + delayRender,
 * cached per URL. One geometry per glyph so letters animate independently.
 *
 * Reveal: each letter rises from below with a forward tilt and settles with a 3% overshoot.
 * Use it at most once per film (the study's rule: extruded type is a hero device).
 */
import { useThree } from "@react-three/fiber";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { staticFile, useDelayRender } from "remotion";
import * as THREE from "three";
import { Font, FontData } from "three/examples/jsm/loaders/FontLoader.js";
import { B3, clamp01, settle } from "./core3d";
import { makeFresnelMaterial } from "./env";
import { accentMetal, crystal, frosted, glass, satin } from "./materials";

export type TextFinish = "metal" | "satin" | "glass" | "crystal" | "frosted" | "ink";

const fontCache = new Map<string, Promise<Font>>();
function loadFont(url: string) {
  let p = fontCache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.json())
      .then((j: FontData) => new Font(j));
    fontCache.set(url, p);
  }
  return p;
}

/**
 * Loads a typeface and holds the render until the glyphs are on the canvas: the hold is released
 * only after the component re-renders with the font AND the canvas is advanced (ThreeCanvas
 * otherwise redraws only on frame change, so a late state update would never reach the screenshot).
 */
export function useTypeface(weight: "semibold" | "bold" = "bold", fontUrl?: string) {
  const url = fontUrl ?? staticFile(weight === "bold" ? "fonts/Display-Bold.typeface.json" : "fonts/Display-SemiBold.typeface.json");
  const { delayRender, continueRender } = useDelayRender();
  const advance = useThree((st) => st.advance);
  const [font, setFont] = useState<Font | null>(null);
  const hold = useRef<number | null>(null);
  useEffect(() => {
    hold.current = delayRender(`typeface ${url}`);
    let live = true;
    loadFont(url).then((f) => live && setFont(f));
    return () => {
      live = false;
      if (hold.current !== null) continueRender(hold.current);
      hold.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  useLayoutEffect(() => {
    if (!font || hold.current === null) return;
    const h = hold.current;
    hold.current = null;
    // let the glyph meshes commit, draw once, then release
    requestAnimationFrame(() => {
      advance(performance.now());
      continueRender(h);
    });
  }, [font, advance, continueRender]);
  return font;
}

function textMaterial(finish: TextFinish, color: string) {
  switch (finish) {
    case "metal":
      return accentMetal(color);
    case "glass":
      return glass();
    case "crystal":
      return crystal({ attenuationDistance: 0.6, thickness: 0.3 });
    case "frosted":
      return frosted();
    case "ink":
      return satin(B3.ink, { sheen: 0, roughness: 0.32 });
    case "satin":
    default:
      return satin(color);
  }
}

export type Text3DProps = {
  text: string;
  weight?: "semibold" | "bold";
  /** URL of a typeface JSON (overrides `weight`). */
  fontUrl?: string;
  /** cap-height-ish size in world units */
  size?: number;
  /** extrusion depth as a fraction of size (measured on reference heroes: ~10 to 15%) */
  depth?: number;
  /** bevel as a fraction of size */
  bevel?: number;
  finish?: TextFinish;
  color?: string;
  /** per-word colours (e.g. [ink, ink, accent]): index by word */
  wordColors?: string[];
  /** per-word finishes, same indexing (e.g. ["satin", "satin", "metal"]) */
  wordFinishes?: TextFinish[];
  rim?: number;
  /** 0..1 reveal over all letters */
  reveal?: number;
  /** fraction of the reveal each letter takes (rest is stagger) */
  letterSpan?: number;
  align?: "left" | "center";
  letterSpacing?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

export const Text3D: React.FC<Text3DProps> = ({
  text,
  weight = "bold",
  fontUrl,
  size = 0.3,
  depth = 0.14,
  bevel = 0.018,
  finish = "metal",
  color = B3.accentDeep,
  wordColors,
  wordFinishes,
  rim = 0.6,
  reveal = 1,
  letterSpan = 0.35,
  align = "center",
  letterSpacing = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const font = useTypeface(weight, fontUrl);

  const glyphs = useMemo(() => {
    if (!font) return null;
    const data = font.data as FontData & { resolution: number; glyphs: Record<string, { ha: number }> };
    const scale = size / data.resolution;
    let x = 0;
    let word = 0;
    const out: { geo: THREE.ExtrudeGeometry | null; x: number; cx: number; cy: number; word: number; ch: string }[] = [];
    for (const ch of text) {
      if (ch === " ") {
        word++;
        x += (data.glyphs[" "]?.ha ?? 250) * scale + letterSpacing * size;
        continue;
      }
      const shapes = font.generateShapes(ch, size);
      let geo: THREE.ExtrudeGeometry | null = null;
      let cx = 0;
      let cy = 0;
      if (shapes.length) {
        geo = new THREE.ExtrudeGeometry(shapes, {
          depth: Math.max(1e-4, size * depth - 2 * size * bevel),
          bevelEnabled: bevel > 0,
          bevelThickness: size * bevel,
          bevelSize: size * bevel * 0.7,
          bevelSegments: 4,
          curveSegments: 10,
        });
        geo.computeBoundingBox();
        const bb = geo.boundingBox!;
        cx = (bb.min.x + bb.max.x) / 2;
        cy = (bb.min.y + bb.max.y) / 2;
        // centre each glyph on its own pivot so it can tilt in place
        geo.translate(-cx, -cy, -(size * depth) / 2);
        geo.computeVertexNormals();
      }
      out.push({ geo, x, cx, cy, word, ch });
      x += (data.glyphs[ch]?.ha ?? 500) * scale + letterSpacing * size;
    }
    return { out, width: x };
  }, [font, text, size, depth, bevel, letterSpacing]);

  const mats = useMemo(() => {
    const cols = wordColors ?? [color];
    const n = Math.max(cols.length, wordFinishes?.length ?? 1);
    return Array.from({ length: n }, (_, i) => textMaterial(wordFinishes?.[i] ?? finish, cols[Math.min(i, cols.length - 1)]));
  }, [finish, color, wordColors, wordFinishes]);
  const rimMat = useMemo(() => makeFresnelMaterial(B3.accentBright, rim, 2.6), [rim]);

  if (!glyphs) return null;
  const n = glyphs.out.length;
  const ox = align === "center" ? -glyphs.width / 2 : 0;
  return (
    <group position={position} rotation={rotation}>
      {glyphs.out.map((g, i) => {
        if (!g.geo) return null;
        const start = (n <= 1 ? 0 : i / (n - 1)) * (1 - letterSpan);
        const t = clamp01((reveal - start) / letterSpan);
        if (t <= 0) return null;
        const e = settle(t, 0.03);
        const m = mats[Math.min(g.word, mats.length - 1)];
        return (
          <group key={i} position={[ox + g.x + g.cx, g.cy - (1 - e) * size * 0.9, (1 - e) * size * 1.2]} rotation={[(1 - e) * -1.1, 0, (1 - e) * 0.08]} scale={0.6 + 0.4 * Math.min(1, e)}>
            <mesh geometry={g.geo} material={m} />
            {rim > 0 ? <mesh geometry={g.geo} material={rimMat} renderOrder={2} userData={{ noDepth: true }} /> : null}
          </group>
        );
      })}
    </group>
  );
};
