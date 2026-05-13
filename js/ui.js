// ===================================================
// UI: Interactions, Playback, Keyboard, Modal, Tabs
// ===================================================

// ===================================================
// CANVAS INTERACTION
// ===================================================
function getNodeAt(x, y) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    const dx = x - n.x, dy = y - n.y;
    if (Math.sqrt(dx * dx + dy * dy) <= NODE_R) return n;
  }
  return null;
}

function getEdgeAt(x, y) {
  for (const e of edges) {
    const from = nodes.find(n => n.id === e.from);
    const to = nodes.find(n => n.id === e.to);
    if (!from || !to) continue;
    const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
    const dx = x - mx, dy = y - my;
    if (Math.sqrt(dx * dx + dy * dy) < 20) return e;
  }
  return null;
}

function onMouseDown(e) {
  if (e.button !== 0) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const node = getNodeAt(x, y);

  if (mode === 'select' && node) {
    isDragging = true;
    dragNode = node;
    dragOffX = x - node.x;
    dragOffY = y - node.y;
    canvas.style.cursor = 'grabbing';
  }
  if (mode === 'addEdge' && node) {
    edgeStart = node;
    node.connecting = true;
    draw();
  }
}

function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;

  if (isDragging && dragNode) {
    dragNode.x = x - dragOffX;
    dragNode.y = y - dragOffY;
    draw();
    return;
  }

  // Tooltip on hover
  const node = getNodeAt(x, y);
  const tooltip = document.getElementById('tooltip');
  if (node && simSteps.length > 0 && currentStep >= 0) {
    let info = `${node.label}`;
    const step = simSteps[currentStep];
    if (step.distances && step.distances[node.id] !== undefined) {
      const d = step.distances[node.id];
      info += ` — dist: ${d === Infinity ? '∞' : d}`;
    }
    tooltip.textContent = info;
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY - 20) + 'px';
    tooltip.classList.add('show');
  } else {
    tooltip.classList.remove('show');
  }

  if (mode === 'addEdge' && edgeStart) {
    draw();
    // Draw temp edge
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(edgeStart.x, edgeStart.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
  }

  // Cursor
  if (mode === 'select') {
    canvas.style.cursor = getNodeAt(x, y) ? 'grab' : 'default';
  } else if (mode === 'delete') {
    canvas.style.cursor = (getNodeAt(x, y) || getEdgeAt(x, y)) ? 'pointer' : 'not-allowed';
  } else if (mode === 'addNode') {
    canvas.style.cursor = 'crosshair';
  } else if (mode === 'addEdge') {
    canvas.style.cursor = getNodeAt(x, y) ? 'pointer' : 'crosshair';
  }
}

function onMouseUp(e) {
  if (isDragging) {
    isDragging = false;
    dragNode = null;
    canvas.style.cursor = 'grab';
    simSteps = [];
    currentStep = -1;
    updateUI();
  }
}

function onCanvasClick(e) {
  if (isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const node = getNodeAt(x, y);
  const edge = getEdgeAt(x, y);

  if (mode === 'addNode' && !node) {
    addNode(x, y);
    simSteps = [];
    currentStep = -1;
    updateUI();
  } else if (mode === 'addEdge') {
    if (node && edgeStart) {
      if (node.id !== edgeStart.id) {
        // Check duplicate
        const existing = edges.find(ed =>
          (ed.from === edgeStart.id && ed.to === node.id) ||
          (!isDirected && ed.from === node.id && ed.to === edgeStart.id)
        );
        if (!existing) {
          pendingEdge = { from: edgeStart.id, to: node.id };
          openWeightModal();
        }
      }
      edgeStart.connecting = false;
      edgeStart = null;
      draw();
    } else if (node) {
      edgeStart = node;
      node.connecting = true;
      draw();
    } else {
      if (edgeStart) { edgeStart.connecting = false; edgeStart = null; draw(); }
    }
  } else if (mode === 'delete') {
    if (node) { removeNode(node.id); simSteps = []; currentStep = -1; updateUI(); }
    else if (edge) { removeEdge(edge.id); simSteps = []; currentStep = -1; updateUI(); }
  }
}

function onDblClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const edge = getEdgeAt(x, y);
  if (edge) {
    pendingEdge = { editId: edge.id, from: edge.from, to: edge.to };
    document.getElementById('weight-input').value = edge.weight;
    openWeightModal();
  }
}

function onRightClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const node = getNodeAt(x, y);
  if (node && mode === 'select') {
    removeNode(node.id);
    simSteps = [];
    currentStep = -1;
    updateUI();
  }
}

// ===================================================
// WEIGHT MODAL
// ===================================================
function openWeightModal() {
  const modal = document.getElementById('weight-modal');
  modal.classList.add('show');
  const inp = document.getElementById('weight-input');
  if (!pendingEdge.editId) inp.value = 1;
  inp.focus();
  inp.select();

  const warn = document.getElementById('modal-warning');
  if (!currentAlgo.supportsNeg) {
    warn.style.display = 'block';
    inp.min = 1;
  } else {
    warn.style.display = 'none';
    inp.min = -99;
  }
}

function confirmEdge() {
  const w = parseInt(document.getElementById('weight-input').value) || 1;
  const validW = (!currentAlgo.supportsNeg && w < 0) ? Math.abs(w) : w;

  document.getElementById('weight-modal').classList.remove('show');

  if (pendingEdge.editId !== undefined) {
    const e = edges.find(ed => ed.id === pendingEdge.editId);
    if (e) { e.weight = validW; simSteps = []; currentStep = -1; updateUI(); draw(); }
  } else if (pendingEdge) {
    addEdge(pendingEdge.from, pendingEdge.to, validW);
    simSteps = [];
    currentStep = -1;
    updateUI();
  }
  pendingEdge = null;
}

function cancelEdge() {
  document.getElementById('weight-modal').classList.remove('show');
  pendingEdge = null;
}

// ===================================================
// PSEUDOCODE
// ===================================================
function setupPseudocode() {
  const lines = PSEUDOCODES[currentAlgo.id] || [];
  const block = document.getElementById('pseudocode');
  block.innerHTML = lines.map((line, i) =>
    `<span class="code-line" id="code-line-${i}">${line}</span>`
  ).join('\n');
}

function highlightCodeLine(lineIdx) {
  document.querySelectorAll('.code-line').forEach((el, i) => {
    el.classList.remove('active');
    if (i < lineIdx) el.classList.add('executed');
    else el.classList.remove('executed');
  });
  if (lineIdx >= 0) {
    const el = document.getElementById(`code-line-${lineIdx}`);
    if (el) {
      el.classList.add('active');
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
}

// ===================================================
// RUN ALGORITHM
// ===================================================
function runAlgorithm() {
  if (nodes.length === 0) { showWarning('Vui lòng thêm nút vào đồ thị!'); return; }

  // Reset states
  nodes.forEach(n => { n.state = 'unvisited'; n.dist = Infinity; n.prev = null; });
  edges.forEach(e => { e.state = e.weight < 0 ? 'negative' : 'default'; });

  const startId = parseInt(document.getElementById('start-node-select').value);
  simSteps = [];
  currentStep = -1;
  algorithmResult = [];
  document.getElementById('step-log').innerHTML = '';

  if (isPlaying) { clearInterval(playTimer); isPlaying = false; }

  switch (currentAlgo.id) {
    case 'dfs': generateDFS(startId); break;
    case 'bfs': generateBFS(startId); break;
    case 'dijkstra': generateDijkstra(startId); break;
    case 'bellman': generateBellman(startId); break;
    case 'prim': generatePrim(startId); break;
  }

  if (simSteps.length > 0) {
    addLog(`Bắt đầu ${currentAlgo.name} từ nút ${nodes.find(n => n.id === startId)?.label}`, 'info');

    currentStep = 0;
    applyStep(currentStep);
    updateUI();

    // Luôn tự động phát từ đầu khi bấm "Chạy lại"
    isPlaying = true;
    const btn = document.getElementById('btn-play');
    btn.textContent = '⏸';
    btn.classList.add('active');
    const spd = document.getElementById('speed-slider').value;
    playTimer = setInterval(() => {
      if (currentStep >= simSteps.length - 1) {
        isPlaying = false;
        clearInterval(playTimer);
        btn.textContent = '▶';
        btn.classList.remove('active');
        return;
      }
      currentStep++;
      applyStep(currentStep);
      updateUI();
    }, SPEEDS[spd]);
  }
}

// ===================================================
// APPLY STEP
// ===================================================
function applyStep(idx) {
  if (idx < 0 || idx >= simSteps.length) return;
  const step = simSteps[idx];

  nodes.forEach(n => {
    const s = step.nodeStates[n.id];
    if (s) { n.state = s.state; n.dist = s.dist; n.prev = s.prev; }
  });
  edges.forEach(e => {
    const s = step.edgeStates[e.id];
    if (s) e.state = s;
  });

  if (idx === simSteps.length - 1 && (currentAlgo.id === 'dfs' || currentAlgo.id === 'bfs')) {
    algorithmResult = [];
    let visitedSet = new Set();
    for (let i = 0; i <= idx; i++) {
      const state = simSteps[i].nodeStates;
      for (const n of nodes) {
        if (state[n.id] && state[n.id].state === 'visited' && !visitedSet.has(n.id)) {
          visitedSet.add(n.id);
          algorithmResult.push(n.label);
        }
      }
    }
  } else if (idx < simSteps.length - 1) {
    algorithmResult = [];
  }

  highlightCodeLine(step.codeLine);
  updateDataInspector(step);
  if (step.log) addLog(step.log, step.logType || 'info');
  draw();
}

// ===================================================
// DATA INSPECTOR
// ===================================================
function renderAlgorithmResultPanel(resultData) {
  const content = (resultData && resultData.length > 0)
    ? `<div style="font-family:'JetBrains Mono',monospace;font-size:0.85rem;color:var(--accent);font-weight:600;word-break:break-all;line-height:1.5;">${resultData.join(' &rarr; ')}</div>`
    : `<span style="color:var(--text-muted);font-size:0.75rem">Chưa có kết quả</span>`;

  return `
    <div class="inspector-section">
      <div class="inspector-title">KẾT QUẢ THUẬT TOÁN</div>
      <div class="inspector-body">
        ${content}
      </div>
    </div>`;
}

function updateDataInspector(step) {
  const inspector = document.getElementById('data-inspector');
  let html = '';

  if (currentAlgo.id === 'dfs' || currentAlgo.id === 'bfs') {
    html += renderAlgorithmResultPanel(algorithmResult);
  }

  // Queue/Stack
  if (step.queue !== undefined) {
    const label = currentAlgo.id === 'dfs' ? 'Ngăn xếp (Stack)' : 'Hàng đợi (Queue)';
    const color = currentAlgo.color;
    const items = step.queue.map(id => {
      const n = nodes.find(nd => nd.id === id);
      return `<div class="queue-item" style="background:${currentAlgo.bg};color:${color};border-color:${color}50">${n?.label || id}</div>`;
    }).join('');
    html += `
      <div class="inspector-section">
        <div class="inspector-title">${label}</div>
        <div class="inspector-body">
          <div class="queue-visual">${items || '<span style="color:var(--text-muted);font-size:0.75rem">Trống</span>'}</div>
        </div>
      </div>`;
  }

  // Distances
  if (step.distances) {
    const rows = nodes.map(n => {
      const d = step.distances[n.id];
      const cls = d === Infinity ? 'dist-inf' : (n.state === 'path' ? 'dist-path' : (n.state === 'active' ? 'dist-active' : ''));
      const highlight = n.state === 'active' ? ' class="highlighted"' : '';
      return `<tr${highlight}>
        <td>${n.label}</td>
        <td class="${cls}">${d === Infinity ? '∞' : d}</td>
        <td>${n.prev !== null && n.prev !== undefined ? nodes.find(nd => nd.id === n.prev)?.label || '-' : '-'}</td>
      </tr>`;
    }).join('');
    html += `
      <div class="inspector-section">
        <div class="inspector-title">Bảng khoảng cách</div>
        <div class="inspector-body">
          <table class="dist-table">
            <thead><tr><th>Nút</th><th>Dist</th><th>Prev</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }

  // MST cost
  if (step.mstCost !== undefined) {
    html += `
      <div class="inspector-section">
        <div class="inspector-title">MST</div>
        <div class="inspector-body">
          <div style="font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:var(--node-path)">
            Tổng trọng số: <strong>${step.mstCost}</strong>
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">
            ${nodes.filter(n => n.state === 'path' || n.state === 'visited').length} / ${nodes.length} nút trong MST
          </div>
        </div>
      </div>`;
  }

  // Node states summary
  const unvisited = nodes.filter(n => n.state === 'unvisited').length;
  const active = nodes.filter(n => n.state === 'active').length;
  const visited = nodes.filter(n => n.state === 'visited').length;
  const pathN = nodes.filter(n => n.state === 'path').length;
  html += `
    <div class="inspector-section">
      <div class="inspector-title">Trạng thái nút</div>
      <div class="inspector-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div style="font-size:0.72rem;color:var(--text-dim)">⬜ Chưa thăm: <strong>${unvisited}</strong></div>
          <div style="font-size:0.72rem;color:#F59E0B">🟡 Đang xử lý: <strong>${active}</strong></div>
          <div style="font-size:0.72rem;color:#3B82F6">🔵 Đã thăm: <strong>${visited}</strong></div>
          <div style="font-size:0.72rem;color:#10B981">🟢 Kết quả: <strong>${pathN}</strong></div>
        </div>
      </div>
    </div>`;

  inspector.innerHTML = html;
}

// ===================================================
// PLAYBACK
// ===================================================
function togglePlay() {
  if (simSteps.length === 0) {
    runAlgorithm();
    // runAlgorithm() đã auto-play rồi, không cần toggle thêm
    return;
  }

  // Nếu đang ở bước cuối, quay lại đầu để phát lại
  if (!isPlaying && currentStep >= simSteps.length - 1) {
    currentStep = 0;
    applyStep(0);
    updateUI();
  }

  isPlaying = !isPlaying; 
  const btn = document.getElementById('btn-play');
  if (isPlaying) {
    btn.textContent = '⏸';
    btn.classList.add('active');
    const spd = document.getElementById('speed-slider').value;
    playTimer = setInterval(() => {
      if (currentStep >= simSteps.length - 1) {
        isPlaying = false;
        clearInterval(playTimer);
        btn.textContent = '▶';
        btn.classList.remove('active');
        return;
      }
      currentStep++;
      applyStep(currentStep);
      updateUI();
    }, SPEEDS[spd]);
  } else {
    btn.textContent = '▶';
    btn.classList.remove('active');
    clearInterval(playTimer);
  }
}

function stepForward() {
  if (simSteps.length === 0) {
    // Generate steps nhưng không auto-play, chỉ hiện bước đầu
    if (nodes.length === 0) { showWarning('Vui lòng thêm nút vào đồ thị!'); return; }
    nodes.forEach(n => { n.state = 'unvisited'; n.dist = Infinity; n.prev = null; });
    edges.forEach(e => { e.state = e.weight < 0 ? 'negative' : 'default'; });
    const startId = parseInt(document.getElementById('start-node-select').value);
    simSteps = [];
    currentStep = -1;
    document.getElementById('step-log').innerHTML = '';
    switch (currentAlgo.id) {
      case 'dfs': generateDFS(startId); break;
      case 'bfs': generateBFS(startId); break;
      case 'dijkstra': generateDijkstra(startId); break;
      case 'bellman': generateBellman(startId); break;
      case 'prim': generatePrim(startId); break;
    }
    if (simSteps.length > 0) {
      addLog(`Bắt đầu ${currentAlgo.name} từ nút ${nodes.find(n => n.id === startId)?.label}`, 'info');
      currentStep = 0;
      applyStep(currentStep);
      updateUI();
    }
    return;
  }
  if (currentStep < simSteps.length - 1) {
    currentStep++;
    applyStep(currentStep);
    updateUI();
  }
}

function stepBackward() {
  if (currentStep > 0) {
    currentStep--;
    applyStep(currentStep);
    updateUI();
  }
}

// ===================================================
// UI HELPERS
// ===================================================
function updateUI() {
  const total = simSteps.length;
  const cur = total > 0 ? currentStep + 1 : 0;
  document.getElementById('step-info').textContent = `Bước ${cur} / ${total}`;
}

function setMode(m) {
  mode = m;
  ['select', 'add-node', 'add-edge', 'delete'].forEach(id => {
    const el = document.getElementById('btn-' + id);
    if (el) el.classList.remove('active');
  });
  const map = { select: 'btn-select', addNode: 'btn-add-node', addEdge: 'btn-add-edge', delete: 'btn-delete' };
  const el = document.getElementById(map[m]);
  if (el) el.classList.add('active');

  if (m !== 'addEdge' && edgeStart) { edgeStart.connecting = false; edgeStart = null; draw(); }

  const cursors = { select: 'default', addNode: 'crosshair', addEdge: 'crosshair', delete: 'not-allowed' };
  canvas.style.cursor = cursors[m] || 'default';
}

function toggleDirected() {
  isDirected = !isDirected;
  updateDirectedBtn();
  simSteps = [];
  currentStep = -1;
  updateUI();
  draw();
}

function updateDirectedBtn() {
  document.getElementById('directed-label').textContent = isDirected ? 'Có hướng' : 'Vô hướng';
  document.getElementById('btn-directed').classList.toggle('active', isDirected);
}

function switchTab(tab) {
  ['code', 'data', 'log'].forEach(t => {
    document.getElementById('panel-' + t).style.display = t === tab ? 'block' : 'none';
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
  });
}

function addLog(msg, type = 'info') {
  const log = document.getElementById('step-log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  entry.textContent = `[${time}] ${msg}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function showWarning(msg) {
  const banner = document.getElementById('warning-banner');
  document.getElementById('warning-text').textContent = msg;
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 4000);
}

function onStartNodeChange() {
  simSteps = [];
  currentStep = -1;
  nodes.forEach(n => { n.state = 'unvisited'; n.dist = Infinity; n.prev = null; });
  edges.forEach(e => e.state = e.weight < 0 ? 'negative' : 'default');
  updateUI();
  draw();
}

function onEndNodeChange() {
  simSteps = [];
  currentStep = -1;
  updateUI();
}

// ===================================================
// KEYBOARD
// ===================================================
function onKeyDown(e) {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

  if (e.key === 'ArrowRight' || e.key === 'l') { e.preventDefault(); stepForward(); }
  else if (e.key === 'ArrowLeft' || e.key === 'h') { e.preventDefault(); stepBackward(); }
  else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  else if (e.key === 'n' || e.key === 'N') setMode('addNode');
  else if (e.key === 'e' || e.key === 'E') setMode('addEdge');
  else if (e.key === 's' || e.key === 'S') setMode('select');
  else if (e.key === 'd' || e.key === 'D') setMode('delete');
  else if (e.key === 'Escape') {
    setMode('select');
    document.getElementById('weight-modal').classList.remove('show');
  }
}
