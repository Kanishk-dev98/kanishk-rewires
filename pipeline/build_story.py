"""Build a multi-scene "Story" reel: per-scene voiceover + word captions -> render.

Usage:
    python build_story.py ../reels/race_100m_cinematic.json
"""
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
MUSIC = "music/soft_pad.wav"

# Visual breathing room after each scene's narration (frames), and minimum scene length.
PAD = {"slam": 10, "title": 20, "app": 8, "race": 30, "buildup": 18, "reveal": 40, "cta": 60}
MIN = {"slam": 60, "app": 75, "reveal": 150, "cta": 105}


async def tts(text, voice, rate, path):
    """Save speech to `path`; return (duration_s, [(word, start_ms, end_ms)])."""
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    audio, words = bytearray(), []
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            start = chunk["offset"] / 10_000
            words.append((chunk["text"], start, start + chunk["duration"] / 10_000))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(bytes(audio))
    return MP3(str(path)).info.length, words


async def build(spec_path: Path, render: bool = True):
    spec = json.loads(spec_path.read_text())
    rid = spec["id"]
    results = await asyncio.gather(*(
        tts(s["vo"], spec["voice"], spec.get("rate", "+0%"), PUBLIC / "vo" / rid / f"s{i:02d}.mp3")
        for i, s in enumerate(spec["scenes"])
    ))

    scenes, captions, start = [], [], 0
    for i, (s, (dur, words)) in enumerate(zip(spec["scenes"], results)):
        frames = max(MIN.get(s["type"], 45), round(dur * FPS) + PAD.get(s["type"], 12))
        data = dict(s["data"])
        # Land the scene's big moment on the frame its key word is spoken.
        if "syncWord" in data:
            key = data["syncWord"].lower()
            hit = next((a for w, a, _ in words if w.lower().strip(".,?!") == key), None)
            data["syncFrame"] = round(hit / 1000 * FPS) if hit is not None else 8
        scenes.append({"type": s["type"], "dur": frames, "vo": f"vo/{rid}/s{i:02d}.mp3", "data": data})
        offset_ms = start / FPS * 1000
        captions += [{"text": w, "startMs": offset_ms + a, "endMs": offset_ms + b} for w, a, b in words]
        start += frames

    props = {
        "handle": spec["handle"], "accent": spec["accent"], "source": spec["source"],
        "music": MUSIC, "scenes": scenes, "captions": captions,
    }
    props_path = ROOT / "out" / f"{rid}.props.json"
    props_path.parent.mkdir(parents=True, exist_ok=True)
    props_path.write_text(json.dumps(props, indent=2))
    print(f"[{rid}] {len(scenes)} scenes, {start / FPS:.1f}s -> {props_path}")
    if not render:
        return

    raw, out = ROOT / "out" / f"{rid}.raw.mp4", ROOT / "out" / f"{rid}.mp4"
    subprocess.run(["npx", "remotion", "render", spec["template"], str(raw), f"--props={props_path}",
                    "--codec=h264", "--crf=16", "--log=error"], cwd=STUDIO, check=True)
    subprocess.run(["npx", "remotion", "ffmpeg", "-loglevel", "error", "-y", "-i", str(raw), "-c:v", "copy",
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", str(out)],
                   cwd=STUDIO, check=True)
    raw.unlink()
    print(f"[{rid}] done -> {out}")


if __name__ == "__main__":
    asyncio.run(build(Path(sys.argv[1]).resolve(), render="--no-render" not in sys.argv))
