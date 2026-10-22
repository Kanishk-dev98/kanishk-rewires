# QC report

Video: `grok-bot_v3.mp4`  
Result: **PASS**

| Check | Result | Detail |
|---|---|---|
| resolution | ok | 1080x1920 |
| frame rate | ok | 30.00 fps |
| video codec | ok | h264 |
| audio | ok | aac 48000 Hz |
| duration | ok | 54.30 s (expected 54.23 s) |
| duration target | ok | 54.3 s vs target 30 to 60 s |
| decodes clean | ok | no decode errors |
| no black frames | ok | none |
| no freezes in the body | ok | none (outro hold is intentional) |
| no silent gaps | ok | none |
| loudness | ok | -14.0 LUFS (target -14) |
| true peak | ok | -1.5 dBTP |
| safe area | ok | nothing drawn within 60 px of the sides (full-bleed scenes not checked: s00, s01, s02, s03, s04, s05, s06) |
| brand ending | ok | lime px 29, cream px 473 |

Still needs human eyes: overlapping elements, pacing and readability, visual taste and continuity, voice delivery.
