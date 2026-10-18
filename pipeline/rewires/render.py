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


def _video_args(prod: dict) -> list[str]:
    """Delivery encode for Instagram: a high-bitrate H.264 High master with light temporal grain.
    Instagram re-compresses everything; a lean upload (1-4 Mbps of flat graphics) comes back blocky and banded."""
    d = prod.get("delivery")
    if not d:
        return ["-c:v", "copy", "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1"]
    vf = f"noise=alls={d['grain']}:allf=t,format=yuv420p" if d.get("grain") else "format=yuv420p"
    return ["-vf", vf, "-c:v", "libx264", "-preset", d.get("preset", "slow"), "-profile:v", "high", "-level", "4.2",
            "-b:v", d["videoBitrate"], "-maxrate", d["maxrate"], "-bufsize", d["bufsize"], "-g", "60", "-bf", "2"]


def master(raw: Path, out: Path, prod: dict):
    """Two-pass loudnorm: measure first, then normalise linearly to the target (accurate even with long quiet stretches)."""
    r, ld = prod["render"], prod["loudness"]
    target = f"I={ld['targetLufs']}:TP={ld['truePeak']}:LRA=11"
    probe = subprocess.run([config.ffmpeg(), "-hide_banner", "-nostats", "-i", str(raw), "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
    m = json.loads(probe[probe.rfind("{"): probe.rfind("}") + 1])
    second = (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
              f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(
        [
            config.ffmpeg(), "-loglevel", "error", "-y", "-i", str(raw), *_video_args(prod),
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-af", second, "-c:a", "aac", "-b:a", r["audioBitrate"], "-ar", str(r["sampleRate"]), "-movflags", "+faststart", str(out),
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
