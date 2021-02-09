import * as github from './github'
import * as self from './inputHandler'

import { SQSEvent, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import SQS from 'aws-sdk/clients/sqs'

export const sqsClient = new SQS()

export async function sqsPRQueueHandler (event: SQSEvent): Promise<any> {
  const response = event.Records.map(record => {
    const body = <github.sqsPullMessage>JSON.parse(record.body)
    const octokit = github.getAuthenticatedOctokit(body.installation_id)
    return github.ETLPullRequest(body.owner, body.repo, body.pull_number, octokit)
  })
  return Promise.all(response)
}

export async function sqsIssueQueueHandler (event: SQSEvent): Promise<any> {
  const response = event.Records.map(record => {
    const body = <github.sqsIssueMessage>JSON.parse(record.body)
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

export async function httpQueryRepoHandler (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const installationId = Number(event.pathParameters.installationId)
  return self.sqsClient
    .sendMessage({
      MessageBody: JSON.stringify(<sqsRepoMessage>{
        owner: event.pathParameters.owner,
        repo: event.pathParameters.repo,
        installation_id: installationId,
      }),
      QueueUrl: process.env.REPO_QUEUE ? process.env.REPO_QUEUE : 'error',
    })
    .promise()
}

export async function sqsRepoQueueHandler (event: SQSEvent): Promise<any> {
  const response = event.Records.map(record => {
    const body = <github.sqsIssueMessage>JSON.parse(record.body)
    const octokit = github.getAuthenticatedOctokit(body.installation_id)
    return github.queryRepo(body.owner, body.repo, octokit, body.installation_id)
  })
  return Promise.all(response)
}
