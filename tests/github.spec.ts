jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        plugin: jest.fn().mockReturnThis(),
        paaginate: jest.fn().mockReturnThis(),
        // (){
        //   * [Symbol.iterator] (func, args) {
        //     yield func(args)
        //   },
        //   aaiterator: (func, args) => func(args),
        // },
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
          get: () =>
            <Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}']['response']['data']>(<unknown>issueGood),
        },
        pulls: {
          list: jest
            .fn()
            .mockReturnValue({ data: <Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data']>pullListGood }),
        },
        pull: {
          get: () =>
            <Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']['data']>(<unknown>pullGood),
        },
      }
    }),
  }
})

jest.mock('aws-sdk/clients/sqs', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendMessage: jest.fn().mockReturnThis(),
      promise: jest.fn().mockReturnValue(<SQS.SendMessageResult>{ MD5OfMessageBody: 'foobar' }),
    }
  })
})

import { setup } from 'jest-dynalite'
setup(__dirname)
import 'jest-dynalite/withDb'
import { Octokit } from '@octokit/rest'
import SQS from 'aws-sdk/clients/sqs'

import pullGood from './fixtures/pull-good.json'
import pullListGood from './fixtures/pulllist-good.json'
import issueGood from './fixtures/issue-good.json'

import { Endpoints } from '@octokit/types'

import * as mod from '../src/github'
const octokit = new Octokit()

describe('github', () => {
  test('ETLPullRequest queries pull request, persists to dynamodb', async () => {
    await expect(mod.ETLPullRequest('kubernetes', 'k8s.io', 1513, octokit)).resolves.toBeUndefined()
    const get = await mod.documentClient
      .get({
        TableName: 'pull',
        Key: {
          url: pullGood.base.repo.url,
          id: pullGood.number,
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
          url: issueGood.repository_url,
          id: issueGood.number,
        },
      })
      .promise()
    return expect(get).toMatchSnapshot()
  })

  test('Query repo, push all pull requests into SQS', async () => {
    await expect(mod.queryRepo('foo', 'bar', octokit))
  })

  test('Map pull request from list item to a SQS message', async () => {
    await expect(
      mod.pullListPRtoSQS(
        <Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][0]>(<unknown>pullListGood[0]),
      ),
    ).resolves.toMatchSnapshot()
    return expect(mod.sqsClient.sendMessage).toMatchSnapshot()
  })
})
