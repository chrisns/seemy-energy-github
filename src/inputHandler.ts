import * as github from './github'
import * as self from './inputHandler'

import { SQSEvent, APIGatewayProxyEventV2 } from 'aws-lambda'
import SQS from 'aws-sdk/clients/sqs'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

export const sqsClient = new SQS()

export async function sqsPRQueueHandler(event: SQSEvent): Promise<DocumentClient.PutItemOutput[]> {
  const response = event.Records.map((record) => {
    const body = JSON.parse(record.body) as github.sqsPullMessage
    const octokit = github.getAuthenticatedOctokit(body.installation_id)
    return github.ETLPullRequest(body.owner, body.repo, body.pull_number, octokit)
  })
  return Promise.all(response)
}

export async function sqsIssueQueueHandler(event: SQSEvent): Promise<DocumentClient.PutItemOutput[]> {
  const response = event.Records.map((record) => {
    const body = JSON.parse(record.body) as github.sqsIssueMessage
    const octokit = github.getAuthenticatedOctokit(body.installation_id)
    return github.ETLIssue(body.owner, body.repo, body.issue_number, octokit)
  })
  return Promise.all(response)
}

interface sqsRepoMessage {
  owner: string
  repo: string
  installation_id: number
}

export async function httpQueryRepoHandler(event: APIGatewayProxyEventV2): Promise<string | undefined> {
  if (!event.pathParameters) {
    throw 'Not sure what to do here.'
  }

  const installationId = Number(event.pathParameters.installationId)
  const response = await self.sqsClient
    .sendMessage({
      MessageBody: JSON.stringify(<sqsRepoMessage>{
        owner: event.pathParameters.owner,
        repo: event.pathParameters.repo,
        installation_id: installationId,
      }),
      QueueUrl: process.env.REPO_QUEUE ? process.env.REPO_QUEUE : 'error',
    })
    .promise()
  return response.MessageId
}

export async function sqsRepoQueueHandler(event: SQSEvent): Promise<void[]> {
  const response = event.Records.map((record) => {
    const body = JSON.parse(record.body) as github.sqsIssueMessage
    const octokit = github.getAuthenticatedOctokit(body.installation_id)
    return github.queryRepo(body.owner, body.repo, octokit, body.installation_id)
  })
  return Promise.all(response)
}
