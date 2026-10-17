# Production report: How to edit your videos with Claude Code

- Video: `renders/claude-code-video-edit_v1.mp4`
- Captions: `captions/claude-code-video-edit.srt`
- Script and storyboard: `script/script.md`, `storyboard/storyboard.json`
- Sources: `research/sources.md`
- Editable timeline: `timeline/props.json` (Remotion composition `Rewires`)

## Stages

- A. Intake: done · project folder and manifest created
- B. Research: done · 3 claims in the ledger
- C. Creative brief: done · brief present
- D. Script: done · 141 narration words (~54 s at a natural pace)
- E. Storyboard: done · 11 scenes valid, 3 warnings
- F. Asset production: done · 11 narration clips (0 reused from cache)
- G. Animation and edit: done · 11 scenes, body 54.7 s + outro 2.5 s, 141 caption words
- H. Render: done · claude-code-video-edit_v1.mp4 (6.4 MB)
- I. Quality control: done · claude-code-video-edit_v1.mp4 passed 14 checks
- J. Delivery: pending · 

## Assets and provenance

- voiceover: `audio/vo/s00.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s01.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s02.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s03.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s04.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s05.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s06.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s07.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s08.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s09.mp3` via edge (Edge TTS output, personal use)
- voiceover: `audio/vo/s10.mp3` via edge (Edge TTS output, personal use)
- music: `audio/music.wav` via pipeline/rewires/music.py (original, generated in code)
- music: `audio/signature.wav` via pipeline/rewires/music.py (original, generated in code)

## QC

- resolution: ok (1080x1920)
- frame rate: ok (30.00 fps)
- video codec: ok (h264)
- audio: ok (aac 48000 Hz)
- duration: ok (57.20 s (expected 57.17 s))
- duration target: ok (57.2 s vs target 30 to 60 s)
- decodes clean: ok (no decode errors)
- no black frames: ok (none)
- no freezes in the body: ok (none (outro hold is intentional))
- no silent gaps: ok (none)
- loudness: ok (-14.7 LUFS (target -14))
- true peak: ok (-1.5 dBTP)
- safe area: ok (nothing drawn within 60 px of the sides)
- brand ending: ok (lime px 25, cream px 505)

Scenes: 11. Still needs human review: overlapping elements, pacing and readability, visual taste and continuity, voice delivery.
