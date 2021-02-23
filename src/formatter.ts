import { IssueEdge, PullRequestEdge } from '@octokit/graphql-schema'
export interface RecordPullRequest {
  repo: string
  id: number
  url: string
  holder?: string
  author?: string
  created_at: number
  closed_at?: number
  // merged_at: number
  assignees: number
  reviewers: number
  body_length: number
  // time_to_merge: number
  merged_by?: string
  commits?: number
  // review_comments: number
  additions?: number
  deletions?: number
  changed_files?: number
  time_to_close?: number
}

export function formatPullRequest (pull: PullRequestEdge): RecordPullRequest | null {
  try {
    return {
      repo: <string>pull.node?.repository.name,
      id: <number>pull.node?.number,
      url: pull.node?.repository?.url,
      holder: pull.node?.repository?.owner?.login,
      author: pull.node?.author?.login,
      commits: pull.node?.commits.totalCount,
      // review_comments
      additions: pull.node?.additions,
      deletions: pull.node?.deletions,
      changed_files: pull.node?.changedFiles,
      // @ts-expect-error
      merged_by: pull.node?.closedBy?.nodes[0]?.actor?.login,
      created_at: <number>Date.parse(pull.node?.createdAt),
      closed_at: pull.node?.closedAt ? Date.parse(pull.node.closedAt) : undefined,
      // merged_at
      assignees: pull.node?.assignees.totalCount ?? 0,
      reviewers: pull.node?.reviews?.totalCount ?? 0,
      body_length: pull.node?.body?.length ?? 0,
      time_to_close:
        pull.node?.closedAt && pull.node?.createdAt
          ? Date.parse(pull.node?.closedAt) - Date.parse(pull.node.createdAt)
          : undefined,
    }
  } catch (er) {
    console.error(er)
    return null
  }
}

export interface RecordIssue {
  repo: string
  id: number
  url?: string
  holder?: string
  author?: string
  created_at: number
  closed_at?: number
  assignees: number
  body_length: number
  time_to_close?: number
  closed_by?: string
  comments: number
}

export function formatIssue (issue: IssueEdge): RecordIssue | null {
  try {
    return {
      repo: <string>issue.node?.repository.name,
      id: <number>issue.node?.number,
      url: issue.node?.repository?.url,
      holder: issue.node?.repository?.owner?.login,
      author: issue.node?.author?.login,
      comments: issue.node?.comments.totalCount ?? 0,
      // @ts-expect-error
      closed_by: issue.node?.closedBy?.nodes[0]?.actor?.login,
      created_at: <number>Date.parse(issue.node?.createdAt),
      closed_at: issue.node?.closedAt ? Date.parse(issue.node.closedAt) : undefined,
      assignees: issue.node?.assignees.totalCount ?? 0,
      body_length: issue.node?.body?.length ?? 0,
      time_to_close:
        issue.node?.closedAt && issue.node?.createdAt
          ? Date.parse(issue.node?.closedAt) - Date.parse(issue.node.createdAt)
          : undefined,
    }
  } catch (er) {
    console.error(er)
    return null
  }
}
