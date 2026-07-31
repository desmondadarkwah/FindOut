/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/integration/**/*.test.js'],

  // Integration tests share one database, so they must not run concurrently.
  maxWorkers: 1,
  testTimeout: 45000,

  collectCoverageFrom: ['controllers/**/*.js', 'routes/**/*.js', 'middleware/**/*.js'],
  coverageDirectory: 'coverage-integration',
  coverageReporters: ['text-summary', 'lcov'],

  clearMocks: true,
};
