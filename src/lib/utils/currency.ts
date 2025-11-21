/**
 * Currency Formatting Utility
 *
 * Centralized currency formatting to prevent duplicated $$ bugs
 */

/**
 * Format a number as USD currency
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as USD currency without cents
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "$1,234")
 */
export function formatCurrencyWhole(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number as compact currency (e.g., "$1.2K", "$1.5M")
 * @param amount - The numeric amount to format
 * @returns Compact formatted currency string
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Parse a currency string to a number
 * @param currencyString - String like "$1,234.56" or "1234.56"
 * @returns Numeric value
 */
export function parseCurrency(currencyString: string): number {
  const cleaned = currencyString.replace(/[$,]/g, '');
  return parseFloat(cleaned) || 0;
}
