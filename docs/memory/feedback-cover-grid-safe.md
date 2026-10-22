---
name: feedback-cover-grid-safe
description: Reel covers must be 9:16 and designed for Instagram's 3:4 profile-grid crop (centre 1080x1440); never a 16:9 cover, even for a 16:9 video
metadata:
  type: feedback
---

On 2026-10-17 the user sent a screenshot of the profile grid where the Outship post's 16:9 cover was cropped ("...ngineering? ...ust vibe coding?") and said: "take care from next time". They had asked for a 16:9 thumbnail; that was the request, but the grid crops it.

**Why:** The Instagram profile grid shows only the centre 3:4 of every Reel cover (1080x1440 of 1080x1920, so y 240 to 1680). Anything outside that is cut in the grid, which is what profile visitors see first.

**How to apply:**
- Always make covers **9:16 (1080x1920, rendered at 2x)** with every word, logo and the subject inside y 240 to 1680. Use the `Thumb916` composition in `studio/src/rewires/promo.tsx` or the same layout rules.
- Before posting, preview the grid crop (crop 1080x1440 at y 240) and look at it.
- If the user asks for a 16:9 or other-format cover for an Instagram Reel, explain the grid crop and offer a 9:16 grid-safe cover instead (a 16:9 one can still be made for YouTube).
- Brand look on covers: charcoal background, lime accent, Space Grotesk headline with an Instrument Serif italic lime accent word, small kanishk.rewires mark.
- **No photos on covers** (2026-10-17, boiling frog reel): the user rejected a frog-photo cover and asked for one that "matches our grid styling", in HD 4K. Every cover uses the same photo-free Thumb916 grammar so the grid stays consistent: a lime mono kicker, a 3-line headline with a lime serif italic accent, one topic graphic in a graphite pill (for example `ThumbHeat`'s heat bar in `heat.tsx`), lime pixel blocks, and the wordmark. Render at `--scale=2`.
