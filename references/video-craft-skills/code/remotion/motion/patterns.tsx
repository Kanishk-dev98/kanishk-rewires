/**
 * Pattern components: the larger, measured techniques (each one a whole beat). Every component takes absolute
 * local frames (`at`, `...At`). Shapes come from the theme (ACCENT_SHAPE), colours from T, states ALLOW ● / ASK ◆ /
 * HELD ■ with labels. Numbers in the doc comments are measured at 30 fps.
 *
 *  1 ChipDive          select chip → push 1.8x + darken → 2 f dissolve into the dark world → surface back
 *  2 AuditStaircase    permission chain, steps 20 f apart, lock → ✓ in 6 f, one calm denial (HELD ■ + hatch)
 *  3 ShapeWindowZoom   25 f brand-shape window whip-zoom
 *  4 CardToPanel       full-frame accent hero card shrinks into the product panel in 10 f
 *  5 ReasoningLog      status card 56 → 420 px spring, rows in batches of 4 every 10 f, glyphs first
 *  6 HiddenQuestions   one request explodes into question pills under a wash, then resolves at once
 *  7 UIPlane           tilted plane camera: drift, tilt-shift DOF, macro push, whip re-frame, settle
 *  8 Brandify          macro button ink → accent + shape shard pops; held variant settles into HELD ■
 *  9 CaptionToInput    caption selected, deleted, becomes the prompt field, camera 2.2 → 1, types
 * 10 Spotlight, OptionRing   52% dim with a 6 px ring (no zoom); ring stepping through options 32 f each
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { FIG, FIG_I, MONO } from "../fonts";
import { ACCENT_GRAD, ACCENT_SHAPE, T, rgb } from "../theme";
import { E as EZ, Rect, lerp, mix, r, sp } from "./core";
import { Grain, MotionBlur, dofBlur } from "./fx";
import { AccentShape, LightStage, SHAPE_CENTRE, State, StateGlyph, TagChip, stateColor } from "./stages";

/* =====================================================================================================
 * 1. ChipDive
 * ===================================================================================================== */

/**
 * Dive into a chip of the light UI into a dark "under the hood" world, then surface back.
 * Down (from `at`): chip selected in 2 f (fill → ink, label → accent) → camera pushes 1.8x about the chip in 4 f
 * in(cubic) while a dark overlay rises 0 → 70% → 2 f dissolve to `dark`. Pair with `AuditStaircase` `bornFrom`
 * = `chipDiveSquare(chip)` so the first node is born as a square at the chip's last screen position (at + 7).
 * Up (from `surfaceAt`): the chip returns as a giant (3x), motion-blurred foreground sliding in from +600 px over
 * 6 f, the light UI cross-fades back over 6 f, and the chip scales 3 → 1 into its slot (~13 f).
 * `light` must leave the chip's slot empty: ChipDive draws the chip itself at `chip` (centre x,y).
 */
export const ChipDive: React.FC<{
  at: number;
  surfaceAt: number;
  chip: { x: number; y: number };
  label: string;
  surfaceLabel?: string;
  surfaceState?: State;
  size?: number;
  light: React.ReactNode;
  dark: React.ReactNode;
}> = ({ at, surfaceAt, chip, label, surfaceLabel, surfaceState, size = 30, light, dark }) => {
  const f = useCurrentFrame();
  const sel = r(f, at, 2, EZ.outCubic);
  const push = 1 + 0.8 * r(f, at + 2, 4, EZ.inCubic);
  const dim = 0.7 * r(f, at + 2, 4, EZ.inCubic);
  const dissolve = r(f, at + 6, 2, (t) => t);
  const up = f >= surfaceAt;
  const lightBack = r(f, surfaceAt + 2, 6, EZ.inOutQuad);
  // foreground chip on the way back: slides from +600 px (6 f, expo-out), then scales 3 → 1 (8 f)
  const slideX = (g: number) => 600 * (1 - r(g, surfaceAt, 6, EZ.arrive));
  const scaleBack = 3 - 2 * r(f, surfaceAt + 5, 8, EZ.settle);
  const vx = slideX(f) - slideX(f - 1);
  const chipNode = (s: number, lbl: string, st?: State) => (
    <div style={{ position: "absolute", left: chip.x, top: chip.y, translate: "-50% -50%", scale: String(s) }}>
      <TagChip label={lbl} sel={up ? 1 - r(f, surfaceAt + 11, 5) : sel} size={size} state={st} />
    </div>
  );
  if (!up) {
    return (
      <AbsoluteFill style={{ overflow: "hidden", background: T.dark }}>
        {dissolve < 1 ? (
          <AbsoluteFill style={{ transformOrigin: `${chip.x}px ${chip.y}px`, scale: String(push), filter: push > 1.05 ? `blur(${(push - 1) * 2.5}px)` : undefined }}>
            {light}
            <AbsoluteFill style={{ background: "#050608", opacity: dim }} />
            <div style={{ position: "absolute", inset: 0, filter: "none" }}>{chipNode(1, label)}</div>
          </AbsoluteFill>
        ) : null}
        {dissolve > 0 ? <AbsoluteFill style={{ opacity: dissolve }}>{dark}</AbsoluteFill> : null}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: T.dark }}>
      {lightBack < 1 ? <AbsoluteFill>{dark}</AbsoluteFill> : null}
      {/* the chain darkens under the incoming chip */}
      {lightBack < 1 ? <AbsoluteFill style={{ background: "#000", opacity: 0.45 * r(f, surfaceAt, 4) * (1 - lightBack) }} /> : null}
      <AbsoluteFill style={{ opacity: lightBack }}>{light}</AbsoluteFill>
      <MotionBlur vx={vx} vy={0}>
        <AbsoluteFill style={{ translate: `${slideX(f)}px 0px` }}>{chipNode(scaleBack, surfaceLabel ?? label, surfaceState)}</AbsoluteFill>
      </MotionBlur>
    </AbsoluteFill>
  );
};
/** The 84 px square at the chip's last screen position (after the 1.8x push about its centre). */
export const chipDiveSquare = (chip: { x: number; y: number }): Rect => ({ x: chip.x - 42, y: chip.y - 42, w: 84, h: 84 });

/* =====================================================================================================
 * 2. AuditStaircase
 * ===================================================================================================== */

export type AuditStep = { label: string; kind: "check" | "entity" | "held" | "ask"; sub?: string };

const LockIcon: React.FC<{ c: string; s?: number }> = ({ c, s = 26 }) => (
  <svg width={s} height={s} viewBox="0 0 26 26">
    <rect x={5} y={11} width={16} height={12} rx={3} fill={c} />
    <path d="M8.5 11 V8 a4.5 4.5 0 0 1 9 0 V11" fill="none" stroke={c} strokeWidth={2.6} />
  </svg>
);
const Check: React.FC<{ c: string; s?: number; p?: number }> = ({ c, s = 26, p = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 26 26">
    <path d="M6 13.5 L11 18.5 L20.5 8" fill="none" stroke={c} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
  </svg>
);

/**
 * Permission / check chain as a staircase: step i at x0 + (i%2)·dx, y0 + i·dy, born every `every` f (20). Card born as
 * an 84 px square springing wide in ~6 f {d18, s260}; label types at 40 cps; badge ring → lock (4 f) → ✓ (scale
 * .8 → 1, 6 f) at t0+14. Checks = accent gradient cards; entities = white cards, italic. One calm denial (`held`):
 * HELD ■ + deny wash + an 8 f diagonal hatch sweep L→R, no shake. `ask` = ink/white diamond. The camera tilts down
 * `tilt` px/f once step `tiltFrom` is born; older steps go soft (DOF). `bornFrom` = first step born from that square.
 */
export const AuditStaircase: React.FC<{
  at: number;
  steps: AuditStep[];
  every?: number;
  x0?: number;
  y0?: number;
  dx?: number;
  dy?: number;
  width?: number;
  h?: number;
  tilt?: number;
  tiltFrom?: number;
  tiltUntil?: number;
  bornFrom?: Rect;
  title?: string;
  /** Optional absolute birth frame per step (e.g. locked to VO words); overrides `at + i·every`. */
  times?: number[];
  /** Optional absolute resolve frame per step (lock → ✓ / HELD); default birth + 14. */
  resolveAts?: (number | undefined)[];
  /** Pull focus back to the whole column after the last step resolves (default true). */
  pullBack?: boolean;
}> = ({ at, steps, every = 20, x0 = 640, y0 = 150, dx = 60, dy = 100, width = 640, h = 76, tilt = 3, tiltFrom = 3, tiltUntil, bornFrom, title, times, resolveAts, pullBack = true }) => {
  const f = useCurrentFrame();
  const born = steps.map((_, i) => times?.[i] ?? at + i * every);
  const resAt = steps.map((_, i) => resolveAts?.[i] ?? born[i] + 14);
  const tStart = born[Math.min(tiltFrom, steps.length - 1)];
  const tEnd = tiltUntil ?? born[steps.length - 1] + 30;
  const camY = tilt * Math.max(0, Math.min(f, tEnd) - tStart);
  const newest = Math.max(0, born.reduce((k, b, i) => (f >= b ? i : k), 0));
  const focusY = y0 + newest * dy + h / 2 - camY;
  const pos = (i: number) => ({ x: x0 + (i % 2) * dx, y: y0 + i * dy });
  return (
    <AbsoluteFill>
      {title ? (
        <div style={{ position: "absolute", left: x0, top: y0 - 78 - camY, fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: "#A5AEC4", textTransform: "uppercase", opacity: r(f, at - 4, 8) * Math.max(0, Math.min(1, (y0 - 78 - camY - 30) / 50)) }}>{title}</div>
      ) : null}
      <svg width={1920} height={1080 + 2000} style={{ position: "absolute", left: 0, top: -camY, overflow: "visible" }}>
        {steps.map((_, i) => {
          if (i === 0) return null;
          const a = pos(i - 1);
          const b = pos(i);
          const mid = a.y + h + (dy - h) / 2;
          const d = `M ${a.x + 42} ${a.y + h} V ${mid} H ${b.x + 42} V ${b.y}`;
          const p = r(f, born[i] - 6, 6, EZ.outCubic);
          return p > 0 ? <path key={i} d={d} fill="none" stroke="#5E6A86" strokeWidth={2.5} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} /> : null;
        })}
      </svg>
      {steps.map((s, i) => {
        const t0 = born[i];
        if (f < t0) return null;
        const g = sp(f, t0, { damping: 18, stiffness: 260 });
        const { x, y } = pos(i);
        const from = i === 0 && bornFrom ? bornFrom : { x, y: y + (h - 84) / 2, w: 84, h: 84 };
        const fromY = i === 0 && bornFrom ? bornFrom.y + camY : from.y;
        const L = lerp(from.x, x, Math.min(1, g));
        const TOP = lerp(fromY, y, Math.min(1, g));
        const W = Math.max(40, lerp(from.w, width, g));
        const H = lerp(from.h, h, Math.min(1, g));
        // DOF while the chain builds; focus pulls back to the whole column once the last step has resolved
        const blur = dofBlur(y + h / 2 - camY, focusY, 200, 3.5) * (pullBack ? 1 - r(f, resAt[steps.length - 1] + 8, 18, EZ.inOutQuad) : 1);
        const isCheck = s.kind === "check";
        const held = s.kind === "held";
        const ask = s.kind === "ask";
        const bg = isCheck ? ACCENT_GRAD : held ? T.denyWash : "#FFFFFF";
        const ink = held ? T.denyDeep : T.ink;
        const n = Math.max(0, Math.min(s.label.length, Math.floor(((f - t0 - 4) / 30) * 40)));
        const resolve = r(f, resAt[i], 6, EZ.settle);
        const lock = r(f, t0 + 4, 4);
        const hatch = held ? r(f, resAt[i], 8, EZ.inOutQuad) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: L, top: TOP - camY, width: W, height: H, borderRadius: 16, background: bg, overflow: "hidden", boxShadow: held ? `0 0 0 2px ${T.denyDeep}55, 0 18px 50px rgba(0,0,0,0.45)` : "0 18px 50px rgba(0,0,0,0.45)", filter: blur > 0.1 ? `blur(${blur}px)` : undefined, opacity: 1 - Math.min(0.15, blur * 0.04) }}>
            {isCheck ? <Grain opacity={0.08} blend="overlay" /> : null}
            {held ? (
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - hatch) * 100}% 0 0)`, background: `repeating-linear-gradient(135deg, ${T.deny}55 0px, ${T.deny}55 2px, transparent 2px, transparent 16px)` }} />
            ) : null}
            {/* badge */}
            <div style={{ position: "absolute", left: 14, top: H / 2 - 24, width: 48, height: 48, borderRadius: held ? 10 : 999, display: "flex", alignItems: "center", justifyContent: "center", background: isCheck ? "rgba(255,255,255,0.45)" : held ? "#FFFFFF" : T.soft, border: `2px solid ${isCheck ? "rgba(23,23,23,0.18)" : held ? `${T.denyDeep}66` : T.border}` }}>
              {resolve <= 0 ? (
                lock < 1 ? (
                  <svg width={30} height={30} style={{ rotate: `${(f - t0) * 40}deg` }}>
                    <circle cx={15} cy={15} r={11} fill="none" stroke={ink} strokeWidth={3} strokeDasharray="40 30" strokeLinecap="round" opacity={0.7} />
                  </svg>
                ) : (
                  <LockIcon c={ink} />
                )
              ) : held ? (
                <div style={{ scale: String(0.8 + 0.2 * resolve) }}><StateGlyph s="held" size={24} /></div>
              ) : ask ? (
                <div style={{ scale: String(0.8 + 0.2 * resolve) }}><StateGlyph s="ask" size={26} /></div>
              ) : (
                <div style={{ scale: String(0.8 + 0.2 * resolve) }}><Check c={T.ink} p={resolve} /></div>
              )}
            </div>
            <div style={{ position: "absolute", left: 80, right: 20, top: 0, height: H, display: "flex", alignItems: "center", gap: 16, whiteSpace: "nowrap", opacity: W > 200 ? 1 : 0 }}>
              <span style={{ fontFamily: s.kind === "entity" || ask ? FIG_I : FIG, fontStyle: s.kind === "entity" || ask ? "italic" : "normal", fontWeight: 600, fontSize: 30, letterSpacing: -0.3, color: ink }}>{s.label.slice(0, n)}</span>
              {held && resolve > 0 ? <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 24, letterSpacing: 2, color: T.denyDeep, opacity: resolve }}>HELD</span> : null}
              {ask && resolve > 0 ? <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 24, letterSpacing: 2, color: T.ink, opacity: resolve }}>ASK</span> : null}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* =====================================================================================================
 * 3. ShapeWindowZoom
 * ===================================================================================================== */

/**
 * 25 f brand-shape window whip-zoom through the ACCENT_SHAPE silhouette (measured frame by frame):
 * f0 to 5 the outgoing `title` whips out (ease-in, +128 px in 4 f, then off with blur); f6 to 13 the mark window slides
 * in (bezier .1,.8,.2,1, `slide` px); f14 hold; f15 to 21 exponential grow, area ×1.5 per frame from 7.2% of the
 * frame; f22 to 25 corner clear. `children` = the incoming world; `stage` = the opening field under the title;
 * `peek` = the point of the incoming world framed by the small window (eases back to its true place as it grows).
 * Reuse at most twice per film.
 */
export const ShapeWindowZoom: React.FC<{ at: number; title?: React.ReactNode; stage?: React.ReactNode; children: React.ReactNode; slide?: number; area0?: number; peek?: [number, number] }> = ({ at, title, stage, children, slide = 240, area0 = 0.072, peek }) => {
  const f = useCurrentFrame();
  const t = f - at;
  // accent shape area in unit² (shoelace, any polygon)
  const areaU = Math.abs(ACCENT_SHAPE.reduce((s, p, i) => { const q = ACCENT_SHAPE[(i + 1) % ACCENT_SHAPE.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  const k0 = Math.sqrt((area0 * 1920 * 1080) / areaU);
  const k = t <= 14 ? k0 : k0 * Math.pow(1.5, (t - 14) / 2);
  const off = (g: number) => slide * (1 - r(g - at, 6, 8, EZ.slide));
  const cx = 960 + off(f);
  const cy = 540;
  const pts = ACCENT_SHAPE.map(([x, y]) => [cx + (x - SHAPE_CENTRE[0]) * k, cy + (y - SHAPE_CENTRE[1]) * k]);
  const poly = `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(",")})`;
  const clear = r(t, 22, 3, (x) => x);
  const titleX = t <= 4 ? -128 * EZ.inCubic(Math.max(0, t) / 4) : -2400;
  const titleV = t >= 1 && t <= 4 ? -128 * (EZ.inCubic(t / 4) - EZ.inCubic((t - 1) / 4)) : 0;
  const winV = off(f) - off(f - 1);
  const grow = r(t, 14, 11, (x) => x);
  if (t >= 25) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {stage ?? <LightStage />}
      {title && t < 5 ? (
        <MotionBlur vx={titleV * 2.2} vy={0}>
          <AbsoluteFill style={{ translate: `${titleX}px 0px`, justifyContent: "center", alignItems: "center", opacity: t < 4.5 ? 1 : 0 }}>{title}</AbsoluteFill>
        </MotionBlur>
      ) : null}
      {t >= 6 ? (
        <MotionBlur vx={winV * 1.6} vy={0}>
          {/* soft shadow under the window, gone once it grows */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - grow }}>
            <defs>
              <filter id="swzShadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={22} /></filter>
            </defs>
            <polygon points={pts.map((p) => `${p[0]},${p[1] + 26}`).join(" ")} fill={`rgba(${rgb(T.deep)},0.28)`} filter="url(#swzShadow)" />
          </svg>
          <AbsoluteFill style={{ clipPath: poly }}>
            <AbsoluteFill style={{ scale: String(1 + 0.18 * (1 - grow)), translate: peek ? `${(cx - peek[0]) * (1 - EZ.inOutCubic(grow))}px ${(cy - peek[1]) * (1 - EZ.inOutCubic(grow))}px` : undefined }}>{children}</AbsoluteFill>
          </AbsoluteFill>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - r(t, 15, 5) }}>
            <polygon points={pts.map((p) => `${p[0]},${p[1]}`).join(" ")} fill="none" stroke={T.accentDeep} strokeWidth={3} strokeLinejoin="round" />
          </svg>
        </MotionBlur>
      ) : null}
      {clear > 0 ? <AbsoluteFill style={{ opacity: clear }}>{children}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};

/* =====================================================================================================
 * 4. CardToPanel
 * ===================================================================================================== */

/**
 * The full-frame accent hero card IS the product panel: it already carries the panel chrome (`head`, laid out at
 * the panel's size and scaled with the card), shrinks to `rect` in `dur` (10) f bezier(.6,0,.3,1), radius 0 → 14,
 * `hero` (the full-frame brand moment) fades out in the first 5 f, `children` (panel details) fade in on the last
 * 4 f with the shadow and hairline. The light stage is behind the card the whole time.
 */
export const CardToPanel: React.FC<{ at: number; rect: Rect; head?: React.ReactNode; hero?: React.ReactNode; children?: React.ReactNode; dur?: number; radius?: number; stage?: React.ReactNode }> = ({ at, rect, head, hero, children, dur = 10, radius = 14, stage }) => {
  const f = useCurrentFrame();
  const t = r(f, at, dur, EZ.panel);
  const box = { x: lerp(0, rect.x, t), y: lerp(0, rect.y, t), w: lerp(1920, rect.w, t), h: lerp(1080, rect.h, t) };
  const s = box.w / rect.w;
  const chrome = r(f, at + dur - 4, 4, EZ.outCubic);
  const vx = Math.abs(r(f, at, dur, EZ.panel) - r(f - 1, at, dur, EZ.panel)) * 1100;
  return (
    <AbsoluteFill>
      {stage ?? <LightStage />}
      <MotionBlur vx={vx * 0.4} vy={vx * 0.25}>
        <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: radius * t, overflow: "hidden", background: ACCENT_GRAD, boxShadow: `0 ${40 * chrome}px ${110 * chrome}px rgba(10,20,70,${0.28 * chrome}), 0 0 0 ${1.5 * chrome}px rgba(255,255,255,0.5) inset` }}>
          <Grain opacity={0.09} blend="overlay" />
          <div style={{ position: "absolute", left: 0, top: 0, width: rect.w, height: rect.h, transformOrigin: "0 0", scale: String(s) }}>
            {head}
            <div style={{ opacity: chrome }}>{children}</div>
          </div>
          {hero ? <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - r(f, at, 5, EZ.outCubic) }}>{hero}</AbsoluteFill> : null}
        </div>
      </MotionBlur>
    </AbsoluteFill>
  );
};

/* =====================================================================================================
 * 5. ReasoningLog
 * ===================================================================================================== */

export type LogRow = { text: string; state?: "ok" | "held" | "ask" | "info"; mono?: boolean };

/**
 * Status card ("Checking 6 rules…", animated working hairline) that is clicked open: height springs
 * `closedH` 56 → `openH` 420 {damping 200, mass .6} (~12 f), then verbatim log rows appear in batches of 4 every
 * 10 f, each glyph 2 f before its text. Rows ≥ 28 px. `doneTitle` replaces the title after the last row.
 */
export const ReasoningLog: React.FC<{ at: number; openAt: number; title: string; doneTitle?: string; doneState?: State; rows: LogRow[]; width?: number; closedH?: number; openH?: number; rowH?: number; batch?: number; every?: number; x?: number; y?: number }> = ({
  at,
  openAt,
  title,
  doneTitle,
  doneState = "held",
  rows,
  width = 1080,
  closedH = 56,
  openH = 420,
  rowH = 56,
  batch = 4,
  every = 10,
  x = 960,
  y = 540,
}) => {
  const f = useCurrentFrame();
  const appear = r(f, at, 8);
  const open = sp(f, openAt, { damping: 200, mass: 0.6 });
  const h = lerp(closedH, openH, open);
  const rowsAt = openAt + 12;
  const rowAt = (i: number) => rowsAt + Math.floor(i / batch) * every + (i % batch);
  const done = f >= rowAt(rows.length - 1) + 14;
  const press = f >= openAt - 2 && f < openAt + 1 ? 0.97 : 1;
  return (
    <div style={{ position: "absolute", left: x - width / 2, top: y - openH / 2, width, height: openH, opacity: appear, translate: `0px ${(1 - appear) * 16}px` }}>
      <div style={{ width, height: h, borderRadius: 18, background: "#FFFFFF", border: `1px solid ${T.border}`, boxShadow: "0 30px 80px rgba(10,20,60,0.14)", overflow: "hidden", position: "relative", scale: String(press) }}>
        <div style={{ height: closedH, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", fontFamily: FIG, fontWeight: 600, fontSize: 28, color: T.ink, whiteSpace: "nowrap" }}>
          {done ? <StateGlyph s={doneState} size={22} /> : <AccentShape size={26} fill={T.accentDeep} style={{ rotate: `${Math.sin(f / 6) * 8}deg` }} />}
          <span>{done && doneTitle ? doneTitle : title}</span>
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: T.muted }}>{open > 0.05 ? "HIDE" : "SHOW"} STEPS</span>
        </div>
        {/* working hairline: gradient travels while the system works, rests solid when done */}
        <div style={{ position: "absolute", left: 0, right: 0, top: closedH - 3, height: 3, background: done ? stateColor(doneState) : `linear-gradient(90deg, ${T.accentSoft} 0%, ${T.accentDeep} 30%, ${T.accentBright} 50%, ${T.accentSoft} 70%, ${T.accentDeep} 100%)`, backgroundSize: "200% 100%", backgroundPosition: `${(-f * 6) % 1080}px 0px`, opacity: done ? 0.7 : 1 }} />
        <div style={{ padding: "14px 22px 0" }}>
          {rows.map((row, i) => {
            const ga = r(f, rowAt(i), 4, EZ.outCubic);
            const ta = r(f, rowAt(i) + 2, 6, EZ.outCubic);
            const c = row.state === "held" ? T.denyDeep : T.ink;
            return (
              <div key={i} style={{ height: rowH, display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap" }}>
                <div style={{ width: 30, display: "flex", justifyContent: "center", opacity: ga, scale: String(0.7 + 0.3 * ga) }}>
                  {row.state === "held" ? <StateGlyph s="held" size={24} /> : row.state === "ask" ? <StateGlyph s="ask" size={26} /> : row.state === "info" ? <span style={{ width: 10, height: 10, borderRadius: 9, background: T.muted }} /> : <Check c={T.accentDeep} s={30} p={ga} />}
                </div>
                <span style={{ fontFamily: row.mono ? MONO : FIG, fontWeight: row.mono ? 500 : 500, fontSize: 28, letterSpacing: row.mono ? 0 : -0.2, color: c, opacity: ta, translate: `${(1 - ta) * 10}px 0px` }}>{row.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* =====================================================================================================
 * 6. HiddenQuestions
 * ===================================================================================================== */

export type Question = { q: string; a: string; x: number; y: number; size?: number };

/**
 * The scene (`children`) keeps rolling under a tinted multiply wash (0 → 72% in 6 f); each question pill is born
 * as a 2 px dash and opens to full in ~6 f, `stagger` (5) f apart, sizes 28 to 36 for depth. At `resolveAt` all
 * pills resolve at once: accent surface, ✓, the answer replaces the question. `outAt` clears the wash.
 */
export const HiddenQuestions: React.FC<{ at: number; resolveAt: number; outAt?: number; questions: Question[]; stagger?: number; tint?: string; children: React.ReactNode }> = ({ at, resolveAt, outAt, questions, stagger = 5, tint = "#2B3566", children }) => {
  const f = useCurrentFrame();
  const out = outAt === undefined ? 0 : r(f, outAt, 10, EZ.outCubic);
  const wash = 0.72 * r(f, at, 6, (x) => x) * (1 - out);
  const res = r(f, resolveAt, 8, EZ.inOutQuad);
  return (
    <AbsoluteFill>
      {children}
      <AbsoluteFill style={{ background: tint, mixBlendMode: "multiply", opacity: wash }} />
      {questions.map((q, i) => {
        const s0 = at + 4 + i * stagger;
        if (f < s0) return null;
        const size = q.size ?? 32;
        const wide = r(f, s0, 3, EZ.outCubic);
        const tall = r(f, s0 + 2, 4, EZ.outCubic);
        const txt = r(f, s0 + 4, 4);
        const fw = (s: string) => measureText({ text: s, fontFamily: FIG, fontSize: size, fontWeight: "600", letterSpacing: "0px" }).width;
        const wq = fw(q.q) + size * 2.6;
        const wa = fw(q.a) + size * 2.6;
        const w = lerp(wq, wa, res);
        const ph = size * 2;
        const depth = (36 - size) / 8; // smaller = further
        const exit = out;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: q.x,
              top: q.y + exit * 20,
              translate: "-50% -50%",
              width: lerp(40, w, wide),
              height: lerp(2, ph, tall),
              borderRadius: 999,
              background: res > 0 ? mix("#FFFFFF", T.accentSoft, res) : "#FFFFFF",
              boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
              overflow: "hidden",
              opacity: (1 - depth * 0.12) * (1 - exit),
              filter: depth > 0.4 || exit > 0 ? `blur(${depth * 0.6 + exit * 8}px)` : undefined,
            }}
          >
            {[0, 1].map((layer) => {
              const o = layer ? res : 1 - res;
              if (o <= 0.001) return null;
              return (
                <div key={layer} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: size * 0.35, opacity: txt * o, filter: o < 1 ? `blur(${(1 - o) * 6}px)` : undefined, fontFamily: FIG, fontWeight: 600, fontSize: size, color: layer ? T.accentText : T.ink, whiteSpace: "nowrap" }}>
                  {layer ? (
                    <div style={{ width: size * 0.9, height: size * 0.9, borderRadius: 999, background: T.accentDeep, display: "flex", alignItems: "center", justifyContent: "center", scale: String(0.7 + 0.3 * res), flex: "none" }}>
                      <Check c="#FFFFFF" s={size * 0.8} p={res} />
                    </div>
                  ) : (
                    <div style={{ width: size * 0.9, height: size * 0.9, boxSizing: "border-box", borderRadius: 999, border: `2px solid ${T.muted}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.6, fontWeight: 700, color: T.muted, flex: "none" }}>?</div>
                  )}
                  <span>{layer ? q.a : q.q}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* =====================================================================================================
 * 7. UIPlane
 * ===================================================================================================== */

export type PlaneKey = { at: number; x: number; y: number; zoom: number; move?: "push" | "whip" | "ease"; dur?: number };

/** Camera on a plane: evaluates keys; push 24 f inOut(cubic), whip 7 f with a 12 px blur peak, ease 18 f E.cam; ~3% settle. */
export const planeCam = (keys: PlaneKey[], f: number) => {
  let x = keys[0].x;
  let y = keys[0].y;
  let z = keys[0].zoom;
  let blur = 0;
  for (let k = 1; k < keys.length; k++) {
    const key = keys[k];
    const mv = key.move ?? "push";
    const dur = key.dur ?? (mv === "push" ? 24 : mv === "whip" ? 7 : 18);
    const ease = mv === "push" ? EZ.inOutCubic : mv === "whip" ? EZ.whip : EZ.cam;
    const p = r(f, key.at, dur, ease);
    const tAfter = f - (key.at + dur);
    // two-stage arrival: ~3% overshoot that settles within 18 f
    const o = tAfter > 0 && tAfter < 18 ? 0.03 * Math.sin((Math.PI * tAfter) / 9) * Math.exp(-tAfter / 6) : 0;
    const px = x;
    const py = y;
    const pz = z;
    x = px + (key.x - px) * (p + o);
    y = py + (key.y - py) * (p + o);
    z = pz + (key.zoom - pz) * (p + o);
    if (mv === "whip" && p > 0 && p < 1) blur = Math.max(blur, 12 * Math.sin(Math.PI * r(f, key.at, dur, (t) => t)));
  }
  return { x, y, z, blur };
};

/**
 * Flat UI plane tilted in 3D (rotX 8 to 12, rotY −6..−22, rotZ −3..−12) with constant drift; the camera keys a target
 * point on the plane (canvas coords) to screen centre at a zoom. Tilt-shift DOF from two copies: a blurred one
 * (far, `far` px) and a sharp one masked to a band around `focusY` (screen). Light stage behind, never white.
 * One take per act; alternate the tilt direction by chapter (`ry` sign).
 */
export const UIPlane: React.FC<{ width: number; height: number; keys: PlaneKey[]; rx?: number; ry?: number; rz?: number; drift?: number; far?: number; focusY?: number; band?: number; stage?: React.ReactNode; children: React.ReactNode }> = ({
  width,
  height,
  keys,
  rx = 10,
  ry = -14,
  rz = -6,
  drift = 1,
  far = 8,
  focusY = 540,
  band = 230,
  stage,
  children,
}) => {
  const f = useCurrentFrame();
  const cam = planeCam(keys, f);
  // constant drift: slow rotation plus a slow lateral dolly
  const dRy = drift * (Math.sin(f / 70) * 1.6 + f * 0.012);
  const dRz = drift * Math.sin(f / 95) * 0.8;
  const dX = drift * Math.sin(f / 80) * 14; // lateral dolly sway (canvas px); bounded so targets stay centred
  const plane = (
    <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "960px 540px" }}>
      <AbsoluteFill style={{ transformOrigin: "960px 540px", transform: `rotateX(${rx}deg) rotateY(${ry + dRy}deg) rotateZ(${rz + dRz}deg)` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width, height, transformOrigin: "0 0", transform: `translate(${960 - (cam.x + dX) * cam.z}px, ${540 - cam.y * cam.z}px) scale(${cam.z})` }}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
  const mask = `linear-gradient(180deg, transparent ${focusY - band - 140}px, black ${focusY - band}px, black ${focusY + band}px, transparent ${focusY + band + 140}px)`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {stage ?? <LightStage />}
      <AbsoluteFill style={{ filter: cam.blur > 0.2 ? `blur(${cam.blur}px)` : undefined }}>
        <AbsoluteFill style={{ filter: `blur(${far}px)` }}>{plane}</AbsoluteFill>
        <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask }}>{plane}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* =====================================================================================================
 * 8. Brandify
 * ===================================================================================================== */

/**
 * Macro button that becomes the brand: press (0.96, 3 f), fill cross-fades ink → accent gradient over `fill` (12) f
 * inOut(quad), 4 accent-shape shards pop round it (spring d9 s220, 0 → ~1.15 → 1, rotate 0 → 20°, out at +18), 2 f
 * stagger. `held`: the fill starts towards the accent, then settles into the HELD square on the deny wash (no shake).
 * Chain three ~75 f apart for the trilogy (e.g. Create → Confirm → Release).
 */
export const Brandify: React.FC<{ at: number; label: string; doneLabel?: string; held?: boolean; heldLabel?: string; size?: number; fill?: number; shards?: number }> = ({ at, label, doneLabel, held, heldLabel = "Held", size = 64, fill = 12, shards = 4 }) => {
  const f = useCurrentFrame();
  const press = f >= at && f < at + 3 ? 0.96 : 1;
  const m = held ? 0.4 * r(f, at + 2, 6, EZ.inOutQuad) * (1 - r(f, at + 8, 6, EZ.inOutQuad)) : r(f, at + 2, fill, EZ.inOutQuad);
  const deny = held ? r(f, at + 8, 8, EZ.inOutQuad) : 0;
  const swap = r(f, at + 2 + fill * 0.5, 6);
  const shown = held ? (deny > 0.5 ? heldLabel : label) : swap > 0.5 && doneLabel ? doneLabel : label;
  const txt = held ? mix("#FFFFFF", T.denyDeep, deny) : mix("#FFFFFF", T.ink, Math.max(0, Math.min(1, (m - 0.3) / 0.3)));
  const padX = size * 0.9;
  const shardSpots: [number, number, number][] = [
    [-0.52, -0.9, 0.9],
    [0.56, -1.05, 0.7],
    [0.62, 0.95, 1],
    [-0.44, 1.0, 0.65],
    [0.05, -1.3, 0.55],
  ];
  return (
    <div style={{ position: "relative", display: "inline-block", scale: String(press) }}>
      <div style={{ position: "relative", height: size * 2.1, padding: `0 ${padX}px`, borderRadius: size * 0.42, display: "flex", alignItems: "center", gap: size * 0.32, overflow: "hidden", background: T.ink, boxShadow: `0 ${size * 0.4}px ${size}px rgba(10,20,60,${0.18 + 0.12 * m})`, border: held && deny > 0 ? `${2 * deny}px solid ${T.denyDeep}88` : "none" }}>
        <div style={{ position: "absolute", inset: 0, background: ACCENT_GRAD, opacity: m }} />
        {held ? <div style={{ position: "absolute", inset: 0, background: T.denyWash, opacity: deny }} /> : null}
        {m > 0.05 ? <Grain opacity={0.1 * m} blend="overlay" /> : null}
        {held && deny > 0 ? (
          <div style={{ position: "relative", scale: String(0.6 + 0.4 * deny), opacity: deny }}>
            <StateGlyph s="held" size={size * 0.6} />
          </div>
        ) : (
          <AccentShape size={size * 0.72} fill={m > 0.5 ? T.ink : T.accentBright} style={{ position: "relative" }} />
        )}
        <span style={{ position: "relative", fontFamily: FIG, fontWeight: 700, fontSize: size, letterSpacing: -size * 0.02, color: txt, whiteSpace: "nowrap" }}>{shown}</span>
      </div>
      {!held
        ? shardSpots.slice(0, shards).map(([sx, sy, sc], i) => {
            const s0 = at + 4 + i * 2;
            if (f < s0 || f > s0 + 26) return null;
            const g = sp(f, s0, { damping: 9, stiffness: 220 });
            const o = 1 - r(f, s0 + 18, 6);
            const fly = 1.15 + 0.35 * r(f, s0, 24, EZ.outCubic);
            const S = size * 1.1 * sc;
            return (
              <div key={i} style={{ position: "absolute", left: `${50 + sx * 50 * fly}%`, top: `${50 + sy * 50 * fly}%`, translate: "-50% -50%", scale: String(Math.max(0, g) * (0.6 + 0.4 * o)), rotate: `${20 * r(f, s0, 14, EZ.outCubic) * (i % 2 ? -1 : 1)}deg`, opacity: o }}>
                <AccentShape size={S} fill={i % 2 ? T.accentBright : T.accentDeep} />
              </div>
            );
          })
        : null}
    </div>
  );
};

/* =====================================================================================================
 * 9. CaptionToInput
 * ===================================================================================================== */

/**
 * A claim line becomes the product's prompt field: the selection highlight draws behind the caption in 6 f, the
 * text deletes over 8 f back to the caret, the input box springs in {d200, s90} while the camera pulls 2.2 → 1
 * from the caret, then the prompt types at `cps` (25). Layout coords: the field is centred at (960, y).
 */
export const CaptionToInput: React.FC<{ at: number; caption: string; prompt: string; cps?: number; size?: number; inputW?: number; y?: number; zoom?: number }> = ({ at, caption, prompt, cps = 25, size = 40, inputW = 1240, y = 540, zoom = 2.2 }) => {
  const f = useCurrentFrame();
  const textX = 960 - inputW / 2 + 92;
  const fw = (s: string, w = "600") => (s ? measureText({ text: s, fontFamily: FIG, fontSize: size, fontWeight: w, letterSpacing: `${-size * 0.01}px` }).width : 0);
  const sel = r(f, at, 6, EZ.outCubic);
  const del = r(f, at + 8, 8, (x) => x);
  const n = Math.round(caption.length * (1 - del));
  const cap = caption.slice(0, n);
  const capW = fw(cap);
  const boxAt = at + 17;
  const box = sp(f, boxAt, { damping: 200, stiffness: 90 });
  const typeAt = boxAt + 16;
  const typedN = Math.max(0, Math.min(prompt.length, Math.floor(((f - typeAt) / 30) * cps)));
  const deleted = f >= at + 16;
  // camera: centre the caption, follow the caret while deleting, then pull back 2.2 → 1 from the caret
  const cx0 = textX + fw(caption) / 2;
  const cxDel = textX + capW / 2;
  const cx = f < at + 8 ? cx0 : deleted ? lerp(textX, 960, box) : cxDel;
  const z = deleted ? lerp(zoom, 1, box) : zoom;
  const caret = Math.floor((f - at) / 14) % 2 === 0 || (f > at + 6 && f < typeAt + 4) || (typedN > 0 && typedN < prompt.length);
  const shown = deleted ? prompt.slice(0, typedN) : cap;
  const shownW = fw(shown, deleted ? "500" : "600");
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${960 - cx * z}px, ${540 - y * z}px) scale(${z})` }}>
        {/* the field */}
        <div style={{ position: "absolute", left: 960 - inputW / 2, top: y - 52, width: inputW, height: 104, borderRadius: 52, background: "#FFFFFF", border: `1.5px solid ${T.border}`, boxShadow: "0 24px 60px rgba(10,20,60,0.14)", opacity: deleted ? Math.min(1, box * 1.6) : 0, transformOrigin: `${textX - (960 - inputW / 2)}px 52px`, scale: String(deleted ? 0.7 + 0.3 * box : 0.7) }}>
          <div style={{ position: "absolute", left: 30, top: 32 }}><AccentShape size={40} fill={T.accentDeep} /></div>
          <div style={{ position: "absolute", right: 14, top: 14, width: 76, height: 76, borderRadius: 38, background: typedN >= prompt.length ? T.accentDeep : T.soft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={34} height={34} viewBox="0 0 34 34"><path d="M17 27 V8 M9 15 L17 7 L25 15" fill="none" stroke={typedN >= prompt.length ? "#FFFFFF" : T.muted} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        {/* selection highlight */}
        {!deleted ? <div style={{ position: "absolute", left: textX - 6, top: y - size * 0.7, width: (capW + 12) * sel, height: size * 1.4, background: T.accentSoft, borderRadius: 6, opacity: 0.9 }} /> : null}
        <div style={{ position: "absolute", left: textX, top: y - size * 0.62, height: size * 1.24, display: "flex", alignItems: "center", fontFamily: FIG, fontWeight: deleted ? 500 : 600, fontSize: size, letterSpacing: -size * 0.01, color: T.ink, whiteSpace: "pre" }}>
          {shown}
        </div>
        <div style={{ position: "absolute", left: textX + shownW + 3, top: y - size * 0.6, width: 3, height: size * 1.2, background: caret ? T.accentDeep : "transparent", borderRadius: 2 }} />
      </div>
    </AbsoluteFill>
  );
};

/* =====================================================================================================
 * 10. Spotlight + OptionRing
 * ===================================================================================================== */

/** All but the target darkens to black `dim` (52%); the target gets a `stroke` (6) px ring, radius 12; 6 f in/out; no zoom. */
export const Spotlight: React.FC<{ at: number; out?: number; rect: Rect; radius?: number; dim?: number; stroke?: number; color?: string; dur?: number; pad?: number }> = ({ at, out, rect, radius = 12, dim = 0.52, stroke = 6, color = T.accentDeep, dur = 6, pad = 10 }) => {
  const f = useCurrentFrame();
  const a = r(f, at, dur, EZ.outCubic) * (out === undefined ? 1 : 1 - r(f, out, dur, EZ.outCubic));
  if (a <= 0) return null;
  const R = { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: R.x, top: R.y, width: R.w, height: R.h, borderRadius: radius, boxShadow: `0 0 0 4000px rgba(0,0,0,${dim * a})` }} />
      <div style={{ position: "absolute", left: R.x - stroke, top: R.y - stroke, width: R.w + stroke * 2, height: R.h + stroke * 2, borderRadius: radius + stroke, border: `${stroke}px solid ${color}`, opacity: a }} />
    </AbsoluteFill>
  );
};

/** A ring that steps through options: pale → full stroke in 6 f, hold, out 6 f; `per` (32) f per option; `keepLast` holds the chosen one. */
export const OptionRing: React.FC<{ at: number; options: Rect[]; per?: number; stroke?: number; color?: string; radius?: number; keepLast?: boolean; pad?: number }> = ({ at, options, per = 32, stroke = 6, color = T.accentDeep, radius = 999, keepLast = true, pad = 8 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {options.map((o, i) => {
        const s = at + i * per;
        const last = i === options.length - 1;
        const inn = r(f, s, 6, EZ.outCubic);
        const outp = last && keepLast ? 0 : r(f, s + per - 6, 6, EZ.inOutQuad);
        if (inn <= 0 || outp >= 1) return null;
        const R = { x: o.x - pad - stroke, y: o.y - pad - stroke, w: o.w + (pad + stroke) * 2, h: o.h + (pad + stroke) * 2 };
        return (
          <div key={i} style={{ position: "absolute", left: R.x, top: R.y, width: R.w, height: R.h, borderRadius: Math.min(radius, R.h / 2), border: `${stroke}px solid ${mix(T.accentSoft, color, inn)}`, opacity: (0.35 + 0.65 * inn) * (1 - outp), scale: String(1.04 - 0.04 * inn) }} />
        );
      })}
    </AbsoluteFill>
  );
};
