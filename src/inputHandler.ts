import * as github from './github'
import { SQSEvent, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

export async function sqsPRQueueHandler (event: SQSEvent): Promise<void> {
  await event.Records.forEach(async record => {
    const body = <github.sqsPullMessage>JSON.parse(record.body)
    const octokit = github.getAuthenticatedOctokit(body.installation_id)
    await github.ETLPullRequest(body.owner, body.repo, body.pull_number, octokit)
  })
  return
}

export async function sqsIssueQueueHandler (event: SQSEvent): Promise<void> {
  await event.Records.forEach(async record => {
    const body = <github.sqsIssueMessage>JSON.parse(record.body)
    const octokit = github.getAuthenticatedOctokit(body.installation_id)
    await github.ETLPullRequest(body.owner, body.repo, body.issue_number, octokit)
  })
  return
}

export async function httpQueryRepoHandler (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const octokit = github.getAuthenticatedOctokit(Number(event.pathParameters.installationId))
  await github.queryRepo(event.pathParameters.owner, event.pathParameters.repo, octokit)
  return
}
