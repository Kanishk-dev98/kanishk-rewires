"""Paths and the central brand / production configuration."""
import json
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STUDIO = ROOT / "studio"
PUBLIC = STUDIO / "public"
PROJECTS = ROOT / "projects"
CONFIG = ROOT / "config"


@lru_cache(maxsize=None)
def brand() -> dict:
    return json.loads((CONFIG / "brand.config.json").read_text())


@lru_cache(maxsize=None)
def production() -> dict:
    return json.loads((CONFIG / "production.config.json").read_text())


def ffmpeg() -> str:
    """Full static ffmpeg (with every filter QC needs), from imageio-ffmpeg."""
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


def ffprobe() -> list[str]:
    """Remotion's bundled ffprobe, run through its CLI (which sets up the library path)."""
    if not (STUDIO / "node_modules" / "@remotion").exists():
        raise FileNotFoundError("Remotion is not installed; run `npm install` in studio/")
    return ["npx", "--prefix", str(STUDIO), "remotion", "ffprobe"]
