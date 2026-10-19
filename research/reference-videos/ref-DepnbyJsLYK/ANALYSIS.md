# Reference: @princegupta.ai, "Google just open sourced Harness²" (Instagram reel)

- **Source:** https://www.instagram.com/reel/DepnbyJsLYK/, posted 2026-10-18, about 1,058 likes when fetched.
- **Specs:** 37.5 s, 720x1280, 30 fps. The download is Instagram-compressed, so our 1080p, 20 Mbps masters beat it on resolution.
- **Shared by Alok** on 2026-10-19 as a quality benchmark: "very good graphic designing motion… made from an agent."
- **Usage:** study only. We take the techniques, never the footage, copy, logos or layout one-to-one.

## Why it works
- **Zero stock footage.** Every shot is a designed object: a logo, a UI card, a diagram, a terminal, a product screenshot or a chart.
- **One idea per shot.** One object sits centred under a headline, with lots of dark negative space. It feels expensive because it is calm.
- **The caption is the design.** No bottom subtitles. The spoken line builds word by word as a styled headline at the top, so text never appears twice.
- **Real product truth.** It shows the actual repo card, README diagram and project site, recreated or captured cleanly, so the claims feel real.
- **Rhythm.** A new visual beat every 1 to 1.5 s, locked to the voiceover words. Halfway through, a dark-to-light section switch resets attention ("But the crazy part…").

## Technique catalogue
| # | Technique | How it looks | Build notes (Remotion, our theme) |
|---|---|---|---|
| R1 | **Headline-as-caption** | The VO line types in word by word at about y=8% in mixed type: regular grey sans, the key word in bold white, the emphasis word in italic serif. The previous line blurs out as the next arrives. | Replace bottom captions with a top `KineticHeadline`. Per word: blur-in plus rise. The weight and serif accent come from `accents`. Single line, max ~6 words visible. |
| R2 | **Text-selection highlight** | The emphasis word gets a design-tool selection box: a pale blue fill, a 2px border and square corner handles, as if someone just selected it in Figma ("open sourced", "retraining", "same task", "11.5"). | An absolute box around the word span. Handles are 8px squares at the corners. Draw it in over 6 frames. Use lime instead of blue. |
| R3 | **Glowing brand-ring intro** | The brand logo sits inside a thin ring with a soft multi-colour glow and drifting particles, with a "NEW · JUST RELEASED" pill above and an "Open source · Apache 2.0" pill with a lock icon below. | A ring is an SVG circle with a blurred conic gradient behind it. Pills are mono caps. Logos come from the official assets. |
| R4 | **Hub-and-chips diagram** | A central node ("AI agent") with a progress ring. Satellite chips (System prompt, Memory, Tools, Skills…) pop in on the spoken words, each getting a green check. Dotted orbit lines. | Chips use a polar layout. Each chip pops on its cue word and gets a check 8 frames later. The centre ring stroke-dashoffset grows. |
| R5 | **Repo or product card header** | A GitHub-style card (owner/repo, description, tags) anchors the topic for the first seconds. | A dark card with a logo, mono repo path, description and a tag row. |
| R6 | **Before/after data panel** | A "Model weights" table of numbers, then a red strike-through ("Retrain model ✗"), then a green "unchanged ✓". It shows "without retraining" literally. | A numeric grid. A strike line scales from the left. Status chips swap. |
| R7 | **Real screenshot in a browser frame with a slow pan** | The README diagram or project site sits in a light browser window that slowly pans and zooms to the element being named. | `Browser` component plus an image or recreated UI. Animate translate and scale toward named regions on cues. |
| R8 | **Two-layer stack: browser plus run log** | The top card shows the concept step (Propose → Probe → Compose) while a terminal run-log card below adds ✓ lines in sync. Concept and proof together. | Two stacked panels; log lines appear on cues; the step box highlight moves. |
| R9 | **Terminal command typing** | A terminal pill types the real command (`harness2 --bench jb -k 1 --mode parallel`) with a blinking caret. | Mono typing at about 1.6 chars per frame; the pill expands to fit. |
| R10 | **In-card stat count-up** | The benchmark card's number counts +8.5 → +11.1 → +11.5 exactly on "by up to 11.5". | Count-up tied to the cue word, with ease-out and tabular numerals. |
| R11 | **Line chart drawing plus handwritten label** | The "score across tasks" line draws in, a dashed baseline appears, and a serif italic "better" lands on the curve. | SVG path with pathLength and dashoffset, a dashed comparison path and a serif label. |
| R12 | **Dark-to-light section switch** | At the turn ("But the crazy part"), a big light circle expands from the centre and the whole film flips to a cream scene for the second act. | A circular clip-path wipe from charcoal to cream. The second act's UI uses light cards. |
| R13 | **CTA as a UI journey** | A recreated Instagram profile card: the cursor clicks Follow → Following. The comments sheet opens and the keyword types into the input, then Post. A DM preview shows the creator's reply with a link card. | Reuse our comment sheet; add the profile card and a DM card; cursor with a click-ripple ring. |
| R14 | **Cursor with click ripple** | A small cursor glides to targets; a click shows an expanding ring. | Pointer plus a scaling, fading ring on the click frame. |
| R15 | **Restraint palette** | Near-black with a vignette; white and grey type; one accent (blue selection, green checks); light cards only in the second act. | Ours: charcoal and cream acts, lime selection and checks; a stone grey for secondary words. |

## Gaps it exposes in our reels
1. We burn bottom captions *and* add on-screen lines. They use one text system: the headline is the caption (R1, R2).
2. We crowd frames. They show one object at a time, centred, with breathing room.
3. We rarely show the real product or source. They anchor every claim with the actual repo, README or site (R5, R7).
4. Our CTAs are static. Theirs is a mini story: follow, comment, DM (R13).
5. No act structure. Their dark-to-light switch marks the twist (R12).

## Apply next
- Build `KineticHeadline` (R1 + R2) as an optional caption mode (`captionStyle.mode: "headline"`) and use it on the next reel.
- Build the hub-and-chips diagram (R4), the browser pan (R7), the two-layer stack (R8) and the CTA journey (R13) as reusable components.
