import * as mod from '../src/github'

test('getAuthenticatedOctokit', () => expect(mod.getAuthenticatedOctokit(1234)).toMatchSnapshot())
