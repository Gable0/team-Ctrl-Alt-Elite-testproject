// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    silent: true,

    // THIS IS THE ONLY NEW PART YOU NEED
    include: [
      'tests/unit/**/*.test.js',
      'tests/integration/**/*.test.js'
    ],
    exclude: [
      'tests/e2e/**',           // ← This skips your Playwright test completely
      'node_modules',
      'coverage',
      'dist'
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['js/**/*.js'],
      exclude: [
        'tests/',
        'assets/',
        'js/core/gameLoop.js',        // optional but smart
        'js/core/input.js',
        'js/ui/**',
        'js/systems/audioManager.js'  // if you're mocking it
      ],
      all: true,
      reportOnFailure: true
    },
  },
});