// Decoy effect reel v2 (9:16): real footage underneath, clean price-tag overlays that show the choice moving.
// Overlays carry prices and counts only; captions carry the words. Backgrounds: brand charcoal or cream.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";
import { usePop } from "./tut";
import { Shade, Shots, type Shot } from "./flipkart";

const RED = "#E5484D";
const cueOf = (d: SceneProps["data"]) => (name: string, fb: number): number => (d.cues?.[name] ?? fb) as number;

type Opt = { name: string; price: string; sub?: string };

/** A row of price tags; `on` = which tags exist, `glow` = winner, `dim` = decoy, `gone` = removed. */
const Tags: React.FC<{ opts: Opt[]; on: boolean[]; glow?: number; dim?: number; gone?: number; goneAt?: number; top: number; stamp?: string }> = ({ opts, on, glow, dim, gone, goneAt = 0, top, stamp }) => {
  const frame = useCurrentFrame();
  const visible = opts.map((o, i) => ({ o, i })).filter(({ i }) => on[i]);
  const fall = gone != null ? interpolate(frame, [goneAt, goneAt + 16], [0, 1], { ...clamp, easing: EASE_IO }) : 0;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", gap: 16, justifyContent: "center" }}>
      {visible.map(({ o, i }) => {
        const isGlow = glow === i;
        const isDim = dim === i;
        const isGone = gone === i;
        const s = spring({ frame, fps: 30, config: { damping: 12, stiffness: 200 } });
        return (
          <div key={o.name} style={{ flex: 1, maxWidth: 300, position: "relative", borderRadius: 26, padding: "20px 20px 22px", background: isGlow ? C.lime : C.cream, color: C.charcoal, boxShadow: isGlow ? "0 0 0 4px rgba(167,255,63,0.4), 0 30px 70px rgba(167,255,63,0.35)" : "0 30px 70px rgba(0,0,0,0.55)", opacity: (isDim ? 0.55 : 1) * (1 - fall * (isGone ? 1 : 0)), translate: isGone ? `0 ${fall * 300}px` : undefined, rotate: isGone ? `${fall * 18}deg` : undefined, scale: isGlow ? String(1.04 + 0.02 * Math.sin(frame / 6)) : String(0.9 + 0.1 * s) }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 3, opacity: 0.7 }}>{o.name.toUpperCase()}</div>
            <div style={{ fontFamily: SERIF, fontSize: 70, lineHeight: 1.05 }}>{o.price}</div>
            {o.sub ? <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 19, opacity: 0.75 }}>{o.sub}</div> : null}
            {isDim && stamp ? <div style={{ position: "absolute", left: "50%", top: "40%", translate: "-50% -50%", rotate: "-12deg", fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: RED, border: `4px solid ${RED}`, borderRadius: 10, padding: "4px 12px", background: "rgba(246,244,237,0.9)" }}>{stamp}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

/** 60 customer dots that drift into the tag columns according to `shares` (per visible tag). */
const Crowd: React.FC<{ shares: number[]; from?: number[]; at: number; top: number; cols: number }> = ({ shares, from, at, top, cols }) => {
  const frame = useCurrentFrame();
  const N = 60;
  const W = 940;
  const colW = W / cols;
  const assign = (sh: number[]) => {
    const out: number[] = [];
    sh.forEach((n, c) => {
      for (let k = 0; k < Math.round((n / 100) * N); k++) out.push(c);
    });
    while (out.length < N) out.push(sh.length - 1);
    return out.slice(0, N);
  };
  const a = assign(shares);
  const b = from ? assign(from) : null;
  const counts: number[] = new Array(cols).fill(0);
  return (
    <div style={{ position: "absolute", left: 70, top, width: W, height: 260 }}>
      {a.map((col, i) => {
        const p = interpolate(frame, [at + (i % 20), at + 24 + (i % 20)], [0, 1], { ...clamp, easing: EASE });
        const k = counts[col]++;
        const tx = col * colW + colW / 2 - 90 + (k % 8) * 24;
        const ty = Math.floor(k / 8) * 24;
        let sx: number;
        let sy: number;
        if (b) {
          const kb = a.slice(0, i).filter((x) => x === b[i]).length;
          sx = b[i] * colW + colW / 2 - 90 + (kb % 8) * 24;
          sy = Math.floor(kb / 8) * 24;
        } else {
          sx = random(`cx${i}`) * (W - 20);
          sy = 200 + random(`cy${i}`) * 50;
        }
        const x = interpolate(p, [0, 1], [sx, tx]);
        const y = interpolate(p, [0, 1], [sy, ty]) - Math.sin(p * Math.PI) * 60;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 18, borderRadius: "50%", background: C.cream, boxShadow: "0 2px 6px rgba(0,0,0,0.5)", opacity: interpolate(frame, [0, 6], [0, 1], clamp) }} />;
      })}
    </div>
  );
};

const Tag: React.FC<{ text: string; top?: number; color?: string; bg?: string }> = ({ text, top = 250, color = C.charcoal, bg = C.cream }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center" }}>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color, background: bg, borderRadius: 999, padding: "8px 20px" }}>{text}</div>
  </div>
);

export const DxScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const kind = data.overlay as string;
  const opts = data.opts as Opt[];
  let body: React.ReactNode = null;
  if (kind === "hook") {
    const blink = c("medium", 60);
    const on = frame >= blink && Math.floor((frame - blink) / 5) % 2 === 0 && frame < blink + 30;
    body = (
      <>
        <Tag text="WHY YOU BUY THE LARGE" />
        <div style={pop(c("tags", 10), { rise: 40, scale: 0.9 })}>
          <Tags opts={opts} on={[true, true, true]} glow={2} dim={on ? 1 : undefined} top={1030} />
        </div>
      </>
    );
  } else if (kind === "flow") {
    const mAt = c("medium", 150);
    const before = frame < mAt;
    body = (
      <>
        <Tag text="EXAMPLE PRICES" />
        {before ? (
          <>
            <Tags opts={[opts[0], opts[2]]} on={[true, true]} top={760} />
            <Crowd shares={[70, 30]} at={c("split", 40)} top={1080} cols={2} />
          </>
        ) : (
          <>
            <div style={pop(mAt, { rise: 30, scale: 1 })}>
              <Tags opts={opts} on={[true, true, true]} glow={frame > mAt + 30 ? 2 : undefined} top={760} />
            </div>
            <Crowd shares={[20, 5, 75]} from={[70, 0, 30]} at={mAt + 14} top={1080} cols={3} />
          </>
        )}
      </>
    );
  } else if (kind === "decoy") {
    body = <Tags opts={opts} on={[true, true, true]} glow={2} dim={frame >= c("decoy", 20) ? 1 : undefined} stamp="DECOY" top={1020} />;
  } else if (kind === "test") {
    const rmAt = c("remove", 200);
    const split = frame < rmAt ? (data.with as number[]) : (data.without as number[]);
    const g = interpolate(frame, [frame < rmAt ? c("result", 120) : rmAt + 16, (frame < rmAt ? c("result", 120) : rmAt + 16) + 24], [0, 1], { ...clamp, easing: EASE });
    body = (
      <>
        <Tag text={data.tag} />
        <div style={pop(c("cards", 10), { rise: 40, scale: 0.9 })}>
          <Tags opts={opts} on={[true, true, true]} glow={frame >= c("result", 120) && frame < rmAt ? 2 : frame >= rmAt + 20 ? 0 : undefined} gone={frame >= rmAt ? 1 : undefined} goneAt={rmAt} top={700} />
        </div>
        <div style={{ position: "absolute", left: 90, right: 90, top: 1080, display: "flex", gap: 10, height: 44, borderRadius: 14, overflow: "hidden", opacity: g }}>
          {split.map((v, i) => (v > 0 ? <div key={i} style={{ width: `${v * g}%`, background: i === (frame < rmAt ? 2 : 0) ? C.lime : C.stone, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.charcoal }}>{v}</div> : null))}
        </div>
        <div style={{ position: "absolute", left: 90, right: 90, top: 1140, textAlign: "center", fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: C.stone, opacity: g }}>{data.note}</div>
      </>
    );
  } else if (kind === "gym") {
    const addAt = c("add", 120);
    const best = c("obvious", 200);
    body = (
      <>
        <Tag text="YOUR PRICING" />
        <Tags opts={opts} on={[true, frame >= addAt, true]} glow={frame >= best ? 2 : undefined} top={1000} />
        {frame >= best ? <div style={{ position: "absolute", right: 110, top: 960, ...pop(best, { rise: 20, scale: 0.5 }) }}><div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: C.charcoal, background: C.cream, borderRadius: 10, padding: "6px 12px", rotate: "6deg" }}>BEST VALUE</div></div> : null}
      </>
    );
  } else if (kind === "save") {
    const s = spring({ frame: frame - 6, fps: 30, config: { damping: 10, stiffness: 180 } });
    body = (
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center" }}>
        <svg width={170} height={210} viewBox="0 0 34 42" style={{ scale: String(0.6 + 0.4 * s) }}>
          <path d="M3 2 H31 V40 L17 30 L3 40 Z" fill={C.lime} stroke={C.charcoal} strokeWidth={1.5} />
        </svg>
      </div>
    );
  }
  return (
    <AbsoluteFill style={{ background: C.charcoal }}>
      <Shots shots={data.shots as Shot[]} />
      <Shade />
      <AbsoluteFill style={{ background: "rgba(10,10,10,0.18)" }} />
      {body}
      {data.credit ? <div style={{ position: "absolute", right: 70, top: 240, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: "rgba(246,244,237,0.75)" }}>{data.credit}</div> : null}
      <span style={{ display: "none" }}>{HEAD}</span>
    </AbsoluteFill>
  );
};

export const DX_SCENES: Record<string, React.FC<SceneProps>> = { dReel: DxScene };
