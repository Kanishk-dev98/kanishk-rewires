---
name: feedback-ig-quality-brand-backgrounds
description: Reels looked poor on Instagram (low-bitrate masters); deliver high-bitrate masters with light grain. Backgrounds only brand charcoal #0A0A0A or cream #F6F4ED, never greyish
metadata:
  type: feedback
---

On 2026-10-19 the user said the last 2-3 posted reels looked "so poor" in quality on Instagram ("this will break our brand and rhythm"), and that a "greyish background" in some reels must go. Use the brand-kit cream or black.

**Why:** Our masters were encoded at 1-4 Mbps (CRF 16 on flat motion graphics). Instagram re-compresses them, which causes blocky dark gradients, banding and soft text. Grey backgrounds (#1A1A1A radial washes, graphite panels as full backgrounds) look off-brand.

**How to apply:**
- The delivery master is re-encoded at about 20 Mbps H.264 High, preset slow, yuv420p, bt709, with light temporal grain to stop banding (see the `delivery` block in config/production.config.json and `master()` in pipeline/rewires/render.py). Check the bitrate with ffprobe before posting.
- Full-frame backgrounds are only `C.charcoal` (#0A0A0A) or `C.cream` (#F6F4ED) from config/brand.config.json. No grey radial washes. Graphite (#1F1F1F) is only for small panels or cards, never the canvas.
- Avoid large smooth dark gradients; if a glow is needed, keep it subtle and let the grain cover it.
- Related: [[feedback-video-quality]], [[feedback-layman-clarity-one-by-one]].
