"""Build one reel from a spec: voiceover -> timeline sync -> Remotion render.

Usage:
    python build_reel.py ../reels/statrace_100m.json
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
MIN_TOTAL = 30 * FPS  # reels must be at least 30s
MUSIC = "music/soft_pad.wav"


async def tts(text: str, voice: str, rate: str, path: Path) -> float:
    path.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text, voice, rate=rate).save(str(path))
    return MP3(str(path)).info.length


def frames(seconds: float, pad: int, minimum: int) -> int:
    return max(minimum, round(seconds * FPS) + pad)


async def build(spec_path: Path) -> Path:
    spec = json.loads(spec_path.read_text())
    rid, voice, rate, vo = spec["id"], spec["voice"], spec.get("rate", "+0%"), spec["vo"]
    vo_dir = PUBLIC / "vo" / rid

    async def seg(name: str, text: str):
        dur = await tts(text, voice, rate, vo_dir / f"{name}.mp3")
        return f"vo/{rid}/{name}.mp3", dur

    hook, title, reveal, cta = await asyncio.gather(
        seg("hook", vo["hook"]), seg("title", vo["title"]),
        seg("reveal", vo["reveal"]), seg("cta", vo["cta"]),
    )
    items = await asyncio.gather(*(seg(f"item{i}", t) for i, t in enumerate(vo["items"])))

    timing = {
        "hookFrames": frames(hook[1], 12, 75),
        "titleFrames": frames(title[1], 6, 45),
        "itemFrames": [frames(d, 4, 36) for _, d in items],
        "revealFrames": frames(reveal[1], 45, 150),
        "ctaFrames": frames(cta[1], 40, 90),
    }
    total = (timing["hookFrames"] + timing["titleFrames"] + sum(timing["itemFrames"])
             + timing["revealFrames"] + timing["ctaFrames"])
    if total < MIN_TOTAL:
        timing["revealFrames"] += MIN_TOTAL - total
        total = MIN_TOTAL

    props = {
        **spec["props"],
        "timing": timing,
        "audio": {
            "hook": hook[0], "title": title[0], "reveal": reveal[0], "cta": cta[0],
            "items": [p for p, _ in items], "music": MUSIC,
        },
    }
    props_path = ROOT / "out" / f"{rid}.props.json"
    props_path.parent.mkdir(parents=True, exist_ok=True)
    props_path.write_text(json.dumps(props, indent=2))

    raw = ROOT / "out" / f"{rid}.raw.mp4"
    out = ROOT / "out" / f"{rid}.mp4"
    print(f"[{rid}] {total / FPS:.1f}s, rendering...")
    subprocess.run(
        ["npx", "remotion", "render", spec["template"], str(raw),
         f"--props={props_path}", "--codec=h264", "--log=error"],
        cwd=STUDIO, check=True,
    )
    # Normalize to Instagram's ~-14 LUFS so the reel isn't quieter than the feed.
    subprocess.run(
        ["npx", "remotion", "ffmpeg", "-loglevel", "error", "-y", "-i", str(raw),
         "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
         str(out)],
        cwd=STUDIO, check=True,
    )
    raw.unlink()
    print(f"[{rid}] done -> {out}")
    return out


if __name__ == "__main__":
    if not (PUBLIC / MUSIC).exists():
        (PUBLIC / "music").mkdir(parents=True, exist_ok=True)
        subprocess.run([sys.executable, str(ROOT / "pipeline" / "make_music.py"), str(PUBLIC / MUSIC), "60"], check=True)
    asyncio.run(build(Path(sys.argv[1]).resolve()))
