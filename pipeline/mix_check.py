"""Voice-over mix check: the voice must stay clearly above the music and effects in every spoken line.

Renders two audio-only stems of the composition (voice only, and the bed: music plus effects with all ducking)
and compares their loudness over each line's speech window. Fails (exit 1) if any line's margin is too small.

Rule: voice >= 10 dB over the bed RMS per line, and >= 4 dB over the loudest 100 ms of bed inside the line
(catches a boom or impact under a word). Fix a failure by lowering the bed or moving the line off the hit,
never by boosting the voice.

The composition must accept a `stem` prop: "vo" renders voice only, "bed" renders music + sfx with ducking
(motion/audio.tsx <Soundtrack> does this). Props need `vo`: [{src, at, speech: [a, b]}] in frames.

Usage:
  python mix_check.py <CompositionId> <props.json> [--project <remotion project dir>] [--entry src/index.ts]
                      [--fps 30] [--min-db 10] [--peak-db 4]
"""
import argparse
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np


def stem(project: Path, entry: str, comp: str, props: dict, which: str, out: Path):
    p = out.with_suffix(".json")
    p.write_text(json.dumps({**props, "stem": which}))
    subprocess.run(["npx", "remotion", "render", entry, comp, str(out), f"--props={p}", "--codec=wav", "--timeout=120000", "--log=error"], cwd=project, check=True)
    with wave.open(str(out)) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        raw = w.readframes(w.getnframes())
    if sw == 2:
        x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    elif sw == 4:
        x = np.frombuffer(raw, dtype=np.int32).astype(np.float32) / 2147483648
    else:
        sys.exit(f"unsupported sample width {sw}")
    return x.reshape(-1, ch).mean(axis=1), sr


def rms_db(x: np.ndarray) -> float:
    return float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("comp")
    ap.add_argument("props")
    ap.add_argument("--project", default=".", help="Remotion project dir (where package.json is)")
    ap.add_argument("--entry", default="src/index.ts")
    ap.add_argument("--fps", type=float, default=30)
    ap.add_argument("--min-db", type=float, default=10.0, help="voice RMS over bed RMS per line")
    ap.add_argument("--peak-db", type=float, default=4.0, help="voice RMS over the loudest 100 ms of bed in the line")
    a = ap.parse_args()
    props = json.loads(Path(a.props).read_text())
    project = Path(a.project).resolve()
    with tempfile.TemporaryDirectory() as d:
        vo, sr = stem(project, a.entry, a.comp, props, "vo", Path(d) / "vo.wav")
        bed, _ = stem(project, a.entry, a.comp, props, "bed", Path(d) / "bed.wav")
    worst, bad = float("inf"), []
    for line in props["vo"]:
        s0, s1 = (round(v / a.fps * sr) for v in line["speech"])
        m = rms_db(vo[s0:s1]) - rms_db(bed[s0:s1])
        win = sr // 10
        peak = max((rms_db(bed[i:i + win]) for i in range(s0, max(s0 + 1, s1 - win), win // 2)), default=-99)
        mp = rms_db(vo[s0:s1]) - peak
        worst = min(worst, m)
        flag = m < a.min_db or mp < a.peak_db
        if flag:
            bad.append(line["src"])
        print(f"{'FAIL' if flag else 'ok  '} {line['src']:32} {line['speech'][0] / a.fps:7.2f}s  voice over bed {m:5.1f} dB  (over loudest bed 100 ms {mp:5.1f} dB)")
    print(f"worst line margin {worst:.1f} dB (need >= {a.min_db} dB, and >= {a.peak_db} dB over the loudest bed moment)")
    if bad:
        sys.exit(f"mix check failed on {len(bad)} line(s): lower the music/effects or move the line off the hit")


if __name__ == "__main__":
    main()
