import { test } from '@fixtures';

// Login tests must start unauthenticated, so they opt out of the shared storageState.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test('valid user reaches the inventory @smoke', async ({ loginPage, inventoryPage, config }) => {
    await loginPage.goto();
    await loginPage.login(config.users.standard.username, config.users.standard.password);
    await inventoryPage.expectLoaded();
    await inventoryPage.expectOnPage();
  });

  test('locked-out user sees an error', async ({ loginPage, config }) => {
    await loginPage.goto();
    await loginPage.login(config.users.locked.username, config.users.locked.password);
    await loginPage.expectError('locked out');
  });

  test('wrong password sees an error', async ({ loginPage, config }) => {
    await loginPage.goto();
    await loginPage.login(config.users.standard.username, 'wrong');
    await loginPage.expectError('do not match');
  });
});
