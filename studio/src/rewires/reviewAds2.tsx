// "Google is writing part of your ads" reel, v7 (script v2). Every beat has its own visual system; the phone appears
// once. Google surfaces use Google's own font and colours; our annotations use the brand type. The top 380 px are
// reserved for the headline captions: nothing is placed there.
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadGoogleSans } from "@remotion/google-fonts/GoogleSans";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { BODY, C, clamp, EASE, EASE_IO, MONO } from "./brand";
import { Stage3D } from "../three";
import type { SceneProps } from "./scenes";

const { fontFamily: GSANS } = loadGoogleSans("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
const { fontFamily: ROBOTO } = loadRoboto("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

// Google's UI colours (only inside the recreated Google surfaces).
const G = { blue: "#4285F4", red: "#EA4335", yellow: "#FBBC05", green: "#34A853", link: "#1558D6", ink: "#202124", grey: "#4D5156", line: "#DADCE0", star: "#FBBC04", soft: "#F1F3F4" };
const GEMINI = "linear-gradient(90deg, #4285F4, #9B72CB 45%, #D96570 75%, #4285F4)";
const SETTLE = Easing.bezier(0.2, 1.1, 0.32, 1);
const ez = (f: number, a: number, b: number, e = EASE) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Beat = React.FC<{ f: number; c: (n: string, fb: number) => number; D: number }>;

// ------------------------------------------------------------------ shared Google pieces
const Stars: React.FC<{ n: number; size: number }> = ({ n, size }) => (
  <span style={{ display: "inline-flex", gap: size * 0.08, verticalAlign: "middle" }}>
    {[0, 1, 2, 3, 4].map((k) => (
      <svg key={k} width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.3l-5.8 3.1 1.2-6.5L2.6 9.4l6.5-.8z" fill={k < n ? G.star : "#DADCE0"} />
      </svg>
    ))}
  </span>
);

const LOVE = "fresh bread, friendly staff and warm sourdough.";
const LOVE_NEW = "sourdough still warm at 8 am, friendly staff.";

/** The illustrative ad, laid out like Google's mobile Search ad with a review summary. Width 940. */
const Ad: React.FC<{ love?: string; loveP?: number; shimmer?: number; lineRef?: (el: React.ReactNode) => React.ReactNode; dimRest?: number; lineLift?: number; lineRing?: number; compact?: boolean }> = ({ love = LOVE, loveP = 1, shimmer = 0, dimRest = 0, lineLift = 0, lineRing = 0, compact }) => {
  const rest: React.CSSProperties = { filter: dimRest > 0 ? `blur(${dimRest * 6}px)` : undefined, opacity: 1 - dimRest * 0.55 };
  const shown = love.slice(0, Math.round(love.length * loveP));
  return (
    <div style={{ width: 940, background: "white", borderRadius: 34, boxShadow: "0 50px 130px rgba(30,28,20,0.20), 0 10px 26px rgba(30,28,20,0.10)", padding: compact ? "30px 40px" : "40px 46px", fontFamily: ROBOTO, color: G.ink }}>
      <div style={rest}>
        <div style={{ fontFamily: GSANS, fontWeight: 700, fontSize: 36 }}>Sponsored</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24 }}>
          <div style={{ width: 58, height: 58, borderRadius: "50%", border: `1px solid ${G.line}`, background: "#FFF7EC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GSANS, fontWeight: 700, fontSize: 26, color: "#B26A00" }}>Y</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 29 }}>Your Bakery</div>
            <div style={{ fontSize: 25, color: G.grey }}>https://www.yourbakery.in</div>
          </div>
          <div style={{ fontSize: 40, color: G.grey, lineHeight: 0.5 }}>⋮</div>
        </div>
        <div style={{ marginTop: 22, fontFamily: GSANS, fontSize: 44, lineHeight: 1.22, color: G.link }}>Your Bakery | Fresh Sourdough Baked Daily</div>
        {compact ? null : <div style={{ marginTop: 14, fontSize: 29, lineHeight: 1.42, color: G.grey }}>Hand-shaped loaves, cakes and filter coffee. Order online or visit our café today.</div>}
      </div>
      <div style={{ position: "relative", marginTop: 20, padding: "12px 16px", margin: "16px -16px 0", borderRadius: 16, background: "white", transform: `translateY(${-lineLift * 26}px) scale(${1 + lineLift * 0.07})`, boxShadow: `${lineLift > 0 ? `0 ${30 * lineLift}px ${70 * lineLift}px rgba(30,28,20,${0.22 * lineLift})` : ""}${lineLift > 0 && lineRing > 0 ? ", " : ""}${lineRing > 0 ? `0 0 0 ${3 * lineRing}px ${C.lime}` : ""}` || undefined, minHeight: 100 }}>
        <div style={{ fontSize: 31, lineHeight: 1.42, color: G.grey }}>
          <b style={{ color: G.ink, fontWeight: 700 }}>Customers love: </b>
          <span style={shimmer > 0 ? { backgroundImage: GEMINI, backgroundSize: "300% 100%", backgroundPosition: `${(1 - shimmer) * 100}% 0`, WebkitBackgroundClip: "text", color: "transparent" } : undefined}>{shown}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 24, color: G.grey }}>
          AI-generated from user reviews across the web. <span style={{ textDecoration: "underline" }}>Learn more</span>
        </div>
      </div>
      {compact ? null : (
        <div style={{ display: "flex", gap: 14, marginTop: 24, ...rest }}>
          {["Order Online", "Today's Bakes", "Café"].map((t) => (
            <div key={t} style={{ border: `1px solid ${G.line}`, borderRadius: 40, padding: "14px 26px", fontFamily: GSANS, fontSize: 26, color: G.link, whiteSpace: "nowrap" }}>{t}</div>
          ))}
        </div>
      )}
    </div>
  );
};

type Review = { name: string; init: string; col: string; meta: string; n: number; when: string; text: string; key?: string };
const ReviewCard: React.FC<{ r: Review; w?: number; dark?: boolean; hl?: number; style?: React.CSSProperties }> = ({ r, w = 560, dark, hl = 0, style }) => {
  const parts = r.key ? r.text.split(r.key) : [r.text];
  return (
    <div style={{ width: w, background: dark ? "#1E1E1E" : "white", borderRadius: 26, padding: "24px 28px", boxShadow: dark ? "0 30px 80px rgba(0,0,0,0.55)" : "0 30px 80px rgba(30,28,20,0.16), 0 6px 16px rgba(30,28,20,0.08)", fontFamily: ROBOTO, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: r.col, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GSANS, fontWeight: 500, fontSize: 25 }}>{r.init}</div>
        <div>
          <div style={{ fontFamily: GSANS, fontWeight: 500, fontSize: 27, color: dark ? "#E8EAED" : G.ink }}>{r.name}</div>
          <div style={{ fontSize: 21, color: dark ? "#9AA0A6" : G.grey }}>{r.meta}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <Stars n={r.n} size={26} />
        <span style={{ fontSize: 21, color: dark ? "#9AA0A6" : G.grey }}>{r.when}</span>
      </div>
      <div style={{ marginTop: 10, fontSize: 28, lineHeight: 1.4, color: dark ? "#E8EAED" : G.ink }}>
        {parts[0]}
        {r.key ? <span style={{ fontWeight: 700, boxShadow: `inset 0 -${Math.round(34 * hl)}px 0 rgba(251,188,4,0.5)` }}>{r.key}</span> : null}
        {parts[1]}
      </div>
    </div>
  );
};

const REVIEWS: Review[] = [
  { name: "Priya S.", init: "P", col: "#1E8E3E", meta: "Local Guide · 41 reviews", n: 5, when: "2 weeks ago", text: "The fresh bread here is unreal.", key: "fresh bread" },
  { name: "Rahul M.", init: "R", col: "#1A73E8", meta: "12 reviews", n: 5, when: "a month ago", text: "Such friendly staff, my kids love it.", key: "friendly staff" },
  { name: "Anita K.", init: "A", col: "#E37400", meta: "Local Guide · 88 reviews", n: 4, when: "3 weeks ago", text: "Get the warm sourdough early.", key: "warm sourdough" },
  { name: "Vikram T.", init: "V", col: "#D93025", meta: "6 reviews", n: 1, when: "a week ago", text: "Waited 40 minutes for a coffee." },
  { name: "Sana I.", init: "S", col: "#9334E6", meta: "Local Guide · 19 reviews", n: 5, when: "4 days ago", text: "Best croissants in the city." },
  { name: "Neha D.", init: "N", col: "#C5221F", meta: "3 reviews", n: 2, when: "2 months ago", text: "Cake was dry this time." },
  { name: "Arjun P.", init: "A", col: "#0B8043", meta: "27 reviews", n: 5, when: "a month ago", text: "Lovely café, great filter coffee." },
  { name: "Meera J.", init: "M", col: "#F29900", meta: "Local Guide · 64 reviews", n: 4, when: "2 weeks ago", text: "Cosy spot, quick service." },
];

/** Brand annotation pill. */
const Pill: React.FC<{ p: number; children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({ p, children, dark, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 26px", borderRadius: 44, background: dark ? C.cream : C.charcoal, color: dark ? C.charcoal : C.cream, fontFamily: BODY, fontWeight: 600, fontSize: 30, opacity: p, translate: `0 ${(1 - p) * 18}px`, boxShadow: "0 18px 44px rgba(0,0,0,0.22)", whiteSpace: "nowrap", ...style }}>{children}</div>
);

const Stage: React.FC<{ dark?: boolean; children: React.ReactNode }> = ({ dark, children }) => (
  <AbsoluteFill style={{ background: dark ? C.charcoal : C.cream, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: dark ? "radial-gradient(ellipse 60% 40% at 50% 52%, rgba(167,255,63,0.06), rgba(10,10,10,0) 70%)" : "radial-gradient(ellipse 70% 45% at 50% 55%, rgba(255,255,255,0.95), rgba(246,244,237,0) 72%)" }} />
    {children}
  </AbsoluteFill>
);

// ------------------------------------------------------------------ 1. hook: the line lifts out of the ad
const Hook: Beat = ({ f, c }) => {
  const line = c("line", 16);
  const love = c("love", 79);
  const bakery = c("bakery", 131);
  const didnt = c("didnt", 143);
  const enter = ez(f, 0, 22, SETTLE);
  const lift = ez(f, love - 6, love + 14, SETTLE);
  const tag = ez(f, bakery - 4, bakery + 10);
  const strike = ez(f, didnt, didnt + 12, EASE_IO);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 70, top: 560, transform: `perspective(2200px) rotateX(${(1 - enter) * 14}deg) translateY(${(1 - enter) * 140}px) scale(${0.94 + 0.06 * enter + 0.012 * Math.sin(f / 40)})`, opacity: enter }}>
        <Ad dimRest={lift} lineLift={lift} lineRing={ez(f, line, line + 12) * (1 - lift * 0.4)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1450, display: "flex", justifyContent: "center" }}>
        <Pill p={tag}>
          <span>Written by</span>
          <span style={{ position: "relative" }}>
            Your Bakery
            <span style={{ position: "absolute", left: -4, top: "52%", height: 4, width: `${strike * 104}%`, background: C.lime, borderRadius: 2 }} />
          </span>
          <span style={{ opacity: strike, fontFamily: MONO, color: C.lime }}>?</span>
        </Pill>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ 2. real 3D Google G
const G_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.230 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.850-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

const GoogleG3D: React.FC<{ rotY: number; rotX: number; scale: number; y: number; assemble: number }> = ({ rotY, rotX, scale, y, assemble }) => {
  const pieces = useMemo(() => {
    const data = new SVGLoader().parse(G_SVG);
    return data.paths.map((p, i) => {
      const shapes = SVGLoader.createShapes(p);
      const geo = new THREE.ExtrudeGeometry(shapes, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.22, bevelSegments: 6, curveSegments: 24 });
      geo.translate(-12, -12, -0.8);
      const color = ((p.userData?.style as { fill?: string } | undefined)?.fill) ?? "#888888";
      const mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.3 });
      return { geo, mat, i };
    });
  }, []);
  return (
    <group position={[0, y, 0]} rotation={[rotX, rotY, 0]} scale={[scale, -scale, scale]}>
      {pieces.map(({ geo, mat, i }) => {
        const a = Math.max(0, Math.min(1, assemble * 1.6 - i * 0.2));
        const e = 1 - Math.pow(1 - a, 3);
        return <mesh key={i} geometry={geo} material={mat} position={[0, 0, (1 - e) * -18]} />;
      })}
    </group>
  );
};

const Gee: Beat = ({ f, c, D }) => {
  const ai = c("ai", 16);
  const spin = ez(f, 0, 30, SETTLE);
  const rotY = lerp(-1.25, -0.22, spin) + Math.sin(f / 30) * 0.03;
  const shimmer = ez(f, ai - 8, D);
  return (
    <Stage>
      <Stage3D mode="light" transparent pose={{ position: [0, 0, 9.5], target: [0, 0.6, 0], fov: 30 }} post={null} envRotation={-0.6 + f * 0.01}>
        <GoogleG3D rotY={rotY} rotX={0.12} scale={0.07} y={0.95} assemble={ez(f, 0, 26)} />
      </Stage3D>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1250, background: "white", borderRadius: 26, padding: "26px 32px", boxShadow: "0 30px 80px rgba(30,28,20,0.16)", fontFamily: ROBOTO, fontSize: 32, lineHeight: 1.4, color: G.grey, opacity: ez(f, 2, 12) }}>
        <b style={{ color: G.ink }}>Customers love: </b>
        <span style={{ backgroundImage: GEMINI, backgroundSize: "300% 100%", backgroundPosition: `${(1 - shimmer) * 100}% 0`, WebkitBackgroundClip: "text", color: "transparent" }}>{LOVE}</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1450, display: "flex", justifyContent: "center" }}>
        <Pill p={ez(f, ai - 2, ai + 10)} style={{ marginTop: 40 }}>
          Written by
          <Img src={staticFile("media/logos/google-g.svg")} style={{ height: 34 }} />
          Google&apos;s AI
        </Pill>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ 3. proof: the real help page
const HELP_W = 900;
const Proof: Beat = ({ f, c }) => {
  const confirms = c("confirms", 39);
  const india = c("india", 81);
  const flags = [
    { k: "india", fl: "flag-in.svg", nm: "India", fb: 81 },
    { k: "us", fl: "flag-us.svg", nm: "US", fb: 107 },
    { k: "uk", fl: "flag-uk.svg", nm: "UK", fb: 134 },
    { k: "au", fl: "flag-au.svg", nm: "Australia", fb: 155 },
  ];
  const enter = ez(f, 0, 24, SETTLE);
  // scroll positions in screenshot px (1520 wide): intro sentence ~ y 560, eligibility ~ y 2554
  const scroll = interpolate(f, [0, confirms - 6, confirms + 10, india - 18, india + 2], [380, 380, 420, 420, 2330], { ...clamp, easing: EASE_IO });
  const k = HELP_W / 1520;
  const viewH = 560;
  const mark1 = ez(f, confirms, confirms + 22, EASE_IO) * (1 - ez(f, india - 18, india - 8));
  const mark2 = ez(f, india + 4, india + 22, EASE_IO);
  const push = 1 + 0.05 * ez(f, confirms - 4, confirms + 30) + 0.04 * ez(f, india, india + 30);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 90, top: 470, transform: `perspective(2400px) rotateX(${8 - 4 * enter}deg) rotateY(${-16 + 8 * enter}deg) scale(${(0.9 + 0.1 * enter) * push}) translateY(${(1 - enter) * 120}px)`, transformOrigin: "50% 40%", opacity: enter }}>
        <div style={{ width: HELP_W, borderRadius: 26, overflow: "hidden", background: "white", boxShadow: "0 60px 140px rgba(30,28,20,0.24), 0 10px 26px rgba(30,28,20,0.1)" }}>
          <div style={{ height: 70, background: "#F1F3F4", display: "flex", alignItems: "center", gap: 10, padding: "0 22px" }}>
            {["#EA4335", "#FBBC05", "#34A853"].map((cc) => (
              <div key={cc} style={{ width: 15, height: 15, borderRadius: "50%", background: cc, opacity: 0.85 }} />
            ))}
            <div style={{ flex: 1, marginLeft: 14, height: 44, borderRadius: 22, background: "white", display: "flex", alignItems: "center", padding: "0 18px", fontFamily: ROBOTO, fontSize: 22, color: G.grey }}>support.google.com/google-ads/answer/18760807</div>
          </div>
          <div style={{ height: viewH, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: -scroll * k, width: HELP_W }}>
              <Img src={staticFile("media/review-ads/help-page.png")} style={{ width: HELP_W, display: "block" }} />
              <div style={{ position: "absolute", left: 28 * k, top: 560 * k, width: 1440 * k * mark1, height: 120 * k, background: "rgba(167,255,63,0.5)", mixBlendMode: "multiply", borderRadius: 6 }} />
              <div style={{ position: "absolute", left: 60 * k, top: 2548 * k, width: 760 * k * mark2, height: 50 * k, background: "rgba(167,255,63,0.55)", mixBlendMode: "multiply", borderRadius: 6 }} />
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, display: "flex", justifyContent: "center", gap: 18, perspective: 1600 }}>
        {flags.map((fl, i) => {
          const at = c(fl.k, fl.fb);
          const p = ez(f, at - 6, at + 14, SETTLE);
          return (
            <div key={fl.k} style={{ width: 210, padding: "18px 0 16px", borderRadius: 26, background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: `0 26px 60px rgba(30,28,20,0.16)${i === 0 ? `, 0 0 0 ${3 * p}px ${C.lime}` : ""}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: p, transform: `rotateY(${(1 - p) * 80}deg) translateY(${(1 - p) * 40}px)` }}>
              <div style={{ width: 120, height: 80, borderRadius: 10, overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 8px 18px rgba(0,0,0,0.12)" }}>
                <Img src={staticFile(`media/logos/${fl.fl}`)} style={{ width: 120, height: 80, objectFit: "cover" }} />
              </div>
              <div style={{ fontFamily: GSANS, fontWeight: 500, fontSize: 30, color: G.ink }}>{fl.nm}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ 4. how: fly over a wall of reviews, phrases stream into one line
const How: Beat = ({ f, c }) => {
  const reads = c("reads", 69);
  const web = c("web", 136);
  const writes = c("writes", 164);
  const fly = interpolate(f, [0, web + 10], [0, 1], clamp);
  const hl = ez(f, reads + 6, reads + 30, EASE_IO);
  const scan = interpolate(f, [reads - 4, web - 6], [0, 1], clamp);
  const adIn = ez(f, web - 16, web + 8, SETTLE);
  const loveP = ez(f, writes - 4, writes + 34, (t) => t);
  // wall: 2 columns x 4 rows of cards on a plane tilted back
  return (
    <Stage>
      <AbsoluteFill style={{ perspective: 1500, perspectiveOrigin: "50% 30%", clipPath: "inset(400px 0 0 0)", WebkitMaskImage: "linear-gradient(180deg, transparent 400px, black 520px)", maskImage: "linear-gradient(180deg, transparent 400px, black 520px)" }}>
        <div style={{ position: "absolute", left: 540 - 500, top: 470, width: 1000, transformOrigin: "50% 0%", transform: `rotateX(${48 - 6 * fly}deg) translateY(${-260 * fly}px) translateZ(${-120 + 80 * fly}px)`, opacity: 1 - ez(f, writes + 8, writes + 24) * 0.5 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
            {REVIEWS.map((r, i) => (
              <ReviewCard key={i} r={r} w={487} hl={r.key ? hl : 0} style={{ opacity: ez(f, i * 2, i * 2 + 14) * (r.key ? 1 : 1 - hl * 0.35) }} />
            ))}
          </div>
          {scan > 0 && scan < 1 ? <div style={{ position: "absolute", left: -20, right: -20, top: scan * 1250, height: 6, background: "linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)", boxShadow: "0 0 40px rgba(66,133,244,0.7)" }} /> : null}
        </div>
      </AbsoluteFill>
      {/* phrase streams into the ad line */}
      {["fresh bread", "friendly staff", "warm sourdough"].map((t, k) => {
        const p = ez(f, web - 6 + k * 4, writes + k * 3, EASE_IO);
        if (p <= 0 || f > writes + 10) return null;
        const x0 = [240, 760, 260][k];
        const y0 = [560, 610, 760][k];
        const x = lerp(x0, 380 + k * 40, p);
        const y = lerp(y0, 1300, p) - Math.sin(Math.PI * p) * 120;
        return (
          <div key={t} style={{ position: "absolute", left: x - 110, top: y, padding: "12px 22px", borderRadius: 30, background: "white", border: `3px solid ${G.star}`, fontFamily: ROBOTO, fontWeight: 700, fontSize: 28, color: G.ink, boxShadow: "0 18px 40px rgba(30,28,20,0.2)", opacity: 1 - ez(f, writes + 2, writes + 10), scale: String(1 - 0.2 * p), zIndex: 4 }}>{t}</div>
        );
      })}
      <div style={{ position: "absolute", left: 70, top: 1180, transform: `translateY(${(1 - adIn) * 300}px)`, opacity: adIn, zIndex: 3 }}>
        <div style={{ width: 940, background: "white", borderRadius: 30, padding: "28px 36px", boxShadow: "0 50px 120px rgba(30,28,20,0.24)", fontFamily: ROBOTO }}>
          <div style={{ fontFamily: GSANS, fontSize: 30, color: G.link }}>Your Bakery | Fresh Sourdough Baked Daily</div>
          <div style={{ marginTop: 14, fontSize: 31, lineHeight: 1.42, color: G.grey, minHeight: 88 }}>
            <b style={{ color: G.ink }}>Customers love: </b>
            <span style={{ backgroundImage: GEMINI, backgroundSize: "300% 100%", backgroundPosition: `${(1 - loveP) * 100}% 0`, WebkitBackgroundClip: "text", color: "transparent" }}>{LOVE.slice(0, Math.round(LOVE.length * loveP))}</span>
          </div>
        </div>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ 5. the catch (lights down): bad reviews fall back into the dark
const Catch: Beat = ({ f, c }) => {
  const good = c("good", 57);
  const bad = c("bad", 95);
  const never = c("never", 108);
  const lights = ez(f, 0, 10, EASE_IO);
  const list = [REVIEWS[0], REVIEWS[3], REVIEWS[1], REVIEWS[5], REVIEWS[2]];
  return (
    <AbsoluteFill style={{ background: C.charcoal, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: C.cream, opacity: 1 - lights }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 55% 40% at 50% 52%, rgba(167,255,63,0.07), rgba(10,10,10,0) 70%)", opacity: lights }} />
      <AbsoluteFill style={{ perspective: 1600 }}>
        {list.map((r, i) => {
          const isBad = r.n < 3;
          const glow = !isBad ? ez(f, good + i * 3, good + 14 + i * 3) : 0;
          const drain = isBad ? ez(f, bad - 4, bad + 18, EASE_IO) : 0;
          const fall = isBad ? ez(f, never - 4, never + 22, (t) => t * t) : 0;
          const gather = !isBad ? ez(f, never + 4, never + 26, EASE_IO) : 0;
          const goodIdx = list.slice(0, i).filter((x) => x.n >= 3).length;
          const y0 = 420 + i * 196;
          const y = isBad ? y0 + fall * 600 : lerp(y0, 1180 + goodIdx * 26, gather);
          return (
            <div key={i} style={{ position: "absolute", left: 540 - 300, top: y, opacity: ez(f, 4 + i * 3, 16 + i * 3) * (1 - fall), transform: `translateZ(${-drain * 380 - fall * 300}px) scale(${1 - gather * 0.12})`, filter: drain > 0 ? `grayscale(${drain}) blur(${drain * 4}px) brightness(${1 - drain * 0.45})` : undefined, zIndex: isBad ? 1 : 2 }}>
              <ReviewCard r={r} w={600} dark style={{ boxShadow: glow > 0 ? `0 0 0 ${3 * glow}px ${C.lime}, 0 30px 80px rgba(0,0,0,0.6)` : undefined }} />
            </div>
          );
        })}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: C.stone, opacity: ez(f, never + 10, never + 22) }}>ONLY THE GOOD ONES REACH THE AD</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 6. can't edit: the selection refuses, a lock seals it
const Lock: Beat = ({ f, c }) => {
  const edit = c("edit", 32);
  const drag = ez(f, edit - 22, edit - 2, EASE_IO);
  const refuse = ez(f, edit - 2, edit + 8, EASE_IO);
  const sel = drag * (1 - refuse);
  const seal = ez(f, edit, edit + 12, SETTLE);
  const cx = lerp(170, 820, drag);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 70, top: 640, transform: `scale(${1 + 0.02 * Math.sin(f / 20)})` }}>
        <div style={{ width: 940, background: "white", borderRadius: 30, padding: "34px 40px", boxShadow: "0 50px 120px rgba(30,28,20,0.22)", fontFamily: ROBOTO, position: "relative", translate: `${Math.sin(refuse * Math.PI * 4) * 10 * (1 - refuse)}px 0` }}>
          <div style={{ fontSize: 33, lineHeight: 1.42, color: G.grey, position: "relative" }}>
            <div style={{ position: "absolute", left: -6, top: 0, height: 92, width: `${sel * 100}%`, background: "rgba(66,133,244,0.25)", borderRadius: 4 }} />
            <b style={{ color: G.ink }}>Customers love: </b>
            {LOVE}
          </div>
          <div style={{ marginTop: 8, fontSize: 24, color: G.grey }}>AI-generated from user reviews across the web.</div>
          <div style={{ position: "absolute", right: -30, top: -30, width: 96, height: 96, borderRadius: "50%", background: C.charcoal, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${seal})`, boxShadow: `0 0 0 ${8 * seal}px rgba(167,255,63,0.35), 0 14px 30px rgba(0,0,0,0.3)` }}>
            <svg width={46} height={46} viewBox="0 0 24 24">
              <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" fill="none" stroke={C.cream} strokeWidth={2.2} strokeLinecap="round" />
              <rect x={5} y={11} width={14} height={10} rx={2.5} fill={C.lime} />
            </svg>
          </div>
        </div>
      </div>
      {/* text cursor I-beam dragging */}
      {f < edit + 14 ? (
        <svg width={40} height={70} viewBox="0 0 20 34" style={{ position: "absolute", left: cx, top: 700, opacity: 1 - ez(f, edit + 4, edit + 14) }}>
          <path d="M4 2h12M4 32h12M10 2v30" stroke={C.charcoal} strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center" }}>
        <Pill p={ez(f, edit + 4, edit + 16)} style={{ fontSize: 26, whiteSpace: "normal", maxWidth: 900, lineHeight: 1.35 }}><span style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: C.lime }}>GOOGLE:</span> &ldquo;advertisers cannot directly edit or customize the generated text&rdquo;</Pill>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ 7. the searcher: the only phone moment
const Phone: Beat = ({ f, c }) => {
  const search = c("search", 16);
  const ad = c("ad", 68);
  const story = c("story", 106);
  const enter = ez(f, 0, 22, SETTLE);
  const scroll = interpolate(f, [4, search + 10], [380, 0], { ...clamp, easing: Easing.bezier(0.1, 0.8, 0.2, 1) });
  const ring = ez(f, ad - 10, ad + 12, EASE_IO);
  const ghosts = ez(f, story - 14, story + 10, SETTLE);
  const W = 620;
  return (
    <Stage>
      {/* the bad reviews you don't see, fanned behind the phone */}
      {[REVIEWS[3], REVIEWS[5]].map((r, i) => (
        <div key={i} style={{ position: "absolute", left: 540 - 270 + (i ? 1 : -1) * 360 * ghosts, top: 700 + i * 420, opacity: 0.85 * ghosts, transform: `rotate(${(i ? 8 : -8) * ghosts}deg) scale(${0.8 + 0.1 * ghosts})`, filter: "blur(1px)" }}>
          <ReviewCard r={r} w={540} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 540 - (W + 36) / 2, top: 420, transform: `perspective(2400px) rotateX(${6 * (1 - enter) + 4}deg) rotateY(-8deg) rotateZ(-3deg) translateY(${(1 - enter) * 300}px)`, opacity: enter }}>
        <div style={{ width: W + 36, height: 1280, borderRadius: 90, background: "#111", padding: 18, boxShadow: "0 70px 160px rgba(30,28,20,0.32), inset 0 0 0 2px #2b2b2b" }}>
          <div style={{ width: W, height: 1244, borderRadius: 74, overflow: "hidden", background: "white", position: "relative", fontFamily: ROBOTO }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: -scroll }}>
              <div style={{ height: 70 }} />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Img src={staticFile("media/logos/google-wordmark.svg")} style={{ height: 44 }} />
              </div>
              <div style={{ margin: "22px 24px 0", height: 74, borderRadius: 37, boxShadow: "0 1px 6px rgba(32,33,36,0.28)", display: "flex", alignItems: "center", padding: "0 28px", fontSize: 28, color: G.ink }}>bakery near me</div>
              <div style={{ padding: "34px 30px 0" }}>
                <div style={{ display: "inline-block", fontFamily: GSANS, fontWeight: 700, fontSize: 32, padding: "2px 10px", margin: "0 -10px", borderRadius: 10, boxShadow: `0 0 0 ${4 * ring}px ${C.lime}` }}>Sponsored</div>
                <div style={{ marginTop: 22, fontSize: 24 }}>Your Bakery</div>
                <div style={{ marginTop: 10, fontFamily: GSANS, fontSize: 34, lineHeight: 1.24, color: G.link }}>Your Bakery | Fresh Sourdough Baked Daily</div>
                <div style={{ marginTop: 16, fontSize: 25, lineHeight: 1.42, color: G.grey, padding: "8px 10px", margin: "12px -10px 0", borderRadius: 12, boxShadow: `0 0 0 ${4 * ring}px ${C.lime}` }}>
                  <b style={{ color: G.ink }}>Customers love: </b>
                  {LOVE}
                </div>
              </div>
              <div style={{ height: 12, background: G.soft, marginTop: 34 }} />
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ padding: "26px 30px" }}>
                  <div style={{ height: 24, width: "46%", borderRadius: 6, background: G.soft }} />
                  <div style={{ marginTop: 14, height: 30, width: "82%", borderRadius: 6, background: "#E8F0FE" }} />
                  <div style={{ marginTop: 12, height: 22, width: "90%", borderRadius: 6, background: G.soft }} />
                  <div style={{ marginTop: 10, height: 22, width: "70%", borderRadius: 6, background: G.soft }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ 8. the owner: a review being written updates the ad
const Owner: Beat = ({ f, c }) => {
  const run = c("run", 16);
  const writing = c("writing", 89);
  const ask = c("ask", 127);
  const exactly = c("exactly", 147);
  const loved = c("loved", 171);
  const topIn = ez(f, run - 10, run + 12, SETTLE);
  const botIn = ez(f, run - 2, run + 20, SETTLE);
  const starsN = Math.min(5, Math.floor(ez(f, ask - 4, ask + 16) * 5.99));
  const text = "The sourdough is still warm at 8 am.".slice(0, Math.max(0, Math.floor((f - (exactly - 4)) / 0.9)));
  const update = ez(f, loved + 4, loved + 30, (t) => t);
  const erase = ez(f, loved - 8, loved + 2, (t) => t);
  const flow = ez(f, writing - 6, writing + 18, EASE_IO);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 120, top: 430, transform: `translateX(${(1 - topIn) * -500}px) rotate(${(1 - topIn) * -4}deg)`, opacity: topIn }}>
        <div style={{ width: 840, background: "white", borderRadius: 32, padding: "30px 36px", boxShadow: "0 40px 110px rgba(30,28,20,0.18)", fontFamily: ROBOTO }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#1A73E8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GSANS, fontSize: 25 }}>K</div>
            <div>
              <div style={{ fontFamily: GSANS, fontSize: 28, color: G.ink }}>Your Bakery</div>
              <div style={{ fontSize: 21, color: G.grey }}>Posting publicly across Google</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <Stars n={starsN} size={54} />
          </div>
          <div style={{ marginTop: 18, minHeight: 96, borderRadius: 16, border: `2px solid ${text ? G.blue : G.line}`, padding: "16px 20px", fontSize: 30, lineHeight: 1.4, color: G.ink }}>
            {text || <span style={{ color: "#9AA0A6" }}>Share details of your own experience</span>}
          </div>
        </div>
      </div>
      {/* connector */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M540 905 C 540 960, 540 990, 540 1040" stroke={C.charcoal} strokeWidth={3} fill="none" strokeDasharray="1" pathLength={1} strokeDashoffset={1 - flow} />
        <circle cx={540} cy={1040} r={9} fill={C.lime} opacity={flow} />
      </svg>
      <div style={{ position: "absolute", left: 70, top: 1060, transform: `translateX(${(1 - botIn) * 500}px) rotate(${(1 - botIn) * 4}deg)`, opacity: botIn }}>
        <div style={{ width: 940, background: "white", borderRadius: 30, padding: "28px 36px", boxShadow: "0 50px 120px rgba(30,28,20,0.22)", fontFamily: ROBOTO }}>
          <div style={{ fontFamily: GSANS, fontWeight: 700, fontSize: 28, color: G.ink }}>Sponsored</div>
          <div style={{ marginTop: 10, fontFamily: GSANS, fontSize: 34, color: G.link }}>Your Bakery | Fresh Sourdough Baked Daily</div>
          <div style={{ marginTop: 14, fontSize: 31, lineHeight: 1.42, color: G.grey, minHeight: 90, borderRadius: 12, padding: "6px 10px", margin: "12px -10px 0", boxShadow: update > 0 ? `0 0 0 ${3 * Math.min(1, update * 3)}px ${C.lime}` : undefined }}>
            <b style={{ color: G.ink }}>Customers love: </b>
            {update > 0 ? (
              <span style={{ backgroundImage: GEMINI, backgroundSize: "300% 100%", backgroundPosition: `${(1 - update) * 100}% 0`, WebkitBackgroundClip: "text", color: "transparent" }}>{LOVE_NEW.slice(0, Math.round(LOVE_NEW.length * update))}</span>
            ) : (
              LOVE.slice(0, Math.round(LOVE.length * (1 - erase)))
            )}
          </div>
        </div>
      </div>
    </Stage>
  );
};

// ------------------------------------------------------------------ registry
const BEATS: Record<string, Beat> = { hook: Hook, gee: Gee, proof: Proof, how: How, catch: Catch, lock: Lock, phone: Phone, owner: Owner };

export const AdsScene: React.FC<SceneProps> = ({ data }) => {
  const f = useCurrentFrame();
  const w = data._world as { i: number; starts: number[]; durs: number[]; cues: Record<string, number>[] };
  const B = BEATS[data.beat as string];
  const cues = (data.cues ?? {}) as Record<string, number>;
  const c = (n: string, fb: number) => cues[n] ?? fb;
  return B ? <B f={f} c={c} D={w.durs[w.i]} /> : null;
};

export const ADS_SCENES: Record<string, React.FC<SceneProps>> = { gAds: AdsScene };
