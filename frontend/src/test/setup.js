import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Unmount between tests so one test's DOM cannot leak into the next.
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

// jsdom implements neither of these, and components use both.
globalThis.matchMedia = globalThis.matchMedia || ((query) => ({
  matches: false, media: query, onchange: null,
  addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
}));

globalThis.IntersectionObserver = globalThis.IntersectionObserver || class {
  observe() {} unobserve() {} disconnect() {}
};

globalThis.scrollTo = globalThis.scrollTo || vi.fn();
