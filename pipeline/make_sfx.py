"""Synthesize cinematic SFX (impact, riser, boom, tick) as WAVs. Royalty-free.

Usage:
    python make_sfx.py <out_dir>
"""
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(sec * SR)) / SR


def band(x, lo, hi):
    """FFT band-pass filter."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, len(x))


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def impact():
    tt = t(2.5)
    freq = 38 + 50 * np.exp(-tt * 6)  # pitch drop
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 1.6)
    crack = band(rng.standard_normal(len(tt)), 200, 6000) * np.exp(-tt * 18)
    tail = band(rng.standard_normal(len(tt)), 60, 900) * np.exp(-tt * 2.5) * 0.4
    return norm(body * 1.0 + crack * 0.5 + tail)


def boom():
    tt = t(3.0)
    freq = 30 + 25 * np.exp(-tt * 3)
    sub = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 1.1)
    return norm(sub * np.minimum(1, tt / 0.01))


def riser(sec=3.0):
    tt = t(sec)
    noise = rng.standard_normal(len(tt))
    out = np.zeros_like(noise)
    chunks = 30
    n = len(tt) // chunks
    for i in range(chunks):
        lo = 300 + i * 120
        seg = band(noise[i * n:(i + 1) * n], lo, lo * 4)
        out[i * n:(i + 1) * n] = seg
    freq = 180 + 900 * (tt / sec) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) * 0.35
    env = (tt / sec) ** 2.2
    return norm((out * 0.8 + tone) * env)


def tick():
    tt = t(0.08)
    return norm(np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 90), 0.6)


def save(path, x):
    stereo = np.stack([x, x], axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())


if __name__ == "__main__":
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in [("impact", impact), ("boom", boom), ("riser", riser), ("tick", tick)]:
        save(out / f"{name}.wav", fn())
        print("wrote", out / f"{name}.wav")
