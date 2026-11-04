/**
 * Lighting, environment and backdrop for the 3D kit.
 *
 * Everything is procedural (no HDR files, no network): the environment map is a small
 * "light stage" scene (softbox panels) baked through PMREM once per canvas. That keeps
 * headless renders deterministic and fast.
 */
import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { T } from "../theme";
import { B3 } from "./core3d";

export type StageMode = "light" | "dark";

/* ---------- Procedural environment (reflections) ---------- */

type Panel = { pos: [number, number, number]; size: [number, number]; color: string; intensity: number };

const PANELS: Record<StageMode, { room: string; panels: Panel[] }> = {
  // Light stage: product-photography contrast. Mid-grey room so reflections have darks,
  // big overhead-left key, two tall white strips (the long specular streaks on bevels),
  // an accent rim strip behind-right, a soft floor bounce.
  light: {
    room: "#585B62",
    panels: [
      { pos: [-2.5, 5, 2.5], size: [5, 3], color: "#FFFFFF", intensity: 7 },
      { pos: [-6, 0.5, 1], size: [0.9, 7], color: "#FFFFFF", intensity: 6 },
      { pos: [6, 0.5, 2], size: [0.9, 7], color: "#F7F9FF", intensity: 4.5 },
      { pos: [4, 1.5, -6], size: [6, 1], color: T.accentBright, intensity: 5 },
      { pos: [0, -5, 1], size: [12, 6], color: "#E1E4EC", intensity: 1.4 },
    ],
  },
  // Dark stage: black room, accent strips as the big sources, one faint white top, white kicker.
  dark: {
    room: "#020303",
    panels: [
      { pos: [0, 6, 1], size: [5, 2.5], color: "#EEF2FF", intensity: 2.4 },
      { pos: [-6, 0.5, -1], size: [0.9, 7], color: T.accentDeep, intensity: 4.5 },
      { pos: [6, 1, -2], size: [0.9, 7], color: T.accentBright, intensity: 6 },
      { pos: [3, 3, -6], size: [6, 0.8], color: "#FFFFFF", intensity: 3 },
      { pos: [-3, -1, 6], size: [3, 0.6], color: "#FFFFFF", intensity: 1.2 },
    ],
  },
};

function buildEnvScene(mode: StageMode) {
  const cfg = PANELS[mode];
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(16, 12, 16),
    new THREE.MeshBasicMaterial({ color: cfg.room, side: THREE.BackSide }),
  );
  scene.add(room);
  for (const p of cfg.panels) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(p.size[0], p.size[1]),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color).multiplyScalar(p.intensity), side: THREE.DoubleSide }),
    );
    m.position.set(...p.pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  }
  return scene;
}

/** Bakes the procedural studio into scene.environment. Mount once per canvas. */
export const StudioEnv: React.FC<{ mode?: StageMode; intensity?: number; rotationY?: number }> = ({
  mode = "light",
  intensity = 1,
  rotationY = 0,
}) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const tex = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = buildEnvScene(mode);
    const rt = pmrem.fromScene(env, 0.035);
    pmrem.dispose();
    return rt;
  }, [gl, mode]);
  useLayoutEffect(() => {
    scene.environment = tex.texture;
    scene.environmentIntensity = intensity;
    scene.environmentRotation.set(0, rotationY, 0);
  }, [scene, tex, intensity, rotationY]);
  useLayoutEffect(() => () => tex.dispose(), [tex]);
  return null;
};

/* ---------- Light rigs ---------- */

/**
 * LightRig: direct lights that sit on top of the environment.
 * light: soft key (top-left, 2.2), cool fill (hemisphere 0.55), accent rim from behind-right (spot 40).
 * dark: accent glow point under/behind the subject, white-accent rim from behind, faint top key.
 */
/** Soft PCF shadow config for the key light (deterministic; same result preview and render). */
const ShadowKey: React.FC<{ position: [number, number, number]; intensity: number; color: string; shadows: boolean; shadowStrength: number }> = ({ position, intensity, color, shadows, shadowStrength }) => (
  <directionalLight
    position={position}
    intensity={intensity}
    color={color}
    castShadow={shadows}
    shadow-mapSize-width={2048}
    shadow-mapSize-height={2048}
    shadow-camera-left={-3}
    shadow-camera-right={3}
    shadow-camera-top={3}
    shadow-camera-bottom={-3}
    shadow-camera-near={0.5}
    shadow-camera-far={14}
    shadow-bias={-0.0004}
    shadow-normalBias={0.02}
    shadow-radius={10}
    shadow-blurSamples={20}
    shadow-intensity={shadowStrength}
  />
);

export const LightRig: React.FC<{ mode?: StageMode; rim?: number; key?: number; glow?: number; shadows?: boolean; shadowStrength?: number; keyPosition?: [number, number, number] }> = ({
  mode = "light",
  rim = 1,
  key = 1,
  glow = 0,
  shadows = false,
  shadowStrength = 0.55,
  keyPosition,
}) => {
  if (mode === "light") {
    return (
      <>
        <hemisphereLight args={["#FFFFFF", "#D3D9E6", 0.55]} />
        <ShadowKey position={keyPosition ?? [-2.2, 5, 2.6]} intensity={2.2 * key} color="#FFFFFF" shadows={shadows} shadowStrength={shadowStrength} />
        <spotLight position={[3.5, 2.5, -3.5]} angle={0.7} penumbra={1} intensity={40 * rim} distance={14} decay={2} color={B3.accentBright} />
        <spotLight position={[-3.5, 1.5, -3]} angle={0.7} penumbra={1} intensity={14 * rim} distance={14} decay={2} color="#FFFFFF" />
      </>
    );
  }
  return (
    <>
      <hemisphereLight args={["#1B2238", "#000000", 0.35]} />
      <ShadowKey position={keyPosition ?? [-2, 5, 3]} intensity={0.9 * key} color="#EEF2FF" shadows={shadows} shadowStrength={shadowStrength} />
      <spotLight position={[3, 2.5, -3]} angle={0.8} penumbra={1} intensity={40 * rim} distance={14} decay={2} color={B3.accentBright} />
      <spotLight position={[-3.5, 1, -2.5]} angle={0.8} penumbra={1} intensity={30 * rim} distance={14} decay={2} color="#E6ECFF" />
      {glow > 0 ? <pointLight position={[0, -0.3, -1.2]} intensity={3 * glow} distance={4} decay={2} color={B3.accentDeep} /> : null}
    </>
  );
};

/* ---------- Screen-space backdrop (so glass has something to refract) ---------- */

const backdropVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.99999, 1.0); }`;

const backdropFrag = /* glsl */ `
varying vec2 vUv;
uniform vec3 base; uniform vec3 bloomA; uniform vec3 bloomB; uniform vec3 spot;
uniform float aspect; uniform vec2 bloomAPos; uniform vec2 bloomBPos; uniform vec2 spotPos; uniform float vignette;
uniform vec3 gridColor; uniform float gridAlpha; uniform float gridScale; uniform float gridKind;
float blob(vec2 uv, vec2 c, float r){ vec2 d = uv - c; d.x *= aspect; return exp(-dot(d,d)/(r*r)); }
void main(){
  vec3 col = base;
  col = mix(col, spot, 0.9 * blob(vUv, spotPos, 0.55));
  col = mix(col, bloomA, 0.85 * blob(vUv, bloomAPos, 0.6));
  col = mix(col, bloomB, 0.6 * blob(vUv, bloomBPos, 0.55));
  // hairline grid (~6%): gridKind 0 = square (two line families), 1 = triangle (three families at 0/60/120 deg).
  // Glass needs something to refract: this grid is what bends through a glass object.
  vec2 g = vec2(vUv.x * aspect, vUv.y) * gridScale;
  float l0 = abs(fract(g.y) - 0.5);
  float l1 = gridKind > 0.5 ? abs(fract(dot(g, vec2(0.8660254, 0.5))) - 0.5) : abs(fract(g.x) - 0.5);
  float l2 = gridKind > 0.5 ? abs(fract(dot(g, vec2(-0.8660254, 0.5))) - 0.5) : 0.0;
  float px = gridScale / 1080.0;
  float d = 0.5 - max(l0, max(l1, l2));
  float line = 1.0 - smoothstep(0.0, px * 1.1, d);
  col = mix(col, gridColor, gridAlpha * line);
  vec2 v = vUv - 0.5; v.x *= aspect;
  col *= 1.0 - vignette * smoothstep(0.35, 1.05, length(v));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const BACKDROPS: Record<StageMode, { base: string; bloomA: string; bloomB: string; spot: string; vignette: number; grid: string; gridAlpha: number }> = {
  // Never flat white: wash + accent corner blooms (top-right, bottom-left) + a lighter spotlight.
  light: { base: "#E6E9F2", bloomA: T.accentSoft, bloomB: T.accentSoft2, spot: "#F9FAFD", vignette: 0.22, grid: "#8E9BC4", gridAlpha: 0.22 },
  // near-black with a tinted centre and an accent corner glow on the same diagonal as the light stage.
  dark: { base: "#07080B", bloomA: "#141E44", bloomB: "#0D1530", spot: "#0E1220", vignette: 0.55, grid: T.accentDeep, gridAlpha: 0.07 },
};

export const Backdrop: React.FC<{ mode?: StageMode; aspect?: number; spot?: [number, number]; grid?: number; gridScale?: number; gridKind?: "square" | "triangle" }> = ({
  mode = "light",
  aspect = 16 / 9,
  spot = [0.5, 0.52],
  grid = 1,
  gridScale = 9,
  gridKind = "square",
}) => {
  const mat = useMemo(() => {
    const b = BACKDROPS[mode];
    return new THREE.ShaderMaterial({
      vertexShader: backdropVert,
      fragmentShader: backdropFrag,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        base: { value: new THREE.Color(b.base) },
        bloomA: { value: new THREE.Color(b.bloomA) },
        bloomB: { value: new THREE.Color(b.bloomB) },
        spot: { value: new THREE.Color(b.spot) },
        aspect: { value: aspect },
        bloomAPos: { value: new THREE.Vector2(0.92, 0.95) },
        bloomBPos: { value: new THREE.Vector2(0.05, 0.05) },
        spotPos: { value: new THREE.Vector2(spot[0], spot[1]) },
        vignette: { value: b.vignette },
        gridColor: { value: new THREE.Color(b.grid) },
        gridAlpha: { value: b.gridAlpha * grid },
        gridScale: { value: gridScale },
        gridKind: { value: gridKind === "triangle" ? 1 : 0 },
      },
    });
  }, [mode, aspect, spot, grid, gridScale, gridKind]);
  return (
    <mesh renderOrder={-1000} frustumCulled={false} material={mat} userData={{ noDepth: true }}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};

/* ---------- Fake soft contact shadow (cheap, deterministic) ---------- */

let shadowTex: THREE.CanvasTexture | null = null;
function getShadowTex() {
  if (shadowTex) return shadowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(0,0,0,1)");
  grd.addColorStop(0.45, "rgba(0,0,0,0.45)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
}

export const ContactShadow: React.FC<{ y?: number; scale?: [number, number]; opacity?: number; color?: string }> = ({
  y = -0.6,
  scale = [1.4, 0.9],
  opacity = 0.32,
  color = "#0E1530",
}) => (
  <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1} userData={{ noDepth: true }}>
    <planeGeometry args={[scale[0], scale[1]]} />
    <meshBasicMaterial map={getShadowTex()} color={color} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
  </mesh>
);

/* ---------- Fresnel rim shell ---------- */

/** Additive Fresnel rim: put it on a second mesh that shares the object's geometry. */
export function makeFresnelMaterial(color: string = B3.accentBright, intensity = 1.2, power = 2.6) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { color: { value: new THREE.Color(color) }, intensity: { value: intensity }, power: { value: power } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color; uniform float intensity; uniform float power; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), power) * intensity; gl_FragColor = vec4(color * f, f); }`,
  });
}

/* ---------- Soft glow sprite (works without bloom, e.g. on transparent canvases) ---------- */

const glowTexCache = new Map<string, THREE.CanvasTexture>();
export function glowTexture(color: string) {
  const hit = glowTexCache.get(color);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  const col = new THREE.Color(color);
  const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
  grd.addColorStop(0, `rgba(${rgb},1)`);
  grd.addColorStop(0.25, `rgba(${rgb},0.55)`);
  grd.addColorStop(0.6, `rgba(${rgb},0.12)`);
  grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  glowTexCache.set(color, t);
  return t;
}

export const GlowSprite: React.FC<{ position?: [number, number, number]; size?: number; color?: string; opacity?: number }> = ({
  position = [0, 0, 0],
  size = 1,
  color = B3.accentBright,
  opacity = 1,
}) => (
  <sprite position={position} scale={[size, size, 1]} userData={{ noDepth: true }}>
    <spriteMaterial map={glowTexture(color)} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
  </sprite>
);

/* ---------- Real shadows ---------- */

/** Shadow-catcher floor: only the shadow is visible (ShadowMaterial), so it sits on any backdrop. */
export const ShadowFloor: React.FC<{ y?: number; size?: number; opacity?: number; color?: string }> = ({ y = -0.62, size = 8, opacity = 0.22, color = "#0E1530" }) => (
  <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow userData={{ noDepth: true }}>
    <planeGeometry args={[size, size]} />
    <shadowMaterial color={color} opacity={opacity} transparent depthWrite={false} />
  </mesh>
);

/** Marks every mesh in the scene as a shadow caster (except helpers flagged noDepth / noShadow). */
export const CastShadows: React.FC = () => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = !(o.userData.noDepth || o.userData.noShadow);
    });
  });
  return null;
};

/* ---------- Glass caustic (light stage) ---------- */

/**
 * A soft accent caustic pool on the floor, offset from the contact shadow away from the key:
 * the light that went through the glass and got focused. Additive, frame-steady.
 */
export const GlassCaustic: React.FC<{ y?: number; offset?: [number, number]; scale?: [number, number]; strength?: number; color?: string }> = ({
  y = -0.615,
  // default = where the light-stage key (-2.2, 5, 2.6) throws an object 0.6 above the floor
  offset = [0.26, -0.31],
  scale = [0.9, 0.45],
  strength = 0.55,
  color = B3.accentBright,
}) => (
  <mesh position={[offset[0], y, offset[1]]} rotation={[-Math.PI / 2, 0, 0.25]} renderOrder={-1} userData={{ noDepth: true }}>
    <planeGeometry args={[scale[0], scale[1]]} />
    <meshBasicMaterial map={glowTexture(color)} transparent opacity={strength} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
  </mesh>
);

/**
 * Edge-absorption shell for glass on a light stage: a NORMAL-blended Fresnel that darkens
 * grazing edges with the deep accent. Thick paths through glass absorb more, so real glass on white
 * shows dark tinted edges plus a bright rim; this is what separates glass from acrylic.
 */
export function makeEdgeAbsorbMaterial(color: string = B3.deep, strength = 0.55, power = 1.8) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { color: { value: new THREE.Color(color) }, strength: { value: strength }, power: { value: power } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color; uniform float strength; uniform float power; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), power) * strength; gl_FragColor = vec4(color, clamp(f, 0.0, 0.85)); }`,
  });
}

/**
 * Glass sheen + light sweep overlay (additive, object space):
 * - a soft top-left -> bottom-right brightness gradient (what a big softbox does on curved glass),
 * - a narrow bright band at `sweep` (-1..1 across the object) = a moving glint, frame-driven.
 * It gives flat-faced glass the tonal range of a faceted gem without changing geometry.
 */
export function makeSweepMaterial(color = "#FFFFFF") {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { color: { value: new THREE.Color(color) }, sweep: { value: -2 }, width: { value: 0.07 }, band: { value: 0.55 }, sheen: { value: 0.12 } },
    vertexShader: /* glsl */ `
      varying vec3 vP; varying vec3 vN; varying vec3 vV;
      void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color; uniform float sweep; uniform float width; uniform float band; uniform float sheen;
      varying vec3 vP; varying vec3 vN; varying vec3 vV;
      void main(){
        float facing = abs(dot(normalize(vN), normalize(vV)));
        float diag = dot(vP.xy, normalize(vec2(1.0, -0.7)));
        float b = exp(-pow((diag - sweep) / width, 2.0)) * band * (0.35 + 0.65 * facing);
        float g = smoothstep(0.55, -0.6, diag) * sheen * facing;
        float a = b + g;
        gl_FragColor = vec4(color * a, a);
      }`,
  });
}
