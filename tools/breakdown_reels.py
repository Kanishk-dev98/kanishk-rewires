"""Objective breakdown of reference reels, for channel studies.

For each video: contact sheets (1 fps), a dense hook sheet (first 4 s at 4 fps), shot cuts (scene detect),
a word-timed transcript (faster-whisper), speaking rate, loudness, and the music-bed level in the gaps
between words relative to the voice. Writes research/reference-videos/<channel>/<id>/.

Usage:
    .venv/bin/python tools/breakdown_reels.py <channel> <video.mp4> [<video.mp4> ...]
    WHISPER_MODEL=small for non-English (e.g. Hinglish) reels.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()


def run(args):
    return subprocess.run([FF, "-hide_banner", *args], capture_output=True, text=True)


def duration(v: Path) -> float:
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", run(["-i", str(v)]).stderr).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def frames(v: Path, fps: float, t0=0.0, t1=None, w=270):
    args = ["-v", "error", "-ss", str(t0)] + (["-t", str(t1 - t0)] if t1 else []) + ["-i", str(v), "-vf", f"fps={fps},scale={w}:-2", "-f", "image2pipe", "-vcodec", "png", "-"]
    raw = subprocess.run([FF, *args], capture_output=True).stdout
    out, sig = [], b"\x89PNG"
    parts = raw.split(sig)[1:]
    from io import BytesIO

    for p in parts:
        try:
            out.append(Image.open(BytesIO(sig + p)).convert("RGB"))
        except Exception:
            pass
    return out


def sheet(imgs, labels, cols, path: Path):
    if not imgs:
        return
    w, h = imgs[0].size
    rows = (len(imgs) + cols - 1) // cols
    S = Image.new("RGB", (cols * w, rows * (h + 22)), "white")
    d = ImageDraw.Draw(S)
    for i, (im, lb) in enumerate(zip(imgs, labels)):
        x, y = (i % cols) * w, (i // cols) * (h + 22)
        S.paste(im, (x, y + 22))
        d.text((x + 6, y + 4), lb, fill="black")
    S.save(path, quality=85)


def cuts(v: Path):
    r = run(["-i", str(v), "-vf", "select='gt(scene,0.28)',showinfo", "-f", "null", "-"])
    return [round(float(t), 2) for t in re.findall(r"pts_time:([\d.]+)", r.stderr)]


def loudness(v: Path):
    r = run(["-i", str(v), "-af", "ebur128", "-f", "null", "-"])
    m = re.search(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m.group(1)) if m else None


def pcm(v: Path, sr=16000):
    raw = subprocess.run([FF, "-v", "quiet", "-i", str(v), "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def main():
    channel, vids = sys.argv[1], [Path(p) for p in sys.argv[2:]]
    from faster_whisper import WhisperModel

    import os

    model = WhisperModel(os.environ.get("WHISPER_MODEL", "small.en"), device="cpu", compute_type="int8")
    for v in vids:
        out = ROOT / "research" / "reference-videos" / channel / v.stem
        out.mkdir(parents=True, exist_ok=True)
        D = duration(v)
        imgs = frames(v, 1)
        sheet(imgs, [f"{i}s" for i in range(len(imgs))], 8, out / "sheet_1fps.jpg")
        hook = frames(v, 4, 0, 4, w=300)
        sheet(hook, [f"{i / 4:.2f}s" for i in range(len(hook))], 8, out / "hook_4fps.jpg")
        a = pcm(v)
        segs, _ = model.transcribe(a, word_timestamps=True, vad_filter=True)
        words = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for sg in segs for w in sg.words]
        text = " ".join(w["w"] for w in words)
        # music bed: RMS in gaps (>250 ms without words) vs RMS during words
        sr = 16000
        speech = np.zeros(len(a), bool)
        for w in words:
            speech[int(w["s"] * sr) : int(w["e"] * sr)] = True
        db = lambda x: float(20 * np.log10(np.sqrt(np.mean(x**2)) + 1e-9)) if len(x) else None
        gap_mask = ~speech
        sc = cuts(v)
        rep = {
            "id": v.stem,
            "duration": round(D, 2),
            "words": len(words),
            "wpm": round(len(words) / (D / 60), 1) if D else None,
            "first_word_at": words[0]["s"] if words else None,
            "hook_text_first_4s": " ".join(w["w"] for w in words if w["s"] < 4),
            "cuts": len(sc),
            "cuts_per_10s": round(len(sc) / D * 10, 2) if D else None,
            "avg_shot_s": round(D / (len(sc) + 1), 2),
            "cut_times": sc,
            "lufs": loudness(v),
            "voice_db": round(db(a[speech]), 1) if speech.any() else None,
            "gaps_db": round(db(a[gap_mask]), 1) if gap_mask.any() else None,
        }
        (out / "metrics.json").write_text(json.dumps(rep, indent=1))
        (out / "transcript.json").write_text(json.dumps(words))
        (out / "transcript.txt").write_text(text + "\n")
        print(v.stem, rep["duration"], "s", rep["wpm"], "wpm", rep["cuts"], "cuts", "voice", rep["voice_db"], "gaps", rep["gaps_db"])


if __name__ == "__main__":
    main()
