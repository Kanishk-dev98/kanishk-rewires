"""Automated quality control on the rendered file. A render is approved only when no check fails.

Covers: format (size, fps, codecs, duration), decode errors, black frames, freezes,
silence gaps, loudness and true peak, safe-area intrusions on sampled frames, the brand
ending, and a contact sheet for visual review. Overlaps and taste still need human eyes.
"""
import json
import re
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image

from . import config


def probe(path: Path) -> dict:
    out = subprocess.run(
        [*config.ffprobe(), "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        capture_output=True, text=True, check=True, cwd=config.STUDIO,
    ).stdout
    return json.loads(out)


def _filter_log(path: Path, args: list[str]) -> str:
    return subprocess.run([config.ffmpeg(), "-hide_banner", "-nostats", "-i", str(path), *args, "-f", "null", "-"],
                          capture_output=True, text=True).stderr


def parse_black(log: str) -> list[tuple[float, float]]:
    return [(float(a), float(b)) for a, b in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", log)]


def parse_freeze(log: str) -> list[tuple[float, float]]:
    starts = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", log)]
    durs = [float(x) for x in re.findall(r"freeze_duration: ([\d.]+)", log)]
    return list(zip(starts, durs))


def parse_silence(log: str) -> list[tuple[float, float]]:
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    durs = [float(x) for x in re.findall(r"silence_duration: ([\d.]+)", log)]
    return list(zip(starts, durs))


def parse_ebur128(log: str) -> tuple[float | None, float | None]:
    summary = log[log.rfind("Summary:"):] if "Summary:" in log else log
    i = re.search(r"I:\s+(-?[\d.]+) LUFS", summary)
    tp = re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary)
    return (float(i.group(1)) if i else None, float(tp.group(1)) if tp else None)


def frame_at(path: Path, t: float, out: Path) -> Path:
    subprocess.run([config.ffmpeg(), "-loglevel", "error", "-y", "-ss", f"{t:.3f}", "-i", str(path), "-frames:v", "1", str(out)], check=True)
    return out


def edge_ink(img: Image.Image, band: int, dark: bool) -> int:
    """Count strong text-like pixels inside the side bands, where nothing should be drawn."""
    g = np.asarray(img.convert("L"))
    sides = np.concatenate([g[:, :band], g[:, -band:]], axis=1)
    return int((sides > 150).sum() if dark else (sides < 100).sum())


def ending_ok(img: Image.Image, logo_size: float = 380) -> tuple[bool, str]:
    """The last frame must show the lime accent and cream type (monogram + wordmark) on charcoal."""
    a = np.asarray(img.convert("RGB").resize((img.width // 4, img.height // 4))).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lime = int(((g > 200) & (r > 120) & (b < 110) & (g - b > 120)).sum())
    cream = int(((r > 225) & (g > 225) & (b > 205)).sum())
    k = (logo_size / 380) ** 2  # thresholds scale with the logo's area (compact outros are allowed)
    ok = lime > 30 * k * 0.6 and cream > 300 * k * 0.6
    return ok, f"lime px {lime}, cream px {cream}"


def contact_sheet(path: Path, out: Path, fps: float, duration: float, cols: int = 8) -> Path:
    rows = max(1, -(-int(duration * fps + 1) // cols))
    subprocess.run(
        [config.ffmpeg(), "-loglevel", "error", "-y", "-i", str(path), "-vf",
         f"fps={fps},scale=240:-1,tile={cols}x{rows}:padding=6:color=0x1F1F1F", "-frames:v", "1", str(out)],
        check=True,
    )
    return out


def run(video: Path, timeline: dict, sb: dict, reports: Path) -> dict:
    prod = config.production()
    q = prod["qc"]
    fps = prod["fps"]
    fmt = prod["formats"][sb.get("format", prod["defaultFormat"])]
    checks = []

    def check(name, ok, detail, severity="error"):
        checks.append({"check": name, "ok": bool(ok), "detail": detail, "severity": "info" if ok else severity})

    from .timing import outro_frames

    outro_s = outro_frames(sb, prod) / fps
    expected = timeline["bodyFrames"] / fps + outro_s
    if sb.get("targetSeconds"):
        check("exact target length", abs(expected - sb["targetSeconds"]) < 0.05, f"{expected:.2f} s planned vs {sb['targetSeconds']} s brief")

    info = probe(video)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    num, den = map(int, v["r_frame_rate"].split("/"))
    dur = float(info["format"]["duration"])
    check("resolution", (v["width"], v["height"]) == (fmt["width"], fmt["height"]), f"{v['width']}x{v['height']}")
    check("frame rate", abs(num / den - fps) < 0.01, f"{num / den:.2f} fps")
    check("video codec", v["codec_name"] == "h264", v["codec_name"])
    check("audio", a is not None and a["codec_name"] == "aac" and a["sample_rate"] == str(prod["render"]["sampleRate"]),
          f"{a['codec_name']} {a['sample_rate']} Hz" if a else "no audio stream")
    check("duration", abs(dur - expected) < 0.2, f"{dur:.2f} s (expected {expected:.2f} s)")
    lo, hi = prod["durationTargetSeconds"]
    check("duration target", lo <= dur <= hi + outro_s, f"{dur:.1f} s vs target {lo} to {hi} s", "warning")

    errs = subprocess.run([config.ffmpeg(), "-v", "error", "-i", str(video), "-f", "null", "-"], capture_output=True, text=True).stderr.strip()
    check("decodes clean", not errs, errs[:300] or "no decode errors")

    black = parse_black(_filter_log(video, ["-vf", f"blackdetect=d={q['blackMinSeconds']}:pix_th=0.025:pic_th=0.985", "-an"]))
    check("no black frames", not black, f"{black}" if black else "none")

    freeze = parse_freeze(_filter_log(video, ["-vf", f"scale=270:-1,gblur=sigma=2,freezedetect=n=0.002:d={q['freezeMinSeconds']}", "-an"]))
    body_end = timeline["bodyFrames"] / fps
    freeze_body = [f for f in freeze if f[0] < body_end - 0.2]
    check("no freezes in the body", not freeze_body, f"{freeze_body}" if freeze_body else "none (outro hold is intentional)")

    sil = parse_silence(_filter_log(video, ["-af", f"silencedetect=noise={q['silenceNoiseDb']}dB:d={q['silenceMinSeconds']}", "-vn"]))
    sil_body = [s for s in sil if s[0] < body_end]
    check("no silent gaps", not sil_body, f"{sil_body}" if sil_body else "none")

    lufs, tp = parse_ebur128(_filter_log(video, ["-af", "ebur128=peak=true", "-vn"]))
    ld = prod["loudness"]
    check("loudness", lufs is not None and abs(lufs - ld["targetLufs"]) <= ld["toleranceLu"], f"{lufs} LUFS (target {ld['targetLufs']})")
    check("true peak", tp is not None and tp <= -0.5, f"{tp} dBTP")

    # Safe area: sample each scene at its middle and at its key moment.
    frames_dir = reports / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    margin = config.brand()["captions"]["sideMarginPx"]
    start, bad = 0, []
    for s in timeline["scenes"]:
        dark = s["data"].get("theme") != "cream"
        for f in {start + s["dur"] // 2, start + min(s["dur"] - 2, s["data"].get("syncFrame", 0) + 20)}:
            img = Image.open(frame_at(video, f / fps, frames_dir / f"{s['id']}_{f}.png"))
            ink = edge_ink(img, int(margin * 0.75 * img.width / 1080), dark)
            if ink > 40:
                bad.append(f"{s['id']} @ {f / fps:.1f}s ({ink} px)")
        start += s["dur"]
    check("safe area", not bad, "; ".join(bad) or f"nothing drawn within {int(margin * 0.75)} px of the sides")

    last_png = frames_dir / "last.png"
    subprocess.run([config.ffmpeg(), "-loglevel", "error", "-y", "-sseof", "-0.25", "-i", str(video), "-update", "1", "-frames:v", "1", str(last_png)], check=True)
    last = Image.open(last_png)
    ok, detail = ending_ok(last, sb.get("outro", {}).get("size", 380))
    check("brand ending", ok, detail)

    sheet = contact_sheet(video, reports / "contact_sheet.png", q["contactSheetFps"], dur)
    report = {
        "video": str(video),
        "passed": all(c["ok"] or c["severity"] != "error" for c in checks),
        "checks": checks,
        "contactSheet": str(sheet),
        "needsHumanReview": ["overlapping elements", "pacing and readability", "visual taste and continuity", "voice delivery"],
    }
    (reports / "qc.json").write_text(json.dumps(report, indent=2))
    md = ["# QC report", "", f"Video: `{Path(video).name}`  ", f"Result: **{'PASS' if report['passed'] else 'FAIL'}**", "", "| Check | Result | Detail |", "|---|---|---|"]
    md += [f"| {c['check']} | {'ok' if c['ok'] else c['severity'].upper()} | {c['detail']} |" for c in checks]
    md += ["", "Still needs human eyes: " + ", ".join(report["needsHumanReview"]) + ".", ""]
    (reports / "qc.md").write_text("\n".join(md))
    return report
