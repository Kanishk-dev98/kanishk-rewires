# Video Agent: notes for Claude

Read `README.md` and `docs/BRAIN.md`, then `docs/ROADMAP.md` (what's next and what's waiting on the user) and `docs/DECISIONS.md` (why things are the way they are) before changing anything.

- Render engine: Remotion in `studio/`. Its official skills are in `studio/.agents/skills/remotion-best-practices/`; load them before writing Remotion code.
- Animations must be driven by `useCurrentFrame()` + `interpolate()`/`spring()`. CSS transitions do not render.
- Keep key text inside the safe area: ≥80 px from the sides, ≥100 px from top/bottom. Captions sit at y≈1330; keep scene content from overlapping 1300–1450.
- Every stat in a script needs a source; put it in the spec's `source` field and in `docs/DECISIONS.md`.
- After a render, sample frames (bundle once with `npx remotion bundle`, then `npx remotion still` per scene) and look at them before calling a reel done.
- Never commit API keys. Put them in `.env` (git-ignored).
- The user's Instagram channel is a **personal** account. If that changes, revisit the Remotion licence.
