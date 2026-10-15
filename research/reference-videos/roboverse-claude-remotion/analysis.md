# Reference video: "Claude Code Can Now Automate Your Videos (Remotion + Opus 5.5)"

- **URL:** https://youtu.be/6_rCyryA6hg
- **Channel:** Roboverse · **Length:** 9:53 · **Views:** ~72.6K · **Uploaded:** 2026-10-01
- **Local copy analysed:** `~/Downloads/Claude-Code-Can-SnapYT.App.mp4` (640×360)
- **Files here:** `transcript.txt` (auto-captions with timestamps), `frames/sheet1-7.jpg` (contact sheets, 1 frame / 2 s, one per demo segment)

## What he does

1. **Setup:** Claude desktop app → Code tab → local, empty folder → Opus 5.5, auto mode. Installs Node.js (must restart before Remotion install, or it fails to find Node).
2. **One setup prompt:** Claude Code creates a Remotion project, installs the 12 official Remotion agent skills, starts Remotion Studio (live browser preview).
3. **Prompts like an editor brief:** purpose of the video, exact text, what happens second by second.
4. **Iterates by feedback:** "make a copy and only change the copy" so the original survives; names what to keep ("keep the glow on the ChatGPT bar").
5. **One prompt renders everything** to numbered MP4s in `renders/`.

## The five demos (see frames/)

| Sheet | Demo | Visual treatment | Why it works |
|---|---|---|---|
| 1–2 | Podcast lower third | Name card, then refined version with background person removed | Iteration by feedback |
| 3–4 | Bar chart "How long it took to reach 100 million users" | Dark bg, grey bars slide in (Netflix 18 yrs → TikTok 9 mo), ChatGPT 2 months glows green, camera zooms in; v2 colours bars per brand, fades to grey before ChatGPT | Data builds tension, reveal pays it off |
| 5 | 30 s app ad "Clipwise" | Light bg, pain headline "Editing short clips takes **hours.**" (last word red), 3D phone mockup, feature callouts draw in, end card "Out now." | Problem → product → 3 features → CTA |
| 6 | "How AI works" explainer | Navy documentary look: prompt typed → tokens → arc across dotted world map → data-centre racks predicting next token | One subtitle sentence per scene |
| 7 | 60 s cinematic intro | Claude Code terminal, flying code in 3D space, easing curves, montage of earlier clips | Premium depth-of-field tech look |

## Takeaways adopted in our engine

- Pure code-generated motion graphics, zero render cost. No camera footage, no AI video models needed.
- Premium feel comes from: slow eased motion, dark/gradient depth, glow on the one key element, one idea per scene.
- **What we added that he lacks:** 9:16 vertical, voiceover synced to scenes, word-level captions, hook in the first 1.5 s, SFX design, automatic posting.
- His feedback loop ("copy, change one thing") is how templates are refined with the user before automation.

## Licence note

Remotion is free for individuals and companies with ≤3 employees (and for evaluation). Larger companies need a paid Company License (remotion.pro/license). The channel is the user's **personal** account, so the free licence applies.
