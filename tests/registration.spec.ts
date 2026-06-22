import { test, expect } from '@playwright/test';
import { RegisterPage } from '../Pages/RegisterPage';

const VALID_PASSWORD = process.env.TEST_PASSWORD ?? 'Test@12345!';

function uniqueEmail(): string {
  return `test+${Date.now()}@mailinator.com`;
}

// ---------------------------------------------------------------------------
// TC-01: Navigate from login page to registration page
// ---------------------------------------------------------------------------
test('TC-01: navigating to registration page via login page link', async ({ page }) => {
  const registerPage = new RegisterPage(page);

  await page.goto('/login');
  await registerPage.joinHereLink.click();

  await expect(page).toHaveURL(/\/signup/);
  await expect(registerPage.emailInput).toBeVisible();
  await expect(registerPage.passwordInput).toBeVisible();
  await expect(registerPage.registerButton).toBeVisible();
});

// ---------------------------------------------------------------------------
// TC-02: Happy path — valid credentials lead to activation popup
// ---------------------------------------------------------------------------
test('TC-02: successful registration shows activation code popup', async ({ page }) => {
  const registerPage = new RegisterPage(page);

  await registerPage.goto();
  await registerPage.register(uniqueEmail(), VALID_PASSWORD);

  await registerPage.verifyActivationPopupVisible();
});

// ---------------------------------------------------------------------------
// TC-03: Submitting with empty email shows validation error
// ---------------------------------------------------------------------------
test('TC-03: empty email shows validation error', async ({ page }) => {
  const registerPage = new RegisterPage(page);

  await registerPage.goto();
  await registerPage.fillPassword(VALID_PASSWORD);
  await registerPage.acceptTerms();
  await registerPage.clickRegister();

  await registerPage.verifyEmailErrorVisible();
  await expect(registerPage.activationPopup).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// TC-04: Submitting with empty password shows validation error
// ---------------------------------------------------------------------------
test('TC-04: empty password shows validation error', async ({ page }) => {
  const registerPage = new RegisterPage(page);

  await registerPage.goto();
  await registerPage.fillEmail(uniqueEmail());
  await registerPage.acceptTerms();
  await registerPage.clickRegister();

  await registerPage.verifyPasswordErrorVisible();
  await expect(registerPage.activationPopup).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// TC-05: Invalid email format is rejected
// ---------------------------------------------------------------------------
test('TC-05: invalid email format shows validation error', async ({ page }) => {
  const registerPage = new RegisterPage(page);

  await registerPage.goto();
  await registerPage.fillEmail('not-an-email');
  await registerPage.fillPassword(VALID_PASSWORD);
  await registerPage.acceptTerms();
  await registerPage.clickRegister();

  await registerPage.verifyEmailErrorVisible();
  await expect(registerPage.activationPopup).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// TODO test cases — not automated yet
// ---------------------------------------------------------------------------

test.skip('TC-06: password shorter than the minimum allowed length is rejected', async () => {
  // TODO: Fill a password of e.g. 3 characters → expect password error, no popup.
  // Blocked by: minimum length not documented; needs exploration to confirm the rule.
});

test.skip('TC-07: already-registered email shows an appropriate error', async () => {
  // TODO: Attempt to register with an email already in the system.
  // Blocked by: requires a pre-seeded account or a known registered address in the env.
});

test.skip('TC-08: activation popup contains the expected UI elements', async () => {
  // TODO: After TC-02 succeeds, assert popup has: title, activation code input, confirm button.
  // Extend TC-02 once the popup structure is confirmed.
});

test.skip('TC-09: submitting with terms checkbox unchecked is blocked', async () => {
  // TODO: Fill valid email + password but skip acceptTerms() → expect inline warning, no popup.
  // Blocked by: need to confirm whether the app prevents submission or just warns.
});

test.skip('TC-10: multiple invalid email format variants are each rejected', async () => {
  // TODO: Edge-case variants: "@domain.com", "user@", "user@domain", "user@@domain.com".
  // Extend TC-05 into a data-driven loop once the base test is stable.
});
