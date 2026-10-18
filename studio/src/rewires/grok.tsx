// Grok Bot film (9:16, cinematic): a real-time 3D holographic "AI teammate" core (three.js, frame-driven)
// with HUD overlays that show what the narration says. No stock footage; no typography-only scenes.
// Our own core design stands in for the bot (xAI brand rules forbid altered logos).
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";

const LIME = new THREE.Color(C.lime);
const ICE = new THREE.Color("#7FD8FF");
const RED = "#E5484D";
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;

// ------------------------------------------------------------------ 3D pieces
const useGlowTexture = () =>
  useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const g = cv.getContext("2d")!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,255,255,0.45)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(cv);
  }, []);

const CameraRig: React.FC<{ pos: [number, number, number]; look?: [number, number, number] }> = ({ pos, look = [0, 0, 0] }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...look);
    camera.updateProjectionMatrix();
  }, [camera, pos, look]);
  return null;
};

/** The AI core: glowing heart, wireframe shell, three gyroscope rings, a particle halo. */
const Core: React.FC<{ boot: number; pulse: number; spread?: number; tint?: THREE.Color; scale?: number; y?: number }> = ({ boot, pulse, spread = 0, tint = LIME, scale = 1, y = 0 }) => {
  const frame = useCurrentFrame();
  const glow = useGlowTexture();
  const ico = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.25, 1)), []);
  const halo = useMemo(() => {
    const n = 1400;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = random(`h${i}`) * 2 - 1;
      const th = random(`t${i}`) * Math.PI * 2;
      const r = 2.2 + random(`r${i}`) * 2.6;
      const s = Math.sqrt(1 - u * u);
      p.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  const t = frame / 30;
  const b = Math.max(0.0001, boot);
  return (
    <group position={[0, y, 0]} scale={scale * (0.2 + 0.8 * EASE(Math.min(1, b)))}>
      <sprite scale={[4.2 * (0.8 + 0.25 * pulse) * b, 4.2 * (0.8 + 0.25 * pulse) * b, 1]}>
        <spriteMaterial map={glow} color={tint} transparent opacity={0.4 * b} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <mesh>
        <sphereGeometry args={[0.3 + 0.04 * pulse, 32, 32]} />
        <meshBasicMaterial color="#F6FFE8" transparent opacity={b} />
      </mesh>
      <mesh rotation={[t * 0.4, t * 0.6, 0]}>
        <icosahedronGeometry args={[0.62, 2]} />
        <meshBasicMaterial color={tint} transparent opacity={0.16 * b} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[-t * 0.3, t * 0.5, 0]}>
        <icosahedronGeometry args={[0.66, 1]} />
        <meshBasicMaterial color={tint} wireframe transparent opacity={0.5 * b} />
      </mesh>
      <lineSegments geometry={ico} rotation={[t * 0.25, -t * 0.35, t * 0.1]}>
        <lineBasicMaterial color={C.cream} transparent opacity={0.55 * b} />
      </lineSegments>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 1.05 + t * (0.5 + i * 0.2), t * (0.3 - i * 0.15), i * 0.6]} scale={1 + spread * (0.4 + i * 0.3)}>
          <torusGeometry args={[1.75 + i * 0.32, 0.012 + 0.01 * i, 8, 160]} />
          <meshBasicMaterial color={i === 1 ? ICE : tint} transparent opacity={0.9 * b} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <points geometry={halo} rotation={[0, t * 0.12, 0]} scale={1 + spread * 0.8}>
        <pointsMaterial size={0.035} color={C.cream} transparent opacity={0.7 * b} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
};

/** A corridor of server towers with blinking lime status lights (the bot's always-on cloud computer). */
const ServerHall: React.FC<{ on: number }> = ({ on }) => {
  const frame = useCurrentFrame();
  const towers = useMemo(() => {
    const out: [number, number][] = [];
    for (let z = 0; z < 16; z++) for (const x of [-1.7, -1.05, 1.05, 1.7]) out.push([x, -z * 1.6]);
    return out;
  }, []);
  return (
    <group position={[0, -0.5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, -15]}>
        <planeGeometry args={[14, 50]} />
        <meshBasicMaterial color="#0d0f0d" />
      </mesh>
      {towers.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh>
            <boxGeometry args={[0.5, 3.2, 1.2]} />
            <meshBasicMaterial color="#121412" />
          </mesh>
          {new Array(8).fill(0).map((_, k) => {
            const blink = (Math.sin(frame / (4 + (i % 5)) + i * 3 + k) + 1) / 2;
            return (
              <mesh key={k} position={[x > 0 ? -0.26 : 0.26, -1.3 + k * 0.36, 0.2]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
                <planeGeometry args={[0.7, 0.05]} />
                <meshBasicMaterial color={k % 3 === 0 ? ICE : LIME} transparent opacity={(0.25 + 0.75 * blink) * on} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

const Stage: React.FC<{ children: React.ReactNode; cam: [number, number, number]; look?: [number, number, number] }> = ({ children, cam, look }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: 42, position: cam, near: 0.1, far: 200 }} style={{ background: C.charcoal }}>
      <CameraRig pos={cam} look={look} />
      <fog attach="fog" args={[C.charcoal, 10, 42]} />
      {children}
    </ThreeCanvas>
  );
};

// ------------------------------------------------------------------ HUD helpers
const hudFont = { fontFamily: MONO, letterSpacing: 3 } as const;
const Chip: React.FC<{ text: string; top?: number; lime?: boolean; at?: number }> = ({ text, top = 250, lime, at = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ ...hudFont, fontWeight: 700, fontSize: 22, color: lime ? C.charcoal : C.lime, background: lime ? C.lime : "rgba(167,255,63,0.08)", border: `1.5px solid ${C.lime}`, borderRadius: 999, padding: "8px 20px" }}>{text}</div>
    </div>
  );
};
/** Glass HUD panel with corner brackets and a scan line. */
const Panel: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; red?: boolean }> = ({ style, children, red }) => {
  const frame = useCurrentFrame();
  const col = red ? RED : C.lime;
  return (
    <div style={{ position: "absolute", background: red ? "rgba(40,6,8,0.78)" : "rgba(10,14,10,0.72)", border: `1.5px solid ${red ? "rgba(229,72,77,0.6)" : "rgba(167,255,63,0.45)"}`, borderRadius: 18, boxShadow: `0 0 40px ${red ? "rgba(229,72,77,0.25)" : "rgba(167,255,63,0.18)"}`, overflow: "hidden", backdropFilter: "blur(6px)", ...style }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: `${(frame * 2) % 120 - 10}%`, height: 2, background: `linear-gradient(90deg, transparent, ${col}, transparent)`, opacity: 0.35 }} />
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => (
        <div key={i} style={{ position: "absolute", [x ? "right" : "left"]: 8, [y ? "bottom" : "top"]: 8, width: 18, height: 18, borderTop: y ? undefined : `3px solid ${col}`, borderBottom: y ? `3px solid ${col}` : undefined, borderLeft: x ? undefined : `3px solid ${col}`, borderRight: x ? `3px solid ${col}` : undefined }} />
      ))}
      {children}
    </div>
  );
};
const Logo: React.FC<{ name: string; size: number }> = ({ name, size }) => <Img src={staticFile(`media/grok/${name}-c.svg`)} style={{ width: size, height: size }} />;
const Letterbox: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "#000" }} />
  </>
);

// ------------------------------------------------------------------ scenes
/** Hook: the laptop shuts, the core boots, its own email address writes itself in the air. */
const BootBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const lidAt = 14;
  const bootAt = c("computer", 30);
  const mailAt = c("email", 60);
  const lid = interpolate(frame, [lidAt, lidAt + 14], [0, 1], { ...clamp, easing: EASE_IO });
  const boot = interpolate(frame, [0, 6, bootAt - 6, bootAt + 24], [0, 0.35, 0.4, 1], clamp);
  const flash = interpolate(frame, [bootAt - 2, bootAt + 2, bootAt + 10], [0, 1, 0], clamp);
  const addr = "bot@mail.grokbot.com";
  const typed = addr.slice(0, Math.max(0, Math.floor((frame - mailAt) * 1.4)));
  const camZ = interpolate(frame, [0, 150], [15, 12], clamp);
  return (
    <>
      <Stage cam={[0, 0.2, camZ]}>
        <Core boot={boot} pulse={(Math.sin(frame / 5) + 1) / 2} spread={interpolate(frame, [bootAt, bootAt + 20], [0.8, 0], clamp)} y={0.3} />
      </Stage>
      <div style={{ position: "absolute", left: 160, top: 900, width: 760, perspective: 1400, opacity: interpolate(frame, [bootAt, bootAt + 10], [1, 0], clamp), scale: String(interpolate(frame, [0, 14], [1.08, 1], clamp)) }}>
        <div style={{ width: 760, height: 460, borderRadius: 22, background: "linear-gradient(160deg, #2a2d2a, #151615)", border: "3px solid #3a3d3a", transformOrigin: "50% 100%", rotate: `x ${-lid * 88}deg`, boxShadow: `0 0 ${80 * (1 - lid)}px rgba(167,255,63,0.35)` }}>
          <div style={{ margin: 22, height: 410, borderRadius: 10, background: "#0b0d0b", opacity: 1 - lid, padding: 26, overflow: "hidden" }}>
            {["> Find 20 leads in Bengaluru", "> Draft outreach emails", "> Book calls for Monday"].map((l, i) => (
              <div key={l} style={{ fontFamily: MONO, fontSize: 30, color: i === 2 ? C.lime : C.cream, marginTop: i ? 18 : 0, opacity: interpolate(frame, [i * 3, i * 3 + 4], [0, 1], clamp) }}>{l}</div>
            ))}
            <div style={{ marginTop: 26, height: 14, width: `${interpolate(frame, [0, 14], [10, 90], clamp)}%`, borderRadius: 7, background: C.lime }} />
          </div>
        </div>
        <div style={{ width: 860, height: 30, marginLeft: -50, borderRadius: "0 0 18px 18px", background: "#2a2d2a" }} />
      </div>
      <AbsoluteFill style={{ background: C.cream, opacity: flash * 0.5, mixBlendMode: "screen" }} />
      {frame >= mailAt ? (
        <Panel style={{ left: 170, right: 170, top: 1110, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <Logo name="gmail" size={40} />
          <div style={{ ...hudFont, fontSize: 30, color: C.cream, letterSpacing: 1 }}>
            {typed}
            <span style={{ color: C.lime, opacity: Math.floor(frame / 8) % 2 }}>▍</span>
          </div>
        </Panel>
      ) : null}
      <Chip text="XAI · GROK BOT" at={bootAt} />
    </>
  );
};

/** It signs into your tools: logos orbit the core, beams lock on, finished work slams down. */
const ToolsBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const tools = ["notion", "figma", "canva", "gmail"];
  const lockAt = c("signs", 90);
  const doneAt = c("finished", 200);
  const slam = spring({ frame: frame - doneAt, fps: 30, config: { damping: 10, stiffness: 220 } });
  return (
    <>
      <Stage cam={[Math.sin(frame / 60) * 3, 0.4, 13.5]}>
        <Core boot={1} pulse={(Math.sin(frame / 4) + 1) / 2} spread={0.1} y={0.2} />
      </Stage>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {tools.map((t, i) => {
          const a = (i / tools.length) * Math.PI * 2 + frame / 50;
          const x = 540 + Math.cos(a) * 360;
          const y = 900 + Math.sin(a) * 300;
          const on = frame >= lockAt + i * 8;
          return on ? <line key={t} x1={540} y1={900} x2={x} y2={y} stroke={C.lime} strokeWidth={3} strokeDasharray="10 8" strokeDashoffset={-frame * 3} opacity={0.8} /> : null;
        })}
      </svg>
      {tools.map((t, i) => {
        const a = (i / tools.length) * Math.PI * 2 + frame / 50;
        const x = 540 + Math.cos(a) * 360;
        const y = 900 + Math.sin(a) * 300;
        const on = frame >= lockAt + i * 8;
        const p = spring({ frame: frame - 4 - i * 5, fps: 30, config: { damping: 12, stiffness: 160 } });
        return (
          <Panel key={t} style={{ left: x - 62, top: y - 62, width: 124, height: 124, display: "flex", alignItems: "center", justifyContent: "center", scale: String(0.4 + 0.6 * p), borderColor: on ? C.lime : "rgba(246,244,237,0.2)" }}>
            <Logo name={t} size={64} />
            {on ? <div style={{ position: "absolute", right: 6, bottom: 4, ...hudFont, fontSize: 14, color: C.lime }}>●</div> : null}
          </Panel>
        );
      })}
      {frame >= doneAt ? (
        <Panel style={{ left: 150, right: 150, top: 1180, padding: "20px 26px", scale: String(1.4 - 0.4 * slam), opacity: Math.min(1, slam * 1.5) }}>
          <div style={{ ...hudFont, fontSize: 18, color: C.lime }}>TASK COMPLETE</div>
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: C.cream, marginTop: 6 }}>Q4 launch deck · 12 slides</div>
          <div style={{ fontFamily: BODY, fontSize: 22, color: C.stone, marginTop: 4 }}>Built in Canva from your Notion brief</div>
        </Panel>
      ) : null}
      <Chip text="YOUR TOOLS · YOUR LOGINS" />
    </>
  );
};

/** Always on: fly through the cloud server hall while the clock runs overnight. */
const CloudBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const z = interpolate(frame, [0, D], [5, -14], { ...clamp, easing: EASE_IO });
  const hour = interpolate(frame, [0, D], [23, 31], clamp);
  const hh = String(Math.floor(hour) % 24).padStart(2, "0");
  const mm = String(Math.floor((hour % 1) * 60)).padStart(2, "0");
  const log = ["Inbox triaged · 48 emails", "Competitor prices checked", "3 LinkedIn posts drafted", "Weekly report ready"];
  const shut = c("laptop", 60);
  return (
    <>
      <Stage cam={[0, 0.2, z]} look={[0, 0.1, z - 6]}>
        <ServerHall on={1} />
        <group position={[0, 0.6, z - 7]}>
          <Core boot={1} pulse={(Math.sin(frame / 5) + 1) / 2} scale={0.22} />
        </group>
      </Stage>
      <Letterbox />
      <Panel style={{ left: 90, top: 230, padding: "14px 20px" }}>
        <div style={{ ...hudFont, fontSize: 16, color: C.stone }}>LOCAL TIME</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 52, color: C.cream, fontVariantNumeric: "tabular-nums" }}>
          {hh}:{mm}
        </div>
      </Panel>
      <Panel style={{ right: 90, top: 230, padding: "14px 20px", opacity: frame >= shut ? 1 : 0 }}>
        <div style={{ ...hudFont, fontSize: 16, color: C.stone }}>YOUR LAPTOP</div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 36, color: RED }}>● OFF</div>
      </Panel>
      <Panel style={{ left: 120, right: 120, top: 1080, padding: "18px 24px" }}>
        <div style={{ ...hudFont, fontSize: 16, color: C.lime }}>BOT ACTIVITY · CLOUD</div>
        {log.map((l, i) => {
          const at = 20 + i * Math.round((D - 40) / log.length);
          return (
            <div key={l} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 26, color: C.cream, marginTop: 8, opacity: interpolate(frame, [at, at + 8], [0, 1], clamp) }}>
              <span style={{ color: C.lime }}>✓</span> {l}
            </div>
          );
        })}
      </Panel>
    </>
  );
};

/** Avengers-style mission briefing: xAI's reported results, then missions you can assign. */
const MissionBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const s1 = c("savings", 20);
  const s2 = c("tickets", 90);
  const mAt = c("missions", 190);
  const n1 = Math.round(interpolate(frame, [s1, s1 + 28], [0, 100000], { ...clamp, easing: EASE }));
  const n2 = Math.round(interpolate(frame, [s2, s2 + 24], [0, 175], { ...clamp, easing: EASE }));
  const card = (at: number) => {
    const p = spring({ frame: frame - at, fps: 30, config: { damping: 13, stiffness: 150 } });
    return { opacity: Math.min(1, p * 1.4), rotate: `y ${(1 - p) * -40}deg`, translate: `${(1 - p) * -200}px 0` } as React.CSSProperties;
  };
  const missions: [string, string][] = [["LinkedIn campaigns", "x"], ["Competitor tracking", "notion"], ["Inbox clean-up", "gmail"]];
  return (
    <>
      <Stage cam={[0, 0, 11]}>
        <Core boot={1} pulse={(Math.sin(frame / 6) + 1) / 2} scale={0.38} y={3.0} />
      </Stage>
      <Chip text="MISSION BRIEFING · XAI-REPORTED RESULTS" top={575} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 660, perspective: 1400, display: "flex", flexDirection: "column", gap: 22 }}>
        <Panel style={{ position: "relative", padding: "22px 28px", ...card(s1 - 4) }}>
          <div style={{ ...hudFont, fontSize: 18, color: C.stone }}>PROCUREMENT BOT · SAVINGS FOUND</div>
          <div style={{ fontFamily: SERIF, fontSize: 96, color: C.lime, lineHeight: 1.05 }}>${n1.toLocaleString("en-US")}+</div>
        </Panel>
        <Panel style={{ position: "relative", padding: "22px 28px", ...card(s2 - 4) }}>
          <div style={{ ...hudFont, fontSize: 18, color: C.stone }}>SUPPORT TEAM · TICKETS HANDLED</div>
          <div style={{ fontFamily: SERIF, fontSize: 96, color: C.lime, lineHeight: 1.05 }}>+{n2}%</div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: C.cream }}>zero new hires</div>
        </Panel>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1180, display: "flex", gap: 14 }}>
        {missions.map(([m, logo], i) => {
          const p = spring({ frame: frame - mAt - i * 6, fps: 30, config: { damping: 12, stiffness: 190 } });
          return (
            <Panel key={m} style={{ position: "relative", flex: 1, padding: "14px 12px", textAlign: "center", opacity: frame >= mAt + i * 6 ? 1 : 0, scale: String(0.6 + 0.4 * p) }}>
              <Logo name={logo} size={40} />
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 21, color: C.cream, marginTop: 8 }}>{m}</div>
            </Panel>
          );
        })}
      </div>
    </>
  );
};

/** The catch: an Amazon access-denied shield shatters, then a human approves the bot's email. */
const GuardBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const blockAt = c("amazon", 10);
  const shatter = c("approve", 110) - 10;
  const tapAt = c("approve", 110) + 20;
  const sh = interpolate(frame, [shatter, shatter + 20], [0, 1], { ...clamp, easing: EASE });
  const shake = frame >= blockAt && frame < blockAt + 12 ? Math.sin(frame * 5) * 10 : 0;
  const approved = frame >= tapAt;
  return (
    <>
      <Stage cam={[0, 0, 9]}>
        <Core boot={1} pulse={0.3} tint={frame < shatter ? new THREE.Color(RED) : LIME} scale={0.38} y={-3.5} />
      </Stage>
      {frame >= blockAt
        ? new Array(14).fill(0).map((_, i) => {
            const r1 = random(`s${i}`);
            const r2 = random(`q${i}`);
            const ang = (i / 14) * Math.PI * 2;
            return (
              <div key={i} style={{ position: "absolute", left: 540 - 180 + (i % 4) * 90 + Math.cos(ang) * sh * 600, top: 420 + Math.floor(i / 4) * 90 + Math.sin(ang) * sh * 600 + sh * sh * 400, width: 90, height: 90, background: "rgba(229,72,77,0.22)", border: `2px solid ${RED}`, clipPath: `polygon(${r1 * 40}% 0, 100% ${r2 * 40}%, ${60 + r1 * 40}% 100%, 0 ${50 + r2 * 50}%)`, rotate: `${sh * (r1 - 0.5) * 360}deg`, opacity: 1 - sh, translate: `${shake}px 0` }} />
            );
          })
        : null}
      {frame >= blockAt && frame < shatter + 10 ? (
        <Panel red style={{ left: 170, right: 170, top: 520, padding: "22px 26px", textAlign: "center", translate: `${shake}px 0`, opacity: 1 - sh }}>
          <Logo name="amazon" size={56} />
          <div style={{ ...hudFont, fontWeight: 800, fontSize: 38, color: RED, marginTop: 8 }}>ACCESS DENIED</div>
          <div style={{ fontFamily: BODY, fontSize: 22, color: C.stone, marginTop: 6 }}>Unauthorized AI agent</div>
        </Panel>
      ) : null}
      {frame >= shatter ? (
        <Panel style={{ left: 140, right: 140, top: 560, padding: "24px 26px", opacity: interpolate(frame, [shatter, shatter + 10], [0, 1], clamp) }}>
          <div style={{ ...hudFont, fontSize: 18, color: C.lime }}>APPROVAL NEEDED</div>
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 32, color: C.cream, marginTop: 8 }}>Send email to supplier?</div>
          <div style={{ fontFamily: BODY, fontSize: 22, color: C.stone, marginTop: 4 }}>“Can you match last month's price?”</div>
          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            <div style={{ flex: 1, textAlign: "center", borderRadius: 12, padding: "12px 0", fontFamily: BODY, fontWeight: 800, fontSize: 24, background: approved ? C.lime : "rgba(167,255,63,0.15)", color: approved ? C.charcoal : C.lime, scale: frame >= tapAt && frame < tapAt + 5 ? "0.94" : "1" }}>{approved ? "✓ Approved" : "Approve"}</div>
            <div style={{ flex: 1, textAlign: "center", borderRadius: 12, padding: "12px 0", fontFamily: BODY, fontWeight: 800, fontSize: 24, background: "rgba(246,244,237,0.08)", color: C.stone }}>Reject</div>
          </div>
        </Panel>
      ) : null}
      {frame >= tapAt - 14 && frame < tapAt + 12 ? <div style={{ position: "absolute", left: interpolate(frame, [tapAt - 14, tapAt], [700, 300], clamp), top: interpolate(frame, [tapAt - 14, tapAt], [1100, 820], clamp), width: 56, height: 56, borderRadius: "50%", background: "rgba(246,244,237,0.85)", boxShadow: "0 0 0 10px rgba(246,244,237,0.2)" }} /> : null}
      <Chip text="THE CATCH" at={0} />
    </>
  );
};

/** Plans fly in; Premium and above light up; platforms rotate in. */
const PlansBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const plans: [string, string, boolean][] = [["Free", "$0", false], ["Plus", "$8", false], ["Premium", "$30", true], ["Super", "$100", true], ["Ultra", "$200", true]];
  const litAt = c("premium", 30);
  const devAt = c("mac", 80);
  return (
    <>
      <Stage cam={[0, 0, 10]}>
        <Core boot={1} pulse={(Math.sin(frame / 6) + 1) / 2} scale={0.34} y={3.4} />
      </Stage>
      <Chip text="THE X SUBSCRIPTION · PER MONTH" top={640} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 760, display: "flex", gap: 12, perspective: 1200 }}>
        {plans.map(([n, p, on], i) => {
          const s = spring({ frame: frame - i * 4, fps: 30, config: { damping: 13, stiffness: 170 } });
          const lit = on && frame >= litAt;
          return (
            <div key={n} style={{ flex: 1, borderRadius: 18, padding: "16px 8px", textAlign: "center", background: lit ? C.lime : "rgba(246,244,237,0.06)", border: `1.5px solid ${lit ? C.lime : "rgba(246,244,237,0.18)"}`, color: lit ? C.charcoal : C.stone, rotate: `x ${(1 - s) * 70}deg`, opacity: s, boxShadow: lit ? "0 0 40px rgba(167,255,63,0.35)" : undefined }}>
              <div style={{ ...hudFont, fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>{n.toUpperCase()}</div>
              <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.1 }}>{p}</div>
              {on ? <div style={{ ...hudFont, fontSize: 12, letterSpacing: 1, opacity: lit ? 1 : 0 }}>+ GROK BOT</div> : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040, display: "flex", justifyContent: "center", gap: 46 }}>
        {(["apple", "windows", "linux"] as const).map((d, i) => {
          const s = spring({ frame: frame - devAt - i * 5, fps: 30, config: { damping: 12, stiffness: 180 } });
          return (
            <div key={d} style={{ opacity: frame >= devAt + i * 5 ? 1 : 0, rotate: `y ${(1 - s) * 180}deg`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Logo name={d} size={70} />
              <div style={{ ...hudFont, fontSize: 16, color: C.stone }}>{d === "apple" ? "MAC · IPHONE" : d.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/** Sign-off: the core collapses into one point of light. */
const OffBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const k = interpolate(frame, [D * 0.45, D - 4], [1, 0.02], { ...clamp, easing: EASE_IO });
  return (
    <>
      <Stage cam={[0, 0, 12]}>
        <Core boot={k} pulse={(Math.sin(frame / 3) + 1) / 2} spread={1 - k} />
      </Stage>
    </>
  );
};

export const GBotScene: React.FC<SceneProps> = ({ data }) => {
  const c = cueOf(data);
  const k = data.beat as string;
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      {k === "boot" ? <BootBeat c={c} /> : null}
      {k === "tools" ? <ToolsBeat c={c} /> : null}
      {k === "cloud" ? <CloudBeat c={c} /> : null}
      {k === "mission" ? <MissionBeat c={c} /> : null}
      {k === "guard" ? <GuardBeat c={c} /> : null}
      {k === "plans" ? <PlansBeat c={c} /> : null}
      {k === "off" ? <OffBeat /> : null}
    </AbsoluteFill>
  );
};

export const GROK_SCENES: Record<string, React.FC<SceneProps>> = { gBot: GBotScene };
