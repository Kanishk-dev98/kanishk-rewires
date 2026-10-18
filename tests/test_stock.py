"""Offline checks for the stock footage helper (no network, no keys)."""
from pipeline.rewires import stock


def test_best_prefers_smallest_full_hd():
    files = [(640, 1138, "a"), (1080, 1920, "b"), (2160, 3840, "c")]
    assert stock._best(files, "portrait")[2] == "b"


def test_best_falls_back_to_largest():
    assert stock._best([(360, 640, "a"), (720, 1280, "b")], "portrait")[2] == "b"


def test_orientation_filter():
    assert stock._fits(1080, 1920, "portrait") and not stock._fits(1920, 1080, "portrait")
    assert stock._fits(1920, 1080, "landscape") and stock._fits(10, 10, "any")
