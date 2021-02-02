jest.mock('aws-sdk/clients/sqs', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendMessage: jest.fn().mockReturnThis(),
      promise: jest.fn().mockReturnValue(<SQS.SendMessageResult>{ MD5OfMessageBody: 'foobar' }),
    }
  })
})
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        plugin: jest.fn().mockReturnThis(),
        paginate: {
          iterator: (func, args) => {
            return {
              * [Symbol.iterator] () {
                yield func(args)
              },
            }
          },
        },
        issue: {
          get: () => fixtures.issueGood,
        },
        pulls: {
          list: jest.fn().mockReturnValue({
            data: fixtures.pullListGood,
          }),
        },
        pull: {
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
import SQS from 'aws-sdk/clients/sqs'

import fixtures from './fixtures'

import * as mod from '../src/github'
const octokit = new Octokit()

describe('github', () => {
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

  test('Query repo, push all pull requests into SQS', async () => {
    await expect(mod.queryRepo('foo', 'bar', octokit))
  })

  test('Map pull request from list item to a SQS message', async () => {
    await expect(mod.pullListPRtoSQS(fixtures.pullListGood[0])).resolves.toMatchSnapshot()
    return expect(mod.sqsClient.sendMessage).toMatchSnapshot()
  })
})
