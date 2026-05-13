// ===================================================
// DATA: Algorithm definitions
// ===================================================

// Shared SVG attribute shorthand (used inline below)
// All icons: width="24" height="24" viewBox="0 0 24 24"
//            fill="none" stroke="currentColor"
//            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"

const ALGORITHMS = [
  {
    id: 'dfs',
    name: 'DFS',
    fullName: 'Depth First Search',
    vname: 'Tìm kiếm theo chiều sâu',
    desc: 'Khám phá đồ thị bằng cách đi sâu nhất có thể theo mỗi nhánh trước khi quay lại.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    complexity: 'O(V + E)',
    difficulty: 1,
    tags: ['Đệ quy', 'Ngăn xếp', 'Thăm nút'],
    features: ['Đồ thị có hướng/vô hướng', 'Phát hiện chu trình', 'Thành phần liên thông'],
    supportsNeg: true,
    weighted: false,
    // git-branch: represents recursive branching / going deep into a tree
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="6" y1="3" x2="6" y2="15"/>
      <circle cx="18" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <path d="M18 9a9 9 0 0 1-9 9"/>
    </svg>`,
    directed: false
  },
  {
    id: 'bfs',
    name: 'BFS',
    fullName: 'Breadth First Search',
    vname: 'Tìm kiếm theo chiều rộng',
    desc: 'Thăm tất cả các nút ở cùng mức trước khi đi sâu hơn, dùng hàng đợi.',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    complexity: 'O(V + E)',
    difficulty: 1,
    tags: ['Hàng đợi', 'Đường ngắn nhất', 'Mức độ'],
    features: ['Đường ngắn nhất (unweighted)', 'Duyệt theo lớp', 'Thành phần liên thông'],
    supportsNeg: true,
    weighted: false,
    // layers: represents level-by-level (BFS layer expansion)
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>`,
    directed: false
  },
  {
    id: 'dijkstra',
    name: 'Dijkstra',
    fullName: "Dijkstra's Shortest Path",
    vname: 'Đường đi ngắn nhất Dijkstra',
    desc: 'Tìm đường đi ngắn nhất từ một nguồn đến tất cả các đỉnh. Không hỗ trợ cạnh âm.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    complexity: 'O((V+E) log V)',
    difficulty: 2,
    tags: ['Hàng đợi ưu tiên', 'Tham lam', 'Trọng số'],
    features: ['Đường ngắn nhất có trọng số', 'Chỉ cạnh dương', 'Priority Queue'],
    supportsNeg: false,
    weighted: true,
    // crosshair: represents targeting / finding the optimal destination
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="22" y1="12" x2="18" y2="12"/>
      <line x1="6"  y1="12" x2="2"  y2="12"/>
      <line x1="12" y1="6"  x2="12" y2="2"/>
      <line x1="12" y1="22" x2="12" y2="18"/>
    </svg>`,
    directed: true,
    needsTarget: true
  },
  {
    id: 'bellman',
    name: 'Ford-Bellman',
    fullName: 'Bellman-Ford Algorithm',
    vname: 'Thuật toán Bellman-Ford',
    desc: 'Tìm đường ngắn nhất, hỗ trợ cạnh âm và phát hiện chu trình âm.',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    complexity: 'O(V × E)',
    difficulty: 3,
    tags: ['Lập trình động', 'Cạnh âm', 'Chu trình âm'],
    features: ['Cạnh âm OK', 'Phát hiện chu trình âm', 'Tối ưu từng vòng lặp'],
    supportsNeg: true,
    weighted: true,
    // activity: zigzag pulse line — represents iterative relaxation over all edges
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>`,
    directed: true,
    needsTarget: false
  },
  {
    id: 'prim',
    name: "Prim's MST",
    fullName: "Prim's Minimum Spanning Tree",
    vname: 'Cây khung nhỏ nhất Prim',
    desc: 'Xây dựng cây khung nhỏ nhất bằng cách mở rộng từ một đỉnh nguồn.',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
    complexity: 'O((V+E) log V)',
    difficulty: 2,
    tags: ['MST', 'Tham lam', 'Cây khung'],
    features: ['Cây khung nhỏ nhất', 'Đồ thị liên thông', 'Hàng đợi ưu tiên'],
    supportsNeg: false,
    weighted: true,
    // share-2: hub node radiating edges to others — perfect for MST / spanning tree
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="5"  r="3"/>
      <circle cx="6"  cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59"  y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51"  x2="8.59"  y2="10.49"/>
    </svg>`,
    directed: false
  }
];

// ===================================================
// PSEUDOCODE definitions
// ===================================================
const PSEUDOCODES = {
  dfs: [
    'Hàm DFS(Đồ_thị, Nút_bắt_đầu):',                       // 0
    '  Khởi tạo ngăn xếp Stack rỗng',                      // 1
    '  Đẩy Nút_bắt_đầu vào Stack',                         // 2
    '  Khởi tạo tập Visited để lưu các nút đã thăm',       // 3
    '  Trong khi Stack không rỗng:',                       // 4
    '    Lấy nút U ra khỏi đỉnh Stack (pop)',              // 5
    '    Nếu U đã nằm trong Visited:',                     // 6
    '      Bỏ qua nút này (continue)',                     // 7
    '    Đánh dấu U là đã thăm (thêm vào Visited)',        // 8
    '    Với mỗi nút kề V của U:',                         // 9
    '      Nếu V chưa được thăm:',                         // 10
    '        Đẩy V vào Stack',                             // 11
    '  (Kết thúc) Thuật toán hoàn thành',                  // 12
  ],
  bfs: [
    'Hàm BFS(Đồ_thị, Nút_bắt_đầu):',                       // 0
    '  Khởi tạo Hàng đợi Queue rỗng',                      // 1
    '  Đẩy Nút_bắt_đầu vào Queue',                         // 2
    '  Đánh dấu Nút_bắt_đầu là đã thăm',                   // 3
    '  Trong khi Queue không rỗng:',                       // 4
    '    Lấy nút U ra khỏi đầu Queue (shift)',             // 5
    '    Xử lý nút U',                                     // 6
    '    Với mỗi nút kề V của U:',                         // 7
    '      Nếu V chưa được thăm:',                         // 8
    '        Đánh dấu V là đã thăm',                       // 9
    '        Đẩy V vào cuối Queue',                        // 10
    '  (Kết thúc) Thuật toán hoàn thành',                  // 11
  ],
  dijkstra: [
    'Hàm DIJKSTRA(Đồ_thị, Nút_nguồn):',                    // 0
    '  Khởi tạo khoảng cách dist[u] = ∞ cho mọi nút',      // 1
    '  dist[Nút_nguồn] = 0',                               // 2
    '  Khởi tạo Hàng đợi ưu tiên PQ rỗng',                 // 3
    '  Thêm (khoảng cách 0, Nút_nguồn) vào PQ',            // 4
    '  Trong khi PQ không rỗng:',                          // 5
    '    Lấy ra (d, U) có d nhỏ nhất từ PQ',               // 6
    '    Nếu d > dist[U] (đã tìm được đường tốt hơn):',    // 7
    '      Bỏ qua nút U (continue)',                       // 8
    '    Đánh dấu U là đã xét xong',                       // 9
    '    Với mỗi cạnh (U, V) có trọng số W:',              // 10
    '      Nếu dist[U] + W < dist[V]:',                    // 11
    '        Cập nhật dist[V] = dist[U] + W',              // 12
    '        Ghi nhận U là nút trước của V (để truy vết)', // 13
    '        Thêm (dist[V], V) vào PQ',                    // 14
    '  (Kết thúc) Trả về mảng dist và đường đi',           // 15
  ],
  bellman: [
    'Hàm BELLMAN_FORD(Đồ_thị, Nút_nguồn):',                // 0
    '  Khởi tạo mảng khoảng cách dist[u] = ∞',             // 1
    '  Đặt dist[Nút_nguồn] = 0',                           // 2
    '  Lặp (Số_đỉnh - 1) lần:',                            // 3
    '    Duyệt qua TẤT CẢ các cạnh (U, V) có trọng số W:', // 4
    '      Nếu dist[U] ≠ ∞ VÀ dist[U] + W < dist[V]:',     // 5
    '        Cập nhật dist[V] = dist[U] + W',              // 6
    '        Ghi nhận U là nút trước của V',               // 7
    '  Duyệt lại TẤT CẢ các cạnh một lần nữa:',            // 8
    '    Nếu vẫn tồn tại dist[U] + W < dist[V]:',          // 9
    '      Báo lỗi "Phát hiện chu trình âm!"',             // 10
    '  (Kết thúc) Trả về mảng dist',                       // 11
  ],
  prim: [
    'Hàm PRIM(Đồ_thị, Nút_bắt_đầu):',                      // 0
    '  Khởi tạo tập inMST chứa Nút_bắt_đầu',               // 1
    '  Khởi tạo tổng trọng số mstCost = 0',                // 2
    '  Trong khi tập inMST chưa chứa đủ tất cả các nút:',  // 3
    '    Tìm cạnh (U, V) có trọng số W nhỏ nhất thỏa mãn:',// 4
    '    U thuộc inMST VÀ V không thuộc inMST',            // 5
    '    Nếu không tìm được cạnh nào:',                    // 6
    '      Dừng thuật toán (Đồ thị không liên thông)',     // 7
    '    Thêm V vào tập inMST',                            // 8
    '    Thêm cạnh (U, V) vào kết quả cây khung',          // 9
    '    Cộng W vào mstCost',                              // 10
    '  (Kết thúc) Trả về cây khung và mstCost',            // 11
  ],
};