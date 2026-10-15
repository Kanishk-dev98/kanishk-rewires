"""Compose an energetic, trailer-style score (120 BPM, D minor) for a film.

Layers by intensity (0-5): drone + clock ticks (tension) → ostinato →
kick + hats → four-on-floor, snare, taiko fills → brass stabs → max.
Risers lead into chapters that get louder; impacts land on given hit times.
At 120 BPM a beat is exactly 15 frames at 30 fps, so cuts can sit on beats.

Usage:
    python make_epic_score.py <sections.json> <out.wav>
sections.json: {"total": s, "sections": [{"start","end","intensity"}], "hits": [s, ...], "end_hit": s}
"""
import json
import sys
import wave

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
rng = np.random.default_rng(3)

# Dm - Bb - F - C   (i - VI - III - VII), roots in MIDI
PROG = [(38, [50, 53, 57]), (34, [50, 53, 58]), (41, [48, 53, 57]), (36, [48, 52, 55])]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_arr(sec):
    return np.arange(int(sec * SR)) / SR


def saw(f, t, harmonics=10, bright=1.3):
    out = np.zeros_like(t)
    for k in range(1, harmonics + 1):
        if f * k > 12000:
            break
        out += np.sin(2 * np.pi * f * k * t) / (k ** bright)
    return out


def lowpass(x, cutoff):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(spec, len(x))


def highpass(x, cutoff):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1 / np.sqrt(1 + (cutoff / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(spec, len(x))


def add(buf, sig, at, gain=1.0):
    s = int(round(at * SR))
    if s >= len(buf) or s < 0:
        return
    n = min(len(sig), len(buf) - s)
    buf[s:s + n] += sig[:n] * gain


# ---------- instruments ----------
NOISE = rng.standard_normal(SR * 4)


def kick():
    t = t_arr(0.5)
    f = 45 + 110 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = highpass(NOISE[: len(t)], 2000) * np.exp(-t * 200) * 0.3
    return np.tanh(2.2 * (body + click)) * 0.9


def snare():
    t = t_arr(0.35)
    n = highpass(NOISE[: len(t)], 1200) * np.exp(-t * 16)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)
    return (n * 0.8 + tone * 0.5)


def hat(open_=False):
    t = t_arr(0.3 if open_ else 0.06)
    return highpass(NOISE[1000:1000 + len(t)], 7000) * np.exp(-t * (12 if open_ else 70)) * 0.35


def taiko(pitch=1.0):
    t = t_arr(0.9)
    f = (70 + 60 * np.exp(-t * 20)) * pitch
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    slap = lowpass(NOISE[2000:2000 + len(t)], 900) * np.exp(-t * 40) * 0.6
    return np.tanh(1.8 * (body + slap))


def ostinato_note(m, length=S16 * 0.95):
    t = t_arr(length)
    env = np.exp(-t / 0.09) * np.minimum(1, t / 0.003)
    return saw(hz(m), t, 12, 1.1) * env * 0.22


def brass(notes, length=BAR * 0.9):
    t = t_arr(length)
    env = np.minimum(1, t / 0.035) * np.exp(-t / 0.7)
    sig = sum(saw(hz(m), t, 14, 0.95) + saw(hz(m) * 1.004, t, 14, 0.95) for m in notes)
    return lowpass(sig * env, 2600) * 0.09


def strings(notes, length):
    t = t_arr(length)
    env = np.minimum(1, t / 0.4) * np.minimum(1, (length - t) / 0.3).clip(0)
    sig = sum(saw(hz(m) * d, t, 8, 1.4) for m in notes for d in (0.997, 1.0, 1.003))
    return lowpass(sig * env, 3000) * 0.025


def sub(m, length):
    t = t_arr(length)
    env = np.minimum(1, t / 0.01) * np.minimum(1, (length - t) / 0.05).clip(0)
    return np.sin(2 * np.pi * hz(m) * t) * env * 0.35


def drone(length):
    t = t_arr(length)
    sig = np.sin(2 * np.pi * hz(26) * t) + 0.5 * np.sin(2 * np.pi * hz(38) * t * 1.002)
    return sig * 0.12


def tick():
    t = t_arr(0.05)
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120) * 0.18


def riser(length):
    t = t_arr(length)
    n = NOISE[: len(t)] if len(t) <= len(NOISE) else rng.standard_normal(len(t))
    out = np.zeros_like(t)
    chunks = 24
    step = max(1, len(t) // chunks)
    for i in range(chunks):
        seg = n[i * step:(i + 1) * step]
        if len(seg) == 0:
            break
        lo = 400 + i * 260
        out[i * step:i * step + len(seg)] = highpass(lowpass(seg, lo * 3), lo)
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1600 * (t / length) ** 2) / SR) * 0.3
    return (out * 0.7 + sweep) * (t / length) ** 2.5 * 0.5


def impact():
    t = t_arr(3.0)
    f = 34 + 60 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.4)
    crash = highpass(rng.standard_normal(len(t)), 3000) * np.exp(-t * 2.2) * 0.35
    body = lowpass(rng.standard_normal(len(t)), 400) * np.exp(-t * 6) * 0.6
    return np.tanh(1.6 * (boom + crash + body)) * 0.95


def reverb(x, mix=0.25):
    out = x.copy()
    for delay, gain in [(0.029, 0.55), (0.037, 0.5), (0.047, 0.45), (0.061, 0.4)]:
        d = int(delay * SR)
        y = np.zeros(len(x) + (-len(x)) % d)
        y[: len(x)] = x
        blocks = y.reshape(-1, d)
        for k in range(1, len(blocks)):
            blocks[k] += gain * blocks[k - 1]
        out += mix * 0.3 * y[: len(x)]
    return out


def main():
    spec = json.load(open(sys.argv[1]))
    total, sections = spec["total"], spec["sections"]
    end_hit = spec.get("end_hit", total - 4)
    n = int((total + 1) * SR)
    stems = {k: np.zeros(n) for k in ["drums", "ost", "brass", "pad", "sub", "fx"]}

    def lvl(sec):
        for s in sections:
            if s["start"] <= sec < s["end"]:
                return s["intensity"]
        return 0

    KICK, SNARE, HATC, HATO = kick(), snare(), hat(), hat(True)
    TAIKO_HI, TAIKO_LO = taiko(1.25), taiko(0.85)
    TICK = tick()

    bar_i, t0 = 0, 0.0
    while t0 < end_hit:
        root, triad = PROG[bar_i % 4]
        L = lvl(t0 + 0.01)
        phrase_end = bar_i % 4 == 3
        # bed
        add(stems["pad"], strings([m + 12 for m in triad], BAR + 0.3), t0, 0.6 + 0.12 * L)
        add(stems["sub"], sub(root - 12 if L >= 2 else root, BAR), t0, 0.5 if L < 2 else 1.0)
        if L <= 1:
            add(stems["pad"], drone(BAR + 0.2), t0, 0.8)
            for b in range(8):
                add(stems["fx"], TICK, t0 + b * BEAT / 2, 1.0 if b % 2 == 0 else 0.5)
        # ostinato: 8ths at 1, 16ths at 2+
        if L >= 1:
            pattern = [0, 0, 7, 0, 12, 0, 7, 0, 0, 0, 7, 0, 12, 7, 3, 0]
            step = 1 if L >= 2 else 2
            for i in range(0, 16, step):
                add(stems["ost"], ostinato_note(root + 12 + pattern[i]), t0 + i * S16, 1.0 if i % 4 == 0 else 0.7)
        # drums
        if L >= 2:
            beats = [0, 1, 2, 3] if L >= 3 else [0, 2]
            for b in beats:
                add(stems["drums"], KICK, t0 + b * BEAT)
            for e in range(8 if L < 4 else 16):
                d = BEAT / 2 if L < 4 else S16
                add(stems["drums"], HATC, t0 + e * d, 0.8 if e % 2 else 0.5)
            add(stems["drums"], HATO, t0 + 3.5 * BEAT, 0.5)
        if L >= 3:
            for b in (1, 3):
                add(stems["drums"], SNARE, t0 + b * BEAT, 0.9)
            if phrase_end:
                for k, off in enumerate([2.0, 2.5, 3.0, 3.25, 3.5, 3.75]):
                    add(stems["drums"], TAIKO_HI if k % 2 else TAIKO_LO, t0 + off * BEAT, 0.8)
        # brass
        if L >= 4:
            add(stems["brass"], brass([m - 12 for m in triad] + [triad[0]]), t0, 1.0)
            if L >= 5:
                add(stems["brass"], brass([m - 12 for m in triad], BEAT * 1.5), t0 + 2.5 * BEAT, 0.8)
        t0 += BAR
        bar_i += 1

    # risers into louder chapters, impacts on hits
    for i, s in enumerate(sections[1:], 1):
        if s["intensity"] > sections[i - 1]["intensity"] and s["intensity"] >= 2:
            add(stems["fx"], riser(2 * BAR), s["start"] - 2 * BAR, 0.8)
    for h in spec.get("hits", []):
        add(stems["fx"], impact(), h, 0.9)
    # finale: big hit + held chord
    add(stems["fx"], riser(2 * BAR), end_hit - 2 * BAR, 0.9)
    add(stems["fx"], impact(), end_hit, 1.1)
    add(stems["brass"], brass([38, 50, 53, 57, 62], 5.0), end_hit, 1.2)
    add(stems["pad"], strings([62, 65, 69, 74], 6.0), end_hit, 1.4)
    add(stems["sub"], sub(26, 4.0), end_hit, 1.0)

    mix = (stems["drums"] * 0.9 + stems["ost"] * 0.85 + reverb(stems["brass"], 0.35) * 1.0
           + reverb(stems["pad"], 0.4) * 0.9 + stems["sub"] * 0.8 + reverb(stems["fx"], 0.2) * 0.8)
    mix = np.tanh(mix * 1.4) / np.tanh(1.4)
    fade = int(0.05 * SR)
    mix[:fade] *= np.linspace(0, 1, fade)
    tail_end = min(len(mix), int((end_hit + 6) * SR))
    mix[tail_end:] = 0
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.9
    stereo = np.stack([mix, np.roll(mix, int(0.009 * SR))], axis=1)
    with wave.open(sys.argv[2], "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())
    print(f"epic score {total:.1f}s ({BPM} BPM) -> {sys.argv[2]}")


if __name__ == "__main__":
    main()
