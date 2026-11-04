"""Render and master a Remotion film to delivery spec.

render_raw: bundle once, render H.264 CRF 12 (slow preset, yuv420p, bt709), --gl=angle (needed for WebGL/3D;
            harmless for 2D), concurrency 4, 120 s frame timeout for shader compiles.
master:     re-encode to x264 slow CBR (default 14 Mb/s with filler: nal-hrd=cbr holds a per-second floor, so dark
            glows and gradients never starve), aq-mode 3, yuv420p limited range, bt709 tags written into the
            stream AND the container; audio: a light peak limiter, then 2-pass LINEAR loudnorm to -14 LUFS /
            -1.0 dBTP / LRA 11 (linear keeps the mix ratio, it only moves the level); AAC 256k 48 kHz; +faststart.

Usage:
  python master.py render <project> <Composition> <props.json> <raw.mp4> [--entry src/index.ts]
  python master.py master <raw.mp4> <final.mp4> [--bitrate 14M]
"""
import argparse
import json
import subprocess
from pathlib import Path

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()


def render_raw(project: Path, entry: str, comp: str, props_path: Path, raw: Path, concurrency: int = 4):
    bundle = Path(project) / "out" / "bundle"
    subprocess.run(["npx", "remotion", "bundle", entry, f"--out-dir={bundle}"], cwd=project, check=True)
    subprocess.run(
        ["npx", "remotion", "render", str(bundle), comp, str(raw), f"--props={props_path}", "--codec=h264", "--crf=12", "--x264-preset=slow", "--pixel-format=yuv420p",
         "--color-space=bt709", "--gl=angle", f"--concurrency={concurrency}", "--timeout=120000", "--log=error"],
        cwd=project,
        check=True,
    )


def master(raw: Path, final: Path, bitrate: str = "14M"):
    lim = "alimiter=limit=0.5:attack=2:release=60:level=false"
    meas = subprocess.run([FF, "-hide_banner", "-i", str(raw), "-vn", "-af", f"{lim},loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(meas[meas.rindex("{"): meas.rindex("}") + 1])
    ln = (f"{lim},loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    buf = f"{max(1, int(bitrate.rstrip('Mm')) // 2)}M"
    subprocess.run(
        [FF, "-v", "error", "-y", "-i", str(raw), "-c:v", "libx264", "-preset", "slow", "-b:v", bitrate, "-minrate", bitrate, "-maxrate", bitrate, "-bufsize", buf,
         "-x264-params", "nal-hrd=cbr:aq-mode=3", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
         "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
         "-af", ln, "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", str(final)],
        check=True,
    )


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("render")
    r.add_argument("project")
    r.add_argument("comp")
    r.add_argument("props")
    r.add_argument("raw")
    r.add_argument("--entry", default="src/index.ts")
    r.add_argument("--concurrency", type=int, default=4)
    m = sub.add_parser("master")
    m.add_argument("raw")
    m.add_argument("final")
    m.add_argument("--bitrate", default="14M", help="CBR video bitrate, 12M to 16M for 1080p30")
    a = ap.parse_args()
    if a.cmd == "render":
        render_raw(Path(a.project).resolve(), a.entry, a.comp, Path(a.props).resolve(), Path(a.raw).resolve(), a.concurrency)
    else:
        master(Path(a.raw), Path(a.final), a.bitrate)


if __name__ == "__main__":
    main()
