---
name: feedback-real-ui-not-generic
description: When a video is about a real product (Google, Meta...), show it as it really looks; real colours, fonts, layouts and real source pages, never generic AI-made cards; motion must feel mature
metadata:
  type: feedback
---

On 2026-11-05 the user rejected v2 of the Google review-summaries reel: the ad card, "dashboard" and review cards looked AI-generated and generic, the real Google logo colours were missing, the fonts did not look nice, and the motion and placement were "very basic and odd".

**Why:** viewers must instantly recognise the real product; invented UI in our brand palette reads as fake and immature.

**How to apply:**
- Recreate the real surface faithfully from a reference screenshot: the real layout, the product's own font (Google Sans / Roboto via @remotion/google-fonts) and its own UI colours. The brand palette is for the stage and our annotations only.
- Official full-colour logos and wordmarks (Wikimedia), recorded in PROVENANCE.json.
- Show the real primary source when possible: screenshot the public page with Playwright (see `studio/public/media/review-ads/`), highlight the exact sentence on cue.
- Illustrative businesses and reviews are fine, but they must look like the real product's UI, and the post caption says they are illustrative. Never use real people's reviews.
- Motion: keyed 3D tracks with a soft overshoot settle, depth blur on what is not the subject, slow drift on holds, push in to make text readable (UI body >= 28 px on screen), move secondary objects fully out of frame instead of leaving faded ghosts behind the subject.
- Reference build: `studio/src/rewires/reviewAds.tsx` (v3).
