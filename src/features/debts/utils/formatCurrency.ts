/**
 * Formats a number as Indian Rupee currency
 * @param amount - The amount to format
 * @returns Formatted currency string with ₹ symbol
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
