// "Sales machine" film (9:16, light theme): a real-time 3D glass sales machine that assembles itself step by step
// as the narration explains how to rebuild a sales team with Claude Code. Frame-driven three.js (no useFrame),
// glass via MeshPhysicalMaterial + RoomEnvironment reflections (no external asset loads). HUD overlays carry the
// real UIs and official full-colour logos. Example numbers are labelled.
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";

const INK = "#3E7A00";
const RED = "#E5484D";
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;
const sp = (f: number, at: number, k = { damping: 14, stiffness: 170 }) => spring({ frame: f - at, fps: 30, config: k });
const enter = (f: number, at: number, rise = 26): React.CSSProperties => {
  const s = sp(f, at);
  return { opacity: f < at ? 0 : Math.min(1, s * 1.5), translate: `0 ${(1 - s) * rise}px`, scale: String(0.94 + 0.06 * s) };
};

// ------------------------------------------------------------------ 3D machine
/** Environment + camera: studio reflections for glass, camera placed per beat. */
const Rig: React.FC<{ pos: [number, number, number]; look: [number, number, number] }> = ({ pos, look }) => {
  const { gl, scene, camera } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl, scene]);
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...look);
    camera.updateProjectionMatrix();
  }, [camera, pos, look]);
  return null;
};

const glass = (tint = "#FFFFFF", opacity = 1) => (
  <meshPhysicalMaterial color={tint} transmission={1} roughness={0.06} thickness={0.6} ior={1.45} clearcoat={1} clearcoatRoughness={0.05} metalness={0} transparent opacity={opacity} envMapIntensity={1.4} />
);
const steel = <meshStandardMaterial color="#C9CCC6" metalness={0.85} roughness={0.25} envMapIntensity={1.2} />;
const darkSteel = <meshStandardMaterial color="#1E211E" metalness={0.6} roughness={0.35} />;

/** Company particles: born in the hopper, drop through the tiers; rejects peel off sideways. */
const Particles: React.FC<{ level: number; t: number }> = ({ level, t }) => {
  const N = 220;
  const data = useMemo(() => new Array(N).fill(0).map((_, i) => ({ r: random(`r${i}`), a: random(`a${i}`) * Math.PI * 2, s: random(`s${i}`), fate: random(`f${i}`) })), []);
  if (level < 3) return null;
  return (
    <group>
      {data.map((d, i) => {
        // phase 0..1 loops: falls from top (y=3.4) down through the machine
        const ph = (t * (0.18 + d.s * 0.1) + d.r) % 1;
        let y = 3.4 - ph * 5.6;
        let rad = interpolate(y, [-2.2, 1.2, 2.2, 3.4], [0.2, 0.28, 0.9 * d.r + 0.05, 1.6 * d.r + 0.1], clamp);
        let x = Math.cos(d.a + t * 0.6) * rad;
        let z = Math.sin(d.a + t * 0.6) * rad;
        // rejection at each active filter tier: these peel out to the side tray
        const tiers = [0.7, -0.6, -1.9];
        let col = "#8A6A4A";
        for (let k = 0; k < 3; k++) {
          if (level >= 4 + Math.min(k, 1) + (k === 2 ? 0 : 0) && y < tiers[k] && d.fate < 0.18 + k * 0.08 && d.fate > k * 0.08) {
            const out = Math.min(1, (tiers[k] - y) / 0.9);
            x += out * 2.2;
            y = tiers[k] - out * 0.5;
            col = RED;
          }
        }
        if (level >= 4 && y < 0.7 && col !== RED) col = "#7CB342";
        if (y < -2.6 && level < 6) return null;
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color={col} roughness={0.4} metalness={0.1} emissive={col === "#7CB342" ? "#7CB342" : "#000"} emissiveIntensity={col === "#7CB342" ? 0.25 : 0} />
          </mesh>
        );
      })}
    </group>
  );
};

const Tier: React.FC<{ y: number; on: number; glow: string }> = ({ y, on, glow }) => (
  <group position={[0, y, 0]} scale={[on, on, on]}>
    <mesh>
      <cylinderGeometry args={[0.95, 0.95, 0.5, 48, 1, true]} />
      {glass("#FFFFFF")}
    </mesh>
    <mesh position={[0, 0.27, 0]}>
      <torusGeometry args={[0.97, 0.05, 12, 64]} />
      {steel}
    </mesh>
    <mesh position={[0, -0.27, 0]}>
      <torusGeometry args={[0.97, 0.05, 12, 64]} />
      {steel}
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.92, 48]} />
      <meshStandardMaterial color={glow} transparent opacity={0.28 * on} emissive={glow} emissiveIntensity={0.35} />
    </mesh>
  </group>
);

/** The whole machine; parts appear as `level` rises (1 rail … 8 CRM). */
const Machine: React.FC<{ level: number; grow: number }> = ({ level, grow }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const funnel = useMemo(() => {
    const pts = [new THREE.Vector2(0.28, 1.1), new THREE.Vector2(0.4, 1.5), new THREE.Vector2(1.2, 2.4), new THREE.Vector2(1.9, 3.2), new THREE.Vector2(2.0, 3.4)];
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const pipeCurves = useMemo(
    () => [-1.8, 0, 1.8].map((x) => new THREE.CatmullRomCurve3([new THREE.Vector3(0, -2.4, 0), new THREE.Vector3(x * 0.5, -2.9, 0.2), new THREE.Vector3(x, -3.6, 0.3), new THREE.Vector3(x, -4.3, 0.3)])),
    [],
  );
  const signal = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-2.4, -4.6, 0.3), new THREE.Vector3(0, -4.85, 0.6), new THREE.Vector3(2.4, -4.6, 0.3)]), []);
  const g = (lv: number) => (level > lv ? 1 : level === lv ? EASE(Math.min(1, grow)) : 0.0001);
  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, 2, -3]} intensity={0.6} color="#E8FFB8" />
      {/* top rail (tools plug in here) */}
      <group scale={[g(1), 1, 1]}>
        <mesh position={[0, 3.9, 0]}>
          <boxGeometry args={[5.2, 0.16, 0.5]} />
          {darkSteel}
        </mesh>
      </group>
      {[-2.3, 2.3].map((x) => (
        <mesh key={x} position={[x, 0.4, -0.3]} scale={[1, g(1), 1]}>
          <cylinderGeometry args={[0.06, 0.06, 7, 12]} />
          {darkSteel}
        </mesh>
      ))}
      {/* ICP key */}
      {level >= 2 ? (
        <mesh position={[0, 4.25, 0]} rotation={[0, t * 0.8, 0]} scale={g(2)}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={C.lime} emissive={C.lime} emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
      ) : null}
      {/* hopper funnel */}
      <mesh geometry={funnel} scale={[g(3), g(3), g(3)]}>
        {glass("#FFFFFF")}
      </mesh>
      <mesh position={[0, 3.4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={g(3)}>
        <torusGeometry args={[2.0, 0.06, 12, 96]} />
        {steel}
      </mesh>
      {/* filter tiers */}
      <Tier y={0.7} on={g(4)} glow="#C9F28A" />
      <Tier y={-0.6} on={g(5)} glow="#E8FFB8" />
      <Tier y={-1.9} on={g(5)} glow="#A7FF3F" />
      {/* reject trays */}
      {[0.4, -0.9, -2.2].map((y, i) =>
        level >= (i === 0 ? 4 : 5) ? (
          <mesh key={y} position={[2.3, y, 0]} scale={g(i === 0 ? 4 : 5)}>
            <boxGeometry args={[0.7, 0.18, 0.7]} />
            <meshStandardMaterial color="#F2D4D4" roughness={0.5} />
          </mesh>
        ) : null,
      )}
      {/* three channel pipes */}
      {pipeCurves.map((cv, i) => (
        <mesh key={i} scale={[1, g(6), 1]}>
          <tubeGeometry args={[cv, 40, 0.16, 16, false]} />
          {glass(["#DCEBFF", "#FFE9E6", "#DCEBFF"][i])}
        </mesh>
      ))}
      {/* signal pipe */}
      <mesh scale={[g(7), 1, 1]}>
        <tubeGeometry args={[signal, 40, 0.22, 16, false]} />
        <meshPhysicalMaterial color="#C9F28A" transmission={0.85} roughness={0.08} thickness={0.5} emissive="#A7FF3F" emissiveIntensity={0.25 + 0.15 * Math.sin(t * 4)} />
      </mesh>
      {/* CRM base */}
      <mesh position={[0, -5.6, 0]} scale={[g(8), g(8), g(8)]}>
        <boxGeometry args={[5.4, 0.5, 1.2]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.15} clearcoat={1} />
      </mesh>
      <Particles level={level} t={t} />
      {/* travelling pulses on the active pipes */}
      {level >= 6
        ? pipeCurves.map((cv, i) => {
            const p = cv.getPoint(((t * 0.6 + i * 0.33) % 1) as number);
            return (
              <mesh key={`p${i}`} position={p}>
                <sphereGeometry args={[0.11, 12, 12]} />
                <meshStandardMaterial color={C.lime} emissive={C.lime} emissiveIntensity={1} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

const Stage3D: React.FC<{ level: number; grow: number; cam: [number, number, number]; look: [number, number, number] }> = ({ level, grow, cam, look }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: 38, position: cam, near: 0.1, far: 200 }} style={{ background: C.cream }}>
      <Rig pos={cam} look={look} />
      <Machine level={level} grow={grow} />
    </ThreeCanvas>
  );
};

// ------------------------------------------------------------------ HUD
const Chip: React.FC<{ step: number; label: string }> = ({ step, label }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", justifyContent: "center", ...enter(f, 2, 10) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "white", border: "1px solid #E4E0D5", borderRadius: 999, padding: "8px 18px 8px 8px", boxShadow: "0 12px 30px rgba(10,10,10,0.08)" }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", background: C.charcoal, color: C.lime, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 18 }}>{String(step).padStart(2, "0")}</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: C.charcoal }}>{label}</span>
      </div>
    </div>
  );
};
const Logo: React.FC<{ src: string; h: number; style?: React.CSSProperties }> = ({ src, h, style }) => <Img src={staticFile(`media/logos/${src}`)} style={{ height: h, width: "auto", ...style }} />;
const Tile: React.FC<{ src: string; at: number; x: number; y: number; size?: number; label?: string }> = ({ src, at, x, y, size = 120, label }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, ...enter(f, at, 40) }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.26, background: "white", border: "1px solid #E4E0D5", boxShadow: "0 18px 40px rgba(10,10,10,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Logo src={src} h={size * 0.5} style={{ maxWidth: size * 0.72, objectFit: "contain" }} />
      </div>
      {label ? <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: "#55534C", marginTop: 8 }}>{label}</div> : null}
    </div>
  );
};
const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({ children, style, dark }) => (
  <div style={{ position: "absolute", borderRadius: 24, background: dark ? "#111311" : "white", border: dark ? "1px solid #2A2D2A" : "1px solid #E4E0D5", boxShadow: "0 30px 70px rgba(10,10,10,0.16)", overflow: "hidden", ...style }}>{children}</div>
);
const typed = (f: number, s: string, at: number, cps = 1.8) => s.slice(0, Math.max(0, Math.floor((f - at) * cps)));

// ------------------------------------------------------------------ beats
const HookBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const stamp = 10;
  const shatter = c("build", 34);
  const sh = interpolate(f, [shatter, shatter + 16], [0, 1], { ...clamp, easing: EASE_IO });
  const grow = interpolate(f, [shatter + 6, shatter + 40], [0, 1], clamp);
  const s = sp(f, stamp, { damping: 8, stiffness: 260 });
  return (
    <>
      <Stage3D level={sh > 0.5 ? 8 : 0} grow={1} cam={[0, -0.4, interpolate(grow, [0, 1], [26, 17])]} look={[0, -0.4, 0]} />
      {sh < 1 ? (
        <div style={{ position: "absolute", left: 140, right: 140, top: 640, opacity: 1 - sh }}>
          {new Array(12).fill(0).map((_, i) => {
            const r1 = random(`h${i}`);
            const r2 = random(`k${i}`);
            const col = i % 4;
            const row = Math.floor(i / 4);
            return (
              <div key={i} style={{ position: "absolute", left: col * 200, top: row * 160, width: 200, height: 160, overflow: "hidden", translate: `${(r1 - 0.5) * 900 * sh}px ${(r2 - 0.6) * 900 * sh}px`, rotate: `${(r1 - 0.5) * 120 * sh}deg` }}>
                <div style={{ position: "absolute", left: -col * 200, top: -row * 160, width: 800, height: 480, background: "white", border: "1px solid #E4E0D5", borderRadius: 28, padding: "34px 40px", boxShadow: "0 30px 70px rgba(10,10,10,0.14)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Logo src="linkedin.svg" h={56} />
                    <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: "#55534C" }}>Job post · 2 days ago</div>
                  </div>
                  <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 52, color: C.charcoal, marginTop: 20, lineHeight: 1.1 }}>Hiring: Sales Development Rep</div>
                  <div style={{ fontFamily: BODY, fontSize: 26, color: "#77756D", marginTop: 14 }}>Full time · Cold calls, emails, CRM updates</div>
                  <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: "#0A66C2", marginTop: 26 }}>142 applicants</div>
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 220, top: 150, fontFamily: MONO, fontWeight: 800, fontSize: 84, letterSpacing: 8, color: RED, border: `8px solid ${RED}`, borderRadius: 18, padding: "6px 28px", rotate: "-10deg", scale: String(f < stamp ? 0 : 2.2 - 1.2 * s), opacity: (f < stamp ? 0 : 1) * (1 - sh), background: "rgba(246,244,237,0.85)" }}>CLOSED</div>
        </div>
      ) : null}
      {sh > 0.4 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", ...enter(f, shatter + 10, 30) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: "white", borderRadius: 999, padding: "12px 26px", boxShadow: "0 0 0 6px rgba(217,119,87,0.12), 0 24px 60px rgba(217,119,87,0.25)" }}>
            <Logo src="claude.svg" h={56} />
            <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: C.charcoal }}>Claude Code</span>
          </div>
        </div>
      ) : null}
    </>
  );
};

const ToolsBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const cmds = [
    { cue: "apollo", logo: "apollo.svg", name: "apollo", x: 290 },
    { cue: "gmail", logo: "gmail.svg", name: "gmail", x: 540 },
    { cue: "hubspot", logo: "hubspot.svg", name: "hubspot", x: 790 },
  ];
  const grow = interpolate(f, [0, 20], [0, 1], clamp);
  return (
    <>
      <Stage3D level={1} grow={grow} cam={[0, 2.2, 12]} look={[0, 2.4, 0]} />
      <Chip step={1} label="TOOLS" />
      <Panel dark style={{ left: 90, right: 90, top: 1060, padding: "20px 24px" }}>
        <div style={{ fontFamily: MONO, fontSize: 16, color: C.grey }}>~/sales · claude code</div>
        {cmds.map((m) => {
          const at = c(m.cue, 30);
          const line = `claude mcp add ${m.name} …`;
          return (
            <div key={m.name} style={{ fontFamily: MONO, fontSize: 26, color: C.cream, marginTop: 10, opacity: f >= at - 8 ? 1 : 0 }}>
              <span style={{ color: C.lime }}>$</span> {typed(f, line, at - 8, 2.4)}
              {f >= at + 12 ? <span style={{ color: C.lime }}> ✓ connected</span> : null}
            </div>
          );
        })}
      </Panel>
      {cmds.map((m) => (
        <Tile key={m.name} src={m.logo} at={c(m.cue, 30) + 6} x={m.x} y={520} size={150} />
      ))}
    </>
  );
};

const IcpBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const rows = [
    { k: "industry", v: "D2C brands, consumer goods", cue: "industry" },
    { k: "company size", v: "11 to 200 people", cue: "size" },
    { k: "region", v: "India, US, UK", cue: "region" },
    { k: "buyers", v: "Head of Growth, CMO, Founder", cue: "titles" },
  ];
  const slot = c("titles", 120) + 30;
  const fly = interpolate(f, [slot, slot + 16], [0, 1], { ...clamp, easing: EASE_IO });
  return (
    <>
      <Stage3D level={2} grow={interpolate(f, [slot + 10, slot + 30], [0, 1], clamp)} cam={[0, 2.6, 11]} look={[0, 2.8, 0]} />
      <Chip step={2} label="ICP" />
      <Panel style={{ left: 120, right: 120, top: 900, padding: "22px 26px", translate: `0 ${-fly * 500}px`, scale: String(1 - fly * 0.7), opacity: 1 - fly * 0.9 }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: "#77756D" }}>📄 ICP.md</div>
        {rows.map((r) => (
          <div key={r.k} style={{ display: "flex", gap: 12, fontFamily: MONO, fontSize: 25, marginTop: 12, opacity: f >= c(r.cue, 30) ? 1 : 0.12 }}>
            <span style={{ color: INK, minWidth: 190 }}>{r.k}:</span>
            <span style={{ color: C.charcoal }}>{r.v}</span>
          </div>
        ))}
      </Panel>
    </>
  );
};

const SourceBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const at = c("pull", 20);
  const n = Math.round(interpolate(f, [at, at + 60], [0, 2400], { ...clamp, easing: EASE }));
  return (
    <>
      <Stage3D level={3} grow={interpolate(f, [0, 24], [0, 1], clamp)} cam={[0, 1.6, 14]} look={[0, 1.4, 0]} />
      <Chip step={3} label="SOURCE" />
      <Panel style={{ left: 300, right: 300, top: 1170, padding: "16px 20px", textAlign: "center", ...enter(f, at) }}>
        <div style={{ fontFamily: MONO, fontSize: 16, color: "#77756D" }}>COMPANIES FOUND · EXAMPLE</div>
        <div style={{ fontFamily: SERIF, fontSize: 84, lineHeight: 1, color: C.charcoal, fontVariantNumeric: "tabular-nums" }}>{n.toLocaleString("en-IN")}</div>
        <div style={{ fontFamily: MONO, fontSize: 16, color: INK }}>duplicates removed ✓</div>
      </Panel>
    </>
  );
};

const QualifyBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const checks = [
    { t: "Website", cue: "website" },
    { t: "Hiring", cue: "hiring" },
    { t: "Tech stack", cue: "stack" },
  ];
  const score = c("score", 80);
  const v = Math.round(interpolate(f, [score, score + 20], [0, 86], clamp));
  return (
    <>
      <Stage3D level={4} grow={interpolate(f, [0, 22], [0, 1], clamp)} cam={[1.2, 0.6, 11]} look={[0, 0.5, 0]} />
      <Chip step={4} label="QUALIFY" />
      <Panel style={{ left: 100, top: 1110, width: 480, padding: "18px 22px" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 28, color: C.charcoal }}>Northwind Goods</div>
        {checks.map((k) => (
          <div key={k.t} style={{ fontFamily: BODY, fontWeight: 600, fontSize: 22, color: "#3A3936", marginTop: 8, opacity: f >= c(k.cue, 30) ? 1 : 0.15 }}>
            <span style={{ color: INK }}>✓</span> {k.t}
          </div>
        ))}
      </Panel>
      <Panel style={{ right: 100, top: 1110, width: 300, padding: "18px 22px", textAlign: "center", ...enter(f, score - 6) }}>
        <div style={{ fontFamily: MONO, fontSize: 15, color: "#77756D" }}>FIT SCORE</div>
        <div style={{ fontFamily: SERIF, fontSize: 90, lineHeight: 1, color: INK }}>{v}</div>
        <div style={{ fontFamily: MONO, fontSize: 15, color: RED, opacity: f >= c("parked", 140) ? 1 : 0 }}>low scores → parked</div>
      </Panel>
    </>
  );
};

const PeopleBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const people = [
    { n: "Riya Mehta", r: "Head of Growth", e: "riya@northwind.co", ok: true },
    { n: "Arjun Rao", r: "CMO", e: "arjun@lumenskin.in", ok: true },
    { n: "Sara Khan", r: "Founder", e: "", ok: false },
  ];
  const vAt = c("verify", 60);
  return (
    <>
      <Stage3D level={5} grow={interpolate(f, [0, 22], [0, 1], clamp)} cam={[-1, -0.6, 11]} look={[0, -0.8, 0]} />
      <Chip step={5} label="PEOPLE" />
      <Panel style={{ left: 100, right: 100, top: 1060, padding: "14px 20px" }}>
        {people.map((p, i) => (
          <div key={p.n} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderTop: i ? "1px solid #EEEBE3" : undefined, ...enter(f, 8 + i * 8, 10) }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: ["#C9F28A", "#E8FFB8", "#F2D4D4"][i], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, color: C.charcoal }}>{p.n[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: C.charcoal }}>{p.n}</div>
              <div style={{ fontFamily: BODY, fontSize: 17, color: "#77756D" }}>{p.r}</div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 17, color: p.ok ? INK : "#0A66C2", opacity: f >= vAt + i * 6 ? 1 : 0 }}>{p.ok ? `✓ ${p.e}` : "LinkedIn only"}</div>
          </div>
        ))}
      </Panel>
    </>
  );
};

const ChannelsBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const adAt = c("ads", 30);
  const mailAt = c("email", 110);
  const postAt = c("post", 170);
  return (
    <>
      <Stage3D level={6} grow={interpolate(f, [0, 24], [0, 1], clamp)} cam={[0, -2.6, 12.5]} look={[0, -2.8, 0]} />
      <Chip step={6} label="CHANNELS" />
      <Panel style={{ left: 70, top: 1120, width: 300, padding: "14px 16px", ...enter(f, adAt) }}>
        <div style={{ fontFamily: MONO, fontSize: 14, color: "#77756D" }}>AD AUDIENCE · UPLOADED</div>
        <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center" }}>
          <Logo src="linkedin.svg" h={40} />
          <Logo src="google-ads.svg" h={40} />
          <Logo src="meta.svg" h={30} />
        </div>
      </Panel>
      <Panel style={{ left: 390, top: 1120, width: 300, padding: "14px 16px", ...enter(f, mailAt) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo src="gmail.svg" h={32} />
          <span style={{ fontFamily: MONO, fontSize: 14, color: "#77756D" }}>DRAFT</span>
        </div>
        <div style={{ fontFamily: BODY, fontSize: 17, color: C.charcoal, marginTop: 8, lineHeight: 1.3 }}>{typed(f, "Hi Riya, saw Northwind is launching a new range…", mailAt + 4, 1.6)}</div>
      </Panel>
      <Panel style={{ right: 70, top: 1120, width: 300, padding: "14px 16px", ...enter(f, postAt) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo src="linkedin.svg" h={32} />
          <span style={{ fontFamily: MONO, fontSize: 14, color: "#77756D" }}>WEEKLY POST</span>
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 17, color: C.charcoal, marginTop: 8 }}>3 emails every D2C brand should send…</div>
      </Panel>
    </>
  );
};

const SignalBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const sigs = [
    { t: "Riya replied", cue: "replied", c: INK },
    { t: "Arjun clicked your ad", cue: "clicked", c: "#1A73E8" },
    { t: "Sara viewed your profile", cue: "viewed", c: "#0A66C2" },
  ];
  const draft = c("follow", 120);
  return (
    <>
      <Stage3D level={7} grow={interpolate(f, [0, 22], [0, 1], clamp)} cam={[0, -3.6, 11]} look={[0, -4.0, 0]} />
      <Chip step={7} label="SIGNALS" />
      <div style={{ position: "absolute", left: 100, right: 100, top: 1040, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {sigs.map((s) => (
          <div key={s.t} style={{ fontFamily: BODY, fontWeight: 700, fontSize: 21, color: "white", background: s.c, borderRadius: 999, padding: "8px 16px", ...enter(f, c(s.cue, 30), 14) }}>⚡ {s.t}</div>
        ))}
      </div>
      <Panel style={{ left: 120, right: 120, top: 1160, padding: "16px 20px", ...enter(f, draft) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo src="claude.svg" h={28} />
          <span style={{ fontFamily: MONO, fontSize: 15, color: "#77756D" }}>FOLLOW-UP DRAFT</span>
        </div>
        <div style={{ fontFamily: BODY, fontSize: 21, color: C.charcoal, marginTop: 8 }}>{typed(f, "Arjun, saw you checked out our post on repeat orders. Worth a quick chat?", draft + 4, 1.7)}</div>
      </Panel>
    </>
  );
};

const CrmBeat: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const f = useCurrentFrame();
  const cols = ["New lead", "Replied", "Call booked"];
  const appr = c("approve", 110);
  const k = interpolate(f, [16, 70], [0, 1], { ...clamp, easing: EASE });
  return (
    <>
      <Stage3D level={8} grow={interpolate(f, [0, 22], [0, 1], clamp)} cam={[0, -1.2, interpolate(f, [0, 150], [16, 19], clamp)]} look={[0, -1.2, 0]} />
      <Chip step={8} label="CRM" />
      <Panel style={{ left: 90, right: 90, top: 1030, padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo src="hubspot.svg" h={30} />
          <span style={{ fontFamily: MONO, fontSize: 15, color: "#77756D", marginLeft: "auto" }}>PIPELINE</span>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {cols.map((cl, i) => (
            <div key={cl} style={{ flex: 1, background: "#F6F4ED", borderRadius: 12, padding: "8px 10px", minHeight: 90 }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 16, color: "#55534C" }}>{cl}</div>
              {k > i * 0.33 ? <div style={{ marginTop: 6, background: "white", borderRadius: 8, padding: "6px 8px", fontFamily: BODY, fontWeight: 600, fontSize: 15, color: i === 2 ? INK : C.charcoal, border: i === 2 ? `2px solid ${C.lime}` : "1px solid #E4E0D5" }}>{["Northwind Goods", "Riya replied", "Call · Thu 4 PM ✓"][i]}</div> : null}
            </div>
          ))}
        </div>
      </Panel>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1270, display: "flex", justifyContent: "center", ...enter(f, appr - 10) }}>
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 24, borderRadius: 14, padding: "12px 26px", background: f >= appr ? C.lime : C.charcoal, color: f >= appr ? C.charcoal : C.cream, scale: Math.abs(f - appr) < 4 ? "0.95" : "1" }}>{f >= appr ? "✓ Approved by you" : "Approve send"}</div>
      </div>
    </>
  );
};

const FinaleBeat: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const orbit = interpolate(f, [0, D], [-0.5, 0.5], clamp);
  return (
    <>
      <Stage3D level={8} grow={1} cam={[Math.sin(orbit) * 18, -0.6, Math.cos(orbit) * 18]} look={[0, -0.8, 0]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 16, ...enter(f, 6) }}>
        {["claude.svg", "apollo.svg", "gmail.svg", "hubspot.svg", "linkedin.svg"].map((l) => (
          <div key={l} style={{ width: 84, height: 84, borderRadius: 22, background: "white", border: "1px solid #E4E0D5", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(10,10,10,0.1)" }}>
            <Logo src={l} h={l === "hubspot.svg" ? 22 : 44} style={{ maxWidth: 66, objectFit: "contain" }} />
          </div>
        ))}
      </div>
    </>
  );
};

export const SalesMachineScene: React.FC<SceneProps> = ({ data }) => {
  const c = cueOf(data);
  const b = data.beat as string;
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      {b === "hook" ? <HookBeat c={c} /> : null}
      {b === "tools" ? <ToolsBeat c={c} /> : null}
      {b === "icp" ? <IcpBeat c={c} /> : null}
      {b === "source" ? <SourceBeat c={c} /> : null}
      {b === "qualify" ? <QualifyBeat c={c} /> : null}
      {b === "people" ? <PeopleBeat c={c} /> : null}
      {b === "channels" ? <ChannelsBeat c={c} /> : null}
      {b === "signals" ? <SignalBeat c={c} /> : null}
      {b === "crm" ? <CrmBeat c={c} /> : null}
      {b === "finale" ? <FinaleBeat /> : null}
    </AbsoluteFill>
  );
};

export const SALES_MACHINE_SCENES: Record<string, React.FC<SceneProps>> = { sMachine: SalesMachineScene };
