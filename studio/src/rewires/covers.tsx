// Minimal covers (9:16, grid-safe centre 3:4 = y 240-1680): one hero visual that IS the topic, a 3-5 word
// headline with one accent word in a selection box, generous space, the small brand mark. Nothing else.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BODY, BRAND, C, HEAD, SERIF } from "./brand";

type Hero = { kind: "loop"; label: string; sup?: string } | { kind: "logo"; src: string } | { kind: "image"; src: string; w: number; h: number; top?: number } | { kind: "text"; text: string };

const Selection: React.FC<{ children: React.ReactNode; light: boolean }> = ({ children, light }) => (
  <span style={{ position: "relative", display: "inline-block", padding: "0 14px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: light ? C.charcoal : C.lime }}>
    <span style={{ position: "absolute", inset: "6px -2px 2px", background: light ? "rgba(167,255,63,0.55)" : "rgba(167,255,63,0.14)", border: `3px solid ${light ? C.charcoal : C.lime}` }}>
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], k) => (
        <span key={k} style={{ position: "absolute", [x ? "right" : "left"]: -9, [y ? "bottom" : "top"]: -9, width: 15, height: 15, background: light ? C.cream : C.charcoal, border: `3px solid ${light ? C.charcoal : C.lime}` }} />
      ))}
    </span>
    <span style={{ position: "relative" }}>{children}</span>
  </span>
);

export const ThumbMin: React.FC<{ light?: boolean; line1: string; accent: string; line2?: string; hero: Hero; guides?: boolean }> = ({ light = true, line1, accent, line2, hero, guides }) => {
  const fg = light ? C.charcoal : C.cream;
  return (
    <AbsoluteFill style={{ background: light ? C.cream : C.charcoal, color: fg }}>
      <AbsoluteFill style={{ background: light ? "radial-gradient(ellipse 70% 40% at 50% 60%, rgba(255,255,255,0.95), rgba(246,244,237,0) 70%)" : "radial-gradient(ellipse 70% 40% at 50% 60%, rgba(167,255,63,0.10), rgba(10,10,10,0) 70%)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 360, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 118, lineHeight: 1.08, letterSpacing: -3 }}>
        <div>{line1}</div>
        <div style={{ fontSize: 132, marginTop: 6 }}>
          <Selection light={light}>{accent}</Selection>
        </div>
        {line2 ? <div style={{ marginTop: 6 }}>{line2}</div> : null}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, height: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {hero.kind === "loop" ? (
          <div style={{ position: "relative", width: 640, height: 640, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={640} height={640} viewBox="0 0 640 640" style={{ position: "absolute", inset: 0 }}>
              <path d="M 320 40 A 280 280 0 1 1 78 180" stroke={light ? "#3E7A00" : C.lime} strokeWidth={12} fill="none" strokeLinecap="round" />
              <path d="M 52 150 L 78 180 L 112 158" stroke={light ? "#3E7A00" : C.lime} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={320} cy={40} r={14} fill={C.lime} stroke={light ? "#3E7A00" : C.lime} strokeWidth={4} />
            </svg>
            <div style={{ background: light ? C.charcoal : C.cream, color: light ? C.cream : C.charcoal, borderRadius: 30, padding: "26px 38px", fontFamily: HEAD, fontWeight: 700, fontSize: 84, letterSpacing: -2, boxShadow: "0 30px 70px rgba(10,10,10,0.25)" }}>
              {hero.label}
              {hero.sup ? <sup style={{ fontSize: 46, color: C.lime }}>{hero.sup}</sup> : null}
            </div>
          </div>
        ) : hero.kind === "image" ? (
          <Img src={staticFile(hero.src)} style={{ width: hero.w, height: hero.h, objectFit: "contain", marginTop: hero.top ?? 0 }} />
        ) : hero.kind === "logo" ? (
          <Img src={staticFile(hero.src)} style={{ width: 640, height: 300, objectFit: "contain" }} />
        ) : (
          <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 120 }}>{hero.text}</div>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1580, display: "flex", justifyContent: "center", alignItems: "center", gap: 12, opacity: 0.85 }}>
        <Img src={staticFile(BRAND.logo.monogramPublic)} style={{ width: 46, height: 46 }} />
        <span style={{ fontFamily: BODY, fontSize: 1, opacity: 0 }}>.</span>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 28, color: light ? "#55534C" : C.stone }}>
          {BRAND.wordmark.left}
          <span style={{ color: light ? "#3E7A00" : C.lime }}>{BRAND.wordmark.dot}</span>
          {BRAND.wordmark.right}
        </span>
      </div>
      {guides ? <div style={{ position: "absolute", left: 0, right: 0, top: 240, height: 1440, border: "4px dashed #E5484D" }} /> : null}
    </AbsoluteFill>
  );
};
