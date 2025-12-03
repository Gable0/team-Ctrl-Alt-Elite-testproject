import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30_000,
    retries: 1,
    reporter: [['html'], ['list']],
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        video: 'on-first-retry',
        screenshot: 'only-on-failure',
        baseURL: 'http://localhost:5173' // change later if you serve differently
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
})