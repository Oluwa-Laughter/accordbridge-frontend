import { expect, test } from "@playwright/test";

test("both parties complete the agreement, funding, revision and payout journey", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
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
  await page.goto("/");
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
