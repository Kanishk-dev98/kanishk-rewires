import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO, ZONE } from "./brand";
import { Accent, bodyStyle, Camera, fadeIn, Label, MaskUp, useU, Wires } from "./fx";

export type SceneData = Record<string, any> & { theme?: "dark" | "cream"; syncFrame?: number; syncFrames?: number[] };
export type SceneProps = { data: SceneData };

export const isDark = (d: SceneData) => d.theme !== "cream";

/** Background plus the content zone (between the top safe area and the caption band). */
const Stage: React.FC<{ data: SceneData; children: React.ReactNode; wires?: boolean; push?: number; align?: "center" | "flex-start" }> = ({
  data,
  children,
  wires = true,
  push = 0.035,
  align = "center",
}) => {
  const { height } = useVideoConfig();
  const u = useU();
  const dark = isDark(data);
  return (
    <AbsoluteFill style={{ background: dark ? C.charcoal : C.cream }}>
      {wires ? <Wires seed={String(data.kicker ?? "s")} opacity={dark ? 0.13 : 0.22} color={dark ? C.cream : C.stone} /> : null}
      <Camera push={push}>
        <div
          style={{
            position: "absolute",
            left: 80 * u,
            right: 80 * u,
            top: height * ZONE.contentTop,
            height: height * (ZONE.contentBottom - ZONE.contentTop),
            display: "flex",
            flexDirection: "column",
            justifyContent: align,
          }}
        >
          {children}
        </div>
      </Camera>
    </AbsoluteFill>
  );
};

const headStyle = (u: number, dark: boolean, size: number): React.CSSProperties => ({
  fontFamily: HEAD,
  fontWeight: 700,
  fontSize: size * u,
  lineHeight: 0.98,
  letterSpacing: `${-0.035 * size * u}px`,
  color: dark ? C.cream : C.charcoal,
});

// ---------------------------------------------------------------- hook
/** Oversized editorial type, line by line. The opening image of the film. */
export const HookScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const u = useU();
  const dark = isDark(data);
  const lines: string[] = data.lines ?? [];
  const step = data.step ?? 7;
  const subAt = (data.subAt ?? lines.length * step + 10) as number;
  return (
    <Stage data={data} push={0.06}>
      {data.kicker ? (
        <div style={{ opacity: fadeIn(frame, 0), marginBottom: 36 * u }}>
          <Label color={dark ? C.lime : C.graphite}>{data.kicker}</Label>
        </div>
      ) : null}
      {lines.map((l, i) => (
        <MaskUp key={i} at={2 + i * step}>
          <div style={headStyle(u, dark, data.size ?? 132)}>
            <Accent text={l} dark={dark} />
          </div>
        </MaskUp>
      ))}
      {data.sub ? (
        <div style={{ ...bodyStyle(u, dark), marginTop: 44 * u, opacity: fadeIn(frame, subAt, 14), maxWidth: 820 * u }}>
          <Accent text={data.sub} dark={dark} />
        </div>
      ) : null}
    </Stage>
  );
};

// ---------------------------------------------------------------- stat
const fmt = (v: number, decimals: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** One number, counted up so it lands on the frame the narrator says it. */
export const StatScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const u = useU();
  const dark = isDark(data);
  const land = data.syncFrame ?? 24;
  // The number is on screen from the start and counts into the spoken word: no empty lead-in.
  const start = Math.min(6, Math.max(0, land - 12));
  const p = interpolate(frame, [start, land], [0, 1], { ...clamp, easing: EASE });
  const value = data.value as number;
  const shown = data.display ?? `${data.prefix ?? ""}${fmt(value * p, data.decimals ?? 0)}${data.suffix ?? ""}`;
  const pop = spring({ frame: frame - land, fps: 30, config: { damping: 16, stiffness: 180 } });
  const underline = interpolate(frame, [land, land + 14], [0, 1], { ...clamp, easing: EASE });
  return (
    <Stage data={data}>
      <div style={{ opacity: fadeIn(frame, 0) }}>
        <Label color={dark ? C.grey : "#6E6E68"}>{data.kicker}</Label>
      </div>
      <div
        style={{
          ...headStyle(u, dark, data.size ?? 260),
          marginTop: 30 * u,
          fontVariantNumeric: "tabular-nums",
          scale: String(interpolate(pop, [0, 1], [0.97, 1])),
          transformOrigin: "left center",
          opacity: fadeIn(frame, start, 6),
          whiteSpace: "nowrap",
        }}
      >
        {shown}
        {data.unit ? (
          <span style={{ fontSize: "0.34em", fontWeight: 500, letterSpacing: 0, marginLeft: 18 * u, color: dark ? C.stone : C.graphite }}>
            {data.unit}
          </span>
        ) : null}
      </div>
      <div style={{ height: 6 * u, width: `${underline * (data.underline ?? 46)}%`, background: C.lime, marginTop: 18 * u }} />
      <div style={{ ...bodyStyle(u, dark), fontSize: 46 * u, marginTop: 40 * u, maxWidth: 860 * u, opacity: fadeIn(frame, land + 4, 14) }}>
        <Accent text={data.label} dark={dark} />
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- compare
/** Before and after, as two bars on one accurate scale. */
export const CompareScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const u = useU();
  const dark = isDark(data);
  const rows: { label: string; value: number; display: string; win?: boolean }[] = data.rows;
  const max = Math.max(...rows.map((r) => r.value));
  const syncs = data.syncFrames ?? rows.map((_, i) => 10 + i * 22);
  return (
    <Stage data={data}>
      <div style={{ opacity: fadeIn(frame, 0) }}>
        <Label color={dark ? C.grey : "#6E6E68"}>{data.kicker}</Label>
      </div>
      {data.title ? (
        <MaskUp at={3} style={{ marginTop: 26 * u }}>
          <div style={headStyle(u, dark, 76)}>
            <Accent text={data.title} dark={dark} />
          </div>
        </MaskUp>
      ) : null}
      <div style={{ marginTop: 70 * u, display: "flex", flexDirection: "column", gap: 64 * u }}>
        {rows.map((r, i) => {
          const at = syncs[i] ?? 10;
          const grow = interpolate(frame, [at - 6, at + 16], [0, 1], { ...clamp, easing: EASE_IO });
          const color = r.win ? C.lime : dark ? C.stone : C.graphite;
          return (
            <div key={i} style={{ opacity: fadeIn(frame, at - 8, 8) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 * u }}>
                <Label color={dark ? C.stone : C.graphite} size={28}>
                  {r.label}
                </Label>
                <div style={{ ...headStyle(u, dark, 92), color: r.win && dark ? C.lime : dark ? C.cream : C.charcoal }}>{r.display}</div>
              </div>
              <div style={{ height: 22 * u, background: dark ? C.graphite : C.stone }}>
                <div style={{ height: "100%", width: `${(r.value / max) * 100 * grow}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
      {data.note ? (
        <div style={{ ...bodyStyle(u, dark), marginTop: 56 * u, opacity: fadeIn(frame, (syncs[syncs.length - 1] ?? 30) + 18, 14) }}>
          <Accent text={data.note} dark={dark} />
        </div>
      ) : null}
    </Stage>
  );
};

// ---------------------------------------------------------------- quote
/** Evidence card: an exact quote with its speaker and date. */
export const QuoteScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const u = useU();
  const dark = isDark(data);
  const words: string[] = String(data.quote).split(" ");
  const span = data.revealFrames ?? Math.min(40, words.length * 2.2);
  // Reveal follows the narrator: starts on the first quoted word when the storyboard syncs it.
  const q0 = data.syncFrame ?? 6;
  return (
    <Stage data={data} push={0.06}>
      <div style={{ opacity: fadeIn(frame, 0) }}>
        <Label color={dark ? C.grey : "#6E6E68"}>{data.kicker ?? "On the record"}</Label>
      </div>
      <div style={{ ...headStyle(u, dark, 112), color: C.lime, marginTop: 34 * u, height: 70 * u, opacity: fadeIn(frame, 2) }}>“</div>
      <div style={{ ...headStyle(u, dark, data.size ?? 72), fontWeight: 500, lineHeight: 1.12 }}>
        {words.map((w, i) => {
          const at = q0 + (i / words.length) * span;
          const p = interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: EASE });
          const hl = (data.highlight ?? []).includes(w.replace(/[.,!?”"]/g, "").toLowerCase());
          return (
            <span key={i} style={{ opacity: 0.1 + 0.9 * p, color: hl ? (dark ? C.lime : C.charcoal) : undefined }}>
              {w}{" "}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 50 * u, display: "flex", alignItems: "center", gap: 20 * u, opacity: fadeIn(frame, 8, 14), translate: `${(1 - fadeIn(frame, 8, 14)) * -24 * u}px 0` }}>
        <div style={{ width: 48 * u, height: 2 * u, background: C.lime }} />
        <div>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 34 * u, color: dark ? C.cream : C.charcoal }}>{data.who}</div>
          <Label size={22} style={{ marginTop: 8 * u }}>
            {data.role}
          </Label>
        </div>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- timeline
/** Dated steps, revealed as the narrator reaches each one. */
export const TimelineScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const u = useU();
  const dark = isDark(data);
  const items: { date: string; text: string }[] = data.items;
  const syncs: number[] = data.syncFrames ?? items.map((_, i) => 8 + i * 30);
  const lastIdx = syncs.reduce((a, s, i) => (frame >= s - 4 ? i : a), -1);
  const lineP = interpolate(frame, [syncs[0] - 4, syncs[syncs.length - 1] + 6], [0, 1], { ...clamp, easing: EASE_IO });
  return (
    <Stage data={data}>
      <div style={{ opacity: fadeIn(frame, 0), marginBottom: 56 * u }}>
        <Label color={dark ? C.grey : "#6E6E68"}>{data.kicker}</Label>
      </div>
      <div style={{ position: "relative", paddingLeft: 64 * u }}>
        <div style={{ position: "absolute", left: 9 * u, top: 18 * u, bottom: 18 * u, width: 2 * u, background: dark ? C.graphite : C.stone }}>
          <div style={{ width: "100%", height: `${lineP * 100}%`, background: C.lime }} />
        </div>
        {items.map((it, i) => {
          const p = interpolate(frame, [syncs[i] - 6, syncs[i] + 10], [0, 1], { ...clamp, easing: EASE });
          const current = i === lastIdx;
          return (
            <div key={i} style={{ position: "relative", marginBottom: 58 * u, opacity: 0.15 + 0.85 * p, translate: `${(1 - p) * 30 * u}px 0` }}>
              <div
                style={{
                  position: "absolute",
                  left: -64 * u,
                  top: 10 * u,
                  width: 20 * u,
                  height: 20 * u,
                  borderRadius: "50%",
                  background: p > 0.5 ? C.lime : dark ? C.graphite : C.stone,
                }}
              />
              <Label color={current ? (dark ? C.lime : C.charcoal) : C.grey} size={26}>
                {it.date}
              </Label>
              <div style={{ ...headStyle(u, dark, 58), fontWeight: 500, lineHeight: 1.1, marginTop: 12 * u, opacity: current ? 1 : 0.6 }}>
                <Accent text={it.text} dark={dark} />
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- route
/** One input splitting into two paths: the decision diagram. */
export const RouteScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const u = useU();
  const dark = isDark(data);
  const [sa, sb] = data.syncFrames ?? [24, 48];
  const w = width - 160 * u;
  const h = 520 * u;
  const draw = (at: number) => interpolate(frame, [at - 14, at + 6], [0, 1], { ...clamp, easing: EASE_IO });
  const pathA = `M ${w / 2} 0 C ${w / 2} ${h * 0.35}, ${w * 0.22} ${h * 0.35}, ${w * 0.22} ${h * 0.62}`;
  const pathB = `M ${w / 2} 0 C ${w / 2} ${h * 0.35}, ${w * 0.78} ${h * 0.35}, ${w * 0.78} ${h * 0.62}`;
  const branch = (d: string, at: number, accent: boolean) => (
    <path d={d} stroke={accent ? C.lime : dark ? C.stone : C.graphite} strokeWidth={4 * u} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw(at)} />
  );
  const node = (n: { label: string; sub?: string }, at: number, x: number, accent: boolean) => (
    <div
      style={{
        position: "absolute",
        top: h * 0.66,
        left: x - 210 * u,
        width: 420 * u,
        textAlign: "center",
        opacity: fadeIn(frame, at, 12),
        translate: `0 ${(1 - fadeIn(frame, at, 12)) * 20 * u}px`,
      }}
    >
      <div style={{ ...headStyle(u, dark, 64), color: accent && dark ? C.lime : dark ? C.cream : C.charcoal }}>{n.label}</div>
      {n.sub ? <div style={{ ...bodyStyle(u, dark), fontSize: 32 * u, marginTop: 14 * u }}>{n.sub}</div> : null}
    </div>
  );
  return (
    <Stage data={data}>
      <div style={{ opacity: fadeIn(frame, 0), textAlign: "center" }}>
        <Label color={dark ? C.grey : "#6E6E68"}>{data.kicker}</Label>
      </div>
      <MaskUp at={2} style={{ marginTop: 24 * u, textAlign: "center" }}>
        <div style={{ ...headStyle(u, dark, 70), fontWeight: 500 }}>
          <Accent text={data.input} dark={dark} />
        </div>
      </MaskUp>
      <div style={{ position: "relative", height: h * 1.05, marginTop: 30 * u }}>
        <svg width={w} height={h} style={{ position: "absolute", top: 0, left: 0 }}>
          {branch(pathA, sa, data.accent === "a")}
          {branch(pathB, sb, data.accent === "b")}
        </svg>
        {node(data.a, sa, w * 0.22, data.accent === "a")}
        {node(data.b, sb, w * 0.78, data.accent === "b")}
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- headline
/** Editorial headline with a supporting line. */
export const HeadlineScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const u = useU();
  const dark = isDark(data);
  const lines: string[] = data.lines ?? [data.title];
  return (
    <Stage data={data}>
      <div style={{ opacity: fadeIn(frame, 0), marginBottom: 34 * u }}>
        <Label color={dark ? C.grey : "#6E6E68"}>{data.kicker}</Label>
      </div>
      {lines.map((l, i) => (
        <MaskUp key={i} at={3 + i * 6}>
          <div style={headStyle(u, dark, data.size ?? 104)}>
            <Accent text={l} dark={dark} />
          </div>
        </MaskUp>
      ))}
      {data.body ? (
        <div style={{ ...bodyStyle(u, dark), marginTop: 46 * u, maxWidth: 860 * u, opacity: fadeIn(frame, data.bodyAt ?? 20, 14) }}>
          <Accent text={data.body} dark={dark} />
        </div>
      ) : null}
    </Stage>
  );
};

// ---------------------------------------------------------------- takeaway
/** The practical conclusion: numbered points, then one closing line. */
export const TakeawayScene: React.FC<SceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const u = useU();
  const dark = isDark(data);
  const points: string[] = data.points ?? [];
  const syncs: number[] = data.syncFrames ?? points.map((_, i) => 8 + i * 24);
  const finalAt = data.finalAt ?? (syncs[syncs.length - 1] ?? 0) + 30;
  return (
    <Stage data={data}>
      <div style={{ opacity: fadeIn(frame, 0), marginBottom: 50 * u }}>
        <Label color={dark ? C.lime : C.graphite}>{data.kicker}</Label>
      </div>
      {points.map((pt, i) => (
        <div key={i} style={{ display: "flex", gap: 30 * u, marginBottom: 40 * u, opacity: fadeIn(frame, syncs[i] - 4, 12) }}>
          <div style={{ fontFamily: MONO, fontSize: 30 * u, color: C.lime, paddingTop: 12 * u, minWidth: 50 * u }}>{String(i + 1).padStart(2, "0")}</div>
          <MaskUp at={syncs[i] - 4}>
            <div style={{ ...headStyle(u, dark, 62), fontWeight: 500, lineHeight: 1.08, whiteSpace: "pre-line" }}>
              <Accent text={pt} dark={dark} />
            </div>
          </MaskUp>
        </div>
      ))}
      {data.final ? (
        <div style={{ ...headStyle(u, dark, 76), marginTop: 30 * u, opacity: fadeIn(frame, finalAt, 14) }}>
          <Accent text={data.final} dark={dark} />
        </div>
      ) : null}
    </Stage>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  hook: HookScene,
  stat: StatScene,
  compare: CompareScene,
  quote: QuoteScene,
  timeline: TimelineScene,
  route: RouteScene,
  headline: HeadlineScene,
  takeaway: TakeawayScene,
};
