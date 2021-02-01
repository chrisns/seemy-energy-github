import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { formatPullRequest, formatIssue } from './formatter'
const { paginateRest } = require('@octokit/plugin-paginate-rest')
import { Endpoints } from '@octokit/types'

import SQS from 'aws-sdk/clients/sqs'

import DynamoDB from 'aws-sdk/clients/dynamodb'

export function getAuthenticatedOctokit (installationId: number): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.appId,
      type: 'app',
      privateKey: process.env.privateKey,
      installationId: installationId,
    },
  }).plugin(paginateRest)
}

interface sqsPullMessage {
  owner: string
  repo: string
  pull_number: number
  installation_id: number
}

export async function queryRepo (owner: string, repo: string, octokit: Octokit) {
  for await (const pulls of octokit.paginate.iterator(octokit.pulls.list, {
    owner: owner,
    repo: repo,
  })) {
    return await pulls.data.map(pullListPRtoSQS)
  }
}

export async function pullListPRtoSQS (
  pull: Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][0],
): Promise<SQS.SendMessageResult> {
  return sqsClient
    .sendMessage({
      MessageBody: JSON.stringify(<sqsPullMessage>{
        owner: pull.base.user.login,
        pull_number: pull.number,
        repo: pull.base.repo.url,
        installation_id: 1234,
      }),
      MessageDeduplicationId: `${pull.base.user.login}/${pull.base.repo.url}/${pull.number}`,
      MessageGroupId: `${pull.base.user.login}/${pull.base.repo.url}`,
      QueueUrl: process.env.PR_QUEUE,
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
): Promise<void> {
  const pull = await octokit.pull.get({ owner, repo, pull_number })
  const formatted = formatPullRequest(pull)
  await upsert_table(formatted, 'pull')
  return
}

export async function ETLIssue (owner: string, repo: string, issue_number: number, octokit: Octokit): Promise<void> {
  const issue = await octokit.issue.get({ owner, repo, issue_number })
  const formatted = formatIssue(issue)
  await upsert_table(formatted, 'issue')
  return
}
