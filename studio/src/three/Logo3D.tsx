/**
 * Logo3D: any logo or shape as real extruded geometry, from SVG path data or polygons.
 *
 * - `svg`: one or more SVG path `d` strings (curves supported, holes supported via SVGLoader). Each closed
 *   sub-shape becomes one "piece". Coordinates in any units; the result is normalised to 1.0 world unit wide,
 *   centred on its bounding box, +Y up.
 * - `polygons`: alternative to `svg`, a list of polygons ([x, y] in SVG-style y-down coords).
 * - Default (neither given): the theme's ACCENT_SHAPE.
 * - Depth 6% of width by default (the "real thickness" target), soft bevel, optional Fresnel rim, edge-absorb shell
 *   and light sweep for glass. `alternate` gives odd pieces the secondary material (two-tone marks).
 * - `assemble` 0..1: pieces fly in from behind, staggered left to right, and lock in. `wave` (pass frame): pieces
 *   breathe in z (a "working" ripple).
 * Use the brand's exact production SVG; never redraw or recolour a real logo.
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { ACCENT_SHAPE } from "../theme";
import { B3, clamp01, easeOutCubic } from "./core3d";
import { makeEdgeAbsorbMaterial, makeFresnelMaterial, makeSweepMaterial } from "./env";
import { Finish, finishMaterials } from "./materials";

export type Logo3DProps = {
  svg?: string | string[];
  polygons?: [number, number][][];
  finish?: Finish;
  /** Secondary finish for odd pieces when `alternate` is on (defaults to the same finish's secondary material). */
  alternate?: boolean;
  depth?: number;
  bevel?: number;
  /** Fresnel rim strength (0 = off). */
  rim?: number;
  rimColor?: string;
  /** Dark accent edge absorption shell (glass on light). Defaults on for finish "crystal". */
  edgeAbsorb?: number;
  /** Light sweep position across the object, -1..1 (drive from frame); glass/crystal only. */
  sweep?: number;
  sheen?: number;
  assemble?: number;
  wave?: number;
  /** Curve subdivision for SVG curves (points per curve segment). */
  curveDetail?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

type Piece = { shape: THREE.Shape; centroid: THREE.Vector2 };

/** Parse SVG path data or polygons into normalised shapes (1 unit wide, centred, y up). */
function buildPieces(svg: string | string[] | undefined, polygons: [number, number][][] | undefined, detail: number): Piece[] {
  let raw: { outer: THREE.Vector2[]; holes: THREE.Vector2[][] }[] = [];
  if (svg) {
    const ds = Array.isArray(svg) ? svg : [svg];
    const doc = `<svg xmlns="http://www.w3.org/2000/svg">${ds.map((d) => `<path d="${d}"/>`).join("")}</svg>`;
    const data = new SVGLoader().parse(doc);
    data.paths.forEach((p) =>
      SVGLoader.createShapes(p).forEach((sh) => raw.push({ outer: sh.getPoints(detail), holes: sh.holes.map((h) => h.getPoints(detail)) })),
    );
  } else {
    const polys = polygons ?? [ACCENT_SHAPE];
    raw = polys.map((pts) => ({ outer: pts.map(([x, y]) => new THREE.Vector2(x, y)), holes: [] }));
  }
  const all = raw.flatMap((r) => r.outer);
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  const w = Math.max(1e-6, maxX - minX);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const tf = (p: THREE.Vector2) => new THREE.Vector2((p.x - cx) / w, -(p.y - cy) / w);
  return raw.map(({ outer, holes }) => {
    const o = outer.map(tf);
    const c = o.reduce((s, p) => s.add(p), new THREE.Vector2()).divideScalar(o.length);
    const shape = new THREE.Shape(o.map((p) => p.clone().sub(c)));
    holes.forEach((h) => shape.holes.push(new THREE.Path(h.map(tf).map((p) => p.sub(c)))));
    return { shape, centroid: c };
  });
}

export const Logo3D: React.FC<Logo3DProps> = ({
  svg,
  polygons,
  finish = "satin",
  alternate = false,
  depth = 0.06,
  bevel: bevelProp,
  rim = 0.8,
  rimColor: rimColorProp,
  edgeAbsorb: edgeAbsorbProp,
  sweep,
  sheen: sheenProp,
  assemble = 1,
  wave,
  curveDetail = 12,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const isCrystal = finish === "crystal";
  const bevel = bevelProp ?? (isCrystal ? 0.013 : 0.008);
  const rimColor = rimColorProp ?? (isCrystal ? "#FFFFFF" : B3.accentBright);
  const edgeAbsorb = edgeAbsorbProp ?? (isCrystal ? 0.85 : 0);
  const segs = isCrystal ? 8 : 5;
  const svgKey = Array.isArray(svg) ? svg.join("|") : svg ?? "";
  const polyKey = JSON.stringify(polygons ?? null);

  const pieces = useMemo(() => {
    const ps = buildPieces(svg, polygons, curveDetail);
    return ps.map((p) => {
      const g = new THREE.ExtrudeGeometry(p.shape, {
        depth: Math.max(1e-4, depth - 2 * bevel),
        bevelEnabled: bevel > 0,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelOffset: -bevel, // keep the outer outline at the true logo size
        bevelSegments: segs,
        curveSegments: curveDetail,
      });
      g.translate(0, 0, -(depth - 2 * bevel) / 2);
      g.computeVertexNormals();
      return { g, c: p.centroid };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgKey, polyKey, depth, bevel, segs, curveDetail]);

  const mats = useMemo(() => finishMaterials(finish), [finish]);
  const rimMat = useMemo(() => makeFresnelMaterial(rimColor, rim, isCrystal ? 3.2 : 2.4), [rimColor, rim, isCrystal]);
  const isGlassy = isCrystal || finish === "glass";
  const sweepMat = useMemo(() => (isGlassy ? makeSweepMaterial() : null), [isGlassy]);
  if (sweepMat) {
    sweepMat.uniforms.sweep.value = sweep ?? -3;
    sweepMat.uniforms.sheen.value = sheenProp ?? (isCrystal ? 0.12 : 0.06);
  }
  const edgeMat = useMemo(() => (edgeAbsorb > 0 ? makeEdgeAbsorbMaterial(B3.deep, edgeAbsorb, 1.25) : null), [edgeAbsorb]);

  // assembly order: left to right
  const order = useMemo(() => {
    const idx = pieces.map((p, i) => ({ i, x: p.c.x }));
    idx.sort((a, b) => a.x - b.x);
    const rank: number[] = [];
    idx.forEach((o, k) => (rank[o.i] = k / Math.max(1, idx.length - 1)));
    return rank;
  }, [pieces]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {pieces.map((p, i) => {
        const span = pieces.length > 1 ? 0.6 : 0;
        const local = clamp01((assemble - order[i] * span) / (1 - span || 1));
        if (local <= 0) return null;
        const e = easeOutCubic(local);
        const w = wave === undefined ? 0 : Math.sin(wave / 9 - order[i] * 6) * 0.006;
        const mat = alternate && i % 2 ? mats.b : mats.a;
        return (
          <group key={i} position={[p.c.x + (1 - e) * 0.05, p.c.y - (1 - e) * 0.08, (1 - e) * 0.35 + w]} rotation={[(1 - e) * 1.2, (1 - e) * -0.8, 0]} scale={0.4 + 0.6 * e}>
            <mesh geometry={p.g} material={mat} />
            {edgeMat ? <mesh geometry={p.g} material={edgeMat} renderOrder={1} userData={{ noDepth: true }} /> : null}
            {sweepMat ? <mesh geometry={p.g} material={sweepMat} renderOrder={2} userData={{ noDepth: true }} /> : null}
            {rim > 0 ? <mesh geometry={p.g} material={rimMat} renderOrder={2} userData={{ noDepth: true }} /> : null}
          </group>
        );
      })}
    </group>
  );
};
