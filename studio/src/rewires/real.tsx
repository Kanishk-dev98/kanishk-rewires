// Realistic product interfaces (recreated, illustrative data) in each product's real colours,
// framed for the Kanishk.Rewires tutorial grammar. Every element is cued to the narration.
import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BODY, C, clamp, EASE, EASE_IO, MONO, SERIF } from "./brand";
import { usePop } from "./tut";

export const LI_BLUE = "#0A66C2";
export const HS_ORANGE = "#FF7A59";
export const SYS = `-apple-system, "Segoe UI", ${BODY}`;

type Cue = (name: string, fb: number) => number;
const photo = (n: number) => staticFile(`media/li2/person${((n - 1) % 6) + 1}.jpg`);

/** Browser window with a URL bar. */
export const Browser: React.FC<{ url: string; children: React.ReactNode; at: number; height: number; tint?: string }> = ({ url, children, at, height, tint = "#F3F2EF" }) => {
  const pop = usePop();
  return (
    <div style={{ height, borderRadius: 24, overflow: "hidden", background: "white", boxShadow: "0 36px 80px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", ...pop(at, { rise: 50, scale: 0.94 }) }}>
      <div style={{ height: 50, background: "#E9E7E1", display: "flex", alignItems: "center", gap: 9, padding: "0 18px", flexShrink: 0 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ marginLeft: 16, flex: 1, height: 30, borderRadius: 9, background: "white", display: "flex", alignItems: "center", padding: "0 14px", fontFamily: SYS, fontSize: 17, color: "#5A5A55" }}>🔒 {url}</div>
      </div>
      <div style={{ flex: 1, background: tint, position: "relative", overflow: "hidden" }}>{children}</div>
    </div>
  );
};

const Avatar: React.FC<{ n: number; size: number; ring?: string }> = ({ n, size, ring }) => (
  <Img src={photo(n)} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, boxShadow: ring ? `0 0 0 3px ${ring}` : undefined }} />
);

// ------------------------------------------------------------- Apollo-style people search
export type Lead = { n: number; name: string; title: string; company: string; loc: string; score?: number; signal?: string };
export const ApolloSearch: React.FC<{ leads: Lead[]; c: Cue; accent: string; logo: string }> = ({ leads, c, accent, logo }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const found = c("found", 60);
  const total = Math.round(interpolate(frame, [found - 4, found + 22], [0, 50], { ...clamp, easing: EASE }));
  return (
    <Browser url="app.apollo.io/#/people" at={0} height={560} tint="white">
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px", borderBottom: "1px solid #ECEBE6" }}>
        <Img src={staticFile(logo)} style={{ height: 30 }} />
        <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 22, color: "#1A1A1A" }}>People</div>
        <div style={{ marginLeft: "auto", fontFamily: SYS, fontWeight: 700, fontSize: 19, background: accent, color: "#1A1A1A", borderRadius: 8, padding: "6px 14px" }}>{total} results</div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "12px 22px", flexWrap: "wrap" }}>
        {["Head of Growth, CMO", "Consumer goods", "11 to 200 employees", "US, UK"].map((f, i) => (
          <span key={f} style={{ fontFamily: SYS, fontSize: 17, fontWeight: 600, color: "#333", background: "#F4F3EF", border: "1px solid #E4E2DB", borderRadius: 8, padding: "5px 11px", ...pop(c("filters", 20) + i * 3, { scale: 0.7, rise: 8 }) }}>
            {f}
          </span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.1fr 0.8fr", padding: "6px 22px", fontFamily: SYS, fontSize: 15, fontWeight: 700, color: "#8B8A85", letterSpacing: 0.4, textTransform: "uppercase", borderBottom: "1px solid #ECEBE6" }}>
        <span>Name</span>
        <span>Company</span>
        <span>Location</span>
      </div>
      {leads.slice(0, 5).map((l, i) => (
        <div key={l.name} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.1fr 0.8fr", alignItems: "center", padding: "10px 22px", borderBottom: "1px solid #F1F0EC", fontFamily: SYS, ...pop(found + i * 4, { rise: 14, scale: 1 }) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${frame > found + 40 ? accent : "#CFCDC6"}`, background: frame > found + 40 + i * 2 ? accent : "white" }} />
            <Avatar n={l.n} size={44} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 19, color: "#1A1A1A" }}>{l.name}</div>
              <div style={{ fontSize: 15, color: "#77756F" }}>{l.title}</div>
            </div>
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#3C3B37" }}>{l.company}</div>
          <div style={{ fontSize: 16, color: "#77756F" }}>{l.loc}</div>
        </div>
      ))}
    </Browser>
  );
};

// ------------------------------------------------------------- lead scoring card
export const ScoreCard: React.FC<{ leads: Lead[]; c: Cue }> = ({ leads, c }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const sAt = c("scores", 20);
  const rAt = c("reason", 60);
  const top = leads[0];
  const ring = interpolate(frame, [sAt, sAt + 20], [0, (top.score ?? 90) / 100], { ...clamp, easing: EASE_IO });
  return (
    <div style={{ display: "flex", gap: 18, height: 560 }}>
      <div style={{ flex: 1.15, background: C.cream, borderRadius: 26, padding: 26, boxShadow: "0 30px 70px rgba(0,0,0,0.55)", ...pop(0, { rise: 40, scale: 0.94 }) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Avatar n={top.n} size={96} ring={C.lime} />
          <div>
            <div style={{ fontFamily: SYS, fontWeight: 800, fontSize: 30, color: C.charcoal }}>{top.name}</div>
            <div style={{ fontFamily: SYS, fontSize: 19, color: "#5B5A54" }}>
              {top.title} · {top.company}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 26 }}>
          <svg width={150} height={150}>
            <circle cx={75} cy={75} r={62} stroke="#E2DED2" strokeWidth={14} fill="none" />
            <circle cx={75} cy={75} r={62} stroke={C.charcoal} strokeWidth={14} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 75 75)" strokeLinecap="round" />
            <text x={75} y={88} textAnchor="middle" style={{ fontFamily: SERIF, fontSize: 56 }} fill={C.charcoal}>
              {Math.round(ring * 100)}
            </text>
          </svg>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 17, letterSpacing: 2, color: "#77756D" }}>ICP FIT</div>
            {["Role match", "Size match", "Region match"].map((t, i) => (
              <div key={t} style={{ fontFamily: SYS, fontWeight: 600, fontSize: 21, color: C.charcoal, marginTop: 6, ...pop(sAt + 6 + i * 4, { rise: 8, scale: 1 }) }}>
                ✓ {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 22, borderRadius: 16, background: C.charcoal, padding: "16px 18px", ...pop(rAt, { rise: 20, scale: 0.9 }) }}>
          <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 2, color: C.lime }}>REASON TO REACH OUT</div>
          <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 23, color: C.cream, marginTop: 6 }}>{top.signal}</div>
          <div style={{ fontFamily: SYS, fontSize: 15, color: C.grey, marginTop: 4 }}>Source: company news</div>
        </div>
      </div>
      <div style={{ flex: 0.85, display: "flex", flexDirection: "column", gap: 12 }}>
        {leads.slice(1, 5).map((l, i) => (
          <div key={l.name} style={{ background: "#1B1B1B", border: "1.5px solid #2C2C2C", borderRadius: 18, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, ...pop(sAt + 4 + i * 4, { rise: 20 }) }}>
            <Avatar n={l.n} size={50} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 19, color: C.cream, whiteSpace: "nowrap" }}>{l.name}</div>
              <div style={{ fontFamily: SYS, fontSize: 15, color: C.grey, whiteSpace: "nowrap" }}>{l.company}</div>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 40, color: (l.score ?? 0) >= 80 ? C.lime : C.stone }}>{Math.round((l.score ?? 0) * interpolate(frame, [sAt + 4 + i * 4, sAt + 22 + i * 4], [0, 1], clamp))}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------- LinkedIn invitation note
export const LinkedInInvite: React.FC<{ lead: Lead; note: string; c: Cue; logo: string; limit: number }> = ({ lead, note, c, logo, limit }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const tAt = c("drafts", 20);
  const n = Math.max(0, Math.min(note.length, Math.floor((frame - tAt) * 3)));
  const sent = frame >= c("send", 100);
  const press = sent ? interpolate(frame - c("send", 100), [0, 3, 8], [1, 0.9, 1], clamp) : 1;
  return (
    <Browser url={`linkedin.com/in/${lead.name.toLowerCase().replace(/ /g, "-")}`} at={0} height={560}>
      <div style={{ height: 64, background: "white", display: "flex", alignItems: "center", gap: 14, padding: "0 24px", borderBottom: "1px solid #E0DFDC" }}>
        <Img src={staticFile(logo)} style={{ width: 38, height: 38 }} />
        <div style={{ height: 34, flex: 1, borderRadius: 6, background: "#EDF3F8", fontFamily: SYS, fontSize: 17, color: "#666", display: "flex", alignItems: "center", padding: "0 12px" }}>Search</div>
      </div>
      <div style={{ position: "absolute", inset: "64px 0 0 0", background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 100, background: "white", borderRadius: 14, boxShadow: "0 20px 50px rgba(0,0,0,0.35)", fontFamily: SYS, ...pop(4, { rise: 30, scale: 0.95 }) }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E8E8E8", display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar n={lead.n} size={52} />
          <div style={{ fontWeight: 700, fontSize: 23, color: "#191919" }}>Add a note to your invitation?</div>
        </div>
        <div style={{ padding: "16px 24px" }}>
          <div style={{ fontSize: 17, color: "#666", marginBottom: 8 }}>Personalize your invitation to {lead.name.split(" ")[0]}</div>
          <div style={{ border: `2px solid ${frame >= tAt ? LI_BLUE : "#8C8C8C"}`, borderRadius: 8, padding: "12px 14px", minHeight: 150, fontSize: 21, lineHeight: 1.4, color: "#191919" }}>
            {note.slice(0, n)}
            {n < note.length && frame >= tAt ? <span style={{ color: LI_BLUE }}>▍</span> : null}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 16, color: "#666" }}>
            <span style={{ color: frame >= tAt ? C.charcoal : "#666", fontWeight: 700, background: frame >= tAt ? C.lime : "transparent", borderRadius: 6, padding: "2px 8px", ...pop(tAt, { scale: 0.7, rise: 4 }) }}>✦ Drafted by Claude</span>
            <span>
              {n}/{limit}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "12px 24px 18px", borderTop: "1px solid #E8E8E8" }}>
          <span style={{ fontWeight: 700, fontSize: 19, color: LI_BLUE, border: `2px solid ${LI_BLUE}`, borderRadius: 999, padding: "8px 20px", opacity: frame >= c("review", 70) ? 1 : 0.5 }}>Edit</span>
          <span style={{ fontWeight: 700, fontSize: 19, color: "white", background: sent ? "#004182" : LI_BLUE, borderRadius: 999, padding: "8px 26px", scale: String(press) }}>{sent ? "Sent ✓" : "Send"}</span>
        </div>
      </div>
    </Browser>
  );
};

// ------------------------------------------------------------- HubSpot board
export const HubSpotBoard: React.FC<{ leads: Lead[]; c: Cue; logo: string }> = ({ leads, c, logo }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const land = c("lands", 20);
  const task = c("task", 60);
  const cols = ["New lead", "Contacted", "Follow up"];
  return (
    <Browser url="app.hubspot.com/contacts/board" at={0} height={560} tint="#F5F8FA">
      <div style={{ height: 58, background: "#2D3E50", display: "flex", alignItems: "center", gap: 12, padding: "0 22px" }}>
        <Img src={staticFile(logo)} style={{ width: 30, height: 30 }} />
        <span style={{ fontFamily: SYS, fontWeight: 700, fontSize: 20, color: "white" }}>Lead pipeline</span>
        <span style={{ marginLeft: "auto", fontFamily: SYS, fontWeight: 700, fontSize: 16, color: "white", background: HS_ORANGE, borderRadius: 6, padding: "5px 12px" }}>+ {Math.round(interpolate(frame, [land, land + 24], [0, 50], clamp))} contacts</span>
      </div>
      <div style={{ display: "flex", gap: 14, padding: 16, height: 470 }}>
        {cols.map((col, ci) => (
          <div key={col} style={{ flex: 1, background: "#EAF0F6", borderRadius: 10, padding: 10 }}>
            <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 15, color: "#33475B", letterSpacing: 0.5, textTransform: "uppercase", padding: "4px 4px 10px" }}>{col}</div>
            {(ci === 0 ? leads.slice(0, 3) : ci === 1 ? leads.slice(3, 4) : []).map((l, i) => (
              <div key={l.name} style={{ background: "white", borderRadius: 8, padding: 10, marginBottom: 10, boxShadow: "0 2px 6px rgba(45,62,80,0.12)", borderLeft: `4px solid ${HS_ORANGE}`, ...pop(land + i * 5 + ci * 10, { rise: 30 }) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar n={l.n} size={34} />
                  <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 16, color: "#33475B", whiteSpace: "nowrap" }}>{l.name}</div>
                </div>
                <div style={{ fontFamily: SYS, fontSize: 13, color: "#516F90", marginTop: 4 }}>{l.company}</div>
                {i === 0 && ci === 0 ? (
                  <div style={{ marginTop: 8, fontFamily: SYS, fontWeight: 700, fontSize: 13, color: "#33475B", background: "#FFF1EE", border: `1px solid ${HS_ORANGE}`, borderRadius: 6, padding: "4px 7px", ...pop(task, { scale: 0.6, rise: 6 }) }}>📅 Task: follow up in 3 days</div>
                ) : null}
              </div>
            ))}
            {ci === 2 ? (
              <div style={{ background: "white", borderRadius: 8, padding: 10, boxShadow: "0 2px 6px rgba(45,62,80,0.12)", borderLeft: `4px solid ${HS_ORANGE}`, ...pop(task + 10, { rise: 30 }) }}>
                <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 14, color: "#33475B" }}>📅 3 follow ups due</div>
                <div style={{ fontFamily: SYS, fontSize: 13, color: "#516F90", marginTop: 4 }}>Thursday, 10:00</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Browser>
  );
};

// ------------------------------------------------------------- LinkedIn post + Publora week
export const PostAndSchedule: React.FC<{ c: Cue; liLogo: string; post: string; days: string[] }> = ({ c, liLogo, post, days }) => {
  const frame = useCurrentFrame();
  const pop = usePop();
  const wAt = c("posts", 10);
  const sAt = c("schedules", 60);
  const n = Math.max(0, Math.min(post.length, Math.floor((frame - wAt) * 2.4)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "white", borderRadius: 18, padding: "18px 22px", boxShadow: "0 30px 70px rgba(0,0,0,0.55)", fontFamily: SYS, ...pop(0, { rise: 40, scale: 0.95 }) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Img src={staticFile("brand/rewires/kr-monogram.png")} style={{ width: 54, height: 54 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#191919" }}>Your Name</div>
            <div style={{ fontSize: 15, color: "#666" }}>Retention for D2C brands · {frame >= sAt ? "Scheduled" : "Draft"}</div>
          </div>
          <Img src={staticFile(liLogo)} style={{ width: 30, height: 30, marginLeft: "auto" }} />
        </div>
        <div style={{ fontSize: 20, lineHeight: 1.45, color: "#191919", marginTop: 12, minHeight: 116, whiteSpace: "pre-wrap" }}>
          {post.slice(0, n)}
          {n < post.length && frame >= wAt ? <span style={{ color: LI_BLUE }}>▍</span> : null}
        </div>
        <div style={{ display: "flex", gap: 30, borderTop: "1px solid #EAEAEA", paddingTop: 10, fontSize: 16, fontWeight: 600, color: "#666" }}>
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>🔁 Repost</span>
        </div>
      </div>
      <div style={{ background: C.cream, borderRadius: 18, padding: "14px 18px", boxShadow: "0 30px 70px rgba(0,0,0,0.55)", ...pop(sAt - 6, { rise: 30, scale: 0.95 }) }}>
        <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 2, color: "#77756D" }}>PUBLORA · THIS WEEK</div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {days.map((d, i) => (
            <div key={d} style={{ flex: 1, background: "white", borderRadius: 10, padding: "8px 6px", textAlign: "center", border: "1.5px solid #E2DED2" }}>
              <div style={{ fontFamily: SYS, fontWeight: 700, fontSize: 16, color: "#55534C" }}>{d}</div>
              <div style={{ marginTop: 6, background: LI_BLUE, color: "white", borderRadius: 6, fontFamily: SYS, fontWeight: 700, fontSize: 14, padding: "4px 0", ...pop(sAt + i * 4, { scale: 0.5, rise: 6 }) }}>9:00</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const _r = { EASE };
