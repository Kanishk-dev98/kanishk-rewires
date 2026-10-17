# Source ledger: How to automate LinkedIn lead generation and posting with Claude Code (Apollo + HubSpot + Publora via MCP)

Researched: 2026-10-17

- **c1** (product_capability, event None): Claude Code can add MCP servers with `claude mcp add`, and the in-session `/mcp` command shows server status and handles OAuth sign-in.
  - Anthropic, "Connect Claude Code to tools via MCP", published None: https://code.claude.com/docs/en/mcp
  - Note: Verified on the official Anthropic docs page. No publish date shown on the page.
- **c2** (product_capability, event None): Apollo.io has an official, first-party remote MCP server (https://mcp.apollo.io/mcp) that can search Apollo's people database.
  - Apollo.io (official GitHub org), "apolloio/apollo-mcp-plugin (README)", published None: https://github.com/apolloio/apollo-mcp-plugin
  - Note: Verified from Apollo's own GitHub org. The README also lists apollo_mixed_people_api_search, apollo_contacts_create, enrichment and sequence tools, and says 'some actions consume credits'. Plan requirements are NOT stated there; one third-party guide says paid plans/beta, which I could not confirm on an apollo.io page (docs.apollo.io did not come up in searches). Auth is via Apollo OAuth.
- **c3** (product_capability, event 2026-04-13): HubSpot's official remote MCP server (https://mcp.hubspot.com) is generally available and can create/update contacts and activities, including tasks.
  - HubSpot Developers changelog, "Remote HubSpot MCP server is now generally available", published 2026-04-13 (updated 2026-04-15 to correct read/write access): https://developers.hubspot.com/changelog/remote-hubspot-mcp-server-is-now-generally-available
  - HubSpot, "HubSpot MCP", published None: https://developers.hubspot.com/mcp
  - Note: The changelog lists create/update for CRM records (contacts, companies, deals, tickets, line items, products) and activities (calls, meetings, notes, tasks, emails). Caveats: requires OAuth 2.1 + PKCE through an MCP auth app; actions follow the user's HubSpot permissions; if sensitive data is turned on in the account, activities (including tasks) are blocked from MCP; marketing and content objects are read-only. CONFLICT: the developers.hubspot.com/mcp landing page still has text calling the remote server read-only and mentions 'read scopes'. The changelog is newer and was corrected specifically on read/write, so I treat it as authoritative. Separate local 'Developer MCP server' (hs mcp setup) is for building apps, not CRM data.
- **c4** (product_capability, event None): Publora offers an official remote MCP server (https://mcp.publora.com/mcp) that can schedule posts to LinkedIn.
  - Publora, "Publora MCP Server", published None: https://docs.publora.com/guides/mcp-server
  - Note: Verified on Publora's own docs. Docs list 32 tools (20 personal, 12 Agency company_* tools), including create_post/update_post/list_posts and LinkedIn reaction/comment/reshare tools. Auth via OAuth or an sk_ API key. Third-party directories give other tool counts (14, 18); the official docs number is used. Plan limits/pricing not verified.
- **c5** (policy_platform, event None): LinkedIn's official API lets an approved app create posts on behalf of an authenticated member (w_member_social), via Share on LinkedIn / the Posts API.
  - LinkedIn / Microsoft Learn, "Share on LinkedIn", published 2021-02-05 (updated 2023-12-14): https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
  - LinkedIn / Microsoft Learn, "Posts API", published 2026-05-07: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
  - Note: Verified that member posting is an official, self-serve API product. CAVEATS: (1) The docs do NOT contain a native 'schedule' parameter; the scheduling itself happens in the third-party tool (Publora), which then publishes via the API. (2) The docs do not state in so many words that posting is 'permitted unlike messaging'; that contrast is our inference from c5 plus c6. Safe on-screen wording: 'Posting through LinkedIn's official API is allowed; automated messaging is not.' Share on LinkedIn member rate limit: 150 requests/day.
- **c6** (policy_platform, event None): LinkedIn User Agreement section 8.2 prohibits using bots or other automated methods to send messages.
  - LinkedIn, "User Agreement", published None: https://www.linkedin.com/legal/user-agreement
  - Note: Previously verified (copied in per brief); not re-fetched in this pass.
- **c7** (product_capability, event None): LinkedIn connection request notes are limited to 200 characters.
  - LinkedIn, "LinkedIn Help: personalize invitations", published None: https://www.linkedin.com/help/linkedin/answer/a563153
  - Note: Previously verified (copied in per brief); not re-fetched in this pass.

## Open questions

- Apollo MCP plan/credit requirements: not stated on Apollo's README; confirm on an apollo.io page before claiming 'free'.
- HubSpot's developers.hubspot.com/mcp landing page still says read-only in places, which conflicts with the 2026-04-13 GA changelog (create/update). Changelog treated as authoritative.
- HubSpot tasks over MCP are blocked if the account has sensitive data turned on.
- Publora pricing/plan limits for LinkedIn scheduling not verified.
