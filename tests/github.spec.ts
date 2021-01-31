jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        issue: {
          get: () => <IssuesGetResponseDataType>(<unknown>issueGoodRaw),
        },
        pull: {
          get: () => <PullRequestGetResponseDataType>(<unknown>pullGoodRaw),
        },
      }
    }),
  }
})

import { setup } from 'jest-dynalite'
setup(__dirname)
import 'jest-dynalite/withDb'
import { Octokit } from '@octokit/rest'

import pullGoodRaw from './fixtures/pull-good.json'
import issueGoodRaw from './fixtures/issue-good.json'

import { Endpoints } from '@octokit/types'

type PullRequestGetResponseDataType = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']
type IssuesGetResponseDataType = Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}']['response']

import * as mod from '../src/github'
const octokit = new Octokit()

describe('github', () => {
  test('ETLPullRequest queries pull request, persists to dynamodb', async () => {
    await expect(mod.ETLPullRequest('kubernetes', 'k8s.io', 1513, octokit)).resolves.toBeUndefined()
    const get = await mod.documentClient
      .get({
        TableName: 'pull',
        Key: {
          url: pullGoodRaw.base.repo.url,
          id: pullGoodRaw.number,
        },
      })
      .promise()
    return expect(get).toStrictEqual({
      Item: {
        additions: 10,
        assignees: 9,
        author: 'palnabarun',
        url: 'https://api.github.com/repos/kubernetes/k8s.io',
        body_length: 336,
        changed_files: 2,
        closed_at: 1610132191000,
        commits: 1,
        created_at: 1610130783000,
        deletions: 5,
        holder: 'kubernetes',
        id: 1513,
        merged_at: 1610132190000,
        merged_by: 'k8s-ci-robot',
        repo: 'k8s.io',
        review_comments: 0,
        reviewers: 2,
        time_to_merge: 1407000,
      },
    })
  })

  test('ETLIssue queries issue, persists to dynamodb', async () => {
    await expect(mod.ETLIssue('kubernetes', 'kubernetes', 56903, octokit)).resolves.toBeUndefined()
    const get = await mod.documentClient
      .get({
        TableName: 'issue',
        Key: {
          url: issueGoodRaw.repository_url,
          id: issueGoodRaw.number,
        },
      })
      .promise()
    return expect(get).toStrictEqual({
      Item: {
        assignees: 0,
        author: 'mikksoone',
        url: 'https://api.github.com/repos/kubernetes/kubernetes',
        body_length: 2733,
        closed_at: 1550815042000,
        created_at: 1512598487000,
        closed_by: 'thockin',
        holder: 'kubernetes',
        comments: 253,
        id: 56903,
        repo: 'kubernetes',
        time_to_close: 38216555000,
      },
    })
  })
})
