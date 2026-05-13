const fs = require('fs');
const vm = require('vm');
const path = require('path');

const context = {
  nodes: [], edges: [], simSteps: [], isDirected: true,
  currentAlgo: { id: 'bellman', needsTarget: false },
  showWarning: (msg) => { context.lastWarning = msg; },
  document: { getElementById: () => ({ value: '1' }) },
  console, Math, Set, parseInt, isNaN
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/algorithms.js'), 'utf8'), context);

console.log("\n==========================================================");
console.log(" 🧪 KIỂM THỬ: THUẬT TOÁN BELLMAN-FORD (CHU TRÌNH ÂM)");
console.log("==========================================================\n");

console.log("📌 BƯỚC 1: Khởi tạo đồ thị chứa chu trình âm");
context.nodes = [
    {id: 1, label: 'A', state: 'unvisited'},
    {id: 2, label: 'B', state: 'unvisited'},
    {id: 3, label: 'C', state: 'unvisited'}
];
context.edges = [
    {id: 1, from: 1, to: 2, weight: 1, state: 'default'},
    {id: 2, from: 2, to: 3, weight: 1, state: 'default'},
    {id: 3, from: 3, to: 1, weight: -5, state: 'default'}
];
console.log("   - Vòng lặp: A -> B -> C -> A");
console.log("   - Tổng trọng số chu trình: 1 + 1 + (-5) = -3 (Chu trình âm!)\n");

console.log("📌 BƯỚC 2: Thực thi thuật toán Bellman-Ford");
context.generateBellman(1);

console.log("\n📌 BƯỚC 3: Rà soát cảnh báo hệ thống");
context.simSteps.forEach(step => {
    if (step.logType === 'error') {
        console.log("   🚨 " + step.log);
    }
});
if (context.lastWarning) {
    console.log("   🚨 Cảnh báo Popup: " + context.lastWarning);
}

console.log("\n📌 BƯỚC 4: Đánh giá cơ chế phòng vệ");
if (context.lastWarning && context.lastWarning.includes("chu trình âm")) {
    console.log("\n✅ KẾT LUẬN: Hệ thống đã chặn đứng thành công vòng lặp vô hạn và phát cảnh báo chuẩn xác.");
    console.log("✅ TRẠNG THÁI: [ ✔ PASS ]\n");
} else {
    console.log("\n❌ TRẠNG THÁI: [ FAIL ]\n");
}
