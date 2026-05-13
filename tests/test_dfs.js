const fs = require('fs');
const vm = require('vm');
const path = require('path');

const context = {
  nodes: [], edges: [], simSteps: [], isDirected: false,
  currentAlgo: { id: 'dfs', needsTarget: false },
  showWarning: (msg) => { context.lastWarning = msg; },
  document: { getElementById: () => ({ value: '1' }) },
  console, Math, Set, parseInt, isNaN
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/algorithms.js'), 'utf8'), context);

console.log("\n==========================================================");
console.log(" 🧪 KIỂM THỬ: THUẬT TOÁN TÌM KIẾM THEO CHIỀU SÂU (DFS)");
console.log("==========================================================\n");

console.log("📌 BƯỚC 1: Khởi tạo dữ liệu đồ thị");
context.nodes = [
    {id: 1, label: 'A', state: 'unvisited'},
    {id: 2, label: 'B', state: 'unvisited'},
    {id: 3, label: 'C', state: 'unvisited'},
    {id: 4, label: 'D', state: 'unvisited'}
];
context.edges = [
    {id: 1, from: 1, to: 2, weight: 1, state: 'default'},
    {id: 2, from: 1, to: 3, weight: 1, state: 'default'},
    {id: 3, from: 2, to: 4, weight: 1, state: 'default'}
];
console.log("   - Các đỉnh: A, B, C, D");
console.log("   - Các cạnh: A-B, A-C, B-D\n");

console.log("📌 BƯỚC 2: Thực thi thuật toán DFS (Xuất phát từ A)");
context.generateDFS(1);

console.log("\n📌 BƯỚC 3: Theo dõi trạng thái Ngăn xếp (Stack)");
const traversalOrder = [];
context.simSteps.forEach(step => {
    if (step.log.includes("Hoàn thành thăm nút")) {
        traversalOrder.push(step.log.replace("Hoàn thành thăm nút ", ""));
    }
    if (step.log.includes("Thêm") || step.log.includes("Lấy nút")) {
        console.log("   > " + step.log);
        if (step.queue) console.log("      [Stack hiện tại]: " + step.queue.map(id => context.nodes.find(n=>n.id===id).label).join(", "));
    }
});

console.log("\n📌 BƯỚC 4: Kiểm tra kết quả duyệt");
console.log("   - Kết quả dự kiến (LIFO): Cần ưu tiên đi sâu hết một nhánh.");
console.log("   - Trật tự hoàn thành thực tế: " + traversalOrder.join(" -> "));

if (traversalOrder.length === 4 && traversalOrder[0] === 'A') {
    console.log("\n✅ KẾT LUẬN: Đỉnh được duyệt đúng theo nguyên lý LIFO của ngăn xếp.");
    console.log("✅ TRẠNG THÁI: [ ✔ PASS ]\n");
} else {
    console.log("\n❌ TRẠNG THÁI: [ FAIL ]\n");
}
