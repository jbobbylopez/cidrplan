import { describeCidr } from "../net/subnet.js";

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function toStaticHtmlTable(leafNodes, { showDetails }) {
  const headers = [
    "Subnet",
    "Name",
    "Hosts (usable)",
    ...(showDetails ? ["Mask", "Broadcast", "Range"] : []),
  ];

  const thead = `<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>`;

  const tbodyRows = leafNodes.map(n => {
    const d = describeCidr(n.cidr);
    const hostCell = `${d.total} (${d.usable})`;
    const cells = [
      `<td><span class="badge">${escapeHtml(d.cidr)}</span></td>`,
      `<td>${escapeHtml(n.name || "")}</td>`,
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
