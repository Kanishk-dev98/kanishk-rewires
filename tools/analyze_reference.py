"""Break down a reference video: transcript + contact sheets of frames.

Works on a local file and/or a YouTube URL (transcript only for URLs).
Output goes to research/reference-videos/<slug>/.

Usage:
    python tools/analyze_reference.py <slug> [--video path.mp4] [--youtube URL_OR_ID] [--every 2]

Needs: pip install youtube-transcript-api imageio-ffmpeg
"""
import argparse
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def ffmpeg_exe() -> str:
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


def duration(ff: str, video: Path) -> float:
    out = subprocess.run([ff, "-hide_banner", "-i", str(video)], capture_output=True, text=True).stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def contact_sheets(video: Path, out_dir: Path, every: float, per_sheet: int = 16):
    ff = ffmpeg_exe()
    total = duration(ff, video)
    span = every * per_sheet
    out_dir.mkdir(parents=True, exist_ok=True)
    i, start = 0, 0.0
    while start < total:
        i += 1
        subprocess.run(
            [ff, "-loglevel", "error", "-y", "-ss", str(start), "-t", str(span), "-i", str(video),
             "-vf", f"fps=1/{every},scale=480:-1,tile=4x4", "-frames:v", "1", str(out_dir / f"sheet{i:02d}.jpg")],
            check=True,
        )
        start += span
    print(f"{i} contact sheets ({every}s/frame) -> {out_dir}")


def transcript(youtube: str, out: Path):
    from youtube_transcript_api import YouTubeTranscriptApi

    vid = re.search(r"(?:v=|youtu\.be/|shorts/)([\w-]{11})", youtube)
    vid = vid.group(1) if vid else youtube
    lines = YouTubeTranscriptApi().fetch(vid)
    out.write_text("\n".join(f"[{int(s.start) // 60}:{int(s.start) % 60:02d}] {s.text}" for s in lines))
    print(f"transcript ({len(lines)} lines) -> {out}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--video", type=Path)
    ap.add_argument("--youtube")
    ap.add_argument("--every", type=float, default=2.0, help="seconds between sampled frames")
    a = ap.parse_args()
    dest = ROOT / "research" / "reference-videos" / a.slug
    dest.mkdir(parents=True, exist_ok=True)
    if a.youtube:
        transcript(a.youtube, dest / "transcript.txt")
    if a.video:
        contact_sheets(a.video, dest / "frames", a.every)
    print("Next: read the sheets + transcript and write analysis.md (hook, pacing, scenes, style, what to borrow).")
