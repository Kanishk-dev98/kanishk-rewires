"""Render the Rewires composition and master it (bt709 tags, -14 LUFS, AAC 48 kHz, faststart)."""
import json
import subprocess
from pathlib import Path

from . import config


def render(props_path: Path, raw_out: Path, prod: dict, frames: str | None = None, override: dict | None = None):
    r = {**prod["render"], **(override or {})}
    cmd = [
        "npx", "remotion", "render", "Rewires", str(raw_out), f"--props={props_path}",
        f"--codec={r['codec']}", f"--crf={r['crf']}", f"--concurrency={r['concurrency']}", "--log=error", "--gl=angle", f"--timeout={r.get('timeoutMs', 120000)}",
    ]
    if frames:
        cmd.append(f"--frames={frames}")
    subprocess.run(cmd, cwd=config.STUDIO, check=True)


def still(props_path: Path, out_png: Path, frame: int):
    subprocess.run(
        ["npx", "remotion", "still", "Rewires", str(out_png), f"--props={props_path}", f"--frame={frame}", "--log=error", "--gl=angle"],
        cwd=config.STUDIO, check=True,
    )


def master(raw: Path, out: Path, prod: dict):
    r, ld = prod["render"], prod["loudness"]
    subprocess.run(
        [
            config.ffmpeg(), "-loglevel", "error", "-y", "-i", str(raw), "-c:v", "copy",
            "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1",
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-af", f"loudnorm=I={ld['targetLufs']}:TP={ld['truePeak']}:LRA=11",
            "-c:a", "aac", "-b:a", r["audioBitrate"], "-ar", str(r["sampleRate"]), "-movflags", "+faststart", str(out),
        ],
        check=True,
    )


def write_props(timeline: dict, sb: dict, prod: dict, public_prefix: str, out: Path) -> Path:
    fmt = prod["formats"][sb.get("format", prod["defaultFormat"])]
    from .timing import outro_frames as _of

    o = sb.get("outro", {})
    outro_frames = _of(sb, prod)
    props = {
        "width": fmt["width"],
        "height": fmt["height"],
        "scenes": timeline["scenes"],
        "captions": timeline["captions"],
        "showCaptions": sb.get("captions", True),
        "music": f"{public_prefix}/music.wav",
        "musicVolume": prod["music"]["volume"],
        "outro": {"dur": outro_frames, "sound": f"{public_prefix}/signature.wav", **{k: o[k] for k in ("nodes", "cta", "size", "wordSize") if k in o}},
    }
    if sb.get("chrome"):
        props["chrome"] = sb["chrome"]
    if sb.get("captionStyle"):
        props["captionStyle"] = sb["captionStyle"]
    out.write_text(json.dumps(props, indent=2))
    return out
