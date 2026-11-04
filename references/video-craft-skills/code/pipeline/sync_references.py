"""Sync a reference set from a list of YouTube links: download only new videos, prep them, keep a manifest.

Reference lists grow over time: pass every link each time, and only the new ones are fetched and prepared.

Usage: python sync_references.py <set-name> <url-or-id> [<url-or-id> ...] [--root research/reference-videos]
Writes <root>/<set>/<id>/ (source/, sheets/, cuts.txt, audio.txt, spectrogram.png) and
<root>/<set>/manifest.json (id, title, channel, duration, status). A video with a BREAKDOWN.md is "analysed".

Needs yt-dlp (pip install yt-dlp; YouTube may also need yt-dlp-ejs and node as the JS runtime).
If YouTube bot-checks the machine, REF_COOKIES=<browser> uses that browser's YouTube session; only with the
owner's explicit consent.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
PY = sys.executable
YTDLP = shutil.which("yt-dlp") or str(Path(PY).parent / "yt-dlp")
FF = imageio_ffmpeg.get_ffmpeg_exe()
EXTRA = ["--js-runtimes", "node"] + (["--cookies-from-browser", os.environ["REF_COOKIES"]] if os.environ.get("REF_COOKIES") else [])


def vid(s: str) -> str:
    m = re.search(r"(?:v=|youtu\.be/|shorts/|live/)([A-Za-z0-9_-]{11})", s)
    return m.group(1) if m else s.strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("set")
    ap.add_argument("links", nargs="+")
    ap.add_argument("--root", default="research/reference-videos")
    a = ap.parse_args()
    name, links = a.set, a.links
    base = Path(a.root).resolve() / name
    base.mkdir(parents=True, exist_ok=True)
    mpath = base / "manifest.json"
    man = json.loads(mpath.read_text()) if mpath.exists() else {}
    ids = list(dict.fromkeys(vid(x) for x in links))
    new = [i for i in ids if not (base / i / "sheets").exists()]
    print(f"{len(ids)} unique, {len(new)} new")
    for i in new:
        meta = subprocess.run([YTDLP, *EXTRA, "--no-warnings", "--skip-download", "--print", "%(duration)s\t%(channel)s\t%(title)s", "--", i], capture_output=True, text=True).stdout.strip().split("\t", 2)
        out = base / i / "source"
        out.mkdir(parents=True, exist_ok=True)
        r = subprocess.run([YTDLP, *EXTRA, "--no-warnings", "-q", "--ffmpeg-location", FF, "-f", "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]",
                            "--merge-output-format", "mp4", "-o", str(out / f"{i}.%(ext)s"), "--", i], capture_output=True, text=True)
        mp4 = out / f"{i}.mp4"
        if not mp4.exists():
            man[i] = {"status": "download failed", "error": r.stderr[-300:]}
            continue
        try:
            dur = float(meta[0])
        except (ValueError, IndexError):
            dur = 0
        rate = ["--every", "20"] if dur > 900 else ["--fps", "1" if dur > 140 else "2"]  # keynotes: a frame every 20 s
        subprocess.run([PY, str(HERE / "prep_reference.py"), str(mp4), *rate], check=False)
        man[i] = {"title": meta[2] if len(meta) > 2 else "", "channel": meta[1] if len(meta) > 1 else "", "duration": dur, "status": "prepped", "breakdown": f"{i}/BREAKDOWN.md"}
        time.sleep(10)  # be gentle with YouTube (it rate-limits after heavy pulls)
    for i in ids:
        man.setdefault(i, {"status": "prepped" if (base / i / "sheets").exists() else "missing"})
        if (base / i / "BREAKDOWN.md").exists():
            man[i]["status"] = "analysed"
    mpath.write_text(json.dumps(man, indent=1))
    print(json.dumps({k: v.get("status") for k, v in man.items()}, indent=1))


if __name__ == "__main__":
    main()
