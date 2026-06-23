export const VALID_PASSWORD = process.env.TEST_PASSWORD ?? 'Test@12345!';

export function uniqueEmail(): string {
  return `test+${Date.now()}@niki.com`;
}
