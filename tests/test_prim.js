const fs = require('fs');
const vm = require('vm');
const path = require('path');

const context = {
  nodes: [], edges: [], simSteps: [], isDirected: false,
  currentAlgo: { id: 'prim', needsTarget: false },
  showWarning: (msg) => { context.lastWarning = msg; },
  document: { getElementById: () => ({ value: '1' }) },
  console, Math, Set, parseInt, isNaN
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/algorithms.js'), 'utf8'), context);

console.log("\n==========================================================");
console.log(" 🧪 KIỂM THỬ: THUẬT TOÁN PRIM (CÂY KHUNG NHỎ NHẤT)");
console.log("==========================================================\n");

console.log("📌 BƯỚC 1: Khởi tạo đồ thị đứt gãy (Không liên thông)");
context.nodes = [
    {id: 1, label: 'A', state: 'unvisited'},
    {id: 2, label: 'B', state: 'unvisited'},
    {id: 3, label: 'C', state: 'unvisited'}
];
context.edges = [
    {id: 1, from: 1, to: 2, weight: 1, state: 'default'}
];
console.log("   - Nhóm 1: A nối với B");
console.log("   - Nhóm 2: C hoàn toàn cô lập\n");

console.log("📌 BƯỚC 2: Thực thi thuật toán Prim từ đỉnh A");
context.generatePrim(1);

console.log("\n📌 BƯỚC 3: Quan sát xử lý lỗi không liên thông");
let foundWarning = false;
context.simSteps.forEach(step => {
    if (step.logType === 'warning') {
        console.log("   ⚠️  " + step.log);
        if (step.log.includes("không liên thông")) foundWarning = true;
    }
});

console.log("\n📌 BƯỚC 4: Phân tích hành vi thuật toán");
if (foundWarning) {
    console.log("\n✅ KẾT LUẬN: Thuật toán nhận diện được đồ thị bị đứt gãy và dừng lại an toàn thay vì bị treo.");
    console.log("✅ TRẠNG THÁI: [ ✔ PASS ]\n");
} else {
    console.log("\n❌ TRẠNG THÁI: [ FAIL ]\n");
}
