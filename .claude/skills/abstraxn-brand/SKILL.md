---
name: abstraxn-brand
description: Abstraxn brand system for videos (palette, logo, type, decision colours, product facts, copy rules). Load before designing or editing any Abstraxn or Apolio scene, styleframe or copy.
---

# Abstraxn brand system (for kanishk.wires videos)

## Palette: never go outside it

| Token | Hex | Use |
|---|---|---|
| brand | #72E3AD | primary accent, highlights on dark |
| brandDeep | #3ECF8E | logo green, buttons, chart lines |
| bright | #68F4B5 | logo highlight, glows |
| deep | #249361 | logo gradient end, shadows |
| brandText | #0A6B47 | green text on light backgrounds |
| ink | #171717 | primary text on light |
| muted | #6B6B6B | secondary text |
| surface | #FFFFFF | light backgrounds and cards |
| soft | #F5F5F5 | light panels |
| wash | #F2FBF7 | mint wash (abstraxn.com CSS) |
| mint | #AEF4D4 / #9BEFCA | soft mint accents (site CSS) |
| dark | #0A0A0A | dark scenes |
| border | #E7E7E5 / dark #3A3A3A | dividers |
| deny | #E2887C / #A33F31 / wash #FDEEEC | denied / held (site CSS) |

There is **no amber** in the palette: "ask" moments use ink plus a **diamond** shape. Decisions are always shape plus label, never colour alone: allow = circle, ask = diamond, hold/deny = square.

## Logo

- Official files: `films/abstraxn-intro/brand/logo-light.svg` (black wordmark, for light backgrounds), `logo-dark.svg` (white wordmark, for dark), `icon-512.png`. Source: abstraxn.com/brand-kit.
- In code: `Logo` from `studio/src/film/kit.tsx` renders the official paths (mark and wordmark separable). Use it as supplied: no recolouring, no glow on the logo itself, keep clear space.
- Signature device: the **small triangle from the logo mark** (logo-light.svg points 550.871,419.915 / 275.44,265.932 / 433.996,0). The triangle grid (`DotField` in `studio/src/film58/kit58.tsx`) draws it.

## Type

- Figtree 700/800 for kinetic type, 500 for UI; JetBrains Mono for amounts, IDs, receipts (both via `@remotion/google-fonts`).

## Product facts (from abstraxn.com, OK to show)

- Tagline: "Superpowering the agent economy."
- KYI, Know Your Intent: Precepts (signed spend authority: cap, period, allowlist, expiry), Checks (allow / deny / route to a human, under 50 ms), Receipts (signed, including refusals, verifiable).
- Settlement: Embedded Wallets (ERC-4337, passkeys, social recovery, no seed phrase), Bundler (UserOperations, pre-flight simulation), Paymaster (per-agent budgets, daily caps, gas in USDC), Relayer (nonce management, gas bumping, resubmission). Chains: Ethereum, Base, Arbitrum, Polygon.
- Agent economy: x402 pay-per-call, 50+ integrated services.
- Proof: $5B+ routed volume, 99.9% submission success across 100k+ transactions, TOKEN2049 NEXUS Top 50 (approved by Ankit for on-screen use).
- Apolio: personal AI agent by Abstraxn (character built from the logo triangle, `Apolio` in `studio/src/apolio/kitA.tsx`).

## Copy rules

- No em or en dashes in on-screen copy.
- Fictional names only besides Abstraxn (Studio Ivy, Northline Supply, Papercraft).
- Illustrative demos are labelled as such.
