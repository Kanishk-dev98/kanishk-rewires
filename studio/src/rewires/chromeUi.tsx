// ChatGPT-in-Chrome interfaces (recreated, illustrative data) for the tutorial grammar.
// Steps follow OpenAI's own docs: install the extension, Settings > Computer Use, @-mention Chrome, approve each new site.
import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, MONO } from "./brand";
import { usePop } from "./tut";
import { SYS } from "./real";

type Cue = (name: string, fb: number) => number;
const G_BLUE = "#0B57D0";
const OPENAI_W = "media/chrome/openai-white.svg";
const CHROME = "media/chrome/chrome-color.svg";

const typed = (frame: number, text: string, at: number, cps = 1.6) => text.slice(0, Math.max(0, Math.floor((frame - at) * cps)));

/** macOS-style pointer; `label` turns it into a named agent cursor. */
export const Pointer: React.FC<{ x: number; y: number; label?: string; press?: boolean }> = ({ x, y, label, press }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 20, scale: press ? "0.86" : "1", transformOrigin: "0 0" }}>
    <svg width={34} height={40} viewBox="0 0 17 20" style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.4))" }}>
      <path d="M1 1 L1 16 L5 12.4 L7.8 18.6 L10.4 17.4 L7.7 11.3 L13 11.3 Z" fill={label ? C.lime : "#111"} stroke="white" strokeWidth={1.3} strokeLinejoin="round" />
    </svg>
    {label ? <div style={{ position: "absolute", left: 26, top: 30, background: C.lime, color: C.charcoal, fontFamily: BODY, fontWeight: 800, fontSize: 18, borderRadius: 8, padding: "3px 10px", whiteSpace: "nowrap" }}>{label}</div> : null}
  </div>
);

/** Pointer path through keyframes [frame, x, y]. */
const usePath = (keys: [number, number, number][]) => {
  const frame = useCurrentFrame();
  const f = keys.map((k) => k[0]);
  const opt = { ...clamp, easing: EASE_IO };
  return { x: interpolate(frame, f, keys.map((k) => k[1]), opt), y: interpolate(frame, f, keys.map((k) => k[2]), opt) };
};

const OpenAITile: React.FC<{ size: number; radius?: number }> = ({ size, radius = 0.24 }) => (
  <div style={{ width: size, height: size, borderRadius: size * radius, background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <Img src={staticFile(OPENAI_W)} style={{ width: size * 0.6, height: size * 0.6 }} />
  </div>
);

/** Chrome window: tab strip, URL bar, optional ChatGPT side panel. */
export const ChromeWindow: React.FC<{ tabs: string[]; active: number; url: string; at?: number; height: number; children: React.ReactNode; side?: React.ReactNode; glow?: number[] }> = ({ tabs, active, url, at = 0, height, children, side, glow = [] }) => {
  const pop = usePop();
  return (
    <div style={{ height, borderRadius: 22, overflow: "hidden", background: "#DFE3E8", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", ...pop(at, { rise: 50, scale: 0.94 }) }}>
      <div style={{ height: 52, display: "flex", alignItems: "flex-end", gap: 4, padding: "0 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignSelf: "center", marginRight: 10 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
        </div>
        {tabs.map((t, i) => (
          <div key={i} style={{ flex: "0 1 210px", minWidth: 0, height: 40, borderRadius: "12px 12px 0 0", background: i === active ? "white" : "transparent", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", fontFamily: SYS, fontSize: 15, color: "#3C4043", boxShadow: glow.includes(i) ? `inset 0 0 0 3px ${C.lime}` : undefined }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: ["#5F6368", "#E8710A", "#1E8E3E", "#A142F4"][i % 4], flexShrink: 0 }} />
            <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 50, background: "white", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", borderBottom: "1px solid #E3E3E3", flexShrink: 0 }}>
        <span style={{ fontFamily: SYS, fontSize: 20, color: "#5F6368" }}>←  →  ↻</span>
        <div style={{ flex: 1, height: 34, borderRadius: 17, background: "#F1F3F4", display: "flex", alignItems: "center", padding: "0 16px", fontFamily: SYS, fontSize: 16, color: "#3C4043", overflow: "hidden", whiteSpace: "nowrap" }}>{url}</div>
        <OpenAITile size={30} radius={0.3} />
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ flex: 1, background: "white", position: "relative", overflow: "hidden" }}>{children}</div>
        {side ? <div style={{ width: 360, background: "#F9F9F9", borderLeft: "1px solid #E3E3E3", position: "relative", overflow: "hidden" }}>{side}</div> : null}
      </div>
    </div>
  );
};

/** The ChatGPT side chat: header, a user prompt being typed, then the reply. */
const SideChat: React.FC<{ prompt: string; at: number; children?: React.ReactNode; mode: string }> = ({ prompt, at, children, mode }) => {
  const frame = useCurrentFrame();
  const t = typed(frame, prompt, at, 2.2);
  const parts = t.split(/(@Chrome)/);
  return (
    <div style={{ padding: 18, fontFamily: SYS, height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <OpenAITile size={34} radius={0.3} />
        <span style={{ fontWeight: 700, fontSize: 20, color: "#0D0D0D" }}>ChatGPT</span>
        <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, color: "#0D0D0D", background: "#ECECEC", borderRadius: 999, padding: "4px 12px" }}>{mode}</span>
      </div>
      {frame >= at ? (
        <div style={{ alignSelf: "flex-end", maxWidth: "92%", background: "#E8E8E8", borderRadius: 18, padding: "10px 14px", fontSize: 17, lineHeight: 1.35, color: "#0D0D0D" }}>
          {parts.map((p, i) => (p === "@Chrome" ? <span key={i} style={{ color: G_BLUE, fontWeight: 700 }}>{p}</span> : <span key={i}>{p}</span>))}
          {t.length < prompt.length ? <span style={{ color: "#999" }}>▍</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
};

// ------------------------------------------------------------------ step 1: Chrome Web Store listing
export const HeroWebStore: React.FC<{ c: Cue }> = ({ c }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const click = c("install", 50);
  const added = frame >= click + 4;
  const p = usePath([[0, 760, 700], [click - 14, 640, 330], [click, 640, 330]]);
  return (
    <div style={{ position: "relative" }}>
      <ChromeWindow tabs={["Chrome Web Store"]} active={0} url="chromewebstore.google.com/detail/chatgpt" height={640}>
        <div style={{ padding: "34px 36px", fontFamily: SYS }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <OpenAITile size={120} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 44, fontWeight: 700, color: "#1F1F1F" }}>ChatGPT</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 20, color: "#444746", ...pop(c("openai", 20), { scale: 1, rise: 6 }) }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: G_BLUE, color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>✓</span>
                <span style={{ fontWeight: 600 }}>openai.com</span>
                <span style={{ color: "#747775" }}>· Featured</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ background: added ? "white" : G_BLUE, color: added ? G_BLUE : "white", border: `2px solid ${G_BLUE}`, borderRadius: 999, padding: "14px 30px", fontWeight: 700, fontSize: 22 }}>{added ? "Remove from Chrome" : "Add to Chrome"}</div>
            <span style={{ fontSize: 19, color: "#747775" }}>7,000,000 users</span>
          </div>
          <div style={{ marginTop: 34, fontSize: 22, color: "#1F1F1F", fontWeight: 600 }}>Control your browser with ChatGPT.</div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Research across tabs", "Fill forms", "Organize tabs", "Download files"].map((f, i) => (
              <span key={f} style={{ fontSize: 17, background: "#F1F3F4", borderRadius: 10, padding: "8px 14px", color: "#3C4043", ...pop(12 + i * 4, { scale: 0.8, rise: 8 }) }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </ChromeWindow>
      <Pointer x={p.x} y={p.y} press={Math.abs(frame - click) < 4} />
      {added ? (
        <div style={{ position: "absolute", right: 30, top: 70, width: 400, background: "white", borderRadius: 16, padding: "18px 20px", boxShadow: "0 20px 50px rgba(0,0,0,0.35)", fontFamily: SYS, display: "flex", gap: 14, alignItems: "center", ...pop(click + 6, { rise: -20, scale: 0.9 }) }}>
          <OpenAITile size={44} radius={0.3} />
          <div style={{ fontSize: 18, color: "#1F1F1F", fontWeight: 600 }}>ChatGPT has been added to Chrome</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center", ...pop(c("check", 90), { rise: 20, scale: 0.7 }) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.lime, color: C.charcoal, borderRadius: 18, padding: "14px 26px", fontFamily: BODY, fontWeight: 800, fontSize: 32, rotate: "-3deg", boxShadow: "0 16px 34px rgba(0,0,0,0.45)" }}>
          Check the publisher is OpenAI
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ step 2: desktop app > Settings > Computer Use
export const HeroComputerUse: React.FC<{ c: Cue }> = ({ c }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const sel = c("computer", 30);
  const conn = c("connect", 80);
  const on = frame >= conn + 6;
  const p = usePath([[0, 700, 760], [sel - 12, 150, 452], [sel + 4, 150, 452], [conn - 12, 790, 214], [conn + 10, 790, 214]]);
  const items = ["General", "Notifications", "Personalization", "Apps", "Computer Use", "Security"];
  const browsers: [string, string, boolean][] = [["Google Chrome", CHROME, true], ["Microsoft Edge", "", false], ["Brave Browser", "", false]];
  return (
    <div style={{ position: "relative" }}>
      <div style={{ height: 760, borderRadius: 22, overflow: "hidden", background: "white", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", display: "flex", fontFamily: SYS, ...pop(0, { rise: 50, scale: 0.94 }) }}>
        <div style={{ width: 280, background: "#F3F3F3", padding: "22px 14px", borderRight: "1px solid #E5E5E5" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 22, paddingLeft: 6 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((col) => (
              <div key={col} style={{ width: 12, height: 12, borderRadius: "50%", background: col }} />
            ))}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#8E8E8E", padding: "0 12px 10px", letterSpacing: 0.5 }}>SETTINGS</div>
          {items.map((it) => {
            const act = it === "Computer Use" && frame >= sel;
            return (
              <div key={it} style={{ padding: "12px 14px", borderRadius: 12, fontSize: 20, fontWeight: act ? 700 : 500, color: "#0D0D0D", background: act ? "#E3E3E3" : "transparent", marginBottom: 4 }}>
                {it}
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, padding: "30px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <OpenAITile size={40} radius={0.3} />
            <div style={{ fontSize: 30, fontWeight: 700, color: "#0D0D0D" }}>{frame >= sel ? "Computer Use" : "General"}</div>
          </div>
          {frame >= sel ? (
            <>
              <div style={{ fontSize: 17, color: "#6E6E6E", marginTop: 10, lineHeight: 1.4, ...pop(sel + 2, { scale: 1, rise: 6 }) }}>Let ChatGPT use your browser to complete tasks.</div>
              {browsers.map(([name, logo, main], i) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: "1px solid #EEE", opacity: main ? 1 : 0.45, ...pop(sel + 6 + i * 4, { scale: 1, rise: 10 }) }}>
                  {logo ? <Img src={staticFile(logo)} style={{ width: 40, height: 40 }} /> : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#D9D9D9" }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: "#0D0D0D" }}>{name}</div>
                    {main && on ? <div style={{ fontSize: 15, color: "#1E8E3E", fontWeight: 600 }}>● Connected</div> : null}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, borderRadius: 999, padding: "8px 18px", background: main && on ? "#ECECEC" : "#0D0D0D", color: main && on ? "#0D0D0D" : "white" }}>{main && on ? "Manage" : "Install"}</div>
                </div>
              ))}
            </>
          ) : null}
        </div>
      </div>
      <Pointer x={p.x} y={p.y} press={Math.abs(frame - sel) < 4 || Math.abs(frame - conn) < 4} />
    </div>
  );
};

// ------------------------------------------------------------------ step 3: Chat mode reads your tabs
const PRODUCTS = [
  { name: "ErgoFlex Pro", store: "Store A", price: "$389", warranty: "5 yrs", returns: "30 days", hue: "#3D5A80" },
  { name: "Atlas Mesh", store: "Store B", price: "$329", warranty: "8 yrs", returns: "60 days", hue: "#6B8F71" },
  { name: "Nova Seat", store: "Store C", price: "$299", warranty: "2 yrs", returns: "14 days", hue: "#9C6644" },
];
export const HeroChatTabs: React.FC<{ c: Cue }> = ({ c }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const ask = c("ask", 10);
  const read = c("compare", 50);
  const table = c("table", 90);
  const scanning = frame >= read && frame < table;
  const glow = scanning ? [Math.floor((frame - read) / 8) % 3] : [];
  const active = scanning ? glow[0] : 0;
  const pr = PRODUCTS[active];
  return (
    <ChromeWindow tabs={PRODUCTS.map((p) => `${p.name} | ${p.store}`)} active={active} glow={glow} url={`${pr.store.toLowerCase().replace(" ", "")}.com/chairs/${pr.name.toLowerCase().replace(" ", "-")}`} height={820}
      side={
        <SideChat prompt="@Chrome compare these 3 chairs: price, warranty, returns" at={ask} mode="Chat">
          {frame >= read && frame < table ? <div style={{ fontSize: 16, color: "#6E6E6E" }}>Reading 3 tabs{".".repeat(1 + (Math.floor(frame / 6) % 3))}</div> : null}
          {frame >= table ? (
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #E5E5E5", overflow: "hidden", fontSize: 15, ...pop(table, { rise: 14, scale: 0.96 }) }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.8fr 0.8fr 0.9fr", background: "#F3F3F3", fontWeight: 700, padding: "8px 10px", color: "#0D0D0D" }}>
                <span>Chair</span>
                <span>Price</span>
                <span>Warr.</span>
                <span>Returns</span>
              </div>
              {PRODUCTS.map((p, i) => (
                <div key={p.name} style={{ display: "grid", gridTemplateColumns: "1.3fr 0.8fr 0.8fr 0.9fr", padding: "9px 10px", borderTop: "1px solid #EEE", color: "#0D0D0D", background: i === 1 && frame >= c("best", table + 30) ? "#EAFFD0" : "white", ...pop(table + 6 + i * 6, { scale: 1, rise: 8 }) }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span>{p.price}</span>
                  <span>{p.warranty}</span>
                  <span>{p.returns}</span>
                </div>
              ))}
              <div style={{ padding: "10px", fontWeight: 700, color: "#0D0D0D", borderTop: "1px solid #EEE", ...pop(c("best", table + 30), { scale: 1, rise: 6 }) }}>Best value: Atlas Mesh</div>
            </div>
          ) : null}
        </SideChat>
      }
    >
      <div style={{ padding: 26, fontFamily: SYS }}>
        <div style={{ height: 300, borderRadius: 16, background: `linear-gradient(135deg, ${pr.hue}, #1d1d1d)`, display: "flex", alignItems: "flex-end", padding: 20 }}>
          <svg width={150} height={190} viewBox="0 0 60 76" style={{ marginLeft: "auto", marginRight: "auto", opacity: 0.85 }}>
            <rect x={14} y={2} width={32} height={36} rx={8} fill="#F6F4ED" opacity={0.9} />
            <rect x={10} y={40} width={40} height={8} rx={4} fill="#F6F4ED" opacity={0.9} />
            <rect x={28} y={48} width={4} height={16} fill="#F6F4ED" opacity={0.7} />
            <path d="M14 70 L46 70 M30 64 L14 72 M30 64 L46 72" stroke="#F6F4ED" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
          </svg>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#1F1F1F", marginTop: 18 }}>{pr.name}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#1F1F1F", marginTop: 6 }}>{pr.price}</div>
        <div style={{ fontSize: 17, color: "#5F6368", marginTop: 10, lineHeight: 1.6 }}>
          Warranty: {pr.warranty}
          <br />
          Free returns within {pr.returns}
        </div>
        <div style={{ marginTop: 18, background: "#FFD814", borderRadius: 999, padding: "12px 0", textAlign: "center", fontWeight: 700, fontSize: 18, width: 240, color: "#1F1F1F" }}>Add to cart</div>
      </div>
    </ChromeWindow>
  );
};

// ------------------------------------------------------------------ step 4: Work mode asks, then fills the form
export const HeroWorkForm: React.FC<{ c: Cue }> = ({ c }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const ask = c("ask", 10);
  const perm = c("permission", 60);
  const allow = perm + 26;
  const fields: [string, string][] = [
    ["Full name", "Alex Morgan"],
    ["Work email", "alex@northwind.co"],
    ["Company", "Northwind Goods"],
    ["Role", "Head of Growth"],
  ];
  const fill0 = allow + 10;
  const per = 16;
  const fi = Math.max(-1, Math.min(fields.length - 1, Math.floor((frame - fill0) / per)));
  const done = frame >= fill0 + fields.length * per + 4;
  const agent = usePath([
    [fill0 - 6, 330, 130],
    ...fields.map((_, i) => [fill0 + i * per, 330, 150 + i * 98] as [number, number, number]),
    [fill0 + fields.length * per + 6, 210, 570],
  ]);
  const user = usePath([[perm, 760, 760], [perm + 18, 250, 470], [allow, 250, 470]]);
  const dlg = spring({ frame: frame - perm, fps: 30, config: { damping: 14, stiffness: 200 } });
  return (
    <div style={{ position: "relative" }}>
      <ChromeWindow tabs={["Register | SaaS Summit"]} active={0} url="events.saas-summit.com/register" height={820}
        side={
          <SideChat prompt="@Chrome register me for this event using my notes" at={ask} mode="Work">
            {frame >= allow ? (
              <div style={{ fontSize: 16, color: "#0D0D0D", lineHeight: 1.45, ...pop(allow, { scale: 1, rise: 8 }) }}>
                {done ? "✓ Form filled. Review it and press Register when you're ready." : `Filling: ${fields[Math.max(0, fi)][0]}…`}
              </div>
            ) : null}
          </SideChat>
        }
      >
        <div style={{ padding: "28px 30px", fontFamily: SYS }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#1F1F1F" }}>SaaS Summit 2026</div>
          <div style={{ fontSize: 17, color: "#5F6368", marginTop: 4 }}>Create your free attendee pass</div>
          {fields.map(([label, val], i) => {
            const t = frame >= fill0 + i * per ? typed(frame, val, fill0 + i * per, 2.4) : "";
            return (
              <div key={label} style={{ marginTop: 18 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#3C4043" }}>{label}</div>
                <div style={{ marginTop: 6, height: 52, borderRadius: 10, border: `2px solid ${fi === i && !done ? C.lime : "#DADCE0"}`, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 19, color: "#1F1F1F", background: t ? "#FBFFF5" : "white" }}>{t}</div>
              </div>
            );
          })}
          <div style={{ marginTop: 26, width: 200, textAlign: "center", borderRadius: 10, padding: "14px 0", fontWeight: 700, fontSize: 19, background: done ? "#1A73E8" : "#DADCE0", color: "white", boxShadow: done ? `0 0 0 4px ${C.lime}` : undefined }}>Register</div>
        </div>
      </ChromeWindow>
      {frame >= perm && frame < allow + 10 ? (
        <div style={{ position: "absolute", left: 60, top: 300, width: 470, background: "white", borderRadius: 18, padding: "22px 22px", boxShadow: "0 30px 70px rgba(0,0,0,0.5)", fontFamily: SYS, zIndex: 10, opacity: interpolate(frame, [allow + 2, allow + 10], [1, 0], clamp), scale: String(0.85 + 0.15 * dlg) }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <OpenAITile size={36} radius={0.3} />
            <div style={{ fontSize: 19, fontWeight: 700, color: "#0D0D0D", lineHeight: 1.3 }}>Allow ChatGPT to use events.saas-summit.com?</div>
          </div>
          {["Allow once", "Allow for this site", "Decline"].map((b, i) => (
            <div key={b} style={{ marginTop: i === 0 ? 18 : 8, borderRadius: 12, padding: "11px 14px", fontSize: 17, fontWeight: 700, textAlign: "center", background: i === 0 ? (frame >= allow - 2 ? C.lime : "#0D0D0D") : "#F0F0F0", color: i === 0 ? (frame >= allow - 2 ? C.charcoal : "white") : "#0D0D0D" }}>
              {b}
            </div>
          ))}
        </div>
      ) : null}
      {frame >= perm && frame < allow + 8 ? <Pointer x={user.x} y={user.y} press={Math.abs(frame - allow) < 4} /> : null}
      {frame >= fill0 - 6 ? <Pointer x={agent.x} y={agent.y} label="ChatGPT" /> : null}
    </div>
  );
};

// ------------------------------------------------------------------ step 5: stay safe
export const HeroSafe: React.FC<{ c: Cue }> = ({ c }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const close = c("close", 20);
  const once = c("once", 70);
  const tabs = ["Gmail", "Your Bank", "Payroll", "Event signup"];
  return (
    <div style={{ position: "relative" }}>
      <div style={{ background: "#DFE3E8", borderRadius: 22, padding: "16px 18px 22px", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", ...pop(0, { rise: 40, scale: 0.94 }) }}>
        <div style={{ display: "flex", gap: 8 }}>
          {tabs.map((t, i) => {
            const sens = i === 1 || i === 2;
            const gone = sens && frame >= close + 10 + (i - 1) * 8;
            const w = gone ? interpolate(frame, [close + 10 + (i - 1) * 8, close + 20 + (i - 1) * 8], [1, 0], clamp) : 1;
            return (
              <div key={t} style={{ flex: w, overflow: "hidden", opacity: w, height: 56, borderRadius: 12, background: i === 3 ? "white" : "#EEF0F2", display: "flex", alignItems: "center", gap: 10, padding: w > 0.2 ? "0 14px" : 0, fontFamily: SYS, fontSize: 19, color: "#3C4043", whiteSpace: "nowrap", boxShadow: sens && frame >= close ? "inset 0 0 0 3px #E5484D" : undefined }}>
                <span style={{ flex: 1, overflow: "hidden" }}>{t}</span>
                {sens ? <span style={{ color: "#E5484D", fontWeight: 800 }}>✕</span> : null}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 18 }}>
        {[
          { t: "Close banking and payroll tabs first", at: close },
          { t: "Choose \"Allow once\", not \"all sites\"", at: once },
          { t: "You press the final submit button", at: c("submit", 110) },
        ].map((r) => (
          <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 18, background: C.graphite, border: "2px solid #2C2C2C", borderRadius: 20, padding: "22px 26px", fontFamily: BODY, fontWeight: 700, fontSize: 32, color: C.cream, ...pop(r.at, { rise: 20, scale: 0.94 }) }}>
            <span style={{ width: 46, height: 46, borderRadius: "50%", background: C.lime, color: C.charcoal, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, flexShrink: 0 }}>✓</span>
            {r.t}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Hook motif: a Chrome tab strip where the ChatGPT agent cursor hops tab to tab, ticking each one. */
export const TabsFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const tabs = ["Compare prices", "Fill a form", "Send a message", "Group tabs"];
  const i = Math.min(tabs.length - 1, Math.floor(Math.max(0, frame - 14) / 14));
  // First pass ticks each tab; afterwards the cursor keeps sweeping so the hook never sits still.
  const first = 14 + 14 * (tabs.length - 1);
  const x = frame < first ? interpolate(frame, [14, first], [0, tabs.length - 1], { ...clamp, easing: EASE }) : (tabs.length - 1) * (0.5 + 0.5 * Math.cos((frame - first) / 14));
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1130, ...pop(10), translate: `0 ${Math.sin(frame / 18) * 8}px` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, justifyContent: "center", marginBottom: 22 }}>
        <Img src={staticFile(CHROME)} style={{ width: 70, height: 70 }} />
        <span style={{ fontFamily: MONO, fontSize: 30, color: C.stone }}>+</span>
        <OpenAITile size={70} radius={0.28} />
      </div>
      <div style={{ display: "flex", gap: 8, background: "#2A2A2A", borderRadius: 16, padding: 8 }}>
        {tabs.map((t, k) => (
          <div key={t} style={{ flex: 1, height: 56, borderRadius: 10, background: k <= i && frame >= 14 + k * 14 ? "#3A3A3A" : "#232323", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: BODY, fontWeight: 700, fontSize: 19, color: C.cream }}>
            {frame >= 20 + k * 14 ? <span style={{ color: C.lime }}>✓</span> : null}
            {t}
          </div>
        ))}
      </div>
      <Pointer x={80 + x * 225} y={60} label="ChatGPT" />
    </div>
  );
};

export const CHROME_HEROES: Record<string, React.FC<{ c: Cue }>> = {
  cws: HeroWebStore,
  computerUse: HeroComputerUse,
  chatTabs: HeroChatTabs,
  workForm: HeroWorkForm,
  safe: HeroSafe,
};
