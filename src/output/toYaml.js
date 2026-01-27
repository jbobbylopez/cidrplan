import { describeCidr } from "../net/subnet.js";
import { escapeYaml } from "../utils/escape.js";
import { applyNameAffixes } from "../utils/naming.js";

export function toYaml(leafNodes, { namePrefix = "", nameSuffix = "" } = {}) {
  const lines = ["subnets:"];

  leafNodes.forEach(n => {
    const d = describeCidr(n.cidr);
    const displayName = applyNameAffixes(n.name, namePrefix, nameSuffix);
    lines.push(`  - cidr: ${escapeYaml(d.cidr)}`);
    lines.push(`    name: ${escapeYaml(displayName)}`);
    lines.push(`    hosts:`);
    lines.push(`      total: ${d.total}`);
    lines.push(`      usable: ${d.usable}`);
  });

  return lines.join("\n");
}
