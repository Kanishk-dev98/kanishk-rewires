"""Music placeholder for the 60 s Apolio film: bright, upbeat electronic, 120 BPM, D major.

At 120 BPM / 30 fps a beat is exactly 15 frames, so beat n = n / 2 seconds.
Beat map (matches studio/src/apolio/Apolio60.tsx):
  0-10    intro: pad + sparse plucks, riser into S2
  10-54   groove: four-on-floor, claps, offbeat hats, bass, plucked arp (16th hats from 40)
  54-78   full: brighter arp, open hats
  78-86   tension (web page + "Apolio tries"): drums out, drone, clock ticks speeding up, riser
  86      DENIED: impact, then near silence with a soft heartbeat
  90-96   "Nothing was paid.": pad swell
  96-108  groove returns, lighter
  108-114 lift with brass stabs; 114 logo impact + held chord, fade to 60 s

Usage: python make_apolio_score.py <out.wav>
"""
import os
import sys
import wave

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from make_epic_score import SR, add, brass, hat, highpass, hz, impact, kick, lowpass, reverb, riser, saw, snare, strings, sub, t_arr  # noqa: E402

BPM = 120
BEAT = 0.5
S16 = BEAT / 4
TOTAL = 60.0
PROG = [(38, [62, 66, 69]), (45, [61, 64, 69]), (47, [62, 66, 71]), (43, [62, 67, 71])]  # D A Bm G


def clap():
    t = t_arr(0.22)
    n = highpass(np.random.default_rng(9).standard_normal(len(t)), 1000)
    return n * np.exp(-t * 24) * 0.55


def pluck(m, length=S16 * 1.8, bright=1.15):
    t = t_arr(length)
    return lowpass(saw(hz(m), t, 12, bright) * np.exp(-t / 0.09), 5200) * 0.15


def bass(m, length):
    t = t_arr(length)
    return lowpass(saw(hz(m), t, 8, 1.0), 700) * np.minimum(1, t / 0.004) * np.exp(-t / 0.22) * 0.38


def tick():
    t = t_arr(0.04)
    return np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 160) * 0.22


def main():
    out = sys.argv[1]
    n = int((TOTAL + 1) * SR)
    m = {k: np.zeros(n) for k in ("drums", "bass", "keys", "pad", "fx")}
    K, CL, SN, HC, HO, TK = kick(), clap(), snare(), hat(), hat(True), tick()
    at = lambda b: b * BEAT  # noqa: E731

    for b in range(120):
        root, tri = PROG[(b // 4) % 4]
        t0 = at(b)
        bar = b % 4 == 0
        if bar and not (78 <= b < 90):
            add(m["pad"], strings(tri, 4 * BEAT + 0.2), t0, 0.55 if b < 10 else 0.75)
        if b < 10:
            for s in (0, 2):
                add(m["keys"], pluck(tri[(b + s) % 3] + 12), t0 + s * BEAT / 2, 0.6)
            if bar:
                add(m["bass"], sub(root - 12, 4 * BEAT), t0, 0.5)
        elif b < 78 or 96 <= b < 114:
            full = 54 <= b < 78 or 108 <= b < 114
            light = 96 <= b < 108
            add(m["drums"], K, t0, 0.8 if light else 1.0)
            if b % 2 == 1:
                add(m["drums"], CL, t0, 0.8)
                if full:
                    add(m["drums"], SN, t0, 0.3)
            add(m["drums"], HC, t0 + BEAT / 2, 0.8)
            if b >= 40 and not light:
                add(m["drums"], HC, t0 + BEAT / 4, 0.35)
                add(m["drums"], HC, t0 + 3 * BEAT / 4, 0.35)
            if full and b % 4 == 3:
                add(m["drums"], HO, t0 + BEAT / 2, 0.5)
            for s in (0, 2, 3):
                add(m["bass"], bass(root - 12 if s == 0 else root, S16 * 1.7), t0 + s * S16, 0.9)
            arp = [tri[0], tri[1], tri[2], tri[1] + 12]
            for s in range(4):
                if s % 2 == 0 or b >= 30:
                    add(m["keys"], pluck(arp[s] + (24 if full else 12)), t0 + s * S16, 0.85 if s == 0 else 0.55)
            if 108 <= b < 114 and bar:
                add(m["keys"], brass([root, root + 7, root + 12]), t0, 0.7)
        elif 78 <= b < 86:  # tension
            if bar:
                add(m["pad"], sub(26, 4 * BEAT + 0.1), t0, 0.55)
                add(m["pad"], strings([62, 65, 69], 4 * BEAT), t0, 0.35)
            steps = 2 if b < 82 else 4
            for s in range(steps):
                add(m["fx"], TK, t0 + s * BEAT / steps, 1.0)
        elif 86 <= b < 90:  # after DENIED: heartbeat
            add(m["drums"], K, t0, 0.35)
        elif 90 <= b < 96:
            if b == 90:
                add(m["pad"], strings([62, 66, 69, 74], 3.0), t0, 0.9)
            if b % 2 == 0:
                add(m["drums"], K, t0, 0.4)

    add(m["fx"], riser(4 * BEAT), at(10) - 4 * BEAT, 0.5)
    add(m["fx"], riser(8 * BEAT), at(86) - 8 * BEAT, 0.85)
    add(m["fx"], impact(), at(86), 1.0)
    add(m["fx"], riser(4 * BEAT), at(96) - 4 * BEAT, 0.5)
    add(m["fx"], impact(), at(114), 0.8)
    add(m["pad"], strings([62, 66, 69, 74, 78], 6.0), at(114), 1.4)
    add(m["bass"], sub(26, 4.0), at(114), 0.9)
    add(m["keys"], brass([38, 50, 57, 62]), at(114), 0.9)

    mix = (m["drums"] * 0.95 + m["bass"] * 0.85 + reverb(m["keys"], 0.3) * 0.85 + reverb(m["pad"], 0.4) * 0.7 + reverb(m["fx"], 0.2) * 0.8)
    mix = np.tanh(mix * 1.3) / np.tanh(1.3)
    mix = mix[: int(TOTAL * SR)]
    fade = int(2.0 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.9
    st = np.stack([mix, np.roll(mix, int(0.008 * SR))], axis=1)
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print(f"apolio score {TOTAL}s @ {BPM} BPM -> {out} (denied hit {at(86):.1f}s, logo hit {at(114):.1f}s)")


if __name__ == "__main__":
    main()
