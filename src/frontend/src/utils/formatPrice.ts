/**
 * Formats a rental price as "₹ [price] per month"
 * Returns null if price is null or undefined
 */
export function formatMonthlyPrice(
  price: bigint | null | undefined,
): string | null {
  if (price === null || price === undefined) {
    return null;
  }

  const numericPrice = Number(price);
  return `₹ ${numericPrice.toLocaleString()} per month`;
}
