import * as self from './github'
import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { formatPullRequest, formatIssue } from './formatter'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import { throttling } from '@octokit/plugin-throttling'
import { retry } from '@octokit/plugin-retry'
import { Endpoints } from '@octokit/types'
import SQS from 'aws-sdk/clients/sqs'
import DynamoDB from 'aws-sdk/clients/dynamodb'

export function getAuthenticatedOctokit (installationId: number): Octokit {
  const MyOctokit = Octokit.plugin(paginateRest, throttling, retry)
  const octokit = new MyOctokit({
    log: console,
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.appId,
      type: 'app',
      privateKey: process.env.privateKey,
      installationId: installationId,
    },
    throttle: {
      onRateLimit: (retryAfter, options) => {
        octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`)
        if (options.request.retryCount === 0) {
          octokit.log.info(`Retrying after ${retryAfter} seconds!`)
          return true
        }
      },
      onAbuseLimit: (retryAfter, options) => {
        octokit.log.error(`Abuse detected for request ${options.method} ${options.url}`)
      },
    },
  })
  return octokit
}

export interface sqsPullMessage {
  owner: string
  repo: string
  pull_number: number
  installation_id: number
}

export interface sqsIssueMessage {
  owner: string
  repo: string
  issue_number: number
  installation_id: number
}

export async function queryRepo (owner: string, repo: string, octokit: Octokit, installationId: number): Promise<void> {
  for await (const pulls of octokit.paginate.iterator(octokit.pulls.list, {
    owner: owner,
    repo: repo,
    per_page: 100,
  })) {
    await Promise.all(
      pulls.data.map(pull =>
        self.pullListPRtoSQS(<Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][0]>pull, installationId),
      ),
    )
  }

  for await (const issues of octokit.paginate.iterator(octokit.issues.listForRepo, {
    owner: owner,
    repo: repo,
    per_page: 100,
  })) {
    await Promise.all(
      issues.data.map(issue =>
        self.issueListIssuetoSQS(
          <Endpoints['GET /repos/{owner}/{repo}/issues']['response']['data'][0]>issue,
          installationId,
        ),
      ),
    )
  }
}

export async function issueListIssuetoSQS (
  issue: Endpoints['GET /repos/{owner}/{repo}/issues']['response']['data'][0],
  installationId: number,
): Promise<SQS.SendMessageResult> {
  return self.sqsClient
    .sendMessage({
      MessageBody: JSON.stringify(<sqsIssueMessage>{
        owner: issue.repository_url.split('/').reverse()[0],
        issue_number: issue.number,
        repo: issue.repository_url.split('/').reverse()[1],
        installation_id: installationId,
      }),
      QueueUrl: process.env.ISSUE_QUEUE ? process.env.ISSUE_QUEUE : 'error',
    })
    .promise()
}

export async function pullListPRtoSQS (
  pull: Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][0],
  installationId: number,
): Promise<SQS.SendMessageResult> {
  return self.sqsClient
    .sendMessage({
      MessageBody: JSON.stringify(<sqsPullMessage>{
        owner: pull.base && pull.base.user && pull.base.user.login ? pull.base.user.login : 'unknown',
        pull_number: pull.number,
        repo: pull.base && pull.base.repo && pull.base.repo.name ? pull.base.repo.name : 'unknown',
        installation_id: installationId,
      }),
      QueueUrl: process.env.PR_QUEUE ? process.env.PR_QUEUE : 'error',
    })
    .promise()
}

const config = {
  convertEmptyValues: true,
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: 'local',
  }),
}

export const documentClient = new DynamoDB.DocumentClient(config)

export const sqsClient = new SQS()

const upsert_table = async (payload, table) =>
  documentClient
    .put({
      Item: payload,
      TableName: table,
    })
    .promise()

export async function ETLPullRequest (
  owner: string,
  repo: string,
  pull_number: number,
  octokit: Octokit,
): Promise<any> {
  const pull = await octokit.pulls.get({ owner, repo, pull_number })

  const formatted = formatPullRequest(pull.data)
  return upsert_table(formatted, process.env.PULL_TABLE)
}

export async function ETLIssue (owner: string, repo: string, issue_number: number, octokit: Octokit): Promise<any> {
  const issue = <Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}']['response']>(
    await octokit.issues.get({ owner, repo, issue_number })
  )
  const formatted = formatIssue(issue.data)
  return upsert_table(formatted, process.env.ISSUE_TABLE)
}
