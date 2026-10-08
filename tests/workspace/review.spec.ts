import { test, expect, BrowserContext } from "@playwright/test";
import { createRequire } from "node:module";
import { loadEnvFile } from "node:process";
import path from "node:path";
import { randomUUID } from "node:crypto";

const backend = path.resolve("../accordbridge-backend");
loadEnvFile(path.join(backend, ".env.test"));
const { Pool } = createRequire(path.join(backend, "package.json"))("pg");

test("freelancer submits revisions and client approval unlocks separate release", async ({
  page,
  browser,
}) => {
  if (!new URL(process.env.DATABASE_URL!).pathname.endsWith("_test"))
    throw Error("Isolated test database required");
  const db = new Pool({ connectionString: process.env.DATABASE_URL });
  const partnerContext = await browser.newContext({
    ...test.info().project.use,
    baseURL: "http://127.0.0.1:3100",
  });
  const partner = await partnerContext.newPage();
  const users: string[] = [];
  let project = "";
  async function post(context: BrowserContext, route: string, body: unknown) {
    const response = await context.request.post(`/api${route}`, {
      headers: {
        origin: "http://127.0.0.1:3100",
        "x-accordbridge-request": "1",
      },
      data: body,
    });
    expect(response.ok()).toBeTruthy();
    return response.json();
  }
  try {
    for (const [context, name] of [
      [page.context(), "Client"],
      [partnerContext, "Freelancer"],
    ] as const) {
      const result = await post(context, "/auth/register", {
        name,
        email: `${randomUUID()}@example.test`,
        password: "browser-review-fixture-passphrase",
      });
      users.push(result.user.id);
    }
    const agreement = {
      title: "Review journey",
      description: "Synthetic funded fixture",
      exclusions: "Real money",
      revisions: 1,
      reviewDays: 7,
      milestones: [
        {
          name: "Design",
          amount: "150",
          scope: "Responsive page",
          criteria: "Mobile and desktop layouts",
          dueDate: "2026-12-01",
        },
      ],
    };
    project = (
      await post(page.context(), "/projects", {
        counterpartyId: users[1],
        role: "client",
        agreement,
      })
    ).id;
    await post(page.context(), `/projects/${project}/publish`, {
      expectedVersion: 0,
      expectedRevision: 1,
    });
    await post(page.context(), `/projects/${project}/accept`, { version: 1 });
    await post(partnerContext, `/projects/${project}/accept`, { version: 1 });
    // Synthetic chain snapshot in the isolated test database; no test claims a real deposit.
    await db.query("UPDATE projects SET funding_started=true WHERE id=$1", [
      project,
    ]);
    await db.query(
      "INSERT INTO testnet_escrows(project_id,agreement_version,client_address,freelancer_address,token_contract,wasm_hash,amount_base_units,terms_hash,contract_id,chain_state,checked_at) VALUES($1,1,$2,$3,$4,$5,'1500000000',$5,$4,$6,now())",
      [
        project,
        "G".repeat(56),
        "G".repeat(56),
        "C".repeat(56),
        "a".repeat(64),
        {
          status: 1,
          clientAccepted: true,
          freelancerAccepted: true,
          clientRefund: false,
          freelancerRefund: false,
          balanceBaseUnits: "1500000000",
        },
      ],
    );
    await page.route("**/api/testnet/wallet", (route) =>
      route.fulfill({ json: { enabled: true, address: "G".repeat(56) } }),
    );
    await page.goto(`/?project=${project}`);
    await partner.goto(`/?project=${project}`);
    await expect(
      page.getByRole("button", {
        name: "Approve submitted work before release",
      }),
    ).toBeDisabled();
    await partner
      .getByLabel("Delivery notes", { exact: true })
      .fill("First responsive design");
    await partner
      .getByLabel("Delivery links (one HTTPS URL per line)", { exact: true })
      .fill("https://example.test/design-v1");
    await partner
      .getByRole("button", { name: "Submit work for review", exact: true })
      .click();
    await expect(
      partner.getByRole("heading", { name: "Submission 1", exact: true }),
    ).toBeVisible();
    await page.reload();
    await page
      .getByLabel("Review feedback", { exact: true })
      .fill("Fix mobile spacing against the agreed layout criteria");
    await page
      .getByRole("button", { name: "Request revisions", exact: true })
      .click();
    await expect(
      page.getByText("Revisions requested", { exact: true }).first(),
    ).toBeVisible();
    await partner.reload();
    await partner
      .getByLabel("Delivery notes", { exact: true })
      .fill("Mobile spacing corrected");
    await partner
      .getByLabel("Delivery links (one HTTPS URL per line)", { exact: true })
      .fill("https://example.test/design-v2");
    await partner
      .getByRole("button", { name: "Submit work for review", exact: true })
      .click();
    await expect(
      partner.getByRole("heading", { name: "Submission 2", exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Request revisions", exact: true }),
    ).toBeDisabled();
    await page
      .getByLabel("Review feedback", { exact: true })
      .fill("Meets the accepted criteria");
    await page
      .getByRole("button", { name: "Approve submitted work", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Review release to freelancer",
        exact: true,
      }),
    ).toBeEnabled();
    await page.reload();
    await expect(
      page.getByText("Work approved · release is a separate step", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Funded on testnet", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Submission 1", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/work-review-${test.info().project.name}.png`,
      fullPage: true,
    });
  } finally {
    await partnerContext.close();
    if (project) await db.query("DELETE FROM projects WHERE id=$1", [project]);
    if (users.length)
      await db.query("DELETE FROM users WHERE id=ANY($1::uuid[])", [users]);
    await db.end();
  }
});
