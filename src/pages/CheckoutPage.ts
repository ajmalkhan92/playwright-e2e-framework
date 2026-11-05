import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly subtotal: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.subtotal = page.locator('[data-test="subtotal-label"]');
    this.confirmation = page.locator('[data-test="complete-header"]');
  }

  async fillInfo(info: { firstName: string; lastName: string; postalCode: string }): Promise<void> {
    await this.firstName.fill(info.firstName);
    await this.lastName.fill(info.lastName);
    await this.postalCode.fill(info.postalCode);
    await this.continueButton.click();
  }

  async expectSubtotal(amount: number): Promise<void> {
    await expect(this.subtotal).toContainText(`$${amount.toFixed(2)}`);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
    await expect(this.confirmation).toHaveText('Thank you for your order!');
  }
}
