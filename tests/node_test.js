const fs = require('fs');
const vm = require('vm');
const path = require('path');

const context = {
  nodes: [],
  edges: [],
  simSteps: [],
  isDirected: false,
  currentAlgo: { id: 'dfs', needsTarget: false },
  showWarning: (msg) => { context.lastWarning = msg; },
  document: {
    getElementById: (id) => ({ value: '1' })
  },
  console: console,
  Math: Math,
  Set: Set,
  parseInt: parseInt,
  isNaN: isNaN
};

vm.createContext(context);
const code = fs.readFileSync(path.join(__dirname, '../js/algorithms.js'), 'utf8');
vm.runInContext(code, context);

const green = '\x1b[32m';
const red = '\x1b[31m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m';

function runTest(name, testFn) {
  try {
    context.simSteps = [];
    context.lastWarning = null;
    testFn();
    console.log(` ${green}✔ PASS${reset} | ${cyan}${name}${reset}`);
  } catch(e) {
    console.log(` ${red}✘ FAIL${reset} | ${cyan}${name}${reset}\n    ${red}Error: ${e.message}${reset}`);
  }
}

console.log("\n==================================================");
console.log("   GRAPH ALGORITHM CORE LOGIC TEST EXECUTION");
console.log("==================================================\n");

runTest("TC01: DFS/BFS execution on a standard graph", () => {
    context.nodes = [
        {id: 1, label: 'A', state: 'unvisited'},
        {id: 2, label: 'B', state: 'unvisited'},
        {id: 3, label: 'C', state: 'unvisited'}
    ];
    context.edges = [
        {id: 1, from: 1, to: 2, weight: 1, state: 'default'},
        {id: 2, from: 2, to: 3, weight: 1, state: 'default'}
    ];
    context.isDirected = false;
    
    context.generateDFS(1);
    const lastStep = context.simSteps[context.simSteps.length - 1];
    if (!lastStep.log.includes("DFS hoàn thành!")) throw new Error("DFS did not complete correctly.");
    
    context.simSteps = [];
    context.generateBFS(1);
    const bfsLastStep = context.simSteps[context.simSteps.length - 1];
    if (!bfsLastStep.log.includes("BFS hoàn thành!")) throw new Error("BFS did not complete correctly.");
});

runTest("TC02: UI synchronization state steps are recorded accurately", () => {
    context.nodes = [{id: 1, label: 'A', state: 'unvisited'}];
    context.edges = [];
    context.simSteps = [];
    context.generateDFS(1);
    // Ensure codeLine properties exist on every snapshot
    const hasCodeLine = context.simSteps.every(step => step.codeLine !== undefined && step.codeLine !== null);
    if (!hasCodeLine) throw new Error("Snapshot states are missing codeLine sync attributes.");
});

runTest("TC03: Dijkstra optimal shortest path calculation", () => {
    context.nodes = [
        {id: 1, label: 'A', state: 'unvisited'},
        {id: 2, label: 'B', state: 'unvisited'},
        {id: 3, label: 'C', state: 'unvisited'}
    ];
    context.edges = [
        {id: 1, from: 1, to: 2, weight: 5, state: 'default'},
        {id: 2, from: 2, to: 3, weight: 10, state: 'default'},
        {id: 3, from: 1, to: 3, weight: 20, state: 'default'}
    ];
    context.isDirected = true;
    context.currentAlgo = { id: 'dijkstra', needsTarget: false };
    context.generateDijkstra(1);
    
    const distC = context.nodes.find(n => n.id === 3).dist;
    if (distC !== 15) throw new Error("Dijkstra failed to find optimal path. Expected 15, got " + distC);
});

runTest("TC04: Bellman-Ford successfully detecting negative cycles", () => {
    context.nodes = [
        {id: 1, label: 'A', state: 'unvisited'},
        {id: 2, label: 'B', state: 'unvisited'},
        {id: 3, label: 'C', state: 'unvisited'}
    ];
    context.edges = [
        {id: 1, from: 1, to: 2, weight: 1, state: 'default'},
        {id: 2, from: 2, to: 3, weight: 1, state: 'default'},
        {id: 3, from: 3, to: 1, weight: -5, state: 'default'} // negative cycle
    ];
    context.isDirected = true;
    context.generateBellman(1);
    
    if (!context.lastWarning || !context.lastWarning.includes("Phát hiện chu trình âm")) {
        throw new Error("Failed to detect negative cycle.");
    }
});

runTest("TC05: Prim's algorithm behavior on a disconnected graph", () => {
    context.nodes = [
        {id: 1, label: 'A', state: 'unvisited'},
        {id: 2, label: 'B', state: 'unvisited'},
        {id: 3, label: 'C', state: 'unvisited'} // C is isolated
    ];
    context.edges = [
        {id: 1, from: 1, to: 2, weight: 1, state: 'default'}
    ];
    context.isDirected = false;
    context.generatePrim(1);
    
    const disconnectedLog = context.simSteps.find(s => s.log.includes("Đồ thị không liên thông"));
    if (!disconnectedLog) {
        throw new Error("Failed to detect disconnected graph.");
    }
});

console.log("\n==================================================\n");
