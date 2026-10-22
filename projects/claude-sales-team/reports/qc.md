# QC report

Video: `claude-sales-team_v2.mp4`  
Result: **PASS**

| Check | Result | Detail |
|---|---|---|
| resolution | ok | 1080x1920 |
| frame rate | ok | 30.00 fps |
| video codec | ok | h264 |
| audio | ok | aac 48000 Hz |
| duration | ok | 82.20 s (expected 82.13 s) |
| duration target | WARNING | 82.2 s vs target 30 to 60 s |
| decodes clean | ok | no decode errors |
| no black frames | ok | none |
| no freezes in the body | ok | none (outro hold is intentional) |
| no silent gaps | ok | none |
| loudness | ok | -14.1 LUFS (target -14) |
| true peak | ok | -1.5 dBTP |
| safe area | ok | nothing drawn within 60 px of the sides (full-bleed scenes not checked: s00, s01, s02, s03, s04, s05, s06, s07, s08, s09) |
| brand ending | ok | lime px 29, cream px 474 |

Still needs human eyes: overlapping elements, pacing and readability, visual taste and continuity, voice delivery.
