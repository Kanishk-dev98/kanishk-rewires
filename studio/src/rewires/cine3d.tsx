// Cinematic 3D: a licensed concept roadster on a ramp, driven entirely by the frame (Remotion rules:
// no useFrame, assets load behind delayRender). Used by the cinematic news format.
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { continueRender, delayRender, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, EASE_IO } from "./brand";

// ------------------------------------------------------------------ asset loading
// Load explicitly behind delayRender, then force one draw of the 3D scene before releasing the render,
// so the captured frame always contains the loaded model and lighting.
type Gltf = { scene: THREE.Group; parser: { json: { extensions?: { KHR_materials_variants?: { variants: { name: string }[] } } }; getDependency: (t: string, i: number) => Promise<THREE.Material> } };
const gltfCache = new Map<string, Promise<Gltf>>();

/** Apply a KHR_materials_variants paint option (three.js does not do this by itself). */
const applyVariant = async (g: Gltf, scene: THREE.Object3D, name: string) => {
  const idx = g.parser.json.extensions?.KHR_materials_variants?.variants.findIndex((v) => v.name === name) ?? -1;
  if (idx < 0) return;
  const jobs: Promise<void>[] = [];
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    const ext = mesh.userData?.gltfExtensions?.KHR_materials_variants as { mappings: { material: number; variants: number[] }[] } | undefined;
    const m = ext?.mappings.find((x) => x.variants.includes(idx));
    if (mesh.isMesh && m) jobs.push(g.parser.getDependency("material", m.material).then((mat) => void (mesh.material = mat)));
  });
  await Promise.all(jobs);
};
const hdrCache = new Map<string, Promise<THREE.DataTexture>>();

const useAsset = <T,>(key: string | undefined, load: () => Promise<T>) => {
  const [val, setVal] = useState<T | null>(null);
  const [handle] = useState(() => (key ? delayRender(`3d asset ${key}`, { timeoutInMilliseconds: 120000 }) : null));
  const { advance } = useThree();
  useEffect(() => {
    if (!key) return;
    load().then(setVal).catch((e) => {
      console.error(e);
      if (handle !== null) continueRender(handle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useLayoutEffect(() => {
    if (val !== null && handle !== null) {
      requestAnimationFrame(() => {
        advance(performance.now());
        requestAnimationFrame(() => continueRender(handle));
      });
    }
  }, [val, handle, advance]);
  return val;
};

const Environment: React.FC<{ url?: string; intensity?: number }> = ({ url, intensity = 1 }) => {
  const { gl, scene } = useThree();
  const tex = useAsset(url, () => {
    if (!hdrCache.has(url!)) hdrCache.set(url!, new HDRLoader().loadAsync(staticFile(url!)));
    return hdrCache.get(url!)!;
  });
  const env = useMemo(() => {
    if (!tex) return null;
    const pm = new THREE.PMREMGenerator(gl);
    const t = pm.fromEquirectangular(tex).texture;
    pm.dispose();
    return t;
  }, [gl, tex]);
  if (env) {
    scene.environment = env;
    scene.environmentIntensity = intensity;
  }
  return null;
};

const LoadedCar: React.FC<{ url: string; fit: CarFit; headlights: number }> = ({ url, fit, headlights }) => {
  const src = useAsset(`${url}#${fit.variant ?? ""}`, async () => {
    if (!gltfCache.has(url)) gltfCache.set(url, new GLTFLoader().loadAsync(staticFile(url)) as unknown as Promise<Gltf>);
    const g = await gltfCache.get(url)!;
    const scene = g.scene.clone(true);
    if (fit.variant) await applyVariant(g, scene, fit.variant);
    return scene;
  });
  const model = useMemo(() => (src ? src.clone(true) : null), [src]);
  return model ? <Car model={model} fit={fit} headlights={headlights} /> : null;
};

/** Camera driven by the frame: position and look-at target. */
const Cam: React.FC<{ pos: [number, number, number]; look: [number, number, number]; fov?: number }> = ({ pos, look, fov = 35 }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...pos);
  cam.fov = fov;
  cam.near = 0.1;
  cam.far = 400;
  cam.lookAt(...look);
  cam.updateProjectionMatrix();
  return null;
};

export type CarFit = { scale?: number; yaw?: number; lift?: number; variant?: string };

/** The car: model normalised to ~4.4 m long, nose pointing +X. Falls back to a sleek placeholder. */
const Car: React.FC<{ model: THREE.Group | null; fit: CarFit; headlights?: number }> = ({ model, fit, headlights = 0 }) => {
  const obj = useMemo(() => {
    if (!model) return null;
    const m = model;
    m.rotation.set(0, fit.yaw ?? Math.PI / 2, 0); // the sample model faces +Z; turn it to drive +X
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const s = (fit.scale ?? 1) * (4.4 / Math.max(size.x, size.z));
    m.scale.setScalar(s);
    const b2 = new THREE.Box3().setFromObject(m);
    const c = b2.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -b2.min.y + (fit.lift ?? 0), -c.z);
    m.traverse((o) => {
      // third-party logos on the sample model (license plate, steering emblem) are hidden: not covered by its licence
      if (/license plate|emblem/i.test(o.name)) o.visible = false;
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return m;
  }, [model, fit.scale, fit.lift, fit.yaw]);
  return (
    <group>
      {obj ? (
        <primitive object={obj} />
      ) : (
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[4.4, 0.9, 1.9]} />
          <meshPhysicalMaterial color="#d9dadc" metalness={0.6} roughness={0.25} clearcoat={1} />
        </mesh>
      )}
      {/* headlights: the model has its own LED strips; no placeholder glow */}
    </group>
  );
};

/** Curved launch ramp, extruded from a quarter-circle profile, with lime edge lines. */
const Ramp: React.FC<{ x: number; width?: number }> = ({ x, width = 3.4 }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const R = 4;
    s.moveTo(0, 0);
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * (Math.PI / 4.2);
      s.lineTo(R * Math.sin(a), R * (1 - Math.cos(a)));
    }
    const end = R * Math.sin(Math.PI / 4.2);
    s.lineTo(end, 0);
    s.lineTo(0, 0);
    return new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false });
  }, [width]);
  return (
    <group position={[x, 0, -width / 2]}>
      <mesh geometry={geo} receiveShadow castShadow>
        <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.55} />
      </mesh>
      {[0.02, width - 0.02].map((z) => (
        <mesh key={z} position={[1.2, 0.02, z]} rotation={[0, 0, 0]}>
          <boxGeometry args={[2.6, 0.03, 0.04]} />
          <meshBasicMaterial color={C.lime} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

const plumeTexture = (() => {
  let tex: THREE.CanvasTexture | null = null;
  return () => {
    if (tex) return tex;
    const cv = document.createElement("canvas");
    cv.width = 64;
    cv.height = 256;
    const g = cv.getContext("2d")!;
    const lin = g.createLinearGradient(0, 0, 0, 256);
    lin.addColorStop(0, "rgba(255,255,255,1)");
    lin.addColorStop(0.18, "rgba(240,255,210,0.9)");
    lin.addColorStop(0.55, "rgba(167,255,63,0.35)");
    lin.addColorStop(1, "rgba(167,255,63,0)");
    g.fillStyle = lin;
    g.fillRect(0, 0, 64, 256);
    // soften the sides
    const img = g.getImageData(0, 0, 64, 256);
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 64; x++) {
        const k = Math.max(0, 1 - Math.pow(Math.abs(x - 31.5) / 32, 1.6));
        img.data[(y * 64 + x) * 4 + 3] *= k;
      }
    g.putImageData(img, 0, 0);
    tex = new THREE.CanvasTexture(cv);
    return tex;
  };
})();

/** Thruster plume: two crossed soft-glow cards pointing down (car space), flicker driven by frame. */
const Plume: React.FC<{ power: number; frame: number; pos: [number, number, number] }> = ({ power, frame, pos }) => {
  const tex = useMemo(() => plumeTexture(), []);
  if (power <= 0.01) return null;
  const flick = 0.88 + 0.12 * Math.sin(frame * 2.3 + pos[0] * 3 + pos[2] * 5);
  const L = 1.5 * power * flick;
  return (
    <group position={pos}>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} position={[0, -L / 2, 0]} rotation={[0, r, 0]}>
          <planeGeometry args={[0.42 * power, L]} />
          <meshBasicMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} opacity={0.9} />
        </mesh>
      ))}
      <pointLight color="#F3FFE0" intensity={8 * power} distance={3.5} position={[0, -0.4, 0]} />
    </group>
  );
};

/** Dust burst on landing: frame-seeded particles that expand and fade. */
const Dust: React.FC<{ at: number; frame: number; x: number }> = ({ at, frame, x }) => {
  const t = frame - at;
  const geo = useMemo(() => {
    const n = 420;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (random(`dx${i}`) - 0.5) * 2;
      p[i * 3 + 1] = random(`dy${i}`) * 0.6;
      p[i * 3 + 2] = (random(`dz${i}`) - 0.5) * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  if (t < 0 || t > 70) return null;
  const k = 1 + t * 0.09;
  return (
    <points geometry={geo} position={[x, 0.05, 0]} scale={[k * 2.2, 0.6 + t * 0.02, k * 2.2]}>
      <pointsMaterial color="#b8b1a2" size={0.07} transparent opacity={interpolate(t, [0, 8, 70], [0, 0.55, 0], clamp)} depthWrite={false} />
    </points>
  );
};

const Ground: React.FC<{ lights?: boolean }> = ({ lights = true }) => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#0c0c0c" roughness={0.7} metalness={0.15} envMapIntensity={0.06} />
    </mesh>
    {/* runway lights */}
    {(lights ? new Array(26) : []).fill(0).map((_, i) => (
      <group key={`l${i}`} position={[-60 + i * 4, 0.04, 0]}>
        {[-3.2, 3.2].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color={i % 4 === 0 ? C.lime : C.cream} toneMapped={false} />
          </mesh>
        ))}
      </group>
    ))}
    {/* runway guide lines */}
    {new Array(14).fill(0).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-40 + i * 6, 0.005, 2.6]}>
        <planeGeometry args={[3, 0.08]} />
        <meshBasicMaterial color="#3a3a3a" />
      </mesh>
    ))}
  </>
);

// ------------------------------------------------------------------ scenes
export type Cine3DProps = { model?: string; hdr?: string; fit?: CarFit; mode: "approach" | "flip" | "hover" };

/** Car path for the flip: drive, ramp, airborne arc with a slow-motion back flip, thrusters, landing. */
const flipPath = (f: number, D: number) => {
  const k = (a: number) => a * D;
  // time remap: slow motion through the top of the arc
  const tAir = interpolate(f, [k(0.3), k(0.42), k(0.62), k(0.74)], [0, 0.25, 0.75, 1], clamp);
  let x: number, y: number, pitch: number;
  if (f < k(0.22)) {
    x = interpolate(f, [0, k(0.22)], [-26, -3.4], clamp);
    y = 0;
    pitch = 0;
  } else if (f < k(0.3)) {
    const t = interpolate(f, [k(0.22), k(0.3)], [0, 1], clamp);
    x = -3.4 + t * 2.9;
    y = 1.1 * t * t;
    pitch = 0.75 * t;
  } else if (f < k(0.74)) {
    x = -0.5 + tAir * 17;
    y = 1.1 + Math.sin(tAir * Math.PI) * 6.2 - tAir * 1.1;
    pitch = 0.75 + Math.min(1, tAir / 0.8) * (Math.PI * 2 - 0.75);
  } else {
    const t = interpolate(f, [k(0.74), D], [0, 1], { ...clamp, easing: EASE_IO });
    x = 16.5 + t * 3;
    y = 0;
    pitch = Math.PI * 2;
  }
  return { x, y, pitch, tAir };
};

export const Cine3D: React.FC<Cine3DProps> = ({ model, hdr, fit = {}, mode }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames: D } = useVideoConfig();
  let carPos: [number, number, number] = [0, 0, 0];
  let carRot: [number, number, number] = [0, 0, 0];
  let cam: [number, number, number];
  let look: [number, number, number];
  let fov = 35;
  let plume = 0;
  let head = 0;
  let land = -1;

  if (mode === "approach") {
    // night: the car rolls toward a low camera, headlights flare
    const t = interpolate(frame, [0, D], [0, 1], { ...clamp, easing: EASE_IO });
    carPos = [interpolate(t, [0, 1], [-24, -6.5]), 0, 0];
    head = interpolate(frame, [4, 14], [0, 1], clamp);
    cam = [3.0, 1.0, 4.6];
    look = [carPos[0] + 0.5, 0.75, 0];
    fov = 30 - t * 3;
  } else if (mode === "hover") {
    const t = frame / D;
    carPos = [0, 2.4 + Math.sin(t * Math.PI * 2) * 0.08, 0];
    carRot = [0, t * 0.6, 0.06 * Math.sin(t * Math.PI * 2)];
    plume = 0.8;
    const a = 0.6 + t * 0.9;
    cam = [Math.cos(a) * 14, 2.6, Math.sin(a) * 14];
    look = [0, 2.4, 0];
    fov = 30;
  } else {
    const p = flipPath(frame, D);
    carPos = [p.x, p.y, 0];
    carRot = [0, 0, p.pitch];
    plume = p.tAir > 0.74 && frame < D * 0.8 ? interpolate(p.tAir, [0.74, 0.82], [0, 1], clamp) * interpolate(frame, [D * 0.74, D * 0.8], [1, 0], clamp) : 0;
    land = Math.round(D * 0.74);
    // orbit around the car through the flip
    const orbit = interpolate(frame, [D * 0.25, D * 0.75], [-0.35, 1.05], { ...clamp, easing: EASE_IO });
    const dist = interpolate(frame, [0, D * 0.25, D * 0.45, D * 0.7, D], [22, 15, 12.5, 17, 19], clamp);
    cam = [p.x - Math.sin(orbit) * dist * 0.45 + 2, 2.2 + p.y * 0.5, Math.cos(orbit) * dist];
    look = [p.x + 1, p.y + 0.9, 0];
    // landing jolt
    const jt = frame - land;
    if (jt >= 0 && jt < 14) {
      const decay = Math.exp(-jt / 4);
      cam = [cam[0] + (random(`jx${frame}`) - 0.5) * 0.4 * decay, cam[1] + (random(`jy${frame}`) - 0.5) * 0.4 * decay, cam[2]];
    }
    fov = 34;
  }

  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} style={{ background: C.charcoal }}>
      <Cam pos={cam} look={look} fov={fov} />
      <color attach="background" args={[C.charcoal]} />
      <fog attach="fog" args={[C.charcoal, 18, 70]} />
      {hdr ? <Environment url={hdr} intensity={mode === "approach" ? 0.35 : 0.9} /> : null}
      <ambientLight intensity={mode === "approach" ? 0.05 : 0.18} />
      <directionalLight position={[8, 14, 6]} intensity={mode === "approach" ? 0.3 : 2.2} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={20} shadow-camera-bottom={-20} />
      <directionalLight position={[-10, 4, -8]} intensity={mode === "approach" ? 0.25 : 1.6} color={C.cream} />
      <spotLight position={[carPos[0] - 6, carPos[1] + 9, 7]} target-position={carPos} angle={0.5} penumbra={0.8} intensity={mode === "approach" ? 0 : 130} distance={40} color="#FFFFFF" />
      {mode !== "hover" ? <Ground lights={mode !== "approach"} /> : null}
      {mode === "flip" ? <Ramp x={-3.4} /> : null}
      <group position={carPos} rotation={carRot}>
        {model ? (
          <LoadedCar url={model} fit={fit} headlights={head} />
        ) : (
          <Car model={null} fit={fit} headlights={head} />
        )}
        {[[-1.45, 0.12, -0.75], [-1.45, 0.12, 0.75], [1.35, 0.12, -0.75], [1.35, 0.12, 0.75]].map((p, i) => (
          <Plume key={i} power={plume} frame={frame} pos={p as [number, number, number]} />
        ))}
      </group>
      {land > 0 ? <Dust at={land} frame={frame} x={16.5} /> : null}
    </ThreeCanvas>
  );
};
