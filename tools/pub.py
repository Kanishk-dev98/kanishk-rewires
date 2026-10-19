"""Minimal MCP client for Alok's Publora server (key read from ~/.claude.json at runtime, never stored or printed).
Use only with the user-scope 'publora' server (Alok's account), never the claude.ai Publora connector (Rohit's)."""
import json, urllib.request, pathlib
cfg = json.load(open(pathlib.Path.home() / ".claude.json"))
srv = cfg["mcpServers"]["publora"]
URL, AUTH = srv["url"], srv["headers"]["Authorization"]
_sid = None
def rpc(method, params=None, id_=1, notify=False):
    global _sid
    body = {"jsonrpc": "2.0", "method": method}
    if params is not None: body["params"] = params
    if not notify: body["id"] = id_
    h = {"User-Agent": "curl/8.7.1", "Authorization": AUTH, "Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
    if _sid: h["Mcp-Session-Id"] = _sid
    r = urllib.request.urlopen(urllib.request.Request(URL, json.dumps(body).encode(), h), timeout=120)
    _sid = r.headers.get("Mcp-Session-Id") or _sid
    txt = r.read().decode()
    if notify: return None
    for line in txt.splitlines():
        line = line[6:] if line.startswith("data: ") else line
        if line.startswith("{"):
            d = json.loads(line)
            if "error" in d: raise RuntimeError(d["error"])
            return d["result"]
def start():
    rpc("initialize", {"protocolVersion": "2025-03-26", "capabilities": {}, "clientInfo": {"name": "rewires", "version": "1"}})
    rpc("notifications/initialized", notify=True)
def tool(name, args):
    res = rpc("tools/call", {"name": name, "arguments": args}, id_=2)
    t = "".join(c.get("text", "") for c in res.get("content", []))
    try: return json.loads(t)
    except Exception: return {"raw": t, "isError": res.get("isError")}
