import { describeCidr } from "../net/subnet.js";
import { escapeAttr } from "../utils/escape.js";
import { OUTPUT_HINTS } from "../config.js";

let tableListenerAttached = false;

export function renderApp(store, els) {
  const { state } = store;
  const leafIds = store.leafIds();
  const leafNodes = leafIds.map(id => store.getNode(id));

  // Table
  els.table.innerHTML = renderTableHtml(leafNodes, { showDetails: state.showDetails });
  
  // Render hierarchy visualization after DOM is ready
  renderHierarchyVisualization(els.table, leafNodes, store);

  // Attach event delegation listeners only once
  if (!tableListenerAttached) {
    attachTableListeners(store, els);
    tableListenerAttached = true;
  }

  // Output
  renderOutput(store, els);
}

function renderHierarchyVisualization(tableEl, leafNodes, store) {
  const rows = Array.from(tableEl.querySelectorAll('tbody tr'));
  if (rows.length === 0) return;
  
  // Build ancestry for each leaf node
  const ancestries = leafNodes.map(node => {
    const path = [];
    let current = node.id;
    while (current) {
      const n = store.getNode(current);
      const desc = describeCidr(n.cidr);
      path.unshift({ id: current, prefix: desc.prefix });
      current = n.parentId;
    }
    return path;
  });
  
  const maxLevels = Math.max(...ancestries.map(a => a.length));
  
  // Update hierarchy header colspan to match number of levels
  const hierarchyHeader = tableEl.querySelector('th.hierarchy-header');
  if (hierarchyHeader && maxLevels > 1) {
    hierarchyHeader.colSpan = maxLevels;
  }
  
  // Calculate which cells to render and their rowspans
  const cellSpans = {}; // key: "rowIdx-levelIdx", value: { rowspan, prefix }
  const skipRows = new Set(); // "rowIdx-levelIdx" entries to skip
  
  for (let levelIdx = 0; levelIdx < maxLevels; levelIdx++) {
    let rowIdx = 0;
    while (rowIdx < rows.length) {
      if (skipRows.has(`${rowIdx}-${levelIdx}`)) {
        rowIdx++;
        continue;
      }
      
      const ancestry = ancestries[rowIdx];
      if (!ancestry[levelIdx]) {
        rowIdx++;
        continue;
      }
      
      const ancestor = ancestry[levelIdx];
      let rowspan = 1;
      
      // Count consecutive rows with same ancestor
      for (let nextRow = rowIdx + 1; nextRow < rows.length; nextRow++) {
        if (ancestries[nextRow][levelIdx] && ancestries[nextRow][levelIdx].id === ancestor.id) {
          rowspan++;
        } else {
          break;
        }
      }
      
      cellSpans[`${rowIdx}-${levelIdx}`] = { rowspan, prefix: ancestor.prefix };
      
      // Mark rows to skip due to this rowspan
      for (let i = 1; i < rowspan; i++) {
        skipRows.add(`${rowIdx + i}-${levelIdx}`);
      }
      
      rowIdx += rowspan;
    }
  }
  
  // Build a map of ancestries for hover effects
  const ancestryMap = {}; // key: "rowIdx-levelIdx", value: array of ancestor prefixes
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    for (let levelIdx = 0; levelIdx < maxLevels; levelIdx++) {
      const key = `${rowIdx}-${levelIdx}`;
      const ancestors = [];
      // Collect all ancestors (parents) at higher levels
      for (let parentLevel = levelIdx + 1; parentLevel < maxLevels; parentLevel++) {
        const parentKey = `${rowIdx}-${parentLevel}`;
        if (cellSpans[parentKey]) {
          ancestors.push(cellSpans[parentKey].prefix);
        }
      }
      ancestryMap[key] = ancestors;
    }
  }
  
  // Add hierarchy cells to each row
  rows.forEach((row, rowIdx) => {
    const placeholder = row.querySelector('.hierarchy-placeholder');
    if (!placeholder) return;
    
    // Build list of cells to add for this row
    const cellsToAdd = [];
    for (let levelIdx = 0; levelIdx < maxLevels; levelIdx++) {
      const key = `${rowIdx}-${levelIdx}`;
      
      // Skip if covered by rowspan from above
      if (skipRows.has(key)) {
        continue;
      }
      
      const span = cellSpans[key];
      if (span) {
        cellsToAdd.push({ 
          rowspan: span.rowspan, 
          prefix: span.prefix,
          levelIdx,
          rowIdx 
        });
      }
    }
    
    // Replace placeholder with actual hierarchy cells
    cellsToAdd.forEach(({ rowspan, prefix, levelIdx, rowIdx }) => {
      const td = document.createElement('td');
      td.className = 'hierarchy-cell';
      td.setAttribute('data-prefix', prefix);
      td.setAttribute('data-level', levelIdx);
      td.setAttribute('data-row', rowIdx);
      td.setAttribute('data-rowspan', rowspan);
      
      if (rowspan > 1) {
        td.rowSpan = rowspan;
      }
      
      const span = document.createElement('span');
      span.className = 'hierarchy-text';
      span.textContent = `/${prefix}`;
      td.appendChild(span);
      
      placeholder.parentNode.insertBefore(td, placeholder);
    });
    
    // Remove the placeholder
    placeholder.remove();
  });
  
  // Add hover effects to hierarchy cells
  const hierarchyCells = tableEl.querySelectorAll('.hierarchy-cell');
  const tbody = tableEl.querySelector('tbody');
  
  // Helper function to highlight cell and its relations
  const highlightRelations = (cell) => {
    const prefix = cell.getAttribute('data-prefix');
    const level = parseInt(cell.getAttribute('data-level'));
    const rowspan = parseInt(cell.getAttribute('data-rowspan'));
    const startRow = parseInt(cell.getAttribute('data-row'));
    
    // Highlight this cell
    cell.classList.add('highlighted');
    
    // Highlight all ancestors (cells at higher levels covering same rows)
    hierarchyCells.forEach(otherCell => {
      const otherLevel = parseInt(otherCell.getAttribute('data-level'));
      const otherRow = parseInt(otherCell.getAttribute('data-row'));
      const otherRowspan = parseInt(otherCell.getAttribute('data-rowspan'));
      
      // Check if this cell is an ancestor (higher level) and covers any of our rows
      if (otherLevel > level && otherRow <= startRow && otherRow + otherRowspan > startRow) {
        otherCell.classList.add('highlighted');
      }
    });
    
    // Highlight all descendants (cells at lower levels within this span)
    hierarchyCells.forEach(otherCell => {
      const otherLevel = parseInt(otherCell.getAttribute('data-level'));
      const otherRow = parseInt(otherCell.getAttribute('data-row'));
      
      // Check if this cell is a descendant (lower level) and within our rowspan
      if (otherLevel < level && otherRow >= startRow && otherRow < startRow + rowspan) {
        otherCell.classList.add('highlighted');
      }
    });
  };
  
  // Helper function to clear all highlights
  const clearHighlights = () => {
    hierarchyCells.forEach(c => c.classList.remove('highlighted'));
  };
  
  // Add hover to cell elements
  hierarchyCells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      clearHighlights();
      highlightRelations(cell);
    });
    
    cell.addEventListener('mouseleave', clearHighlights);
  });
  
  // Add hover to table rows for cells covered by rowspans
  rows.forEach((row, rowIdx) => {
    row.addEventListener('mouseover', (e) => {
      // Only trigger if hovering over the hierarchy area
      if (!e.target.classList.contains('hierarchy-cell') && e.target.closest('.hierarchy-cell')) {
        const cell = e.target.closest('.hierarchy-cell');
        if (cell) {
          clearHighlights();
          highlightRelations(cell);
        }
        return;
      }
      
      // If there's no cell element in this row (due to rowspan), find which cell covers this row
      const cellsInRow = row.querySelectorAll('.hierarchy-cell');
      if (cellsInRow.length === 0) {
        // This row is covered by rowspans, find cells that span over it
        const coveringCells = [];
        hierarchyCells.forEach(cell => {
          const cellRow = parseInt(cell.getAttribute('data-row'));
          const cellRowspan = parseInt(cell.getAttribute('data-rowspan'));
          if (cellRow <= rowIdx && cellRow + cellRowspan > rowIdx) {
            coveringCells.push(cell);
          }
        });
        
        // Highlight the deepest level cell covering this row
        if (coveringCells.length > 0) {
          const deepestCell = coveringCells.reduce((deepest, current) => {
            const currentLevel = parseInt(current.getAttribute('data-level'));
            const deepestLevel = parseInt(deepest.getAttribute('data-level'));
            return currentLevel < deepestLevel ? current : deepest;
          });
          
          clearHighlights();
          highlightRelations(deepestCell);
        }
      }
    });
    
    row.addEventListener('mouseout', (e) => {
      // Only clear if moving completely outside the row
      if (!e.relatedTarget || !e.relatedTarget.closest('tr')) {
        clearHighlights();
      }
    });
  });
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
    `<th class="hierarchy-header">Hierarchy</th>`,
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
      <tr data-cidr="${d.cidr}">
        <td><span class="badge">${d.cidr}</span></td>
        <td>
          <input class="nameInput" data-name="${n.id}" type="text" value="${escapeAttr(n.name || "")}" placeholder="e.g., Users, DMZ..." />
        </td>
        <td>${hostsText}</td>
        ${detailCells}
        <td><button class="btn primary" data-divide="${n.id}" ${d.prefix === 32 ? "disabled" : ""}>Divide</button></td>
        <td><button class="btn" data-join="${n.id}" ${joinable ? "" : "disabled"}>Join</button></td>
        <td class="hierarchy-placeholder"></td>
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

  els.outputHint.textContent = OUTPUT_HINTS[store.state.outputMode] || OUTPUT_HINTS.json;

  // Actual output is set by main.js (to avoid circular imports between render and output modules)
  els.onNeedOutput(leafNodes);
}
