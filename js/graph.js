// ===================================================
// GRAPH: Node / Edge management
// ===================================================
function addNode(x, y, update=true) {
  const id = nodeCounter++;
  const label = String.fromCharCode(65 + (id % 26));
  nodes.push({ id, label, x, y, state: 'unvisited', dist: Infinity, prev: null });
  if (update) { updateNodeSelects(); draw(); }
  return id;
}

function addEdge(fromId, toId, weight=1, update=true) {
  if (!currentAlgo.supportsNeg && weight < 0) weight = Math.abs(weight);
  const id = edgeCounter++;
  edges.push({ id, from: fromId, to: toId, weight, state: 'default' });
  if (update) draw();
  return id;
}

function removeNode(nodeId) {
  nodes = nodes.filter(n => n.id !== nodeId);
  edges = edges.filter(e => e.from !== nodeId && e.to !== nodeId);
  updateNodeSelects();
  draw();
}

function removeEdge(edgeId) {
  edges = edges.filter(e => e.id !== edgeId);
  draw();
}

function updateNodeSelects() {
  const startSel = document.getElementById('start-node-select');
  const endSel = document.getElementById('end-node-select');
  const prevStart = startSel.value;
  const prevEnd = endSel.value;

  const opts = nodes.map(n => `<option value="${n.id}">${n.label}</option>`).join('');
  startSel.innerHTML = opts;
  endSel.innerHTML = opts;

  if (prevStart && nodes.find(n => n.id == prevStart)) startSel.value = prevStart;
  if (prevEnd && nodes.find(n => n.id == prevEnd)) endSel.value = prevEnd;
  else if (nodes.length > 1) endSel.value = nodes[nodes.length-1].id;
}

// ===================================================
// EXAMPLE GRAPHS
// ===================================================
function loadExample() {
  if (isPlaying) { isPlaying = false; clearInterval(playTimer); }
  const btnPlay = document.getElementById('btn-play');
  if (btnPlay) { btnPlay.textContent = '▶'; btnPlay.classList.remove('active'); }
  nodes = [];
  edges = [];
  nodeCounter = 0;
  edgeCounter = 0;
  simSteps = [];
  currentStep = -1;
  algorithmResult = [];

  const cx = W / 2, cy = H / 2;

  if (currentAlgo.id === 'dfs' || currentAlgo.id === 'bfs') {
    // Tree-like graph
    const positions = [
      [cx, cy - 130],
      [cx - 150, cy - 30],
      [cx + 150, cy - 30],
      [cx - 210, cy + 90],
      [cx - 80, cy + 90],
      [cx + 80, cy + 90],
      [cx + 210, cy + 90],
    ];
    positions.forEach(([x,y]) => addNode(x, y, false));
    [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,4]].forEach(([a,b]) => addEdge(a, b, 1, false));
  } else if (currentAlgo.id === 'dijkstra') {
    const positions = [
      [cx - 200, cy],
      [cx - 60, cy - 100],
      [cx + 80, cy - 100],
      [cx + 200, cy],
      [cx - 60, cy + 100],
      [cx + 80, cy + 100],
    ];
    positions.forEach(([x,y]) => addNode(x, y, false));
    [[0,1,4],[0,4,2],[1,2,3],[1,4,1],[2,3,6],[2,5,2],[3,5,3],[4,5,5],[4,2,7]].forEach(([a,b,w]) => addEdge(a, b, w, false));
  } else if (currentAlgo.id === 'bellman') {
    const positions = [
      [cx - 220, cy],
      [cx - 60, cy - 100],
      [cx + 80, cy - 100],
      [cx + 220, cy],
      [cx - 60, cy + 100],
    ];
    positions.forEach(([x,y]) => addNode(x, y, false));
    [[0,1,6],[0,4,7],[1,2,5],[1,3,4],[1,4,8],[2,1,-2],[3,2,-3],[4,3,9],[4,2,-4]].forEach(([a,b,w]) => addEdge(a, b, w, false));
  } else if (currentAlgo.id === 'prim') {
    const positions = [
      [cx, cy - 140],
      [cx - 160, cy - 50],
      [cx + 160, cy - 50],
      [cx - 200, cy + 90],
      [cx, cy + 90],
      [cx + 200, cy + 90],
    ];
    positions.forEach(([x,y]) => addNode(x, y, false));
    [[0,1,2],[0,2,3],[1,2,5],[1,3,1],[2,4,4],[2,5,6],[3,4,3],[4,5,2],[1,4,7],[0,4,8]].forEach(([a,b,w]) => addEdge(a, b, w, false));
  }

  updateNodeSelects();
  simSteps = [];
  currentStep = -1;
  updateUI();
  draw();
}

function clearGraph() {
  if (isPlaying) { isPlaying = false; clearInterval(playTimer); }
  const btnPlay = document.getElementById('btn-play');
  if (btnPlay) { btnPlay.textContent = '▶'; btnPlay.classList.remove('active'); }
  nodes = [];
  edges = [];
  nodeCounter = 0;
  edgeCounter = 0;
  simSteps = [];
  currentStep = -1;
  algorithmResult = [];
  updateNodeSelects();
  updateUI();
  draw();
  addLog('Đã xóa đồ thị.', 'info');
}
