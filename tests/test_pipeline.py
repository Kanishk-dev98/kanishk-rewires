"""Core pipeline behaviour: manifest stages, storyboard rules, timing, captions, QC parsing, music."""
import json
from pathlib import Path

import numpy as np
from PIL import Image

from pipeline.rewires import config, music, qc, storyboard, timing
from pipeline.rewires.manifest import STAGE_IDS, Manifest

SOURCES = {"claims": [{"id": "c1", "claim": "x", "type": "fact", "sources": [{"url": "u", "publisher": "p", "published": "2024"}]}]}


def scene(**kw):
    base = {"id": "s01", "type": "stat", "vo": "It handled two million chats.", "claims": ["c1"], "sourceLabel": "Src", "data": {"label": "chats"}}
    base.update(kw)
    return base


def test_manifest_resume(tmp_path: Path):
    m = Manifest.create(tmp_path / "p", "topic")
    assert m.status("intake") == "done"
    assert m.first_pending() == "research"
    for s in STAGE_IDS[1:5]:
        m.mark(s, "done")
    assert m.first_pending() == "assets"
    m.reset_from("brief")
    assert m.first_pending() == "brief" and m.status("storyboard") == "pending"
    assert Manifest(tmp_path / "p").status("research") == "done"  # persisted
    for d in ("research", "renders", "captions", "reports"):
        assert (tmp_path / "p" / d).is_dir()


def test_storyboard_valid():
    errors, _ = storyboard.validate({"scenes": [scene(sync="million")]}, SOURCES)
    assert errors == []


def test_storyboard_rules():
    sb = {"scenes": [
        scene(id="a", claims=[]),                                   # fact scene without a claim
        scene(id="b", claims=["nope"]),                             # unknown claim id
        scene(id="c", sync="billion"),                              # sync word not spoken
        scene(id="d", data={"label": "fast — cheap"}),         # em dash on screen
        scene(id="e", data={"label": "Follow Kanishk.Rewire"}),     # misspelled brand
        scene(id="e", type="spin"),                                 # duplicate id, unknown type
    ]}
    errors, _ = storyboard.validate(sb, SOURCES)
    text = "\n".join(errors)
    for needle in ("cites no claim", "'nope'", "'billion'", "dash", "brand spelled", "duplicate", "unknown scene type"):
        assert needle in text, needle


def test_timing_sync_and_captions():
    prod = config.production()
    sb = {"scenes": [scene(sync="million", highlight="chats"), scene(id="s02", type="hook", vo="Next one.", claims=[], data={})]}
    words = [("It", 0, 100), ("handled", 100, 400), ("two", 400, 600), ("million", 600, 900), ("chats.", 900, 1300)]
    vo = {"s01": (Path("s01.mp3"), 1.3, words, True), "s02": (Path("s02.mp3"), 0.6, [("Next", 0, 300), ("one.", 300, 600)], True)}
    tl = timing.build(sb, vo, prod, "projects/x/vo")
    s1, s2 = tl["scenes"]
    lead = prod["timing"]["leadInFrames"]
    assert s1["data"]["syncFrame"] == lead + 18           # 600 ms at 30 fps
    assert s1["dur"] >= lead + 39 and s2["dur"] >= prod["timing"]["minSceneFrames"]
    assert s1["vo"] == "projects/x/vo/s01.mp3"
    assert [c["text"] for c in tl["captions"] if c.get("hl")] == ["chats."]
    second = next(c for c in tl["captions"] if c["text"] == "Next")
    assert second["startMs"] == round((s1["dur"] + lead) / 30 * 1000)
    assert tl["bodyFrames"] == s1["dur"] + s2["dur"]


def test_srt_format():
    caps = [{"text": w, "startMs": i * 300, "endMs": i * 300 + 250} for i, w in enumerate("One two three. Four five".split())]
    out = timing.srt(caps)
    assert out.startswith("1\n00:00:00,000 --> ")
    assert "One two three." in out and "2\n" in out


def test_qc_parsers():
    log = "black_start:1.5 black_end:2.25 black_duration:0.75\nfreeze_start: 3.0\nfreeze_duration: 2.6\nsilence_start: 4.1\nsilence_duration: 1.9\n"
    assert qc.parse_black(log) == [(1.5, 2.25)]
    assert qc.parse_freeze(log) == [(3.0, 2.6)]
    assert qc.parse_silence(log) == [(4.1, 1.9)]
    summary = "Summary:\n  Integrated loudness:\n    I:         -14.2 LUFS\n  True peak:\n    Peak:       -1.6 dBFS"
    assert qc.parse_ebur128(summary) == (-14.2, -1.6)


def test_qc_frame_checks():
    dark = Image.new("RGB", (1080, 1920), (10, 10, 10))
    assert qc.edge_ink(dark, 60, dark=True) == 0
    for x in range(10, 30):
        for y in range(500, 520):
            dark.putpixel((x, y), (246, 244, 237))
    assert qc.edge_ink(dark, 60, dark=True) == 400
    ok, _ = qc.ending_ok(Image.new("RGB", (1080, 1920), (10, 10, 10)))
    assert not ok
    logo = Image.open(config.ROOT / config.brand()["logo"]["monogram"]).convert("RGB")
    frame = Image.new("RGB", (1080, 1920), (10, 10, 10))
    frame.paste(logo.resize((380, 380)), (350, 580))
    frame.paste(Image.new("RGB", (600, 60), (246, 244, 237)), (240, 1100))
    assert qc.ending_ok(frame)[0]


def test_music_lengths():
    x = music.score(4.0, [{"start": 0, "end": 4, "energy": 3}], [1.0])
    assert len(x) >= 4 * music.SR and np.isfinite(x).all() and np.abs(x).max() > 0
    sig = music.signature(3.0)
    assert len(sig) >= 3 * music.SR


def test_brand_config_is_single_source():
    b = config.brand()
    assert b["palette"]["lime"] == "#A7FF3F" and b["palette"]["charcoal"] == "#0A0A0A"
    assert (config.ROOT / b["logo"]["monogram"]).exists()
    assert (config.PUBLIC / b["logo"]["monogramPublic"]).exists()
    tsx = "".join(p.read_text() for p in (config.STUDIO / "src" / "rewires").glob("*.tsx"))
    assert "#A7FF3F" not in tsx.upper()  # colours come from config, not hard-coded
    assert json.loads((config.CONFIG / "production.config.json").read_text())["fps"] == 30


def test_fit_to_exact_length_and_sync_sfx():
    prod = config.production()
    words = [("Track", 0, 300), ("replies", 300, 700), ("then", 700, 900), ("stop", 900, 1200)]
    sb = {
        "targetSeconds": 10,
        "outro": {"seconds": 4},
        "scenes": [
            {"id": "a", "type": "workflow", "vo": "Track replies then stop", "syncs": ["replies", "stop"], "plannedSeconds": 2,
             "sfx": [{"name": "click", "on": {"sync": 1, "offset": -2}}], "data": {}},
            {"id": "b", "type": "convert", "vo": "Track replies then stop", "plannedSeconds": 1, "data": {}},
        ],
    }
    vo = {k: (Path(f"{k}.mp3"), 1.6, words, True) for k in ("a", "b")}
    tl = timing.build(sb, vo, prod, "p")
    assert tl["bodyFrames"] == 6 * 30 and sum(s["dur"] for s in tl["scenes"]) == 180
    a, b = tl["scenes"]
    assert a["sfx"][0]["at"] == a["data"]["syncFrames"][1] - 2
    # captions of the second scene start after the (stretched) first scene
    first_b = [c for c in tl["captions"] if c["text"] == "Track"][1]
    assert first_b["startMs"] >= round(a["dur"] / 30 * 1000)
    assert timing.outro_frames(sb, prod) == 120


def test_ui_scene_text_is_checked():
    sb = {"scenes": [{"id": "x", "type": "profile", "vo": "Edit it.", "data": {"after": "Helping brands — grow"}}]}
    errors, _ = storyboard.validate(sb, SOURCES)
    assert any("dash" in e for e in errors)
