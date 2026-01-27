import { describeCidr } from "../net/subnet.js";

function escapeYamlString(s) {
  const str = String(s);
  if (/[:#\[\]\{\},&*!|>'"%@`]/.test(str) || str.includes('  ')) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

export function toYaml(leafNodes) {
  const lines = ["subnets:"];
  
  leafNodes.forEach(n => {
    const d = describeCidr(n.cidr);
    lines.push(`  - cidr: ${escapeYamlString(d.cidr)}`);
    lines.push(`    name: ${escapeYamlString(n.name || "")}`);
    lines.push(`    hosts:`);
    lines.push(`      total: ${d.total}`);
    lines.push(`      usable: ${d.usable}`);
  });
  
  return lines.join("\n");
}
