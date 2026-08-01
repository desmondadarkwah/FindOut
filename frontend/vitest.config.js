import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.{test,spec}.{js,jsx}',
        'src/test/**',
        'src/main.jsx',
      ],
      /* Floors set just under measured coverage, so the build fails on a
         regression rather than on an aspiration. Statement coverage stays low
         because most of the app is screens no test mounts yet; what is covered
         — the token store, the sharing helpers, the post menu, the public
         About/Terms/Privacy pages and the availability indicator — carries the
         branch figure. Raise these as tests are added. */
      thresholds: {
        statements: 7.5,
        branches: 56,
        functions: 25,
        lines: 7.5,
      },
    },
  },
});
