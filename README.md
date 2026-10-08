# AccordBridge Frontend

**Status: connected local development workspace.** Next.js, React, TypeScript and Tailwind CSS provide authenticated projects backed by the NestJS/PostgreSQL service. The separate `/demo` route retains the sample payment simulator. No wallet connection, blockchain integration or hosted deployment is configured.

## Run locally

Use Node.js 22.12+ or Node 24 LTS. First start the sibling [backend](https://github.com/accordbridge-labs/accordbridge-backend) following its README, including database setup and migrations.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The frontend proxies `/api` to `http://127.0.0.1:4000` by default. To change that server-side target, copy `.env.example` to `.env.local` and set `BACKEND_URL`. Never expose it as a `NEXT_PUBLIC` variable. The backend's `FRONTEND_ORIGIN` must exactly match the browser origin; `localhost` and `127.0.0.1` are different origins.

Vercel remains the intended frontend host. Hosting, domains, production proxy/cookie configuration and backend deployment are not configured.

## Try the persistent workspace

1. Create an account with a name, email and a password of at least 12 characters. Email is a login identifier; email verification and recovery are not yet available.
2. Have your project partner register in a different browser profile or private window. Each account can reveal its ID with **Show my account ID**.
3. Choose **New project**, supply the other account ID, and choose your role. Roles and participants are fixed after creation. No invitation email is sent.
4. Enter milestones, dates, scope and acceptance criteria. **Save draft & close** saves a private draft to your account; refresh and resume it to verify persistence.
5. **Send for review** publishes an immutable version for both participants. Each must sign in to their own account to accept. There is no role switch in the saved workspace.
6. **Propose changes** publishes a new version with fresh acceptance required. Previous versions retain their own acceptance records. A stale save or acceptance receives a conflict rather than silently overwriting newer terms.

The workspace supports multiple projects. Only participants see their projects, and each author's unpublished drafts remain private. Sessions use HttpOnly cookies, not browser storage tokens. Sign-out revokes the server session. Edited text is not saved until a save or publish request succeeds; unsaved edits are lost on refresh. A conflict keeps the editor visible and offers an explicit reload/discard action.

Accounts and agreement data persist in PostgreSQL. Funding, deliverable submission, review and payouts are not connected to this saved workspace yet. Agreements currently use proposed development terms, not final live escrow policies. No funds move when accepting.

## Payment demo

Open `/demo` or **Explore payment demo**. It has fictional Maya/Tobi role controls and a single replaceable sample project. All its data stays in memory and resets on refresh. Nothing from this route is imported into your saved projects, and simulated payment states never update the backend.

The demo covers editable agreements, acceptance, the first milestone's simulated funding, versioned submissions, revisions, approval, payout confirmation and receipt. Unknown funding outcomes cannot start another deposit. Disputes retain funds and stop at a pending decision. Later milestones remain unfunded. Paid scope changes, cancellation settlement and review timers remain outstanding.

Demo prices use integer cents for display calculations and a 0.3% illustrative provider fee rounded to cents. This is not a specification of Stellar asset precision or deployed contract fee logic. Resolver, cancellation, appeal and final pricing terms remain unresolved.

## Checks

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:workspace
```

The demo suite starts the production frontend on port 3100. The connected suite requires the sibling backend to be built, `.env.test` configured for its isolated test database, and PostgreSQL running. It starts a separate API on port 4100 and a frontend proxy on port 3100; the development services remain untouched. Run these two browser suites sequentially because they use the same frontend test port.

Connected browser checks use two authenticated accounts to save/resume drafts across refresh, publish and accept versions, revise terms, sign out and sign back in on desktop and mobile Chromium viewports. Test fixtures are synthetic and stay only in the test database. Backend tests separately verify access denial, conflicts, session revocation and persistence across an application restart.

## Implementation boundaries

The frontend sends no caller role or user ID when accepting; the API derives both from the authenticated session and project membership. The same-origin proxy forwards only the required cookie, JSON, origin and anti-CSRF headers. Backend errors remain visible; an HTTP response is never presented as a chain payment.

Email verification, password recovery, invitations, account deletion, file uploads, real wallet ownership, payments, notifications and production operations are not implemented. Keep this as a local development service until those launch decisions and operational controls are reviewed.

## Documents

- [Screen blueprint](docs/SCREENS.md)
- [Detailed prototype blueprint](docs/PROTOTYPE-BLUEPRINT.md)
- [Canonical product specification](https://github.com/accordbridge-labs/accordbridge-backend/blob/main/docs/PRODUCT.md)
- [API contract](https://github.com/accordbridge-labs/accordbridge-backend/blob/main/docs/openapi.json)
- [Contract evaluation](https://github.com/accordbridge-labs/accordbridge-contracts)

License selection is pending.
