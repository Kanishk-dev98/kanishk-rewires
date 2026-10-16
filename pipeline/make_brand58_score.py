"""Music placeholder for the 58 s Abstraxn brand film: minimal electronic, 118 BPM, A minor.

Beat map (matches studio/src/film58/Film58.tsx):
  0-8   intro: sub pulse, clicks, filtered pad rising
  8-13  build: kick on the beat, 8th hats
  13-16 explosion: 16th hats, snare roll, riser
  16-22 near silence: low drone only
  22-77 groove: four-on-floor, claps, offbeat hats, bass, pluck arp, pads
  77    FULL STOP (S10 hold) ... silence until the verify tick
  86    return on the tick with an impact, then full energy through the stack coda
  102   resolve: chord + soft kick, ring out, quiet tail for the end-screen hold

Usage: python make_brand58_score.py <out.wav>
"""
import sys
import wave

import numpy as np

sys.path.insert(0, __import__("os").path.dirname(__file__))
from make_epic_score import (  # noqa: E402
    SR, add, hat, highpass, hz, impact, kick, lowpass, reverb, riser, saw, snare, strings, sub, t_arr,
)

BPM = 118
BEAT = 60 / BPM
S16 = BEAT / 4
TOTAL = 58.0
STOP, RETURN, RESOLVE = 77, 86, 102

# Am - F - C - G, two beats... one chord per bar (4 beats)
PROG = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]


def clap():
    t = t_arr(0.25)
    n = highpass(np.random.default_rng(5).standard_normal(len(t)), 900)
    env = np.exp(-t * 22) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0))
    return n * env * 0.5


def pluck(m, length=S16 * 1.6):
    t = t_arr(length)
    return lowpass(saw(hz(m), t, 10, 1.2) * np.exp(-t / 0.08), 3500) * 0.16


def bass_note(m, length):
    t = t_arr(length)
    env = np.minimum(1, t / 0.005) * np.exp(-t / 0.25)
    return lowpass(saw(hz(m), t, 8, 1.0), 600) * env * 0.35


def click():
    t = t_arr(0.03)
    return np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 200) * 0.15


def main():
    out = sys.argv[1]
    n = int((TOTAL + 1) * SR)
    mix = {k: np.zeros(n) for k in ("drums", "bass", "keys", "pad", "fx")}
    K, SN, CL, HC, HO, CK = kick(), snare(), clap(), hat(), hat(True), click()
    at = lambda b: b * BEAT  # noqa: E731

    total_beats = int(TOTAL / BEAT) + 1
    for b in range(total_beats):
        if STOP <= b < RETURN:
            continue  # full stop
        bar = b // 4
        root, triad = PROG[bar % 4]
        on_bar = b % 4 == 0
        t0 = at(b)
        if on_bar and b < RESOLVE:
            gain = 0.5 if b < 8 else 0.25 if 16 <= b < 22 else 0.8
            add(mix["pad"], strings([m + 12 for m in triad], 4 * BEAT + 0.2), t0, gain)
        if b < 8:
            add(mix["bass"], sub(root - 12, BEAT * 0.9), t0, 0.6)
            for s in range(2):
                add(mix["fx"], CK, t0 + s * BEAT / 2, 1 if s == 0 else 0.5)
        elif b < 16:
            add(mix["drums"], K, t0, 0.9)
            add(mix["bass"], sub(root - 12, BEAT * 0.9), t0, 0.8)
            steps = 2 if b < 13 else 4
            for s in range(steps):
                add(mix["drums"], HC, t0 + s * BEAT / steps, 0.7)
            if b >= 13:
                for s in range(4):
                    add(mix["drums"], SN, t0 + s * S16, 0.25 + 0.15 * (b - 13) + 0.05 * s)
        elif b < 22:
            if on_bar:
                add(mix["pad"], sub(33, 4 * BEAT), t0, 0.35)
        elif b < RESOLVE:
            hot = b >= RETURN
            add(mix["drums"], K, t0, 1.0)
            if b % 2 == 1:
                add(mix["drums"], CL, t0, 0.8)
                if hot:
                    add(mix["drums"], SN, t0, 0.4)
            add(mix["drums"], HC, t0 + BEAT / 2, 0.8)
            if hot or 61 <= b < 77:
                add(mix["drums"], HC, t0 + BEAT / 4, 0.4)
                add(mix["drums"], HC, t0 + 3 * BEAT / 4, 0.4)
            if b % 4 == 3:
                add(mix["drums"], HO, t0 + BEAT / 2, 0.5)
            for s in (0, 2, 3):
                add(mix["bass"], bass_note(root - 12 if s == 0 else root, S16 * 1.8), t0 + s * S16, 0.9)
            arp = [triad[0], triad[2], triad[1] + 12, triad[2]]
            for s in range(4):
                if s % 2 == 0 or b >= 36:
                    add(mix["keys"], pluck(arp[s] + 12), t0 + s * S16, 0.9 if s == 0 else 0.6)
        else:  # resolve
            if b == RESOLVE:
                add(mix["fx"], impact(), t0, 0.7)
                add(mix["pad"], strings([69, 72, 76, 81], 7.0), t0, 1.3)
                add(mix["bass"], sub(33, 4.0), t0, 0.9)
            if b < RESOLVE + 6:
                add(mix["drums"], K, t0, 0.5 * (1 - (b - RESOLVE) / 6))
                add(mix["keys"], pluck(PROG[0][1][(b - RESOLVE) % 3] + 24), t0, 0.5)

    # transitions
    add(mix["fx"], riser(5 * BEAT), at(16) - 5 * BEAT, 0.7)       # into the explosion end
    add(mix["fx"], riser(3 * BEAT), at(22) - 3 * BEAT, 0.5)       # out of the silence
    add(mix["fx"], impact(), at(RETURN), 0.8)                      # music returns on the verify tick
    add(mix["fx"], riser(4 * BEAT), at(RESOLVE) - 4 * BEAT, 0.6)

    m = (mix["drums"] * 0.95 + mix["bass"] * 0.9 + reverb(mix["keys"], 0.3) * 0.8
         + reverb(mix["pad"], 0.4) * 0.7 + reverb(mix["fx"], 0.2) * 0.8)
    m = np.tanh(m * 1.3) / np.tanh(1.3)
    # hard silence across the stop (kill reverb tails too)
    m[int(at(STOP) * SR):int(at(RETURN) * SR)] = 0
    m = m[: int(TOTAL * SR)]
    fade = int(2.5 * SR)
    m[-fade:] *= np.linspace(1, 0, fade)
    m = m / (np.max(np.abs(m)) + 1e-9) * 0.9
    st = np.stack([m, np.roll(m, int(0.008 * SR))], axis=1)
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print(f"brand58 score {TOTAL}s @ {BPM} BPM -> {out} (stop {at(STOP):.2f}s, return {at(RETURN):.2f}s)")


if __name__ == "__main__":
    main()
