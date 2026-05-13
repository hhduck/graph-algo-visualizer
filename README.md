# GraphViz – Algorithm Visualizer

## Mô tả
**GraphViz** là một ứng dụng web trực quan hoá các thuật toán đồ thị kinh điển, được thiết kế phục vụ cho mục đích giáo dục trong học phần Lý thuyết Đồ thị. Ứng dụng cho phép người dùng tự xây dựng đồ thị, chọn từ nhiều thuật toán cơ bản khác nhau và quan sát từng bước thực thi theo thời gian thực. Để nâng cao hiệu quả học tập, quá trình mô phỏng được đồng bộ với mã giả, bảng dữ liệu tương tác và nhật ký thực thi chi tiết.

### Các thuật toán hỗ trợ
- **DFS (Tìm kiếm theo chiều sâu)**
- **BFS (Tìm kiếm theo chiều rộng)**
- **Dijkstra (Đường đi ngắn nhất)**
- **Thuật toán Bellman-Ford**
- **Prim (Cây khung nhỏ nhất)**

## Công nghệ sử dụng
- **HTML5 & CSS3**: Xây dựng cấu trúc và giao diện người dùng, tích hợp thiết kế đáp ứng (responsive), biến CSS (CSS variables) và hỗ trợ giao diện Sáng/Tối (Dark/Light theme).
- **JavaScript (Vanilla)**: Xử lý logic cốt lõi, triển khai thuật toán và tương tác của người dùng mà không phụ thuộc vào bất kỳ thư viện bên ngoài nào.
- **Canvas API**: Chịu trách nhiệm vẽ động các đỉnh, cạnh, mũi tên và hoạt ảnh trên màn hình.
- **Playwright**: Dùng để kiểm thử tự động toàn trình (E2E testing), đảm bảo tính chính xác khi thực thi thuật toán.

## Cấu trúc dự án
```text
├── index.html              # Trang HTML chính
├── package.json            # Thông tin metadata dự án và cấu hình test
├── playwright.config.js    # Cấu hình kiểm thử E2E với Playwright
├── css/                    # Các file stylesheet (CSS)
│   ├── style.css           # Biến toàn cục và reset CSS
│   ├── home.css            # Giao diện trang chủ
│   ├── simulator.css       # Bố cục và thành phần trang mô phỏng
│   └── responsive.css      # CSS hỗ trợ thiết bị di động
├── js/                     # Logic của ứng dụng
│   ├── app.js              # Khởi tạo và quản lý trạng thái toàn cục
│   ├── algorithms.js       # Triển khai thuật toán cốt lõi (DFS, BFS, Dijkstra, v.v.)
│   ├── canvas.js           # Xử lý vẽ trên Canvas (đỉnh, cạnh)
│   ├── data.js             # Định nghĩa thuật toán và mã giả
│   ├── graph.js            # Cấu trúc dữ liệu đồ thị và thao tác
│   └── ui.js               # Tương tác UI, điều khiển mô phỏng và sự kiện
├── tests/                  # Các file script kiểm thử E2E (Playwright)
└── test-scripts/           # Công cụ hỗ trợ và cấu hình kiểm thử bổ sung
```

## Cài đặt

Đây là ứng dụng web front-end hoàn toàn không phụ thuộc (zero-dependency). Bạn không cần cài đặt các framework nặng nề để chạy ứng dụng cốt lõi!

1. **Clone repository (Sao chép dự án):**
   ```bash
   git clone https://github.com/Kayazumi/Project-Simulating-algorithms-in-the-Graph-Theory-Module.git
   cd Project-Simulating-algorithms-in-the-Graph-Theory-Module
   ```

2. **Chạy ứng dụng cục bộ:**
   Chỉ cần mở file `index.html` trong trình duyệt web của bạn, hoặc dùng local development server như `serve`:
   ```bash
   npx serve .
   ```

3. **Cài đặt thư viện kiểm thử (Tùy chọn):**
   Nếu bạn muốn chạy bộ kiểm thử Playwright:
   ```bash
   npm install
   npm run test
   ```

## Hướng dẫn sử dụng

1. **Chọn thuật toán**: Trên trang chủ, nhấp vào thẻ của một thuật toán bất kỳ (ví dụ: DFS, Dijkstra) để mở trình mô phỏng.
2. **Xây dựng và chỉnh sửa đồ thị**:
   - **Thêm nút (đỉnh)**: Nhấp vào nút "Thêm nút" (hoặc nhấn phím `N`) rồi nhấp vào bất kỳ đâu trên bảng vẽ (canvas).
   - **Thêm cạnh**: Nhấp vào nút "Thêm cạnh" (hoặc nhấn phím `E`), sau đó nhấp lần lượt vào hai nút để kết nối chúng.
   - **Sửa trọng số**: Nhấp đúp vào một cạnh bất kỳ để điều chỉnh trọng số của nó.
   - **Xóa phần tử**: Nhấp vào nút "Xóa" (hoặc nhấn phím `D`), sau đó nhấp vào nút hoặc cạnh để loại bỏ nó.
   - **Đổi loại đồ thị**: Chuyển đổi giữa chế độ đồ thị "Có hướng" và "Vô hướng" trên thanh công cụ.
3. **Chạy mô phỏng**:
   - Nhấp vào nút **▶ Chạy lại** hoặc nhấn phím `Space` để bắt đầu quá trình trực quan hoá.
   - Sử dụng các nút **Bước tiến/Bước lùi** (hoặc phím mũi tên `←` / `→`) để điểu khiển chạy thuật toán qua từng bước.
   - Kéo thanh trượt tốc độ (speed slider) để tăng hoặc giảm tốc độ phát.
4. **Kiểm tra dữ liệu thực thi**:
   - Quan sát dòng mã được bôi sáng trong tab **Mã giả**.
   - Kiểm tra các hàng đợi (queue), ngăn xếp (stack) đang hoạt động, hoặc mảng khoảng cách trong tab **Dữ liệu**.
   - Đọc các bước sự kiện cụ thể ở tab **Nhật ký**.
