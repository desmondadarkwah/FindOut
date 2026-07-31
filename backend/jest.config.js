/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',

  // Unit tests are pure and run everywhere. Integration tests need a database
  // and are selected explicitly by the `test:integration` script.
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],

  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'services/**/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov', 'json-summary'],

  /* Thresholds are floors set from measured coverage, not aspirations. Their
     purpose is to stop coverage regressing silently; raise them as coverage
     grows.

     The global floor is low because most of the codebase is Express
     controllers, which are covered by the integration and functional suites
     rather than by unit tests — those run against a live server and are not
     instrumented here. The modules that hold algorithmic logic are held to a
     high standard individually, which is where a regression would actually
     matter. */
  coverageThreshold: {
    global: {
      statements: 1, branches: 0.2, functions: 1.5, lines: 1,
    },
    './services/matchingService.js': {
      statements: 95, branches: 80, functions: 100, lines: 95,
    },
    './middleware/authMiddleware.js': {
      statements: 100, branches: 100, functions: 100, lines: 100,
    },
  },

  clearMocks: true,
  restoreMocks: true,
  testTimeout: 15000,
  verbose: false,
};
