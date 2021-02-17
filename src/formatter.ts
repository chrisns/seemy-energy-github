import { IssueEdge, PullRequestEdge } from '@octokit/graphql-schema'
export interface RecordPullRequest {
  repo: string
  id: number
  url: string
  holder: string
  author: string
  created_at: number
  closed_at: number
  // merged_at: number
  assignees: number
  reviewers: number
  body_length: number
  // time_to_merge: number
  merged_by: string
  commits: number
  // review_comments: number
  additions: number
  deletions: number
  changed_files: number
  time_to_close: number
}

export function formatPullRequest (pull: PullRequestEdge): RecordPullRequest | null {
  try {
    return {
      repo: pull.node.repository.name,
      id: pull.node.number,
      url: pull.node.repository.url,
      holder: pull.node.repository.owner.login,
      author: pull.node.author.login,
      commits: pull.node.commits.totalCount,
      // review_comments
      additions: pull.node.additions,
      deletions: pull.node.deletions,
      changed_files: pull.node.changedFiles,
      merged_by: pull.node.closedBy.nodes[0].actor.login,
      created_at: Date.parse(pull.node.createdAt),
      closed_at: Date.parse(pull.node.closedAt),
      // merged_at
      assignees: pull.node.assignees.totalCount,
      reviewers: pull.node.reviews?.totalCount ?? 0,
      body_length: pull.node.body.length,
      time_to_close: Date.parse(pull.node.closedAt) - Date.parse(pull.node.createdAt),
    }
  } catch (er) {
    console.error(er)
    return null
  }
}

export interface RecordIssue {
  repo: string
  id: number
  url: string
  holder: string
  author: string
  created_at: number
  closed_at: number
  assignees: number
  body_length: number
  time_to_close: number
  closed_by: string
  comments: number
}

export function formatIssue (issue: IssueEdge): RecordIssue | null {
  try {
    return {
      repo: issue.node.repository.name,
      id: issue.node.number,
      url: issue.node.repository.url,
      holder: issue.node.repository.owner.login,
      author: issue.node.author?.login,
      comments: issue.node.comments.totalCount,
      closed_by: issue.node.closedBy.nodes[0].actor.login,
      created_at: Date.parse(issue.node.createdAt),
      closed_at: Date.parse(issue.node.closedAt),
      assignees: issue.node.assignees.totalCount,
      body_length: issue.node.body.length,
      time_to_close: Date.parse(issue.node.closedAt) - Date.parse(issue.node.createdAt),
    }
  } catch (er) {
    console.error(er)
    return null
  }
}
