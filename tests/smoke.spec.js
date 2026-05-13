const { test, expect } = require('@playwright/test');

test('smoke: load app, open simulator, load example, run algorithm', async ({ page }) => {
    // Go to base URL (playwright config sets baseURL)
    await page.goto('/');

    // Home: expect at least one algorithm card
    const firstCard = page.locator('#algo-grid .algo-card').first();
    await expect(firstCard).toBeVisible({ timeout: 5000 });

    // Open simulator by clicking first card
    await firstCard.click();

    // Simulator canvas should appear
    await expect(page.locator('#main-canvas')).toBeVisible({ timeout: 5000 });

    // Click 'Đồ thị mẫu' to load example graph
    await page.click('text=Đồ thị mẫu');

    // Run algorithm (primary run button)
    await page.click('button.action-btn.primary');

    // Wait for at least one log entry to be attached to the DOM (panel may be hidden)
    await page.waitForSelector('#step-log .log-entry', { state: 'attached', timeout: 10000 });

    // Verify pseudocode panel exists and has lines
    await expect(page.locator('#pseudocode .code-line').first()).toBeVisible();
});
