/**
 * Format a number with K/M notation for readability
 * Examples: 1234 -> "1.2K", 1234567 -> "1.2M", 100 -> "100"
 * @param {number} num - The number to format
 * @returns {string} Formatted number with K/M notation or plain number
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 10000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('en-US');
}
