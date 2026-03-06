export function calculateTieredDiscount(quantity: number, unitPrice: number): number {
  if (quantity >= 10) {
    return unitPrice * quantity * 0.8;
  }
  if (quantity >= 5) {
    return unitPrice * quantity * 0.9;
  }
  return unitPrice * quantity;
}

export function calculateSavings(originalPrice: number, salePrice: number): number {
  return Math.max(0, originalPrice - salePrice);
}
