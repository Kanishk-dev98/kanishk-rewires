# Source ledger: How to edit videos with Claude Code: the workflow this studio actually uses

Researched: 2026-10-17

- **c1** (fact, event 2026-10-14): Remotion publishes official agent skills in the GitHub repo remotion-dev/skills, installed with the `skills` CLI (npx skills add remotion-dev/skills). This studio has 12 of them installed.
  - Remotion, "remotion-dev/skills", published n/a: https://github.com/remotion-dev/skills
  - this repo, "skills-lock.json (12 skills, source remotion-dev/skills)", published 2026-10-14: studio/skills-lock.json
  - Note: Verified locally from skills-lock.json; the update command in .claude/skills/remotion-upgrade uses `npx skills`.
- **c2** (fact, event 2026-10-17): Reference analysis pulls frames with FFmpeg and a word-timed transcript with Whisper (faster-whisper), then maps every cut.
  - this repo, "Reference analysis done in this repo", published 2026-10-17: research/reference-videos/ref-1000319940/ANALYSIS.md
  - Note: This is exactly the process used for this video.
- **c3** (fact, event 2026-10-14): A free AI voice is available through edge-tts (Microsoft Edge neural voices); recorded narration is also supported by the pipeline.
  - GitHub, "edge-tts", published n/a: https://github.com/rany2/edge-tts
  - Note: Unofficial service; free to use, no key.

## Open questions

- What the CTA delivers (skills setup, brand template, prompts) must be prepared before posting.
