"""Prepare a reference video for motion analysis.

Layout convention: <set>/<id>/source/<id>.mp4 (what sync_references.py writes). Output goes to <set>/<id>/:
sheets/ (timestamped 4x3 contact sheets), cuts.txt (hard-cut times, scene score > 0.3), audio.txt (RMS dB per
second + a tempo estimate), spectrogram.png, transcript.txt (from .srt captions next to the video, if any).
If the video is not inside a "source" folder, output goes to <video dir>/<video stem>/.

Usage: python prep_reference.py <video.mp4> [--fps 2] [--every SECONDS] [--out DIR] [--font FILE.ttf]
       (--every for long tutorials and keynotes: one frame every N seconds)
"""
import argparse
import re
import subprocess
import wave
from pathlib import Path

import imageio_ffmpeg
import numpy as np

FF = imageio_ffmpeg.get_ffmpeg_exe()
FONTS = ["/System/Library/Fonts/Supplemental/Arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "C:/Windows/Fonts/arial.ttf"]


def run(*a):
    return subprocess.run([FF, "-hide_banner", *a], capture_output=True, text=True)


def duration(v):
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", run("-i", str(v)).stderr)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--fps", type=float, default=2)
    ap.add_argument("--every", type=float, default=0)
    ap.add_argument("--out")
    ap.add_argument("--font", help="TTF for timestamp labels (default: first system font found)")
    a = ap.parse_args()
    v = Path(a.video).resolve()
    out = Path(a.out) if a.out else (v.parent.parent if v.parent.name == "source" else v.parent / v.stem)
    (out / "sheets").mkdir(parents=True, exist_ok=True)
    (out / "source").mkdir(parents=True, exist_ok=True)
    font = a.font or next((f for f in FONTS if Path(f).exists()), None)
    dur = duration(v)
    rate = 1 / a.every if a.every else a.fps
    per = 12  # 4x3 tiles per sheet
    span = per / rate
    label = f"drawtext=text='%{{pts\\:hms}}':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.7" + (f":fontfile={font}" if font else "")
    n = 0
    t = 0.0
    while t < dur:
        r = run("-v", "error", "-ss", f"{t}", "-t", f"{span}", "-i", str(v), "-vf",
                f"fps={rate},scale=480:270,setpts=PTS+{t}/TB,{label},tile=4x3,format=rgb24", "-frames:v", "1", "-y", str(out / "sheets" / f"sheet_{n:03d}.png"))
        if r.returncode:
            print(r.stderr[-300:])
        n += 1
        t += span
    # hard cuts
    r = run("-i", str(v), "-vf", "select='gt(scene,0.3)',showinfo", "-f", "null", "-")
    cuts = re.findall(r"pts_time:([\d.]+)", r.stderr)
    (out / "cuts.txt").write_text(" ".join(f"{float(c):.2f}" for c in cuts) + "\n")
    # audio: loudness per second + tempo
    wav = out / "source" / "audio16k.wav"
    run("-v", "error", "-i", str(v), "-ac", "1", "-ar", "16000", "-y", str(wav))
    lines = []
    if wav.exists():
        w = wave.open(str(wav))
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        db = [20 * np.log10(np.sqrt(np.mean(x[i * sr:(i + 1) * sr] ** 2)) + 1e-9) for i in range(int(len(x) / sr))]
        lines.append("rms dB per second: " + " ".join(f"{i}:{d:.0f}" for i, d in enumerate(db)))
        hop = 160
        e = np.array([np.sum(x[i * hop:(i + 1) * hop] ** 2) for i in range(len(x) // hop)])
        on = np.maximum(0, np.diff(np.log(e + 1e-9)))
        seg = on[: int(min(len(on), 120 * sr / hop))]
        seg = seg - seg.mean()
        ac = np.correlate(seg, seg, "full")[len(seg) - 1:]
        fr = sr / hop
        bpm = 60 / (np.arange(1, len(ac)) / fr)
        m = (bpm > 70) & (bpm < 180)
        lines.append(f"tempo estimate: {bpm[1:][m[1:]][np.argmax(ac[2:][m[1:]])] if m.any() else 0:.0f} BPM")
        wav.unlink()
    (out / "audio.txt").write_text("\n".join(lines) + "\n")
    run("-v", "error", "-i", str(v), "-lavfi", "showspectrumpic=s=1400x400:legend=1:scale=log", "-y", str(out / "spectrogram.png"))
    # captions to plain transcript
    srt = next(iter(v.parent.glob("*.srt")), None)
    if srt:
        seen, txt = set(), []
        for blk in srt.read_text(errors="ignore").split("\n\n"):
            ls = blk.strip().split("\n")
            if len(ls) >= 3:
                s = " ".join(ls[2:]).strip()
                if s and s not in seen:
                    seen.add(s)
                    txt.append(f"[{ls[1][:8]}] {s}")
        (out / "transcript.txt").write_text("\n".join(txt) + "\n")
    print(f"{v.name}: {dur:.1f}s, {n} sheets, {len(cuts)} cuts")


if __name__ == "__main__":
    main()
