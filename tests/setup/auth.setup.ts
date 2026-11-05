import { test as setup } from '@fixtures';
import { env } from '@config/env';

export const STORAGE_STATE = '.auth/standard-user.json';

// Logs in once through the UI and saves cookies/localStorage for every authenticated project.
setup('authenticate standard user', async ({ loginPage, inventoryPage, page }) => {
  await loginPage.goto();
  await loginPage.login(env.standardUser, env.password);
  await inventoryPage.expectLoaded();
  await page.context().storageState({ path: STORAGE_STATE });
});
