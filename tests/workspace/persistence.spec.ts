import { expect, test, Page } from "@playwright/test";

test("two authenticated participants save, resume, publish and accept versioned agreements", async ({
  page,
  browser,
}) => {
  const partnerContext = await browser.newContext({
    ...test.info().project.use,
    baseURL: "http://127.0.0.1:3100",
  });
  const partner = await partnerContext.newPage();
  const suffix = `${Date.now()}-${test.info().project.name}`;
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  async function register(target: Page, name: string) {
    await target.goto("/");
    await target
      .getByRole("button", { name: "New here? Create an account" })
      .click();
    await target.getByLabel("Your name", { exact: true }).fill(name);
    await target
      .getByLabel("Email", { exact: true })
      .fill(`${name.toLowerCase()}-${suffix}@example.test`);
    await target
      .getByLabel("Password", { exact: true })
      .fill("browser-test-passphrase-42!");
    await target
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await expect(
      target.getByRole("button", { name: "New project", exact: true }),
    ).toBeVisible();
  }
  try {
    await register(partner, "Tobi");
    await partner.getByRole("button", { name: "Show my account ID" }).click();
    const partnerId = await partner.getByTestId("account-id").innerText();
    await register(page, "Maya");
    await page
      .getByRole("button", { name: "New project", exact: true })
      .click();
    await page
      .getByLabel("Project title", { exact: true })
      .fill("Saved studio project");
    await page
      .getByLabel("Counterparty account ID", { exact: true })
      .fill(partnerId);
    await page
      .getByRole("button", { name: "Create project & edit agreement" })
      .click();
    await page
      .getByLabel("Project description", { exact: true })
      .fill("Persistent fictional project");
    await page.getByRole("button", { name: "Save draft & close" }).click();
    await expect(page.getByRole("status")).toContainText("Draft saved");
    const url = page.url();
    await page.reload();
    await page.getByRole("button", { name: "Resume my saved draft" }).click();
    await expect(
      page.getByRole("textbox", { name: "Project description", exact: true }),
    ).toHaveValue("Persistent fictional project");
    const milestone = page.getByRole("group", {
      name: "Milestone 1",
      exact: true,
    });
    await milestone
      .getByLabel("Milestone name", { exact: true })
      .fill("Design");
    await milestone.getByLabel("Amount (USDC)", { exact: true }).fill("225.50");
    await milestone
      .getByLabel("Delivery date", { exact: true })
      .fill("2026-12-01");
    await milestone
      .getByLabel("Deliverables", { exact: true })
      .fill("Three page designs");
    await milestone
      .getByLabel("Acceptance criteria (one per line)", { exact: true })
      .fill("Mobile and desktop layouts");
    await page
      .getByLabel("Exclusions", { exact: true })
      .fill("No online store");
    await page.getByRole("button", { name: "Send for review" }).click();
    await page
      .getByRole("button", { name: "Accept agreement v1", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Your acceptance is saved" }),
    ).toBeDisabled();
    await partner.goto(url);
    await expect(
      partner.getByText(
        "You are the freelancer. Only you can record your acceptance.",
      ),
    ).toBeVisible();
    await partner
      .getByRole("button", { name: "Accept agreement v1", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Refresh project", exact: true })
      .click();
    await expect(
      page.getByText("Accepted by both", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Propose changes", exact: true })
      .click();
    await page
      .getByRole("group", { name: "Milestone 1", exact: true })
      .getByLabel("Amount (USDC)", { exact: true })
      .fill("250");
    await page.getByRole("button", { name: "Send for review" }).click();
    await expect(
      page.getByRole("button", { name: "Accept agreement v2", exact: true }),
    ).toBeEnabled();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Agreement v2", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Agreement v1 · superseded", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Demo role" })).toHaveCount(
      0,
    );
    await page.screenshot({
      path: `test-results/saved-workspace-${test.info().project.name}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await page.goto(url);
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Email", { exact: true })
      .fill(`maya-${suffix}@example.test`);
    await page
      .getByLabel("Password", { exact: true })
      .fill("browser-test-passphrase-42!");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Agreement v2", exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    await partnerContext.close();
  }
});
