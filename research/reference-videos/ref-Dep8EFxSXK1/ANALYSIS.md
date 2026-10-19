# Reference: Scalorrr launch teaser ("One line. Endless possibilities.")

- **Source:** https://www.instagram.com/reel/Dep8EFxSXK1/ (@scalorrr, Dhruv Sharma), posted 2026-10-19.
- **Specs:** 33 s, 720x1280, 30 fps.
- **Shared by Alok** on 2026-10-20 to reverse-engineer for a Kanishk.Rewires AI-agents reel.
- **Usage:** techniques only. No footage, copy, logo, palette or layout reused one-to-one.

## The core idea: one continuous thread of light
The whole film is a single glowing point and line that never cuts. It draws, morphs and travels from shape to shape, so each step of the story is *the same object becoming the next thing*. That is why it feels premium and agent-like: you watch one process flow.

## Beat map
| t | Beat | What happens |
|---|---|---|
| 0–2 s | Spark | A point of light draws a thin line upward; a small label types "Type one line" |
| 2–4 s | Input | The line pierces glowing elliptical discs, like a cursor dropping into a field; warm volumetric glow |
| 4–5 s | Flash | A full-width warm gradient wipe |
| 5–8 s | Listening | The line closes into a ring with orbiting nodes and colour-shifting segments around the label ("X listens"); the ring rotates and tilts to a rounded square |
| 8–10 s | Thinking | The ring collapses to the brand glyph (an arrow) as a tiny comet; a label says "Finding the angle" |
| 10–12 s | Output 1 | The glyph stretches into a pill, then a glossy gradient card ("Brief · Ready in seconds") |
| 12–17 s | Agents | The card shatters to points; dots line up in a row ("Agents line up the work"), each lights a different colour, then dots rise into bars of increasing height (a progress or pipeline metaphor) |
| 17–18 s | Act switch | One bar becomes a glowing orb that floods the screen into cream |
| 18–25 s | Steps on cream | A thin black line strings pill chips like beads: "Write the script" → "Generate visuals" (the chip flips to orange when active) → "Add the voice". Chips swing on the thread like a pendulum and are handed off by the line |
| 25–28 s | Result | Back to black: the line draws an outlined pill that fills in as "Published" |
| 28–33 s | Outro | Warm and pink bokeh orbs swirl around "Your studio, in motion", then condense into the logo badge with "Launching 20 Nov" |

## Techniques to borrow
| # | Technique | Build notes (Remotion, our theme) |
|---|---|---|
| T1 | **The single continuous thread** | A point with a trailing SVG path whose `d` is interpolated between shape keyframes (line → ellipse → ring → pill). Use flubber-style point resampling or our own resampler so every shape shares N points; this gives continuous morphs with no cuts. |
| T2 | **Glow light, not flat lines** | A 2–3px stroke plus a blurred duplicate (filter blur 8–20px) plus a bright head dot with a halo. Lime and cream in our theme, never orange. |
| T3 | **Volumetric discs and orbs** | Radial-gradient ellipses with blur and an additive feel; scale and opacity driven by the thread passing through. |
| T4 | **Ring with orbiting nodes** | A circle path plus 4–6 node dots on it, rotating, with segment colour sweeps (conic gradient mask). Tilt via rotateX/rotateY. |
| T5 | **Shape to UI morph** | The thread's final shape becomes a real UI element (pill → glossy card) with a gradient fill and a soft inner highlight. |
| T6 | **Dots to bars pipeline** | A row of dots (agents) light one by one, then rise into bars; perfect for "agents line up the work". |
| T7 | **Beaded chips on a string** | Cream act: a black hairline threads pill chips; the active chip flips to the accent colour; chips swing with a slight pendulum spring. |
| T8 | **Orb flood act-switch** | A glowing orb scales to fill the frame into cream. Compare the circle wipe in ref-DepnbyJsLYK. |
| T9 | **Minimal type** | Tiny, quiet labels (about 28 px, light weight) under the motion. The motion is the hero; text only names the stage. (Our version: the label mirrors captions sparingly, never duplicates.) |
| T10 | **Bokeh orb outro** | Soft blurred orbs swirl and condense into the badge. |

## Notes
- No stock footage and no product screenshots: pure motion design. It feels "agentic" because one thing flows through every step.
- Weaknesses to beat: 720p output, labels too small for phones, warm palette that's generic in the "AI orange" trend, and no voiceover clarity. We add a plain-English voiceover, 1080p and 20 Mbps, our lime-on-charcoal and cream identity, and readable labels.
