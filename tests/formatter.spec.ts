import * as mod from '../src/formatter'
import issueBad from './fixtures/issue-bad.json'
import issueGood from './fixtures/issue-good.json'
import pullGood from './fixtures/pull-good.json'
import pullBad from './fixtures/pull-bad.json'

describe('formatter', () => {
  describe('pull request', () => {
    test('should format a bad pull request', () =>
      expect(mod.formatPullRequest(JSON.parse(JSON.stringify(pullBad)))).toMatchSnapshot())
    test('should format a good pull request', () =>
      expect(mod.formatPullRequest(JSON.parse(JSON.stringify(pullGood)))).toMatchSnapshot())
  })
  describe('issue', () => {
    test('should format a good issue', () =>
      expect(mod.formatIssue(JSON.parse(JSON.stringify(issueGood)))).toMatchSnapshot())
    test('should format a bad issue', () =>
      expect(mod.formatIssue(JSON.parse(JSON.stringify(issueBad)))).toMatchSnapshot())
  })
})
