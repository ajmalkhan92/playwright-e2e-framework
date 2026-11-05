import { test } from '@fixtures';

test('user can complete a purchase @smoke', async ({ inventoryPage, cartPage, checkoutPage, testData: { products, customer } }) => {
  await inventoryPage.goto();
  await inventoryPage.addToCart(products.backpack.name);
  await inventoryPage.addToCart(products.bikeLight.name);
  await inventoryPage.openCart();
  await cartPage.checkout();
  await checkoutPage.fillInfo(customer);
  await checkoutPage.expectSubtotal(products.backpack.price + products.bikeLight.price);
  await checkoutPage.finish();
});
