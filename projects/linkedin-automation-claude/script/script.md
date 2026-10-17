# Automate LinkedIn lead generation and posting with Claude Code

Format: 9x16  
Body duration: 57.7 s plus the brand outro

## 1. s00 · tutHook · 4.7 s

**Voiceover:** Here's how to automate your LinkedIn lead generation and posting, with Claude Code.

**On screen:** A STEP BY STEP TUTORIAL / Automate your / LinkedIn leads / with Claude Code / leads

**Visual concept:** Serif title; prospect photos flow along a lime line into a lead counter.

**Transition:** cut


## 2. s01 · tutEasy · 3.3 s

**Voiceover:** It's simpler than it sounds. Only seven steps.

**On screen:** So simple.

**Transition:** cut


## 3. s02 · tutStep · 5.8 s

**Voiceover:** One. Connect your tools. Add Apollo, HubSpot and Publora to Claude Code.

**On screen:** Connect your tools / media/li2/apollo.svg / media/li2/hubspot.svg / media/li2/publora-mark.svg / media/li2/linkedin.svg / claude mcp add --transport http apollo … / claude mcp add --transport http hubspot … / claude mcp add --transport http publora … / ✓ /mcp · 3 servers connected

**Visual concept:** Apollo, HubSpot and Publora tiles pop on their names, each wires into the Claude tile, and the terminal adds each server.

**Transition:** cut

- Source c1: Claude Code can add MCP servers with `claude mcp add`, and the in-session `/mcp` command shows server status and handles OAuth sign-in. (product_capability) Anthropic, None https://code.claude.com/docs/en/mcp
- Source c2: Apollo.io has an official, first-party remote MCP server (https://mcp.apollo.io/mcp) that can search Apollo's people database. (product_capability) Apollo.io (official GitHub org), None https://github.com/apolloio/apollo-mcp-plugin
- Source c3: HubSpot's official remote MCP server (https://mcp.hubspot.com) is generally available and can create/update contacts and activities, including tasks. (product_capability) HubSpot Developers changelog, 2026-04-13 (updated 2026-04-15 to correct read/write access) https://developers.hubspot.com/changelog/remote-hubspot-mcp-server-is-now-generally-available
- Source c4: Publora offers an official remote MCP server (https://mcp.publora.com/mcp) that can schedule posts to LinkedIn. (product_capability) Publora, None https://docs.publora.com/guides/mcp-server

## 4. s03 · tutStep · 6.8 s

**Voiceover:** Two. Describe your ideal client once. Industry, role, company size and region.

**On screen:** Write your ICP / # Ideal client / industry: consumer goods, D2C / role: Head of Growth, CMO / company size: 11 to 200 / region: US, UK / signal: launching or hiring / ICP.md / ✓ Saved ICP.md

**Visual concept:** An ICP.md file fills line by line as each field is named.

**Transition:** cut


## 5. s04 · tutStep · 5.2 s

**Voiceover:** Three. Ask Claude to find fifty leads that match it, straight from Apollo.

**On screen:** Find your leads / media/li2/apollo.svg / @leads / find 50 leads that match ICP.md / apollo · search people / ✓ 50 leads saved to leads.csv

**Visual concept:** An Apollo people search: ICP filters apply, the result count runs to 50, and real-looking lead rows land with photos.

**Transition:** cut

- Source c2: Apollo.io has an official, first-party remote MCP server (https://mcp.apollo.io/mcp) that can search Apollo's people database. (product_capability) Apollo.io (official GitHub org), None https://github.com/apolloio/apollo-mcp-plugin

## 6. s05 · tutStep · 5.3 s

**Voiceover:** Four. Claude scores every lead, and finds one real reason to reach out.

**On screen:** Score and research / @leads / score leads.csv against ICP.md / ✓ Top 10 ready, each with a reason

**Visual concept:** The top lead's ICP fit ring fills to 92 with three match checks; the reason to reach out appears; the other leads score alongside.

**Transition:** cut


## 7. s06 · tutStep · 6.6 s

**Voiceover:** Five. It drafts a short, personal note for each one. You review it, and send it yourself.

**On screen:** Draft the outreach / media/li2/linkedin.svg / @leads / Hi Sarah, saw Northwind is launching a new D2C range. I help consumer brands turn first orders into repeat buyers. Would love to connect. / draft a connection note for each lead / LinkedIn bans auto sending, so you click Send

**Visual concept:** LinkedIn's real "Add a note to your invitation?" box: Claude's draft types in with the character counter, then a human presses Send.

**Transition:** cut

- Source c6: LinkedIn User Agreement section 8.2 prohibits using bots or other automated methods to send messages. (policy_platform) LinkedIn, None https://www.linkedin.com/legal/user-agreement
- Source c7: LinkedIn connection request notes are limited to 200 characters. (product_capability) LinkedIn, None https://www.linkedin.com/help/linkedin/answer/a563153

## 8. s07 · tutStep · 5.2 s

**Voiceover:** Six. Every lead lands in HubSpot, with a follow up task already set.

**On screen:** Track in your CRM / media/li2/hubspot.svg / @leads / hubspot · create contacts / hubspot · create follow up tasks

**Visual concept:** A HubSpot board: lead cards land in New lead, a follow-up task tag pops, and a Follow up column fills.

**Transition:** cut

- Source c3: HubSpot's official remote MCP server (https://mcp.hubspot.com) is generally available and can create/update contacts and activities, including tasks. (product_capability) HubSpot Developers changelog, 2026-04-13 (updated 2026-04-15 to correct read/write access) https://developers.hubspot.com/changelog/remote-hubspot-mcp-server-is-now-generally-available

## 9. s08 · tutStep · 5.5 s

**Voiceover:** Seven. Claude writes your posts in your voice, and Publora schedules them for the week.

**On screen:** Post on autopilot / media/li2/linkedin.svg / 3 emails every D2C brand should send after the first order:
1. The thank you
2. The how to use
3. The reorder nudge / write 5 posts from my notes, in my voice / publora · schedule 5 LinkedIn posts / ✓ Mon to Fri at 9:00

**Visual concept:** A LinkedIn post writes itself, then a Publora week fills Monday to Friday at 9:00.

**Transition:** cut

- Source c4: Publora offers an official remote MCP server (https://mcp.publora.com/mcp) that can schedule posts to LinkedIn. (product_capability) Publora, None https://docs.publora.com/guides/mcp-server
- Source c5: LinkedIn's official API lets an approved app create posts on behalf of an authenticated member (w_member_social), via Share on LinkedIn / the Posts API. (policy_platform) LinkedIn / Microsoft Learn, 2021-02-05 (updated 2023-12-14) https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin

## 10. s09 · tutSave · 2.4 s

**Voiceover:** Save this, so you can set it up later.

**On screen:** Save. / SO YOU CAN SET IT UP LATER

**Transition:** cut


## 11. s10 · tutCta · 7.0 s

**Voiceover:** Comment LinkedIn, and I'll send you the full setup. The connectors, the client template, and my prompts.

**On screen:** LINKEDIN / Connector setup for Claude Code / Ideal client template / My outreach and post prompts / SENT STRAIGHT TO YOUR DMS

**Transition:** cut


