# Built: 16:9 promo library (from ref-1000320070)

`studio/src/rewires/promo.tsx` implements catalogue techniques 1 to 14 and 22 as scene types (16:9 first, and they scale):

| Scene type | Technique |
|---|---|
| `pKinetic` | kinetic sentence (words, accent, `particles`: specks or symbols, `scramble`, `prefix`/`suffix`, `icon`) |
| `pLogoCloud` | logo tiles in depth with drift, plus a centre line |
| `pPixel` | pixel-mosaic frame around a kinetic line |
| `pBracket` | corner brackets "Meet" |
| `pBrand` | K·R monogram plus typed mono wordmark |
| `pCardStack` | log cards scrolling over a graded photo |
| `pAgentLog` | streaming agent log with error pills |
| `pInlineTask` | inline icon sentence that zooms into a task window |
| `pPromptAgents` | prompt bar typing, then agent logo chips |
| `pAvatars` | avatar collage with a word pill |
| `pStartTask` | task card with a named cursor pressing Start |
| `pMascotTerminal` | pixel mascot terminal typing |
| `pIde` | IDE split: files, code, agent panel |
| `pSubmit` | Submit button with a pixel glow |
| `pTiltList` | list whose active item swaps a window over a photo |
| `pBands` | gradient bands with an inline spinner |
| `pChecklist` | focus-scroll checklist |
| `pScoreRows` | grade rows that re-sort |
| `pMeetings` | meeting cards drifting, or bursting into a cluster (`burst`) |
| `pPill` | pill word build that collapses |

Reference project: `projects/promo-ai-native/`. Gotchas: mark full-bleed scenes `bleed: true` for QC, mark music-only scenes `silent: true`, and set `theme` explicitly ("dark" or "cream"). The promo scenes skip the cinematic vignette.
