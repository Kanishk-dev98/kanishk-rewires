"""Storyboard: the structured scene plan every video is built from.

projects/<slug>/storyboard/storyboard.json
{
  "id": "<slug>", "title": str, "format": "9x16", "captions": true,
  "scenes": [{
     "id": "s01", "type": "hook|stat|compare|quote|timeline|route|headline|takeaway",
     "vo": "narration", "data": {...scene props...},
     "sync": "word"              # optional: the scene's key moment lands on this spoken word
     "syncs": ["w1", "w2"],      # optional: several moments, in spoken order
     "highlight": "word",        # optional: the one caption word that takes the accent
     "claims": ["c1"],           # ids in research/sources.json backing this scene
     "sourceLabel": "KLARNA, FEB 2024",  # discreet on-screen source
     "transition": "cut|wipe|fade", "energy": 0-3, "hit": bool,
     "sfx": [{"name": "tick", "on": "sync" | <frame>}],
     "visual": str, "animation": str, "sound": str   # direction notes for the script document
  }]
}
"""
import json
import re
from pathlib import Path

from . import config

SCENE_TYPES = {"hook", "stat", "compare", "quote", "timeline", "route", "headline", "takeaway",
               "systemHook", "profile", "prospects", "personalize", "workflow", "convert",
               "tutHook", "tutEasy", "tutStep", "tutSave", "tutCta",
               "cineHook", "cineFlip", "cineRealHook", "cineRealFlip", "cineSpecs", "cineTimeline", "cinePress", "cineLesson", "cineViral"}
NON_TEXT_KEYS = {"theme", "accent", "highlight", "cue", "hero", "logo", "kind"}
DASHES = re.compile("[–—]")
TEXT_KEYS = {"kicker", "lines", "sub", "label", "title", "note", "quote", "who", "role", "input", "body", "final", "points", "items", "rows", "a", "b", "display", "unit", "date", "text"}


def load(project_dir: Path) -> dict:
    return json.loads((Path(project_dir) / "storyboard" / "storyboard.json").read_text())


def load_sources(project_dir: Path) -> dict:
    p = Path(project_dir) / "research" / "sources.json"
    return json.loads(p.read_text()) if p.exists() else {"claims": []}


def on_screen_text(scene: dict) -> list[str]:
    """Every string a viewer will read in this scene (scene props plus the source label)."""
    out: list[str] = []

    def walk(v, key=None):
        if isinstance(v, str):
            if key not in NON_TEXT_KEYS:
                out.append(v.replace("*", ""))
        elif isinstance(v, list):
            for x in v:
                walk(x, key)
        elif isinstance(v, dict):
            for k, x in v.items():
                walk(x, k)

    walk(scene.get("data", {}))
    if scene.get("sourceLabel"):
        out.append(scene["sourceLabel"])
    return out


def norm_word(w: str) -> str:
    return re.sub(r"[^a-z0-9%$']", "", w.lower())


def validate(sb: dict, sources: dict) -> tuple[list[str], list[str]]:
    """Return (errors, warnings). Errors block rendering."""
    errors, warnings = [], []
    claim_ids = {c["id"] for c in sources.get("claims", [])}
    spellings = config.brand()["rules"]["exactBrandSpellings"]
    if not sb.get("scenes"):
        errors.append("storyboard has no scenes")
    seen = set()
    for i, s in enumerate(sb.get("scenes", [])):
        sid = s.get("id", f"#{i}")
        if sid in seen:
            errors.append(f"{sid}: duplicate scene id")
        seen.add(sid)
        if s.get("type") not in SCENE_TYPES:
            errors.append(f"{sid}: unknown scene type {s.get('type')!r}")
        if not s.get("vo", "").strip():
            warnings.append(f"{sid}: no narration")
        vo_words = [norm_word(w) for w in s.get("vo", "").split()]
        cue_words = [str(v).split("@")[0] for v in s.get("cues", {}).values()]
        for key in ([s["sync"]] if s.get("sync") else []) + s.get("syncs", []) + ([s["highlight"]] if s.get("highlight") else []) + s.get("accents", []) + cue_words:
            if norm_word(key) not in vo_words:
                errors.append(f"{sid}: sync/highlight word {key!r} is not in the narration")
        for c in s.get("claims", []):
            if c not in claim_ids:
                errors.append(f"{sid}: claim {c!r} not found in research/sources.json")
        if s.get("type") in {"stat", "compare", "quote", "timeline"} and not s.get("claims"):
            errors.append(f"{sid}: {s['type']} scene states facts but cites no claim")
        if s.get("claims") and not s.get("sourceLabel"):
            warnings.append(f"{sid}: cites claims but shows no on-screen source label")
        for t in on_screen_text(s) + [s.get("vo", "")]:
            if DASHES.search(t):
                errors.append(f"{sid}: em or en dash in {t[:40]!r}")
            for wrong in re.findall(r"kanishk[ ._-]?re?wires?", t, flags=re.I):
                if wrong not in spellings and wrong.lower() != "kanishk rewires":
                    errors.append(f"{sid}: brand spelled {wrong!r}")
        hl_count = sum(len(re.findall(r"\*[^*]+\*", t)) for t in _raw_texts(s))
        if hl_count > 2:
            warnings.append(f"{sid}: {hl_count} lime accents on screen; keep it to one or two")
    return errors, warnings


def _raw_texts(scene: dict) -> list[str]:
    raw = json.dumps(scene.get("data", {}))
    return [raw]


def script_markdown(sb: dict, timeline: dict | None, sources: dict) -> str:
    """The human-readable script and storyboard document."""
    claims = {c["id"]: c for c in sources.get("claims", [])}
    durs = {s["id"]: s["dur"] / config.production()["fps"] for s in (timeline or {}).get("scenes", []) if "id" in s}
    lines = [f"# {sb.get('title', sb['id'])}", "", f"Format: {sb.get('format', '9x16')}  ", ""]
    total = 0.0
    for i, s in enumerate(sb["scenes"], 1):
        d = durs.get(s["id"])
        total += d or 0
        lines += [f"## {i}. {s['id']} · {s['type']}" + (f" · {d:.1f} s" if d else ""), ""]
        lines += [f"**Voiceover:** {s.get('vo', '')}", ""]
        txt = [t for t in on_screen_text(s) if t != s.get("sourceLabel")]
        if txt:
            lines += ["**On screen:** " + " / ".join(txt), ""]
        for k, label in (("visual", "Visual concept"), ("animation", "Animation"), ("sound", "Sound")):
            if s.get(k):
                lines += [f"**{label}:** {s[k]}", ""]
        lines += [f"**Transition:** {s.get('transition', 'cut')}", ""]
        for c in s.get("claims", []):
            cl = claims.get(c)
            if cl:
                src = cl["sources"][0] if cl.get("sources") else {}
                lines += [f"- Source {c}: {cl['claim']} ({cl.get('type')}) {src.get('publisher', '')}, {src.get('published', '')} {src.get('url', '')}"]
        lines.append("")
    if total:
        lines.insert(3, f"Body duration: {total:.1f} s plus the brand outro")
    return "\n".join(lines) + "\n"


def sources_markdown(sources: dict) -> str:
    lines = [f"# Source ledger: {sources.get('topic', '')}", "", f"Researched: {sources.get('researched_at', '')}", ""]
    for c in sources.get("claims", []):
        lines.append(f"- **{c['id']}** ({c.get('type')}, event {c.get('event_date', 'n/a')}): {c['claim']}")
        for s in c.get("sources", []):
            lines.append(f"  - {s.get('publisher', '')}, \"{s.get('title', '')}\", published {s.get('published', '')}: {s.get('url', '')}")
        if c.get("notes"):
            lines.append(f"  - Note: {c['notes']}")
    if sources.get("open_questions"):
        lines += ["", "## Open questions", ""] + [f"- {q}" for q in sources["open_questions"]]
    return "\n".join(lines) + "\n"
