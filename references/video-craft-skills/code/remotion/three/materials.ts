/**
 * Material recipes (numbers verified in headless renders). Tints come from the theme accent.
 * All are MeshPhysicalMaterial so they respond to the procedural environment.
 */
import * as THREE from "three";
import { B3 } from "./core3d";

export type Finish = "glass" | "crystal" | "metal" | "frosted" | "satin";

/** Clear tinted glass: refracts the backdrop; tinted by attenuation, not by base colour. */
export const glass = (o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  new THREE.MeshPhysicalMaterial({
    color: "#EEF2FF",
    metalness: 0,
    roughness: 0.06,
    transmission: 1,
    ior: 1.5,
    thickness: 0.22,
    attenuationColor: new THREE.Color(B3.accentDeep),
    attenuationDistance: 0.45,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.25,
    dispersion: 0.15,
    ...o,
  });

/**
 * Crystal: glass tuned for the LIGHT stage. Clear body (white base), stronger IOR and
 * dispersion so refracted grid lines split into a faint chromatic edge, deeper accent absorption
 * (thickness 0.5 / distance 0.5). Pair with Logo3D's edge-absorb shell + white rim + GlassCaustic.
 */
export const crystal = (o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  glass({
    color: "#FFFFFF",
    roughness: 0.015,
    ior: 1.62,
    thickness: 0.5,
    attenuationColor: new THREE.Color(B3.accentDeep),
    attenuationDistance: 0.5,
    dispersion: 0.9,
    specularIntensity: 1,
    envMapIntensity: 1.8,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    ...o,
  });

/** Frosted glass: same as glass with roughness ~0.4 (diffuse refraction = "frosted"). */
export const frosted = (o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  glass({ roughness: 0.42, thickness: 0.18, attenuationDistance: 0.6, clearcoat: 0.6, clearcoatRoughness: 0.3, dispersion: 0, ...o });

/** Accent metal: anodised look (metalness 1, roughness 0.22) + clearcoat so it keeps a crisp highlight. */
export const accentMetal = (color: string = B3.accentDeep, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.4,
    ...o,
  });

/** Satin brand surface: the flat logo colours with a lacquer coat (closest to the 2D mark). */
export const satin = (color: string, o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.05,
    roughness: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    sheen: 0.4,
    sheenColor: new THREE.Color(B3.accentSoft),
    envMapIntensity: 1,
    ...o,
  });

/** Material set for Logo3D: a = primary pieces, b = secondary pieces (two-tone), c = small fragments. */
export function finishMaterials(finish: Finish) {
  switch (finish) {
    case "glass":
      return {
        a: glass({ attenuationColor: new THREE.Color(B3.accentDeep), attenuationDistance: 0.22 }),
        b: glass({ attenuationColor: new THREE.Color(B3.accentBright), attenuationDistance: 0.32 }),
        c: glass({ attenuationDistance: 0.2, thickness: 0.1 }),
      };
    case "crystal":
      return {
        a: crystal({ attenuationColor: new THREE.Color(B3.accentDeep), attenuationDistance: 1.1 }),
        b: crystal({ attenuationColor: new THREE.Color(B3.accentBright), attenuationDistance: 1.6 }),
        c: crystal({ thickness: 0.25, attenuationDistance: 0.9 }),
      };
    case "frosted":
      return {
        a: frosted(),
        b: frosted({ attenuationColor: new THREE.Color(B3.accentBright) }),
        c: frosted({ thickness: 0.05 }),
      };
    case "metal":
      return {
        a: accentMetal(B3.accentDeep),
        b: accentMetal(B3.accentBright, { roughness: 0.16 }),
        c: accentMetal(B3.accent, { roughness: 0.3 }),
      };
    case "satin":
    default:
      return {
        a: satin(B3.accentDeep),
        b: satin(B3.accentBright),
        c: satin(B3.accent),
      };
  }
}

/** Slab body for cards/layers: low-iron glass with a faint accent edge. */
export const slabGlass = (o: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
  glass({
    roughness: 0.14,
    thickness: 0.06,
    attenuationColor: new THREE.Color(B3.accentSoft),
    attenuationDistance: 0.8,
    dispersion: 0,
    ...o,
  });
