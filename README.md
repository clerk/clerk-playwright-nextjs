# Next.js + Playwright + Clerk

This example uses:

- Next.js 14.x
- Playwright 1.x
- Clerk (Core 2)

### Getting Started

To run the current example test, you'll need dev instance keys, a test user with username and password, and have `username` and `password` authentication enabled in the Clerk Dashboard.

You need the following environment variables in the `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXX
CLERK_SECRET_KEY=sk_test_XXX

E2E_CLERK_USER_USERNAME=username
E2E_CLERK_USER_PASSWORD=password
```

### Install dependencies

```bash
npm install
```

### Install test dependencies

```bash
npx playwright install-deps
```

### Run tests

```bash
npm run test:e2e
```

### Run the GitHub Actions workflow

To run the **GitHub Actions** workflow, set the environment variables in the repository settings. After that, manually trigger the workflow from the **GitHub Actions** tab.

```shell
# secrets
CLERK_SECRET_KEY
E2E_CLERK_USER_USERNAME
E2E_CLERK_USER_PASSWORD

# vars
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```
