import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';
  readonly items: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  async expectItems(names: string[]): Promise<void> {
    await expect(this.items).toHaveCount(names.length);
    for (const name of names) {
      await expect(this.items.filter({ hasText: name })).toBeVisible();
    }
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
