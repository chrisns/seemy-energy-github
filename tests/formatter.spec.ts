import * as mod from '../src/formatter'
import fixtures from './fixtures'

describe('formatter', () => {
  describe('pull request', () => {
    test('should format a good pull request', () =>
      // @ts-expect-error expect error
      expect(mod.formatPullRequest(fixtures.pullGraphQLSnippet)).toMatchSnapshot())
    test.todo('should format a bad pull request')
  })
  describe('issue', () => {
      // @ts-expect-error expect error
      test('should format a good issue', () => expect(mod.formatIssue(fixtures.issueGraphQLSnippet)).toMatchSnapshot())
      test.todo('should format a bad issue')
    })
})
