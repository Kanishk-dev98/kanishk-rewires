---
name: feedback-reference-style
description: The user's quality bar is the ref-1000319940 tutorial reel; rebuild its grammar in our theme. The wordmark is always lowercase kanishk.rewires, and tutorials end with a comment CTA
metadata:
  type: feedback
---

On 2026-10-17 the user said the LinkedIn reel had "lots and lots of mistakes" in visual fit, voiceover speed and visuals not matching the narration. They shared `~/Downloads/1000319940.mp4` (analysed in `research/reference-videos/ref-1000319940/ANALYSIS.md`) as the bar, and asked for the same animation, text and styling in our theme, with our own script, voice and music.

**Why:** In the reference, every phrase gets its own literal visual within 1 to 2 s. It uses real logos, one big object at a time, a persistent anchor window, keyword captions and a natural voice pace.

**How to apply:**
- Use the tutorial kit (`studio/src/rewires/tut.tsx` and `tutScenes.tsx`). Cue every element to its spoken word with storyboard `cues`, use `accents` for lime caption keywords, and keep the voice at a natural rate (about +4 %). Never speed the voice up to hit a length.
- Use real brand logos (Simple Icons, or the brand's official repo) and our own media. Never reuse the reference creator's footage, face, handle or wording.
- The wordmark is **always lowercase kanishk.rewires, entirely in IBM Plex Mono** (one typeface), kept small.
- End tutorials with Save, then "Comment <KEYWORD>" with a posted comment and a deliverables list.
- See [[feedback-motion-not-typography]].
- Visuals must look real: faithful recreations of product interfaces (LinkedIn, Apollo, HubSpot and so on) in each product's real colours, official logos, and licensed photos (Unsplash, recorded in PROVENANCE.json). Never use typography screenshots as stand-ins for real things. The user suggested Pinterest or Google images; explain that those are copyrighted and use licensed sources instead.
- Scripts must teach how to build the thing step by step, not describe concepts.
- Every Reel needs a cover made from the video's title frame (render the hook with `showCaptions: false`), set before publishing through Publora `platformSettings.instagram.coverUrl`. The URL must be public https: upload it as image media on a holder draft and use the returned S3 URL. Publora can't change a cover after publishing. (User flagged this on 2026-10-17.)
- Not every video is the 7-step tutorial. News or trend pieces (newsjacking) use the cinematic format (`cineScenes.tsx` plus the 3D `cine3d.tsx`). The insight is the product, the news is the hook, and the list is never numbered. The car or other 3D models are licensed CGI with credit, not copyrighted footage (decided by the user on 2026-10-17, project musk-roadster-moment).
- 3D gotchas: load models and HDRIs with delayRender and force one draw (Suspense isn't waited for). Apply KHR_materials_variants manually. The Khronos CarConcept faces +Z (yaw π/2). Keep the ground matte, or the HDRI turns it white. Render with `--gl=angle` at concurrency 3, or the audio extraction times out.
- Real footage (user, 2026-10-17, musk reel v3 to v4): never cut a stunt into jumpy pieces or insert a frozen still mid-action. Use one continuous take, and open on the most dramatic moment. Wide shots where the subject "looks like a fly" are not acceptable. Track the subject with a virtual camera (`TrackedVideo` in cineScenes.tsx, keyframes from frame differencing plus manual fixes after camera pans), zoom about 1.5 to 2.1x, and use interpolated slow motion (ffmpeg minterpolate) for hero moments.
- Motion techniques from the user's reference videos (ref-1000319940, ref-1000320070, ref-1000320075) are catalogued in the project skill `rewires-motion-library`; use it to pick visuals per narration line.
