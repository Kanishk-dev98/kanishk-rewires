---
name: voiceover-mix-standard
description: "Standing rule for every voiceover video: music and effects well under the voice, no words on hits, and mix_check.py must pass before delivery"
metadata:
  node_type: memory
  type: feedback
  originSessionId: f975e55a-053f-4e74-a741-55b4a4e21a24
  modified: 2026-10-19T13:04:08.253Z
---

In every video with a voiceover, the voice must stay clearly on top. Keep the voice at full level and turn the music and effects down. Start from these gains: music 0.12 under voice and 0.5 between lines; effects 0.2 under voice and 0.75 between lines. Never let a spoken word land on a boom, impact or logo slam: the hit goes first and the voice comes in about 20 or more frames later. A line spoken at a hero moment should also be on screen. Run `~/video-agent/pipeline/mix_check.py <Composition> <props.json>` before every delivery. It needs the voice at least 10 dB over the bed for every line. Full spec: `~/video-agent/pipeline/MIX_STANDARD.md`.

**Why:** Team feedback on Abstraxn KYI v7 (2026-10-19) said "sometimes background music volume takes over the voiceover" and "0:39 - 0:43 not clear". Measured, the voice sat only 0 to 3 dB above the music, and the Know Your Intent line was 8 dB *under* a boom. Alok said: "make sure we are not going to repeat these kind of things again… taken care from our next videos."

**How to apply:** this applies to every new film (the Option 2 brand film, Kanishk.Rewires-style reels, anything with narration), not just KYI. Fix failures by lowering the bed or moving the line off the hit, never by boosting the voice. Related: [[abstraxn-film-edits-pending]], [[motion-reference-harness2]].
