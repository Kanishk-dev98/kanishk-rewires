// Decoy effect reel v2 (9:16): real footage underneath, clean price-tag overlays that show the choice moving.
// Overlays carry prices and counts only; captions carry the words. Backgrounds: brand charcoal or cream.
import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, SERIF } from "./brand";
import type { SceneProps } from "./scenes";
import { usePop } from "./tut";
import { Canvas, Shade, Shots, type Shot } from "./flipkart";

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


// ================================================================== motion-graphic scenes (no footage)
/** Illustrated popcorn tub with popping kernels; `glow` lights it lime, `dim` greys it. */
const Tub: React.FC<{ h: number; glow?: boolean; dim?: boolean; seed: number }> = ({ h, glow, dim, seed }) => {
  const frame = useCurrentFrame();
  const w = h * 0.72;
  return (
    <div style={{ position: "relative", width: w, height: h, opacity: dim ? 0.45 : 1, filter: glow ? "drop-shadow(0 0 40px rgba(167,255,63,0.55))" : "drop-shadow(0 30px 40px rgba(0,0,0,0.6))" }}>
      {new Array(7).fill(0).map((_, k) => {
        const r = random(`pk${seed}${k}`);
        const pop = ((frame * (0.9 + r) + r * 60) % 60) / 60;
        return <div key={`p${k}`} style={{ position: "absolute", left: w * (0.15 + r * 0.7), top: -10 - pop * h * 0.35, width: w * 0.12, height: w * 0.12, borderRadius: "45%", background: "#FFF3D6", opacity: 1 - pop, rotate: `${pop * 180}deg` }} />;
      })}
      <svg width={w} height={h} viewBox="0 0 72 100" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {new Array(9).fill(0).map((_, k) => (
          <circle key={k} cx={12 + (k % 5) * 12 + (k > 4 ? 6 : 0)} cy={k > 4 ? 6 : 14} r={9} fill="#FFF3D6" />
        ))}
        <path d="M4 16 L68 16 L58 99 L14 99 Z" fill={glow ? C.lime : "#E5484D"} />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M${17 + k * 15} 16 L${21 + k * 13} 99`} stroke="rgba(255,255,255,0.75)" strokeWidth={6} />
        ))}
      </svg>
    </div>
  );
};

/** Little customer figures that walk from the bottom to the chosen tub column. */
const Walkers: React.FC<{ shares: number[]; from?: number[]; at: number; xs: number[]; y: number }> = ({ shares, from, at, xs, y }) => {
  const frame = useCurrentFrame();
  const N = 24;
  const pick = (sh: number[]) => {
    const out: number[] = [];
    sh.forEach((n, c) => {
      for (let k = 0; k < Math.round((n / 100) * N); k++) out.push(c);
    });
    while (out.length < N) out.push(sh.length - 1);
    return out.slice(0, N);
  };
  const to = pick(shares);
  const fr = from ? pick(from) : null;
  const cnt: Record<number, number> = {};
  return (
    <>
      {to.map((col, i) => {
        const k = (cnt[col] = (cnt[col] ?? 0) + 1) - 1;
        const tx = xs[col] - 70 + (k % 5) * 34;
        const ty = y + Math.floor(k / 5) * 44;
        const sx = fr ? xs[fr[i]] - 70 + (i % 5) * 34 : 80 + random(`w${i}`) * 900;
        const sy = fr ? ty : y + 300;
        const p = interpolate(frame, [at + (i % 12) * 2, at + 28 + (i % 12) * 2], [0, 1], { ...clamp, easing: EASE_IO });
        const bob = Math.abs(Math.sin((frame + i * 7) / 3)) * 6 * (p > 0 && p < 1 ? 1 : 0);
        return (
          <div key={i} style={{ position: "absolute", left: interpolate(p, [0, 1], [sx, tx]), top: interpolate(p, [0, 1], [sy, ty]) - bob, width: 26, height: 40, opacity: interpolate(frame, [0, 8], [0, 1], clamp) }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.cream, margin: "0 auto" }} />
            <div style={{ width: 24, height: 22, borderRadius: "10px 10px 4px 4px", background: col === to.length ? C.cream : C.stone, marginTop: 2 }} />
          </div>
        );
      })}
    </>
  );
};

const TUB_X = [240, 540, 840];
const TUB_H = [210, 290, 360];
const PriceTag: React.FC<{ name: string; price: string; glow?: boolean; dim?: boolean; stamp?: string }> = ({ name, price, glow, dim, stamp }) => (
  <div style={{ position: "relative", textAlign: "center", borderRadius: 18, padding: "10px 16px", background: glow ? C.lime : C.cream, color: C.charcoal, opacity: dim ? 0.5 : 1, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", minWidth: 170 }}>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: 3, opacity: 0.7 }}>{name.toUpperCase()}</div>
    <div style={{ fontFamily: SERIF, fontSize: 54, lineHeight: 1.05 }}>{price}</div>
    {stamp ? <div style={{ position: "absolute", left: "50%", top: "50%", translate: "-50% -50%", rotate: "-14deg", fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: RED, border: `4px solid ${RED}`, borderRadius: 10, padding: "2px 10px", background: "rgba(246,244,237,0.95)" }}>{stamp}</div> : null}
  </div>
);

/** Popcorn counter as motion graphics: tubs, tags, walking customers; medium arrives and the crowd moves. */
const PopcornBoard: React.FC<{ data: SceneProps["data"] }> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const mode = data.board as "flow" | "decoy";
  const mAt = mode === "flow" ? c("medium", 150) : -1;
  const hasMedium = mode === "decoy" || frame >= mAt;
  const drop = mode === "flow" ? spring({ frame: frame - mAt, fps: 30, config: { damping: 11, stiffness: 160 } }) : 1;
  const decoyAt = c("decoy", 20);
  const glowL = mode === "decoy" || frame > mAt + 34;
  const dimM = mode === "decoy" && frame >= decoyAt;
  const opts = data.opts as Opt[];
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: C.charcoal, background: C.cream, borderRadius: 999, padding: "8px 20px" }}>{mode === "flow" ? "EXAMPLE PRICES" : "THE DECOY"}</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 960, height: 10, borderRadius: 5, background: "#1F1F1F" }} />
      {[0, 1, 2].map((i) => {
        if (i === 1 && !hasMedium) return null;
        const y = i === 1 ? interpolate(drop, [0, 1], [-400, 0]) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: TUB_X[i] - TUB_H[i] * 0.36, top: 960 - TUB_H[i] + y, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Tub h={TUB_H[i]} glow={i === 2 && glowL} dim={i === 1 && dimM} seed={i} />
          </div>
        );
      })}
      {[0, 1, 2].map((i) =>
        i === 1 && !hasMedium ? null : (
          <div key={`t${i}`} style={{ position: "absolute", left: TUB_X[i] - 95, top: 400 + (i === 1 ? interpolate(drop, [0, 1], [-300, 0]) : 0) }}>
            <PriceTag name={opts[i].name} price={opts[i].price} glow={i === 2 && glowL} dim={i === 1 && dimM} stamp={i === 1 && dimM ? "DECOY" : undefined} />
          </div>
        ),
      )}
      {mode === "flow" ? (
        frame < mAt ? <Walkers shares={[70, 0, 30]} at={c("split", 40)} xs={TUB_X} y={1000} /> : <Walkers shares={[20, 5, 75]} from={[70, 0, 30]} at={mAt + 16} xs={TUB_X} y={1000} />
      ) : (
        <Walkers shares={[20, 5, 75]} from={[20, 5, 75]} at={0} xs={TUB_X} y={1000} />
      )}
      {mode === "decoy" && frame >= decoyAt + 12 ? (
        <div style={{ position: "absolute", left: TUB_X[2] - 120, top: 1290, width: 240, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: C.lime }}>ONLY +₹30</div>
      ) : null}
    </>
  );
};

/** A recreated subscription web page: the cursor picks the combo, then print-only is ripped out and votes flip. */
const SubscribePage: React.FC<{ data: SceneProps["data"] }> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const pop = usePop();
  const opts = data.opts as Opt[];
  const resAt = c("result", 120);
  const rmAt = c("remove", 200);
  const removed = frame >= rmAt;
  const rip = interpolate(frame, [rmAt, rmAt + 18], [0, 1], { ...clamp, easing: EASE_IO });
  const v = (removed ? (data.without as number[]) : (data.with as number[]));
  const g = interpolate(frame, [removed ? rmAt + 14 : resAt, (removed ? rmAt + 14 : resAt) + 26], [0, 1], { ...clamp, easing: EASE });
  const winner = removed ? 0 : 2;
  const cx = interpolate(frame, [resAt - 30, resAt - 6], [880, TUB_X[2] + 60], { ...clamp, easing: EASE_IO });
  const cy = interpolate(frame, [resAt - 30, resAt - 6], [1240, 820], { ...clamp, easing: EASE_IO });
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", gap: 12 }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: C.charcoal, background: C.cream, borderRadius: 999, padding: "8px 20px" }}>CLASSROOM DEMO</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: C.stone, border: "2px solid #333", borderRadius: 999, padding: "6px 16px" }}>100 STUDENTS</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 380, height: 700, borderRadius: 28, background: C.cream, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", ...pop(c("cards", 6), { rise: 60, scale: 0.94 }) }}>
        <div style={{ height: 54, background: "#E4E0D5", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((col) => (
            <div key={col} style={{ width: 14, height: 14, borderRadius: "50%", background: col }} />
          ))}
          <div style={{ marginLeft: 14, flex: 1, height: 32, borderRadius: 10, background: "white", fontFamily: BODY, fontSize: 18, color: "#77756D", display: "flex", alignItems: "center", padding: "0 14px" }}>🔒 magazine.example/subscribe</div>
        </div>
        <div style={{ padding: "26px 30px" }}>
          <div style={{ fontFamily: SERIF, fontSize: 64, color: C.charcoal, lineHeight: 1 }}>Subscribe</div>
          <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
            {opts.map((o, i) => {
              const gone = i === 1 && removed;
              const win = i === winner && g > 0.3;
              return (
                <div key={o.name} style={{ flex: gone ? interpolate(rip, [0, 1], [1, 0.001]) : 1, overflow: "hidden", borderRadius: 20, padding: gone && rip > 0.8 ? 0 : "18px 16px", border: `3px solid ${win ? "#4C8C00" : "#D9D5C9"}`, background: win ? "#EAFFD0" : "white", rotate: gone ? `${rip * 14}deg` : undefined, translate: gone ? `0 ${rip * 260}px` : undefined, opacity: gone ? 1 - rip : 1 }}>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: "#77756D", whiteSpace: "nowrap" }}>{o.name.toUpperCase()}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 60, color: C.charcoal, lineHeight: 1.1 }}>{o.price}</div>
                  <div style={{ marginTop: 14, fontFamily: BODY, fontWeight: 800, fontSize: 18, textAlign: "center", borderRadius: 10, padding: "8px 0", background: win ? C.charcoal : "#EFEBE1", color: win ? C.lime : "#55534C" }}>{win ? "✓ Chosen" : "Select"}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 40, fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: "#77756D", opacity: g }}>WHAT 100 STUDENTS PICKED</div>
          <div style={{ marginTop: 12, display: "flex", height: 70, borderRadius: 16, overflow: "hidden", opacity: g }}>
            {v.map((n, i) =>
              n > 0 ? (
                <div key={i} style={{ width: `${n}%`, background: i === winner ? C.lime : "#D9D5C9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 32, color: C.charcoal }}>
                  {Math.round(n * g)}
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
      {frame >= resAt - 30 && frame < resAt + 20 ? (
        <svg width={38} height={46} viewBox="0 0 17 20" style={{ position: "absolute", left: cx, top: cy, filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.4))" }}>
          <path d="M1 1 L1 16 L5 12.4 L7.8 18.6 L10.4 17.4 L7.7 11.3 L13 11.3 Z" fill="#111" stroke="white" strokeWidth={1.3} />
        </svg>
      ) : null}
    </>
  );
};

/** A recreated gym-app pricing screen inside a phone. */
const GymApp: React.FC<{ data: SceneProps["data"] }> = ({ data }) => {
  const frame = useCurrentFrame();
  const c = cueOf(data);
  const addAt = c("add", 120);
  const best = c("obvious", 200);
  const opts = data.opts as Opt[];
  const tilt = Math.sin(frame / 45) * 5;
  const enter = spring({ frame, fps: 30, config: { damping: 15, stiffness: 140 } });
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: C.charcoal, background: C.lime, borderRadius: 999, padding: "8px 20px" }}>YOUR BUSINESS</div>
      </div>
      <div style={{ position: "absolute", left: 250, top: 330, width: 580, height: 1040, perspective: 1600, translate: `0 ${(1 - enter) * 300}px` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 70, background: "#111", border: "12px solid #2A2A2A", rotate: `y ${-10 + tilt}deg`, boxShadow: "0 60px 140px rgba(0,0,0,0.75), 0 0 90px rgba(167,255,63,0.12)", padding: "40px 26px", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>🏋️</div>
            <div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: C.cream }}>Iron Club</div>
              <div style={{ fontFamily: BODY, fontSize: 18, color: C.grey }}>Choose your membership</div>
            </div>
          </div>
          {opts.map((o, i) => {
            const show = i !== 1 || frame >= addAt;
            const s = i === 1 ? spring({ frame: frame - addAt, fps: 30, config: { damping: 11, stiffness: 200 } }) : 1;
            const isBest = i === 2 && frame >= best;
            if (!show) return null;
            return (
              <div key={o.name} style={{ position: "relative", marginTop: 26, borderRadius: 26, padding: "22px 24px", background: isBest ? C.lime : "#1C1C1C", border: `2px solid ${isBest ? C.lime : "#2E2E2E"}`, color: isBest ? C.charcoal : C.cream, scale: String((0.6 + 0.4 * s) * (isBest ? 1.03 + 0.015 * Math.sin(frame / 5) : 1)), opacity: s }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 34 }}>{o.name}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 52 }}>{o.price}</div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 20, marginTop: 6, opacity: 0.75 }}>{o.sub}</div>
                {isBest ? <div style={{ position: "absolute", right: 18, top: -18, fontFamily: MONO, fontWeight: 800, fontSize: 18, letterSpacing: 3, background: C.cream, color: C.charcoal, borderRadius: 8, padding: "4px 10px", rotate: "4deg" }}>BEST VALUE</div> : null}
              </div>
            );
          })}
        </div>
      </div>
      {frame >= best
        ? new Array(18).fill(0).map((_, i) => {
            const t = (frame - best) / 30;
            const a = random(`cf${i}`) * Math.PI * 2;
            return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * t * 520, top: 900 + Math.sin(a) * t * 420 + t * t * 300, width: 14, height: 8, background: i % 2 ? C.lime : C.cream, rotate: `${t * 400 + i * 30}deg`, opacity: Math.max(0, 1 - t / 1.4) }} />;
          })
        : null}
    </>
  );
};

/** Closing recap: the three moves as glowing tags, then a bookmark pops. */
const SaveBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 4, fps: 30, config: { damping: 10, stiffness: 180 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <svg width={200} height={250} viewBox="0 0 34 42" style={{ scale: String(0.5 + 0.5 * s), rotate: `${(1 - s) * -20}deg`, filter: "drop-shadow(0 0 40px rgba(167,255,63,0.5))" }}>
        <path d="M3 2 H31 V40 L17 30 L3 40 Z" fill={C.lime} />
      </svg>
      <div style={{ display: "flex", gap: 14 }}>
        {[["SMALL", "₹200"], ["MEDIUM", "₹420"], ["LARGE", "₹450"]].map(([n, p], i) => (
          <div key={n} style={{ borderRadius: 16, padding: "8px 16px", background: i === 2 ? C.lime : C.cream, opacity: interpolate(frame, [8 + i * 4, 16 + i * 4], [0, 1], clamp) }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, letterSpacing: 2, color: "#55534C" }}>{n}</div>
            <div style={{ fontFamily: SERIF, fontSize: 40, color: C.charcoal }}>{p}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DGraphicScene: React.FC<SceneProps> = ({ data }) => {
  const { durationInFrames: D } = useVideoConfig();
  const frame = useCurrentFrame();
  const kind = data.overlay as string;
  return (
    <AbsoluteFill>
      <Canvas />
      <AbsoluteFill style={{ scale: String(interpolate(frame, [0, D], [1, 1.03], clamp)) }}>
        {kind === "popcorn" ? <PopcornBoard data={data} /> : null}
        {kind === "subscribe" ? <SubscribePage data={data} /> : null}
        {kind === "gymapp" ? <GymApp data={data} /> : null}
        {kind === "save" ? <SaveBeat /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const DX_SCENES: Record<string, React.FC<SceneProps>> = { dReel: DxScene, dGraphic: DGraphicScene };
