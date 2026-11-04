// "Google is writing part of your ads" reel (9:16). New grammar for this reel: one continuous search-results page.
// Each beat is the next region of the page; the camera scrolls down it with momentum, a slight perspective tilt and
// a vertical motion blur. The twist is a lights-down (charcoal) act. One hero object, an illustrative bakery ad card,
// persists and transforms from beat to beat.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import { Check, Cursor, ez, INK, LINE, Logo, MUTED, pop, rise, Selection, SHADOW, typed } from "./duet";
import type { BeatProps, Cue } from "./duet";
import type { SceneProps } from "./scenes";

type Beat = React.FC<BeatProps & { dark: boolean }>;

const AI_LINE = "Customers praise the fresh bread and the friendly staff.";
const AI_NEW = "Customers love the sourdough, still warm at 8 am.";
const HEADLINE = "Fresh Sourdough Baked Daily";
const DESC = "Hand-shaped loaves, cakes and coffee. Order online or visit us.";

// ------------------------------------------------------------------ shared pieces
const Stars: React.FC<{ n: number; size?: number; dark?: boolean }> = ({ n, size = 22, dark }) => (
  <div style={{ display: "flex", gap: size * 0.18 }}>
    {[0, 1, 2, 3, 4].map((k) => (
      <svg key={k} width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill={k < n ? (dark ? C.cream : C.charcoal) : "none"} stroke={dark ? C.cream : C.charcoal} strokeWidth={1.4} strokeLinejoin="round" opacity={k < n ? 1 : 0.35} />
      </svg>
    ))}
  </div>
);

const Sparkle: React.FC<{ size: number; color?: string }> = ({ size, color = C.charcoal }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2c.6 4.8 2.7 7.2 8 8-5.3.8-7.4 3.2-8 8-.6-4.8-2.7-7.2-8-8 5.3-.8 7.4-3.2 8-8z" fill={color} />
  </svg>
);

/** The hero object: one sponsored search ad for an illustrative bakery. */
const AdCard: React.FC<{
  w?: number;
  head?: string;
  ai: string;
  aiP?: number; // 0..1 how much of the AI line is typed
  aiFocus?: number; // lime outline on the AI line
  lock?: number;
  headSel?: number;
  shake?: number;
  dark?: boolean;
  dim?: number;
  strike?: number;
}> = ({ w = 900, head = HEADLINE, ai, aiP = 1, aiFocus = 0, lock = 0, headSel = 0, shake = 0, dark = false, dim = 0, strike = 0 }) => {
  const shown = ai.slice(0, Math.round(ai.length * aiP));
  return (
    <div style={{ width: w, background: dark ? "#14130F" : "white", border: `1px solid ${dark ? "#2C2A24" : LINE}`, borderRadius: 34, boxShadow: dark ? "0 40px 120px rgba(0,0,0,0.55)" : SHADOW, padding: "34px 40px 36px", translate: `${Math.sin(shake * Math.PI * 6) * 14 * (1 - shake)}px 0`, opacity: 1 - dim * 0.55 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: dark ? C.graphite : C.cream, border: `1px solid ${dark ? "#34322B" : LINE}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 24, color: dark ? C.cream : C.charcoal }}>B</div>
        <div>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 27, color: dark ? C.cream : C.charcoal }}>Sponsored</div>
          <div style={{ fontFamily: BODY, fontSize: 25, color: MUTED }}>www.yourbakery.in</div>
        </div>
      </div>
      <div style={{ marginTop: 22, fontFamily: HEAD, fontWeight: 500, fontSize: 56, letterSpacing: -1.6, lineHeight: 1.1, color: dark ? C.cream : C.charcoal, position: "relative" }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          {headSel > 0 ? <Selection p={headSel} pad={8}>{head}</Selection> : head}
          {strike > 0 ? <span style={{ position: "absolute", left: 0, top: "54%", height: 5, width: `${strike * 100}%`, background: C.charcoal, borderRadius: 3 }} /> : null}
        </span>
      </div>
      <div style={{ marginTop: 14, fontFamily: BODY, fontSize: 31, lineHeight: 1.4, color: dark ? C.stone : "#55534C" }}>{DESC}</div>
      <div style={{ marginTop: 22, position: "relative", padding: "18px 22px 18px 24px", borderRadius: 18, background: dark ? "rgba(167,255,63,0.06)" : "rgba(232,255,184,0.45)", boxShadow: aiFocus > 0 ? `0 0 0 ${3 * aiFocus}px ${C.lime}` : undefined, minHeight: 92 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 19, letterSpacing: 1.5, color: dark ? C.lime : INK }}>
          <Sparkle size={30} color={dark ? C.lime : INK} />
        </div>
        <div style={{ marginTop: 8, fontFamily: BODY, fontWeight: 500, fontSize: 34, lineHeight: 1.35, color: dark ? C.cream : C.charcoal }}>
          {shown}
          {aiP > 0 && aiP < 1 ? <span style={{ display: "inline-block", width: 3, height: 30, background: dark ? C.lime : C.charcoal, marginLeft: 3, verticalAlign: -4 }} /> : null}
        </div>
        {lock > 0 ? (
          <div style={{ position: "absolute", right: -26, top: -26, width: 64, height: 64, borderRadius: "50%", background: dark ? C.cream : C.charcoal, display: "flex", alignItems: "center", justifyContent: "center", scale: String(lock), boxShadow: "0 10px 26px rgba(0,0,0,0.25)" }}>
            <svg width={32} height={32} viewBox="0 0 24 24">
              <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" fill="none" stroke={dark ? C.charcoal : C.cream} strokeWidth={2.2} strokeLinecap="round" />
              <rect x={5} y={11} width={14} height={10} rx={2.5} fill={C.lime} />
            </svg>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ReviewCard: React.FC<{ n: number; text: string; w?: number; dark?: boolean; style?: React.CSSProperties }> = ({ n, text, w = 380, dark, style }) => (
  <div style={{ width: w, background: dark ? "#14130F" : "white", border: `1px solid ${dark ? "#2C2A24" : LINE}`, borderRadius: 22, boxShadow: dark ? "0 24px 60px rgba(0,0,0,0.5)" : "0 22px 54px rgba(30,28,20,0.11)", padding: "18px 22px", ...style }}>
    <Stars n={n} size={26} dark={dark} />
    <div style={{ marginTop: 10, fontFamily: BODY, fontWeight: 500, fontSize: 29, lineHeight: 1.3, color: dark ? C.cream : C.charcoal }}>{text}</div>
  </div>
);

const SearchBar: React.FC<{ text: string; w?: number }> = ({ text, w = 900 }) => (
  <div style={{ width: w, height: 104, borderRadius: 52, background: "white", border: `1px solid ${LINE}`, boxShadow: "0 18px 50px rgba(30,28,20,0.09)", display: "flex", alignItems: "center", padding: "0 34px", gap: 22 }}>
    <svg width={36} height={36} viewBox="0 0 24 24">
      <circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke={MUTED} strokeWidth={2} />
      <path d="M15.5 15.5L20 20" stroke={MUTED} strokeWidth={2} strokeLinecap="round" />
    </svg>
    <div style={{ fontFamily: BODY, fontSize: 36, color: C.charcoal }}>
      {text}
      <span style={{ display: "inline-block", width: 3, height: 38, background: C.charcoal, marginLeft: 4, verticalAlign: -6 }} />
    </div>
  </div>
);

const at = (x: number, y: number, extra?: React.CSSProperties): React.CSSProperties => ({ position: "absolute", left: x, top: y, ...extra });

// ------------------------------------------------------------------ 0. hook
const Hook: Beat = ({ f, c }) => {
  const google = c("google", 6);
  const writing = c("writing", 30);
  const edit = c("edit", 100);
  const aiP = ez(f, writing - 2, writing + 46, 0, 1, (t) => t);
  const move = ez(f, edit - 26, edit - 4, 0, 1, EASE_IO);
  const lock = f >= edit - 2 ? pop(f, edit - 2) : 0;
  const shake = ez(f, edit - 2, edit + 16, 0, 1, (t) => t);
  return (
    <>
      <div style={at(90, 380, { display: "flex", alignItems: "center", gap: 22, ...rise(f, google - 6, 30) })}>
        <Logo src="google-g.svg" h={70} />
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: MUTED }}>SEARCH ADS · NOW</div>
      </div>
      <div style={at(90, 490, rise(f, 2, 30))}>
        <SearchBar text={typed(f, "bakery near me", 4, 0.9)} />
      </div>
      <div style={at(90, 650, rise(f, writing - 14, 60, 18))}>
        <AdCard ai={AI_LINE} aiP={aiP} aiFocus={ez(f, writing, writing + 10)} lock={lock} shake={f >= edit - 2 ? shake : 0} />
      </div>
      {f > edit - 30 ? <Cursor x={interpolate(move, [0, 1], [980, 760])} y={interpolate(move, [0, 1], [1480, 1150])} press={ez(f, edit - 4, edit + 10)} /> : null}
    </>
  );
};

// ------------------------------------------------------------------ 1. where it is live
const COUNTRIES = [
  { k: "us", flag: "flag-us.svg", name: "United States" },
  { k: "uk", flag: "flag-uk.svg", name: "United Kingdom" },
  { k: "au", flag: "flag-au.svg", name: "Australia" },
  { k: "in", flag: "flag-in.svg", name: "India" },
];
const Where: Beat = ({ f, c }) => {
  const four = c("four", 10);
  return (
    <>
      <div style={at(90, 390, { ...rise(f, four - 4, 20), display: "flex", alignItems: "baseline", gap: 22 })}>
        <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 220, letterSpacing: -10, lineHeight: 0.9, color: C.charcoal }}>4</div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 32, color: MUTED, lineHeight: 1.3 }}>markets live
          <br />
          English only
        </div>
      </div>
      <div style={at(90, 700, { width: 900 })}>
        {COUNTRIES.map((n, k) => {
          const cue = c(n.k, four + 16 + k * 12);
          const india = n.k === "in";
          const glow = india ? ez(f, cue + 4, cue + 18) : 0;
          return (
            <div key={n.k} style={{ display: "flex", alignItems: "center", gap: 28, padding: "26px 34px", marginBottom: 18, borderRadius: 26, background: "white", border: `1px solid ${LINE}`, boxShadow: india ? `0 0 0 ${4 * glow}px ${C.lime}, ${SHADOW}` : "0 16px 40px rgba(30,28,20,0.08)", scale: String(1 + 0.03 * glow), ...rise(f, cue - 4, 46, 14) }}>
              <div style={{ width: 96, height: 64, borderRadius: 10, overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }}>
                <Logo src={n.flag} h={64} style={{ width: 96, objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, fontFamily: HEAD, fontWeight: 500, fontSize: 44, letterSpacing: -1, color: C.charcoal }}>{n.name}</div>
              <Check p={ez(f, cue + 2, cue + 14)} size={48} color={india ? C.lime : C.stone} />
            </div>
          );
        })}
      </div>
      <div style={at(90, 1420, { fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: MUTED, ...rise(f, c("in", 120) + 6, 14) })}>SEARCH CAMPAIGNS · EVERY AD POSITION</div>
    </>
  );
};

// ------------------------------------------------------------------ 2. what it is
const REVIEWS = [
  { n: 5, t: "Best sourdough in town.", x: 70, y: 400, r: -4 },
  { n: 5, t: "Staff were so kind to my kids.", x: 560, y: 380, r: 3 },
  { n: 4, t: "Cakes are always fresh.", x: 110, y: 620, r: 2 },
  { n: 5, t: "Great coffee, warm bread.", x: 600, y: 610, r: -3 },
];
const What: Beat = ({ f, c }) => {
  const reads = c("reads", 40);
  const web = c("web", 70);
  const writes = c("writes", 100);
  const scan = ez(f, reads - 4, web + 4, 0, 1, EASE_IO);
  const fly = ez(f, web, writes + 2, 0, 1, EASE_IO);
  const target = { x: 540, y: 1300 };
  return (
    <>
      {REVIEWS.map((r, k) => {
        const p = fly;
        const x = interpolate(p, [0, 1], [r.x, target.x - 190]);
        const y = interpolate(p, [0, 1], [r.y, target.y - 60]);
        return (
          <div key={k} style={at(x, y, { rotate: `${r.r * (1 - p)}deg`, scale: String(1 - 0.75 * p), opacity: 1 - ez(f, writes - 6, writes + 4), ...rise(f, 2 + k * 5, 40) })}>
            <ReviewCard n={r.n} text={r.t} />
          </div>
        );
      })}
      {scan > 0 && scan < 1 ? <div style={at(60, interpolate(scan, [0, 1], [380, 860]), { width: 960, height: 4, background: C.lime, boxShadow: `0 0 30px ${C.lime}`, borderRadius: 2 })} /> : null}
      <div style={at(90, 930, rise(f, web - 10, 40, 18))}>
        <AdCard ai={AI_LINE} aiP={ez(f, writes, writes + 40, 0, 1, (t) => t)} aiFocus={ez(f, writes - 4, writes + 8)} />
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 3. the pain
const Pain: Beat = ({ f, c }) => {
  const head = c("headline", 40);
  const inside = c("inside", 80);
  const change = c("change", 130);
  const off = c("off", 230);
  const move = ez(f, change - 24, change - 4, 0, 1, EASE_IO);
  const lock = f >= change - 2 ? pop(f, change - 2) : 0;
  const tagY = (p: number) => ({ opacity: p, translate: `${(1 - p) * -30}px 0` });
  return (
    <>
      <div style={at(90, 420, rise(f, 0, 50, 18))}>
        <AdCard ai={AI_LINE} headSel={ez(f, head - 6, head + 10)} aiFocus={ez(f, inside, inside + 12)} lock={lock} shake={f >= change - 2 ? ez(f, change - 2, change + 16, 0, 1, (t) => t) : 0} />
      </div>
      <div style={at(90, 330, { display: "flex", alignItems: "center", gap: 12, fontFamily: BODY, fontWeight: 700, fontSize: 32, color: C.charcoal, ...tagY(ez(f, head - 4, head + 10)) })}>
        <div style={{ height: 46, padding: "0 16px", borderRadius: 23, background: C.charcoal, color: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>You</div>
        wrote the headline
      </div>
      <div style={at(90, 965, { display: "flex", alignItems: "center", gap: 12, fontFamily: BODY, fontWeight: 700, fontSize: 32, color: C.charcoal, ...tagY(ez(f, inside, inside + 14)) })}>
        <Logo src="google-g.svg" h={46} />
        Google&apos;s AI wrote this line
      </div>
      {f > change - 28 && f < off + 10 ? <Cursor x={interpolate(move, [0, 1], [960, 640])} y={interpolate(move, [0, 1], [1460, 1010])} press={ez(f, change - 4, change + 10)} /> : null}
      <div style={at(90, 1090, { width: 900, display: "flex", alignItems: "center", gap: 24, padding: "24px 30px", borderRadius: 24, border: `2px dashed ${LINE}`, background: "rgba(255,255,255,0.6)", ...rise(f, off - 14, 30) })}>
        <div style={{ width: 96, height: 54, borderRadius: 27, background: LINE, position: "relative", opacity: 0.8 }}>
          <div style={{ position: "absolute", left: 6, top: 6, width: 42, height: 42, borderRadius: "50%", background: "white" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.charcoal }}>Off switch</div>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 1, color: MUTED, marginTop: 4 }}>NOT IN GOOGLE&apos;S HELP PAGE</div>
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 72, color: MUTED, lineHeight: 1 }}>?</div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 4. twist (lights down)
const TWIST_REVIEWS = [
  { n: 5, t: "Best sourdough in town." },
  { n: 1, t: "Waited 40 minutes." },
  { n: 5, t: "So kind to my kids." },
  { n: 2, t: "Cake was dry this time." },
  { n: 4, t: "Great coffee." },
];
const Twist: Beat = ({ f, c }) => {
  const positive = c("positive", 60);
  const predicts = c("predicts", 120);
  const better = c("better", 160);
  const meter = ez(f, predicts - 4, better + 2, 0, 1, EASE_IO) * 0.86;
  const on = ez(f, better, better + 12);
  return (
    <>
      {TWIST_REVIEWS.map((r, k) => {
        const bad = r.n < 3;
        const m = TWIST_REVIEWS.slice(0, k).filter((x) => x.n >= 3).length; // index among the good ones
        const out = bad ? ez(f, positive, positive + 18, 0, 1, (t) => t * t) : 0;
        const close = ez(f, positive + 12, positive + 30, 0, 1, EASE_IO);
        const y = bad ? 390 + k * 150 : interpolate(close, [0, 1], [390 + k * 150, 470 + m * 200]);
        return (
          <div key={k} style={at(70, y, { width: 420, ...rise(f, 4 + k * 4, 30) })}>
            <div style={{ translate: `${-560 * out}px 0`, rotate: `${-10 * out}deg`, opacity: 1 - out }}>
              <ReviewCard n={r.n} text={r.t} w={420} dark />
            </div>
          </div>
        );
      })}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map((m) => {
          const y = 470 + m * 200 + 58;
          const p = ez(f, positive + 30 + m * 3, positive + 48 + m * 3);
          return <path key={m} d={`M494 ${y} C 580 ${y}, 560 610, 640 610`} stroke={C.lime} strokeWidth={3} fill="none" opacity={0.85} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
        })}
      </svg>
      <div style={at(640, 470, { width: 380, ...rise(f, 10, 30) })}>
        <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: C.stone }}>INTO YOUR AD</div>
        <div style={{ marginTop: 12, padding: "20px 22px", borderRadius: 20, background: "#14130F", border: `1px solid #2C2A24`, boxShadow: `0 0 0 ${3 * on}px ${C.lime}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 17, letterSpacing: 1.5, color: C.lime }}>
            <Sparkle size={16} color={C.lime} />
            ONLY THE GOOD PARTS
          </div>
          <div style={{ marginTop: 8, fontFamily: BODY, fontWeight: 500, fontSize: 26, lineHeight: 1.35, color: C.cream, opacity: 0.35 + 0.65 * on }}>{AI_LINE}</div>
        </div>
      </div>
      <div style={at(90, 1180, { width: 900, ...rise(f, predicts - 12, 30) })}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: C.stone }}>
          <span>GOOGLE&apos;S PREDICTION</span>
          <span style={{ color: on > 0.5 ? C.lime : C.stone }}>{on > 0.5 ? "SHOW IT" : "WAIT"}</span>
        </div>
        <div style={{ marginTop: 16, height: 26, borderRadius: 13, background: C.graphite, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${meter * 100}%`, background: on > 0.5 ? C.lime : C.stone, borderRadius: 13 }} />
        </div>
        <div style={{ position: "relative", height: 40 }}>
          <div style={{ position: "absolute", left: "70%", top: -46, width: 3, height: 66, background: C.cream }} />
          <div style={{ position: "absolute", left: "70%", top: 26, translate: "-50% 0", fontFamily: BODY, fontSize: 22, color: C.stone, whiteSpace: "nowrap" }}>ad does better</div>
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 5. merge: reviews become ad copy
const Merge: Beat = ({ f, c }) => {
  const reviews = c("reviews", 10);
  const copy = c("copy", 40);
  const p = ez(f, reviews, copy, 0, 1, EASE_IO);
  return (
    <>
      {[0, 1, 2].map((k) => (
        <div key={k} style={at(interpolate(p, [0, 1], [90 + k * 170, 300]), interpolate(p, [0, 1], [420 + k * 40, 1050]), { rotate: `${(k - 1) * 5 * (1 - p)}deg`, scale: String(1 - 0.6 * p), opacity: 1 - ez(f, copy - 4, copy + 6), zIndex: 3 - k })}>
          <ReviewCard n={5} text={["Best sourdough in town.", "So kind to my kids.", "Great coffee, warm bread."][k]} w={440} />
        </div>
      ))}
      <div style={at(90, 760, rise(f, 0, 30))}>
        <AdCard ai={AI_LINE} aiFocus={ez(f, copy - 6, copy + 8)} />
      </div>
      <div style={at(90, 1410, { display: "flex", gap: 14, alignItems: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: MUTED, ...rise(f, copy, 14) })}>
        WRITTEN BY GOOGLE <span style={{ color: C.charcoal }}>·</span> FROM YOUR CUSTOMERS
      </div>
    </>
  );
};

// ------------------------------------------------------------------ 6. takeaway
const Takeaway: Beat = ({ f, c }) => {
  const stop = c("stop", 6);
  const ask = c("ask", 40);
  const loved = c("loved", 90);
  const writes = c("writes", 150);
  const text = "The sourdough is still warm at 8 am.";
  const retype = ez(f, writes - 2, writes + 38, 0, 1, (t) => t);
  const erase = ez(f, writes - 16, writes - 4, 0, 1, (t) => t);
  const ai = retype > 0 ? AI_NEW : AI_LINE;
  const aiP = retype > 0 ? retype : 1 - erase;
  return (
    <>
      <div style={at(90, 380, rise(f, 0, 30))}>
        <AdCard ai={ai} aiP={aiP} aiFocus={ez(f, writes - 6, writes + 6)} strike={ez(f, stop + 4, stop + 20, 0, 1, EASE_IO)} w={900} dim={ez(f, ask - 6, ask + 6) * (1 - ez(f, writes - 18, writes - 6))} />
      </div>
      <div style={at(170, 980, { width: 740, borderRadius: 44, background: C.charcoal, padding: 16, boxShadow: "0 40px 100px rgba(30,28,20,0.3)", ...rise(f, ask - 10, 80, 18) })}>
        <div style={{ borderRadius: 32, background: "white", padding: "26px 30px 30px" }}>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, color: C.charcoal }}>Rate Your Bakery</div>
          <div style={{ marginTop: 14 }}>
            <Stars n={Math.min(5, Math.floor(ez(f, ask + 2, ask + 22) * 5.99))} size={44} />
          </div>
          <div style={{ marginTop: 18, minHeight: 92, borderRadius: 18, border: `1px solid ${LINE}`, padding: "16px 18px", fontFamily: BODY, fontSize: 29, lineHeight: 1.35, color: C.charcoal }}>
            <Selection p={ez(f, loved + 18, loved + 32)} pad={4}>{typed(f, text, c("exactly", 70) - 4, 1.1)}</Selection>
          </div>
        </div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ the scrolling page
const ORDER = ["hook", "where", "what", "pain", "twist", "merge", "takeaway"];
const BEATS: Record<string, Beat> = { hook: Hook, where: Where, what: What, pain: Pain, twist: Twist, merge: Merge, takeaway: Takeaway };
const DARK = new Set(["twist"]);
const STEP = 1500; // page distance between beats
const MOVE = 20; // frames of scroll

export const ReviewScene: React.FC<SceneProps> = ({ data }) => {
  const f = useCurrentFrame();
  const w = data._world as { i: number; starts: number[]; durs: number[]; cues: Record<string, number>[] };
  const i = ORDER.indexOf(data.beat as string);
  const g = w.starts[w.i] + f;
  const t = i === 0 ? 1 : ez(f, 0, MOVE, 0, 1, EASE_IO);
  const camY = (i - 1 + t) * STEP;
  const v = Math.sin(Math.PI * t); // scroll speed profile
  const tilt = i === 0 ? 0 : 7 * v;
  const blur = i === 0 ? 0 : 18 * Math.pow(v, 1.5);
  const push = i === 0 ? interpolate(f, [0, 40], [1.08, 1], { ...clamp, easing: EASE }) : 1 - 0.06 * v;
  const drift = interpolate(f, [MOVE, Math.max(MOVE + 1, w.durs[w.i])], [1, 1.025], clamp);
  // lights-down: the dark beat fades the page to charcoal as it arrives; the next beat fades it back up
  const isDark = DARK.has(ORDER[i]);
  const prevDark = i > 0 && DARK.has(ORDER[i - 1]);
  const dk = isDark ? ez(f, 4, 22, 0, 1, EASE_IO) : prevDark ? 1 - ez(f, 4, 22, 0, 1, EASE_IO) : 0;
  const fid = `rv${w.i}`;
  const visible = [i - 1, i].filter((j) => j >= 0);
  return (
    <AbsoluteFill style={{ background: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: C.charcoal, opacity: dk }} />
      {dk > 0 ? <AbsoluteFill style={{ background: "radial-gradient(ellipse 55% 38% at 50% 44%, rgba(167,255,63,0.07), rgba(10,10,10,0) 70%)", opacity: dk }} /> : null}
      {dk < 1 ? <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 42%, rgba(255,255,255,0.8), rgba(246,244,237,0) 70%)", opacity: 1 - dk }} /> : null}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={fid} x="-5%" y="-10%" width="110%" height="120%">
          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(2)}`} />
        </filter>
      </svg>
      <AbsoluteFill style={{ perspective: 1800, filter: blur > 0.4 ? `url(#${fid})` : undefined }}>
        <AbsoluteFill style={{ transformOrigin: "50% 50%", transform: `rotateX(${tilt}deg) scale(${push * drift})` }}>
          {visible.map((j) => {
            const B = BEATS[ORDER[j]];
            const fj = g - w.starts[j];
            const cj: Cue = (n, fb) => (w.cues[j]?.[n] ?? fb) as number;
            const y = j * STEP - camY;
            const darkBeat = DARK.has(ORDER[j]);
            // a beat that is not the dark one fades out while the page is dark, and the reverse
            const op = darkBeat ? (j === i ? dk : 1 - ez(f, 0, 14)) : j === i ? 1 - (isDark ? dk : 0) : prevDark && j === i - 1 ? 1 - ez(f, 0, 14) : 1;
            return (
              <div key={j} style={{ position: "absolute", left: 0, top: y, width: 1080, height: 1920, opacity: op }}>
                <B f={fj} D={w.durs[j]} c={cj} g={g} dark={darkBeat} />
              </div>
            );
          })}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const REVIEW_SCENES: Record<string, React.FC<SceneProps>> = { gReview: ReviewScene };
