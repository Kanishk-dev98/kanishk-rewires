# QC report

Video: `google-ai-review-ads_v7.mp4`  
Result: **FAIL**

| Check | Result | Detail |
|---|---|---|
| resolution | ok | 1080x1920 |
| frame rate | ok | 30.00 fps |
| video codec | ok | h264 |
| audio | ok | aac 48000 Hz |
| duration | ok | 41.30 s (expected 41.27 s) |
| duration target | ok | 41.3 s vs target 30 to 60 s |
| decodes clean | ok | no decode errors |
| no black frames | ok | none |
| no freezes in the body | ok | none (outro hold is intentional) |
| no silent gaps | ok | none |
| loudness | ok | -14.0 LUFS (target -14) |
| true peak | ok | -1.5 dBTP |
| safe area | ERROR | s03 @ 13.9s (2293 px); s03 @ 16.9s (90 px) |
| brand ending | ok | lime px 27, cream px 434 |

Still needs human eyes: overlapping elements, pacing and readability, visual taste and continuity, voice delivery.
