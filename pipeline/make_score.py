"""Compose a layered cinematic score that follows a film's chapter intensities.

Layers enter as intensity rises: 0 sparse piano, 1 + pad, 2 + arpeggio,
3 + shimmer, 4 + sub pulse. Royalty-free (fully synthesized).

Usage:
    python make_score.py <sections.json> <out.wav>
sections.json: {"total": seconds, "sections": [{"start": s, "end": s, "intensity": 0-4}, ...]}
"""
import json
import sys
import wave

import numpy as np

SR = 44100
BPM = 80
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(11)

# Dmaj9 - Bm7 - Gmaj7 - Asus4/A (MIDI)
CHORDS = [
    [38, 50, 54, 57, 61, 64],
    [35, 47, 50, 54, 57, 62],
    [31, 43, 50, 54, 55, 59],
    [33, 45, 50, 52, 57, 61],
]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def piano(note, dur=3.5, vel=1.0):
    t = np.arange(int(dur * SR)) / SR
    f = hz(note)
    tone = (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) * np.exp(-t * 2)
            + 0.18 * np.sin(6 * np.pi * f * 1.001 * t) * np.exp(-t * 3) + 0.06 * np.sin(8 * np.pi * f * t) * np.exp(-t * 5))
    env = np.exp(-t / 1.4) * np.minimum(1, t / 0.004)
    return 0.22 * vel * tone * env


def pad_note(note, dur):
    t = np.arange(int(dur * SR)) / SR
    f = hz(note)
    sig = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.004 * t) + 0.5 * np.sin(2 * np.pi * f * 0.996 * t)
    env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)
    return 0.035 * sig * env


def pluck(note, vel=1.0):
    t = np.arange(int(1.4 * SR)) / SR
    f = hz(note)
    tone = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)
    return 0.1 * vel * tone * np.exp(-t / 0.35) * np.minimum(1, t / 0.003)


def bell(note):
    t = np.arange(int(2.0 * SR)) / SR
    f = hz(note)
    tone = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3)
    return 0.045 * tone * np.exp(-t / 0.7) * np.minimum(1, t / 0.002)


def kick():
    t = np.arange(int(0.9 * SR)) / SR
    freq = 42 + 40 * np.exp(-t * 18)
    return 0.5 * np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 5)


def add(buf, sig, at):
    s = int(at * SR)
    if s >= len(buf):
        return
    n = min(len(sig), len(buf) - s)
    buf[s:s + n] += sig[:n]


def reverb(x, mix=0.32):
    out = x.copy()
    for delay, gain in [(0.031, 0.62), (0.037, 0.58), (0.043, 0.55), (0.055, 0.5), (0.071, 0.45)]:
        d = int(delay * SR)
        y = np.zeros(len(x) + (-len(x)) % d)
        y[: len(x)] = x
        blocks = y.reshape(-1, d)
        for k in range(1, len(blocks)):
            blocks[k] += gain * blocks[k - 1]
        out += mix * 0.25 * y[: len(x)]
    return out


def intensity_curve(sections, total):
    """Per-bar-time intensity, smoothed with 2 s ramps."""
    t = np.arange(int(total * SR)) / SR
    raw = np.zeros_like(t)
    for s in sections:
        raw[(t >= s["start"]) & (t < s["end"])] = s["intensity"]
    k = int(2.0 * SR)
    kernel = np.ones(k) / k
    return np.convolve(raw, kernel, mode="same")


def main():
    spec = json.load(open(sys.argv[1]))
    total, sections = spec["total"], spec["sections"]
    n = int((total + 6) * SR)
    piano_l, pad_l, arp_l, shim_l, pulse_l = (np.zeros(n) for _ in range(5))

    def level_at(sec):
        for s in sections:
            if s["start"] <= sec < s["end"]:
                return s["intensity"]
        return sections[-1]["intensity"]

    bar_i, t0 = 0, 0.0
    while t0 < total:
        ch = CHORDS[bar_i % 4]
        lvl = level_at(t0)
        # piano: bass + a melody note; sparser at low intensity
        add(piano_l, piano(ch[0] + 12, vel=0.8), t0)
        add(piano_l, piano(ch[3] + 12, vel=0.55), t0 + 2 * BEAT)
        if lvl >= 1:
            add(piano_l, piano(ch[4] + 12, vel=0.45), t0 + 3 * BEAT)
        for m in ch[1:]:
            add(pad_l, pad_note(m, BAR + 1.2), t0)
        for step in range(8):
            idx = [1, 3, 4, 5, 4, 3, 2, 4][step]
            add(arp_l, pluck(ch[idx] + 12, vel=0.9 if step % 2 == 0 else 0.6), t0 + step * BEAT / 2)
        for step in range(16):
            if rng.random() < 0.45:
                add(shim_l, bell(ch[rng.integers(2, 6)] + 24), t0 + step * BEAT / 4)
        for b in range(4):
            add(pulse_l, kick() * (1.0 if b % 2 == 0 else 0.55), t0 + b * BEAT)
        t0 += BAR
        bar_i += 1

    curve = intensity_curve(sections, total + 6)[:n]
    g = lambda lo: np.clip(curve - lo + 1, 0, 1)  # layer fades in between lo-1 and lo
    mix = piano_l * 1.0 + pad_l * g(1) + arp_l * g(2) * 0.9 + shim_l * g(3) + pulse_l * g(4) * 0.7
    mix = reverb(mix)
    fade_in, fade_out = int(1.5 * SR), int(5 * SR)
    mix[:fade_in] *= np.linspace(0, 1, fade_in)
    end = int((total + 4) * SR)
    mix[end - fade_out:end] *= np.linspace(1, 0, fade_out)
    mix[end:] = 0
    mix = mix[: int(total * SR) + SR]
    mix = mix / np.max(np.abs(mix)) * 0.8
    stereo = np.stack([mix, np.roll(mix, int(0.011 * SR))], axis=1)
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())
    print(f"score {total:.1f}s -> {sys.argv[2]}")


if __name__ == "__main__":
    main()
