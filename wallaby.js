// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = function (w) {
  return {
    files: ['*.ts', 'tests/**/*.json', 'src/**/*.ts', 'tests/jest-dynalite-config.js'],
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
    workers: {
      initial: 1,
      regular: 1
    },
  }
}
