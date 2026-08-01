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
      /* Floors set from measured coverage, to stop it regressing silently.
         They are low because component coverage is currently thin: only the
         token store and the availability indicator are covered. Raise them as
         tests are added rather than setting an aspirational number that fails
         the build from day one. */
      // Floors set just under measured coverage, so the build fails on a
      // regression rather than on an aspiration. Raise them as tests are added.
      thresholds: {
        statements: 1.2,
        branches: 27,
        functions: 12.5,
        lines: 1.2,
      },
    },
  },
});
