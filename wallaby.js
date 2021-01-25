// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = function (w) {
  return {
    files: ['*.ts', 'tests/**/*.json', 'src/**/*.ts'],
    tests: ['tests/**/*.spec.ts'],
    env: {
      type: 'node',
    },
    testFramework: 'mocha',
    setup: function (w) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('dotenv').config();
      const mocha = w.testFramework
      mocha.timeout(30000)
    },
  }
}
