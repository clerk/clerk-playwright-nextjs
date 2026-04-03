import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { createClerkClient } from "@clerk/backend";
import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe.configure({
  mode: "serial",
});

// Test user info is saved here so teardown can clean up created users.
const testUsersFile = path.join(__dirname, "../playwright/.clerk/signup-user.json");

// Persist created user info to disk immediately so teardown can
// clean up even if the run is killed before all tests complete.
function trackCreatedUser(userId: string, email: string) {
  const existing: { userId: string; email: string }[] = fs.existsSync(testUsersFile)
    ? JSON.parse(fs.readFileSync(testUsersFile, "utf-8"))
    : [];
  existing.push({ userId, email });
  fs.writeFileSync(testUsersFile, JSON.stringify(existing));
}

function updateTrackedUser(email: string, userId: string) {
  if (!fs.existsSync(testUsersFile)) return;
  const existing: { userId: string; email: string }[] = JSON.parse(
    fs.readFileSync(testUsersFile, "utf-8"),
  );
  const entry = existing.find((u) => u.email === email);
  if (entry) entry.userId = userId;
  fs.writeFileSync(testUsersFile, JSON.stringify(existing));
}

test.describe("main tests", () => {

  test("sign up", async ({ page }) => {
    await setupClerkTestingToken({ page });

    // Unique email per run so concurrent runs don't collide.
    // Uses +clerk_test so 424242 works as the verification code.
    const signUpEmail = `e2e-signup-${Date.now()}+clerk_test@example.com`;

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

    // Track for cleanup before submitting — if the test crashes after sign-up
    // but before we can read the userId, teardown uses the email as fallback
    trackCreatedUser("", signUpEmail);

    // Start waiting for the verification response before clicking to avoid a race
    const verificationResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes("prepare_verification") && resp.status() === 200,
    );
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await verificationResponse;

    // Enter test OTP code (424242 works with +clerk_test emails)
    await page
      .getByRole("textbox", { name: "Enter verification code" })
      .pressSequentially("424242");
    await page.waitForURL("**/protected");

    // Update the tracked entry with the actual userId for faster cleanup
    const userId = await page.evaluate(
      () => (window as any).Clerk?.user?.id,
    );
    updateTrackedUser(signUpEmail, userId);
  });

  test("sign in", async ({ page }) => {
    await setupClerkTestingToken({ page });

    // Create a dedicated test user for this sign-in test via the Backend API
    // so this test can run independently of the sign-up test
    const signInEmail = `e2e-signin-${Date.now()}+clerk_test@example.com`;
    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    const user = await client.users.createUser({
      emailAddress: [signInEmail],
      password: process.env.E2E_CLERK_USER_PASSWORD!,
      firstName: "Test",
      lastName: "User",
    });
    trackCreatedUser(user.id, signInEmail);

    // Sign in via the UI to demonstrate the +clerk_test / 424242 pattern
    await page.goto("/sign-in");
    await page.waitForSelector(".cl-signIn-root", { state: "attached" });
    await page.locator("input[name=identifier]").fill(signInEmail);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .locator("input[name=password]")
      .fill(process.env.E2E_CLERK_USER_PASSWORD!);

    // Start waiting for the second factor response before clicking to avoid a race
    const secondFactorResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes("prepare_second_factor") && resp.status() === 200,
    );
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await secondFactorResponse;

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
