# Next.js + Playwright + Clerk

This example uses:

- Next.js 16.x
- Playwright 1.x
- Clerk (NextJS 6.x)

### Getting Started

To run the current example test, you'll need dev instance keys and have `email` and `password` authentication enabled in the Clerk Dashboard. A test user is created automatically during setup.

### Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

### Install dependencies

```bash
npm install
```

### Install test dependencies

```bash
npx playwright install chromium
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
E2E_CLERK_USER_PASSWORD

# vars
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
E2E_CLERK_USER_EMAIL
```
