/**
 * IPv4 subnet utilities
 * Follows modern RFC 3021 behavior: /31 has 2 usable hosts, /32 has 1 usable host
 */

/**
 * Parse CIDR notation and normalize to network address
 * @param {string} cidr - CIDR notation (e.g., "10.0.0.0/24")
 * @returns {{cidr: string, ipInt: number, prefix: number}} Parsed CIDR data
 * @throws {Error} If CIDR format is invalid or prefix is out of range
 */
export function parseCidr(cidr) {
  const m = String(cidr).trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\s*\/\s*(\d{1,2})$/);
  if (!m) throw new Error("Invalid CIDR format. Example: 10.0.0.0/16");

  const ip = m[1];
  const prefix = Number(m[2]);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error("Prefix must be between 0 and 32.");
  }

  const ipInt = ipToInt(ip);
  const maskInt = prefixToMaskInt(prefix);
  const netInt = (ipInt & maskInt) >>> 0;

  return { cidr: `${intToIp(netInt)}/${prefix}`, ipInt: netInt, prefix };
}

/**
 * Convert IPv4 address string to 32-bit integer
 * @param {string} ip - IPv4 address (e.g., "10.0.0.0")
 * @returns {number} 32-bit unsigned integer representation
 * @throws {Error} If IP address is invalid
 */
export function ipToInt(ip) {
  const parts = ip.split(".").map(x => Number(x));
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
  // >>>0 to keep unsigned
  return (((parts[0] << 24) >>> 0) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * Convert 32-bit integer to IPv4 address string
 * @param {number} n - 32-bit unsigned integer
 * @returns {string} IPv4 address (e.g., "10.0.0.0")
 */
export function intToIp(n) {
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255
  ].join(".");
}

export function prefixToMaskInt(prefix) {
  if (prefix === 0) return 0 >>> 0;
  return (0xFFFFFFFF << (32 - prefix)) >>> 0;
}

export function maskIntToDotted(maskInt) {
  return intToIp(maskInt >>> 0);
}

export function blockSize(prefix) {
  return 2 ** (32 - prefix);
}

export function broadcastInt(netInt, prefix) {
  const size = blockSize(prefix);
  return (netInt + size - 1) >>> 0;
}

export function usableCount(prefix) {
  if (prefix === 32) return 1;
  if (prefix === 31) return 2;
  const total = blockSize(prefix);
  return Math.max(0, total - 2);
}

export function firstUsableInt(netInt, prefix) {
  if (prefix === 32) return netInt >>> 0;
  if (prefix === 31) return netInt >>> 0; // both usable
  return (netInt + 1) >>> 0;
}

export function lastUsableInt(netInt, prefix) {
  if (prefix === 32) return netInt >>> 0;
  if (prefix === 31) return (netInt + 1) >>> 0;
  return (broadcastInt(netInt, prefix) - 1) >>> 0;
}

/**
 * Get comprehensive details about a CIDR block
 * @param {string} cidr - CIDR notation (e.g., "10.0.0.0/24")
 * @returns {Object} Object with cidr, network, prefix, mask, total, usable, broadcast, firstUsable, lastUsable
 */
export function describeCidr(cidr) {
  const { ipInt: netInt, prefix } = parseCidr(cidr);
  const maskInt = prefixToMaskInt(prefix);
  const total = blockSize(prefix);
  const usable = usableCount(prefix);

  return {
    cidr: `${intToIp(netInt)}/${prefix}`,
    network: intToIp(netInt),
    prefix,
    mask: maskIntToDotted(maskInt),
    total,
    usable,
    broadcast: intToIp(broadcastInt(netInt, prefix)),
    firstUsable: intToIp(firstUsableInt(netInt, prefix)),
    lastUsable: intToIp(lastUsableInt(netInt, prefix))
  };
}

/**
 * Split a CIDR block into two equal subnets
 * @param {string} cidr - CIDR notation (e.g., "10.0.0.0/24")
 * @returns {[string, string]} Two CIDR strings with prefix+1
 * @throws {Error} If CIDR is /32 (cannot be divided further)
 */
export function splitCidr(cidr) {
  const { ipInt: netInt, prefix } = parseCidr(cidr);
  if (prefix >= 32) throw new Error("Cannot divide a /32.");
  const childPrefix = prefix + 1;
  const size = blockSize(childPrefix);

  const leftNet = netInt >>> 0;
  const rightNet = (netInt + size) >>> 0;

  return [`${intToIp(leftNet)}/${childPrefix}`, `${intToIp(rightNet)}/${childPrefix}`];
}
