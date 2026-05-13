// ===================================================
// CANVAS: Drawing functions
// ===================================================

// Helper to read a CSS variable from :root / [data-theme]
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function draw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);

  // Draw grid dots
  ctx.fillStyle = getCSSVar('--canvas-dot') || 'rgba(255,255,255,0.03)';
  for (let x = 40; x < W; x += 40)
    for (let y = 40; y < H; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI*2);
      ctx.fill();
    }

  // Draw edges
  edges.forEach(e => drawEdge(e));

  // Draw nodes
  nodes.forEach(n => drawNode(n));
}

function getEdgeColor(state) {
  if (state === 'traversed') return getCSSVar('--edge-traversed');
  if (state === 'path') return getCSSVar('--edge-path');
  if (state === 'negative') return getCSSVar('--neg-weight');
  return getCSSVar('--edge-default');
}

function drawEdge(e) {
  const from = nodes.find(n => n.id === e.from);
  const to = nodes.find(n => n.id === e.to);
  if (!from || !to) return;

  const color = getEdgeColor(e.state);
  const lineW = (e.state === 'path') ? 3 : (e.state === 'traversed') ? 2 : 1.5;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineW;

  const dx = to.x - from.x, dy = to.y - from.y;
  const dist = Math.sqrt(dx*dx+dy*dy);
  if (dist === 0) { ctx.restore(); return; }

  const nx = dx/dist, ny = dy/dist;
  const startX = from.x + nx * NODE_R;
  const startY = from.y + ny * NODE_R;
  const endX = to.x - nx * NODE_R;
  const endY = to.y - ny * NODE_R;

  // Check if there's a reverse edge (for curved lines)
  const hasReverse = isDirected && edges.find(ed => ed.from === e.to && ed.to === e.from);

  if (hasReverse) {
    // Draw curved
    const ox = -ny * 20, oy = nx * 20;
    ctx.beginPath();
    ctx.moveTo(startX + ox, startY + oy);
    ctx.quadraticCurveTo(
      (from.x + to.x)/2 + ox*2, (from.y + to.y)/2 + oy*2,
      endX + ox, endY + oy
    );
    ctx.stroke();

    if (isDirected) {
      drawArrowHead(
        (from.x + to.x)/2 + ox*2, (from.y + to.y)/2 + oy*2,
        endX + ox, endY + oy, color
      );
    }

    // Weight label
    if (currentAlgo.weighted) {
      const mx = (from.x + to.x)/2 + ox*3, my = (from.y + to.y)/2 + oy*3;
      drawWeightLabel(e.weight, mx, my, e.state);
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    if (isDirected) {
      drawArrowHead(from.x + nx*(dist-NODE_R-12), from.y + ny*(dist-NODE_R-12), endX, endY, color);
    }

    // Weight label
    if (currentAlgo.weighted) {
      const mx = (from.x + to.x)/2, my = (from.y + to.y)/2;
      drawWeightLabel(e.weight, mx, my, e.state);
    }
  }

  ctx.restore();
}

function drawArrowHead(px, py, ex, ey, color) {
  const dx = ex - px, dy = ey - py;
  const dist = Math.sqrt(dx*dx+dy*dy);
  if (dist === 0) return;
  const nx = dx/dist, ny = dy/dist;
  const size = 9;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - nx*size - ny*(size*0.55), ey - ny*size + nx*(size*0.55));
  ctx.lineTo(ex - nx*size + ny*(size*0.55), ey - ny*size - nx*(size*0.55));
  ctx.closePath();
  ctx.fill();
}

function drawWeightLabel(w, x, y, state) {
  const negColor = getCSSVar('--neg-weight');
  const pathColor = getCSSVar('--edge-path');
  const defaultColor = getCSSVar('--canvas-weight-color');
  const color = w < 0 ? negColor : (state === 'path' ? pathColor : defaultColor);
  ctx.save();
  ctx.font = '600 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = getCSSVar('--canvas-weight-bg');
  ctx.beginPath();
  ctx.roundRect(x-14, y-9, 28, 18, 5);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(w, x, y);
  ctx.restore();
}

function getNodeFill(state) {
  if (state === 'active') return { fill: 'rgba(245,158,11,0.25)', border: getCSSVar('--node-active'), bw: 2.5 };
  if (state === 'visited') return { fill: 'rgba(59,130,246,0.25)', border: getCSSVar('--node-visited'), bw: 2 };
  if (state === 'path') return { fill: 'rgba(16,185,129,0.3)', border: getCSSVar('--node-path'), bw: 3 };
  if (state === 'connecting') return { fill: 'rgba(139,92,246,0.25)', border: '#8B5CF6', bw: 2.5 };
  return { fill: getCSSVar('--node-unvisited'), border: getCSSVar('--node-border'), bw: 1.5 };
}

function drawNode(n) {
  const { fill, border, bw } = getNodeFill(n.connecting ? 'connecting' : n.state);

  ctx.save();
  ctx.beginPath();
  ctx.arc(n.x, n.y, NODE_R, 0, Math.PI*2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = bw;
  ctx.stroke();

  ctx.font = `600 13px "Montserrat", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = n.state === 'unvisited' ? getCSSVar('--canvas-node-text') : getCSSVar('--canvas-node-text-active');
  ctx.fillText(n.label, n.x, n.y);

  // Distance label above node
  if (n.dist !== undefined && n.dist !== Infinity && n.state !== 'unvisited' && currentAlgo.weighted) {
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FCD34D';
    ctx.textAlign = 'center';
    ctx.fillText(n.dist, n.x, n.y - NODE_R - 8);
  }

  ctx.restore();
}
