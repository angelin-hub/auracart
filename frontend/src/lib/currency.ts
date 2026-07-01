/**
 * Format a price (USD string or number) → Indian Rupee display
 * Conversion: 1 USD ≈ 83 INR
 */
const USD_TO_INR = 83;

export function toINR(usdPrice: string | number | undefined | null): string {
  if (!usdPrice) return "₹0";
  const usd = typeof usdPrice === "string" ? parseFloat(usdPrice) : usdPrice;
  if (isNaN(usd)) return "₹0";
  const inr = Math.round(usd * USD_TO_INR);
  return "₹" + inr.toLocaleString("en-IN");
}

export function toINRNumber(usdPrice: string | number | undefined | null): number {
  if (!usdPrice) return 0;
  const usd = typeof usdPrice === "string" ? parseFloat(usdPrice) : usdPrice;
  return Math.round(usd * USD_TO_INR);
}
