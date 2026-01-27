/**
 * Apply prefix and suffix to a subnet name
 * @param {string} name - Original subnet name
 * @param {string} prefix - Prefix to add (e.g., "PROD-")
 * @param {string} suffix - Suffix to add (e.g., "-VLAN")
 * @returns {string} Name with prefix and suffix applied
 */
export function applyNameAffixes(name, prefix = "", suffix = "") {
  if (!name) return "";
  return `${prefix}${name}${suffix}`;
}
