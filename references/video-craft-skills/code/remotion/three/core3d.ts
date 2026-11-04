/**
 * 3D kit core: theme tokens for 3D, geometry helpers and deterministic easing.
 * Colours come from ../theme (edit T there). Geometry helpers build extrusions with soft bevels.
 */
import * as THREE from "three";
import { T } from "../theme";

/** 3D colour tokens: the same object as the 2D theme. */
export const B3 = T;

export function polyArea(pts: THREE.Vector2[]) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

/** Inset a convex polygon by d (edge-offset + line intersection). Keeps bevels from colliding. */
export function insetPolygon(pts: THREE.Vector2[], d: number): THREE.Vector2[] {
  const ccw = polyArea(pts) > 0;
  const n = pts.length;
  const lines = pts.map((p, i) => {
    const q = pts[(i + 1) % n];
    const dir = q.clone().sub(p).normalize();
    const nrm = ccw ? new THREE.Vector2(-dir.y, dir.x) : new THREE.Vector2(dir.y, -dir.x);
    return { p: p.clone().addScaledVector(nrm, d), dir };
  });
  return lines.map((l1, i) => {
    const l0 = lines[(i - 1 + n) % n];
    const cross = l0.dir.x * l1.dir.y - l0.dir.y * l1.dir.x;
    if (Math.abs(cross) < 1e-9) return l1.p.clone();
    const diff = l1.p.clone().sub(l0.p);
    const t = (diff.x * l1.dir.y - diff.y * l1.dir.x) / cross;
    return l0.p.clone().addScaledVector(l0.dir, t);
  });
}

export function shapeFrom(pts: THREE.Vector2[]) {
  const s = new THREE.Shape();
  pts.forEach((p, i) => (i === 0 ? s.moveTo(p.x, p.y) : s.lineTo(p.x, p.y)));
  s.closePath();
  return s;
}

/** Rounded rectangle shape (w x h, radius r), centred. */
export function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Extrude a shape with a soft bevel, centred on z (front face at +depth/2). */
export function extrudeCentered(shape: THREE.Shape, depth: number, bevel: number, bevelSegments = 4, curveSegments = 12) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(1e-4, depth - 2 * bevel),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments,
    curveSegments,
  });
  g.translate(0, 0, -(depth - 2 * bevel) / 2);
  g.computeVertexNormals();
  return g;
}

/* ---------- Deterministic easing helpers (no Math.random, no clock) ---------- */
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInExpo = (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
/** Progress 0..1 for frame within [start, start+dur]. */
export const prog = (frame: number, start: number, dur: number) => clamp01((frame - start) / Math.max(1, dur));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Settle curve: a damped response that overshoots by `overshoot` (default 3%) once and settles.
 * t is normalised 0..1 over the move; returns 0 at t=0 and ~1 at t=1.
 * Analytic, so frame-exact and identical in preview and render.
 */
export function settle(t: number, overshoot = 0.03) {
  t = clamp01(t);
  if (overshoot <= 0) return easeOutCubic(t);
  const ln = Math.log(overshoot);
  const zeta = -ln / Math.sqrt(Math.PI * Math.PI + ln * ln); // 3% -> 0.745
  const wn = 7.5; // settles inside t = 1
  const wd = wn * Math.sqrt(1 - zeta * zeta);
  const e = Math.exp(-zeta * wn * t);
  const y = 1 - e * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
  // blend to exactly 1 at the end so holds never drift
  return t > 0.92 ? lerp(y, 1, (t - 0.92) / 0.08) : y;
}
