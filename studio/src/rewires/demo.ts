import { RewiresProps } from "./Rewires";

/** Silent demo that exercises every scene type; used for Studio preview and component QA. */
export const REWIRES_DEMO: RewiresProps = {
  width: 1080,
  height: 1920,
  showCaptions: true,
  music: null,
  musicVolume: 0.13,
  outro: { dur: 90, sound: null },
  captions: [
    { text: "Every", startMs: 200, endMs: 450 },
    { text: "company", startMs: 450, endMs: 800 },
    { text: "is", startMs: 800, endMs: 900 },
    { text: "automating", startMs: 900, endMs: 1500, hl: true },
    { text: "the", startMs: 1500, endMs: 1600 },
    { text: "wrong", startMs: 1600, endMs: 1900 },
    { text: "part.", startMs: 1900, endMs: 2300 },
  ],
  scenes: [
    { type: "hook", dur: 75, vo: null, data: { kicker: "AI / Operations", lines: ["Automate", "the *volume.*", "Keep the trust."], sub: "A demo of the hook scene." } },
    { type: "stat", dur: 75, vo: null, source: "Source: demo value", data: { kicker: "Demo stat", value: 700, label: "full-time agents' worth of *work*", syncFrame: 30 } },
    {
      type: "compare",
      dur: 80,
      vo: null,
      transition: "wipe",
      data: { theme: "cream", kicker: "Resolution time", title: "Faster by *nine* minutes", rows: [{ label: "Before", value: 11, display: "11 min" }, { label: "After", value: 2, display: "2 min", win: true }] },
    },
    { type: "quote", dur: 80, vo: null, data: { quote: "A demo quote that reveals word by word on screen.", who: "Speaker Name", role: "Role, Company, 2025", highlight: ["word"] } },
    { type: "timeline", dur: 90, vo: null, data: { kicker: "Timeline", items: [{ date: "Feb 2024", text: "First event" }, { date: "May 2025", text: "Second *event*" }, { date: "Sep 2025", text: "Third event" }] } },
    { type: "route", dur: 80, vo: null, data: { theme: "cream", kicker: "The split", input: "Every customer *question*", a: { label: "AI", sub: "Routine, high volume" }, b: { label: "Human", sub: "Complex, emotional" }, accent: "b" } },
    { type: "takeaway", dur: 90, vo: null, data: { kicker: "The takeaway", points: ["Point one", "Point *two*"], final: "Closing line." } },
  ],
};
