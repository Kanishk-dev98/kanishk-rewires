"""Generate a soft, light background track (pad + plucked arpeggio) as a WAV.

Fully synthesized, so it is royalty-free. Usage:
    python make_music.py <out.wav> [seconds]
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 92
BEAT = 60 / BPM
BAR = 4 * BEAT

# Cmaj9 - Am7 - Fmaj7 - G6 (MIDI notes)
CHORDS = [
    [48, 55, 64, 67, 74],
    [45, 52, 60, 64, 67],
    [41, 48, 57, 60, 64],
    [43, 50, 59, 62, 64],
]
ARP_ORDER = [0, 2, 3, 4, 3, 2, 3, 4]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def pad(notes, dur):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.8)
    sig = sum(np.sin(2 * np.pi * hz(n) * t) + 0.25 * np.sin(2 * np.pi * hz(n) * 1.003 * t) for n in notes)
    return 0.06 * sig * env


def pluck(note, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    f = hz(note)
    tone = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.1 * np.sin(6 * np.pi * f * t)
    env = np.exp(-t / 0.45) * np.minimum(1, t / 0.005)
    return 0.16 * tone * env


def reverb(x):
    out = x.copy()
    for delay, gain in [(0.029, 0.45), (0.037, 0.4), (0.041, 0.35), (0.053, 0.3)]:
        # Feedback comb filter, vectorized one delay-length block at a time.
        d = int(delay * SR)
        y = np.zeros(len(x) + (-len(x)) % d)
        y[: len(x)] = x
        blocks = y.reshape(-1, d)
        for k in range(1, len(blocks)):
            blocks[k] += gain * blocks[k - 1]
        out += 0.25 * y[: len(x)]
    return out


def main():
    out_path = sys.argv[1]
    seconds = float(sys.argv[2]) if len(sys.argv) > 2 else 48
    n = int(seconds * SR)
    mix = np.zeros(n + SR * 2)

    t0, bar_i = 0.0, 0
    while t0 < seconds:
        chord = CHORDS[bar_i % len(CHORDS)]
        p = pad(chord, BAR + 0.8)
        s = int(t0 * SR)
        mix[s : s + len(p)] += p[: len(mix) - s]
        for step, idx in enumerate(ARP_ORDER):
            ts = t0 + step * BEAT / 2
            if ts >= seconds:
                break
            pl = pluck(chord[idx] + 12)
            s = int(ts * SR)
            mix[s : s + len(pl)] += pl[: len(mix) - s]
        t0 += BAR
        bar_i += 1

    mix = reverb(mix[:n])
    fade = int(2 * SR)
    mix[:fade] *= np.linspace(0, 1, fade)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = mix / np.max(np.abs(mix)) * 0.7

    stereo = np.stack([mix, np.roll(mix, int(0.012 * SR))], axis=1)
    pcm = (stereo * 32767).astype(np.int16)
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"wrote {out_path} ({seconds:.0f}s)")


if __name__ == "__main__":
    main()
