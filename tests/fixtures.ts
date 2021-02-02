import { Endpoints } from '@octokit/types'

import issueBad from './fixtures/issue-bad.json'
import issueGood from './fixtures/issue-good.json'
import pullGood from './fixtures/pull-good.json'
import pullBad from './fixtures/pull-bad.json'
import pullListGood from './fixtures/pulllist-good.json'
import issueListGood from './fixtures/issuelist-good.json'

function jsonify (input) {
  return <unknown>JSON.parse(JSON.stringify(input))
}

export default {
  issueBad: <Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}']['response']['data']>jsonify(issueBad),
  issueGood: <Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}']['response']['data']>jsonify(issueGood),
  pullGood: <Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']['data']>jsonify(pullGood),
  pullBad: <Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']['data']>jsonify(pullBad),
  pullListGood: <Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data']>jsonify(pullListGood),
  issueListGood: <Endpoints['GET /repos/{owner}/{repo}/issues']['response']['data']>jsonify(issueListGood),
}
