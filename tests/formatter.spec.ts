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
    test('should format a bad pull request', () =>
      expect(mod.formatPullRequest(pullBad)).toStrictEqual({
        assignees: 0,
        author: 'palnabarun',
        body_length: 0,
        closed_at: 0,
        created_at: 1610130783000,
        id: 1513,
        merged_at: 0,
        merged_by: '',
        url: 'https://api.github.com/repos/kubernetes/k8s.io',
        holder: 'kubernetes',
        repo: 'k8s.io',
        reviewers: 0,
        time_to_merge: 0,
        commits: 1,
        review_comments: 0,
        additions: 10,
        deletions: 5,
        changed_files: 2,
      }))
    test('should format a good pull request', () =>
      expect(mod.formatPullRequest(pullGood)).toStrictEqual({
        assignees: 9,
        author: 'palnabarun',
        body_length: 336,
        closed_at: 1610132191000,
        created_at: 1610130783000,
        id: 1513,
        url: 'https://api.github.com/repos/kubernetes/k8s.io',
        merged_at: 1610132190000,
        merged_by: 'k8s-ci-robot',
        holder: 'kubernetes',
        repo: 'k8s.io',
        reviewers: 2,
        time_to_merge: 1407000,
        commits: 1,
        review_comments: 0,
        additions: 10,
        deletions: 5,
        changed_files: 2,
      }))
  })
  describe('issue', () => {
    test('should format a good issue', () =>
      expect(mod.formatIssue(issueGood)).toStrictEqual({
        assignees: 0,
        author: 'mikksoone',
        url: 'https://api.github.com/repos/kubernetes/kubernetes',
        body_length: 2733,
        closed_at: 1550815042000,
        created_at: 1512598487000,
        id: 56903,
        comments: 253,
        closed_by: 'thockin',
        holder: 'kubernetes',
        repo: 'kubernetes',
        time_to_close: 38216555000,
      }))
    test('should format a bad issue', () =>
      expect(mod.formatIssue(issueBad)).toStrictEqual({
        assignees: 2,
        author: 'mikksoone',
        url: 'https://api.github.com/repos/kubernetes/kubernetes',
        body_length: 0,
        closed_at: 0,
        created_at: 1512598487000,
        id: 56903,
        comments: 253,
        closed_by: '',
        holder: 'kubernetes',
        repo: 'kubernetes',
        time_to_close: 0,
      }))
  })
})
