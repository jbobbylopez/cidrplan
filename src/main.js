import { createStore } from "./state/store.js";
import { renderApp } from "./ui/render.js";
import { toMinimalJson } from "./output/toJson.js";
import { toYaml } from "./output/toYaml.js";
import { toStaticHtmlTable } from "./output/toHtmlTable.js";
import { USE_ADSENSE, DEFAULT_CIDR } from "./config.js";

const store = createStore();

const els = {
   baseCidr: document.getElementById("baseCidr"),
   applyBase: document.getElementById("applyBase"),
   reset: document.getElementById("reset"),
   namePrefix: document.getElementById("namePrefix"),
   nameSuffix: document.getElementById("nameSuffix"),
   showDetails: document.getElementById("showDetails"),
   outputFormat: document.getElementById("outputFormat"),
   copyOutput: document.getElementById("copyOutput"),
   error: document.getElementById("error"),
   table: document.getElementById("subnetTable"),
   outputCode: document.getElementById("outputCode"),
   outputRendered: document.getElementById("outputRendered"),
   outputHint: document.getElementById("outputHint"),
  onNeedOutput: (leafNodes) => {
    let out;
    let isRenderedHtml = false;
    try {
      switch (store.state.outputMode) {
        case "json":
          out = toMinimalJson(leafNodes);
          break;
        case "yaml":
          out = toYaml(leafNodes);
          break;
        case "html":
          out = toStaticHtmlTable(leafNodes, { showDetails: store.state.showDetails });
          break;
        case "html-rendered":
          out = toStaticHtmlTable(leafNodes, { showDetails: store.state.showDetails });
          isRenderedHtml = true;
          break;
        default:
          out = "";
      }
      
      if (isRenderedHtml) {
        els.outputCode.parentElement.hidden = true;
        els.outputRendered.innerHTML = out;
        els.outputRendered.hidden = false;
      } else {
        els.outputRendered.hidden = true;
        els.outputCode.parentElement.hidden = false;
        els.outputCode.textContent = out;
      }
    } catch (e) {
      setError(`Error generating output: ${e.message || String(e)}`);
      els.outputCode.textContent = "";
    }
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
  els.namePrefix.value = store.state.namePrefix;
  els.nameSuffix.value = store.state.nameSuffix;
  els.showDetails.checked = store.state.showDetails;
  els.outputFormat.value = store.state.outputMode;
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
  store.initWithBase(DEFAULT_CIDR);
  renderApp(store, els);
  syncControlsFromState();
});

els.namePrefix.addEventListener("input", () => {
  store.setNamePrefix(els.namePrefix.value);
  renderApp(store, els);
});

els.nameSuffix.addEventListener("input", () => {
  store.setNameSuffix(els.nameSuffix.value);
  renderApp(store, els);
});

els.showDetails.addEventListener("change", () => {
  store.setShowDetails(els.showDetails.checked);
  renderApp(store, els);
});

els.outputFormat.addEventListener("change", () => {
   store.setOutputMode(els.outputFormat.value);
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

// Ad system initialization
function initializeAds() {
  const customAdEl = document.getElementById("customAd");
  const adsenseAdEl = document.getElementById("adsenseAd");
  
  if (USE_ADSENSE) {
    customAdEl.hidden = true;
    adsenseAdEl.hidden = false;
  } else {
    customAdEl.hidden = false;
    adsenseAdEl.hidden = true;
  }
}

// initial render
syncControlsFromState();
renderApp(store, els);
initializeAds();
