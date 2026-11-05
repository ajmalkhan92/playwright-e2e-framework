import { test } from '@fixtures';
import { env } from '@config/env';

// Login tests must start unauthenticated, so they opt out of the shared storageState.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test('valid user reaches the inventory @smoke', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(env.standardUser, env.password);
    await inventoryPage.expectLoaded();
  });

  test('locked-out user sees an error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(env.lockedUser, env.password);
    await loginPage.expectError('locked out');
  });

  test('wrong password sees an error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(env.standardUser, 'wrong');
    await loginPage.expectError('do not match');
  });
});
