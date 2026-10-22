# Your sales team on Claude Code: setup, template and prompts
From kanishk.rewires. Workflow inspired by Understory × OXYGEN's "allbound engine".

## 1. Give Claude its tools (one-time setup)
Install Claude Code, then add the connectors (MCP servers) for the tools you use. Each provider's docs give the exact command and how to sign in:
- Leads: Apollo (or Clay)
- Email: Gmail (or Outlook)
- CRM: HubSpot

Check that they're connected with `claude mcp list`.

## 2. ICP.md template (save it in your project folder)
```
# Ideal customer
industry: …              (e.g. D2C brands, consumer goods)
company size: …          (e.g. 11 to 200 people)
region: …                (e.g. India, US, UK)
buyers: …                (e.g. Head of Growth, CMO, Founder)
buying signals: …        (e.g. launching a product, hiring marketers, raised funding)
not a fit: …             (e.g. agencies, enterprises over 5,000 people)
```

## 3. Prompts, step by step
**Source:** "Using Apollo, find every company that matches ICP.md. Remove duplicates (1 row per company domain). Save to accounts.csv and tell me the count."

**Qualify:** "For each company in accounts.csv, check its website, LinkedIn, hiring and tech stack. Score ICP fit from 0 to 100 with one line of reasoning. Move scores under 60 to parked.csv (don't delete them)."

**People + email:** "For each qualified company, find 1 to 2 decision makers matching the buyers in ICP.md. Find and verify their work email. If there's no verified email, mark them 'LinkedIn only'. Save to people.csv."

**Ad audiences:** "Export people.csv in the upload formats for LinkedIn Matched Audiences, Google Ads Customer Match and Meta Custom Audiences." (You upload these in each ad manager.)

**Personal email:** "Draft a 60-word first email for each person in people.csv. Reference one real detail from their company research. Plain text, one question, no links. Save as Gmail drafts. Do not send."

**Weekly post:** "Write 3 LinkedIn posts for this week from my notes in notes.md, in my voice: a short hook, one useful idea, no hashtags spam."

**Signals + follow-up:** "Check replies in Gmail and the engagement list I paste below. For each person who replied, clicked or viewed, draft a follow-up that mentions exactly what they engaged with."

**CRM:** "Log every company, person, email and reply in HubSpot. One record per company and person. Move stages: New lead → Replied → Call booked."

## 4. Rules that keep it safe
- You approve every send and every paid run. Ask Claude for drafts, not auto-sends.
- Respect each platform's limits and terms, especially LinkedIn's.
- Keep outreach relevant and personal. A short message to a real fit beats volume.
