# Mix, master, encode, deliver

## 1. Mix standard (every film with a voice)

1. **Voice stays at full level.** Only the music and effects move. Fix a failing line by lowering the bed or moving the line off the hit, never by boosting the voice.
2. **Start gains**: `musicUnderVo 0.12 · musicBetween 0.5 · sfxUnderVo 0.2 · sfxBetween 0.75` (`MIX_START` in `audio.tsx`). Measured: beds at 0.38 / 0.88 with no SFX ducking gave only 0 to 3 dB of clearance and a line 8 dB *under* a boom.
3. **Duck the effects too**, not just the music (booms, impacts and whips go through `SfxGain`).
4. **Never a spoken word on a hit.** The hit lands, then the line starts after ≥ 20 f. A logo boom sits 1.2 s before the brand name is spoken.
5. **What is said at a hero moment is also written on screen.**
6. **Run the check every time**: `python pipeline/mix_check.py <Composition> <props.json> --project <dir>` renders a voice stem and a bed stem (music + SFX with all ducking) and measures every line. Pass = voice ≥ **10 dB** over the bed RMS per line AND ≥ **4 dB** over the loudest 100 ms of bed inside the line. Builders run it before the video render.
7. Reference films commonly sit only 3 to 8 dB over the bed; that fails this standard. 12 to 15 dB is the comfortable zone.
8. Bed tone: about +2 dB presence (2 to 5 kHz) so it survives phone speakers; mono-safe (correlation ≥ 0.7).
9. Social reels: music at least 10 to 20 dB under the voice, ducking under speech; varied bed per reel; no booms.

## 2. Master

- **Loudness**: −14 LUFS integrated (±0.5), true peak ≤ −1.0 dBTP, LRA 6 to 9.
- Chain (`master.py master`): a light peak limiter (`alimiter=limit=0.5:attack=2:release=60:level=false`), then **2-pass linear loudnorm** to I −14 / TP −1.0 / LRA 11 using the measured values (`linear=true` keeps the mix ratio; it only moves the level). AAC 256 kb/s, 48 kHz.
- Section dynamics come from the edit (quiet under reading, drops on claims), not from the master.

## 3. Encode

| Setting | Value |
|---|---|
| Intermediate render | H.264 CRF 12, `--x264-preset=slow`, `--pixel-format=yuv420p`, `--color-space=bt709`, `--gl=angle`, `--concurrency=4`, `--timeout=120000` |
| Delivery video | x264 slow, **CBR 14 Mb/s** (12 to 16 for 1080p30) with `nal-hrd=cbr` (holds a per-second floor), `aq-mode=3`, bufsize = half the bitrate |
| Per-second floor | ≥ 4 Mb/s everywhere (CRF-only encodes starve dark glows: measured 0.3 Mb/s troughs → blocking) |
| Pixel format / range | yuv420p, **limited (tv) range**, never full-range BT.601 (`yuvj420p`) |
| Colour tags | bt709 primaries / transfer / matrix in the container AND the stream (`-bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0`), so QuickTime and browsers agree |
| Container | MP4 with `-movflags +faststart` (moov at the front) |
| First frame | never black (start on the first designed frame) |
| Gradients | grain on every gradient; no step > 8 px; check dark glows at +2 stops for blocking |

Commands:
```bash
python pipeline/master.py render <project> <Composition> out/<tag>.props.json out/<name>.raw.mp4
python pipeline/master.py master out/<name>.raw.mp4 out/<name>_v1.mp4 --bitrate 14M
python pipeline/qc.py out/<name>_v1.mp4 --duration <seconds>
```
Quick master without re-encoding video (when the render is already final): copy the stream, add the bsf colour tags, `-af "loudnorm=I=-14:TP=-1.5:LRA=11"`, AAC 256k 48 kHz, `+faststart`. In zsh, write ffmpeg flags out in full; a `$VAR` holding flags will not word-split.

## 4. Render practice

- Bundle once (`npx remotion bundle src/index.ts --out-dir=out/bundle`), then render stills and video from the bundle.
- Styleframes: 12 to 14 full-res stills in parallel (≤ 4 at a time for 3D), tiled with ffmpeg into one board, then **look at it**.
- Animations must come from `useCurrentFrame()` with `interpolate` / `spring`: CSS transitions do not render. Canvas drawing happens in `useLayoutEffect`. Word rolls key each word's exit to the next word's arrival, not to an "active" index.
- `--gl=angle` for anything with WebGL; harmless for 2D.
- Long renders: keep concurrency at 4 and a stall watchdog; never trade quality for speed.

## 5. Deliver

- New file name per version (`<name>_v1.mp4`, `_v2`…); never overwrite a file the user may have open.
- Ship with: the video, styleframes, the board, the contact sheet, and `NOTES.md` (decisions, transition systems chosen and why they differ from the last film, traceability table, scorecard, known gaps).
- Open the file for the user after delivery.
- Videos over ~95 MB do not push to a normal git remote; keep them local or use Git LFS.
