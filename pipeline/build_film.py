"""Build a long-form landscape film: per-line voiceover with word timings,
chapter timeline, matching score, SRT captions, render, master.

Usage:
    python build_film.py ../films/abstraxn-intro/script.json [--no-render] [--credit "Name"]
"""
import argparse
import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
STUDIO = ROOT / "studio"
PUBLIC = STUDIO / "public"
FPS = 30
LINE_GAP = 24  # frames of silence between narration lines

# (lead-in, tail) frames per chapter: room for visuals to breathe.
PADS = {
    "cold_open": (90, 45), "reveal": (60, 150), "shift": (75, 90), "problem": (75, 90),
    "kyi": (75, 105), "settlement": (75, 105), "demo": (75, 120), "economy": (75, 90),
    "proof": (60, 120), "close": (45, 240),
}
INTENSITY = {
    "cold_open": 0, "reveal": 1, "shift": 1, "problem": 1, "kyi": 2, "settlement": 2,
    "demo": 2, "economy": 3, "proof": 4, "close": 1,
}


async def tts(text, voice, rate, path):
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    audio, words = bytearray(), []
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            s = chunk["offset"] / 1e7
            words.append((chunk["text"], s, s + chunk["duration"] / 1e7))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(bytes(audio))
    return MP3(str(path)).info.length, words


def srt_time(sec):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


async def build(spec_path: Path, render: bool, credit: str):
    spec = json.loads(spec_path.read_text())
    fid = spec["id"]
    credit = credit or spec.get("credit", "")
    vo_dir = PUBLIC / "vo" / fid
    jobs = [(ci, li, line) for ci, ch in enumerate(spec["chapters"]) for li, line in enumerate(ch["lines"])]
    results = await asyncio.gather(*(
        tts(line, spec["voice"], spec["rate"], vo_dir / f"c{ci:02d}_l{li:02d}.mp3") for ci, li, line in jobs
    ))
    by_key = {(ci, li): r for (ci, li, _), r in zip(jobs, results)}

    chapters, sections, srt, cursor = [], [], [], 0
    for ci, ch in enumerate(spec["chapters"]):
        lead, tail = PADS.get(ch["id"], (60, 60))
        local, lines = lead, []
        for li, text in enumerate(ch["lines"]):
            dur_s, words = by_key[(ci, li)]
            dur = round(dur_s * FPS)
            lines.append({
                "text": text, "start": local, "dur": dur, "src": f"vo/{fid}/c{ci:02d}_l{li:02d}.mp3",
                "words": [{"w": w, "s": round(a * FPS), "e": round(b * FPS)} for w, a, b in words],
            })
            g0 = (cursor + local) / FPS
            srt.append((g0, g0 + dur_s, text))
            local += dur + LINE_GAP
        dur_total = local - LINE_GAP + tail
        chapters.append({"id": ch["id"], "name": ch["name"], "index": ci, "start": cursor, "dur": dur_total,
                         "illustrative": bool(ch.get("illustrative")), "lines": lines})
        sections.append({"start": cursor / FPS, "end": (cursor + dur_total) / FPS,
                         "intensity": INTENSITY.get(ch["id"], 1)})
        cursor += dur_total

    total_s = cursor / FPS
    music = f"music/{fid}_score.wav"
    sec_path = ROOT / "out" / f"{fid}.sections.json"
    sec_path.parent.mkdir(parents=True, exist_ok=True)
    sec_path.write_text(json.dumps({"total": total_s, "sections": sections}))
    (PUBLIC / "music").mkdir(parents=True, exist_ok=True)
    subprocess.run([sys.executable, str(ROOT / "pipeline" / "make_score.py"), str(sec_path), str(PUBLIC / music)], check=True)

    props = {"title": spec["title"], "music": music, "credit": credit, "chapters": chapters}
    props_path = ROOT / "out" / f"{fid}.props.json"
    props_path.write_text(json.dumps(props, indent=1))
    srt_path = ROOT / "out" / f"{fid}.srt"
    srt_path.write_text("\n".join(f"{i + 1}\n{srt_time(a)} --> {srt_time(b)}\n{t}\n" for i, (a, b, t) in enumerate(srt)))
    print(f"[{fid}] {len(chapters)} chapters, {total_s / 60:.2f} min -> {props_path}")
    if not render:
        return

    raw, out = ROOT / "out" / f"{fid}.raw.mp4", ROOT / "out" / f"{fid}.mp4"
    subprocess.run(["npx", "remotion", "render", spec.get("composition", "Film"), str(raw), f"--props={props_path}",
                    "--codec=h264", "--crf=16", "--concurrency=6", "--log=error"], cwd=STUDIO, check=True)
    subprocess.run(["npx", "remotion", "ffmpeg", "-loglevel", "error", "-y", "-i", str(raw), "-c:v", "copy",
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", str(out)],
                   cwd=STUDIO, check=True)
    raw.unlink()
    print(f"[{fid}] done -> {out}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--credit", default="")
    a = ap.parse_args()
    asyncio.run(build(Path(a.spec).resolve(), not a.no_render, a.credit))
