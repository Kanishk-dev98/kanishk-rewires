---
name: feedback-install-only-relevant-tools
description: "When the user shares a GitHub repo/plugin link, install it only if it directly serves Kanishk.Rewires reel production; otherwise don't install (and uninstall anything unrelated)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: c88b0989-e0e3-4807-9708-1ed73bba7e2b
  modified: 2026-10-27T10:09:06.552Z
---

On 2026-10-27 the user shared three repos in a row with no note: anthropics/knowledge-work-plugins, DietrichGebert/ponytail and addyosmani/agent-skills. I installed three Knowledge Work plugins (small-business, customer-support, enterprise-search). Then they said: install only what I share if it's related to our work, otherwise uninstall it. I removed all three and the knowledge-work-plugins marketplace. Ponytail and agent-skills were never installed: third-party installs are blocked by the auto-mode safety classifier.

**Why:** they want a lean setup focused on the video studio, not a pile of general-purpose plugins.

**How to apply:**
- "Our work" means making Kanishk.Rewires reels: the Remotion studio, motion/design, VO and music, research for scripts, captions, covers and posting.
- For a shared repo, read it first (clone to the scratchpad, check hooks for network calls). Then judge relevance.
  - Relevant and from Anthropic: install it.
  - Third-party: give the user the `/plugin` commands, since I can't install it myself.
  - Not relevant: say so in one line and don't install.
- A shared repo can also be a reel topic; offer that when it's trending.
- Synced plugins from their claude.ai account are not mine to remove.

Related: [[video-agent-project]]
