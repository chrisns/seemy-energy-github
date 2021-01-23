import * as mod from '../src/formatter'
import * as chai from 'chai'
const expect = chai.expect
import pullGoodRaw from './fixtures/pull-good.json'
import pullBadRaw from './fixtures/pull-bad.json'
const pullBad = JSON.parse(JSON.stringify(pullBadRaw))
const pullGood = JSON.parse(JSON.stringify(pullGoodRaw))
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
import 'mocha'

describe('query a repository', () => {
  // it('should return hello world', () => {
  //   const result = hello('alphagov', 'govuk-prototype-kit')
  //   return expect(result).to.eventually.equal({ aa: 'Affa' })
  // })
  it('should queue collecting all issues')
  it('should queue collecting all pull requests')
  it('should format a bad pull request', () =>
    expect(mod.formatPullRequest(pullBad)).to.eql({
      assignees: 0,
      author: 'palnabarun',
      body_length: 0,
      closed_at: 0,
      created_at: 1610130783000,
      id: 1513,
      merged_at: 0,
      merged_by: '',
      owner: 'kubernetes',
      repo: 'k8s.io',
      reviewers: 0,
      time_to_merge: 0,
      commits: 1,
      review_comments: 0,
      additions: 10,
      deletions: 5,
      changed_files: 2,
    }))
  it('should format a good pull request', () =>
    expect(mod.formatPullRequest(pullGood)).to.eql({
      assignees: 9,
      author: 'palnabarun',
      body_length: 336,
      closed_at: 1610132191000,
      created_at: 1610130783000,
      id: 1513,
      merged_at: 1610132190000,
      merged_by: 'k8s-ci-robot',
      owner: 'kubernetes',
      repo: 'k8s.io',
      reviewers: 2,
      time_to_merge: 1407000,
      commits: 1,
      review_comments: 0,
      additions: 10,
      deletions: 5,
      changed_files: 2,
    }))

  it('should format a status checks', () =>
    expect(mod.formatPullRequest(pullGood)).to.eql({
      assignees: 9,
      author: 'palnabarun',
      body_length: 336,
      closed_at: 1610132191000,
      created_at: 1610130783000,
      id: 1513,
      merged_at: 1610132190000,
      merged_by: 'k8s-ci-robot',
      owner: 'kubernetes',
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

describe('query a pull request', () => {
  it('should write the pull request to the dynamodb table')
  it('should queue retrieving the corresponding issue')
  it('should queue retrieving the corresponding diff')
  it('should queue retrieving the corresponding commits')
  it('should queue retrieving the corresponding reviews')
  it('should queue retrieving the corresponding review_comments')

  describe('query an issue from pull request issue', () => {
    it('should write the issue to the dynamodb table')
  })
})
