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
        paginate: {
          iterator: (func, args) => {
            return {
              * [Symbol.iterator] () {
                yield func(args)
              },
            }
          },
        },
        issues: {
          list: jest.fn().mockReturnValue({
            data: fixtures.issueListGood,
          }),
        },
        pulls: {
          list: jest.fn().mockReturnValue({
            data: fixtures.pullListGood,
          }),
        },
      }
    }),
  }
})

import { Octokit } from '@octokit/rest'
import SQS from 'aws-sdk/clients/sqs'

import fixtures from './fixtures'

import * as mod from '../src/github'

const octokit = new Octokit()

describe('github', () => {
  test('Query repo, push all pull requests into SQS', async () => {
    const issueListPRtoSQS = jest.spyOn(mod, 'issueListPRtoSQS')
    const pullListPRtoSQS = jest.spyOn(mod, 'pullListPRtoSQS')

    await expect(mod.queryRepo('foo', 'bar', octokit)).resolves.toBeUndefined()
    await expect(pullListPRtoSQS.mock.calls).toMatchSnapshot()
    await expect(issueListPRtoSQS.mock.calls).toMatchSnapshot()

    issueListPRtoSQS.mockRestore()
    pullListPRtoSQS.mockRestore()
  })

  test('Map pull request from list item to a SQS message', async () => {
    await expect(mod.pullListPRtoSQS(fixtures.pullListGood[0])).resolves.toMatchSnapshot()
    return expect(mod.sqsClient.sendMessage).toMatchSnapshot()
  })
})
