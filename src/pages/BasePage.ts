import { expect, type Locator, type Page } from '@playwright/test';

/** Behaviour shared by every page. Keep it small; page-specific logic belongs in subclasses. */
export abstract class BasePage {
  /** Relative path used by goto(); subclasses override. */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async pageTitle(): Promise<string> {
    return this.page.title();
  }

  async expectUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async expectOnPage(): Promise<void> {
    await this.expectUrl(new RegExp(`${this.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
  }

  /** Scoped locator helper for data-test hooks. */
  protected byTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }
}
