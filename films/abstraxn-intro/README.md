# Abstraxn: introduction film

Institutional brand film for [Abstraxn](https://abstraxn.com), made by Alok Diwan for a personal portfolio. Approver: Ankit.

- **Output:** `abstraxn-intro_1080p.mp4` (5:39, 1920×1080, 30 fps, H.264, AAC 48 kHz, −14.1 LUFS) and `abstraxn-intro.en.srt` (upload as YouTube captions)
- **Script:** `script.json` (10 chapters, 543 words, every claim from abstraxn.com; chapter 6 "One payment, end to end" is labelled on screen as an illustrative example)
- **Brand:** `brand/` holds the official logo SVGs and icon from abstraxn.com/brand-kit. Colours #72E3AD / #0A6B47 / #171717 / #0A0A0A / #FFFFFF, Figtree + JetBrains Mono. The logo is rendered from the official paths, unmodified.
- **Voice:** Microsoft Edge TTS `en-US-AndrewMultilingualNeural`, rate −6%
- **Music:** original score from `pipeline/make_score.py`, intensity per chapter (0 cold open → 4 proof → 1 close), ducked under narration
- **Code:** `studio/src/film/` (kit, scenesA, scenesB, Film), registered as composition `Film`
- **Frames:** `frames/` style-frame sheets and the end card; `reference_previous_video_abstraxn8.jpg` is the earlier 3:12 Antier × Abstraxn video, for comparison

## Rebuild

```bash
.venv/bin/python pipeline/build_film.py films/abstraxn-intro/script.json
```

Add `--no-render` to regenerate voice, score, timeline and captions only.

## Chapters

| # | Chapter | Starts |
|---|---|---|
| 1 | Cold open | 0:00 |
| 2 | Brand reveal | 0:26 |
| 3 | The shift | 0:38 |
| 4 | The problem | 1:07 |
| 5 | Know Your Intent | 1:43 |
| 6 | Settlement layer | 2:30 |
| 7 | One payment, end to end | 3:25 |
| 8 | The agent economy | 4:10 |
| 9 | Proof | 4:43 |
| 10 | Close | 5:09 |

## Licence note

Rendered with Remotion under its free licence because this is an individual's portfolio piece. If Antier or Abstraxn adopts the film or the engine as a company asset, a Remotion Company License is needed, or the scenes should move to HyperFrames (Apache-2.0).
