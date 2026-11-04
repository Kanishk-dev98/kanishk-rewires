"""Containment QA: every sharp UI edge must stay >= 80 px inside the frame (at 1920 wide), on every frame.

Feed it a QA render of the composition (props `qa: true`: stages turn flat black, grain off), at any scale.
For every frame it measures sharp-edge energy (Laplacian) inside the border band. Blurred, dimmed context behind a
focus target has little high-frequency energy and passes; a sharp card, label or headline crossing into the band
fails. Frame ranges given with --skip (e.g. 3D shots, whose backdrop grid is texture) are ignored.

Usage: python containment_check.py qa.mp4 [--skip a-b ...] [--fps 30] [--band 80] [--thresh 28] [--min-px 12]
Exit 1 if any frame fails; prints frame runs with the offending side.
"""
import argparse
import re
import subprocess
import sys

import imageio_ffmpeg
import numpy as np

FF = imageio_ffmpeg.get_ffmpeg_exe()


def frames(path):
    probe = subprocess.run([FF, "-i", path], capture_output=True, text=True).stderr
    w, h = map(int, re.search(r", (\d{3,4})x(\d{3,4})", probe).groups())
    p = subprocess.Popen([FF, "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
    i = 0
    while True:
        buf = p.stdout.read(w * h)
        if len(buf) < w * h:
            break
        yield i, np.frombuffer(buf, np.uint8).reshape(h, w).astype(np.float32)
        i += 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--skip", nargs="*", default=[])
    ap.add_argument("--fps", type=float, default=30)
    ap.add_argument("--band", type=int, default=80, help="safe-area band in px at 1920 wide")
    ap.add_argument("--thresh", type=float, default=28.0)
    ap.add_argument("--min-px", type=int, default=12)
    a = ap.parse_args()
    skips = [tuple(map(int, s.split("-"))) for s in a.skip]
    bad, n = [], 0
    for i, g in frames(a.video):
        n += 1
        if any(lo <= i <= hi for lo, hi in skips):
            continue
        h, w = g.shape
        band = max(2, round(a.band * w / 1920))
        lap = np.abs(4 * g[1:-1, 1:-1] - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:])
        m = np.zeros_like(lap, dtype=bool)
        m[: band - 1, :] = m[-(band - 1):, :] = True
        m[:, : band - 1] = m[:, -(band - 1):] = True
        hits = int(((lap > a.thresh) & m).sum())
        if hits >= a.min_px:
            ys, xs = np.where((lap > a.thresh) & m)
            side = "top" if ys.mean() < band else "bottom" if ys.mean() > h - band else "left" if xs.mean() < band else "right"
            bad.append((i, hits, side))
    print(f"checked {n} frames; {len(bad)} frames with sharp content inside the {a.band} px band")
    runs = []
    for i, hcount, side in bad:
        if runs and i - runs[-1][1] <= 2 and runs[-1][3] == side:
            runs[-1][1] = i
            runs[-1][2] = max(runs[-1][2], hcount)
        else:
            runs.append([i, i, hcount, side])
    for lo, hi, mx, side in runs:
        print(f"  frames {lo}-{hi} ({lo / a.fps:.2f}-{hi / a.fps:.2f} s): {side}, peak {mx} px")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
