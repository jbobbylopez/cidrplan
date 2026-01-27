/**
 * Escape HTML special characters
 * @param {string} s - String to escape
 * @returns {string} Escaped string safe for HTML content
 */
export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Escape attribute values for safe HTML attributes
 * @param {string} s - String to escape
 * @returns {string} Escaped string safe for HTML attributes
 */
export function escapeAttr(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Escape YAML string values
 * Quotes strings containing special characters per YAML spec
 * @param {string} s - String to escape
 * @returns {string} Escaped string safe for YAML values
 */
export function escapeYaml(s) {
  const str = String(s);
  // Quote if contains YAML special characters or multiple spaces
  if (/[:#\[\]\{\},&*!|>'"%@`]/.test(str) || str.includes("  ")) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}
