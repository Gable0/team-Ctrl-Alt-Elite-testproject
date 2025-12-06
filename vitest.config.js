import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    silent: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['tests/', 'assets/'],
    },
  },
});
