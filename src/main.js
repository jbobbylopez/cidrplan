import { createStore } from "./state/store.js";
import { renderApp } from "./ui/render.js";
import { toMinimalJson } from "./output/toJson.js";
import { toStaticHtmlTable } from "./output/toHtmlTable.js";

const store = createStore();

const els = {
  baseCidr: document.getElementById("baseCidr"),
  applyBase: document.getElementById("applyBase"),
  reset: document.getElementById("reset"),
  showDetails: document.getElementById("showDetails"),
  outputFormat: document.getElementById("outputFormat"),
  outputFormatLabel: document.getElementById("outputFormatLabel"),
  copyOutput: document.getElementById("copyOutput"),
  error: document.getElementById("error"),
  table: document.getElementById("subnetTable"),
  outputCode: document.getElementById("outputCode"),
  outputHint: document.getElementById("outputHint"),
  onNeedOutput: (leafNodes) => {
    const out = store.state.outputMode === "json"
      ? toMinimalJson(leafNodes)
      : toStaticHtmlTable(leafNodes, { showDetails: store.state.showDetails });

    els.outputCode.textContent = out;
  }
};

function setError(msg) {
  if (!msg) {
    els.error.hidden = true;
    els.error.textContent = "";
  } else {
    els.error.hidden = false;
    els.error.textContent = msg;
  }
}

function syncControlsFromState() {
  els.baseCidr.value = store.state.baseCidr;
  els.showDetails.checked = store.state.showDetails;
  els.outputFormat.checked = store.state.outputMode === "html";
  els.outputFormatLabel.textContent = `Output: ${store.state.outputMode.toUpperCase()}`;
}

els.applyBase.addEventListener("click", () => {
  try {
    setError("");
    store.initWithBase(els.baseCidr.value);
    renderApp(store, els);
  } catch (e) {
    setError(e.message || String(e));
  }
});

els.reset.addEventListener("click", () => {
  setError("");
  store.initWithBase("10.0.0.0/24");
  renderApp(store, els);
  syncControlsFromState();
});

els.showDetails.addEventListener("change", () => {
  store.setShowDetails(els.showDetails.checked);
  renderApp(store, els);
});

els.outputFormat.addEventListener("change", () => {
  store.setOutputMode(els.outputFormat.checked ? "html" : "json");
  syncControlsFromState();
  renderApp(store, els);
});

els.copyOutput.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.outputCode.textContent || "");
    // intentionally no toast; keep minimal UI
  } catch (e) {
    setError("Could not copy to clipboard. Your browser may block clipboard access on file:// URLs.");
  }
});

// initial render
syncControlsFromState();
renderApp(store, els);
