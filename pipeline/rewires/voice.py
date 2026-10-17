"""Narration providers behind one interface.

Every provider returns, per scene, (audio_path, duration_s, words) where words is
[(text, start_ms, end_ms)]. Results are cached by a hash of text + voice settings,
so approved narration is never regenerated.
"""
import asyncio
import hashlib
import json
import os
from pathlib import Path

from mutagen import File as MutagenFile


class VoiceNotConfigured(RuntimeError):
    pass


def _key(text: str, settings: dict) -> str:
    return hashlib.sha1(json.dumps([text, settings], sort_keys=True).encode()).hexdigest()[:12]


def _duration(path: Path) -> float:
    return float(MutagenFile(str(path)).info.length)


class EdgeTTS:
    """Microsoft Edge neural voices via the free, unofficial edge-tts service (word timings included)."""

    name = "edge"

    def __init__(self, voice: str, rate: str = "+0%"):
        self.settings = {"voice": voice, "rate": rate}

    async def _one(self, text: str, path: Path):
        import edge_tts

        comm = edge_tts.Communicate(text, self.settings["voice"], rate=self.settings["rate"], boundary="WordBoundary")
        audio, words = bytearray(), []
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                audio += chunk["data"]
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 10_000
                words.append((chunk["text"], start, start + chunk["duration"] / 10_000))
        path.write_bytes(bytes(audio))
        return words

    def synthesize(self, items: list[tuple[str, str]], out_dir: Path) -> dict:
        out_dir.mkdir(parents=True, exist_ok=True)

        async def run():
            res = {}
            todo = []
            for sid, text in items:
                k = _key(text, self.settings)
                mp3, meta = out_dir / f"{sid}.mp3", out_dir / f"{sid}.json"
                if mp3.exists() and meta.exists() and json.loads(meta.read_text()).get("key") == k:
                    m = json.loads(meta.read_text())
                    res[sid] = (mp3, m["duration"], [tuple(w) for w in m["words"]], True)
                else:
                    todo.append((sid, text, k, mp3, meta))
            words_list = await asyncio.gather(*(self._one(t, mp3) for _, t, _, mp3, _ in todo))
            for (sid, text, k, mp3, meta), words in zip(todo, words_list):
                dur = _duration(mp3)
                meta.write_text(json.dumps({"key": k, "text": text, "duration": dur, "words": words, "provider": self.name, **self.settings}))
                res[sid] = (mp3, dur, words, False)
            return res

        return asyncio.run(run())


class Recorded:
    """Human-recorded narration: audio/vo/<scene id>.mp3|wav. Word timings are spread evenly
    across the clip (good enough for captions; forced alignment is a listed upgrade)."""

    name = "recorded"
    settings: dict = {}

    def synthesize(self, items, out_dir: Path) -> dict:
        res = {}
        for sid, text in items:
            path = next((p for p in (out_dir / f"{sid}.mp3", out_dir / f"{sid}.wav") if p.exists()), None)
            if not path:
                raise VoiceNotConfigured(f"recorded narration missing: {out_dir}/{sid}.mp3")
            dur = _duration(path)
            ws = text.split()
            step = dur * 1000 / max(1, len(ws))
            res[sid] = (path, dur, [(w, i * step, (i + 1) * step) for i, w in enumerate(ws)], True)
        return res


class ElevenLabs:
    """Adapter slot for ElevenLabs. Not implemented or tested yet: needs ELEVENLABS_API_KEY and a voice id."""

    name = "elevenlabs"

    def __init__(self, cfg: dict):
        if not os.environ.get(cfg.get("envKey", "ELEVENLABS_API_KEY")) or not cfg.get("voiceId"):
            raise VoiceNotConfigured("ElevenLabs needs ELEVENLABS_API_KEY in .env and voice.elevenlabs.voiceId in config")
        raise VoiceNotConfigured("ElevenLabs adapter is not implemented yet; use provider 'edge' or 'recorded'")


def provider(cfg: dict):
    name = cfg.get("provider", "edge")
    if name == "edge":
        return EdgeTTS(cfg["edge"]["voice"], cfg["edge"].get("rate", "+0%"))
    if name == "recorded":
        return Recorded()
    if name == "elevenlabs":
        return ElevenLabs(cfg.get("elevenlabs", {}))
    raise VoiceNotConfigured(f"unknown voice provider {name!r}")
