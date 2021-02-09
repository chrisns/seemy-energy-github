const sendmesage = jest.fn().mockReturnValue({
  promise: jest.fn().mockReturnValue(<SQS.SendMessageResult>{ MD5OfMessageBody: 'foobar' }),
})
jest.mock('aws-sdk/clients/sqs', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendMessage: sendmesage,
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
          listForRepo: jest.fn().mockReturnValue({
            data: fixtures.issueListGood.slice(0, 3),
          }),
        },
        pulls: {
          list: jest.fn().mockReturnValue({
            data: fixtures.pullListGood.slice(0, 3),
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
  beforeEach(() => {
    sendmesage.mockClear()
  })
  test('Map pull request from list item to a SQS message', async () => {
    process.env.PR_QUEUE = 'something'
    await expect(mod.pullListPRtoSQS(fixtures.pullListGood[0], 1234)).resolves.toMatchSnapshot()
    return expect(sendmesage.mock.calls[0]).toMatchSnapshot()
  })

  test('Map issue from list item to a SQS message', async () => {
    process.env.ISSUE_QUEUE = 'something'
    await expect(mod.issueListIssuetoSQS(fixtures.issueListGood[0], 1234)).resolves.toMatchSnapshot()
    return expect(sendmesage.mock.calls[0]).toMatchSnapshot()
  })

  test('Query repo, push all into SQS', async () => {
    const issueListIssuetoSQS = jest.spyOn(mod, 'issueListIssuetoSQS')
    const pullListPRtoSQS = jest.spyOn(mod, 'pullListPRtoSQS')

    await expect(mod.queryRepo('foo', 'bar', octokit, 1234)).resolves.toBeUndefined()

    await expect(pullListPRtoSQS.mock.calls[0]).toMatchSnapshot()
    await expect(issueListIssuetoSQS.mock.calls[0]).toMatchSnapshot()

    issueListIssuetoSQS.mockRestore()
    pullListPRtoSQS.mockRestore()
  })
})
