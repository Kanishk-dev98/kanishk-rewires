// "Google is writing part of your ads" reel (9:16), v3.
// One continuous take driven by the global frame: a real-looking phone with a mobile Google results page is the hero,
// Google's real help page (a screenshot) is the proof, and a Maps-style reviews panel is the raw material.
// Objects move on keyed 3D tracks with a soft overshoot settle, depth-of-field blur and drift. Google UI uses Google's
// own font and colours; our annotations use the brand type. Twist = motivated lights-down act.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadGoogleSans } from "@remotion/google-fonts/GoogleSans";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import { BODY, C, clamp, EASE, EASE_IO, MONO } from "./brand";
import type { SceneProps } from "./scenes";

const { fontFamily: GSANS } = loadGoogleSans("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
const { fontFamily: ROBOTO } = loadRoboto("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

// Google UI colours (Google's, not the brand's): only used inside the recreated Google surfaces.
const G = { blue: "#4285F4", red: "#EA4335", yellow: "#FBBC05", green: "#34A853", link: "#1558D6", ink: "#202124", grey: "#4D5156", line: "#DADCE0", star: "#FBBC04", soft: "#F1F3F4" };
const GEMINI = "linear-gradient(90deg, #4285F4, #9B72CB 45%, #D96570 75%, #4285F4)";

const SETTLE = Easing.bezier(0.2, 1.1, 0.32, 1); // fast in, ~3% overshoot, long settle
const ez = (f: number, a: number, b: number, e = EASE) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type K = { x: number; y: number; s: number; rx?: number; ry?: number; rz?: number; blur?: number; o?: number };
/** Keyed track: [frame, state] pairs; each segment eases with a settle. Holds breathe slightly. */
const track = (g: number, keys: [number, K, number?][]): Required<K> => {
  const full = (k: K): Required<K> => ({ rx: 0, ry: 0, rz: 0, blur: 0, o: 1, ...k });
  let cur = full(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    const [at, k, dur = 22] = keys[i];
    const p = ez(g, at, at + dur, SETTLE);
    const pl = ez(g, at, at + dur, EASE_IO);
    const n = full(k);
    cur = { x: lerp(cur.x, n.x, p), y: lerp(cur.y, n.y, p), s: lerp(cur.s, n.s, p), rx: lerp(cur.rx, n.rx, pl), ry: lerp(cur.ry, n.ry, pl), rz: lerp(cur.rz, n.rz, pl), blur: lerp(cur.blur, n.blur, pl), o: lerp(cur.o, n.o, pl) };
  }
  return cur;
};
const Obj: React.FC<{ t: Required<K>; w: number; h: number; g: number; seed?: number; children: React.ReactNode; z?: number }> = ({ t, w, h, g, seed = 0, children, z }) => {
  if (t.o <= 0.01) return null;
  const br = 1 + 0.012 * Math.sin((g + seed * 37) / 46);
  const dy = Math.sin((g + seed * 53) / 60) * 5;
  return (
    <div style={{ position: "absolute", left: t.x - w / 2, top: t.y - h / 2 + dy, width: w, height: h, opacity: t.o, zIndex: z, transform: `perspective(2400px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) rotateZ(${t.rz}deg) scale(${t.s * br})`, filter: t.blur > 0.3 ? `blur(${t.blur}px)` : undefined }}>
      {children}
    </div>
  );
};

// ------------------------------------------------------------------ Google surfaces
const Stars: React.FC<{ n: number; size: number; grey?: boolean }> = ({ n, size, grey }) => (
  <span style={{ display: "inline-flex", gap: size * 0.08, verticalAlign: "middle" }}>
    {[0, 1, 2, 3, 4].map((k) => (
      <svg key={k} width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.3l-5.8 3.1 1.2-6.5L2.6 9.4l6.5-.8z" fill={k < n ? (grey ? "#9AA0A6" : G.star) : "#DADCE0"} />
      </svg>
    ))}
  </span>
);

/** Mobile Google results page (412 css px wide, drawn at 1.5x). */
const PAGE_W = 618;
const Serp: React.FC<{ g: number; query: string; caret: boolean; adIn: number; love: string; loveP: number; shimmer: number; headMark: number; loveMark: number; strike: number; tap: number; tapAt: [number, number] }> = ({ g, query, caret, adIn, love, loveP, shimmer, headMark, loveMark, strike, tap, tapAt }) => {
  const shown = love.slice(0, Math.round(love.length * loveP));
  return (
    <div style={{ width: PAGE_W, height: 1290, background: "white", fontFamily: ROBOTO, color: G.ink, position: "relative", overflow: "hidden" }}>
      {/* status bar */}
      <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", fontFamily: GSANS, fontWeight: 500, fontSize: 21 }}>
        <span>9:41</span>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 22, height: 14, borderRadius: 3, border: `2px solid ${G.ink}` }} />
        </span>
      </div>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 18 }}>
        <Img src={staticFile("media/logos/google-wordmark.svg")} style={{ height: 40 }} />
      </div>
      <div style={{ margin: "22px 24px 0", height: 70, borderRadius: 35, boxShadow: "0 1px 6px rgba(32,33,36,0.28)", display: "flex", alignItems: "center", padding: "0 26px", gap: 18 }}>
        <svg width={26} height={26} viewBox="0 0 24 24">
          <circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke="#9AA0A6" strokeWidth={2.2} />
          <path d="M15.5 15.5L20 20" stroke="#9AA0A6" strokeWidth={2.2} strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 26, color: G.ink }}>
          {query}
          {caret && Math.floor(g / 15) % 2 === 0 ? <span style={{ display: "inline-block", width: 2, height: 28, background: G.blue, marginLeft: 2, verticalAlign: -5 }} /> : null}
        </span>
      </div>
      <div style={{ display: "flex", gap: 34, padding: "22px 34px 0", fontFamily: GSANS, fontSize: 21, color: "#5F6368", borderBottom: `1px solid ${G.line}` }}>
        {["All", "Maps", "Images", "Shopping", "News"].map((t, i) => (
          <span key={t} style={{ paddingBottom: 14, color: i === 0 ? G.ink : undefined, fontWeight: i === 0 ? 500 : 400, borderBottom: i === 0 ? `4px solid ${G.ink}` : "4px solid transparent" }}>{t}</span>
        ))}
      </div>
      {/* sponsored block */}
      <div style={{ padding: "26px 30px 0", opacity: adIn, translate: `0 ${(1 - adIn) * 30}px` }}>
        <div style={{ fontFamily: GSANS, fontWeight: 700, fontSize: 30 }}>Sponsored</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${G.line}`, background: "#FFF7EC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GSANS, fontWeight: 700, fontSize: 20, color: "#B26A00" }}>Y</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22 }}>Your Bakery</div>
            <div style={{ fontSize: 19, color: G.grey }}>https://www.yourbakery.in</div>
          </div>
          <div style={{ fontSize: 30, color: G.grey, lineHeight: 0.6 }}>⋮</div>
        </div>
        <div style={{ marginTop: 18, fontFamily: GSANS, fontSize: 31, lineHeight: 1.28, color: G.link, position: "relative" }}>
          <span style={{ position: "relative", boxShadow: headMark > 0 ? `inset 0 -${Math.round(44 * headMark)}px 0 rgba(167,255,63,0.55)` : undefined }}>Your Bakery | Fresh Sourdough Baked Daily</span>
          {strike > 0 ? <div style={{ position: "absolute", left: 0, top: 20, width: `${strike * 100}%`, height: 3, background: G.ink }} /> : null}
          {strike > 0 ? <div style={{ position: "absolute", left: 0, top: 60, width: `${Math.max(0, strike * 2 - 1) * 74}%`, height: 3, background: G.ink }} /> : null}
        </div>
        <div style={{ marginTop: 12, fontSize: 21, lineHeight: 1.45, color: G.grey }}>Hand-shaped loaves, cakes and filter coffee. Order online or visit our café today.</div>
        <div style={{ marginTop: 14, fontSize: 21, lineHeight: 1.45, color: G.grey, minHeight: 92, position: "relative", padding: "4px 6px", margin: "10px -6px 0", borderRadius: 10, boxShadow: loveMark > 0 ? `0 0 0 ${3 * loveMark}px ${C.lime}` : undefined, background: loveMark > 0 ? `rgba(232,255,184,${0.5 * loveMark})` : undefined }}>
          {loveP > 0 ? <b style={{ color: G.ink, fontWeight: 700 }}>Customers love: </b> : null}
          <span style={shimmer > 0 ? { backgroundImage: GEMINI, backgroundSize: "300% 100%", backgroundPosition: `${(1 - shimmer) * 100}% 0`, WebkitBackgroundClip: "text", color: "transparent" } : undefined}>{shown}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 18, color: G.grey, opacity: loveP >= 1 ? 1 : 0 }}>
          AI-generated from user reviews across the web. <span style={{ textDecoration: "underline" }}>Learn more</span>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          {["Order Online", "Today's Bakes", "Café"].map((t) => (
            <div key={t} style={{ border: `1px solid ${G.line}`, borderRadius: 30, padding: "12px 22px", fontFamily: GSANS, fontSize: 20, color: G.link, whiteSpace: "nowrap" }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ height: 10, background: G.soft, margin: "30px 0 0" }} />
      {/* an organic result below, for context */}
      <div style={{ padding: "24px 30px", opacity: adIn }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: G.soft }} />
          <div>
            <div style={{ fontSize: 22 }}>Local bakeries near you</div>
            <div style={{ fontSize: 19, color: G.grey }}>maps.google.com</div>
          </div>
        </div>
        <div style={{ marginTop: 14, height: 22, width: "88%", borderRadius: 6, background: G.soft }} />
        <div style={{ marginTop: 10, height: 22, width: "64%", borderRadius: 6, background: G.soft }} />
      </div>
      {tap > 0 && tap < 1 ? <div style={{ position: "absolute", left: tapAt[0] - 60 * tap, top: tapAt[1] - 60 * tap, width: 120 * tap, height: 120 * tap, borderRadius: "50%", background: `rgba(32,33,36,${0.18 * (1 - tap)})` }} /> : null}
    </div>
  );
};

const Phone: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children }) => (
  <div style={{ width: PAGE_W + 36, height: 1326, borderRadius: 88, background: "#111", padding: 18, boxShadow: "0 60px 140px rgba(30,28,20,0.28), 0 12px 30px rgba(30,28,20,0.18), inset 0 0 0 2px #2b2b2b" }}>
    <div style={{ width: PAGE_W, height: 1290, borderRadius: 72, overflow: "hidden", position: "relative" }}>
      {children}
      <div style={{ position: "absolute", left: PAGE_W / 2 - 60, top: 14, width: 120, height: 34, borderRadius: 17, background: "#111" }} />
    </div>
  </div>
);

/** The real Google help page (screenshot) in a browser window. `scroll` and `marks` are in screenshot pixels (1520 wide). */
const HELP_W = 760; // displayed width (screenshot is 1520 px wide)
const HelpCard: React.FC<{ scroll: number; viewH: number; marks?: { x: number; y: number; w: number; p: number }[]; find?: { text: string; result: string; p: number } }> = ({ scroll, viewH, marks = [], find }) => (
  <div style={{ width: HELP_W, borderRadius: 24, overflow: "hidden", background: "white", boxShadow: "0 50px 120px rgba(30,28,20,0.25), 0 8px 24px rgba(30,28,20,0.12)", border: "1px solid #E4E0D5" }}>
    <div style={{ height: 62, background: "#F1F3F4", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
      {["#EA4335", "#FBBC05", "#34A853"].map((c) => (
        <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c, opacity: 0.85 }} />
      ))}
      <div style={{ flex: 1, marginLeft: 12, height: 38, borderRadius: 19, background: "white", display: "flex", alignItems: "center", padding: "0 16px", fontFamily: ROBOTO, fontSize: 18, color: G.grey }}>support.google.com/google-ads/answer/18760807</div>
    </div>
    {find ? (
      <div style={{ height: 56, borderBottom: `1px solid ${G.line}`, display: "flex", alignItems: "center", gap: 14, padding: "0 20px", fontFamily: ROBOTO, fontSize: 20, background: "white", opacity: find.p }}>
        <div style={{ flex: 1, height: 38, borderRadius: 8, border: `2px solid ${G.blue}`, display: "flex", alignItems: "center", padding: "0 12px", color: G.ink }}>{find.text}</div>
        <div style={{ color: find.result.startsWith("0") ? G.red : G.grey, fontWeight: 500, minWidth: 110 }}>{find.result}</div>
      </div>
    ) : null}
    <div style={{ height: viewH, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: -scroll / 2, width: HELP_W }}>
        <Img src={staticFile("media/review-ads/help-page.png")} style={{ width: HELP_W, display: "block" }} />
        {marks.map((m, i) => (
          <div key={i} style={{ position: "absolute", left: m.x / 2 - 4, top: m.y / 2 - 4, width: (m.w / 2 + 8) * m.p, height: 30, background: "rgba(167,255,63,0.55)", mixBlendMode: "multiply", borderRadius: 4 }} />
        ))}
      </div>
    </div>
  </div>
);

type Review = { name: string; init: string; col: string; meta: string; n: number; when: string; text: React.ReactNode };
const ReviewRow: React.FC<{ r: Review; dark?: boolean; reject?: number }> = ({ r, dark, reject = 0 }) => (
  <div style={{ padding: "22px 26px", borderTop: `1px solid ${dark ? "#2A2A2A" : G.line}`, filter: reject > 0 ? `grayscale(${reject}) blur(${reject * 3}px)` : undefined, opacity: 1 - reject * 0.75, transform: `scale(${1 - reject * 0.06})`, transformOrigin: "50% 50%" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: r.col, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GSANS, fontWeight: 500, fontSize: 22 }}>{r.init}</div>
      <div>
        <div style={{ fontFamily: GSANS, fontWeight: 500, fontSize: 23, color: dark ? "#E8EAED" : G.ink }}>{r.name}</div>
        <div style={{ fontFamily: ROBOTO, fontSize: 18, color: dark ? "#9AA0A6" : G.grey }}>{r.meta}</div>
      </div>
    </div>
    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
      <Stars n={r.n} size={22} />
      <span style={{ fontFamily: ROBOTO, fontSize: 18, color: dark ? "#9AA0A6" : G.grey }}>{r.when}</span>
    </div>
    <div style={{ marginTop: 10, fontFamily: ROBOTO, fontSize: 23, lineHeight: 1.42, color: dark ? "#E8EAED" : G.ink }}>{r.text}</div>
  </div>
);
const Hl: React.FC<{ p: number; children: React.ReactNode }> = ({ p, children }) => <span style={{ boxShadow: `inset 0 -${Math.round(30 * p)}px 0 rgba(251,188,4,0.45)` }}>{children}</span>;

const ReviewsPanel: React.FC<{ dark?: boolean; reviews: Review[]; reject?: number[]; w?: number }> = ({ dark, reviews, reject = [], w = 640 }) => (
  <div style={{ width: w, borderRadius: 28, overflow: "hidden", background: dark ? "#1B1B1B" : "white", boxShadow: dark ? "0 50px 120px rgba(0,0,0,0.6)" : "0 50px 120px rgba(30,28,20,0.22), 0 8px 24px rgba(30,28,20,0.1)" }}>
    <div style={{ padding: "26px 26px 20px", display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ fontFamily: GSANS, fontSize: 64, color: dark ? "#E8EAED" : G.ink, lineHeight: 1 }}>4.6</div>
      <div>
        <Stars n={5} size={24} />
        <div style={{ fontFamily: ROBOTO, fontSize: 18, color: dark ? "#9AA0A6" : G.grey, marginTop: 4 }}>Your Bakery · Google reviews</div>
      </div>
    </div>
    {reviews.map((r, i) => (
      <ReviewRow key={i} r={r} dark={dark} reject={reject[i] ?? 0} />
    ))}
  </div>
);

/** Brand annotation: a small charcoal pill with a hairline leader. */
const Note: React.FC<{ p: number; children: React.ReactNode; dark?: boolean }> = ({ p, children, dark }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 22px", borderRadius: 40, background: dark ? C.cream : C.charcoal, color: dark ? C.charcoal : C.cream, fontFamily: BODY, fontWeight: 600, fontSize: 27, opacity: p, translate: `0 ${(1 - p) * 16}px`, boxShadow: "0 16px 40px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>{children}</div>
);
const LockGlyph: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <rect x={5} y={11} width={14} height={10} rx={2.5} fill={C.lime} />
  </svg>
);

// ------------------------------------------------------------------ the film
const LOVE = "fresh bread, friendly staff and warm sourdough.";
const LOVE_NEW = "sourdough still warm at 8 am, friendly staff.";
const REVIEWS: Review[] = [
  { name: "Priya S.", init: "P", col: "#1E8E3E", meta: "Local Guide · 41 reviews", n: 5, when: "2 weeks ago", text: <>The <b>fresh bread</b> here is unreal. Worth the drive.</> },
  { name: "Rahul M.", init: "R", col: "#1A73E8", meta: "12 reviews", n: 5, when: "a month ago", text: <>Such <b>friendly staff</b>, my kids love coming here.</> },
  { name: "Anita K.", init: "A", col: "#E37400", meta: "Local Guide · 88 reviews", n: 4, when: "3 weeks ago", text: <>Get the <b>warm sourdough</b> early, it sells out.</> },
];
const TWIST_REVIEWS: Review[] = [
  REVIEWS[0],
  { name: "Vikram T.", init: "V", col: "#D93025", meta: "6 reviews", n: 1, when: "a week ago", text: <>Waited 40 minutes for a coffee.</> },
  REVIEWS[1],
  { name: "Neha D.", init: "N", col: "#9334E6", meta: "3 reviews", n: 2, when: "2 months ago", text: <>Cake was dry this time.</> },
];

export const ReviewScene: React.FC<SceneProps> = ({ data }) => {
  const f = useCurrentFrame();
  const w = data._world as { i: number; starts: number[]; durs: number[]; cues: Record<string, number>[] };
  const g = w.starts[w.i] + f;
  const S = w.starts;
  const cue = (j: number, n: string, fb: number) => S[j] + ((w.cues[j]?.[n] as number | undefined) ?? fb);
  // absolute cue frames
  const writing = cue(0, "writing", 30);
  const edit = cue(0, "edit", 87);
  const four = cue(1, "four", 19);
  const ctry = [["us", "flag-us.svg", "US", 60], ["uk", "flag-uk.svg", "UK", 85], ["au", "flag-au.svg", "Australia", 106], ["in", "flag-in.svg", "India", 141]].map(([k, fl, nm, fb]) => ({ at: cue(1, k as string, fb as number), fl: fl as string, nm: nm as string }));
  const reads = cue(2, "reads", 79);
  const web = cue(2, "web", 115);
  const writes = cue(2, "writes", 141);
  const headline = cue(3, "headline", 61);
  const inside = cue(3, "inside", 119);
  const change = cue(3, "change", 157);
  const off = cue(3, "off", 238);
  const got = cue(4, "got", 24);
  const positive = cue(4, "positive", 51);
  const predicts = cue(4, "predicts", 132);
  const better = cue(4, "better", 162);
  const copy = cue(5, "copy", 48);
  const stop = cue(6, "stop", 10);
  const ask = cue(6, "ask", 64);
  const exactly = cue(6, "exactly", 112);
  const writes2 = cue(6, "writes", 185);

  // lights: dark from "got" until the merge scene starts
  const dark = ez(g, got - 6, got + 8, EASE_IO) * (1 - ez(g, S[5], S[5] + 12, EASE_IO));

  // ---- phone track (centre x 540) and page camera (zoom into the ad block)
  const phone = track(g, [
    [0, { x: 540, y: 1500, s: 0.78, rx: 18, ry: -8, o: 0 }],
    [0, { x: 540, y: 980, s: 1.0, rx: 6, ry: -10, rz: 0 }, 26],
    [writing + 14, { x: 560, y: 1000, s: 1.32, rx: 2, ry: -6 }, 30], // push into the ad
    [S[1] + 2, { x: -380, y: 1060, s: 0.8, rx: 4, ry: 24, blur: 10, o: 0 }, 22], // out of frame for the help page
    [S[2] + 4, { x: -380, y: 1060, s: 0.8, rx: 4, ry: 24, blur: 10, o: 0 }, 22],
    [writes - 14, { x: 560, y: 990, s: 1.25, rx: 2, ry: -6, blur: 0, o: 1 }, 24],
    [S[3] + 2, { x: 560, y: 960, s: 1.42, rx: 0, ry: -4 }, 26], // close-up for the pain beat
    [off - 30, { x: 560, y: 640, s: 0.9, rx: 4, ry: -6 }, 24],
    [got, { x: 1250, y: 1000, s: 0.8, rx: 2, ry: -20, blur: 4, o: 0 }, 22],
    [S[5], { x: 560, y: 960, s: 1.3, rx: 0, ry: -4, blur: 0 }, 22],
    [ask - 20, { x: 540, y: 960, s: 1.12, rx: 4, ry: -8 }, 24],
    [writes2 - 10, { x: 560, y: 990, s: 1.3, rx: 0, ry: -4 }, 22],
  ]);
  // page offset inside the phone screen (scroll so the ad sits high)
  const adIn = ez(g, writing - 18, writing - 2);
  const queryText = "bakery near me".slice(0, Math.max(0, Math.floor((g - 4) / 1.6)));
  const loveP = g < writes ? ez(g, writing, writing + 44, (t) => t) : 1;
  const loveSecondWrite = ez(g, writes, writes + 30, (t) => t); // re-written from the reviews in scene 2
  const erase = ez(g, writes2 - 18, writes2 - 8, (t) => t);
  const retype = ez(g, writes2 - 6, writes2 + 18, (t) => t);
  const love = retype > 0 ? LOVE_NEW : LOVE;
  const loveShown = g >= writes2 - 18 ? (retype > 0 ? retype : 1 - erase) : g >= S[2] && g < writes ? 0 : g >= writes && g < S[3] ? loveSecondWrite : loveP;
  const shimmer = Math.max(ez(g, writing, writing + 50) * (1 - ez(g, writing + 50, writing + 60)), ez(g, writes, writes + 34) * (1 - ez(g, writes + 34, writes + 44)), ez(g, writes2 - 6, writes2 + 20) * (1 - ez(g, writes2 + 20, writes2 + 30)));
  const loveMark = Math.max(ez(g, edit - 6, edit + 6) * (1 - ez(g, S[1], S[1] + 10)), ez(g, inside, inside + 12) * (1 - ez(g, got, got + 10)), ez(g, copy - 8, copy + 6) * (1 - ez(g, S[6] + 10, S[6] + 20)), ez(g, writes2, writes2 + 10));
  const headMark = ez(g, headline - 6, headline + 8) * (1 - ez(g, got, got + 10));
  const strike = ez(g, stop + 2, stop + 24, EASE_IO);
  const tapA = ez(g, edit - 2, edit + 16, (t) => t);
  const tapB = ez(g, change - 2, change + 16, (t) => t);
  const tap = g >= change - 2 && g < change + 16 ? tapB : g >= edit - 2 && g < edit + 16 ? tapA : 0;

  // ---- help page track
  const help = track(g, [
    [0, { x: 1400, y: 900, s: 0.9, ry: -24, o: 0 }],
    [S[1] - 2, { x: 540, y: 1000, s: 1.24, rx: 4, ry: -6, o: 1 }, 26],
    [S[2], { x: 1400, y: 900, s: 0.9, ry: -24, o: 0 }, 20],
    [off - 22, { x: 540, y: 1430, s: 1.05, rx: 6, ry: -4, o: 1 }, 22],
    [got, { x: 560, y: 2200, s: 0.9, o: 0 }, 18],
    [predicts - 16, { x: 540, y: 1180, s: 1.22, rx: 4, ry: 4, o: 1 }, 24],
    [S[5], { x: 540, y: 2200, s: 0.9, o: 0 }, 16],
  ]);
  const helpScroll = g < off - 30 ? interpolate(g, [S[1], four + 10], [700, 2360], { ...clamp, easing: EASE_IO }) : g < got ? 2700 : 1290;
  const helpView = g < off - 30 ? 640 : g < got ? 300 : 380;
  const elig = { x: 64, y: 2554, w: 1150, p: ez(g, four + 12, four + 30, EASE_IO) };
  const quote = [
    { x: 64, y: 1454, w: 1344, p: ez(g, better - 10, better + 8, EASE_IO) },
    { x: 64, y: 1502, w: 360, p: ez(g, better + 6, better + 14, EASE_IO) },
  ];
  const findP = ez(g, off - 16, off - 4);
  const findText = "turn off".slice(0, Math.max(0, Math.floor((g - (off - 10)) / 1.5)));

  // ---- reviews panel track
  const rev = track(g, [
    [0, { x: 1500, y: 1000, s: 0.9, ry: -20, o: 0 }],
    [S[2] - 2, { x: 600, y: 990, s: 1.2, rx: 4, ry: -10, o: 1 }, 26],
    [writes - 14, { x: 860, y: 1050, s: 0.8, rx: 4, ry: -18, blur: 7, o: 0.5 }, 22],
    [S[3], { x: 1500, y: 1000, s: 0.9, ry: -20, o: 0 }, 18],
    [got + 4, { x: 540, y: 980, s: 1.18, rx: 4, ry: 6, o: 1 }, 26],
    [predicts - 16, { x: 540, y: 560, s: 0.7, rx: 8, ry: 6, blur: 8, o: 0 }, 22],
    [S[5], { x: 560, y: 1000, s: 0.3, o: 0 }, 22],
  ]);
  const hl = ez(g, reads + 4, reads + 26, EASE_IO);
  const scanY = interpolate(g, [reads - 4, web], [0, 1], clamp);
  const rejects = [0, ez(g, positive + 2, positive + 22, EASE_IO), 0, ez(g, positive + 8, positive + 28, EASE_IO)];
  // phrases flying from reviews into the ad (scene 2)
  const fly = ez(g, web - 4, writes + 2, EASE_IO);

  // ---- review composer (bottom sheet inside the phone) for the takeaway
  const sheet = ez(g, ask - 10, ask + 8, EASE) * (1 - ez(g, writes2 - 20, writes2 - 8, EASE_IO));
  const starsN = Math.min(5, Math.floor(ez(g, ask + 4, ask + 22) * 5.99));
  const composeText = "The sourdough is still warm at 8 am.".slice(0, Math.max(0, Math.floor((g - (exactly - 6)) / 1.0)));

  // ---- annotations
  const noteLock = ez(g, edit, edit + 10) * (1 - ez(g, S[1] - 6, S[1] + 4));
  const noteYou = ez(g, headline - 2, headline + 12) * (1 - ez(g, off - 30, off - 22));
  const noteAi = ez(g, inside + 2, inside + 14) * (1 - ez(g, off - 30, off - 22));
  const noteLock2 = ez(g, change, change + 10) * (1 - ez(g, off - 30, off - 22));

  const stageBg = dark > 0.5 ? C.charcoal : C.cream;
  return (
    <AbsoluteFill style={{ background: stageBg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: C.cream, opacity: 1 - dark }} />
      <AbsoluteFill style={{ background: C.charcoal, opacity: dark }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 48%, rgba(255,255,255,0.9), rgba(246,244,237,0) 72%)", opacity: 1 - dark }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 46%, rgba(167,255,63,0.06), rgba(10,10,10,0) 70%)", opacity: dark }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${dark > 0.5 ? "rgba(246,244,237,0.06)" : "rgba(10,10,10,0.07)"} 1.3px, transparent 1.6px)`, backgroundSize: "44px 44px", backgroundPosition: `0 ${-g * 0.6}px`, maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent 85%)" }} />

      {/* help page (behind the phone when it is aside) */}
      <Obj t={help} w={HELP_W} h={helpView + 62} g={g} seed={2} z={g >= off - 30 && g < got ? 3 : 1}>
        <HelpCard scroll={helpScroll} viewH={helpView} marks={g < S[2] ? [elig] : g >= predicts - 20 ? quote : []} find={g >= off - 30 && g < got ? { text: findText, result: findText.length >= 8 ? "0 of 0" : "", p: findP } : undefined} />
      </Obj>

      {/* country chips (scene 1) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", gap: 14, zIndex: 7 }}>
        {ctry.map((c2, k) => {
          const p = ez(g, c2.at - 4, c2.at + 10) * (1 - ez(g, S[2] - 6, S[2] + 4));
          const india = k === 3;
          return (
            <div key={c2.nm} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px 12px 12px", borderRadius: 40, background: "white", boxShadow: india ? `0 0 0 ${3 * ez(g, c2.at + 4, c2.at + 14)}px ${C.lime}, 0 16px 40px rgba(30,28,20,0.16)` : "0 16px 40px rgba(30,28,20,0.14)", opacity: p, translate: `0 ${(1 - p) * -30}px`, scale: String(0.9 + 0.1 * p) }}>
              <div style={{ width: 54, height: 36, borderRadius: 6, overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }}>
                <Img src={staticFile(`media/logos/${c2.fl}`)} style={{ width: 54, height: 36, objectFit: "cover" }} />
              </div>
              <span style={{ fontFamily: GSANS, fontWeight: 500, fontSize: 28, color: G.ink }}>{c2.nm}</span>
            </div>
          );
        })}
      </div>

      {/* reviews panel */}
      <Obj t={rev} w={640} h={g >= S[4] ? 760 : 620} g={g} seed={3} z={2}>
        <ReviewsPanel
          dark={dark > 0.5}
          reviews={g >= S[4] ? TWIST_REVIEWS : REVIEWS.map((r) => ({ ...r, text: <Hl p={hl}>{r.text}</Hl> }))}
          reject={g >= S[4] ? rejects : []}
        />
        {g >= S[2] && g < S[3] && scanY > 0 && scanY < 1 ? <div style={{ position: "absolute", left: 0, right: 0, top: 110 + scanY * 480, height: 4, background: "linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)", boxShadow: "0 0 24px rgba(66,133,244,0.6)" }} /> : null}
      </Obj>

      {/* phone */}
      <Obj t={phone} w={PAGE_W + 36} h={1326} g={g} seed={1} z={g >= off - 30 && g < got ? 2 : 3}>
        <Phone>
          <Serp g={g} query={queryText} caret={g < writing} adIn={adIn} love={love} loveP={loveShown} shimmer={shimmer} headMark={headMark} loveMark={loveMark} strike={strike} tap={tap} tapAt={[300, 640]} />
          {/* review composer bottom sheet */}
          {sheet > 0 ? (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, translate: `0 ${(1 - sheet) * 600}px`, background: "white", borderRadius: "36px 36px 0 0", boxShadow: "0 -20px 60px rgba(0,0,0,0.18)", padding: "26px 34px", fontFamily: ROBOTO }}>
              <div style={{ width: 70, height: 6, borderRadius: 3, background: G.line, margin: "0 auto 26px" }} />
              <div style={{ fontFamily: GSANS, fontSize: 30, color: G.ink }}>Your Bakery</div>
              <div style={{ fontSize: 20, color: G.grey, marginTop: 4 }}>Posting publicly across Google</div>
              <div style={{ marginTop: 24 }}>
                <Stars n={starsN} size={56} />
              </div>
              <div style={{ marginTop: 26, height: 190, borderRadius: 14, border: `2px solid ${composeText ? G.blue : G.line}`, padding: "16px 18px", fontSize: 25, lineHeight: 1.4, color: G.ink }}>
                {composeText || <span style={{ color: "#9AA0A6" }}>Share details of your own experience</span>}
              </div>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: G.link, color: "white", fontFamily: GSANS, fontWeight: 500, fontSize: 22, padding: "14px 30px", borderRadius: 26 }}>Post</div>
              </div>
            </div>
          ) : null}
        </Phone>
      </Obj>

      {/* flying phrases: reviews -> ad */}
      {g >= web - 4 && g < writes + 4
        ? ["fresh bread", "friendly staff", "warm sourdough"].map((t, k) => {
            const p = ez(g, web - 4 + k * 3, writes + k * 3, EASE_IO);
            const x0 = rev.x - 180;
            const y0 = rev.y - 120 + k * 170;
            const x1 = phone.x - 40;
            const y1 = phone.y - 20;
            const x = lerp(x0, x1, p);
            const y = lerp(y0, y1, p) - Math.sin(Math.PI * p) * 140;
            return (
              <div key={t} style={{ position: "absolute", left: x, top: y, zIndex: 6, padding: "10px 18px", borderRadius: 24, background: "white", border: `2px solid ${G.star}`, fontFamily: ROBOTO, fontWeight: 700, fontSize: 24, color: G.ink, boxShadow: "0 14px 34px rgba(30,28,20,0.18)", opacity: fly > 0 ? 1 - ez(g, writes, writes + 4) : 0, scale: String(1 - 0.25 * p) }}>{t}</div>
            );
          })
        : null}

      {/* annotations (brand) */}
      <div style={{ position: "absolute", left: 120, top: 1430, zIndex: 8 }}>
        <Note p={noteLock}>
          <LockGlyph size={30} color={C.cream} /> You can&apos;t edit this line
        </Note>
      </div>
      <div style={{ position: "absolute", left: 90, top: 400, zIndex: 8 }}>
        <Note p={noteYou}>You wrote the headline</Note>
      </div>
      <div style={{ position: "absolute", left: 90, top: 1440, zIndex: 8, display: "flex", gap: 14 }}>
        <Note p={noteAi}>
          <Img src={staticFile("media/logos/google-g.svg")} style={{ height: 30 }} /> Google&apos;s AI wrote this
        </Note>
      </div>
      <div style={{ position: "absolute", left: 90, top: 1530, zIndex: 8 }}>
        <Note p={noteLock2}>
          <LockGlyph size={30} color={C.cream} /> Advertisers can&apos;t edit it
        </Note>
      </div>
      {/* twist labels */}
      <div style={{ position: "absolute", left: 120, top: 390, zIndex: 8, fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: C.stone, opacity: ez(g, positive, positive + 10) * (1 - ez(g, predicts - 20, predicts - 10)) }}>NEGATIVE REVIEWS LEFT OUT</div>
    </AbsoluteFill>
  );
};

export const REVIEW_SCENES: Record<string, React.FC<SceneProps>> = { gReview: ReviewScene };
