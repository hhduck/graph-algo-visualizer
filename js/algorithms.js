// ===================================================
// ALGORITHMS: DFS, BFS, Dijkstra, Bellman-Ford, Prim
// ===================================================

// --- Step snapshot helper ---
function snapshot(codeLine, log, logType = 'info', extras = {}) {
  const nodeStates = {};
  nodes.forEach(n => nodeStates[n.id] = { state: n.state, dist: n.dist !== undefined ? n.dist : Infinity, prev: n.prev !== undefined ? n.prev : null });
  const edgeStates = {};
  edges.forEach(e => edgeStates[e.id] = e.state);
  // Deep copy distances if provided in extras
  const safeExtras = {};
  for (const k in extras) {
    if (extras[k] !== null && typeof extras[k] === 'object' && !Array.isArray(extras[k])) {
      safeExtras[k] = { ...extras[k] };
    } else if (Array.isArray(extras[k])) {
      safeExtras[k] = [...extras[k]];
    } else {
      safeExtras[k] = extras[k];
    }
  }
  simSteps.push({ codeLine, log, logType, nodeStates, edgeStates, ...safeExtras });
}

// --- DFS ---
function generateDFS(startId) {
  const visited = new Set();
  const stack = [];
  const nodesCopy = JSON.parse(JSON.stringify(nodes));
  const edgesCopy = JSON.parse(JSON.stringify(edges));

  // Reset
  nodes.forEach(n => n.state = 'unvisited');
  edges.forEach(e => e.state = 'default');

  function restoreState(nStates, eStates) {
    nodes.forEach(n => { const s = nStates[n.id]; if (s) { n.state = s.state; } });
    edges.forEach(e => { const s = eStates[e.id]; if (s) { e.state = s; } });
  }

  // Simulate
  const stackArr = [startId];
  nodes.find(n => n.id === startId).state = 'active';
  snapshot(1, `Khởi tạo ngăn xếp với ${nodes.find(n => n.id === startId).label}`, 'info', { queue: [startId] });

  while (stackArr.length > 0) {
    const cur = stackArr[stackArr.length - 1];
    stackArr.pop();
    const curNode = nodes.find(n => n.id === cur);

    snapshot(5, `Lấy nút ${curNode.label} từ ngăn xếp`, 'info', { queue: [...stackArr] });

    if (visited.has(cur)) {
      snapshot(7, `${curNode.label} đã thăm — bỏ qua`, 'warning', { queue: [...stackArr] });
      continue;
    }

    visited.add(cur);
    curNode.state = 'active';
    snapshot(8, `Đánh dấu ${curNode.label} là đang xử lý`, 'info', { queue: [...stackArr] });

    curNode.state = 'visited';
    snapshot(8, `Hoàn thành thăm nút ${curNode.label}`, 'success', { queue: [...stackArr] });

    // Neighbors
    const neighbors = edges
      .filter(e => e.from === cur || (!isDirected && e.to === cur))
      .map(e => ({ id: e.from === cur ? e.to : e.from, edge: e }))
      .filter(({ id }) => !visited.has(id));

    for (const { id, edge } of neighbors) {
      const nb = nodes.find(n => n.id === id);
      edge.state = 'traversed';
      nb.state = 'active';
      stackArr.push(id);
      snapshot(11, `Thêm ${nb.label} vào ngăn xếp`, 'info', { queue: [...stackArr] });
      nb.state = 'unvisited';
    }
  }

  // Mark disconnected
  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      n.state = 'unvisited';
      snapshot(12, `Nút ${n.label} không thể đến được (đồ thị không liên thông)`, 'warning', { queue: [] });
    }
  });

  snapshot(12, 'DFS hoàn thành!', 'success', { queue: [] });
}

// --- BFS ---
function generateBFS(startId) {
  nodes.forEach(n => n.state = 'unvisited');
  edges.forEach(e => e.state = 'default');

  const visited = new Set([startId]);
  const queue = [startId];
  nodes.find(n => n.id === startId).state = 'active';
  snapshot(2, `Khởi tạo hàng đợi với ${nodes.find(n => n.id === startId).label}`, 'info', { queue: [...queue] });

  while (queue.length > 0) {
    const cur = queue.shift();
    const curNode = nodes.find(n => n.id === cur);
    curNode.state = 'active';
    snapshot(5, `Lấy ${curNode.label} từ hàng đợi`, 'info', { queue: [...queue] });

    curNode.state = 'visited';
    snapshot(6, `Xử lý nút ${curNode.label}`, 'success', { queue: [...queue] });

    const neighbors = edges
      .filter(e => e.from === cur || (!isDirected && e.to === cur))
      .map(e => ({ id: e.from === cur ? e.to : e.from, edge: e }))
      .filter(({ id }) => !visited.has(id));

    for (const { id, edge } of neighbors) {
      visited.add(id);
      const nb = nodes.find(n => n.id === id);
      edge.state = 'traversed';
      nb.state = 'active';
      queue.push(id);
      snapshot(10, `Đưa ${nb.label} vào hàng đợi`, 'info', { queue: [...queue] });
    }
  }

  snapshot(11, 'BFS hoàn thành!', 'success', { queue: [] });
}

// --- DIJKSTRA ---
function generateDijkstra(startId) {
  nodes.forEach(n => { n.state = 'unvisited'; n.dist = Infinity; n.prev = null; });
  edges.forEach(e => e.state = 'default');

  nodes.find(n => n.id === startId).dist = 0;
  snapshot(2, 'Khởi tạo khoảng cách: src=0, others=∞', 'info', { distances: getDistMap() });

  // Simple priority queue as sorted array
  const pq = [{ cost: 0, id: startId }];
  const visited = new Set();

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { cost, id: cur } = pq.shift();
    const curNode = nodes.find(n => n.id === cur);

    if (cost > curNode.dist) {
      snapshot(8, `Bỏ qua ${curNode.label} (đã có đường tốt hơn)`, 'warning', { distances: getDistMap() });
      continue;
    }

    if (visited.has(cur)) continue;
    visited.add(cur);

    curNode.state = 'active';
    snapshot(9, `Xét nút ${curNode.label} (dist=${curNode.dist})`, 'info', { distances: getDistMap() });

    // Neighbors
    edges.filter(e => e.from === cur || (!isDirected && e.to === cur))
      .forEach(e => {
        const nbId = e.from === cur ? e.to : e.from;
        const nb = nodes.find(n => n.id === nbId);
        if (visited.has(nbId)) return;
        const newDist = curNode.dist + e.weight;
        snapshot(10, `Xét cạnh ${curNode.label}→${nb.label} (w=${e.weight})`, 'info', { distances: getDistMap() });
        if (newDist < nb.dist) {
          nb.dist = newDist;
          nb.prev = cur;
          e.state = 'traversed';
          pq.push({ cost: newDist, id: nbId });
          snapshot(12, `Cập nhật dist[${nb.label}] = ${newDist}`, 'success', { distances: getDistMap() });
        }
      });

    curNode.state = 'visited';
  }

  // Highlight path if target selected
  highlightShortestPath(startId);
  snapshot(15, 'Dijkstra hoàn thành!', 'success', { distances: getDistMap() });
}

function getDistMap() {
  const m = {};
  nodes.forEach(n => m[n.id] = n.dist);
  return m;
}

function highlightShortestPath(startId) {
  const endSel = document.getElementById('end-node-select');
  if (!endSel || !currentAlgo.needsTarget) return;
  const endId = parseInt(endSel.value);
  if (isNaN(endId) || endId === startId) return;

  let cur = endId;
  const path = [];
  while (cur !== undefined && cur !== null) {
    path.unshift(cur);
    const n = nodes.find(nd => nd.id === cur);
    if (!n || n.prev === null || n.prev === undefined) break;
    cur = n.prev;
  }

  path.forEach(id => {
    const n = nodes.find(nd => nd.id === id);
    if (n) n.state = 'path';
  });

  for (let i = 0; i < path.length - 1; i++) {
    const e = edges.find(ed => (ed.from === path[i] && ed.to === path[i + 1]) || (!isDirected && ed.from === path[i + 1] && ed.to === path[i]));
    if (e) e.state = 'path';
  }
}

// --- BELLMAN-FORD ---
function generateBellman(startId) {
  nodes.forEach(n => { n.state = 'unvisited'; n.dist = Infinity; n.prev = null; });
  edges.forEach(e => e.state = e.weight < 0 ? 'negative' : 'default');

  nodes.find(n => n.id === startId).dist = 0;
  snapshot(2, 'Khởi tạo: src=0, others=∞', 'info', { distances: getDistMap() });

  const V = nodes.length;

  for (let i = 1; i <= V - 1; i++) {
    snapshot(3, `Vòng lặp thứ ${i}/${V - 1}`, 'info', { distances: getDistMap() });
    let changed = false;

    edges.forEach(e => {
      const u = nodes.find(n => n.id === e.from);
      const v = nodes.find(n => n.id === e.to);
      if (!u || !v || u.dist === Infinity) return;

      snapshot(4, `Xét cạnh ${u.label}→${v.label} (w=${e.weight})`, 'info', { distances: getDistMap() });

      if (u.dist + e.weight < v.dist) {
        v.dist = u.dist + e.weight;
        v.prev = u.id;
        v.state = 'active';
        u.state = 'visited';
        e.state = 'traversed';
        changed = true;
        snapshot(6, `Giảm dist[${v.label}] = ${v.dist}`, 'success', { distances: getDistMap() });
      }
    });

    if (!changed) {
      snapshot(3, `Vòng lặp ${i}: không có cập nhật — dừng sớm`, 'success', { distances: getDistMap() });
      break;
    }
  }

  // Check negative cycles
  let hasNegCycle = false;
  edges.forEach(e => {
    const u = nodes.find(n => n.id === e.from);
    const v = nodes.find(n => n.id === e.to);
    if (!u || !v || u.dist === Infinity) return;
    if (u.dist + e.weight < v.dist) {
      hasNegCycle = true;
      e.state = 'negative';
    }
  });

  if (hasNegCycle) {
    snapshot(10, '⚠ Phát hiện chu trình âm!', 'error', { distances: getDistMap() });
    showWarning('Phát hiện chu trình âm trong đồ thị!');
  } else {
    snapshot(11, 'Bellman-Ford hoàn thành!', 'success', { distances: getDistMap() });
  }
}

// --- PRIM ---
function generatePrim(startId) {
  nodes.forEach(n => { n.state = 'unvisited'; n.dist = Infinity; });
  edges.forEach(e => e.state = 'default');

  const inMST = new Set([startId]);
  nodes.find(n => n.id === startId).state = 'visited';
  const mstCost = { total: 0 };
  snapshot(1, `Bắt đầu MST từ ${nodes.find(n => n.id === startId).label}`, 'info', { mstEdges: [], mstCost: 0 });

  while (inMST.size < nodes.length) {
    let best = null;

    edges.forEach(e => {
      const fromIn = inMST.has(e.from);
      const toIn = inMST.has(e.to);
      if (fromIn === toIn) return; // both in or both out
      const outsideId = fromIn ? e.to : e.from;
      if (!best || e.weight < best.weight) {
        best = { ...e, outsideId };
      }
    });

    if (!best) {
      snapshot(7, 'Đồ thị không liên thông — không tìm được MST hoàn chỉnh', 'warning', {});
      break;
    }

    const nb = nodes.find(n => n.id === best.outsideId);
    nb.state = 'active';
    snapshot(4, `Xét thêm nút ${nb.label} với cạnh w=${best.weight}`, 'info', {});

    nb.state = 'visited';
    inMST.add(best.outsideId);
    const e = edges.find(ed => ed.id === best.id);
    if (e) e.state = 'path';
    mstCost.total += best.weight;

    snapshot(9, `Thêm cạnh vào MST (w=${best.weight}). Tổng=${mstCost.total}`, 'success', { mstCost: mstCost.total });
  }

  nodes.forEach(n => { if (n.state === 'visited') n.state = 'path'; });
  snapshot(11, `MST hoàn thành! Tổng trọng số: ${mstCost.total}`, 'success', { mstCost: mstCost.total });
}
