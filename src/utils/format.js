/**
 * Format a number with commas for thousands separators
 * @param {number} num - The number to format
 * @returns {string} Formatted number with commas
 */
export function formatNumber(num) {
  return num.toLocaleString('en-US');
}
