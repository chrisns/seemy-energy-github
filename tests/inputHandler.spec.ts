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
    await expect(mod.sqsPRQueueHandler(fixtures.pullSqsEvent)).resolves.toBeUndefined()
    // @ts-ignore
    expect(getAuthenticatedOctokit.mock.calls).toMatchSnapshot()

    // @ts-ignore
    return expect(ETLPullRequest.mock.calls).toMatchSnapshot()
  })

  test('sqsIssueQueueHandler', async () => {
    await expect(mod.sqsIssueQueueHandler(fixtures.issueSqsEvent)).resolves.toBeUndefined()
    // @ts-ignore
    expect(getAuthenticatedOctokit.mock.calls).toMatchSnapshot()

    // @ts-ignore
    return expect(ETLIssue.mock.calls).toMatchSnapshot()
  })

  test('httpQueryRepoHandler', async () => {
    await expect(mod.httpQueryRepoHandler(fixtures.httpAPIRepoQueryEvent)).resolves.toBeUndefined()
    // @ts-ignore
    expect(getAuthenticatedOctokit.mock.calls).toMatchSnapshot()

    // @ts-ignore
    return expect(ETLPullRequest.mock.calls).toMatchSnapshot()
  })
})
