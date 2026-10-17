# QC report

Video: `claude-code-video-edit_v1.mp4`  
Result: **PASS**

| Check | Result | Detail |
|---|---|---|
| resolution | ok | 1080x1920 |
| frame rate | ok | 30.00 fps |
| video codec | ok | h264 |
| audio | ok | aac 48000 Hz |
| duration | ok | 57.20 s (expected 57.17 s) |
| duration target | ok | 57.2 s vs target 30 to 60 s |
| decodes clean | ok | no decode errors |
| no black frames | ok | none |
| no freezes in the body | ok | none (outro hold is intentional) |
| no silent gaps | ok | none |
| loudness | ok | -14.7 LUFS (target -14) |
| true peak | ok | -1.5 dBTP |
| safe area | ok | nothing drawn within 60 px of the sides |
| brand ending | ok | lime px 25, cream px 505 |

Still needs human eyes: overlapping elements, pacing and readability, visual taste and continuity, voice delivery.
