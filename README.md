# CODE Hospitality — Automated Test Suite

Playwright + TypeScript automation for the registration flow at
https://code-staging-web.on.dev-craft.tech

---

## Prerequisites

- Node.js >= 18
- npm >= 9

---

## Installation

```bash
git clone https://github.com/maile0/codehospitality-tests.git
cd codehospitality-tests
npm install
npx playwright install chromium
cp .env.example .env
```

Open `.env` and fill in the required values (see [Environment variables](#environment-variables) below).

---

## Running tests

```bash
# All tests — headless (creates "Regression Run" in Qase)
npm test

# All tests — with browser visible
npm run test:headed

# Smoke suite only — 4 core tests (creates "Smoke Test Run" in Qase)
npm run test:smoke

# Open the HTML report after any run
npm run report
```

---

## Environment variables

Copy `.env.example` to `.env` and set the following:

| Variable          | Description                                       |
|-------------------|---------------------------------------------------|
| `BASE_URL`        | URL of the app under test                         |
| `TEST_PASSWORD`   | Valid password used across tests                  |
| `QASE_API_TOKEN`  | API token from your Qase account                  |
| `QASE_PROJECT`    | Qase project code (default: `CODEH`)              |

---

## Qase integration

Tests are integrated with [Qase TestOps](https://qase.io) via `playwright-qase-reporter`.

Every test is annotated with a Qase case ID using `qase(id, 'title')`. After each run, results are automatically uploaded and a new Test Run is created in Qase.

**Run naming:**

| Command              | Qase Run name      |
|----------------------|--------------------|
| `npm test`           | Regression Run     |
| `npm run test:smoke` | Smoke Test Run     |

To use a custom run name for a one-off execution:

```bash
QASE_RUN_TITLE='My custom run' npx playwright test --project=chromium
```

---

## Smoke suite

The smoke suite covers the 4 most critical checks and is intended to run after each release:

- Navigation from login page to registration
- Registration page renders all progress bar steps
- Server rejects an already-registered email
- Successful registration shows the activation popup

Tests are tagged with `@smoke`. To run them without an npm script:

```bash
npx playwright test --grep @smoke
```

---

## Project structure

```
├── fixtures/
│   └── index.ts              # Custom Playwright fixture (registerPage)
├── helpers/
│   └── test-data.ts          # Shared test data (uniqueEmail, VALID_PASSWORD)
├── Pages/
│   └── RegisterPage.ts       # Page Object for the registration form
├── tests/
│   └── registration.spec.ts  # Test suite
├── .env.example
├── playwright.config.ts
└── tsconfig.json
```
