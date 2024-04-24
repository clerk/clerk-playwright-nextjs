# Next.js + Playwright + Clerk

This example uses:
- Next.js 14.2.2
- Playwright 1.43.1
- Clerk 5.0.2 (Core 2)

### Getting Started

To run this example as is, you will need dev instance keys, a dummy user with username and password, and only enabled username and password in the Clerk Dashboard.

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

To run the GitHub Actions workflow, you need to set the env variables mentioned above in the repository environment variables. Then, you can trigger the workflow manually.

```shell
# secrets
CLERK_SECRET_KEY
E2E_CLERK_USER_USERNAME
E2E_CLERK_USER_PASSWORD

# vars
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```
