// Flipkart ad breakdown (9:16): real ad shots (muted, credited, subtitles framed off-screen) and licensed stock,
// with real-looking UI overlays that show the idea. Backgrounds are brand charcoal only.
import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";
import { usePop } from "./tut";

const FK_BLUE = "#2874F0";
const FK_YELLOW = "#FFE11B";
const RED = "#E5484D";
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;

export type Shot = { src?: string; t: number; d: number; x?: number; y?: number; aspect?: number; h?: number; rate?: number; push?: number };

/** One footage shot: cover-fit by hand (Video ignores objectFit), focus x, slow push-in. */
const ShotView: React.FC<{ s: Shot; dur: number; box?: { w: number; h: number } }> = ({ s, dur, box }) => {
  const frame = useCurrentFrame();
  const aspect = s.aspect ?? 16 / 9;
  const W = box?.w ?? 1080;
  const H = box?.h ?? 1920;
  // Ad footage is scaled taller than its frame so the burned-in subtitle band sits below the bottom edge.
  const vh = box ? H * 1.16 : s.h ?? (aspect > 1 ? 2240 : 1920);
  const vw = Math.max(W, vh * aspect);
  const left = (W - vw) * (s.x ?? 0.5);
  const top = box ? 0 : (H - vh) * (s.y ?? 0);
  const push = interpolate(frame, [0, dur], [1, 1 + (s.push ?? 0.06)], clamp);
  return (
    <AbsoluteFill style={{ background: C.charcoal, overflow: "hidden" }}>
      <div style={{ position: "absolute", left, top, width: vw, height: vh, scale: String(push), transformOrigin: `${(s.x ?? 0.5) * 100}% 35%` }}>
        <Video src={staticFile(s.src ?? "media/flipkart/ad_full.mp4")} muted trimBefore={Math.round(s.t * 30)} playbackRate={s.rate ?? 1} style={{ width: "100%", height: "100%", filter: "contrast(1.06) saturate(1.05)" }} />
      </div>
    </AbsoluteFill>
  );
};

/** Sequential cuts through a list of shots, each lasting d seconds (the last one holds to the end). */
export const Shots: React.FC<{ shots: Shot[]; box?: { w: number; h: number } }> = ({ shots, box }) => {
  const { durationInFrames: D } = useVideoConfig();
  let at = 0;
  return (
    <>
      {shots.map((s, i) => {
        const from = at;
        const len = i === shots.length - 1 ? Math.max(1, D - from) : Math.round(s.d * 30);
        at += len;
        return (
          <Sequence key={i} from={from} durationInFrames={len} layout="none">
            <ShotView s={s} dur={len} box={box} />
          </Sequence>
        );
      })}
    </>
  );
};

export const Shade: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0) 22%, rgba(10,10,10,0) 55%, rgba(10,10,10,0.88) 100%)" }} />
);

const FkTile: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.24, background: FK_BLUE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(0,0,0,0.4)", flexShrink: 0 }}>
    <Img src={staticFile("media/flipkart/flipkart-yellow.svg")} style={{ width: size * 0.62, height: size * 0.62 }} />
  </div>
);

const Bubble: React.FC<{ text: string; at: number; x: number; y: number; color?: string; ink?: string; struck?: number; tail?: "left" | "right" }> = ({ text, at, x, y, color = C.cream, ink = C.charcoal, struck, tail = "left" }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps: 30, config: { damping: 12, stiffness: 200 } });
  const k = struck != null ? interpolate(frame, [struck, struck + 10], [0, 1], { ...clamp, easing: EASE }) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, scale: String(0.6 + 0.4 * s), opacity: Math.min(1, s * 2), transformOrigin: tail === "left" ? "0% 100%" : "100% 100%" }}>
      <div style={{ position: "relative", background: color, color: ink, borderRadius: 30, padding: "20px 30px", fontFamily: HEAD, fontWeight: 700, fontSize: 44, whiteSpace: "nowrap", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        {text}
        {k > 0 ? <div style={{ position: "absolute", left: 20, right: 20, top: "50%", height: 7, borderRadius: 4, background: RED, transformOrigin: "0% 50%", scale: `${k} 1` }} /> : null}
      </div>
      <div style={{ position: "absolute", [tail]: 46, bottom: -18, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `20px solid ${color}` }} />
    </div>
  );
};

// ------------------------------------------------------------------ overlays
const HookOverlay: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const pop = usePop();
  const at = c("brand", 6);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", ...pop(0, { scale: 1, rise: 10 }) }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: C.charcoal, background: C.lime, borderRadius: 999, padding: "8px 20px" }}>AD BREAKDOWN</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center", ...pop(at, { rise: 40, scale: 0.7 }) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, background: "rgba(255,255,255,0.97)", borderRadius: 32, padding: "18px 30px 18px 18px", boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>
          <FkTile size={110} />
          <div>
            <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 54, color: FK_BLUE, lineHeight: 1, fontStyle: "italic" }}>Flipkart</div>
            <div style={{ marginTop: 10, display: "inline-block", fontFamily: HEAD, fontWeight: 800, fontSize: 26, letterSpacing: 1, color: FK_BLUE, background: FK_YELLOW, borderRadius: 10, padding: "6px 14px" }}>BIG BILLION DAYS</div>
          </div>
        </div>
      </div>
    </>
  );
};

const SizesOverlay: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const sizes = ['43"', '50"', '55"', '65"'];
  const steps = [0, c("s50", 60), c("s55", 100)];
  const idx = steps.filter((a) => frame >= a).length - 1;
  const at = c("sheet", 20);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1040, background: "white", borderRadius: 30, padding: "24px 26px", boxShadow: "0 30px 70px rgba(0,0,0,0.55)", ...pop(at, { rise: 60, scale: 0.9 }) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <FkTile size={44} />
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: "#212121" }}>Select screen size</div>
        <div style={{ marginLeft: "auto", fontFamily: BODY, fontWeight: 700, fontSize: 20, color: "#388E3C" }}>4K · Smart TV</div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
        {sizes.map((s, i) => {
          const on = i === idx;
          const s2 = spring({ frame: frame - (steps[idx] ?? 0), fps: 30, config: { damping: 11, stiffness: 220 } });
          return (
            <div key={s} style={{ flex: 1, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 40, padding: "16px 0", borderRadius: 16, border: `3px solid ${on ? FK_BLUE : "#E0E0E0"}`, color: on ? FK_BLUE : "#9E9E9E", background: on ? "#EEF4FF" : "white", scale: on ? String(1 + 0.08 * (1 - s2) + 0.04) : "1" }}>
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BillOverlay: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const at = c("bigger", 20);
  const bill = c("bill", 60);
  const g = interpolate(frame, [at, at + 30], [0, 1], { ...clamp, easing: EASE_IO });
  const inch = Math.round(interpolate(g, [0, 1], [43, 55]));
  const w = interpolate(g, [0, 1], [300, 470]);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1000, height: 380, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, ...pop(at - 6, { rise: 30, scale: 0.8 }) }}>
        <div style={{ width: w, height: w * 0.5625, borderRadius: 12, border: "8px solid #111", overflow: "hidden", background: C.charcoal, boxShadow: `0 0 ${40 + 40 * g}px rgba(40,116,240,0.5)` }}>
          <Video src={staticFile("media/flipkart/ad_full.mp4")} muted trimBefore={Math.round(68.6 * 30)} style={{ width: "100%", height: "112%" }} />
        </div>
        <div style={{ width: 90, height: 10, borderRadius: 5, background: "#2A2A2A", marginTop: -4 }} />
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 44, color: C.cream }}>{inch}"</div>
      </div>
      <div style={{ width: 300, background: C.cream, borderRadius: 18, padding: "20px 22px", boxShadow: "0 30px 70px rgba(0,0,0,0.55)", ...pop(bill, { rise: 40, scale: 0.8 }) }}>
        <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: "#77756D" }}>YOUR BILL</div>
        <div style={{ fontFamily: SERIF, fontSize: 64, color: C.charcoal, lineHeight: 1.1 }}>₹1,999</div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 20, color: "#55534C" }}>a month, EMI*</div>
        <div style={{ marginTop: 10, fontFamily: MONO, fontWeight: 700, fontSize: 18, color: "#2E7D32" }}>= SAME</div>
      </div>
    </div>
  );
};

const DoubtOverlay: React.FC<{ c: (n: string, f: number) => number }> = ({ c }) => {
  const doubt = c("doubt", 30);
  const answer = c("answer", 90);
  return (
    <>
      <Bubble text="“Do we need one that big?”" at={doubt} x={90} y={960} struck={answer - 8} />
      <Bubble text="“Go one size bigger.”" at={answer} x={330} y={1150} color={C.lime} tail="right" />
    </>
  );
};

// ------------------------------------------------------------------ motion-graphic beats (no footage)
/** Living charcoal canvas: two slow brand glows and drifting lime specks, so graphic scenes never sit still. */
export const Canvas: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.charcoal, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", left: -200 + Math.sin(frame / 50) * 120, top: 200 + Math.cos(frame / 60) * 80, background: "radial-gradient(circle, rgba(167,255,63,0.16), rgba(167,255,63,0) 65%)" }} />
      <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", right: -260 + Math.cos(frame / 55) * 100, top: 900 + Math.sin(frame / 45) * 90, background: "radial-gradient(circle, rgba(40,116,240,0.14), rgba(40,116,240,0) 65%)" }} />
      {new Array(18).fill(0).map((_, i) => {
        const x = (i * 137) % 1000 + 40;
        const y = ((i * 263 + frame * (0.6 + (i % 5) * 0.2)) % 2000) - 40;
        return <div key={i} style={{ position: "absolute", left: x, top: 1920 - y, width: 6, height: 6, borderRadius: 2, background: C.lime, opacity: 0.25 + (i % 3) * 0.15 }} />;
      })}
    </AbsoluteFill>
  );
};

type Craft = { label: string; line: string; brand: string; icon: string; tint: string; ad: string; at: number };
/** A customer's everyday line flies into a phone and becomes the ad headline (example ads). */
const CraftBeat: React.FC<{ items: Craft[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const cur = Math.max(0, items.filter((it) => frame >= it.at).length - 1);
  const it = items[cur];
  const t = frame - it.at;
  const fly = interpolate(t, [10, 30], [0, 1], { ...clamp, easing: EASE_IO });
  const typed = it.ad.slice(0, Math.max(0, Math.floor((t - 30) * 1.6)));
  const enter = spring({ frame: t, fps: 30, config: { damping: 14, stiffness: 160 } });
  const tilt = Math.sin(frame / 40) * 4;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", gap: 14 }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: C.charcoal, background: C.lime, borderRadius: 999, padding: "8px 18px" }}>{it.label}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: C.stone, border: "2px solid #333", borderRadius: 999, padding: "6px 16px" }}>EXAMPLE</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 340, width: 480, height: 940, perspective: 1600 }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 64, background: "#111", border: "10px solid #2A2A2A", boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 80px rgba(167,255,63,0.12)", rotate: `y ${-14 + tilt}deg`, overflow: "hidden", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 6px" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: it.tint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{it.icon}</div>
            <div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: C.cream }}>{it.brand}</div>
              <div style={{ fontFamily: BODY, fontSize: 16, color: C.grey }}>Sponsored</div>
            </div>
          </div>
          <div style={{ height: 420, borderRadius: 24, background: `linear-gradient(160deg, ${it.tint}, #141414)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 170, scale: String(0.9 + 0.1 * enter) }}>{it.icon}</div>
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 38, lineHeight: 1.15, color: C.cream, padding: "22px 8px 0", minHeight: 150 }}>
            {typed}
            {typed.length < it.ad.length && t > 30 ? <span style={{ color: C.lime }}>▍</span> : null}
          </div>
          <div style={{ margin: "10px 8px", display: "inline-block", fontFamily: BODY, fontWeight: 800, fontSize: 22, color: C.charcoal, background: C.lime, borderRadius: 12, padding: "10px 18px", opacity: typed.length >= it.ad.length ? 1 : 0.25 }}>Order now</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: interpolate(fly, [0, 1], [70, 340]), top: interpolate(fly, [0, 1], [1150, 880]), scale: String(interpolate(fly, [0, 1], [1, 0.4])), opacity: 1 - fly, transformOrigin: "0 0" }}>
        <div style={{ background: C.cream, color: C.charcoal, borderRadius: 30, padding: "18px 26px", fontFamily: HEAD, fontWeight: 700, fontSize: 42, whiteSpace: "nowrap", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", scale: String(0.7 + 0.3 * enter) }}>{it.line}</div>
      </div>
    </>
  );
};

/** An Instagram-style comment sheet sliding up on cream, filling with replies and hearts. */
const CommentSheet: React.FC<{ rows: { name: string; text: string }[]; at: number }> = ({ rows, at }) => {
  const frame = useCurrentFrame();
  const up = spring({ frame, fps: 30, config: { damping: 16, stiffness: 120 } });
  return (
    <div style={{ position: "absolute", left: 64, right: 64, top: 300, height: 1100, borderRadius: 48, background: C.cream, translate: `0 ${(1 - up) * 900}px`, boxShadow: "0 -30px 80px rgba(0,0,0,0.5)", padding: "26px 34px" }}>
      <div style={{ width: 90, height: 8, borderRadius: 4, background: "#CFCBBE", margin: "0 auto" }} />
      <div style={{ textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 30, color: C.charcoal, marginTop: 18 }}>Comments</div>
      {rows.map((r, i) => {
        const a = at + i * 10;
        const p = spring({ frame: frame - a, fps: 30, config: { damping: 13, stiffness: 180 } });
        const liked = frame > a + 18;
        return (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 30, opacity: frame >= a ? 1 : 0, translate: `0 ${(1 - p) * 30}px` }}>
            <div style={{ width: 66, height: 66, borderRadius: "50%", background: [FK_YELLOW, C.lime, "#F28C8C", "#9FC4FF"][i % 4], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 28, color: C.charcoal }}>{r.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, color: "#55534C" }}>{r.name.toLowerCase()}</div>
              <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 32, color: C.charcoal }}>{r.text}</div>
            </div>
            <div style={{ fontSize: 34, color: liked ? RED : "#9A9A93", scale: liked ? String(1 + 0.4 * Math.max(0, 1 - (frame - a - 18) / 8)) : "1" }}>{liked ? "♥" : "♡"}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 34, right: 34, bottom: 30, height: 80, borderRadius: 40, border: "2px solid #CFCBBE", display: "flex", alignItems: "center", padding: "0 28px", fontFamily: BODY, fontSize: 26, color: "#9A9A93" }}>
        Add a comment…<span style={{ marginLeft: 6, color: C.charcoal, opacity: Math.floor(frame / 15) % 2 ? 1 : 0 }}>|</span>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ the scene
const CARD = { x: 60, y: 400, w: 960, h: 540 };

export const FAdScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const kind = data.overlay as string | undefined;
  if (data.mode === "graphic") {
    return (
      <AbsoluteFill>
        <Canvas />
        {kind === "craft" ? <CraftBeat items={data.items as Craft[]} /> : null}
        {kind === "comments" ? <CommentSheet rows={data.comments} at={c("comments", 12)} /> : null}
      </AbsoluteFill>
    );
  }
  // Ad footage is shown whole, as a floating 16:9 cinema card on the brand canvas: no crop, no stretch.
  const enter = spring({ frame, fps: 30, config: { damping: 16, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <Canvas />
      <div style={{ position: "absolute", left: CARD.x, top: CARD.y + Math.sin(frame / 30) * 6, width: CARD.w, height: CARD.h, borderRadius: 30, overflow: "hidden", border: "2px solid rgba(246,244,237,0.14)", boxShadow: "0 50px 120px rgba(0,0,0,0.75), 0 0 60px rgba(167,255,63,0.10)", scale: String(0.94 + 0.06 * enter) }}>
        <Shots shots={data.shots as Shot[]} box={{ w: CARD.w, h: CARD.h }} />
      </div>
      {data.credit ? <div style={{ position: "absolute", right: 60, top: CARD.y + CARD.h + 18, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: "rgba(246,244,237,0.6)" }}>{data.credit}</div> : null}
      {kind === "hook" ? <HookOverlay c={c} /> : null}
      {kind === "sizes" ? <SizesOverlay c={c} /> : null}
      {kind === "bill" ? <BillOverlay c={c} /> : null}
      {kind === "doubt" ? <DoubtOverlay c={c} /> : null}
    </AbsoluteFill>
  );
};

export const FK_SCENES: Record<string, React.FC<SceneProps>> = { fAd: FAdScene };
