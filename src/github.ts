import { createAppAuth } from '@octokit/auth-app'
import { graphql } from '@octokit/graphql'
import { formatIssue, formatPullRequest, RecordIssue, RecordPullRequest } from './formatter'
import SQS from 'aws-sdk/clients/sqs'
import { Repository } from '@octokit/graphql-schema'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

export const sqsClient = new SQS()
export const documentClient = new DocumentClient()

export function getAuthenticatedOctokit (installationId: number): typeof graphql {
  const auth = createAppAuth({
    appId: process.env.appId ?? 0,
    privateKey: process.env.privateKey ?? 'none',
    installationId: installationId ?? 0,
  })
  return graphql.defaults({
    request: {
      hook: auth.hook,
    },
  })
}

export async function makeQuery (
  owner: string,
  repo: string,
  installationId: number,
  count = 25,
  prCursor: string | null = null,
  issueCursor: string | null = null,
  graphql = getAuthenticatedOctokit(installationId),
): Promise<Repository> {
  const { repository, errors } = await graphql({
    query: `#graphql
      query last($owner: String!, $repo: String!, $num: Int = 1, $prCursor: String, $issueCursor: String) {
        repository(owner: $owner, name: $repo) {

          pullRequests(first: $num, after: $prCursor, states: CLOSED) {
            # totalCount
            pageInfo {
              endCursor
            }
            edges {
              node {
                number
                additions
                deletions
                changedFiles
                repository {
                  name
                  owner {
                    login
                  }
                  url
                }
                commits {
                  totalCount
                }
                author {
                  login
                }
                comments {
                  totalCount
                }
                createdAt
                closedAt
                assignees {
                  totalCount
                }
                reviews {
                  totalCount
                }
                body
                closedBy: timelineItems(last: 1, itemTypes: CLOSED_EVENT) {
                  nodes {
                    ... on ClosedEvent {
                      actor {
                        login
                      }
                    }
                  }
                }
              }
            }
          }

          issues(first: $num, after: $issueCursor, states: CLOSED) {
            # totalCount
            pageInfo {
              endCursor
            }
            edges {
              node {
                number
                repository {
                  name
                  owner {
                    login
                  }
                  url
                }
                author {
                  login
                }
                comments {
                  totalCount
                }
                createdAt
                closedAt
                assignees {
                  totalCount
                }
                body
                closedBy: timelineItems(last: 1, itemTypes: CLOSED_EVENT) {
                  nodes {
                    ... on ClosedEvent {
                      actor {
                        login
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
    owner,
    repo,
    num: count,
    prCursor,
    issueCursor,
  })
  if (errors?.length > 0) throw errors[0].message
  return repository
}

interface FlowResponse {
  persistedPulls: DocumentClient.BatchWriteItemOutput
  persistedIssues: DocumentClient.BatchWriteItemOutput
  nextPage: SQS.SendMessageResult
}

export async function flow (
  owner: string,
  repo: string,
  installationId: number,
  prCursor: string | null = null,
  issueCursor: string | null = null,
): Promise<FlowResponse> {
  const repository = await makeQuery(owner, repo, installationId, undefined, prCursor, issueCursor)

  const nextPage = await queueNextPage(
    owner,
    repo,
    installationId,
    repository.pullRequests.pageInfo.endCursor,
    repository.issues.pageInfo.endCursor,
  )
  const pulls = repository.pullRequests.edges.map(formatPullRequest)
  const issues = repository.issues.edges.map(formatIssue)
  const persistedPulls = await persistBatchOfPulls(pulls)
  const persistedIssues = await persistBatchOfIssues(issues)
  return {
    nextPage,
    persistedPulls,
    persistedIssues,
  }
}

export async function persistBatchOfIssues (issues: RecordIssue[]): Promise<DocumentClient.BatchWriteItemOutput> {
  return upsert_table(issues, process.env.ISSUE_TABLE ?? 'ISSUE_TABLE')
}
export async function persistBatchOfPulls (pulls: RecordPullRequest[]): Promise<DocumentClient.BatchWriteItemOutput> {
  return upsert_table(pulls, process.env.PULL_TABLE ?? 'PULL_TABLE')
}

export async function upsert_table (
  payload: (RecordIssue | RecordPullRequest)[],
  table: string,
): Promise<DocumentClient.BatchWriteItemOutput> {
  const items = payload.map((item: RecordIssue | RecordPullRequest) => {
    return { PutRequest: { Item: item } }
  })
  return documentClient.batchWrite({ RequestItems: { [table]: items } }).promise()
}

export async function queueNextPage (
  owner: string,
  repo: string,
  installationId: number,
  prCursor: string | null = null,
  issueCursor: string | null = null,
): Promise<SQS.SendMessageResult> {
  return sqsClient
    .sendMessage({
      MessageBody: JSON.stringify(<sqsPageMessage>{
        owner,
        repo,
        installationId,
        prCursor,
        issueCursor,
      }),
      MessageGroupId: installationId.toString(),
      QueueUrl: process.env.PAGE_QUEUE ?? 'page_queue',
    })
    .promise()
}

export interface sqsPageMessage {
  owner: string
  repo: string
  installationId: number
  prCursor: string | null
  issueCursor: string | null
}
