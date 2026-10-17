---
name: rewires-video-qa
description: Quality checklist for Kanishk.Rewires videos, built from the user's own feedback. Run on styleframes before every full render and on the final file before delivering.
---

# Video QA checklist (from the user's feedback so far)

For Rewires projects, `produce run` already runs the automated checks (format, decode, black, freeze, silence, loudness, safe area, brand ending) and writes `reports/contact_sheet.png`. This list covers what a human eye still has to judge.

Look at the actual frames: a styleframe board, then a contact sheet of the final video (`fps=1.5` or `fps=2`, tiled). Fix, re-check the fixed frames, then render.

## Picture

- [ ] **No overlaps.** Every scene has fixed zones. When something new arrives, the old element moves away or fades fully; never ghost it at low opacity behind new content. (Raised on the Abstraxn film v1 and Apolio v1.)
- [ ] **Readable pacing.** Where several items animate together (rule cards, tile re-sorts, stack names), give each item time to be read: about one beat each, not half a beat. The user prefers adding a few seconds to rushing.
- [ ] **Not slow either.** No dead air or long lead-ins; music-led and energetic. (The 5:39 film v1 was "too slow, like slow piano".)
- [ ] **Premium, not mid-level.** Depth on every frame (background grid or scenery, mid UI, foreground type), camera push or drift on UI, slams or bursts on key beats, nothing static for more than 1.5 s except deliberate holds.
- [ ] **Safe area.** Nothing clipped at the frame edge (keep ≥ 80 px sides); grids sized to fit.
- [ ] **Text fits.** No awkward wraps; titles on one line where intended.
- [ ] **Brand.** Kanishk.Rewires: only the `rewires-brand` palette, lime as a controlled accent (one or two per scene), K·R monogram unmodified, wordmark spelled KANISHK.REWIRES, signature outro present. Abstraxn work: only the `abstraxn-brand` palette.
- [ ] **Facts.** Every number, quote and date on screen traces to `research/sources.json`; company figures are labelled as the company's own.
- [ ] **Copy.** Every scripted line exactly as written; no em or en dashes on screen (grep the scene code).

## Sound

- [ ] Music energetic and on the beat; impacts and dead stops land on the story beats (verify with `silencedetect`).
- [ ] Loudness about −14 LUFS (`ebur128`).

## File

- [ ] Duration as intended; decodes clean (`ffmpeg -v error -i f -f null -`).
- [ ] bt709 tags and `+faststart` (moov at the front) so it plays in QuickTime.
- [ ] New file name per version; opened for the user after delivery.
