"""Licensed stock footage: search Pexels and Pixabay, preview candidates, download with provenance.

Adapted in spirit from MoneyPrinterTurbo's material search (MIT, github.com/harry0703/MoneyPrinterTurbo):
aspect filtering and a source record per clip. Keys come from .env (PEXELS_API_KEY, PIXABAY_API_KEY), never the CLI.

    .venv/bin/python -m pipeline.rewires.stock search "frog jumping" --project boiling-frog-business --orientation portrait
    .venv/bin/python -m pipeline.rewires.stock get pexels:29960564 --project boiling-frog-business --name frog_closeup
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path

from .config import PUBLIC, ROOT, ffmpeg

UA = "kanishk-rewires-stock/1.0"
LICENSES = {"pexels": "Pexels License (free to use, no attribution required)", "pixabay": "Pixabay Content License"}


def load_env() -> None:
    """Read KEY=value lines from the repo's .env into os.environ (without overriding)."""
    env = ROOT / ".env"
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


@dataclass
class Clip:
    source: str
    id: str
    page: str
    author: str
    duration: float
    width: int
    height: int
    file_url: str
    preview: str

    @property
    def key(self) -> str:
        return f"{self.source}:{self.id}"


def _get(url: str, headers: dict | None = None) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def _fits(w: int, h: int, orientation: str) -> bool:
    if orientation == "portrait":
        return h > w
    if orientation == "landscape":
        return w > h
    return True


def _best(files: list[tuple[int, int, str]], orientation: str) -> tuple[int, int, str] | None:
    """Pick the smallest file that is still at least 1080 on the short side; else the largest."""
    files = [f for f in files if f[2]]
    if not files:
        return None
    big = [f for f in files if min(f[0], f[1]) >= 1080]
    return min(big, key=lambda f: f[0] * f[1]) if big else max(files, key=lambda f: f[0] * f[1])


def search_pexels(q: str, orientation: str, n: int, min_dur: float) -> list[Clip]:
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    params = {"query": q, "per_page": min(80, n * 3), "size": "large"}
    if orientation != "any":
        params["orientation"] = orientation
    data = _get("https://api.pexels.com/videos/search?" + urllib.parse.urlencode(params), {"Authorization": key})
    out = []
    for v in data.get("videos", []):
        f = _best([(x.get("width") or 0, x.get("height") or 0, x.get("link") or "") for x in v.get("video_files", [])], orientation)
        if not f or not _fits(f[0], f[1], orientation) or v.get("duration", 0) < min_dur:
            continue
        out.append(Clip("pexels", str(v["id"]), v.get("url", ""), (v.get("user") or {}).get("name", ""), float(v.get("duration", 0)), f[0], f[1], f[2], v.get("image", "")))
    return out[:n]


def search_pixabay(q: str, orientation: str, n: int, min_dur: float) -> list[Clip]:
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        return []
    data = _get("https://pixabay.com/api/videos/?" + urllib.parse.urlencode({"key": key, "q": q, "per_page": min(200, max(3, n * 3)), "safesearch": "true"}))
    out = []
    for v in data.get("hits", []):
        vids = v.get("videos", {})
        f = _best([(x.get("width") or 0, x.get("height") or 0, x.get("url") or "") for x in vids.values()], orientation)
        if not f or not _fits(f[0], f[1], orientation) or v.get("duration", 0) < min_dur:
            continue
        thumb = (vids.get("medium") or {}).get("thumbnail", "")
        out.append(Clip("pixabay", str(v["id"]), v.get("pageURL", ""), v.get("user", ""), float(v.get("duration", 0)), f[0], f[1], f[2], thumb))
    return out[:n]


def search(q: str, orientation: str = "portrait", n: int = 6, min_dur: float = 4.0, sources: tuple[str, ...] = ("pexels", "pixabay")) -> list[Clip]:
    load_env()
    if not any(os.environ.get(k) for k in ("PEXELS_API_KEY", "PIXABAY_API_KEY")):
        raise SystemExit("No stock keys: add PEXELS_API_KEY and/or PIXABAY_API_KEY to .env (see .env.example).")
    clips: list[Clip] = []
    if "pexels" in sources:
        clips += search_pexels(q, orientation, n, min_dur)
    if "pixabay" in sources:
        clips += search_pixabay(q, orientation, n, min_dur)
    return clips


def _cache(project: str) -> Path:
    p = ROOT / "projects" / project / "assets" / "stock"
    p.mkdir(parents=True, exist_ok=True)
    return p


def board(project: str, q: str, clips: list[Clip]) -> Path:
    """Download each candidate's poster frame and tile them into one labelled contact sheet."""
    d = _cache(project) / "candidates"
    d.mkdir(exist_ok=True)
    tiles = []
    for c in clips:
        if not c.preview:
            continue
        t = d / f"{c.source}_{c.id}.jpg"
        if not t.exists():
            req = urllib.request.Request(c.preview, headers={"User-Agent": UA})
            t.write_bytes(urllib.request.urlopen(req, timeout=30).read())
        tiles.append((t, c))
    if not tiles:
        return d
    out = d / f"board_{''.join(ch if ch.isalnum() else '_' for ch in q)[:40]}.jpg"
    args = [ffmpeg(), "-v", "error", "-y"]
    for t, _ in tiles:
        args += ["-i", str(t)]
    labels = []
    for i, (_, c) in enumerate(tiles):
        txt = f"{c.key}  {c.width}x{c.height}  {c.duration:.0f}s".replace(":", r"\:")
        labels.append(f"[{i}:v]scale=360:640:force_original_aspect_ratio=decrease,pad=360:680:(ow-iw)/2:0:black,drawtext=text='{txt}':x=8:y=648:fontsize=16:fontcolor=white[v{i}]")
    cols = min(4, len(tiles))
    rows = (len(tiles) + cols - 1) // cols
    layout = "|".join(f"{(i % cols) * 360}_{(i // cols) * 680}" for i in range(len(tiles)))
    fc = ";".join(labels) + ";" + "".join(f"[v{i}]" for i in range(len(tiles))) + (f"xstack=inputs={len(tiles)}:layout={layout}:fill=black" if len(tiles) > 1 else "null")
    subprocess.run(args + ["-filter_complex", fc, "-frames:v", "1", str(out)], check=True)
    _ = rows
    return out


def get(key: str, project: str, name: str, clips_json: Path | None = None) -> Path:
    """Download one clip into studio/public/media/<project>/ and append its provenance."""
    load_env()
    source, cid = key.split(":", 1)
    if source == "pexels":
        v = _get(f"https://api.pexels.com/videos/videos/{cid}", {"Authorization": os.environ["PEXELS_API_KEY"]})
        f = _best([(x.get("width") or 0, x.get("height") or 0, x.get("link") or "") for x in v.get("video_files", [])], "any")
        clip = Clip("pexels", cid, v.get("url", ""), (v.get("user") or {}).get("name", ""), float(v.get("duration", 0)), f[0], f[1], f[2], v.get("image", ""))
    elif source == "pixabay":
        v = _get("https://pixabay.com/api/videos/?" + urllib.parse.urlencode({"key": os.environ["PIXABAY_API_KEY"], "id": cid}))["hits"][0]
        f = _best([(x.get("width") or 0, x.get("height") or 0, x.get("url") or "") for x in v.get("videos", {}).values()], "any")
        clip = Clip("pixabay", cid, v.get("pageURL", ""), v.get("user", ""), float(v.get("duration", 0)), f[0], f[1], f[2], "")
    else:
        raise SystemExit(f"unknown source {source!r}")
    dest_dir = PUBLIC / "media" / project
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{name}.mp4"
    req = urllib.request.Request(clip.file_url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300) as r, open(dest, "wb") as fh:
        while chunk := r.read(1 << 20):
            fh.write(chunk)
    prov_path = dest_dir / "PROVENANCE.json"
    prov = json.loads(prov_path.read_text()) if prov_path.exists() else {}
    rec = asdict(clip)
    rec.pop("preview", None)
    rec["license"] = LICENSES[source]
    prov[dest.name] = rec
    prov_path.write_text(json.dumps(prov, indent=2))
    return dest


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(prog="stock", description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("search", help="search and build a contact sheet of candidates")
    s.add_argument("query")
    s.add_argument("--project", required=True)
    s.add_argument("--orientation", choices=["portrait", "landscape", "any"], default="portrait")
    s.add_argument("-n", type=int, default=6, help="max candidates per source")
    s.add_argument("--min-duration", type=float, default=4.0)
    s.add_argument("--source", action="append", choices=["pexels", "pixabay"])
    g = sub.add_parser("get", help="download one clip (source:id) with provenance")
    g.add_argument("key")
    g.add_argument("--project", required=True)
    g.add_argument("--name", required=True)
    a = ap.parse_args(argv)
    if a.cmd == "search":
        clips = search(a.query, a.orientation, a.n, a.min_duration, tuple(a.source or ("pexels", "pixabay")))
        for c in clips:
            print(f"{c.key:22s} {c.width}x{c.height:<5d} {c.duration:5.1f}s  {c.author[:24]:24s} {c.page}")
        if clips:
            print("board:", board(a.project, a.query, clips))
        else:
            print("no matches", file=sys.stderr)
    else:
        print(get(a.key, a.project, a.name))


if __name__ == "__main__":
    main()
