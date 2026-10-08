import { expect, test } from "@playwright/test";

test("create and revise an agreement with dynamic amounts and fresh acceptance", async ({
  page,
}) => {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: "Create agreement", exact: true })
    .click();
  await page.getByRole("button", { name: "Send for review" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Check these fields" }),
  ).toContainText("Enter a project title");
  await page
    .getByLabel("Project title", { exact: true })
    .fill("Lagos studio website");
  await page.getByRole("button", { name: "Save draft & close" }).click();
  await expect(
    page.getByRole("heading", { name: "Northstar website", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume saved draft" }).click();
  await expect(page.getByLabel("Project title", { exact: true })).toHaveValue(
    "Lagos studio website",
  );
  await page
    .getByLabel("Project description", { exact: true })
    .fill("Build a portfolio for a fictional studio.");
  const first = page.getByRole("group", { name: "Milestone 1", exact: true });
  await first.getByLabel("Milestone name").fill("Portfolio design");
  await first.getByLabel("Amount (USDC)").fill("225.50");
  await first.getByLabel("Delivery date").fill("2026-11-15");
  await first.getByLabel("Deliverables").fill("Three responsive page layouts");
  await first
    .getByLabel("Acceptance criteria (one per line)")
    .fill("Three pages\nMobile layouts");
  await page
    .getByRole("button", { name: "Add milestone", exact: true })
    .click();
  const second = page.getByRole("group", { name: "Milestone 2", exact: true });
  await second.getByLabel("Milestone name").fill("Build");
  await second.getByLabel("Amount (USDC)").fill("400");
  await second.getByLabel("Delivery date").fill("2026-11-22");
  await second.getByLabel("Deliverables").fill("Implement the approved pages");
  await second
    .getByLabel("Acceptance criteria (one per line)")
    .fill("Working contact form");
  await page.getByLabel("Exclusions", { exact: true }).fill("No online store");
  await page.screenshot({
    path: `test-results/agreement-editor-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Send for review" }).click();
  await expect(
    page.getByRole("heading", { name: "Lagos studio website", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Accept sample agreement as Maya" })
    .click();
  await page.getByRole("button", { name: "Propose changes" }).click();
  await page
    .getByRole("group", { name: "Milestone 1", exact: true })
    .getByLabel("Amount (USDC)")
    .fill("250");
  await page.getByRole("button", { name: "Send for review" }).click();
  await expect(
    page.getByRole("heading", { name: "Agreement v2", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Agreement v1 · 625.5 USDC · superseded", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Simulate funding/ }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Accept sample agreement as Maya" })
    .click();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("freelancer");
  await page
    .getByRole("button", { name: "Accept sample agreement as Tobi" })
    .click();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("client");
  await page
    .getByRole("button", { name: "Simulate funding · 250 USDC" })
    .click();
  await expect(
    page.getByRole("button", { name: "Propose changes" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Simulate confirmed transaction" })
    .click();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("freelancer");
  await page.getByRole("button", { name: "Submit work · v1" }).click();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("client");
  await page
    .getByRole("button", { name: "Approve milestone", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm approval" }).click();
  await page
    .getByRole("button", { name: "Simulate confirmed transaction" })
    .click();
  await page.getByRole("button", { name: "View sample receipt" }).click();
  await expect(
    page
      .getByRole("definition")
      .filter({ hasText: "Lagos studio website / v2" }),
  ).toBeVisible();
  await expect(
    page.getByRole("definition").filter({ hasText: "249.25 USDC" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("both parties complete the agreement, funding, revision and payout journey", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/demo");
  await expect(
    page.getByText("Demo — sample data, no real payments"),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/overview-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Open workspace", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Accept sample agreement as Maya" })
    .click();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("freelancer");
  await page
    .getByRole("button", { name: "Accept sample agreement as Tobi" })
    .click();
  await expect(
    page.getByRole("button", { name: /Simulate funding/ }),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("client");
  await page.getByRole("button", { name: /Simulate funding/ }).click();
  await page.getByRole("button", { name: "Simulate unknown outcome" }).click();
  await expect(
    page.getByRole("button", { name: /Simulate funding/ }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Check transaction · simulate confirmation" })
    .click();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("freelancer");
  await page.getByRole("button", { name: "Submit work · v1" }).click();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("client");
  await page
    .getByLabel("Request a revision · name an unmet criterion")
    .fill("Mobile contact layout missing");
  await page
    .getByRole("button", { name: "Request revision", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("freelancer");
  await page
    .getByLabel("Delivery notes · sample evidence only")
    .fill("Updated mobile contact layout");
  await page.getByRole("button", { name: "Submit work · v2" }).click();
  await expect(page.getByText("Version 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Version 2", { exact: true })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("client");
  await page
    .getByRole("button", { name: "Approve milestone", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm approval", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "View sample receipt" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Simulate confirmed transaction" })
    .click();
  await page.getByRole("button", { name: "View sample receipt" }).click();
  await expect(
    page.getByRole("definition").filter({ hasText: "149.55 USDC" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("disputes retain funds and responsive layout fits", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "03 Client review" }).click();
  await page.getByRole("button", { name: "Open dispute", exact: true }).click();
  await expect(
    page.getByText("Pending · no real reviewer contacted"),
  ).toBeVisible();
  await expect(
    page.getByText("150 USDC held, including 150 USDC disputed.", {
      exact: false,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/resolution-${test.info().project.name}.png`,
    fullPage: true,
  });
});
