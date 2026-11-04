"""Final-file QC: the numeric half of the pre-delivery checklist, plus a contact sheet to look at.

Checks (fails exit 1):
  - decodes clean (ffmpeg -v error ... -f null -)
  - loudness: integrated -14 LUFS ±0.5, true peak <= -1.0 dBTP, LRA reported (target 6 to 9)
  - video: yuv420p, bt709 tags, limited ("tv") range
  - per-second video bitrate floor >= --floor Mb/s (default 4)
  - first frame not black (mean luma > 20)
  - optional --duration expected seconds (±0.1 s)
Writes <file>.sheet.png: a contact sheet at --sheet-fps (1.5) for the visual review.

Usage: python qc.py final.mp4 [--floor 4] [--duration 62.0] [--sheet-fps 1.5] [--no-sheet]
"""
import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict

import imageio_ffmpeg
import numpy as np

FF = imageio_ffmpeg.get_ffmpeg_exe()


def run(*a):
    return subprocess.run([FF, "-hide_banner", *a], capture_output=True, text=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--floor", type=float, default=4.0, help="per-second video bitrate floor, Mb/s")
    ap.add_argument("--duration", type=float)
    ap.add_argument("--sheet-fps", type=float, default=1.5)
    ap.add_argument("--no-sheet", action="store_true")
    a = ap.parse_args()
    fails = []

    err = run("-v", "error", "-i", a.video, "-f", "null", "-").stderr.strip()
    print(f"decode: {'clean' if not err else 'ERRORS'}")
    if err:
        fails.append("decode errors: " + err[:200])

    info = run("-i", a.video).stderr
    dur_m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", info)
    dur = int(dur_m[1]) * 3600 + int(dur_m[2]) * 60 + float(dur_m[3]) if dur_m else 0
    vline = next((l for l in info.splitlines() if "Video:" in l), "")
    print(f"duration {dur:.2f}s\nvideo: {vline.strip()}")
    if "yuv420p" not in vline:
        fails.append("pixel format is not yuv420p")
    if "bt709" not in vline:
        fails.append("missing bt709 colour tags")
    if "tv" not in vline and "pc" in vline:
        fails.append("full range (pc); deliver limited range (tv)")
    if a.duration and abs(dur - a.duration) > 0.1:
        fails.append(f"duration {dur:.2f}s, expected {a.duration:.2f}s")

    ln = run("-i", a.video, "-vn", "-af", "loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json", "-f", "null", "-").stderr
    if "{" in ln:
        m = json.loads(ln[ln.rindex("{"): ln.rindex("}") + 1])
        i, tp, lra = float(m["input_i"]), float(m["input_tp"]), float(m["input_lra"])
        print(f"loudness: {i:.1f} LUFS, true peak {tp:.1f} dBTP, LRA {lra:.1f} (target 6 to 9)")
        if abs(i + 14) > 0.5:
            fails.append(f"integrated loudness {i:.1f} LUFS (target -14 ±0.5)")
        if tp > -1.0:
            fails.append(f"true peak {tp:.1f} dBTP (max -1.0)")
    else:
        print("loudness: no audio stream")

    # per-second bitrate from packet sizes (framecrc: stream, dts, pts, duration, size, hash)
    crc = run("-i", a.video, "-map", "0:v:0", "-c", "copy", "-f", "framecrc", "-").stdout
    tb = re.search(r"#tb 0: (\d+)/(\d+)", crc)
    per = defaultdict(int)
    if tb:
        num, den = int(tb[1]), int(tb[2])
        for l in crc.splitlines():
            if l.startswith("#"):
                continue
            p = [x.strip() for x in l.split(",")]
            if len(p) >= 5:
                per[int(int(p[1]) * num / den)] += int(p[4])
    if per:
        secs = sorted(per)[:-1] or sorted(per)  # drop the partial last second
        rates = [per[s] * 8 / 1e6 for s in secs]
        lo = min(rates)
        print(f"bitrate: avg {np.mean(rates):.1f} Mb/s, min {lo:.1f} Mb/s at {secs[rates.index(lo)]} s")
        if lo < a.floor:
            fails.append(f"bitrate floor {lo:.1f} Mb/s < {a.floor} Mb/s (use CBR / 2-pass)")

    raw = subprocess.run([FF, "-v", "error", "-i", a.video, "-frames:v", "1", "-vf", "scale=192:108", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
    if raw:
        luma = float(np.frombuffer(raw, np.uint8).mean())
        print(f"first frame mean luma {luma:.0f}")
        if luma < 20:
            fails.append("first frame is black")

    if not a.no_sheet:
        out = a.video.rsplit(".", 1)[0] + ".sheet.png"
        n = max(1, int(dur * a.sheet_fps))
        cols = 8
        rows = (n + cols - 1) // cols
        label = "drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.7"
        r = run("-v", "error", "-y", "-i", a.video, "-vf", f"fps={a.sheet_fps},scale=320:180,{label},tile={cols}x{rows}", "-frames:v", "1", out)
        if r.returncode:  # drawtext needs a font; fall back to no labels
            run("-v", "error", "-y", "-i", a.video, "-vf", f"fps={a.sheet_fps},scale=320:180,tile={cols}x{rows}", "-frames:v", "1", out)
        print(f"contact sheet: {out} (open it and look)")

    if fails:
        print("\nFAIL\n- " + "\n- ".join(fails))
        sys.exit(1)
    print("\nPASS (numbers only: still review the contact sheet and the every-frame tiles)")


if __name__ == "__main__":
    main()
