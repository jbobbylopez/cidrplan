import { describeCidr } from "../net/subnet.js";

export function toMinimalJson(leafNodes) {
  // Minimal: base fields only + name
  const rows = leafNodes.map(n => {
    const d = describeCidr(n.cidr);
    return {
      cidr: d.cidr,
      name: n.name || "",
      hosts: { total: d.total, usable: d.usable }
    };
  });
  return JSON.stringify(rows, null, 2);
}
