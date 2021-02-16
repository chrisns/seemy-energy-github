// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = function (w) {
  return {
    files: [
      '*.ts',
      'tests/**/*.json',
      'src/**/*.ts',
      'tests/jest-dynalite-config.js',
      'tests/fixtures.ts',
      { pattern: '.env', instrument: false },
    ],
    tests: ['tests/**/*.spec.ts'],
    env: {
      type: 'node',
    },
    testFramework: 'jest',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setup: function (w) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('dotenv').config()

    },
  }
}
