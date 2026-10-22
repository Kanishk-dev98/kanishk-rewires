---
name: feedback-delete-superseded-versions
description: Once a reel version or cover is approved/final, delete all earlier versions (videos and covers) from projects/*/renders and ~/Downloads/Kanishk.Rewires to save storage
metadata:
  type: feedback
---

On 2026-10-19 the user gave a strict instruction: when a version is approved (e.g. Flipkart v5, decoy v4), delete the previous versions (v1, v2…) right away, along with superseded thumbnails and covers, or storage fills up fast. Apply it from now on.

**Why:** Each render is 120-150 MB at the 20 Mbps master, and keeping v1 to v5 of every reel wastes gigabytes.

**How to apply:**
- As soon as the user approves a version, or it is posted, remove every older `<slug>_vN.mp4` from both `projects/<slug>/renders/` and `~/Downloads/Kanishk.Rewires/<slug>/`, plus any superseded cover or thumbnail files. Keep only the final video and final cover.
- List what will be deleted and what is kept, then delete. Report what was freed.
- Never delete the final version, source footage, storyboards or research.
- Related: [[feedback-delivery-workflow]].
