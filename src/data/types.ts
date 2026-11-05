export interface Product { name: string; price: number }
export interface Customer { firstName: string; lastName: string; postalCode: string }
export interface TestData {
  products: Record<'backpack' | 'bikeLight', Product>;
  customer: Customer;
}
