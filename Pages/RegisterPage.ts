import { expect, Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;

  // Form fields
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly registerButton: Locator;
  readonly passwordToggle: Locator;

  // Validation messages — one per field, in DOM order: email, password, terms
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly termsErrorText: Locator;
  readonly termsErrorIcon: Locator;

  // Server-level error banner (e.g. "User with this email already exist")
  readonly serverErrorBanner: Locator;

  // Activation code popup (Quasar dialog)
  readonly activationPopup: Locator;
  readonly activationPopupTitle: Locator;
  readonly activationCodeInputs: Locator;
  readonly activationSpamText: Locator;
  readonly activationResendLink: Locator;
  readonly activationChangeEmailLink: Locator;
  readonly activationEmailDisplay: Locator;
  readonly activationCodeError: Locator;
  readonly activationResendSuccess: Locator;
  readonly updateEmailPopupTitle: Locator;
  readonly updateEmailInput: Locator;
  readonly updateEmailButton: Locator;
  readonly cancelEmailButton: Locator;
  readonly updateEmailError: Locator;
  readonly updateEmailErrorIcon: Locator;

  // Progress bar steps
  readonly stepRegistration: Locator;
  readonly stepPersonalInfo: Locator;
  readonly stepPaymentDetails: Locator;
  readonly stepProofOfEmployment: Locator;

  // Navigation
  readonly joinHereLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.termsCheckbox = page.locator('.q-checkbox__inner').first();
    this.registerButton = page.locator('#signupStep1Next');
    this.passwordToggle = page.locator('#signupStep1ShowPassword');

    this.emailError = page.locator('.q-field__messages').nth(0);
    this.passwordError = page.locator('.q-field__messages').nth(1);
    this.termsErrorText = page.locator('.q-field:has(.q-checkbox) [role="alert"]');
    this.termsErrorIcon = page.locator('.q-field:has(.q-checkbox) .q-icon.text-negative');

    this.serverErrorBanner = page.locator('.q-banner.q-mb-md');

    this.activationPopup = page.locator('.q-dialog__inner:visible');
    this.activationPopupTitle = page.locator('.q-dialog__inner:visible .text-primary').filter({ hasText: 'Verification code sent' });
    this.activationCodeInputs = page.locator('.q-dialog__inner:visible input.verify_digit');
    this.activationSpamText = page.locator('.q-dialog__inner:visible').getByText('If there is nothing in your inbox, please check your Spam folder.');
    this.activationResendLink = page.locator('#verificationCodeResend');
    this.activationChangeEmailLink = page.locator('#verificationCodeChangeEmail');
    this.activationEmailDisplay = page.locator('.q-dialog__inner:visible .text-h5 strong');
    this.activationCodeError = page.locator('#verificationCodeForm').getByText('Error with code. Please check.');
    this.activationResendSuccess = page.locator('#verificationCodeForm .text-caption.text-positive');
    this.updateEmailPopupTitle = page.locator('#changeEmailForm').getByText('Update your email', { exact: true });
    this.updateEmailInput = page.locator('#changeEmailForm input[type="text"]');
    this.updateEmailButton = page.locator('#changeEmailForm').getByRole('button', { name: 'UPDATE' });
    this.cancelEmailButton = page.locator('#changeEmailCancel');
    this.updateEmailError = page.locator('#changeEmailForm [role="alert"]');
    this.updateEmailErrorIcon = page.locator('#changeEmailForm .q-icon.text-negative');

    this.stepRegistration = page.getByText('Registration', { exact: false });
    this.stepPersonalInfo = page.getByText('Personal Info', { exact: false });
    this.stepPaymentDetails = page.getByText('Payment Details', { exact: false });
    this.stepProofOfEmployment = page.getByText('Proof of Employment', { exact: false });

    this.joinHereLink = page.getByRole('link', { name: 'Join here' });
  }

  async goto() {
    await this.page.goto('/signup/1');
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async acceptTerms() {
    await this.termsCheckbox.click();
  }

  async clickRegister() {
    await this.registerButton.click();
  }

  async register(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.acceptTerms();
    await this.clickRegister();
  }

  async verifyActivationPopupVisible() {
    await expect(this.activationPopup).toBeVisible();
  }

  async verifyEmailErrorVisible(message: string) {
    await expect(this.emailError).toHaveText(message);
  }

  async verifyPasswordErrorVisible() {
    await expect(this.passwordError).not.toBeEmpty();
  }
}
