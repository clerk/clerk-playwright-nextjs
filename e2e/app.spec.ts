import { clerkBypassBotProtection } from "@clerk/playwright";
import { test, expect } from "@playwright/test";

test.describe('app', () => {
  test("sign in", async ({ page }) => {
    await clerkBypassBotProtection({ page });
  
    await page.goto("/protected");
    await expect(page.locator("h1")).toContainText("Sign In");
    await page.waitForSelector('.cl-signIn-root', { state: 'attached' });
    await page.locator('input[name=identifier]').fill('ssss');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.locator('input[name=password]').fill('123');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL('**/protected');
  });
  
  
  test("sign up", async ({ page }) => {
    await clerkBypassBotProtection({ page });
  
    await page.goto("/sign-up");
    await expect(page.locator("h1")).toContainText("Sign Up");
    await page.waitForSelector('.cl-signUp-root', { state: 'attached' });
    await page.locator('input[name=username]').fill('stef' + Date.now());
    await page.locator('input[name=password]').fill('ASdfgdsgDSF238472389748329');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.waitForURL('**/protected');
  });
});
