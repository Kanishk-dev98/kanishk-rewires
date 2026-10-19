import sys, json, subprocess
sys.path.insert(0, '.')
import pub
pub.start()
IG = "instagram-17841455766111340"
assert any(c["platformId"] == IG and c["username"] == "kanishk.rewires" for c in pub.tool("list_connections", {})["connections"])
D = "/Users/kanishk.raj/Downloads/Kanishk.Rewires/harness2-explainer/"
CAP = """Google researchers just open-sourced a way for AI agents to upgrade themselves 🤯

It's called Harness² (Harness squared). Instead of retraining the model, it improves everything around it: the prompts, tools, memory and skills.

How it works:
1. Proposes two fixes
2. Tests both on the same task
3. Keeps only what actually worked
4. Saves the lessons, so the next task starts smarter

In the paper, one round lifted a model by 11.5 points on WorkBuddy-Bench, with the exact same weights.

Comment "harness" and I'll send you the GitHub link 👇

Built by researchers at Google Cloud AI Research and Northwestern University (open source, Apache 2.0) @google

#aiagents #opensource #google #ai"""
assert "—" not in CAP and "–" not in CAP
def upload(gid, path, name, ctype, kind):
    u = pub.tool("get_upload_url", {"postGroupId": gid, "fileName": name, "contentType": ctype, "type": kind})
    subprocess.run(["curl", "-sf", "-X", "PUT", "-H", f"Content-Type: {ctype}", "--upload-file", path, u["uploadUrl"]], check=True)
    return pub.tool("complete_media", {"mediaId": u["mediaId"]})["mediaFile"]
st = json.load(open("cover_state.json"))
cov = upload(st["holder"], D + "cover_9x16_4k.jpg", "harness2-cover.jpg", "image/jpeg", "image")
gid = pub.tool("create_post", {"content": CAP, "platforms": [IG]})["postGroupId"]
v = upload(gid, D + "harness2-explainer_v1.mp4", "harness2-explainer.mp4", "video/mp4", "video")
r = pub.tool("update_post", {"postGroupId": gid, "publishNow": True, "platformSettings": {"instagram": {"coverUrl": cov["url"]}}})
print(v["status"], v["metadata"].get("width"), v["metadata"].get("height"), r.get("success"), r.get("message"))
json.dump({"gid": gid}, open("h2_state.json", "w"))
