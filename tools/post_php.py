import sys, json, subprocess
sys.path.insert(0, '.')
import pub
pub.start()
IG = "instagram-17841455766111340"
assert any(c["platformId"] == IG and c["username"] == "kanishk.rewires" for c in pub.tool("list_connections", {})["connections"])
D = "/Users/kanishk.raj/Downloads/Kanishk.Rewires/php2shell/"
CAP = """💬 Comment "PATCH" and I'll DM you the 2-minute check + the exact message to send your host 📩

AI just found a 10-year-old bug in the code behind 70% of the internet 🤯

It's called PHP2Shell. Two critical flaws (9.2/10) in PHP, the code that runs WordPress, online shops and government portals.
→ Anyone could take over a site without logging in
→ And read its passwords and API keys
→ Found with AI by researchers at @openai and Wiz. One researcher did in a week what used to take a team months

Governments across Europe took their own sites offline to patch. Even the Dutch cyber security agency.

If you own a website, do this today:
✅ Ask your host: "Is our PHP patched against PHP2Shell?"
✅ Safe versions: 8.5.12 · 8.4.27 · 8.3.36 · 8.2.35
✅ A WordPress update won't fix this. Only your host can.

Send this to a friend who runs a website 🔁
Follow @kanishk.rewires for AI news that actually matters to your business 🔔

(Sources: Wiz, CISA, CNN, CBS. Oct 21, 2026)

#cybersecurity #php #wordpress #ai #websitesecurity #smallbusiness #aiNews"""
assert "—" not in CAP and "–" not in CAP
def upload(gid, path, name, ctype, kind):
    u = pub.tool("get_upload_url", {"postGroupId": gid, "fileName": name, "contentType": ctype, "type": kind})
    subprocess.run(["curl", "-sf", "-X", "PUT", "-H", f"Content-Type: {ctype}", "--upload-file", path, u["uploadUrl"]], check=True)
    return pub.tool("complete_media", {"mediaId": u["mediaId"]})["mediaFile"]
st = json.load(open("cover_state.json"))
cov = upload(st["holder"], D + "cover_9x16_4k.jpg", "php2shell-cover.jpg", "image/jpeg", "image")
gid = pub.tool("create_post", {"content": CAP, "platforms": [IG]})["postGroupId"]
v = upload(gid, D + "php2shell_v1.mp4", "php2shell.mp4", "video/mp4", "video")
r = pub.tool("update_post", {"postGroupId": gid, "publishNow": True, "platformSettings": {"instagram": {"coverUrl": cov["url"]}}})
print(v["status"], v["metadata"].get("width"), v["metadata"].get("height"), r.get("success"), r.get("message"))
json.dump({"gid": gid}, open("php_state.json", "w"))
