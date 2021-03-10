import * as mod from '../src/github'

import { formatPullRequest, formatIssue } from '../src/formatter'
// import fixtures from './fixtures'

// import { getAuthenticatedOctokit, ETLPullRequest, ETLIssue } from '../src/github'

describe.skip('explore', () => {
  test('explore', async () => {
    const repository = await mod.makeQuery('kubernetes', 'k8s.io', parseInt(process.env.installationId ?? '0'))

    const prCursor = repository.pullRequests.pageInfo.endCursor
    const issueCursor = repository.issues.pageInfo.endCursor
    const pulls = repository.pullRequests.edges.map(formatPullRequest)
    const issues = repository.issues.edges.map(formatIssue)

    console.log(issueCursor, prCursor, pulls, issues)

    return expect(true).toBe(false)
  })
})
