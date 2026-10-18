# Grok Bot: research notes (as of 19 Oct 2026)

Full citations are in `sources.json`. "Official" means x.ai, docs.x.ai, the xAI changelog, the App Store listing, or posts from @bot or @elonmusk (text pulled directly).

Naming: x.ai pages now call the company **"SpaceXSI"**, while the press says **"SpaceXAI"**. xAI became part of SpaceX in Feb 2026, and Cursor joined on 14 Aug 2026. Grok Bot is built with Cursor: you sign in with a Cursor account and the app says (c) Anysphere. In the reel, just say "Elon Musk's xAI" or "Grok Bot". Don't try to explain the company structure.

## In plain English

Normal Grok is a chatbot. You ask, it answers, and then you do the work yourself.

Grok Bot is more like hiring a remote assistant who has their own computer. You text it the way you'd text a colleague, from your phone or laptop. It opens a real browser on a computer in the cloud, logs into your tools (Gmail, Slack, your CRM, ad managers, vendor portals) and does the job inside them. It keeps working after you close your laptop. It only comes back to you when something needs your OK, like sending an email, posting, buying, or deleting.

You can run several of these assistants at once, for example one for your inbox, one for sales leads, and one for research. A "chief of staff" Bot can sit on top and coordinate them. If you show a Bot a task once, it saves it as a routine and repeats it on a schedule.

Launch date: early beta on **11 Aug 2026**. The official post said: *"Bots are AI teammates that do real work for you. They sign in to your tools, use them just like you do, and come back with finished work."*

## The 5 most impressive verified capabilities

1. **It keeps working after you close the laptop.** "Closing the Grok Bot app or your laptop does not stop cloud work." (docs.x.ai) Example from the official use cases: the Sales Outbound Bot "researches accounts overnight, scores contacts with intent, drafts email and LinkedIn in your voice, and leaves a review list for you to approve."
2. **It works inside your real tools, even ones with no API.** It logs into sites just like a person does. xAI says "including platforms with no clean API or MCP". The App Store listing names "vendor portals, ad managers, CRMs, inboxes, and older ops tools." Example: the Security Questionnaire Filler "logs into the questionnaire site... drafts every field, and parks the submit for you."
3. **It has its own email address (Oct 2026).** The official @bot post on 9 Oct said: "Grok Bot now has its own email. Bot can use it to sign up for services, contact businesses for you, or schedule time with someone." The changelog (v0.70.2, 11 Oct) adds that emails it sends from that address "wait for your approval on a draft card." The address ends in @mail.grokbot.com. On 13 Oct Musk posted: "All Grok @Bots get their own email address and can help analyze and summarize your email box too."
4. **Show it once and it runs on its own.** "Ask a Bot to follow along as you complete a workflow once. It saves it as a routine and runs it on its own next time." (x.ai/bot) Routines can run on a schedule or be triggered by events such as Slack, GitHub, Teams or webhooks. Each Bot can have up to 50 routines.
5. **It saves real money, according to xAI's own numbers.** xAI's internal "Haggle Bot" found "more than $100,000 in direct savings". One finding was 43 paid software seats nobody had used in 90 days, worth $14,220. xAI also says that in customer support, ticket volume rose 175% with no new hires, "We might have hired 200 additional people otherwise". Both are company self-reports.

There is also a viral but riskier example, shopping. Musk posted: "I just asked Grok @Bot to research the most fun Lego Star Wars kits for young kids and order them. As easy as that." (11 Oct, about 27.7M views.) Officially, every purchase shows an Allow/Deny card first.

**Use cases a marketer will recognise** (all from the official x.ai/bot/use-cases gallery): Competitive Intelligence Analyst (watches overnight for rival launches and stale messaging), LinkedIn Campaign Manager, Newsletter Writer, SEO/AEO Auditor, Paid Media (suggests budget moves and waits for your approval), Event Guest Screener, Inbox Manager, Chief of Staff daily digest, and Subscription Cleaner.

## How to get it and set it up

**Plans.** On 12 Oct 2026, xAI launched The X Subscription, one plan that covers Grok, Grok Bot, Cursor and X Premium. Grok Bot comes with **Premium ($30/mo)**, Super ($100/mo, 3.5x Premium's Bot usage) and Ultra ($200/mo, 12x). It is **not** included in Free or Plus ($8). Usage resets every week. Existing SuperGrok and Cursor subscribers keep their current plans. xAI said it would reach "everyone globally" over the following days.

**India.** The Grok Bot app is listed on the **Indian App Store**, so it is available to Indian iPhone users. That listing shows in-app prices of **Pro ₹2,499, Pro+ ₹7,900 and Ultra ₹24,900** (checked 19 Oct). Those plan names are the older Cursor-style ones, so the prices may change as the X Subscription rolls out. A third-party site says Premium costs ₹3,399/mo on the Indian App Store; this is **unverified**. The app works in Hindi, Bengali, Urdu, Marathi, Tamil and Telugu.

**Platforms:** Mac, Windows, Linux, and iPhone (iOS 18+). There is no Android app yet.

**Setup steps** (from the official docs):
1. Subscribe to Premium or higher at x.ai/bot.
2. Download the Grok Bot app (desktop or iPhone) and sign in.
3. Your first Bot is created for you. Give it one main job and a name.
4. Give it a first small task, such as "summarise this document in 5 bullets".
5. When it needs to log in somewhere, tap "Open computer" or "Take over" and type the password or 2FA code yourself. The Bot never sees it.
6. To get an email inbox, just ask: "Claim an email inbox for me."
7. Save repeat jobs as routines, and keep sending, posting and buying behind your approval.

## Caveats, conflicts and unverified points

- **"Its own computer" is a simplification.** The docs say all of *your* Bots share one cloud computer, including logins, files and credentials, and warn "do not use separate Bots as a security boundary."
- **The email is per Bot or per account (conflict).** The team member's post and Musk say each Bot gets its own address. One user (Debbie O'Brien) says it's one address per account, shared by all your Bots, and permanent. Safe wording: "your Bot gets its own email address."
- **"Scam detection" is not a built-in feature.** Musk's "Grok @Bot detects scam emails!" quoted a user who *built* a "Scam Email Detector" Bot. The official changelog doesn't list scam detection. Safe wording: "you can set a Bot to flag scam emails."
- **Email dates:** the feature was announced on 9 Oct by @bot, appeared in the changelog on 11 Oct (v0.70.2), and Musk promoted it on 13 Oct. "Oct 9" is the correct launch date. Oct 13 is when Musk posted about it.
- **The 418,000 figure is real reporting but not official.** It is **weekly** users as of 14 Sept 2026, up 24% in a week, from a company presentation Bloomberg saw (reported 22 Sept). xAI never published it, and no newer figure exists. Say "reportedly 400K+ weekly users within its first month (Bloomberg)."
- **Number of Bots per user:** no official cap or total count was found.
- **Shopping:** Amazon is blocking it. Users got "Continued access by an unauthorized AI agent violates Amazon's Conditions of Use." Musk's "photo of your credit card" advice was criticised in an X community note. His pledge "SpaceX will make you whole" if it makes a purchase mistake or leaks your card sits uneasily with the terms, which say "We are not responsible for User Content or Agentic Actions." Don't recommend card photos in the reel.
- **Prompt injection:** an AI that reads your inbox also reads instructions from strangers. That is why xAI's own docs say to start with read-only tasks and keep sends, posts and purchases behind approval.
- **It's still a beta.** It ships updates almost every day, so features change fast.
- **Model routing to Claude Opus 5.5** comes from secondary reports and was not confirmed in the official docs I checked. Leave it out.
- **Job applications and e-commerce order tracking** are **not** official use cases. The closest official ones are Apartment Scout ("applies for the ones you pick"), Talent Scout and Hiring Screener for recruiters, and a Shopify connector (shown in a team video) plus Merch Fulfillment.
- **Competitors:** I found no credible primary-sourced comparison. DataCamp (secondary) says "Grok Bot keeps named workers with lasting roles" while Claude Cowork "keeps the session and Project context." Avoid comparing rivals on screen.
- **Logo:** Simple Icons has **no** "grok" icon (grok.svg returns 404 on v16.35.0; only "x" exists). xAI's brand guidelines allow logos only "exactly as provided, without any alteration", used only to refer to xAI accurately, and with no implied endorsement.

## 3 hook ideas

1. "Musk's AI now has its own email address, and it can apply, sign up and book things while you sleep." (Pivot quickly to the approval-card safety point.)
2. "Stop chatting with AI. Hire it. Grok Bot gets its own computer, logs into your tools and finishes the job after you close your laptop."
3. "xAI says one Bot found $100,000 in wasted software spend. Here's how to set up your own AI teammate in 60 seconds, and the one thing never to hand it."
