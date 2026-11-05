import { test as base, expect } from '@playwright/test';
import { config } from '@config/env';
import { readJson } from '@utils/jsonReader';
import type { AppConfig } from '@utils/configReader';
import type { TestData } from '@data/types';

type BaseFixtures = {
  /** Resolved app configuration. */
  config: AppConfig;
  /** Typed static test data from src/data/*.json. */
  testData: TestData;
  /** Auto fixture: attaches browser console errors/page errors to the report on failure. */
  consoleErrors: string[];
};

/** Framework-wide test: config, data and diagnostics. Page objects extend this in index.ts. */
export const baseTest = base.extend<BaseFixtures>({
  // eslint-disable-next-line no-empty-pattern
  config: async ({}, use) => use(config),
  // eslint-disable-next-line no-empty-pattern
  testData: async ({}, use) => use(readJson<TestData>('src/data/products.json')),
  consoleErrors: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      await use(errors);
      if (testInfo.status !== testInfo.expectedStatus && errors.length) {
        await testInfo.attach('browser-errors', { body: errors.join('\n'), contentType: 'text/plain' });
      }
    },
    { auto: true },
  ],
});

export { expect };
