# AccordBridge Frontend

**Status: local interactive prototype.** Next.js, React, TypeScript, and Tailwind CSS are configured. The application uses synthetic data and in-memory state; refreshing resets the demo. No backend, wallet connection, blockchain integration, or deployment is configured.

AccordBridge is a proposed Stellar USDC workspace for clients and freelancers to agree on work, fund milestones, submit deliverables, and resolve payment decisions.

## Responsibility

- Account onboarding and Stellar wallet connection.
- Agreement creation, comparison, and acceptance.
- Project dashboard and milestone workspace.
- Funding, approval, release, and refund transaction confirmation.
- Work submission, revision requests, and funded scope changes.
- Private dispute evidence and resolution status.
- Accessible, responsive layouts and clear transaction states.

Vercel is the intended frontend host. Hosting plan, project creation, custom domain, and deployment are not configured. Wallet libraries remain to be selected.

## Run locally

Use a supported Node.js LTS release compatible with Next.js 16 (Node 22 or 24 recommended).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The server binds to your machine's loopback interface.

## Try the first implementation

1. Open the project workspace and accept agreement v1 as Maya.
2. Switch the demo role to Tobi and accept the same version.
3. Switch back to Maya, simulate funding, then separately confirm its result. The unknown-outcome branch checks the existing transaction instead of offering another deposit.
4. Switch to Tobi and submit the sample design. Switch to Maya to request a revision, approve, or open a dispute.
5. After approval, separately confirm the simulated payout and view the itemized receipt.

The scenario controls load an agreement, funded work, or a submitted design. The demo role switch is for presentation only and is not authentication. No wallet permissions, private keys, files, or payments are collected. Use sample text only.

Implemented: overview, editable agreements and milestones, in-memory drafts, proposal version history, acceptance by both parties, funding/payout states, immutable submission versions, revision requests, pending dispute case, sample receipt, and responsive navigation. Funding and receipts use the current agreement's first milestone amount.

Not implemented: paid changes to funded work, cancellation/refund settlement, review timers, real resolver operations, notifications, persistence, or production authorization. The funding-to-payout simulation covers the first milestone only; later milestones remain unfunded. Disputes stop at a visibly pending decision. The blueprint describes the broader target; this prototype does not complete every scenario.

## Create and revise an agreement

Choose **Create agreement** from Overview. Enter project details, add up to ten milestones with prices, deliverables, acceptance criteria and dates, then set exclusions, revision rounds and the review window. Participants remain the fictional Maya and Tobi; dates use 17:00 WAT (UTC+1).

**Save draft & close** keeps incomplete edits in memory without changing the published agreement. **Resume saved draft** reopens them. **Send for review** validates required fields and publishes the proposal. Creating a project replaces the current project in this single-project demo; the editor displays this before publishing. Refreshing or resetting clears drafts.

Before funding starts, either demo role can use **Propose changes**. A changed proposal creates the next version, preserves the old terms and acceptance record, and clears both current acceptances. Stale-version acceptance is rejected. Both parties must accept the new version before funding becomes available. Once funding starts, terms are locked; a separate paid-change workflow remains to be implemented.

Prototype prices allow two decimal places and use integer cents for calculations. The illustrative 0.3% fee rounds to cents. This is a presentation rule, not a specification of Stellar asset precision or a provider's actual fee calculation. Resolver, cancellation, appeal and final pricing terms remain unresolved and cannot be accepted as live terms.

## Checks

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests start the production build on port 3100 and cover the acceptance-to-payout journey with a revision, unknown funding outcomes, and held disputed funds on desktop and mobile viewports. Run `npm run build` before browser tests.

The pure demo reducer tests financial-state transitions and role restrictions. It does not validate an escrow contract or provide a security boundary for live money.

## Boundaries

Wallets sign user transactions; the browser must not send private keys to our backend. An API response or a wallet signature alone must never be presented as confirmed funding. Escrow balances and final transaction outcomes must be reconciled with Stellar.

## Documents

- [Screen blueprint](docs/SCREENS.md)
- [Detailed prototype blueprint](docs/PROTOTYPE-BLUEPRINT.md)
- [Canonical product specification](https://github.com/accordbridge-labs/accordbridge-backend/blob/main/docs/PRODUCT.md)
- [System architecture](https://github.com/accordbridge-labs/accordbridge-backend/blob/main/docs/ARCHITECTURE.md)
- [Contract evaluation](https://github.com/accordbridge-labs/accordbridge-contracts)

## First milestone

Produce a clickable, synthetic-data prototype covering success, revision, extra work, client silence, cancellation, and dispute settlement. It must not represent simulated balances as real deposits.

See this repository's planning issues. License selection is pending.
