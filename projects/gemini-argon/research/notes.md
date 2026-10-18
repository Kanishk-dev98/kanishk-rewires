# Gemini 4 Argon: research notes

Researched 2026-10-18. Claims with sources are in `sources.json` (c1 to c37). Primary sources are used unless a point is marked "secondary".

## Summary

- **What it is.** Gemini 4 Argon is Google's new frontier model and the first Gemini 4 model. Google positions it for "real-world coding, enterprise knowledge work, and cyber defense."
  - It was announced on Sep 30, 2026 (blog.google, Koray Kavukcuoglu), when it went only to cyber defenders in the Fairwind Program.
  - General availability came on Oct 13, 2026. It is "globally available" through the API (AI Studio / Gemini platform), and Google AI Pro and Ultra subscribers get it in the Gemini app and AI Mode in Search.
  - The model card says it is "not a modification or a fine-tune of a prior model". It is a sparse MoE with a 1M-token context and a March 2026 knowledge cutoff.
  - No Google source explains the name "Argon".
- **Plans.** Pro and Ultra only. Free and AI Plus are not listed.
- **India.** The plans page in INR lists Argon under AI Pro (Rs 1,950/mo) and AI Ultra (from Rs 6,500/mo). India is not on the Tasks exclusion list (EEA, Nigeria, Switzerland, UK). Some connected apps are available in India. No Google page says "available in India" in plain words, but every signal points to yes.
- **Chat-to-tasks.** The official blog wording is "a simple toggle from chat to tasks". The Help Center calls it the "Chat and Task toggle next to the prompt text box"; it is the renamed Gemini Spark. Tasks keep running in the background or on a schedule while you are away.
- **Connected apps.** "Gemini now connects you to more than 40 apps", including Instacart, OpenTable, Adobe and Shopify. Most are US/English only.
- **API.** The model ID is `gemini-4-argon`. Pricing is $2 input / $10 output per 1M tokens until Nov 30, 2026, then $4 / $20. There is no free tier.

## On-screen-safe lines (verified; quote or paraphrase exactly as below)

1. "Gemini 4 Argon": Google's new frontier model. (blog.google, Sep 30)
2. Live since Oct 13 for Google AI Pro and Ultra subscribers. (blog.google, Oct 13)
3. "A simple toggle from chat to tasks." (blog.google Gemini app post)
4. "When you choose tasks, Gemini can work for you even when you're not at your computer." (blog.google)
5. "Gemini now connects you to more than 40 apps." (blog.google)
6. Instacart · OpenTable · Adobe · Shopify (the apps Google names; they show as logos in Google's post)
7. Up to 15 tasks running at once. (Gemini Help Center)
8. Schedule a task "at a specific date and time or in response to an event." (Help Center)
9. Folder of files → client proposal deck → emailed → recurring workflow. (Google's "Paperwork" demo)
10. #1 on AutomationBench: 51.3% vs GPT-6 Astra 41.4%. (Google DeepMind model card. Self-reported, so label it "Google's numbers".)
11. Vals Finance Agent v2: 65.4% vs 53.5% (Astra) and 58.6% (Opus 5.5). (model card, self-reported)
12. India: AI Pro Rs 1,950/month includes Argon access. (gemini.google/subscriptions, INR)
13. API: $2 / $10 per million tokens until Nov 30, then $4 / $20. (ai.google.dev pricing)

Avoid on screen:
- "Best model overall". Google's own model card shows Argon trailing GPT-6 Astra or Claude Opus 5.5 on FrontierSWE v2, Terminal-bench 4.0, OSWorld-2.0 and Terminal-Bench Science.
- "Free".
- "Available on AI Plus".

## How to turn on tasks (Help Center, web/Mac)

1. Open gemini.google.com or the Gemini Mac app.
2. Click **Task** below the text box. This is the Chat / Task toggle.
3. Describe the job. You can also:
   - say when it should run, or what event should trigger it
   - type `@` to pick a skill
   - ask for files as output
   - choose a model and thinking level from the model menu
4. Click **Submit** and monitor it. Gemini may ask you to take over its browser for some steps.

Requirements:
- Age 18 or over
- Personal Google account (work or school accounts are not supported)
- AI Pro or Ultra
- Keep Activity on
- Opted in to Personal Intelligence

To turn it off: Settings → Task settings → "Use task mode to hand off work" → Turn off.

Connecting an app:
1. In the sidebar, click **Customize**, then **Connectors**.
2. Find the app and click **Add**.
3. In a prompt, type `@` and pick the app.

## Official demos that work in 9:16 (business/marketing)

1. **"Paperwork"** (Gemini app plus Tasks): https://www.youtube.com/watch?v=frgCYZ_TEwY. Google's caption: "Argon takes an unstructured folder full of project context and formats it into a clean proposal deck for a client using a custom skill. Gemini then drafts and emails the deck to a client while creating an automated workflow for all future incoming client requests with a scheduled task."
2. **Help Center task examples.** Declutter your inbox; a custom news digest; monitor flight and hotel prices; research a topic with citations and package it into PDFs, docs, spreadsheets or slides. These work well as quick-cut text cards.
3. **"Untangling 500-page chemistry patents with Gemini 4"** (Isomorphic Labs): https://www.youtube.com/watch?v=9jQA7IgPhBE. Google says it "is able to quickly synthesize complex PDFs and patents to extract pertinent information". For a business audience, this maps to "dense documents become answers".
4. Backup visual: **"Daybed"**: https://www.youtube.com/watch?v=0_47R0ep-6s. It goes from a sketch and a photo to sofa-leg design options to a 3D-printable file.

Google gave no exact prompt text for any demo. Only the captions above are published. Do not invent prompts and present them as Google's.

## Official press images and videos (not downloaded)

YouTube, all embedded in the Oct 13 post https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/:

- Paperwork: https://www.youtube.com/watch?v=frgCYZ_TEwY
- Daybed: https://www.youtube.com/watch?v=0_47R0ep-6s
- Patents / Isomorphic Labs (Google DeepMind): https://www.youtube.com/watch?v=9jQA7IgPhBE
- Pagoda: https://www.youtube.com/watch?v=WwDApkotwy0
- Race car: https://www.youtube.com/watch?v=zvoNbz_0q3k
- Chess: https://www.youtube.com/watch?v=LJJ3zXx-ptU
- 3D Room Python: https://www.youtube.com/watch?v=h2Dk1TlEX-U
- Gothic architecture: https://www.youtube.com/watch?v=uht7LT3LrQk
- Ancient Ruins (Chaco Canyon): https://www.youtube.com/watch?v=q2gcdeZsXpM
- Human anatomy: https://www.youtube.com/watch?v=Ah5nPftN8QU
- Cornhole humanoid (DeepMind): https://www.youtube.com/watch?v=9PICEmtfpWU
- Chromium codebase maintenance (DeepMind): https://www.youtube.com/watch?v=LVEfFyijQ2c
- Cyber defense (DeepMind): https://www.youtube.com/watch?v=ftkic7Tdpcg

Images (blog.google CDN):

- Header: https://storage.googleapis.com/gweb-uniblog-publish-prod/images/gemini-4-argon__blog-header__2784x1566.width-1300.png
- Sep 30 key art: https://storage.googleapis.com/gweb-uniblog-publish-prod/images/g4_30-09-26_key-art_blog.width-200.format-webp.webp
- Benchmark table: https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/gemini-4-argon_table_blog.gif
- Benchmark GIFs:
  - https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/gemini_4_cyber_evals_automationbench.gif
  - https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/gemini_4_cyber_evals_vals_finance.gif
  - https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/gemini_4_cyber_evals_vals_index.gif
  - https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/gemini_4_cyber_evals_deepswe.gif
  - https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/gemini_4_cyber_evals_harveys.gif
- Connected-apps logo wall (Gemini app post): https://storage.googleapis.com/gweb-uniblog-publish-prod/images/28020_Logo_Cloud_wall-v2.width-100.format-webp.webp

**Usage terms.** I found no press kit and no explicit editorial licence for these assets.

- Google's Brand Resource Center (https://about.google/brand-resource-center/guidance/) allows:
  - unaltered screenshots or video captures "for educational purposes in textbooks or other standard teaching materials"
  - plain-text references in an informational context
  - linking or embedding with Google's embed tools
- It does not grant re-use of YouTube or blog media in commercial or social video. For anything else it says to "reach out to your Google contact".
- Treat all of the above as all rights reserved by Google.
- Safe options:
  - Record your own screen of the Gemini app, which comes under the trademark/screenshot guidance at https://about.google/brand-resource-center/guidance/media/
  - Short commentary clips under fair use, credited "Source: Google". This is a legal judgment for the team; I have not verified it.

## Caveats

- Benchmarks are Google's own figures. Tech Times (secondary) says they had not been independently replicated by early October, and that subscribers default to MEDIUM thinking while third-party scores use HIGH. I have not verified this against Google.
- The model card admits to hallucinations, "occasional slowness or timeouts", and a March 2026 knowledge cutoff.
- The model card says the bio and cyber critical-capability levels "cannot be ruled out", so Google built safety cases for them.
- Tasks are labelled experimental. Google warns:
  - don't enter passwords or payment details in the task thread
  - avoid sensitive scheduled tasks
  - Gemini may share your info with websites while browsing
- Tasks need a personal account (no Workspace accounts) and are not available in the EEA, UK, Switzerland or Nigeria.
- Most connected apps are US/English only. Instacart is US only.
- API intro pricing doubles on Dec 1, 2026. There is no free API tier.

## Conflicts and unverified points

- **Tasks plan eligibility.**
  - The blog and Help Center say Pro and Ultra.
  - The plans page (INR) lists Tasks under Ultra only, "in select countries".
  - Verify on a Pro account in India before claiming it.
- **Antigravity access.**
  - The Oct 13 blog says Ultra.
  - 9to5Google (Oct 15, secondary) says it is rolling out to Pro too, with a weekly Argon quota.
  - A forum post says Ultra only.
- **Output length.**
  - The Sep 30 blog says 1M output, "up from the previous 64K".
  - The API docs say the default is 65,536, and 1M only with long decode.
- **LabBench.** The blog gives 52.2% for "LabBench"; the model card gives 88.8% for "LABBench 2". These are different variants, so don't mix them.
- **Two blog URLs** carry the same Gemini app post title: `/gemini-4-availability` and `/gemini-4-argon-availability`. Cite the second.
- **AI Mode** has only a single-sentence mention. There is no dedicated post or regional detail.
- **The name "Argon"** is not explained anywhere official.
- **Jio-bundled AI Pro in India** is unverified (forum post only).
- **UI label language.** The release-notes fetch returned a Hindi UI label for "Customize". The English Help Center label is "Customize", then "Connectors".

## 3 story angles for a 45 s reel

1. **"Stop chatting. Start delegating."** (product angle)
   - Hook: one toggle turns Gemini from a chatbot into a worker.
   - Body: flip Chat → Task, then show three tasks from the Help Center (inbox cleanup, a price watch, a research pack delivered as slides).
   - Close: up to 15 run at once, even with your laptop closed. Pro and Ultra only, Rs 1,950/mo in India.
2. **"The folder-to-pitch machine."** (marketer workflow, built on Google's "Paperwork" demo)
   - A messy project folder becomes a client proposal deck, which is emailed, and Gemini then sets a scheduled task so every future client request gets the same treatment.
   - Overlay: "40+ connected apps: Instacart, OpenTable, Adobe, Shopify."
   - Caveat card: "Experimental. Don't hand it passwords."
3. **"Google's comeback number."** (benchmark plus honesty angle)
   - Open on AutomationBench 51.3% vs GPT-6 Astra 41.4% and Vals Finance Agent 65.4% vs 53.5%.
   - Twist: Google's own card shows it losing on several coding/terminal tests, and these are self-reported numbers.
   - Payoff: "Best for business workflows, not best at everything. Test it on your own work."
