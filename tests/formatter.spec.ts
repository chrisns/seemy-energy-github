import * as mod from '../src/formatter'
import fixtures from './fixtures'

describe('formatter', () => {
  describe('pull request', () => {
    test('should format a bad pull request', () => expect(mod.formatPullRequest(fixtures.pullBad)).toMatchSnapshot())
    test('should format a good pull request', () => expect(mod.formatPullRequest(fixtures.pullGood)).toMatchSnapshot())
  })
  describe('issue', () => {
    test('should format a good issue', () => expect(mod.formatIssue(fixtures.issueGood)).toMatchSnapshot())
    test('should format a bad issue', () => expect(mod.formatIssue(fixtures.issueBad)).toMatchSnapshot())
  })
})
