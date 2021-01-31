import { Octokit } from '@octokit/rest'
// import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types'

// import paginateRest from '@octokit/plugin-paginate-rest'
import { createAppAuth } from '@octokit/auth-app'
import { formatPullRequest, formatIssue } from './formatter'

// const MyOctokit = Octokit.plugin(paginateRest)
// const octokit =

export function getAuthenticatedOctokit (): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.appId,
      type: 'app',
      privateKey: process.env.privateKey,
      installationId: process.env.installationId,
    },
  })
}

// type PullRequestListResponseDataType = GetResponseDataTypeFromEndpointMethod<typeof octokit.pulls.list>

// export async function queryRepo (owner: string, repo: string) {
//   // paginate through pull requests list
//   // queue each pull request to be queried
//   for await (const pulls of octokit.paginate.iterator(octokit.pulls.list, {
//     owner: owner,
//     repo: repo,
//     state: 'closed',
//     head: true,
//   })) {
//     await pulls.data.map(async pull => upsert_table(RemapPullRequestToRecordPullRequest(pull)))
//   }
// }
// import DocumentClient from 'aws-sdk/lib/dynamodb/document_client'
import DynamoDB from 'aws-sdk/clients/dynamodb'

const config = {
  convertEmptyValues: true,
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: 'local',
  }),
}

export const documentClient = new DynamoDB.DocumentClient(config)

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
