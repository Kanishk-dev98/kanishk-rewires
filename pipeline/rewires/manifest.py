"""Project manifest: one JSON file that records every stage, its status and its outputs.

A stage is only marked done after its outputs have been checked, so a rerun can resume
from the first stage that is not done.
"""
import json
import re
from datetime import datetime, timezone
from pathlib import Path

STAGES = [
    ("intake", "A. Intake"),
    ("research", "B. Research"),
    ("brief", "C. Creative brief"),
    ("script", "D. Script"),
    ("storyboard", "E. Storyboard"),
    ("assets", "F. Asset production"),
    ("edit", "G. Animation and edit"),
    ("render", "H. Render"),
    ("qc", "I. Quality control"),
    ("delivery", "J. Delivery"),
]
STAGE_IDS = [s for s, _ in STAGES]
SUBDIRS = ["research", "brief", "script", "storyboard", "assets", "audio", "timeline", "renders", "captions", "reports"]


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "untitled"


class Manifest:
    def __init__(self, project_dir: Path):
        self.dir = Path(project_dir)
        self.path = self.dir / "manifest.json"
        self.data = json.loads(self.path.read_text()) if self.path.exists() else {}

    @classmethod
    def create(cls, project_dir: Path, topic: str, **opts) -> "Manifest":
        project_dir = Path(project_dir)
        for d in SUBDIRS:
            (project_dir / d).mkdir(parents=True, exist_ok=True)
        m = cls(project_dir)
        if not m.data:
            m.data = {
                "slug": project_dir.name,
                "topic": topic,
                "created": now(),
                "options": {"format": "9x16", "language": "en", **opts},
                "stages": {s: {"status": "pending"} for s in STAGE_IDS},
                "assets": [],
                "versions": [],
            }
            m.mark("intake", "done", note="project folder and manifest created")
        return m

    def save(self):
        self.path.write_text(json.dumps(self.data, indent=2) + "\n")

    def status(self, stage: str) -> str:
        return self.data["stages"][stage]["status"]

    def mark(self, stage: str, status: str, note: str = "", outputs: list[str] | None = None):
        if stage not in STAGE_IDS:
            raise KeyError(stage)
        entry = self.data["stages"][stage]
        entry.update(status=status, at=now())
        if note:
            entry["note"] = note
        if outputs is not None:
            entry["outputs"] = outputs
        self.save()

    def reset_from(self, stage: str):
        """Mark `stage` and every later stage pending so they rerun."""
        for s in STAGE_IDS[STAGE_IDS.index(stage):]:
            self.data["stages"][s] = {"status": "pending"}
        self.save()

    def first_pending(self) -> str | None:
        return next((s for s in STAGE_IDS if self.status(s) != "done"), None)

    def record_asset(self, kind: str, path: str, provider: str, **meta):
        """Provenance for every produced asset: what made it, how, and its licence."""
        self.data["assets"] = [a for a in self.data["assets"] if a["path"] != path]
        self.data["assets"].append({"kind": kind, "path": path, "provider": provider, "at": now(), **meta})
        self.save()
