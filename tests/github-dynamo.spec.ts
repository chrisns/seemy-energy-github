jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        issues: {
          get: () => fixtures.issueGood,
        },
        pulls: {
          get: () => fixtures.pullGood,
        },
      }
    }),
  }
})

import { setup } from 'jest-dynalite'
setup(__dirname)
import 'jest-dynalite/withDb'
import { Octokit } from '@octokit/rest'

import fixtures from './fixtures'

import * as mod from '../src/github'

const octokit = new Octokit()

describe('github dynamo', () => {
  test('ETLPullRequest queries pull request, persists to dynamodb', async () => {
    await expect(mod.ETLPullRequest('kubernetes', 'k8s.io', 1513, octokit)).resolves.toBeUndefined()
    const get = await mod.documentClient
      .get({
        TableName: 'pull',
        Key: {
          url: fixtures.pullGood.base.repo.url,
          id: fixtures.pullGood.number,
        },
      })
      .promise()
    return expect(get).toMatchSnapshot()
  })

  test('ETLIssue queries issue, persists to dynamodb', async () => {
    await expect(mod.ETLIssue('kubernetes', 'kubernetes', 56903, octokit)).resolves.toBeUndefined()
    const get = await mod.documentClient
      .get({
        TableName: 'issue',
        Key: {
          url: fixtures.issueGood.repository_url,
          id: fixtures.issueGood.number,
        },
      })
      .promise()
    return expect(get).toMatchSnapshot()
  })
})
