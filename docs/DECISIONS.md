# Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-10-14 | Instagram Reels, 30–45 s first, then ≥60 s cinematic | User request |
| 2026-10-14 | Zero-spend stack: Remotion + Edge TTS + code-generated music/SFX + FFmpeg | User asked to do it without spending anything beyond Claude Code |
| 2026-10-14 | Remotion over Revideo | Channel is the user's **personal** account → Remotion free licence applies. Revideo (MIT) is the fallback if it becomes a company channel |
| 2026-10-14 | Cream/light backgrounds for informational scenes | User: "make background creamy or white, it looks great" |
| 2026-10-14 | Voice: Edge TTS `en-US-AndrewMultilingualNeural`, rate +8% | Free, warm/confident; gives word timestamps for captions. Risk: unofficial service → fallback Kokoro or Piper (offline) |
| 2026-10-14 | Music: synthesized pad + arpeggio (`pipeline/make_music.py`), volume 0.14–0.16 | Royalty-free, no copyright strikes. Upgrade path: user-chosen Pixabay / YouTube Audio Library tracks |
| 2026-10-14 | Loudness −14 LUFS, AAC 48 kHz | Instagram feed loudness; loudnorm had upsampled to 96 kHz |
| 2026-10-14 | Cinematic "Story" engine with 9 scene types, ~76 s | User: "Marvel-grade", more colours, explain more, ≥1 min, same voice and music |
| 2026-10-14 | Fact correction: ChatGPT was fastest-growing consumer app **at the time** | Threads passed 100M sign-ups in 5 days in July 2023 |
| 2026-10-14 | Race chart labels inside an 80 px safe margin; reveal rebuilt as milestone card → counter → slam | User feedback on v3 |
| 2026-10-15 | Daily batch on our engine; OpenMontage only for hero videos + reference analysis | OpenMontage is interactive and heavy per video; see `references/README.md` |
| 2026-10-15 | Recommend 5 reels/day for the first 2 weeks, then 10 | New accounts posting 10/day can be flagged as spam |
| 2026-10-15 | Abstraxn film on Remotion (free licence) | Personal portfolio piece by an individual; company adoption would need a Company License or a HyperFrames port |
| 2026-10-15 | Abstraxn film: no burned-in captions, SRT for YouTube instead | Institutional/Apple style keeps frames clean; YouTube CC covers accessibility |

## Paid upgrades (not adopted yet)

| Upgrade | Cost | Gain |
|---|---|---|
| ElevenLabs voice | ~$5–22/month | Most human voice; biggest single quality jump |
| Kling / Runway / Veo clips | Pay per clip | Cinematic AI b-roll |
| HeyGen avatar | ~$29+/month | On-camera presenter |
| Remotion Company License | See remotion.pro | Only if the channel becomes a company (>3 employees) asset |

## Known data sources used

- UBS / Similarweb (2023): time to 100M users (Netflix 18 yrs, Spotify 11, Twitter 5, Facebook 4.5, Instagram 2.5, TikTok 9 months, ChatGPT 2 months)
- ChatGPT launch 2022-11-30; 1M users in 5 days
- Germany population ~84M
