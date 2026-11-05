import { test } from '@fixtures';
import { products } from '@data/products';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('add and remove an item updates the badge @smoke', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.expectCartCount(1);
    await inventoryPage.removeFromCart(products.backpack.name);
    await inventoryPage.expectCartCount(0);
  });

  test('cart lists the added items', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.bikeLight.name);
    await inventoryPage.openCart();
    await cartPage.expectItems([products.backpack.name, products.bikeLight.name]);
  });
});
