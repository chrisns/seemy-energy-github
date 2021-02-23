import * as github from './github'

import { SQSEvent, APIGatewayProxyEventV2 } from 'aws-lambda'

export async function sqsPageQueueHandler (event: SQSEvent): Promise<unknown> {
  const response = event.Records.map(record => {
    const body = JSON.parse(record.body) as github.sqsPageMessage
    return github.flow(body.owner, body.repo, body.installationId, body.prCursor, body.issueCursor)
  })
  return Promise.all(response)
}

export async function httpQueryRepoHandler (event: APIGatewayProxyEventV2): Promise<string | undefined> {
  if (!event.pathParameters) {
    throw 'Not sure what to do here.'
  }

  const response = await github.queueNextPage(
    event.pathParameters.owner ?? 'TODO',
    event.pathParameters.repo ?? 'TODO',
    Number(event.pathParameters.installationId) ?? 0,
    null,
    null,
  )

  return response.MessageId
}
