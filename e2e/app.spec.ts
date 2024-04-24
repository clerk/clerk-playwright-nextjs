import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

test.describe('app', () => {
  test("sign in", async ({ page }) => {
    await setupClerkTestingToken({ page });
  
    await page.goto("/protected");
    await expect(page.locator("h1")).toContainText("Sign In");
    await page.waitForSelector('.cl-signIn-root', { state: 'attached' });
    await page.locator('input[name=identifier]').fill(process.env.E2E_CLERK_USER_USERNAME!);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.locator('input[name=password]').fill(process.env.E2E_CLERK_USER_PASSWORD!);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL('**/protected');
  });
  
  
  test("sign up", async ({ page }) => {
    await setupClerkTestingToken({ page });
  
    await page.goto("/sign-up");
    await expect(page.locator("h1")).toContainText("Sign Up");
    await page.waitForSelector('.cl-signUp-root', { state: 'attached' });
    await page.locator('input[name=username]').fill('user' + Date.now());
    await page.locator('input[name=password]').fill('Pass!@' + Date.now());
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL('**/protected');
  });
});
