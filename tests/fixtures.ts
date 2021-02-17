import pullGraphQLSnippet from './fixtures/pullGraphQLSnippet.json'
import issueGraphQLSnippet from './fixtures/issueGraphQLSnippet.json'

function jsonify (input) {
  return <unknown>JSON.parse(JSON.stringify(input))
}

export default {
  pullGraphQLSnippet: jsonify(pullGraphQLSnippet),
  issueGraphQLSnippet: jsonify(issueGraphQLSnippet),
}
