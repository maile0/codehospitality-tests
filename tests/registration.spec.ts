import { qase } from "playwright-qase-reporter";
import { test, expect } from "../fixtures";
import { VALID_PASSWORD, uniqueEmail } from "../helpers/test-data";

// Navigation + Qase ID анотации за всеки тест

test.describe("Navigation", () => {
  test(
    qase(1, "navigates to registration page via login page link"),
    { tag: "@smoke" },
    async ({ registerPage, page }) => {
      await page.goto("/login");
      await registerPage.joinHereLink.click();

      await expect(page).toHaveURL(/\/signup/);
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.passwordInput).toBeVisible();
      await expect(registerPage.registerButton).toBeVisible();
    },
  );

  test(
    qase(2, "shows all 4 progress bar steps"),
    { tag: "@smoke" },
    async ({ registerPage, page }) => {
      const viewport = page.viewportSize();
      test.skip(
        !!viewport && viewport.width < 768,
        "Progress bar step labels are hidden on mobile viewports by design",
      );

      await registerPage.goto();

      await expect(registerPage.stepRegistration).toBeVisible();
      await expect(registerPage.stepPersonalInfo).toBeVisible();
      await expect(registerPage.stepPaymentDetails).toBeVisible();
      await expect(registerPage.stepProofOfEmployment).toBeVisible();
    },
  );
});

// Registration form — field validation

test.describe("Registration form — field validation", () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.goto();
  });

  test(
    qase(3, "empty email shows validation error"),
    async ({ registerPage }) => {
      await registerPage.fillPassword(VALID_PASSWORD);
      await registerPage.acceptTerms();
      await registerPage.clickRegister();

      await registerPage.verifyEmailErrorVisible("Required field");
      await expect(registerPage.activationPopup).not.toBeVisible();
    },
  );

  test(
    qase(4, "empty password shows validation error"),
    async ({ registerPage }) => {
      await registerPage.fillEmail(uniqueEmail());
      await registerPage.acceptTerms();
      await registerPage.clickRegister();

      await registerPage.verifyPasswordErrorVisible();
      await expect(registerPage.activationPopup).not.toBeVisible();
    },
  );

  test(
    qase(5, "invalid email format shows validation error"),
    async ({ registerPage }) => {
      await registerPage.fillEmail("not-an-email");
      await registerPage.fillPassword(VALID_PASSWORD);
      await registerPage.acceptTerms();
      await registerPage.clickRegister();

      await registerPage.verifyEmailErrorVisible("Invalid e-mail");
      await expect(registerPage.activationPopup).not.toBeVisible();
    },
  );

  test(
    qase(6, "excessively long email is rejected with well-formed email error"),
    async ({ registerPage }) => {
      const longEmail =
        "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong@test.com";

      await registerPage.fillEmail(longEmail);
      await registerPage.fillPassword(VALID_PASSWORD);
      await registerPage.acceptTerms();
      await registerPage.clickRegister();

      await expect(registerPage.serverErrorBanner).toBeVisible();
      await expect(registerPage.serverErrorBanner).toContainText(
        "must be a well-formed email address",
      );
      await expect(registerPage.activationPopup).not.toBeVisible();
    },
  );

  test(
    qase(7, "unchecked terms checkbox blocks submission"),
    async ({ registerPage }) => {
      await registerPage.fillEmail(uniqueEmail());
      await registerPage.fillPassword(VALID_PASSWORD);
      await registerPage.clickRegister();

      await expect(registerPage.termsErrorText).toHaveText("Required field");
      await expect(registerPage.termsErrorIcon).toBeVisible();
      await expect(registerPage.activationPopup).not.toBeVisible();
    },
  );

  test(
    qase(8, "already-registered email shows server error"),
    { tag: "@smoke" },
    async ({ registerPage }) => {
      await registerPage.register("test@test.com", VALID_PASSWORD);

      await expect(registerPage.serverErrorBanner).toBeVisible();
      await expect(registerPage.serverErrorBanner).toContainText(
        "User with this email already exist",
      );
      await expect(registerPage.activationPopup).not.toBeVisible();
    },
  );

  test.skip(
    qase(22, "password shorter than minimum length is rejected"),
    async () => {
      // минимум символи за парола? да питам Стефан
    },
  );

  test.skip(
    qase(23, "multiple invalid email format variants are each rejected"),
    async () => {
      // да видя различни имейл формати
    },
  );
});

// Password field

test.describe("Password field", () => {
  test(
    qase(9, "toggles visibility when eye icon is clicked"),
    async ({ registerPage }) => {
      await registerPage.goto();
      await registerPage.fillPassword(VALID_PASSWORD);

      await expect(registerPage.passwordInput).toHaveAttribute(
        "type",
        "password",
      );

      await registerPage.passwordToggle.click();

      await expect(registerPage.passwordInput).toHaveAttribute("type", "text");
    },
  );

  test(
    qase(10, "hides password again when eye icon is clicked a second time"),
    async ({ registerPage }) => {
      await registerPage.goto();
      await registerPage.fillPassword(VALID_PASSWORD);

      await registerPage.passwordToggle.click();
      await expect(registerPage.passwordInput).toHaveAttribute("type", "text");

      await registerPage.passwordToggle.click();
      await expect(registerPage.passwordInput).toHaveAttribute(
        "type",
        "password",
      );
    },
  );
});

// Successful registration

test.describe("Successful registration", () => {
  let email: string;

  test.beforeEach(async ({ registerPage }) => {
    email = uniqueEmail();
    await registerPage.goto();
    await registerPage.register(email, VALID_PASSWORD);
  });

  test(
    qase(11, "shows activation popup with the registered email"),
    { tag: "@smoke" },
    async ({ registerPage }) => {
      await registerPage.verifyActivationPopupVisible();
      await expect(registerPage.activationEmailDisplay).toHaveText(email);
    },
  );

  test(
    qase(12, "activation popup contains all expected UI elements"),
    async ({ registerPage }) => {
      await registerPage.verifyActivationPopupVisible();

      await expect(registerPage.activationPopupTitle).toBeVisible();
      await expect(registerPage.activationSpamText).toBeVisible();
      await expect(registerPage.activationCodeInputs).toHaveCount(5);
      await expect(registerPage.activationResendLink).toBeVisible();
      await expect(registerPage.activationChangeEmailLink).toBeVisible();
    },
  );
});

// Verification code popup

test.describe("Verification code popup", () => {
  let email: string;

  test.beforeEach(async ({ registerPage }) => {
    email = uniqueEmail();
    await registerPage.goto();
    await registerPage.register(email, VALID_PASSWORD);
    await registerPage.verifyActivationPopupVisible();
  });

  test(
    qase(13, "wrong code shows error and popup displays the registered email"),
    async ({ registerPage }) => {
      await expect(registerPage.activationEmailDisplay).toHaveText(email);

      const inputs = registerPage.activationCodeInputs;
      for (let i = 0; i < 5; i++) {
        await inputs.nth(i).fill(String(i + 1));
      }

      await expect(registerPage.activationCodeError).toBeVisible();
      await expect(registerPage.activationCodeError).toContainText(
        "Error with code. Please check.",
      );
    },
  );

  test(
    qase(14, "resend link shows success message"),
    async ({ registerPage }) => {
      await registerPage.activationResendLink.click();

      await expect(registerPage.activationResendSuccess).toBeVisible();
      await expect(registerPage.activationResendSuccess).toContainText(
        "A new verification code was sent.",
      );
    },
  );

  test(
    qase(15, "partial code entry does not trigger error prematurely"),
    async ({ registerPage }) => {
      const inputs = registerPage.activationCodeInputs;
      for (let i = 0; i < 3; i++) {
        await inputs.nth(i).fill(String(i + 1));
      }

      await expect(registerPage.activationCodeError).not.toBeVisible();
      await registerPage.verifyActivationPopupVisible();
    },
  );
});

// Update email popup

test.describe("Update email popup", () => {
  let originalEmail: string;

  test.beforeEach(async ({ registerPage }) => {
    originalEmail = uniqueEmail();
    await registerPage.goto();
    await registerPage.register(originalEmail, VALID_PASSWORD);
    await registerPage.verifyActivationPopupVisible();
    await registerPage.activationChangeEmailLink.click();
    await expect(registerPage.updateEmailPopupTitle).toBeVisible();
  });

  test(
    qase(16, "valid new email updates the verification screen"),
    async ({ registerPage }) => {
      const newEmail = uniqueEmail();

      await registerPage.updateEmailInput.fill(newEmail);
      await registerPage.updateEmailButton.click();

      await registerPage.verifyActivationPopupVisible();
      await expect(registerPage.activationEmailDisplay).toHaveText(newEmail);
    },
  );

  test(
    qase(17, "cancel keeps the original email unchanged"),
    async ({ registerPage }) => {
      await registerPage.updateEmailInput.fill(uniqueEmail());
      await registerPage.cancelEmailButton.click();

      await registerPage.verifyActivationPopupVisible();
      await expect(registerPage.activationEmailDisplay).toHaveText(
        originalEmail,
      );
    },
  );

  test(
    qase(18, 'invalid email shows "Invalid e-mail" error and icon'),
    async ({ registerPage }) => {
      await registerPage.updateEmailInput.fill("kokos");
      await registerPage.updateEmailButton.click();

      await expect(registerPage.updateEmailError).toHaveText("Invalid e-mail");
      await expect(registerPage.updateEmailErrorIcon).toBeVisible();
    },
  );

  test(
    qase(19, 'empty email shows "Required field" error and icon'),
    async ({ registerPage }) => {
      await registerPage.updateEmailButton.click();

      await expect(registerPage.updateEmailError).toHaveText("Required field");
      await expect(registerPage.updateEmailErrorIcon).toBeVisible();
    },
  );

  test(
    qase(20, "same email as original shows server error"),
    async ({ registerPage }) => {
      await registerPage.updateEmailInput.fill(originalEmail);
      await registerPage.updateEmailButton.click();

      await expect(registerPage.serverErrorBanner).toBeVisible();
      await expect(registerPage.serverErrorBanner).toContainText(
        "User with this email already exist",
      );
    },
  );

  test(
    qase(21, "already-registered email shows server error"),
    async ({ registerPage }) => {
      await registerPage.updateEmailInput.fill("test@test.com");
      await registerPage.updateEmailButton.click();

      await expect(registerPage.serverErrorBanner).toBeVisible();
      await expect(registerPage.serverErrorBanner).toContainText(
        "User with this email already exist",
      );
    },
  );
});
