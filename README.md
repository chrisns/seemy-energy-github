[![Coverage Status](https://coveralls.io/repos/github/seemy-energy/github/badge.svg?branch=master)](https://coveralls.io/github/seemy-energy/github?branch=master)
![ci](https://github.com/seemy-energy/github/workflows/ci/badge.svg)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.png?v=103)](https://opensource.org/licenses/mit-license.php)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/seemy-energy/github.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/seemy-energy/github/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/seemy-energy/github.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/seemy-energy/github/context:javascript)
[![Join channel](https://img.shields.io/badge/SLACK-seemy–energy.slack.com-red.svg?style=popout&logo=slack&logoColor=red)](https://join.slack.com/t/need-a-name-workspace/shared_invite/zt-f6s0bodx-_XDLTbZBGOMk4~TS5x7kTQ 'Join channel')

# Github querier

1. Queries the [Github API](http://developer.github.com/) for various bits of telemetry
1. Dispatches workload to [SQS](https://aws.amazon.com/sqs/) to divide the work up
1. Remaps the relevant data to a series of non vendor specific data model
1. Writes to [dynamodb](https://aws.amazon.com/dynamodb/) for later analysis

Query is done by _something else_ TBC, this just carries out ETL
