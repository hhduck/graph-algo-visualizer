// ===================================================
// APP: Main application initialization & state
// ===================================================

// ===================================================
// GLOBAL STATE
// ===================================================
var currentAlgo = null;
var nodes = [];
var edges = [];
var nodeCounter = 0;
var edgeCounter = 0;
var mode = 'select';
var isDirected = false;
var isDragging = false;
var dragNode = null;
var dragOffX = 0, dragOffY = 0;
var edgeStart = null;
var pendingEdge = null;
var isPlaying = false;
var playTimer = null;

// Simulation steps
var simSteps = [];
var currentStep = -1;
var algorithmResult = [];

// Canvas
var canvas, ctx;
var W, H;

var SPEEDS = { 1: 2000, 2: 1200, 3: 700, 4: 350, 5: 150 };
var SPEED_LABELS = { 1: 'Rất chậm', 2: 'Chậm', 3: 'Bình thường', 4: 'Nhanh', 5: 'Rất nhanh' };
var NODE_R = 24;

// ===================================================
// HOME PAGE RENDERING
// ===================================================
function renderHome() {
  const CATEGORIES = [
    {
      title: 'Duyệt đồ thị cơ bản',
      ids: ['dfs', 'bfs']
    },
    {
      title: 'Thuật toán trọng số & Cây khung',
      ids: ['dijkstra', 'bellman', 'prim']
    }
  ];

  function renderCard(algo) {
    const dots = [1, 2, 3].map(i =>
      `<div class="diff-dot" style="background:${i <= algo.difficulty ? algo.color : 'var(--border)'}"></div>`
    ).join('');
    const diffLabel = ['', 'Cơ bản', 'Trung cấp', 'Nâng cao'][algo.difficulty];
    const tags = algo.tags.map(t =>
      `<span class="card-tag" style="background:${algo.bg};color:${algo.color};border:1px solid ${algo.color}33">${t}</span>`
    ).join('');

    return `
    <div class="algo-card" style="--card-color:${algo.color}" onclick="openSim('${algo.id}')">
      <div class="card-header">
        <div>
          <div class="card-title">${algo.name}</div>
          <div class="card-full-name">${algo.fullName}</div>
        </div>
        <span class="card-complexity">${algo.complexity}</span>
      </div>
      <div class="card-desc">${algo.desc}</div>
      <div class="card-tags">${tags}</div>
      <div class="card-footer">
        <div class="card-difficulty">
          ${dots}
          <span class="diff-label">${diffLabel}</span>
        </div>
        <div class="card-cta" style="color:${algo.color}">
          Mô phỏng
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 6h6M7 3l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>`;
  }

  const container = document.getElementById('algo-grid');
  container.innerHTML = CATEGORIES.map(cat => {
    const cards = cat.ids
      .map(id => ALGORITHMS.find(a => a.id === id))
      .filter(Boolean)
      .map(renderCard)
      .join('');

    return `
    <section class="algo-section">
      <h2 class="section-title">${cat.title}</h2>
      <div class="section-grid">${cards}</div>
    </section>`;
  }).join('');
}

// ===================================================
// OPEN SIMULATOR
// ===================================================
function openSim(algoId) {
  currentAlgo = ALGORITHMS.find(a => a.id === algoId);
  document.getElementById('home-page').style.display = 'none';
  const simPage = document.getElementById('sim-page');
  simPage.style.display = 'flex';

  // Update header
  const badge = document.getElementById('sim-algo-badge');
  badge.innerHTML = `<span class="badge-dot" style="background:${currentAlgo.color}"></span>${currentAlgo.name}`;
  badge.style.background = currentAlgo.bg;
  badge.style.color = currentAlgo.color;
  badge.style.border = `1px solid ${currentAlgo.color}40`;
  document.getElementById('sim-title-full').textContent = currentAlgo.fullName;

  // Setup
  isDirected = currentAlgo.directed || false;
  updateDirectedBtn();

  // Show/hide neg weight legend
  document.getElementById('neg-legend').style.display =
    currentAlgo.id === 'bellman' ? 'flex' : 'none';

  // Show/hide target node selector
  document.getElementById('end-node-sel').style.display =
    currentAlgo.needsTarget ? 'flex' : 'none';

  // Reset
  nodes = [];
  edges = [];
  nodeCounter = 0;
  edgeCounter = 0;
  simSteps = [];
  currentStep = -1;
  isPlaying = false;
  if (playTimer) clearInterval(playTimer);
  // Reset nút play về trạng thái dừng (▶)
  const btnPlay = document.getElementById('btn-play');
  if (btnPlay) { btnPlay.textContent = '▶'; btnPlay.classList.remove('active'); }

  // Init canvas
  setTimeout(() => {
    initCanvas();
    loadExample();
    setupPseudocode();
    updateUI();
  }, 50);
}

function goHome() {
  if (isPlaying) { isPlaying = false; clearInterval(playTimer); }
  document.getElementById('sim-page').style.display = 'none';
  document.getElementById('home-page').style.display = 'flex';
}

// ===================================================
// CANVAS SETUP
// ===================================================
function initCanvas() {
  canvas = document.getElementById('main-canvas');
  const area = canvas.parentElement;
  W = area.clientWidth;
  H = area.clientHeight;
  canvas.width = W;
  canvas.height = H;
  ctx = canvas.getContext('2d');

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('dblclick', onDblClick);
  canvas.addEventListener('contextmenu', e => { e.preventDefault(); onRightClick(e); });

  window.addEventListener('keydown', onKeyDown);

  document.getElementById('speed-slider').addEventListener('input', function () {
    document.getElementById('speed-label').textContent = SPEED_LABELS[this.value];
    if (isPlaying) {
      clearInterval(playTimer);
      playTimer = setInterval(stepForward, SPEEDS[this.value]);
    }
  });

  draw();
}

// ===================================================
// WEIGHT INPUT EVENT LISTENER
// ===================================================
document.getElementById('weight-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmEdge();
  if (e.key === 'Escape') cancelEdge();
});

// ===================================================
// RESIZE HANDLER
// ===================================================
window.addEventListener('resize', () => {
  if (!canvas) return;
  const area = canvas.parentElement;
  W = area.clientWidth;
  H = area.clientHeight;
  canvas.width = W;
  canvas.height = H;
  draw();
});

// ===================================================
// THEME TOGGLE
// ===================================================
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('graphviz-theme', next);
  // Redraw canvas with new theme colors
  if (ctx) draw();
}

function initTheme() {
  const saved = localStorage.getItem('graphviz-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
  // Default is dark (no data-theme attribute = :root styles)
}

// ===================================================
// INIT
// ===================================================
initTheme();
renderHome();
