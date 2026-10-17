"""Kanishk.Rewires production pipeline: one command, real stages, resumable.

    .venv/bin/python -m pipeline.rewires.produce new <slug> --topic "..."
    .venv/bin/python -m pipeline.rewires.produce run <slug> [--from STAGE] [--stills] [--open]
    .venv/bin/python -m pipeline.rewires.produce status <slug>

Stages A to C (intake, research, brief) and the writing in D and E (script, storyboard)
are creative work done by the agent in the project folder; this tool verifies them.
Stages F to J (assets, edit, render, QC, delivery) are fully automated.
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

from . import config, music, qc, render, storyboard, timing, voice
from .manifest import STAGE_IDS, STAGES, Manifest


class Blocked(Exception):
    pass


def _nonempty(p: Path, min_bytes=40) -> bool:
    return p.exists() and p.stat().st_size >= min_bytes


def _versioned(renders: Path, slug: str) -> Path:
    n = 1
    while (renders / f"{slug}_v{n}.mp4").exists():
        n += 1
    return renders / f"{slug}_v{n}.mp4"


class Production:
    def __init__(self, slug: str, args):
        self.slug = slug
        self.dir = config.PROJECTS / slug
        if not (self.dir / "manifest.json").exists():
            raise Blocked(f"no project {slug!r}; create it with `produce new {slug} --topic ...`")
        self.m = Manifest(self.dir)
        self.args = args
        self.prod = config.production()
        self.public_prefix = f"projects/{slug}"
        self.public = config.PUBLIC / self.public_prefix

    # ---- A to E: verify the creative work
    def research(self):
        src = storyboard.load_sources(self.dir)
        sb_path = self.dir / "storyboard" / "storyboard.json"
        not_needed = sb_path.exists() and json.loads(sb_path.read_text()).get("research") == "not-needed"
        if not src.get("claims") and not not_needed:
            raise Blocked("research/sources.json has no claims (or set \"research\": \"not-needed\" in the storyboard)")
        (self.dir / "research" / "sources.md").write_text(storyboard.sources_markdown(src))
        return f"{len(src.get('claims', []))} claims in the ledger", ["research/sources.json", "research/sources.md"]

    def brief(self):
        if not _nonempty(self.dir / "brief" / "brief.md", 200):
            raise Blocked("brief/brief.md is missing or too short")
        return "brief present", ["brief/brief.md"]

    def script(self):
        sb = self._sb()
        missing = [s["id"] for s in sb["scenes"] if not s.get("vo", "").strip()]
        if missing:
            raise Blocked(f"scenes without narration: {missing}")
        words = sum(len(s["vo"].split()) for s in sb["scenes"])
        (self.dir / "script" / "script.md").write_text(storyboard.script_markdown(sb, None, storyboard.load_sources(self.dir)))
        return f"{words} narration words (~{words / 2.6:.0f} s at a natural pace)", ["script/script.md"]

    def storyboard(self):
        sb = self._sb()
        errors, warnings = storyboard.validate(sb, storyboard.load_sources(self.dir))
        for w in warnings:
            print(f"  warning: {w}")
        if errors:
            raise Blocked("storyboard has errors:\n  " + "\n  ".join(errors))
        return f"{len(sb['scenes'])} scenes valid, {len(warnings)} warnings", ["storyboard/storyboard.json"]

    # ---- F: assets
    def assets(self):
        sb = self._sb()
        vcfg = {**self.prod["voice"], **sb.get("voice", {})}
        prov = voice.provider(vcfg)
        vo_dir = self.dir / "audio" / "vo"
        res = prov.synthesize([(s["id"], s["vo"]) for s in sb["scenes"]], vo_dir)
        (self.public / "vo").mkdir(parents=True, exist_ok=True)
        for sid, (path, dur, words, cached) in res.items():
            if dur <= 0.2 or not words:
                raise Blocked(f"narration for {sid} is empty or has no word timings")
            shutil.copy2(path, self.public / "vo" / path.name)
            self.m.record_asset("voiceover", f"audio/vo/{path.name}", prov.name, cached=cached, seconds=round(dur, 2),
                                settings=getattr(prov, "settings", {}), licence="Edge TTS output, personal use" if prov.name == "edge" else "own recording")
        (self.dir / "audio" / "vo_index.json").write_text(json.dumps({k: [str(v[0]), v[1], v[2]] for k, v in res.items()}))
        cached = sum(1 for v in res.values() if v[3])
        return f"{len(res)} narration clips ({cached} reused from cache)", ["audio/vo/"]

    # ---- G: edit (timeline, captions, music)
    def edit(self):
        sb = self._sb()
        idx = json.loads((self.dir / "audio" / "vo_index.json").read_text())
        vo = {k: (Path(p), d, [tuple(w) for w in ws], True) for k, (p, d, ws) in idx.items()}
        tl = timing.build(sb, vo, self.prod, f"{self.public_prefix}/vo")
        fps = self.prod["fps"]
        (self.dir / "timeline" / "timeline.json").write_text(json.dumps(tl, indent=2))
        (self.dir / "captions" / f"{self.slug}.srt").write_text(timing.srt(tl["captions"]))
        (self.dir / "captions" / "captions.json").write_text(json.dumps(tl["captions"], indent=2))

        body = tl["bodyFrames"] / fps
        outro_s = timing.outro_frames(sb, self.prod) / fps
        if tl.get("fitWarning"):
            print(f"  warning: {tl['fitWarning']}")
        music.write_wav(music.score(body, tl["sections"], tl["hits"]), self.dir / "audio" / "music.wav")
        music.write_wav(music.signature(outro_s), self.dir / "audio" / "signature.wav")
        for f in ("music.wav", "signature.wav"):
            shutil.copy2(self.dir / "audio" / f, self.public / f)
            self.m.record_asset("music", f"audio/{f}", "pipeline/rewires/music.py", licence="original, generated in code")

        props = render.write_props(tl, sb, self.prod, self.public_prefix, self.dir / "timeline" / "props.json")
        (self.dir / "script" / "script.md").write_text(storyboard.script_markdown(sb, tl, storyboard.load_sources(self.dir)))
        outs = ["timeline/timeline.json", "timeline/props.json", f"captions/{self.slug}.srt", "audio/music.wav", "audio/signature.wav"]
        if self.args.stills:
            outs.append(self.stills(tl, props))
        return f"{len(tl['scenes'])} scenes, body {body:.1f} s + outro {outro_s:.1f} s, {len(tl['captions'])} caption words", outs

    def stills(self, tl, props) -> str:
        """Styleframes: each scene at its key moment, tiled into a board."""
        fdir = self.dir / "storyboard" / "frames"
        fdir.mkdir(exist_ok=True)
        start, jobs = 0, []
        for s in tl["scenes"]:
            key = max(s["data"].get("syncFrame", 0), *(s["data"].get("syncFrames") or [0]), *(s["data"].get("cues") or {}).values(), 0)
            f = start + min(s["dur"] - 1, max(key + 24, int(s["dur"] * 0.8)))
            jobs.append((fdir / f"{s['id']}.png", f))
            start += s["dur"]
        jobs.append((fdir / "outro.png", tl["bodyFrames"] + timing.outro_frames(self._sb(), self.prod) - 1))
        procs = [subprocess.Popen(["npx", "remotion", "still", "Rewires", str(p), f"--props={props}", f"--frame={f}", "--log=error", "--gl=angle"], cwd=config.STUDIO) for p, f in jobs]
        if any(pr.wait() for pr in procs):
            raise Blocked("styleframe render failed")
        inputs = sum((["-i", str(p)] for p, _ in jobs), [])
        n = len(jobs)
        cols = min(n, 6)
        layout ="|".join(f"{'+'.join(['w0'] * (i % cols)) or '0'}_{'+'.join(['h0'] * (i // cols)) or '0'}" for i in range(n))
        subprocess.run([config.ffmpeg(), "-loglevel", "error", "-y", *inputs, "-filter_complex",
                        f"xstack=inputs={n}:layout={layout}:fill=0x1F1F1F,scale=1800:-1", str(self.dir / "storyboard" / "board.png")], check=True)
        return "storyboard/board.png"

    # ---- H: render
    def render(self):
        props = self.dir / "timeline" / "props.json"
        raw = self.dir / "renders" / f"{self.slug}.raw.mp4"
        render.render(props, raw, self.prod, override=self._sb().get("render"))
        out = _versioned(self.dir / "renders", self.slug)
        render.master(raw, out, self.prod)
        raw.unlink()
        if not _nonempty(out, 100_000):
            raise Blocked("render produced no usable file")
        self.m.data["versions"].append({"file": f"renders/{out.name}", "at": __import__("datetime").datetime.now().isoformat(timespec="seconds")})
        self.m.save()
        return f"{out.name} ({out.stat().st_size / 1e6:.1f} MB)", [f"renders/{out.name}"]

    # ---- I: QC
    def qc(self):
        video = self._latest()
        tl = json.loads((self.dir / "timeline" / "timeline.json").read_text())
        rep = qc.run(video, tl, self._sb(), self.dir / "reports")
        failed = [c for c in rep["checks"] if not c["ok"] and c["severity"] == "error"]
        for c in rep["checks"]:
            print(f"  {'ok  ' if c['ok'] else c['severity'].upper():8} {c['check']}: {c['detail']}")
        if failed:
            raise Blocked(f"QC failed: {[c['check'] for c in failed]} (see reports/qc.md)")
        return f"{video.name} passed {len(rep['checks'])} checks", ["reports/qc.md", "reports/contact_sheet.png"]

    # ---- J: delivery
    def delivery(self):
        video = self._latest()
        sb = self._sb()
        tl = json.loads((self.dir / "timeline" / "timeline.json").read_text())
        rep = json.loads((self.dir / "reports" / "qc.json").read_text())
        lines = [
            f"# Production report: {sb.get('title', self.slug)}", "",
            f"- Video: `renders/{video.name}`", f"- Captions: `captions/{self.slug}.srt`",
            "- Script and storyboard: `script/script.md`, `storyboard/storyboard.json`",
            "- Sources: `research/sources.md`", "- Editable timeline: `timeline/props.json` (Remotion composition `Rewires`)", "",
            "## Stages", "",
        ]
        lines += [f"- {label}: {self.m.data['stages'][sid].get('status')} · {self.m.data['stages'][sid].get('note', '')}" for sid, label in STAGES]
        lines += ["", "## Assets and provenance", ""] + [f"- {a['kind']}: `{a['path']}` via {a['provider']} ({a.get('licence', 'n/a')})" for a in self.m.data["assets"]]
        lines += ["", "## QC", ""] + [f"- {c['check']}: {'ok' if c['ok'] else c['severity']} ({c['detail']})" for c in rep["checks"]]
        lines += ["", f"Scenes: {len(tl['scenes'])}. Still needs human review: " + ", ".join(rep["needsHumanReview"]) + "."]
        (self.dir / "reports" / "production_report.md").write_text("\n".join(lines) + "\n")
        outs = ["reports/production_report.md"]
        if not self.args.no_downloads:
            dest = Path.home() / "Downloads" / "Kanishk.Rewires" / self.slug
            dest.mkdir(parents=True, exist_ok=True)
            for f in (video, self.dir / "captions" / f"{self.slug}.srt", self.dir / "script" / "script.md",
                      self.dir / "research" / "sources.md", self.dir / "reports" / "contact_sheet.png", self.dir / "reports" / "production_report.md"):
                if f.exists():
                    shutil.copy2(f, dest / f.name)
            outs.append(str(dest))
            if self.args.open:
                subprocess.run(["open", str(dest / video.name)])
        return f"delivered {video.name}", outs

    # ---- helpers
    def _sb(self):
        p = self.dir / "storyboard" / "storyboard.json"
        if not p.exists():
            raise Blocked("storyboard/storyboard.json is missing")
        return json.loads(p.read_text())

    def _latest(self) -> Path:
        vids = sorted((self.dir / "renders").glob(f"{self.slug}_v*.mp4"), key=lambda p: int(p.stem.rsplit("_v", 1)[1]))
        if not vids:
            raise Blocked("no rendered video yet")
        return vids[-1]

    def run(self, start: str | None, only: str | None, until: str | None = None):
        if start:
            self.m.reset_from(start)
        stages = [only] if only else STAGE_IDS
        for sid in stages:
            if sid == "intake" or (not only and self.m.status(sid) == "done"):
                continue
            print(f"[{self.slug}] {dict(STAGES)[sid]}")
            try:
                note, outputs = getattr(self, sid)()
            except Blocked as e:
                self.m.mark(sid, "blocked", note=str(e))
                print(f"  BLOCKED: {e}")
                return 1
            self.m.mark(sid, "done", note=note, outputs=outputs)
            print(f"  done: {note}")
            if sid == until:
                break
        return 0


def main(argv=None):
    ap = argparse.ArgumentParser(prog="produce")
    sub = ap.add_subparsers(dest="cmd", required=True)
    n = sub.add_parser("new")
    n.add_argument("slug")
    n.add_argument("--topic", required=True)
    n.add_argument("--format", default="9x16")
    r = sub.add_parser("run")
    r.add_argument("slug")
    r.add_argument("--from", dest="start", choices=STAGE_IDS)
    r.add_argument("--only", choices=STAGE_IDS)
    r.add_argument("--until", choices=STAGE_IDS, help="stop after this stage (e.g. edit, to review styleframes first)")
    r.add_argument("--stills", action="store_true", help="render styleframes and a board in the edit stage")
    r.add_argument("--open", action="store_true", help="open the delivered video")
    r.add_argument("--no-downloads", action="store_true", help="skip copying deliverables to ~/Downloads")
    s = sub.add_parser("status")
    s.add_argument("slug")
    a = ap.parse_args(argv)

    if a.cmd == "new":
        m = Manifest.create(config.PROJECTS / a.slug, a.topic, format=a.format)
        print(f"created {m.dir}")
        return 0
    if a.cmd == "status":
        m = Manifest(config.PROJECTS / a.slug)
        for sid, label in STAGES:
            st = m.data["stages"][sid]
            print(f"{label:24} {st['status']:8} {st.get('note', '')}")
        return 0
    try:
        return Production(a.slug, a).run(a.start, a.only, a.until)
    except Blocked as e:
        print(f"BLOCKED: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
