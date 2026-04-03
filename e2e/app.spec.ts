import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe.configure({
  mode: "serial",
});

// The sign-up test writes the created user's info here so the sign-in
// test can reuse it, and teardown can clean it up.
const signUpUserFile = path.join(__dirname, "../playwright/.clerk/signup-user.json");

// Unique email per run so concurrent runs on the same instance don't collide.
// Uses +clerk_test so 424242 works as the verification code.
const signUpEmail = `e2e-signup-${Date.now()}+clerk_test@example.com`;

test.describe("main tests", () => {
  test("sign up", async ({ page }) => {
    await setupClerkTestingToken({ page });

    await page.goto("/sign-up");
    await page.waitForSelector(".cl-signUp-root", { state: "attached" });
    // Fill optional fields if the instance has them enabled
    const firstNameField = page.locator("input[name=firstName]");
    if (await firstNameField.isVisible()) {
      await firstNameField.fill("Test");
    }
    const lastNameField = page.locator("input[name=lastName]");
    if (await lastNameField.isVisible()) {
      await lastNameField.fill("User");
    }
    const usernameField = page.locator("input[name=username]");
    if (await usernameField.isVisible()) {
      await usernameField.fill(`e2e-signup-${Date.now()}`);
    }
    // Fill email with +clerk_test so 424242 works as the verification code
    await page.locator("input[name=emailAddress]").fill(signUpEmail);
    await page
      .locator("input[name=password]")
      .fill(process.env.E2E_CLERK_USER_PASSWORD!);
    // Check the legal checkbox if present
    const legalCheckbox = page.locator("input[name=legalAccepted]");
    if (await legalCheckbox.isVisible()) {
      await legalCheckbox.check();
    }
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // Wait for Clerk to prepare the email verification
    await page.waitForResponse(
      (resp) =>
        resp.url().includes("prepare_verification") && resp.status() === 200,
    );

    // Enter test OTP code (424242 works with +clerk_test emails)
    await page
      .getByRole("textbox", { name: "Enter verification code" })
      .pressSequentially("424242");
    await page.waitForURL("**/protected");

    // Save the created user's ID so teardown can clean it up
    const userId = await page.evaluate(
      () => (window as any).Clerk?.user?.id,
    );
    fs.writeFileSync(signUpUserFile, JSON.stringify({ userId }));
  });

  test("sign in", async ({ page }) => {
    await setupClerkTestingToken({ page });

    // Sign in with the user created in the sign-up test
    await page.goto("/sign-in");
    await page.waitForSelector(".cl-signIn-root", { state: "attached" });
    await page.locator("input[name=identifier]").fill(signUpEmail);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .locator("input[name=password]")
      .fill(process.env.E2E_CLERK_USER_PASSWORD!);
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // Wait for Clerk to prepare the second factor verification
    await page.waitForResponse(
      (resp) =>
        resp.url().includes("prepare_second_factor") && resp.status() === 200,
    );

    // Enter test OTP code (424242 works with +clerk_test emails)
    await page
      .getByRole("textbox", { name: "Enter verification code" })
      .pressSequentially("424242");
    await page.waitForURL("**/protected");
  });

  test("sign in using helper", async ({ page }) => {
    await page.goto("/");
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_CLERK_USER_EMAIL!,
    });
    await page.goto("/protected");
    await page.waitForSelector("h1:has-text('This is a PROTECTED page')");
  });

  test("sign out using helpers", async ({ page }) => {
    await page.goto("/");
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_CLERK_USER_EMAIL!,
    });
    await page.goto("/protected");
    await page.waitForSelector("h1:has-text('This is a PROTECTED page')");
    await clerk.signOut({ page });
    await page.waitForFunction(() => window.Clerk?.user === null);
    await page.goto("/protected");
    // should redirect to sign in page
    await page.waitForSelector("h1:has-text('Sign in')");
  });
});
