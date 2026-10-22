---
name: publora-accounts-separate
description: Two different Publora accounts exist; the claude.ai Publora connector is Rohit's (@roheit.ai), never use it for Alok's posts
metadata:
  type: project
---

On 2026-10-17 the user (Alok Diwan) clarified that there are two separate Publora accounts belonging to two separate people.

- **claude.ai "Publora" connector** (tools `mcp__claude_ai_Publora__*`, server `https://mcp.publora.com`): this is **Rohit's** account. It has Instagram **@roheit.ai** and LinkedIn "Rohit Kaushal". Rohit runs his own project from Alok's Claude. **Never post, upload or schedule anything of Alok's through it, and never link the two.**
- **Alok's own Publora account** is reached through the user-scope Claude Code MCP server named **`publora`** (`claude mcp add --transport http --scope user publora https://mcp.publora.com/mcp`, added 2026-10-17). It authenticates with OAuth through `/mcp` in an interactive session. Alok's Instagram is connected there.

**Why:** Posting Alok's content to Rohit's accounts (or the reverse) would publish to the wrong person's page.

**How to apply:** Before any Publora action, use only the `publora` server's tools (not `claude_ai_Publora`). List its connections first and confirm the target account is Alok's before uploading or scheduling. If only the claude.ai connector is available, stop and ask the user to authenticate `publora` with `/mcp`.

**Update 2026-10-17:** Alok's `publora` server is now set up with an API-key header in `~/.claude.json`. The user pasted the key in chat, so it should be rotated after the first post. Its only connection is Instagram **@kanishk.rewires** (`instagram-17841455766111340`). When its tools aren't loaded in a session, it can be called over HTTP JSON-RPC, but it needs a non-Python User-Agent (Cloudflare returns 403 for Python-urllib). Publishing state per video lives in `projects/<slug>/reports/publish.json`.
