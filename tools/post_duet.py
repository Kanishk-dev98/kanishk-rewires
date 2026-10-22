import sys, json, subprocess
sys.path.insert(0, '.')
import pub
pub.start()
IG = "instagram-17841455766111340"
assert any(c["platformId"] == IG and c["username"] == "kanishk.rewires" for c in pub.tool("list_connections", {})["connections"])
D = "/Users/kanishk.raj/Downloads/Kanishk.Rewires/claude-duet/"
CAP = """Your laptop is off. Your AI is still working 🤯

@claudeai just launched Claude Duet, an always-on agent that runs on its own cloud computer:

☀️ Sends you a morning brief of what's urgent
📬 Checks your email, calendar and apps every few hours
📊 Does the work: follow-ups, meeting prep, decks, dashboards
🔒 Never sends, pays, signs or deletes without your OK

How it stacks up:
Muse by @meta: free, built for personal errands
Grok Bot: needs an X subscription, from $30
Dots by @openai: from $100/month
Duet: included in Claude Pro at $20

How to get it: join the waitlist on claude.com with your Claude email (US preview, Pro and Max for now).

Muse, Grok Bot, Dots or Duet? Which one would you trust with your inbox? Tell me below 👇

(Prices from launch coverage, Oct 2026. Example data in the demo is illustrative.)

#claudeduet #claude #aiagents #anthropic #ai #productivity"""
assert "—" not in CAP and "–" not in CAP
def upload(gid, path, name, ctype, kind):
    u = pub.tool("get_upload_url", {"postGroupId": gid, "fileName": name, "contentType": ctype, "type": kind})
    subprocess.run(["curl", "-sf", "-X", "PUT", "-H", f"Content-Type: {ctype}", "--upload-file", path, u["uploadUrl"]], check=True)
    return pub.tool("complete_media", {"mediaId": u["mediaId"]})["mediaFile"]
st = json.load(open("cover_state.json"))
cov = upload(st["holder"], D + "cover_9x16_4k.jpg", "claude-duet-cover.jpg", "image/jpeg", "image")
gid = pub.tool("create_post", {"content": CAP, "platforms": [IG]})["postGroupId"]
v = upload(gid, D + "claude-duet_v1.mp4", "claude-duet.mp4", "video/mp4", "video")
r = pub.tool("update_post", {"postGroupId": gid, "publishNow": True, "platformSettings": {"instagram": {"coverUrl": cov["url"]}}})
print(v["status"], v["metadata"].get("width"), v["metadata"].get("height"), r.get("success"), r.get("message"))
json.dump({"gid": gid}, open("duet_state.json", "w"))
