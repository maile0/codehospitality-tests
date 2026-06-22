import { expect, Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;

  // Form fields
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly registerButton: Locator;

  // Validation messages — one per field, in DOM order: email, password, terms
  readonly emailError: Locator;
  readonly passwordError: Locator;

  // Activation code popup (Quasar dialog)
  readonly activationPopup: Locator;

  // Navigation
  readonly joinHereLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.termsCheckbox = page.locator('.q-checkbox__inner').first();
    this.registerButton = page.locator('#signupStep1Next');

    this.emailError = page.locator('.q-field__messages').nth(0);
    this.passwordError = page.locator('.q-field__messages').nth(1);

    this.activationPopup = page.locator('.q-dialog__inner:visible');

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

  async verifyEmailErrorVisible() {
    await expect(this.emailError).not.toBeEmpty();
  }

  async verifyPasswordErrorVisible() {
    await expect(this.passwordError).not.toBeEmpty();
  }
}
