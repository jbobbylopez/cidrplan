import { parseCidr, splitCidr } from "../net/subnet.js";

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export function createStore() {
  const state = {
    baseCidr: "10.0.0.0/8",
    showDetails: false,
    outputMode: "json", // "json" | "html"
    rootId: null,
    nodes: {}, // id -> {id, cidr, name, parentId, children:[id,id] | null }
  };

  function initWithBase(cidr) {
    const parsed = parseCidr(cidr); // normalizes to network address
    state.baseCidr = parsed.cidr;
    state.nodes = {};
    const rootId = uid();
    state.rootId = rootId;
    state.nodes[rootId] = { id: rootId, cidr: parsed.cidr, name: "", parentId: null, children: null };
  }

  function getNode(id) {
    const n = state.nodes[id];
    if (!n) throw new Error(`Unknown node id: ${id}`);
    return n;
  }

  function leafIds() {
    const out = [];
    const walk = (id) => {
      const n = getNode(id);
      if (!n.children) out.push(id);
      else {
        walk(n.children[0]);
        walk(n.children[1]);
      }
    };
    walk(state.rootId);
    // sort by numeric network then prefix (stable)
    out.sort((a, b) => {
      const na = parseCidr(getNode(a).cidr);
      const nb = parseCidr(getNode(b).cidr);
      if (na.ipInt !== nb.ipInt) return na.ipInt - nb.ipInt;
      return na.prefix - nb.prefix;
    });
    return out;
  }

  function canJoin(id) {
    const n = getNode(id);
    if (!n.parentId) return false;
    const p = getNode(n.parentId);
    return Array.isArray(p.children) && p.children.length === 2;
  }

  function divide(id) {
    const n = getNode(id);
    if (n.children) return;
    const [a, b] = splitCidr(n.cidr);
    const leftId = uid();
    const rightId = uid();
    state.nodes[leftId] = { id: leftId, cidr: a, name: "", parentId: n.id, children: null };
    state.nodes[rightId] = { id: rightId, cidr: b, name: "", parentId: n.id, children: null };
    n.children = [leftId, rightId];
  }

  function join(id) {
    const n = getNode(id);
    if (!n.parentId) return;
    const p = getNode(n.parentId);
    if (!p.children) return;

    // remove both children
    const [c1, c2] = p.children;
    delete state.nodes[c1];
    delete state.nodes[c2];
    p.children = null;
  }

  function setName(id, name) {
    const n = getNode(id);
    n.name = String(name ?? "");
  }

  function setShowDetails(v) {
    state.showDetails = !!v;
  }

  function setOutputMode(mode) {
    state.outputMode = mode === "html" ? "html" : "json";
  }

  // init default
  initWithBase(state.baseCidr);

  return {
    state,
    initWithBase,
    leafIds,
    getNode,
    canJoin,
    divide,
    join,
    setName,
    setShowDetails,
    setOutputMode,
  };
}
