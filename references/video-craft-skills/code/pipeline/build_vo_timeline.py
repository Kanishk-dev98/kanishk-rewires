"""VO-first timeline builder (template). Script JSON in, Remotion props JSON out.

1. Voice every line with Edge TTS (free, no key) and collect WordBoundary timings; clean each line with VO_CHAIN
   (high-pass, de-ess, soft top, a little low warmth, gentle compression) into a 48 kHz mono wav.
2. Lay the scenes out from the speech: lead-in, gaps, tail; every scene length rounds UP to whole beats, so every
   cut lands on the beat grid (120 BPM = 15 f/beat at 30 fps is the default).
3. Compute named cue frames once (hits, drops, reveals) from scene starts / line starts / line ends / words, and
   assert the guards (no spoken word within N frames after a hit).
4. Write <project>/out/<tag>.props.json (composition props) and <tag>.cues.json (seconds, for a score generator).
5. Optionally run a score command, run mix_check.py, render, and master (master.py).

Script JSON (see the example at the bottom of this file, or run with --example):
{
  "tag": "myfilm", "composition": "Film",
  "voice": "en-US-AvaMultilingualNeural", "rate": "-9%", "fpb": 15,
  "mix": {"musicUnderVo": 0.12, "musicBetween": 0.5, "sfxUnderVo": 0.2, "sfxBetween": 0.75},
  "scenes": [ {"id": "open", "lead": 30, "tail": 10, "lines": [["First line.", 0], ["Second line.", 20]]}, ... ],
  "cues": { "hit": {"scene": "turn", "at": "start", "offset": 0},
            "reveal": {"scene": "turn", "line": 0, "at": "word", "word": "every"} },
  "guards": [ {"cue": "hit", "scene": "turn", "line": 0, "min": 20} ]
}
cue "at": "start" (scene start) | "lineStart" | "lineEnd" | "word" (word start) | "wordEnd"; offset in frames.

Usage:
  python build_vo_timeline.py script.json --project <remotion dir> [--score "python make_score.py {cues} {wav}"]
                              [--no-mix] [--render] [--out NAME] [--entry src/index.ts]
"""
import argparse
import asyncio
import json
import math
import shlex
import subprocess
import sys
from pathlib import Path

import edge_tts
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
FPS = 30
VO_CHAIN = (
    "highpass=f=85,deesser=i=0.55:m=0.6:f=0.5,highshelf=f=7200:g=-4.5,"
    "equalizer=f=3200:t=q:w=1.2:g=-1.5,lowshelf=f=180:g=1.5,"
    "acompressor=threshold=-20dB:ratio=2.4:attack=6:release=140:makeup=2"
)
EXAMPLE = {
    "tag": "example",
    "composition": "Film",
    "voice": "en-US-AvaMultilingualNeural",
    "rate": "-9%",
    "fpb": 15,
    "mix": {"musicUnderVo": 0.12, "musicBetween": 0.5, "sfxUnderVo": 0.2, "sfxBetween": 0.75},
    "scenes": [
        {"id": "open", "lead": 30, "tail": 10, "lines": [["Every team approves spending by hand.", 0], ["It is slow, and it still misses things.", 24]]},
        {"id": "turn", "lead": 30, "tail": 20, "lines": [["Now every request is checked before it moves.", 0]]},
        {"id": "end", "lead": 12, "tail": 60, "lines": [["Start free at example dot com.", 0]]},
    ],
    "cues": {"hit": {"scene": "turn", "at": "start", "offset": 0}, "checked": {"scene": "turn", "line": 0, "at": "word", "word": "checked"}},
    "guards": [{"cue": "hit", "scene": "turn", "line": 0, "min": 20}],
}


async def tts(text: str, voice: str, rate: str, raw: Path, out: Path):
    """Voice one line; return word timings (s) relative to the file start. Then clean it into a wav."""
    for attempt in range(5):
        try:
            comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
            audio, words = bytearray(), []
            async for ch in comm.stream():
                if ch["type"] == "audio":
                    audio += ch["data"]
                elif ch["type"] == "WordBoundary":
                    words.append((ch["text"], ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7))
            if not words:
                raise RuntimeError("no word boundaries")
            break
        except Exception:  # transient network errors from the TTS service
            if attempt == 4:
                raise
            await asyncio.sleep(2 + attempt * 2)
    raw.write_bytes(bytes(audio))
    subprocess.run([FF, "-v", "error", "-y", "-i", str(raw), "-af", VO_CHAIN, "-ar", "48000", "-ac", "1", str(out)], check=True)
    return words


async def build(spec: dict, project: Path):
    tag, fpb = spec["tag"], int(spec.get("fpb", 15))
    vo_dir = project / "public" / "vo" / tag
    vo_dir.mkdir(parents=True, exist_ok=True)
    jobs = [(sc["id"], i, line[0]) for sc in spec["scenes"] for i, line in enumerate(sc["lines"])]
    sem = asyncio.Semaphore(4)

    async def one(sid, i, text):
        async with sem:
            return await tts(text, spec.get("voice", "en-US-AvaMultilingualNeural"), spec.get("rate", "-9%"), vo_dir / f"{sid}_{i}.mp3", vo_dir / f"{sid}_{i}.wav")

    res = await asyncio.gather(*(one(*j) for j in jobs))
    words_of = {(sid, i): w for (sid, i, _), w in zip(jobs, res)}

    scenes, vo, cursor, nwords = [], [], 0, 0
    for sc in spec["scenes"]:
        t = int(sc.get("lead", 12))
        lines = []
        for i, (text, gap) in enumerate(sc["lines"]):
            t += int(gap)
            w = words_of[(sc["id"], i)]
            nwords += len(w)
            s0, s1 = w[0][1], w[-1][2]
            d = round((s1 - s0) * FPS)
            lines.append({"at": t, "end": t + d, "text": text, "words": [{"w": x[0], "t": t + round((x[1] - s0) * FPS), "e": t + round((x[2] - s0) * FPS)} for x in w]})
            vo.append({"src": f"vo/{tag}/{sc['id']}_{i}.wav", "at": cursor + t - round(s0 * FPS), "speech": [cursor + t, cursor + t + d]})
            t += d
        dur = int(math.ceil((t + int(sc.get("tail", 12))) / fpb) * fpb)  # whole beats: every cut on the grid
        scenes.append({"id": sc["id"], "from": cursor, "dur": dur, "lines": lines})
        cursor += dur
    S = {s["id"]: s for s in scenes}

    def cue(c: dict) -> int:
        s = S[c["scene"]]
        at = c.get("at", "start")
        if at == "start":
            base = s["from"]
        else:
            line = s["lines"][c.get("line", 0)]
            if at == "lineStart":
                base = s["from"] + line["at"]
            elif at == "lineEnd":
                base = s["from"] + line["end"]
            else:
                pre = c["word"].lower()
                hit = next((w for w in line["words"] if w["w"].lower().strip(".,:?!'\"").startswith(pre)), None)
                if not hit:
                    raise KeyError(f"{c['scene']}[{c.get('line', 0)}] has no word starting {pre!r}")
                base = s["from"] + (hit["e"] if at == "wordEnd" else hit["t"])
        return base + int(c.get("offset", 0))

    cues = {k: cue(v) for k, v in spec.get("cues", {}).items()}
    for g in spec.get("guards", []):
        s = S[g["scene"]]
        start = s["from"] + s["lines"][g.get("line", 0)]["at"]
        gap = start - cues[g["cue"]]
        assert gap >= int(g.get("min", 20)), f"a word would sit on the {g['cue']!r} hit ({gap} f after it; need >= {g.get('min', 20)})"

    out = project / "out"
    out.mkdir(exist_ok=True)
    music = f"music/{tag}_score.wav" if (project / "public" / "music" / f"{tag}_score.wav").exists() or spec.get("music") else None
    props = {"music": spec.get("music", music), "totalFrames": cursor, "scenes": scenes, "vo": vo, "mix": spec.get("mix"), "cues": cues}
    props_path = out / f"{tag}.props.json"
    props_path.write_text(json.dumps(props, indent=1))
    cmap = {
        "bpm": FPS * 60 / fpb,
        "fpb": fpb,
        "total": cursor / FPS,
        "scenes": {s["id"]: [s["from"] / FPS, (s["from"] + s["dur"]) / FPS] for s in scenes},
        "events": {k: v / FPS for k, v in cues.items()},
        "speech": [[l["speech"][0] / FPS, l["speech"][1] / FPS] for l in vo],
    }
    cues_path = out / f"{tag}.cues.json"
    cues_path.write_text(json.dumps(cmap, indent=1))
    for s in scenes:
        print(f"{s['id']:10} {s['from'] / FPS:6.2f}s  {s['dur'] / FPS:5.2f}s  lines at {[round((s['from'] + l['at']) / FPS, 2) for l in s['lines']]}")
    speech_s = sum(l["speech"][1] - l["speech"][0] for l in vo) / FPS or 1
    print(f"total {cursor / FPS:.2f}s ({cursor} f) · {nwords} words · {nwords / speech_s * 60:.0f} wpm in-line · {nwords / (cursor / FPS) * 60:.0f} wpm over runtime")
    print("cues", {k: f"{v / FPS:.2f}s" for k, v in cues.items()})
    return props_path, cues_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script", nargs="?")
    ap.add_argument("--project", default=".", help="Remotion project dir")
    ap.add_argument("--entry", default="src/index.ts")
    ap.add_argument("--score", help='score command; {cues} and {wav} are substituted, e.g. "python make_score.py {cues} {wav}"')
    ap.add_argument("--no-mix", action="store_true")
    ap.add_argument("--render", action="store_true")
    ap.add_argument("--out", help="output name for the render (default: tag)")
    ap.add_argument("--example", action="store_true", help="print an example script JSON and exit")
    a = ap.parse_args()
    if a.example or not a.script:
        print(json.dumps(EXAMPLE, indent=1))
        return
    spec = json.loads(Path(a.script).read_text())
    project = Path(a.project).resolve()
    props_path, cues_path = asyncio.run(build(spec, project))
    here = Path(__file__).resolve().parent
    if a.score:
        wav = project / "public" / "music" / f"{spec['tag']}_score.wav"
        wav.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(shlex.split(a.score.format(cues=cues_path, wav=wav)), check=True)
        props = json.loads(props_path.read_text())
        props["music"] = f"music/{spec['tag']}_score.wav"
        props_path.write_text(json.dumps(props, indent=1))
    comp = spec.get("composition", "Film")
    if not a.no_mix:
        subprocess.run([sys.executable, str(here / "mix_check.py"), comp, str(props_path), "--project", str(project), "--entry", a.entry], check=True)
    if a.render:
        sys.path.insert(0, str(here))
        from master import master, render_raw  # noqa: E402

        name = a.out or spec["tag"]
        raw, final = project / "out" / f"{name}.raw.mp4", project / "out" / f"{name}.mp4"
        render_raw(project, a.entry, comp, props_path, raw)
        master(raw, final)
        print(f"done -> {final}")


if __name__ == "__main__":
    main()
