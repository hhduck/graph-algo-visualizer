// Playwright config to run a simple webServer and tests
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
    timeout: 30_000,
    testDir: 'tests',
    retries: 0,
    use: {
        actionTimeout: 5_000,
        trace: 'off',
        baseURL: 'http://localhost:8000',
        headless: true,
        viewport: { width: 1280, height: 800 },
    },
    webServer: {
        // Start a simple static server using Python (works when Python is available)
        command: 'python -m http.server 8000',
        port: 8000,
        cwd: __dirname,
        timeout: 20_000,
        reuseExistingServer: true,
    },
};
