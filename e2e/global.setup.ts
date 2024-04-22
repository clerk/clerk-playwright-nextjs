import { clerkSetup } from '@clerk/playwright';
import { test as setup } from '@playwright/test';

setup('global setup', async ({ }) => {
    await clerkSetup();
});