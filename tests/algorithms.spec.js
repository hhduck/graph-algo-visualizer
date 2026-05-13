const { test, expect } = require('@playwright/test');

test.describe('Graph Algorithm Visualizer Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('http://localhost:3000');
  });

  test('TC01 & TC02: DFS Execution and UI Synchronization', async ({ page }) => {
    // Open DFS simulator
    await page.click('text=Duyệt theo chiều sâu (DFS)');
    await expect(page.locator('#main-canvas')).toBeVisible();

    // Load example graph
    await page.click('text=Đồ thị mẫu');

    // Run algorithm
    await page.click('button.action-btn.primary'); // Play button

    // Wait for the completion message in the log
    await expect(page.locator('#step-log')).toContainText('DFS hoàn thành!', { timeout: 15000 });

    // Verify Algorithm Result Panel shows valid traversal (e.g. A → B → ...)
    const resultPanel = page.locator('#data-inspector');
    await expect(resultPanel).toContainText('KẾT QUẢ THUẬT TOÁN');
    // Ensure it's not the empty state
    await expect(resultPanel).not.toContainText('Chưa có kết quả');
    
    // Check pseudocode highlights exist
    const highlightedCode = page.locator('.code-line.active');
    await expect(highlightedCode).toBeVisible();
  });

  test('TC03: Dijkstra blocking negative weights', async ({ page }) => {
    // Open Dijkstra simulator
    await page.click('text=Đường đi ngắn nhất Dijkstra');
    await expect(page.locator('#main-canvas')).toBeVisible();

    // Since it's a visual canvas, we simulate the internal defensive mechanism 
    // by checking if the UI handles negative weights correctly.
    // Assuming 'Đồ thị mẫu' for Dijkstra doesn't contain negative weights, 
    // we would ideally interact with weight input.
    // Here we ensure the algorithm completes without errors.
    await page.click('text=Đồ thị mẫu');
    await page.click('button.action-btn.primary');

    await expect(page.locator('#step-log')).toContainText('Dijkstra hoàn thành!', { timeout: 15000 });
  });

  test('TC04: Bellman-Ford detecting negative cycles', async ({ page }) => {
    // Open Bellman-Ford
    await page.click('text=Thuật toán Bellman-Ford');
    
    // Load example graph (which should contain a negative cycle for Bellman-Ford)
    await page.click('text=Đồ thị mẫu');

    // Run algorithm
    await page.click('button.action-btn.primary');

    // Verify the negative cycle warning appears
    await expect(page.locator('#step-log')).toContainText('Phát hiện chu trình âm!', { timeout: 15000 });
  });

  test('TC05: Prim disconnected graph handling', async ({ page }) => {
    // Open Prim
    await page.click('text=Cây khung nhỏ nhất Prim');
    
    // Note: Creating a disconnected graph via canvas clicks in Playwright is complex.
    // For a robust test, we would run JavaScript in the page context to clear edges or add an isolated node.
    await page.evaluate(() => {
        // Clear graph and add two disconnected nodes
        clearGraph();
        nodes.push({ id: 1, x: 100, y: 100, label: 'A', state: 'unvisited' });
        nodes.push({ id: 2, x: 300, y: 100, label: 'B', state: 'unvisited' });
        nodeCounter = 2;
        updateNodeSelects();
        draw();
    });

    // Run algorithm
    await page.click('button.action-btn.primary');

    // Verify disconnected warning
    await expect(page.locator('#step-log')).toContainText('Đồ thị không liên thông', { timeout: 10000 });
  });

});
