/**
 * 3D kit (real WebGL via @remotion/three + @react-three/fiber + three). Render with --gl=angle.
 * Skill: skills/video-craft/references/3d.md. API: references/components.md §3D.
 */
export * from "./core3d";
export * from "./camera";
export * from "./env";
export * from "./materials";
export * from "./post";
export * from "./stage";
export * from "./texture";
export { Logo3D } from "./Logo3D";
export type { Logo3DProps } from "./Logo3D";
export { GlassCard3D } from "./GlassCard3D";
export type { CardContent, CardRow, GlassCard3DProps } from "./GlassCard3D";
export { Orb3D } from "./Orb3D";
export type { Orb3DProps } from "./Orb3D";
export { DEFAULT_LAYERS, LayerStack3D, stackLayerAnchor, stackLayerY } from "./LayerStack3D";
export type { LayerStack3DProps, StackLayer } from "./LayerStack3D";
export { TileField3D } from "./TileField3D";
export type { TileField3DProps } from "./TileField3D";
export { LightStreaks } from "./LightStreaks";
export type { LightStreaksProps } from "./LightStreaks";
export { Text3D, useTypeface } from "./Text3D";
export type { Text3DProps, TextFinish } from "./Text3D";
