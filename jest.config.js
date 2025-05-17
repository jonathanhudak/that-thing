/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Look for tests in the src directory
  testMatch: ['**/*.test.ts'], // Match .test.ts files
  moduleNameMapper: {
    // If using path aliases in tsconfig.json, map them here
    // Example: '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Coverage reporting
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8', // or 'babel'
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts', // Don't include test files in coverage
    '!src/index.ts', // Example: exclude main index if it's just an entry point
  ],
};
