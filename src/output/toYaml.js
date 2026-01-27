import { describeCidr } from "../net/subnet.js";
import { escapeYaml } from "../utils/escape.js";

export function toYaml(leafNodes) {
  const lines = ["subnets:"];

  leafNodes.forEach(n => {
    const d = describeCidr(n.cidr);
    lines.push(`  - cidr: ${escapeYaml(d.cidr)}`);
    lines.push(`    name: ${escapeYaml(n.name || "")}`);
    lines.push(`    hosts:`);
    lines.push(`      total: ${d.total}`);
    lines.push(`      usable: ${d.usable}`);
  });

  return lines.join("\n");
}
