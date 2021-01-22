module.exports = function (w) {

  return {
    files: [
      '*.ts',
      'tests/**/*.json',
      'src/**/*.ts'
    ],
    tests: [
      'tests/**/*.spec.ts'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'mocha',
    setup: function (w) {
      var mocha = w.testFramework;
      mocha.timeout(30000);
    }
  }
}