const fs = require('fs');
const vm = require('vm');
const path = require('path');

const context = {
  nodes: [], edges: [], simSteps: [], isDirected: true,
  currentAlgo: { id: 'dijkstra', needsTarget: false },
  showWarning: (msg) => { context.lastWarning = msg; },
  document: { getElementById: () => ({ value: '1' }) },
  console, Math, Set, parseInt, isNaN
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/algorithms.js'), 'utf8'), context);

console.log("\n==========================================================");
console.log(" 🧪 KIỂM THỬ: THUẬT TOÁN ĐƯỜNG ĐI NGẮN NHẤT DIJKSTRA");
console.log("==========================================================\n");

console.log("📌 BƯỚC 1: Khởi tạo mạng lưới giao thông (đồ thị có trọng số dương)");
context.nodes = [
    {id: 1, label: 'A', state: 'unvisited'},
    {id: 2, label: 'B', state: 'unvisited'},
    {id: 3, label: 'C', state: 'unvisited'}
];
context.edges = [
    {id: 1, from: 1, to: 2, weight: 10, state: 'default'},
    {id: 2, from: 2, to: 3, weight: 5, state: 'default'},
    {id: 3, from: 1, to: 3, weight: 20, state: 'default'}
];
console.log("   - A -> B (Chi phí: 10)");
console.log("   - B -> C (Chi phí: 5)");
console.log("   - A -> C (Chi phí: 20)\n");

console.log("📌 BƯỚC 2: Thực thi Dijkstra tìm đường từ A đến mọi đỉnh");
context.generateDijkstra(1);

console.log("\n📌 BƯỚC 3: Phân tích quá trình nới lỏng (Relaxation)");
context.simSteps.forEach(step => {
    if (step.log.includes("Cập nhật dist") || step.log.includes("Xét cạnh")) {
        console.log("   > " + step.log);
    }
});

const distC = context.nodes.find(n => n.id === 3).dist;
console.log("\n📌 BƯỚC 4: Kiểm tra kết quả");
console.log("   - Đường đi trực tiếp A->C tốn 20.");
console.log("   - Đường đi vòng A->B->C tốn 10 + 5 = 15.");
console.log("   - Khoảng cách ngắn nhất đến C do thuật toán tính được: " + distC);

if (distC === 15) {
    console.log("\n✅ KẾT LUẬN: Thuật toán tính toán chính xác tổng chi phí tối ưu.");
    console.log("✅ TRẠNG THÁI: [ ✔ PASS ]\n");
} else {
    console.log("\n❌ TRẠNG THÁI: [ FAIL ]\n");
}
