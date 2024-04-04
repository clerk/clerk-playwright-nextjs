# Next.js + Playwright + Clerk

### Getting Started

You need the following environment variables:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXX
CLERK_SECRET_KEY=sk_test_XXX

NEXT_PUBLIC_CLERK_TESTING_TOKEN=xxx
```

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Install test dependencies

```bash
npx playwright install-deps
```

### Run tests

```bash
npm run test:e2e
```