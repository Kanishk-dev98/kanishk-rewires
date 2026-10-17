"""Turn a storyboard plus narration timings into a frame-accurate timeline and captions.

The edit fits the spoken content: each scene lasts lead-in + narration + pad, and any
`sync` word moves the scene's key visual moment onto the frame where it is spoken.
"""
import re

from .storyboard import norm_word

SFX_FILES = {"tick": "sfx/tick.wav", "click": "sfx/mouse-click.wav", "whoosh": "sfx/whoosh.wav", "impact": "sfx/impact.wav", "switch": "sfx/switch.wav", "ding": "sfx/ding.wav"}


def find_word(words, key: str, after_ms: float = -1):
    k = norm_word(key)
    return next((a for w, a, _ in words if a > after_ms and norm_word(w) == k), None)


def build(sb: dict, vo: dict, prod: dict, vo_public_prefix: str) -> dict:
    """Return the timeline: Remotion scenes, flat captions, music sections and hit times."""
    fps = prod["fps"]
    t = prod["timing"]
    scenes, captions, sections, hits = [], [], [], []
    start = 0
    for s in sb["scenes"]:
        sid = s["id"]
        path, dur_s, words, _ = vo.get(sid, (None, 0.0, [], True))
        if words:  # time the scene on the last spoken word, not the clip's trailing silence
            dur_s = min(dur_s, words[-1][2] / 1000 + 0.12)
        lead = s.get("leadIn", t["leadInFrames"])
        frames = max(s.get("minFrames", t["minSceneFrames"]), lead + round(dur_s * fps) + s.get("pad", t["padFrames"]))
        data = dict(s.get("data", {}))
        if s.get("sync"):
            ms = find_word(words, s["sync"])
            data["syncFrame"] = lead + round(ms / 1000 * fps) if ms is not None else lead + 8
        if s.get("syncs"):
            out, last = [], -1
            for key in s["syncs"]:
                ms = find_word(words, key, last)
                if ms is not None:
                    last = ms
                out.append(lead + round(ms / 1000 * fps) if ms is not None else lead + 8 + 20 * len(out))
            data["syncFrames"] = out
        if s.get("cues"):  # name -> "word" or "word@2" (second occurrence): the frame the word is spoken
            cues = {}
            for name, spec in s["cues"].items():
                word, _, nth = str(spec).partition("@")
                ms, after = None, -1.0
                for _ in range(int(nth or 1)):
                    ms = find_word(words, word, after)
                    if ms is None:
                        break
                    after = ms
                cues[name] = lead + round(ms / 1000 * fps) if ms is not None else lead + 8
            data["cues"] = cues
        sfx = []
        for x in s.get("sfx", []):
            on = x.get("on", 0)
            if on == "sync":
                at = data.get("syncFrame", lead)
            elif isinstance(on, dict) and "cue" in on:  # {"cue": name, "offset": n}
                at = data.get("cues", {}).get(on["cue"], lead) + on.get("offset", 0)
            elif isinstance(on, dict):  # {"sync": i, "offset": n}: the i-th sync word, shifted
                at = (data.get("syncFrames") or [lead])[min(on["sync"], len(data.get("syncFrames") or [lead]) - 1)] + on.get("offset", 0)
            else:
                at = int(on)
            sfx.append({"src": SFX_FILES.get(x["name"], x["name"]), "at": max(0, at - x.get("early", 0)), "volume": x.get("volume", 0.3)})
        scene = {
            "id": sid,
            "type": s["type"],
            "dur": frames,
            "vo": f"{vo_public_prefix}/{path.name}" if path else None,
            "voAt": lead,
            "data": data,
            "transition": s.get("transition", "cut"),
            "sfx": sfx,
        }
        if s.get("sourceLabel"):
            scene["source"] = s["sourceLabel"]
        scenes.append(scene)

        hl = norm_word(s["highlight"]) if s.get("highlight") else None
        hl_used = False
        accents = {norm_word(a) for a in s.get("accents", [])}
        offset = (start + lead) / fps * 1000
        for w, a, b in words:
            c = {"text": w, "startMs": round(offset + a), "endMs": round(offset + b)}
            if (hl and not hl_used and norm_word(w) == hl) or norm_word(w) in accents:
                c["hl"] = True
                hl_used = hl_used or norm_word(w) == hl
            captions.append(c)
        sections.append({"start": start / fps, "end": (start + frames) / fps, "energy": s.get("energy", 1)})
        if s.get("hit"):
            hits.append((start + data.get("syncFrame", lead)) / fps)
        start += frames
    tl = {"scenes": scenes, "captions": captions, "sections": sections, "hits": hits, "bodyFrames": start}
    if sb.get("targetSeconds"):
        fit(tl, round(sb["targetSeconds"] * fps) - outro_frames(sb, prod), [s.get("plannedSeconds", 1) for s in sb["scenes"]])
    return tl


def outro_frames(sb: dict, prod: dict) -> int:
    from . import config

    return round(sb.get("outro", {}).get("seconds", config.brand()["outro"]["seconds"]) * prod["fps"])


def fit(tl: dict, body_target: int, weights: list[float]):
    """Stretch scenes (in proportion to their planned length) so the body hits an exact frame count.
    Narration never moves; only the breathing room after it grows. Records a warning if narration is too long."""
    extra = body_target - tl["bodyFrames"]
    if extra < 0:
        tl["fitWarning"] = f"narration needs {-extra} frames more than the target; speed the voice up or cut words"
        return
    total_w = sum(weights) or 1
    adds = [int(extra * w / total_w) for w in weights]
    adds[-1] += extra - sum(adds)
    start, cap_shift = 0, 0
    for s, sec, add in zip(tl["scenes"], tl["sections"], adds):
        s["dur"] += add
        sec["start"] = start / 30
        start += s["dur"]
        sec["end"] = start / 30
    # captions and hits shift by the cumulative frames added before each scene
    bounds, acc = [], 0
    for s, add in zip(tl["scenes"], adds):
        bounds.append(acc)
        acc += add
    old_starts, a = [], 0
    for s, add in zip(tl["scenes"], adds):
        old_starts.append(a)
        a += s["dur"] - add
    for c in tl["captions"]:
        f = c["startMs"] / 1000 * 30
        i = max(j for j, st in enumerate(old_starts) if st <= f + 0.01)
        shift = bounds[i] / 30 * 1000
        c["startMs"] = round(c["startMs"] + shift)
        c["endMs"] = round(c["endMs"] + shift)
    tl["hits"] = [h + bounds[max(j for j, st in enumerate(old_starts) if st <= h * 30 + 0.01)] / 30 for h in tl["hits"]]
    tl["bodyFrames"] = body_target


def paginate(captions: list[dict], max_words: int) -> list[list[dict]]:
    """Same paging rule as studio/src/rewires/Captions.tsx."""
    pages, cur = [], []
    for i, c in enumerate(captions):
        cur.append(c)
        nxt = captions[i + 1] if i + 1 < len(captions) else None
        gap = nxt["startMs"] - c["endMs"] if nxt else float("inf")
        if len(cur) >= max_words or re.search(r"[.,?!:;]$", c["text"]) or gap > 280:
            pages.append(cur)
            cur = []
    if cur:
        pages.append(cur)
    return pages


def _ts(ms: float) -> str:
    ms = max(0, int(round(ms)))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def srt(captions: list[dict], words_per_line: int = 8) -> str:
    """Sentence-ish SRT cues (longer than on-screen pages, which suits YouTube CC)."""
    cues = paginate(captions, words_per_line)
    out = []
    for i, cue in enumerate(cues, 1):
        nxt = cues[i][0]["startMs"] if i < len(cues) else cue[-1]["endMs"] + 600
        end = min(cue[-1]["endMs"] + 400, nxt - 20)
        out.append(f"{i}\n{_ts(cue[0]['startMs'])} --> {_ts(end)}\n{' '.join(w['text'] for w in cue)}\n")
    return "\n".join(out)
