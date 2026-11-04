/**
 * PostFX: depth of field (rack focus), bloom, film grain. Built only from three's own
 * examples/jsm passes (no extra dependency), verified to render headless.
 *
 * The composer takes over rendering via useFrame(priority 1). That useFrame only *renders*;
 * all animation still comes from useCurrentFrame() props, so output is deterministic.
 *
 * Use it only on OPAQUE stages (backdrop on). On a transparent overlay canvas, skip PostFX
 * and use GlowSprite / Fresnel rims for glow (bloom would flatten alpha).
 */
import { useFrame, useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import type { CamPose } from "./camera";

export type DofSettings = { focus: number; aperture?: number; maxblur?: number };
export type BloomSettings = { strength?: number; radius?: number; threshold?: number };
/**
 * Camera motion blur by depth reprojection: each pixel is smeared from where it was under
 * `prevPose` (the pose half a frame earlier = 180-degree shutter) to where it is now. The pose is a
 * pure function of the frame, so this is frame-accurate and costs one extra full-screen pass.
 * It blurs camera motion (whips, push-throughs); object motion needs temporal samples (see MotionBlur3D).
 */
export type MotionBlurSettings = { prevPose: CamPose; samples?: number; strength?: number; maxLength?: number };
/** Soft highlight shoulder before bloom: values above `knee` roll off toward `ceiling` (no single-frame flashes). */
export type RolloffSettings = { knee?: number; ceiling?: number };
export type PostSettings = {
  dof?: DofSettings | null;
  bloom?: BloomSettings | null;
  grain?: number;
  frame?: number;
  samples?: number;
  motionBlur?: MotionBlurSettings | null;
  rolloff?: RolloffSettings | null;
};

const RolloffShader = {
  uniforms: { tDiffuse: { value: null }, knee: { value: 0.9 }, ceiling: { value: 2.0 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float knee; uniform float ceiling; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      // sanitise first: half-float speculars can overflow to Inf; Inf/Inf here would become NaN,
      // and bloom's blur would spread one NaN pixel into a black hole across the frame
      if (!(c.r == c.r) || !(c.g == c.g) || !(c.b == c.b)) c.rgb = vec3(0.0);
      c.rgb = clamp(c.rgb, 0.0, 60000.0);
      float m = max(c.r, max(c.g, c.b));
      if (m > knee) {
        float x = m - knee; float r = ceiling - knee;
        float mm = knee + x / (1.0 + x / r);
        c.rgb *= mm / m;
      }
      gl_FragColor = c;
    }`,
};

const VelocityBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    invViewProj: { value: new THREE.Matrix4() },
    prevViewProj: { value: new THREE.Matrix4() },
    strength: { value: 1 },
    maxLength: { value: 0.06 },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform mat4 invViewProj; uniform mat4 prevViewProj;
    uniform float strength; uniform float maxLength; varying vec2 vUv;
    #define SAMPLES 32
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      float d = texture2D(tDepth, vUv).x;
      vec4 ndc = vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
      vec4 w = invViewProj * ndc; w /= w.w;
      vec4 p = prevViewProj * w;
      vec2 puv = (p.xy / p.w) * 0.5 + 0.5;
      vec2 vel = (vUv - puv) * strength;
      float len = length(vel);
      if (len > maxLength) vel *= maxLength / len;
      vec4 acc = vec4(0.0);
      float j = hash(gl_FragCoord.xy); // fixed per pixel: dithers the taps, identical every render
      for (int i = 0; i < SAMPLES; i++) {
        float t = (float(i) + j) / float(SAMPLES);
        acc += texture2D(tDiffuse, vUv - vel * t);
      }
      gl_FragColor = acc / float(SAMPLES);
    }`,
};

const tmpCam = new THREE.PerspectiveCamera();
function viewProjOf(pose: CamPose, aspect: number, near: number, far: number, out: THREE.Matrix4) {
  tmpCam.fov = pose.fov;
  tmpCam.aspect = aspect;
  tmpCam.near = near;
  tmpCam.far = far;
  tmpCam.position.set(...pose.position);
  tmpCam.up.set(0, 1, 0);
  tmpCam.lookAt(...pose.target);
  if (pose.roll) tmpCam.rotateZ(THREE.MathUtils.degToRad(pose.roll));
  tmpCam.updateMatrixWorld();
  tmpCam.updateProjectionMatrix();
  return out.multiplyMatrices(tmpCam.projectionMatrix, tmpCam.matrixWorldInverse);
}

const GrainShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.025 }, seed: { value: 0 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float amount; uniform float seed; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + seed) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); float n = h(gl_FragCoord.xy) - 0.5; c.rgb += n * amount; gl_FragColor = c; }`,
};

/** Wraps BokehPass so objects flagged userData.noDepth (backdrop quad, sprites, streaks) don't pollute the depth pass. */
class SafeBokehPass extends BokehPass {
  private sceneRef: THREE.Scene;
  constructor(scene: THREE.Scene, camera: THREE.Camera, params: { focus: number; aperture: number; maxblur: number }) {
    super(scene, camera, params);
    this.sceneRef = scene;
  }
  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget, deltaTime: number, maskActive: boolean) {
    const hidden: THREE.Object3D[] = [];
    this.sceneRef.traverse((o) => {
      if (o.userData.noDepth && o.visible) {
        o.visible = false;
        hidden.push(o);
      }
    });
    // super.render is typed loosely in three's d.ts; call through the prototype
    (BokehPass.prototype.render as (...a: unknown[]) => void).call(this, renderer, writeBuffer, readBuffer, deltaTime, maskActive);
    hidden.forEach((o) => (o.visible = true));
  }
}

export const PostFX: React.FC<PostSettings> = ({ dof = null, bloom = null, grain = 0.022, frame = 0, samples = 4, motionBlur = null, rolloff = {} }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const hasDof = !!dof;
  const hasBloom = !!bloom;
  const hasMb = !!motionBlur;
  const hasRolloff = !!rolloff;

  const passes = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(size.width, size.height, { type: THREE.HalfFloatType, samples });
    if (hasMb) rt.depthTexture = new THREE.DepthTexture(size.width, size.height);
    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(1);
    composer.setSize(size.width, size.height);
    composer.addPass(new RenderPass(scene, camera));
    // velocity blur must read the depth the RenderPass just wrote, so it goes first
    let mbPass: ShaderPass | null = null;
    if (hasMb) {
      mbPass = new ShaderPass(VelocityBlurShader);
      const inner = mbPass;
      const origRender = inner.render.bind(inner);
      inner.render = (r, w, rb, dt, mask) => {
        inner.uniforms.tDepth.value = rb.depthTexture;
        origRender(r, w, rb, dt, mask);
      };
      composer.addPass(mbPass);
    }
    const bokeh = hasDof ? new SafeBokehPass(scene, camera, { focus: 5, aperture: 0.002, maxblur: 0.01 }) : null;
    if (bokeh) composer.addPass(bokeh);
    const rollPass = hasRolloff ? new ShaderPass(RolloffShader) : null;
    if (rollPass) composer.addPass(rollPass);
    const bloomPass = hasBloom ? new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.6, 0.5, 0.85) : null;
    if (bloomPass) composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    const grainPass = new ShaderPass(GrainShader);
    composer.addPass(grainPass);
    return { composer, bokeh, bloomPass, grainPass, mbPass, rollPass };
  }, [gl, scene, camera, size.width, size.height, hasDof, hasBloom, hasMb, hasRolloff, samples]);

  const latest = useRef({ dof, bloom, grain, frame, motionBlur, rolloff });
  latest.current = { dof, bloom, grain, frame, motionBlur, rolloff };

  useLayoutEffect(() => () => passes.composer.dispose(), [passes]);

  useFrame(() => {
    const { dof: d, bloom: b, grain: g, frame: f, motionBlur: mb, rolloff: ro } = latest.current;
    if (passes.mbPass && mb) {
      const cam = camera as THREE.PerspectiveCamera;
      cam.updateMatrixWorld();
      const u = passes.mbPass.uniforms;
      (u.invViewProj.value as THREE.Matrix4).multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).invert();
      viewProjOf(mb.prevPose, cam.aspect, cam.near, cam.far, u.prevViewProj.value as THREE.Matrix4);
      u.strength.value = mb.strength ?? 1;
      u.maxLength.value = mb.maxLength ?? 0.06;
    }
    if (passes.rollPass && ro) {
      passes.rollPass.uniforms.knee.value = ro.knee ?? 0.9;
      passes.rollPass.uniforms.ceiling.value = ro.ceiling ?? 2.0;
    }
    if (passes.bokeh && d) {
      const u = (passes.bokeh as unknown as { uniforms: Record<string, { value: number }> }).uniforms;
      u.focus.value = d.focus;
      u.aperture.value = d.aperture ?? 0.0025;
      u.maxblur.value = d.maxblur ?? 0.012;
    }
    if (passes.bloomPass && b) {
      passes.bloomPass.strength = b.strength ?? 0.6;
      passes.bloomPass.radius = b.radius ?? 0.5;
      passes.bloomPass.threshold = b.threshold ?? 0.85;
    }
    passes.grainPass.uniforms.amount.value = g;
    passes.grainPass.uniforms.seed.value = (f * 7.13) % 100;
    passes.composer.render();
  }, 1);
  return null;
};
