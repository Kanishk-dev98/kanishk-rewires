# QC report

Video: `google-ai-review-ads_v3.mp4`  
Result: **FAIL**

| Check | Result | Detail |
|---|---|---|
| resolution | ok | 1080x1920 |
| frame rate | ok | 30.00 fps |
| video codec | ok | h264 |
| audio | ok | aac 48000 Hz |
| duration | ok | 42.70 s (expected 42.67 s) |
| duration target | ok | 42.7 s vs target 30 to 60 s |
| decodes clean | ok | no decode errors |
| no black frames | ok | none |
| no freezes in the body | ok | none (outro hold is intentional) |
| no silent gaps | ok | none |
| loudness | ok | -14.0 LUFS (target -14) |
| true peak | ok | -1.5 dBTP |
| safe area | ERROR | s03 @ 16.0s (7243 px); s03 @ 19.6s (24551 px); s04 @ 24.6s (230400 px) |
| brand ending | ok | lime px 27, cream px 437 |

Still needs human eyes: overlapping elements, pacing and readability, visual taste and continuity, voice delivery.
