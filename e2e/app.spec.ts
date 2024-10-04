import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

test.describe("main tests", () => {
  test("sign in", async ({ page }) => {
    await setupClerkTestingToken({ page });

    await page.goto("/protected");
    await expect(page.locator("h1")).toContainText("Sign In");
    await page.waitForSelector(".cl-signIn-root", { state: "attached" });
    await page
      .locator("input[name=identifier]")
      .fill(process.env.E2E_CLERK_USER_USERNAME!);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .locator("input[name=password]")
      .fill(process.env.E2E_CLERK_USER_PASSWORD!);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForURL("**/protected");
  });

  test("sign up", async ({ page }) => {
    await setupClerkTestingToken({ page });

    await page.goto("/sign-up");
    await clerk.loaded({ page });
    await page.waitForSelector(".cl-signUp-root", { state: "attached" });
    await page.locator("input[name=username]").fill("user" + Date.now());
    await page.locator("input[name=password]").fill("Pass!@" + Date.now());
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForURL("**/protected");
  });

  test("sign in using helper", async ({ page }) => {
    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
      },
    });
    await page.goto("/protected");
    await page.waitForSelector("h1:has-text('This is a PROTECTED page')");
  });

  test("sign out using helpers", async ({ page }) => {
    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
      },
    });
    await page.goto("/protected");
    await page.waitForSelector("h1:has-text('This is a PROTECTED page')");
    await clerk.signOut({ page });
    await page.goto("/protected");
    // should redirect to sign in page
    await page.waitForSelector("h1:has-text('Sign in')");
  });
});
