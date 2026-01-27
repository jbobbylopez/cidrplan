import { describeCidr } from "../net/subnet.js";
import { escapeHtml } from "../utils/escape.js";
import { applyNameAffixes } from "../utils/naming.js";

export function toStaticHtmlTable(leafNodes, { showDetails, namePrefix = "", nameSuffix = "" } = {}) {
  const headers = [
    "Subnet",
    "Name",
    "Hosts (usable)",
    ...(showDetails ? ["Mask", "Broadcast", "Range"] : []),
  ];

  const thead = `<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>`;

  const tbodyRows = leafNodes.map(n => {
    const d = describeCidr(n.cidr);
    const displayName = applyNameAffixes(n.name, namePrefix, nameSuffix);
    const hostCell = `${d.total} (${d.usable})`;
    const cells = [
      `<td><span class="badge">${escapeHtml(d.cidr)}</span></td>`,
      `<td>${escapeHtml(displayName)}</td>`,
      `<td>${escapeHtml(hostCell)}</td>`,
    ];

    if (showDetails) {
      cells.push(
        `<td>${escapeHtml(`${d.mask} (/${d.prefix})`)}</td>`,
        `<td>${escapeHtml(d.broadcast)}</td>`,
        `<td>${escapeHtml(`${d.firstUsable} - ${d.lastUsable}`)}</td>`
      );
    }

    return `<tr>${cells.join("")}</tr>`;
  }).join("");

  return `<table>\n${thead}\n<tbody>\n${tbodyRows}\n</tbody>\n</table>`;
}
