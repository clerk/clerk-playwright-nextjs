import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { createClerkClient } from "@clerk/backend";
import { test as setup } from "@playwright/test";
import fs from "fs";
import path from "path";

// Ensures that Clerk setup is done before any tests run
setup.describe.configure({
  mode: "serial",
});

const signUpUserFile = path.join(__dirname, "../playwright/.clerk/signup-user.json");

setup("global setup", async () => {
  await clerkSetup({ dotenv: false });

  if (!process.env.E2E_CLERK_USER_EMAIL || !process.env.E2E_CLERK_USER_PASSWORD) {
    throw new Error(
      "Please provide E2E_CLERK_USER_EMAIL and E2E_CLERK_USER_PASSWORD environment variables."
    );
  }

  const client = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  // Ensure a test user exists with a +clerk_test email so no real
  // emails are sent during tests (verification codes, notifications, etc.)
  const { data: users } = await client.users.getUserList({
    emailAddress: [process.env.E2E_CLERK_USER_EMAIL!],
  });

  if (users.length === 0) {
    await client.users.createUser({
      emailAddress: [process.env.E2E_CLERK_USER_EMAIL!],
      password: process.env.E2E_CLERK_USER_PASSWORD!,
      firstName: "Test",
      lastName: "User",
    });
  }

  // Clean up a stale sign-up test user from a previous run that was
  // killed before teardown could run
  if (fs.existsSync(signUpUserFile)) {
    const { userId, email } = JSON.parse(
      fs.readFileSync(signUpUserFile, "utf-8"),
    );
    try {
      await client.users.deleteUser(userId);
      fs.unlinkSync(signUpUserFile);
    } catch {
      // If delete fails (e.g., user already deleted), try by email as fallback
      const { data: staleUsers } = await client.users.getUserList({
        emailAddress: [email],
      });
      for (const user of staleUsers) {
        await client.users.deleteUser(user.id);
      }
      fs.unlinkSync(signUpUserFile);
    }
  }
});

const authFile = path.join(__dirname, "../playwright/.clerk/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/");
  await clerk.signIn({
    page,
    emailAddress: process.env.E2E_CLERK_USER_EMAIL!,
  });
  await page.goto("/protected");
  await page.waitForSelector("h1:has-text('This is a PROTECTED page')");

  await page.context().storageState({ path: authFile });
});
