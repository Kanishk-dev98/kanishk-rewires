# Production report: Gemini 4 Argon: the Chat to Task switch

- Video: `renders/gemini-argon_v1.mp4`
- Captions: `captions/gemini-argon.srt`
- Script and storyboard: `script/script.md`, `storyboard/storyboard.json`
- Sources: `research/sources.md`
- Editable timeline: `timeline/props.json` (Remotion composition `Rewires`)

## Stages

- A. Intake: done · project folder and manifest created
- B. Research: done · 37 claims in the ledger
- C. Creative brief: done · brief present
- D. Script: done · 145 narration words (~56 s at a natural pace)
- E. Storyboard: done · 8 scenes valid, 1 warnings
- F. Asset production: done · 8 narration clips (0 reused from cache)
- G. Animation and edit: done · 8 scenes, body 53.7 s + outro 2.5 s, 144 caption words
- H. Render: done · gemini-argon_v1.mp4 (15.9 MB)
- I. Quality control: done · gemini-argon_v1.mp4 passed 14 checks
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
- music: `audio/music.wav` via pipeline/rewires/music.py (original, generated in code)
- music: `audio/signature.wav` via pipeline/rewires/music.py (original, generated in code)

## QC

- resolution: ok (1080x1920)
- frame rate: ok (30.00 fps)
- video codec: ok (h264)
- audio: ok (aac 48000 Hz)
- duration: ok (56.30 s (expected 56.20 s))
- duration target: ok (56.3 s vs target 30 to 60 s)
- decodes clean: ok (no decode errors)
- no black frames: ok (none)
- no freezes in the body: ok (none (outro hold is intentional))
- no silent gaps: ok (none)
- loudness: ok (-14.1 LUFS (target -14))
- true peak: ok (-1.5 dBTP)
- safe area: ok (nothing drawn within 60 px of the sides)
- brand ending: ok (lime px 26, cream px 484)

Scenes: 8. Still needs human review: overlapping elements, pacing and readability, visual taste and continuity, voice delivery.
