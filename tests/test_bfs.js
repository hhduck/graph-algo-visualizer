const fs = require('fs');
const vm = require('vm');
const path = require('path');

const context = {
  nodes: [], edges: [], simSteps: [], isDirected: false,
  currentAlgo: { id: 'bfs', needsTarget: false },
  showWarning: (msg) => { context.lastWarning = msg; },
  document: { getElementById: () => ({ value: '1' }) },
  console, Math, Set, parseInt, isNaN
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/algorithms.js'), 'utf8'), context);

console.log("\n==========================================================");
console.log(" 🧪 KIỂM THỬ: THUẬT TOÁN TÌM KIẾM THEO CHIỀU RỘNG (BFS)");
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
console.log("   - Cấu trúc cây: A có con là B và C. B có con là D.\n");

console.log("📌 BƯỚC 2: Thực thi thuật toán BFS (Xuất phát từ A)");
context.generateBFS(1);

console.log("\n📌 BƯỚC 3: Theo dõi trạng thái Hàng đợi (Queue)");
const traversalOrder = [];
context.simSteps.forEach(step => {
    if (step.log.includes("Xử lý nút")) {
        traversalOrder.push(step.log.replace("Xử lý nút ", ""));
    }
    if (step.log.includes("Đưa") || step.log.includes("Lấy")) {
        console.log("   > " + step.log);
        if (step.queue) console.log("      [Queue hiện tại]: " + step.queue.map(id => context.nodes.find(n=>n.id===id).label).join(", "));
    }
});

console.log("\n📌 BƯỚC 4: Kiểm tra kết quả duyệt");
console.log("   - Kết quả dự kiến (FIFO): Duyệt xong lớp 1 (B, C) rồi mới đến lớp 2 (D).");
console.log("   - Trật tự xử lý thực tế: " + traversalOrder.join(" -> "));

if (traversalOrder[1] === 'B' && traversalOrder[2] === 'C') {
    console.log("\n✅ KẾT LUẬN: Đỉnh được duyệt chuẩn xác theo từng lớp (FIFO).");
    console.log("✅ TRẠNG THÁI: [ ✔ PASS ]\n");
} else {
    console.log("\n❌ TRẠNG THÁI: [ FAIL ]\n");
}
