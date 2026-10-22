import sys, json, subprocess
sys.path.insert(0, '.')
import pub
pub.start()
IG = "instagram-17841455766111340"
assert any(c["platformId"] == IG and c["username"] == "kanishk.rewires" for c in pub.tool("list_connections", {})["connections"])
D = "/Users/kanishk.raj/Downloads/Kanishk.Rewires/claude-sales-team/"
CAP = """You don't need 5 SDRs. You need Claude Code 🤯

Here's the exact 8-step setup I'd use to build a full sales team on @claudeai:

1. Connect Apollo, Gmail and @hubspot
2. Write your ideal customer in one file
3. Pull every matching company
4. Research and score the fit
5. Find decision makers and verify emails
6. Ads, personal email and LinkedIn, from one list
7. Follow up on every reply, click and view
8. Log it all in the CRM, and approve before anything goes out ✅

Comment SALES and I'll DM you the full setup, the ICP template and my exact prompts 👇

Save this so you don't lose it.

(Example numbers, illustrative)

#claudecode #aiagents #salesautomation #b2bsales #leadgeneration #ai"""
assert "—" not in CAP and "–" not in CAP
def upload(gid, path, name, ctype, kind):
    u = pub.tool("get_upload_url", {"postGroupId": gid, "fileName": name, "contentType": ctype, "type": kind})
    subprocess.run(["curl", "-sf", "-X", "PUT", "-H", f"Content-Type: {ctype}", "--upload-file", path, u["uploadUrl"]], check=True)
    return pub.tool("complete_media", {"mediaId": u["mediaId"]})["mediaFile"]
st = json.load(open("cover_state.json"))
cov = upload(st["holder"], D + "cover_9x16_4k_v2.jpg", "claude-sales-team-cover.jpg", "image/jpeg", "image")
gid = pub.tool("create_post", {"content": CAP, "platforms": [IG]})["postGroupId"]
v = upload(gid, D + "claude-sales-team_v2.mp4", "claude-sales-team.mp4", "video/mp4", "video")
r = pub.tool("update_post", {"postGroupId": gid, "publishNow": True, "platformSettings": {"instagram": {"coverUrl": cov["url"]}}})
print(v["status"], v["metadata"].get("width"), v["metadata"].get("height"), r.get("success"), r.get("message"))
json.dump({"gid": gid}, open("sales_state.json", "w"))
