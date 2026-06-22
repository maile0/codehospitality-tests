# CODE Hospitality — Registration Test Suite

Playwright + TypeScript automation for the registration flow at  
https://code-staging-web.on.dev-craft.tech

## Scope

Tests cover **Step 1 of registration only**: entering an email address and a password, then confirming that the activation-code popup appears after clicking "Register".

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # adjust values if needed
```

## Running tests

```bash
# Run all tests (headless)
npm test

# Run with browser visible
npm run test:headed

# Open the HTML report after a run
npm run report
```

## Test cases

| ID     | Description                                              | Status      |
|--------|----------------------------------------------------------|-------------|
| TC-01  | Navigate from login page to registration page            | Automated   |
| TC-02  | Valid credentials → activation popup appears             | Automated   |
| TC-03  | Empty email → validation error, no popup                 | Automated   |
| TC-04  | Empty password → validation error, no popup              | Automated   |
| TC-05  | Invalid email format → validation error, no popup        | Automated   |
| TC-06  | Password below minimum length is rejected                | TODO        |
| TC-07  | Already-registered email shows an error                  | TODO        |
| TC-08  | Activation popup contains expected UI elements           | TODO        |
| TC-09  | Unchecked terms checkbox blocks submission               | TODO        |
| TC-10  | Multiple invalid email format variants are each rejected | TODO        |

## Project structure

```
├── Pages/
│   └── RegisterPage.ts    # Page Object for the registration form
├── tests/
│   └── registration.spec.ts
├── .env.example
├── playwright.config.ts
└── tsconfig.json
```
