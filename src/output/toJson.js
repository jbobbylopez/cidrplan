import { describeCidr } from "../net/subnet.js";
import { applyNameAffixes } from "../utils/naming.js";

export function toMinimalJson(leafNodes, { namePrefix = "", nameSuffix = "" } = {}) {
  // Minimal: base fields only + name
  const rows = leafNodes.map(n => {
    const d = describeCidr(n.cidr);
    const displayName = applyNameAffixes(n.name, namePrefix, nameSuffix);
    return {
      cidr: d.cidr,
      name: displayName,
      hosts: { total: d.total, usable: d.usable }
    };
  });
  return JSON.stringify(rows, null, 2);
}
