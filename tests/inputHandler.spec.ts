import { Octokit } from '@octokit/rest'
jest.mock('../src/github', () => {
  return {
    getAuthenticatedOctokit: jest.fn().mockReturnValue(Octokit),
    ETLPullRequest: jest.fn().mockReturnValue(Promise.resolve()),
    ETLIssue: jest.fn().mockReturnValue(Promise.resolve()),
    queryRepo: jest.fn().mockReturnValue(Promise.resolve()),
  }
})

import * as mod from '../src/inputHandler'
import fixtures from './fixtures'

import { getAuthenticatedOctokit, ETLPullRequest, ETLIssue } from '../src/github'

describe('inputHandler', () => {
  test('sqsPRQueueHandler', async () => {
    await expect(mod.sqsPRQueueHandler(fixtures.pullSqsEvent)).resolves.toMatchSnapshot()
    // @ts-expect-error mocked
    expect(getAuthenticatedOctokit.mock.calls[0]).toMatchSnapshot()

    // @ts-expect-error mocked
    return expect(ETLPullRequest.mock.calls[0]).toMatchSnapshot()
  })

  test('sqsIssueQueueHandler', async () => {
    await expect(mod.sqsIssueQueueHandler(fixtures.issueSqsEvent)).resolves.toMatchSnapshot()
    // @ts-expect-error mocked
    expect(getAuthenticatedOctokit.mock.calls[0]).toMatchSnapshot()

    // @ts-expect-error mocked
    return expect(ETLIssue.mock.calls[0]).toMatchSnapshot()
  })

  test.skip('httpQueryRepoHandler', async () => {
    await expect(mod.httpQueryRepoHandler(fixtures.httpAPIRepoQueryEvent)).resolves.toMatchSnapshot()
    // @ts-expect-error mocked
    expect(getAuthenticatedOctokit.mock.calls[0]).toMatchSnapshot()

    // @ts-expect-error mocked
    return expect(ETLPullRequest.mock.calls[0]).toMatchSnapshot()
  })
})
