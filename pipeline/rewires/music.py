"""Original, code-generated music for Kanishk.Rewires (royalty-free by construction).

Score: 120 BPM in A minor (Am, F, C, G). Layers switch on by each scene's `energy` (0 to 3):
0 pad only · 1 + sub pulse and pluck arpeggio · 2 + soft kick and hats · 3 + four on the floor and 16th hats.
Impacts land on `hit` times. Understated, but always moving.

Signature: the sonic logo under the outro (swell, warm thud on the monogram, one bright ping on the wordmark).
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
S16 = BEAT / 4
PROG = [(45, [57, 60, 64, 67]), (41, [57, 60, 65, 69]), (48, [55, 60, 64, 67]), (43, [55, 59, 62, 67])]
rng = np.random.default_rng(11)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(sec):
    return np.arange(int(sec * SR)) / SR


def lp_fft(x, cutoff):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(spec, len(x))


def hp_fft(x, cutoff):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1 - 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(spec, len(x))


def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf) or i < 0:
        return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n] * gain


def env(n, a=0.01, r=None):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    if r:
        nr = min(n, int(r * SR))
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def pad(notes, sec):
    t = tt(sec)
    x = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * t) for m in notes for d in (-0.003, 0.003))
    x += 0.3 * sum(np.sin(2 * np.pi * 2 * hz(m) * t) for m in notes)
    return x / (len(notes) * 2.6) * env(len(t), 0.4, 0.5)


def pluck(m, sec=S16 * 3):
    t = tt(sec)
    x = np.sin(2 * np.pi * hz(m) * t) + 0.35 * np.sin(2 * np.pi * 2 * hz(m) * t) + 0.12 * np.sin(2 * np.pi * 3 * hz(m) * t)
    return x * np.exp(-t * 14) * env(len(t), 0.002)


def sub(m, sec=BEAT / 2 * 0.9):
    t = tt(sec)
    return np.sin(2 * np.pi * hz(m - 12) * t) * np.exp(-t * 5) * env(len(t), 0.004)


def kick():
    t = tt(0.35)
    f = 48 + 90 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat():
    t = tt(0.06)
    return hp_fft(rng.standard_normal(len(t)), 7000) * np.exp(-t * 70)


def impact():
    t = tt(1.6)
    f = 40 + 55 * np.exp(-t * 7)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    air = lp_fft(rng.standard_normal(len(t)), 1800) * np.exp(-t * 6) * 0.25
    return body + air


def reverb(x, mix=0.22):
    out = x.copy()
    for d, g in ((0.031, 0.5), (0.047, 0.42), (0.071, 0.35), (0.113, 0.28), (0.167, 0.2), (0.241, 0.14)):
        n = int(d * SR)
        out[n:] += x[:-n] * g * mix
    return out


def score(total: float, sections: list[dict], hits: list[float]) -> np.ndarray:
    buf = np.zeros(int((total + 2.0) * SR))
    energy_at = lambda s: next((x["energy"] for x in sections if x["start"] <= s < x["end"]), 0)
    bar = 4 * BEAT
    n_bars = int(np.ceil(total / bar))
    for b in range(n_bars):
        root, chord = PROG[b % len(PROG)]
        t0 = b * bar
        add(buf, pad(chord, bar + 0.5), t0, 0.55)
        for k in range(16):
            at = t0 + k * S16
            if at >= total:
                break
            e = energy_at(at)
            if e >= 1 and k % 2 == 0:
                add(buf, sub(root + 12), at, 0.5)
            if e >= 1:
                add(buf, pluck(chord[(k * 3) % len(chord)] + (12 if k % 8 == 6 else 0)), at, 0.13 if k % 4 == 0 else 0.08)
            if e >= 2 and k in (0, 8):
                add(buf, kick(), at, 0.55)
            if e >= 3 and k in (4, 12):
                add(buf, kick(), at, 0.45)
            if (e >= 2 and k % 2 == 1) or (e >= 3):
                add(buf, hat(), at, 0.05 if k % 2 == 0 else 0.07)
    for h in hits:
        add(buf, impact(), h, 0.7)
    # end of the body: let it ring out instead of cutting
    end = int(total * SR)
    fade = int(1.2 * SR)
    buf[end - fade:end] *= np.linspace(1, 0.35, fade)
    buf[end:] *= np.linspace(0.35, 0, len(buf) - end)
    return reverb(buf)


def signature(sec: float = 3.0, land: float | None = None, word: float | None = None) -> np.ndarray:
    """Sonic logo: soft swell → warm thud + bell as the monogram lands → one high ping on the wordmark."""
    land = land if land is not None else 0.4 * sec
    word = word if word is not None else 0.56 * sec
    buf = np.zeros(int((sec + 1.0) * SR))
    t = tt(land)
    swell = lp_fft(rng.standard_normal(len(t)), 900) * (t / land) ** 2 * 0.25
    add(buf, swell, 0)
    add(buf, pad([57, 64, 71, 72], sec - 0.2) * 0.8, 0.15)
    tb = tt(1.8)
    bell = sum(a * np.sin(2 * np.pi * hz(69) * r * tb) * np.exp(-tb * dcy) for r, a, dcy in ((1, 0.6, 2.2), (2.01, 0.3, 3.5), (3.02, 0.12, 5)))
    thud = np.sin(2 * np.pi * np.cumsum(45 + 40 * np.exp(-tb * 20)) / SR) * np.exp(-tb * 7)
    add(buf, thud, land, 0.8)
    add(buf, bell, land, 0.35)
    tp = tt(1.2)
    ping = np.sin(2 * np.pi * hz(88) * tp) * np.exp(-tp * 6) + 0.3 * np.sin(2 * np.pi * hz(95) * tp) * np.exp(-tp * 8)
    add(buf, ping, word, 0.12)
    n = len(buf)
    buf[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))
    return reverb(buf[:n], 0.3)


def write_wav(x: np.ndarray, path: Path, peak: float = 0.8):
    path.parent.mkdir(parents=True, exist_ok=True)
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    stereo = np.stack([x, x], axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())
