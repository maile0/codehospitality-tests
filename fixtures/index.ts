import { test as base, expect } from '@playwright/test';
import { RegisterPage } from '../Pages/RegisterPage';

type Fixtures = {
  registerPage: RegisterPage;
};

export const test = base.extend<Fixtures>({
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
});

export { expect };
