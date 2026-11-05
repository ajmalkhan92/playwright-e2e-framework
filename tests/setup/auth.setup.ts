import { test as setup } from '@fixtures';

export const STORAGE_STATE = '.auth/standard-user.json';

// Logs in once through the UI and saves cookies/localStorage for every authenticated project.
setup('authenticate standard user', async ({ loginPage, inventoryPage, page, config }) => {
  await loginPage.goto();
  await loginPage.login(config.users.standard.username, config.users.standard.password);
  await inventoryPage.expectLoaded();
  await page.context().storageState({ path: STORAGE_STATE });
});
