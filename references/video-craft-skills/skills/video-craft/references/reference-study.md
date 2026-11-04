# Studying a reference video

Purpose: learn a reference's **visual language** (motion, camera, transitions, type, layout and data-screen method, editing rhythm, sound) with numbers, so our films reach that level. Never copy its scenes, scene order, lines, trademark shapes or palette. Stay on production craft: no competitor or positioning analysis; story counts only as pacing and beat timing.

## 1. Get and prep the video

```bash
pip install -r pipeline/requirements.txt          # numpy, imageio-ffmpeg (+ yt-dlp for downloads)
python pipeline/sync_references.py <set> <url-or-id> [...] --root research/reference-videos
#   downloads only new videos (≤ 1080p mp4), preps each, writes <root>/<set>/manifest.json
python pipeline/prep_reference.py <root>/<set>/<id>/source/<id>.mp4 [--fps 2 | --every 20]
#   sheets/ (timestamped 4x3 contact sheets), cuts.txt (scene > 0.3), audio.txt (RMS dB per second + tempo),
#   spectrogram.png, transcript.txt (from .srt captions if present)
```
Contact-sheet rate: 2 fps for videos ≤ 140 s, 1 fps up to 15 min, one frame every 20 s for keynotes and webinars.

Close-reading tools (all free; use the bundled ffmpeg: `python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`):
- **Bursts** (10 fps tiles over 1.4 s): `$FF -v error -ss <t> -t 1.4 -i <mp4> -vf "fps=10,scale=480:270,tile=4x4,format=rgb24" -frames:v 1 -y detail/<name>.png`
- **Every frame** over a window (measure easing, wipes, reveals frame by frame): `$FF -v error -ss <t> -t 1 -i <mp4> -vf "scale=320:-1,tile=6x5" -frames:v 1 -y detail/<name>_ef.png` (30 frames in one grid).
- **Full-res still** for exact copy, colour and type: `$FF -v error -ss <t> -i <mp4> -frames:v 1 -vf format=rgb24 -y still.png`; sample pixel colours with PIL.
- **Transcript with word times**: faster-whisper (`small.en`) on a 16 kHz mono numpy array with `word_timestamps=True`. "Thanks for watching" on a silent track means music only.
- **Optional**: if the `hypit` CLI is installed, `hypit media boundaries <mp4> --rate 10 --threshold 0.25` (cut candidates), `hypit media tiles <mp4> --start A --end B --every-frame` (labelled frame grids), `hypit transcribe` (word times). Same method, faster.
- Convert timings to 30 fps: 25 fps sources ×1.2, 24 fps ×1.25.

## 2. Read the whole, then the details

Watch the whole piece first: hook, argument, shifts of attention, payoff, the intended viewer response. Form a provisional explanation of why it works. Then read every designed **system** once (caption, motion graphics, typography, effects, audio): its content and appearance, spatial relationship, entry, active behaviour, persistence and exit, located against the words, pauses or actions it serves. Explain what each choice does for the viewer (establishes, contrasts, accumulates proof, amplifies, makes a process legible, hands attention on). Whole-piece and close readings revise each other: an object that survives a cut belongs to a longer-lived system.

A motion's name is only a start: measure its path, scale and opacity change, duration in frames, the easing (fit a bezier from per-frame positions where you can), overshoot, settle, stagger, and how it relates to neighbouring events.

## 3. Breakdown rubric (write `<set>/<id>/BREAKDOWN.md`)

1. **Type and purpose**: brand film, overview, demo, explainer, keynote, spot, reel. One-line concept. Who it is for.
2. **Story structure**: beats with timestamps; how the problem is framed; how the product enters; proof; CTA; why it works for a cold viewer.
3. **Script and VO**: voice character, words per minute (speaking and over runtime), key lines, on-screen copy, how text and VO split the work.
4. **Visual system**: palette (hex, gradient stops and angles), backgrounds (gradients, 3D, footage, light/dark), brand devices (shapes, marks, status colours, characters), iconography, how UI is rendered (real, stylised, glass, floating cards, device frames).
5. **Typography**: family guess, weights, sizes at 1080p, layout and positions, text animation styles with frame timings.
6. **Motion and effects, small to big**: micro (cursor, clicks, hovers, typing, toasts, chips, counters, loaders); meso (card builds, panel slides, bubbles, chart growth, list stagger); macro (camera: push, pan, tilt, orbit, zoom-through; transitions: match cut, wipe, morph, mask, light leak, gradient sweep; scene structure). For each: frames, easing (curve numbers where measurable), stagger.
7. **Editing**: cut list rhythm, ASL (and median), events per cut, light/dark rhythm, music sync (% of cuts on onsets), how live action mixes with graphics.
8. **Sound**: music style, tempo, energy curve (RMS per second), SFX palette, VO-to-bed balance in dB (measure it; most references fail the ≥ 10 dB rule).
9. **Signature techniques** (top 5 to 8), each with a ready Remotion recipe (TSX snippet or exact interpolate/spring numbers).
10. **For our film**: what to adopt and how it maps to our story, translated into our brand (our shape, our palette, our states); the weaknesses to avoid. No trademark shapes, palettes or lines.

Be faithful; mark guesses as guesses. No generic advice: everything specific to what is on screen. For a localised version, compare against the original and note what is templated vs touched by hand. For long videos, analyse only the produced elements.

## 4. From breakdowns to the film

- Merge findings into the technique files (`typography.md`, `micro-motion.md`, `builds.md`, `camera.md`, `transitions.md`, `editing.md`, `sound.md`) as new rows with numbers, not as a separate per-video document the next agent will never read.
- When a technique recurs and has no component, build it into the kit (`SKILL.md` §7).
- Keep a set-level **video index**: id, type, length, VO yes/no, signature techniques, and a "lookup by problem" list (e.g. "need a chapter card" → ids).

## 5. Traceability (mandatory for every film)

- Each storyboard beat cites **1 to 3 reference moments** (video id + timestamp) and the technique names it uses.
- **Open those frames before building the shot** and match the craft: layout density, how the eye is guided through a data screen, camera timing.
- Keep the traceability table in `STORYBOARD.md` and `NOTES.md`:

| Beat | Our timecode | Technique(s) | Reference moments (id @ time) | What we matched | What we changed (brand translation) |
|---|---|---|---|---|---|

- In the self-review, show **frame pairs** (ours vs the reference) for the 3 to 5 most important beats.
- A benchmark film (a previous best or a competitor-level floor) is a **yardstick only**: measure it (type sizes, contrast, bitrate, LUFS, motion blur, CTA length, ASL) and beat every number; never rebuild its scenes or present a replica as our look.
