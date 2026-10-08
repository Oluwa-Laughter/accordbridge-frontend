# Screen blueprint

These are proposed screens, not implemented functionality.

See [the detailed prototype blueprint](PROTOTYPE-BLUEPRINT.md) for layouts, role-specific actions, example amounts, confirmation copy, and failure states.

| Screen | Primary actions | Required states |
| --- | --- | --- |
| Account setup | Create account, connect and verify wallet | Disconnected, signing, rejected, verified; wrong network |
| Dashboard | Open projects and required actions | Empty, loading, error, active and closed projects |
| Agreement builder | Specify scope, milestones, price, dates, revision terms | Draft, proposed, changes requested |
| Agreement review | Compare versions, accept or counter-propose | Version mismatch, accepted by one, accepted by both |
| Funding | Review asset, exact amount, fees, contract and sign | Awaiting signature, rejected, submitted, confirmed, failed, unknown |
| Project workspace | Submit a version, review, approve, request revision or change | Unfunded, working, review, revision, disputed, settled |
| Wallet and receipts | Inspect available and escrowed balances | Confirmed values, last checked time, unavailable or stale data |
| Resolution centre | Submit evidence, propose settlement, view decision | Awaiting response, review assigned, decision pending, payout pending, settled |

## Project workspace

Show scope, acceptance criteria, milestone gross amount, net payment and fees, verified funding, next actor, and deadline with timezone. Keep submission versions and decisions available. A revision request must identify an agreed requirement; additions belong to change requests.

Future milestones must remain visibly unfunded until their funding allocation is verified. A pending transaction must never be shown as successful. Retrying must reconcile the previous transaction before requesting another payment.

## Prototype scenarios

1. A 600 USDC website project has three illustrative milestones of 150, 300, and 150 USDC; only the first is initially funded.
2. The client approves a submission and the payment confirms.
3. An in-scope revision produces a new submission without overwriting the old one.
4. A 200 USDC addition and three-day extension are accepted and funded separately.
5. Client silence after the proposed seven-day review window escalates to a reviewer; do not promise automatic release.
6. A mutual cancellation or contested case ends in a clearly itemized refund/split, including applicable fees.

## Usability acceptance

Both parties should identify what is owed, what is funded, who acts next, and what happens after the deadline without coaching. Keyboard navigation, labels, contrast, and mobile layouts are required design considerations.
