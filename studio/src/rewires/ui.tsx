// Motion-graphics UI kit: illustrative interfaces that demonstrate what the narration says.
// Everything is driven by the frame: tilt-in cards, a focus camera, a cursor that clicks, typing.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, HEAD, MONO } from "./brand";
import { useU } from "./fx";

export type Key = [number, number];

/** Piecewise keyframes: kf(frame, [[0, 0], [20, 1], [40, 0.5]]) with the brand ease between keys. */
export const kf = (frame: number, keys: Key[], easing = EASE_IO) =>
  interpolate(
    frame,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { ...clamp, easing },
  );

export const appear = (frame: number, at: number, dur = 10) => interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EASE });

/** A card that tilts in from depth, settles at a slight angle and keeps a slow drift. */
export const TiltCard: React.FC<{ at?: number; children: React.ReactNode; style?: React.CSSProperties; tilt?: number; from?: "bottom" | "right" | "left" }> = ({
  at = 0,
  children,
  style,
  tilt = 1,
  from = "bottom",
}) => {
  const frame = useCurrentFrame();
  const u = useU();
  const p = appear(frame, at, 11);
  const drift = Math.sin((frame - at) / 40) * 1.2 * tilt;
  const dx = from === "right" ? 260 : from === "left" ? -260 : 0;
  const dy = from === "bottom" ? 220 : 0;
  return (
    <div style={{ perspective: 2200 * u, ...style }}>
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `translate3d(${(1 - p) * dx * u}px, ${(1 - p) * dy * u}px, ${(1 - p) * -300 * u}px) rotateX(${(1 - p) * 28 * tilt + 5 * tilt}deg) rotateY(${(1 - p) * -12 * tilt + drift - 2 * tilt}deg)`,
          opacity: p,
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Camera that eases between focus points. x, y are fractions of the box; s is the zoom. */
export const FocusCam: React.FC<{ keys: { at: number; x: number; y: number; s: number }[]; children: React.ReactNode; style?: React.CSSProperties }> = ({
  keys,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const at = keys.map((k) => k.at);
  const v = (sel: (k: (typeof keys)[0]) => number) => (keys.length > 1 ? interpolate(frame, at, keys.map(sel), { ...clamp, easing: EASE_IO }) : sel(keys[0]));
  // Capped so the crop never exceeds the panel's 30 px inner padding (labels stay whole).
  const s = Math.min(1.06, v((k) => k.s));
  const x = v((k) => k.x);
  const y = v((k) => k.y);
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, ...style }}>
      <div style={{ width: "100%", height: "100%", transformOrigin: `${x * 100}% ${y * 100}%`, scale: String(s) }}>{children}</div>
    </div>
  );
};

/** Pointer that glides between points (px inside its parent) and clicks with a lime ripple. */
export const Cursor: React.FC<{ path: { at: number; x: number; y: number; click?: boolean }[]; show?: [number, number] }> = ({ path, show }) => {
  const frame = useCurrentFrame();
  const u = useU();
  if (!path.length) return null;
  const at = path.map((p) => p.at);
  const x = path.length > 1 ? interpolate(frame, at, path.map((p) => p.x), { ...clamp, easing: EASE_IO }) : path[0].x;
  const y = path.length > 1 ? interpolate(frame, at, path.map((p) => p.y), { ...clamp, easing: EASE_IO }) : path[0].y;
  const [a, b] = show ?? [path[0].at - 8, Infinity];
  const op = Number.isFinite(b) ? Math.min(appear(frame, a, 8), 1 - appear(frame, b, 8)) : appear(frame, a, 8);
  const click = path.filter((p) => p.click && frame >= p.at && frame < p.at + 14).pop();
  const press = click ? interpolate(frame - click.at, [0, 3, 8], [1, 0.82, 1], clamp) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: op, pointerEvents: "none", zIndex: 50 }}>
      {click ? (
        <div
          style={{
            position: "absolute",
            left: -40 * u,
            top: -40 * u,
            width: 80 * u,
            height: 80 * u,
            borderRadius: "50%",
            border: `${3 * u}px solid ${C.lime}`,
            scale: String(interpolate(frame - click.at, [0, 14], [0.2, 1.3], clamp)),
            opacity: interpolate(frame - click.at, [0, 14], [1, 0], clamp),
          }}
        />
      ) : null}
      <svg width={44 * u} height={52 * u} viewBox="0 0 22 26" style={{ scale: String(press), transformOrigin: "0 0", filter: `drop-shadow(0 ${6 * u}px ${10 * u}px rgba(0,0,0,0.55))` }}>
        <path d="M1 1 L1 20 L6 15.5 L9.5 24 L13 22.5 L9.6 14.3 L16 14.3 Z" fill={C.cream} stroke={C.charcoal} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Text typed character by character from `at`, with a blinking caret while typing. */
export const Typed: React.FC<{ text: string; at: number; cpf?: number; caret?: boolean; style?: React.CSSProperties }> = ({ text, at, cpf = 1.4, caret = true, style }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - at) * cpf)));
  const typing = frame >= at && n < text.length;
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span style={style}>
      {text.slice(0, n)}
      {caret && (typing || (frame >= at && frame < at + text.length / cpf + 20 && blink)) ? <span style={{ color: C.lime }}>|</span> : null}
    </span>
  );
};

/** Deletes `from` (right to left), then types `to`. */
export const Retype: React.FC<{ from: string; to: string; at: number; style?: React.CSSProperties; cpf?: number }> = ({ from, to, at, style, cpf = 1.6 }) => {
  const frame = useCurrentFrame();
  const delFrames = Math.ceil(from.length / 3);
  if (frame < at) return <span style={style}>{from}</span>;
  if (frame < at + delFrames) {
    const keep = Math.max(0, from.length - Math.floor((frame - at) * 3));
    return (
      <span style={style}>
        {from.slice(0, keep)}
        <span style={{ color: C.lime }}>|</span>
      </span>
    );
  }
  return <Typed text={to} at={at + delFrames} cpf={cpf} style={style} />;
};

export const Panel: React.FC<{ title?: string; tag?: string; children: React.ReactNode; style?: React.CSSProperties; pad?: number }> = ({ title, tag, children, style, pad = 30 }) => {
  const u = useU();
  return (
    <div
      style={{
        background: "#151515",
        border: `${1.5 * u}px solid rgba(246,244,237,0.09)`,
        borderRadius: 26 * u,
        boxShadow: `0 ${40 * u}px ${80 * u}px rgba(0,0,0,0.55), inset 0 ${1 * u}px 0 rgba(246,244,237,0.05)`,
        overflow: "hidden",
        ...style,
      }}
    >
      {title ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: `${18 * u}px ${pad * u}px`,
            borderBottom: `${1.5 * u}px solid rgba(246,244,237,0.07)`,
            background: C.graphite,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 19 * u, letterSpacing: 3 * u, color: C.stone, textTransform: "uppercase" }}>{title}</span>
          {tag ? <span style={{ fontFamily: MONO, fontSize: 15 * u, letterSpacing: 2.4 * u, color: C.grey, textTransform: "uppercase" }}>{tag}</span> : null}
        </div>
      ) : null}
      <div style={{ padding: pad * u }}>{children}</div>
    </div>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; on?: boolean; p?: number; style?: React.CSSProperties; size?: number }> = ({ children, on = false, p = 1, style, size = 22 }) => {
  const u = useU();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8 * u,
        fontFamily: BODY,
        fontWeight: 600,
        fontSize: size * u,
        padding: `${8 * u}px ${16 * u}px`,
        borderRadius: 999,
        background: on ? C.lime : "rgba(246,244,237,0.07)",
        color: on ? C.charcoal : C.stone,
        border: `${1.5 * u}px solid ${on ? C.lime : "rgba(246,244,237,0.12)"}`,
        opacity: p,
        scale: String(0.85 + 0.15 * p),
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const Avatar: React.FC<{ initials: string; size?: number; hue?: string }> = ({ initials, size = 64, hue = C.stone }) => {
  const u = useU();
  return (
    <div
      style={{
        width: size * u,
        height: size * u,
        borderRadius: "50%",
        background: `linear-gradient(145deg, ${hue}, ${C.grey})`,
        color: C.charcoal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: HEAD,
        fontWeight: 700,
        fontSize: size * 0.38 * u,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

export const Check: React.FC<{ p: number; size?: number }> = ({ p, size = 34 }) => {
  const u = useU();
  return (
    <svg width={size * u} height={size * u} viewBox="0 0 24 24" style={{ scale: String(0.6 + 0.4 * p), opacity: p }}>
      <circle cx="12" cy="12" r="11" fill={C.lime} />
      <path d="M6.5 12.5 L10.2 16 L17.5 8.5" stroke={C.charcoal} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

/** "01 / PROFILE" plus the layer's promise, above the interface. */
export const LayerHead: React.FC<{ num: string; name: string; line: string; dark?: boolean }> = ({ num, name, line }) => {
  const frame = useCurrentFrame();
  const u = useU();
  const p = appear(frame, 0, 12);
  const q = appear(frame, 5, 14);
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 26 * u, letterSpacing: 6 * u, color: C.grey, opacity: p, translate: `${(1 - p) * -20 * u}px 0` }}>
        <span style={{ color: C.lime }}>{num}</span> / {name}
      </div>
      <div style={{ overflow: "hidden", marginTop: 14 * u }}>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: Math.min(60, 920 / (line.length * 0.54)) * u, whiteSpace: "nowrap", lineHeight: 1.02, letterSpacing: -1.6 * u, color: C.cream, translate: `0 ${(1 - q) * 105}%` }}>{line}</div>
      </div>
    </div>
  );
};

/** Small mono tag that marks an interface as a simulation. */
export const Illustrative: React.FC<{ text?: string }> = ({ text = "Illustrative interface" }) => {
  const u = useU();
  return <span style={{ fontFamily: MONO, fontSize: 15 * u, letterSpacing: 2.4 * u, color: C.grey, textTransform: "uppercase" }}>{text}</span>;
};

export const useDur = () => useVideoConfig().durationInFrames;
