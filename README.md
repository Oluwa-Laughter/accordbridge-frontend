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

Implemented: overview, fixed sample agreement acceptance, funding/payout states, immutable submission versions, revision requests, pending dispute case, sample receipt, and responsive navigation.

Not implemented: editable agreement creation/version negotiation, paid change requests, cancellation/refund settlement, review timers, real resolver operations, notifications, persistence, or production authorization. Disputes stop at a visibly pending decision. The blueprint describes the broader target; this first slice does not complete every scenario.

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
