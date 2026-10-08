# AccordBridge Frontend

**Status: planning only.** This repository contains the frontend blueprint; no application, dependency installation, or deployment has been created.

AccordBridge is a proposed Stellar USDC workspace for clients and freelancers to agree on work, fund milestones, submit deliverables, and resolve payment decisions.

## Responsibility

- Account onboarding and Stellar wallet connection.
- Agreement creation, comparison, and acceptance.
- Project dashboard and milestone workspace.
- Funding, approval, release, and refund transaction confirmation.
- Work submission, revision requests, and funded scope changes.
- Private dispute evidence and resolution status.
- Accessible, responsive layouts and clear transaction states.

Vercel is the intended frontend host. Hosting plan, project creation, custom domain, and deployment are not configured. The framework and wallet libraries remain to be selected.

## Boundaries

Wallets sign user transactions; the browser must not send private keys to our backend. An API response or a wallet signature alone must never be presented as confirmed funding. Escrow balances and final transaction outcomes must be reconciled with Stellar.

## Documents

- [Screen blueprint](docs/SCREENS.md)
- [Canonical product specification](https://github.com/accordbridge-labs/accordbridge-backend/blob/main/docs/PRODUCT.md)
- [System architecture](https://github.com/accordbridge-labs/accordbridge-backend/blob/main/docs/ARCHITECTURE.md)
- [Contract evaluation](https://github.com/accordbridge-labs/accordbridge-contracts)

## First milestone

Produce a clickable, synthetic-data prototype covering success, revision, extra work, client silence, cancellation, and dispute settlement. It must not represent simulated balances as real deposits.

See this repository's planning issues. License selection is pending.
