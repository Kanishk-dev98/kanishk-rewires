# Sound: music, SFX, silence

Mixing and mastering numbers live in `mix-master.md`. This file is about what to put in the soundtrack and where.

## 1. Music

- **Fresh music for every film.** Never repeat the last film's boom-riser-impact formula. Pick a sound for the film's category and mood (e.g. warm keys, mallets and a soft groove for a calm product film; percussive electronic 113 to 143 BPM for punchy ads; light corporate for roundups).
- **Instrumental only under reading.** Vocal songs under UI text fight the reading.
- **Shape the story with the energy curve**: drive through the problem; a breakdown or quiet passage for the idea or turn; drop back in for the answer. Quiet under UI reading ("room to read", ~−25 to −28 dB RMS), drops on claims, a dip on the contrast beat, pre-drop silence before the final statement.
- **One full drop on the hero beat**, music returning on the answer.
- **Phrase dips**: let the bed breathe at the end of each 6 to 8 s phrase.
- **Resolve before the end card** and hold at least 1 s; a resolved chord or a single chime then a silent hold over the logo and URL works.
- Code-generated or licensed royalty-free beds are fine; generate them on the same beat grid as the picture (a score generator reads `out/<tag>.cues.json`: bpm, scene spans, event times, speech windows) and put stops, drops and hits on the cue times.
- **Avoid**: brick-wall flat beds with no arc, beds that never duck, one bed reused across several films regardless of picture, a cut-down whose dropouts land mid-shot.

## 2. Silences and hits

| Pattern | Numbers | Use |
|---|---|---|
| **Breath and hit** | bed to silence (≤ −40 dB, measured down to −52 dB) for 12 f, the hit on the title's first frame; a second micro-gap (0.1 s) before the next hit | before the product name or a key word |
| **Silence then slam** | the bed cuts to silence on the first word of a pair (0.5 to 0.8 s) and slams back on the completion word | role-pair cards, slogans |
| **Stop-time** | music drops to about −50 dB for a "hmm" wait beat | the doubt or stake beat |
| **Silence before the reveal** | −35 to −42 dB near-silence before a name reveal; −28 dB pre-drop silence before the final drop | name reveal, final statement |
| **Pre-reveal dip** | music dips 0.5 to 1.6 s before each reveal | every reveal |
| **Full drop on the hero** | hard stop for the hold/freeze, then riser → 0.7 s silence → reverse swell → drop 4 f after the cut | the hero moment |
| **Logo sting + silent hold** | music stops; a single mallet chime (bright partials, ~3 s decay); then several seconds of silence over logo + URL | end card |
| **Bumper sting** | 2 to 3-note synth + a tick per word slam | chapter bumpers |

Rule: **no spoken word on a hit.** The impact lands first, the voice starts ≥ 20 f later; a logo boom sits 1.2 s before the brand name is spoken. Put hits in VO breaths.

## 3. SFX palette (foley that sells the UI)

| Event | Sound | Level |
|---|---|---|
| Cursor click, send, approve | soft click | ≈ −24 dBFS peak, ducked under VO |
| Each check / step passing | check tick | ≈ −24 dBFS |
| Held / refused | low "thunk" | ≈ −24 dBFS (the one weighty sound) |
| Pill birth, chip, card arrival | soft pop | quieter than the click |
| Verified / brand moment | short shimmer or chime | sparingly |
| Typing | keyboard tick per character | ≈ −30 dBFS, density capped ~12/s |
| Zoom-through, whip, big sweep | airy whoosh | only on these, never on every cut |
| Counter | light ticks | |
| Stamp | one thud at most per film | |

- Duck SFX under speech too (`sfxUnderVo 0.2 · sfxBetween 0.75`), not just the music. Place effects **between** words, never on them.
- No confetti sounds, no boom on every cut, no impact hits in calm films.
- Social reels: soft pops on boxes and pills, typing ticks, counter ticks, an airy whoosh on flips, toggle clicks, a message ding; no booms.

## 4. Voice

- Voice-over by default: warm, close, a smile in the read; clean and never harsh (de-ess, soften the highs, a little low warmth, gentle compression; the builder's `VO_CHAIN`).
- Pace: **125 to 145 wpm** for films (the best brand films sit at 108 to 125; demos ~147; presenters at 160 to 195 are too fast); 30 to 45 s ads may burst to 150 to 160; social reels 150 to 180, hard cap 185. Breaths of 0.4 to 2 s; reel breaths 0.5 to 1 s only at beat boundaries.
- One claim per sentence, one new noun per clause on a diagram; sentences ~15 to 17 words split into 3 to 6 word clauses (each clause can become one headline).
- One voice carries the film; no second narrator for the tag. Human-voice call-and-response scripts are fine if the voice stays warm.
- Check TTS pronunciation of names, numbers and URLs (write "example dot com", "forty-nine dollars").

## 5. Building the soundtrack in Remotion

- `<Soundtrack vo music mix stem dynamics sfx>` (`src/motion/audio.tsx`): VO lines at full level, music ducked by distance from speech (under 0.12, between 0.5, ramping over 14 f after a 4 f guard), SFX ducked through `SfxGain`, optional `dynamics` keys for silences and drops, `stem` "vo" / "bed" for the mix check.
- `<Sfx name="click" at={frame} volume={0.3} />` plays `public/sfx/click.wav`; put every Sfx inside `<Soundtrack sfx={…}>`.
- Run `pipeline/mix_check.py` after every change to the bed or the SFX.
