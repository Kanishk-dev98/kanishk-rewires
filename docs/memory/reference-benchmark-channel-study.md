---
name: reference-benchmark-channel-study
description: Kanishk.Rewires benchmark channel study (princegupta.ai 16 + madetoscale2026 11 + jackroberts___ 10 reels, all done) → rewires-channel-playbook skill; load it before any script
metadata:
  node_type: memory
  type: reference
  originSessionId: c88b0989-e0e3-4807-9708-1ed73bba7e2b
  modified: 2026-10-22T17:40:12.560Z
---

On 2026-10-22 the user asked for a deep study of 3 benchmark channels that make "our type" of reel. They want the content strategy, script style, audio, captions and motion saved, and the playbook applied going forward.

- **Playbook:** `~/kanishk-rewires/.claude/skills/rewires-channel-playbook/SKILL.md`. It covers strategy, hook templates, script skeleton, captions, motion grammar, audio, the post-caption formula and a pre-flight checklist. Load it before writing any script.
- **Evidence:** `research/reference-videos/{prince,madetoscale,jackroberts}/ANALYSIS.md`, plus per-reel folders. Motion techniques are rows 36–80. Playbook §11 is the three-channel synthesis. Made to Scale (Hinglish, comments-only signal) is closest to our cream look: chapter chrome, money/time pillars, an oversized DM payload, and share-to-friend.
- **Tool:** `tools/breakdown_reels.py <channel> <mp4s>` (sheets, hook sheet, cuts, word transcript, levels).
- **Key law from the data:** identical production, about 130× spread in results. The hook, topic and comment-keyword CTA drive reach. Motion is table stakes.
- **Getting reels:** Instagram blocks profile listing. Even yt-dlp and gallery-dl with the Chrome session fail (redirect/401), and exporting cookies to a file was blocked by the safety classifier. Ask the user for reel links; single reel URLs download fine with yt-dlp, no login.
- **Parked:** Jack Roberts's half-presenter, half-animation format is specced in playbook §10. Don't use it until the user says to start it.
- **Unknown:** the "65 20 15" content-mix rule is still not recorded. Ask; never guess.

Related: [[reference-princegupta-benchmark]], [[feedback-audio-voice-first]], [[feedback-mature-visuals-no-ai-tells]], [[video-agent-project]]
