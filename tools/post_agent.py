import sys, json, subprocess
sys.path.insert(0, '.')
import pub
pub.start()
IG = "instagram-17841455766111340"
assert any(c["platformId"] == IG and c["username"] == "kanishk.rewires" for c in pub.tool("list_connections", {})["connections"])
D = "/Users/kanishk.raj/Downloads/Kanishk.Rewires/agent-goa-offsite/"
CAP = """I gave an AI agent one job: plan our team offsite in Goa 🌴

It checked 12 calendars, compared flights from 3 cities, shortlisted villas, built the itinerary, sent the invites, and came in ₹16,000 under budget.

And it never paid without my OK ✅

That's the difference between a chatbot and an agent. One answers. The other gets it done.

What would you hand to an AI agent first? Tell me below 👇

(Example task, illustrative numbers)

#aiagents #ai #productivity #futureofwork"""
assert "—" not in CAP and "–" not in CAP
def upload(gid, path, name, ctype, kind):
    u = pub.tool("get_upload_url", {"postGroupId": gid, "fileName": name, "contentType": ctype, "type": kind})
    subprocess.run(["curl", "-sf", "-X", "PUT", "-H", f"Content-Type: {ctype}", "--upload-file", path, u["uploadUrl"]], check=True)
    return pub.tool("complete_media", {"mediaId": u["mediaId"]})["mediaFile"]
st = json.load(open("cover_state.json"))
cov = upload(st["holder"], D + "cover_9x16_4k.jpg", "agent-goa-offsite-cover.jpg", "image/jpeg", "image")
gid = pub.tool("create_post", {"content": CAP, "platforms": [IG]})["postGroupId"]
v = upload(gid, D + "agent-goa-offsite_v2.mp4", "agent-goa-offsite.mp4", "video/mp4", "video")
r = pub.tool("update_post", {"postGroupId": gid, "publishNow": True, "platformSettings": {"instagram": {"coverUrl": cov["url"]}}})
print(v["status"], v["metadata"].get("width"), v["metadata"].get("height"), r.get("success"), r.get("message"))
json.dump({"gid": gid}, open("agent_state.json", "w"))
