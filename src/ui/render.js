import { describeCidr } from "../net/subnet.js";

export function renderApp(store, els) {
  const { state } = store;
  const leafIds = store.leafIds();
  const leafNodes = leafIds.map(id => store.getNode(id));

  // Table
  els.table.innerHTML = renderTableHtml(leafNodes, { showDetails: state.showDetails });

  // Wire events for table controls
  leafNodes.forEach(n => {
    const nameEl = els.table.querySelector(`[data-name="${n.id}"]`);
    nameEl.addEventListener("input", (e) => {
      store.setName(n.id, e.target.value);
      renderOutput(store, els);
    });

    const divideBtn = els.table.querySelector(`[data-divide="${n.id}"]`);
    divideBtn.addEventListener("click", () => {
      store.divide(n.id);
      renderApp(store, els);
    });

    const joinBtn = els.table.querySelector(`[data-join="${n.id}"]`);
    joinBtn.addEventListener("click", () => {
      store.join(n.id);
      renderApp(store, els);
    });
  });

  // Output
  renderOutput(store, els);
}

function renderTableHtml(leafNodes, { showDetails }) {
  const headCols = [
    `<th>Subnet</th>`,
    `<th>Subnet name</th>`,
    `<th>Hosts</th>`,
    ...(showDetails ? [`<th>Mask</th>`, `<th>Broadcast</th>`, `<th>Usable range</th>`] : []),
    `<th>Divide</th>`,
    `<th>Join</th>`,
  ].join("");

  const body = leafNodes.map(n => {
    const d = describeCidr(n.cidr);
    const hostsText = `${d.total} (${d.usable})`;

    const detailCells = showDetails
      ? `
        <td>${d.mask} <span class="muted">(/${d.prefix})</span></td>
        <td>${d.broadcast}</td>
        <td>${d.firstUsable} - ${d.lastUsable}</td>
      `
      : "";

    // Join enabled if node has parent and parent has two children (i.e., this leaf is joinable)
    const joinable = !!n.parentId;

    return `
      <tr>
        <td><span class="badge">${d.cidr}</span></td>
        <td>
          <input class="nameInput" data-name="${n.id}" type="text" value="${escapeAttr(n.name || "")}" placeholder="e.g., Users, DMZ..." />
        </td>
        <td>${hostsText}</td>
        ${detailCells}
        <td><button class="btn primary" data-divide="${n.id}" ${d.prefix === 32 ? "disabled" : ""}>Divide</button></td>
        <td><button class="btn" data-join="${n.id}" ${joinable ? "" : "disabled"}>Join</button></td>
      </tr>
    `;
  }).join("");

  return `
    <thead><tr>${headCols}</tr></thead>
    <tbody>${body}</tbody>
  `;
}

function escapeAttr(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderOutput(store, els) {
  const leafIds = store.leafIds();
  const leafNodes = leafIds.map(id => store.getNode(id));

  if (store.state.outputMode === "json") {
    els.outputHint.textContent = "JSON reflects leaf subnets only (current plan).";
  } else {
    els.outputHint.textContent = "HTML is a static table of leaf subnets only (current plan).";
  }

  // Actual output is set by main.js (to avoid circular imports between render and output modules)
  els.onNeedOutput(leafNodes);
}
