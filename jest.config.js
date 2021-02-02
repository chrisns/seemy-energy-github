module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ["dotenv/config"],
  coverageReporters: ['lcovonly', 'text'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testTimeout: 10 * 1000,
  collectCoverageFrom: [
    '**/*.ts',
    '**/*.js',
    '!.**',
    '!.*/**',
    '!tests/**',
    '!node_modules/**',
    '!coverage/**',
    '!jest.config.js',
    '!wallaby.js',
  ],
}
