# Research notes: LinkedIn client acquisition reel (checked 2026-10-17)

## What the reel must NOT imply
- Do not show or suggest that Make, n8n or any tool auto-sends LinkedIn connection requests or DMs from a personal profile. LinkedIn User Agreement s.8.2 forbids using "bots or other unauthorized automated methods to access the Services, add or download contacts, send or redirect messages..." and forbids software, scripts, crawlers or "browser plugins and add-ons" that scrape the Services. LinkedIn Help (a1341387) says it doesn't permit third-party software or browser extensions that "scrape, modify the appearance of, or automate activity on LinkedIn's website."
- Do not describe scraping Sales Navigator or LinkedIn profiles into a spreadsheet or CRM with an extension.
- Official Make and n8n LinkedIn integrations only post content (Make also reads company posts and stats). Neither has a module or node for connection requests or messages. A safe framing: you find leads in Sales Navigator or Apollo, you send each connection request and DM yourself, and automation takes over after that: CRM record, follow-up task, booking link, CRM sync.
- Automation in the CRM is fine to show: Make and n8n can create or update HubSpot and Pipedrive contacts, persons and deals, and create tasks or activities.

## Connection-note limits to respect in the example message
- Keep the on-screen example note at 200 characters or fewer, spaces and punctuation included. LinkedIn Help a563153: "Each message can be up to 200 characters."
- Monthly cap on free accounts: the LinkedIn Help page fetched today says "up to three connection requests per month". A search summary of the same page said five, and third-party reports range from 5 to 15. Don't put an exact number on screen. Say "free accounts only get a few personalized notes a month" or leave it out. Premium: "unlimited personalized invitations (connection request limits may still apply)".

## Other caveats
- Sales Navigator is paid. The filters you need are confirmed: Industry, Current job title, Function, Seniority level, Company headcount, Geography. Some filters depend on plan tier.
- Apollo: the API reference confirms filters for title, location, employee-count ranges and industry. I couldn't fetch the Knowledge Base pages (403), so in-app labels and free-plan export limits are not directly verified. Say "export depends on your plan".
- Calendly's HubSpot integration is not on the free plan (it needs Standard or higher). It creates a HubSpot contact if one doesn't exist and logs a meeting activity. Cal.com creates a HubSpot meeting record and links it to the contact. I didn't check which Cal.com plan this needs.
- Using a CRM like HubSpot or Pipedrive is a choice, not a requirement. Keep any claims about results (reply rates, number of clients) out unless sourced. None were researched here.
