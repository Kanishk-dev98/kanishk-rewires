#!/bin/sh
# Copy Kanishk.Rewires memories from Claude Code's local memory folders into docs/memory/ so they are
# versioned on GitHub. Only Rewires-relevant files are copied; other projects' memories (and anything
# holding credentials) stay local. Re-run after memories change, then commit.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/docs/memory"
A="$HOME/.claude/projects/-Users-kanishk-raj-kanishk-rewires/memory"
B="$HOME/.claude/projects/-Users-kanishk-raj-claude-md/memory"
mkdir -p "$DEST"
cp "$A"/*.md "$DEST"/ 2>/dev/null || true
mv "$DEST/MEMORY.md" "$DEST/INDEX-rewires-project.md" 2>/dev/null || true
for f in video-agent-project motion-reference-harness2 voiceover-mix-standard reference-benchmark-channel-study; do
  [ -f "$B/$f.md" ] && cp "$B/$f.md" "$DEST/"
done
# refuse to commit anything that looks like a credential
if grep -lE "ghp_[A-Za-z0-9]{10}|github_pat_|sk-[A-Za-z0-9]{20}|Bearer [A-Za-z0-9]" "$DEST"/*.md; then
  echo "credential-like string found above; not safe to commit" >&2; exit 1
fi
echo "synced $(ls "$DEST" | wc -l | tr -d ' ') files to docs/memory/"
