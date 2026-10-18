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
const ShotView: React.FC<{ s: Shot; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const aspect = s.aspect ?? 16 / 9;
  // Ad footage is scaled taller than the frame so its burned-in subtitle band sits below the bottom edge.
  const vh = s.h ?? (aspect > 1 ? 2240 : 1920);
  const vw = Math.max(1080, vh * aspect);
  const left = (1080 - vw) * (s.x ?? 0.5);
  const top = (1920 - vh) * (s.y ?? 0);
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
export const Shots: React.FC<{ shots: Shot[] }> = ({ shots }) => {
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
            <ShotView s={s} dur={len} />
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

const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", right: 70, top: 240, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: "rgba(246,244,237,0.75)", background: "rgba(10,10,10,0.55)", borderRadius: 8, padding: "6px 10px" }}>{text}</div>
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
      <Bubble text="“Do we need one that big?”" at={doubt} x={110} y={330} struck={answer - 8} />
      <Bubble text="“Go one size bigger.”" at={answer} x={300} y={560} color={C.lime} tail="right" />
    </>
  );
};

const LinesOverlay: React.FC<{ data: SceneProps["data"] }> = ({ data }) => {
  const frame = useCurrentFrame();
  const items = data.lines as { label: string; line: string; at: number }[];
  const cur = items.filter((it) => frame >= it.at).length - 1;
  if (cur < 0) return null;
  const it = items[cur];
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center" }}>
        <div key={it.label} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: C.charcoal, background: C.cream, borderRadius: 999, padding: "8px 20px" }}>{it.label}</div>
      </div>
      <Bubble key={it.line} text={it.line} at={it.at + 6} x={120} y={1060} />
    </>
  );
};

const CommentsOverlay: React.FC<{ data: SceneProps["data"]; c: (n: string, f: number) => number }> = ({ data, c }) => {
  const pop = usePop();
  const at = c("comments", 10);
  const rows = data.comments as { name: string; text: string }[];
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 760, display: "flex", flexDirection: "column", gap: 14 }}>
      {rows.map((r, i) => (
        <div key={r.name} style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(10,10,10,0.82)", border: "1.5px solid rgba(246,244,237,0.15)", borderRadius: 22, padding: "16px 20px", ...pop(at + i * 9, { rise: 26, scale: 0.94 }) }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: [FK_YELLOW, C.lime, "#F28C8C", "#9FC4FF"][i % 4], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 24, color: C.charcoal, flexShrink: 0 }}>{r.name[0]}</div>
          <div>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 20, color: C.grey }}>{r.name}</div>
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, color: C.cream }}>{r.text}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 30 }}>♡</div>
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------ the scene
export const FAdScene: React.FC<SceneProps> = ({ data }) => {
  const c = cueOf(data);
  const kind = data.overlay as string | undefined;
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <Shots shots={data.shots as Shot[]} />
      <Shade />
      {data.credit ? <Credit text={data.credit} /> : null}
      {kind === "hook" ? <HookOverlay c={c} /> : null}
      {kind === "sizes" ? <SizesOverlay c={c} /> : null}
      {kind === "bill" ? <BillOverlay c={c} /> : null}
      {kind === "doubt" ? <DoubtOverlay c={c} /> : null}
      {kind === "lines" ? <LinesOverlay data={data} /> : null}
      {kind === "comments" ? <CommentsOverlay data={data} c={c} /> : null}
    </AbsoluteFill>
  );
};

export const FK_SCENES: Record<string, React.FC<SceneProps>> = { fAd: FAdScene };
