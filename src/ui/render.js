import { describeCidr } from "../net/subnet.js";
import { escapeAttr } from "../utils/escape.js";

let tableListenerAttached = false;

export function renderApp(store, els) {
  const { state } = store;
  const leafIds = store.leafIds();
  const leafNodes = leafIds.map(id => store.getNode(id));

  // Table
  els.table.innerHTML = renderTableHtml(leafNodes, { showDetails: state.showDetails });

  // Attach event delegation listeners only once
  if (!tableListenerAttached) {
    attachTableListeners(store, els);
    tableListenerAttached = true;
  }

  // Output
  renderOutput(store, els);
}

function attachTableListeners(store, els) {
  els.table.addEventListener("input", (e) => {
    if (e.target.matches("[data-name]")) {
      const nodeId = e.target.getAttribute("data-name");
      store.setName(nodeId, e.target.value);
      renderOutput(store, els);
    }
  });

  els.table.addEventListener("click", (e) => {
    const divideBtn = e.target.closest("[data-divide]");
    if (divideBtn) {
      const nodeId = divideBtn.getAttribute("data-divide");
      store.divide(nodeId);
      renderApp(store, els);
      return;
    }

    const joinBtn = e.target.closest("[data-join]");
    if (joinBtn) {
      const nodeId = joinBtn.getAttribute("data-join");
      store.join(nodeId);
      renderApp(store, els);
    }
  });
}

function renderTableHtml(leafNodes, { showDetails }) {
  const headCols = [
    `<th>Subnet</th>`,
    `<th>Subnet name</th>`,
    `<th>Hosts (usable)</th>`,
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



export function renderOutput(store, els) {
   const leafIds = store.leafIds();
   const leafNodes = leafIds.map(id => store.getNode(id));

   const hints = {
     json: "JSON reflects data in above table (realtime)",
     yaml: "YAML reflects data in above table (realtime)",
     html: "HTML is a static table of leaf subnets only (realtime)"
   };

   els.outputHint.textContent = hints[store.state.outputMode] || hints.json;

   // Actual output is set by main.js (to avoid circular imports between render and output modules)
   els.onNeedOutput(leafNodes);
 }
