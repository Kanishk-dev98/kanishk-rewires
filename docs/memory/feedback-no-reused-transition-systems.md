---
name: feedback-no-reused-transition-systems
description: "Never reuse the previous reel's transition/camera system (e.g. the Duet lime-thread whip-zoom world); each reel must apply a distinct, studied technique set and look mature, not AI-ish"
metadata:
  node_type: memory
  type: feedback
  originSessionId: c88b0989-e0e3-4807-9708-1ed73bba7e2b
  modified: 2026-10-22T19:04:18.998Z
---

On 2026-10-23 the user rejected the PHP2Shell reel v1 because it reused the same scene-to-scene transition as the Claude Duet reel (a lime thread line plus a camera whip-zoom across one canvas). Their words: "what's the point of feeding you so many different video skills". They also said the motion graphics looked immature and AI-ish.

**Why:** they invested in a 37-reel benchmark study (rewires-channel-playbook) so every reel applies new, studied techniques. Reusing my own engine makes the channel look templated. The immature look came from:
- small generic white cards floating in empty space
- self-drawn clip-art icons and sticker labels
- the same rise+blur entrance on every element
- decorative drifting specks
- no real information density

**How to apply:**
- Before building, pick the reel's transition grammar and hero techniques from the playbook (motion-library rows 26–80). Make sure they differ from the last 2–3 reels; record the choice in the storyboard brief.
- Reusable infrastructure (world.tsx) is fine to keep, but its signature look (thread + whip-zoom + specks) must not be the default.
- Maturity checklist:
  - one large hero object per act that transforms (shared-element morphs)
  - faithful, information-dense recreated UI (real code, real advisory layouts, real-looking pages)
  - editorial type
  - varied, purposeful entrances
  - no decorative particles
  - no clip-art icons or stickers
- Show styleframes before the full render when changing visual direction.

Related: [[feedback-mature-visuals-no-ai-tells]], [[reference-benchmark-channel-study]], [[feedback-daily-quality-upgrade]]
