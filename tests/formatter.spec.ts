import * as mod from '../src/formatter'
import issueBadRaw from './fixtures/issue-bad.json'
import issueGoodRaw from './fixtures/issue-good.json'
import pullGoodRaw from './fixtures/pull-good.json'
import pullBadRaw from './fixtures/pull-bad.json'
const issueBad = JSON.parse(JSON.stringify(issueBadRaw))
const issueGood = JSON.parse(JSON.stringify(issueGoodRaw))
const pullBad = JSON.parse(JSON.stringify(pullBadRaw))
const pullGood = JSON.parse(JSON.stringify(pullGoodRaw))

describe('formatter', () => {
  describe('pull request', () => {
    test('should format a bad pull request', () => expect(mod.formatPullRequest(pullBad)).toMatchSnapshot())
    test('should format a good pull request', () => expect(mod.formatPullRequest(pullGood)).toMatchSnapshot())
  })
  describe('issue', () => {
    test('should format a good issue', () => expect(mod.formatIssue(issueGood)).toMatchSnapshot())
    test('should format a bad issue', () => expect(mod.formatIssue(issueBad)).toMatchSnapshot())
  })
})
