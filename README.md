# DevPulse

Developers don't lack data. Jira, GitHub, CI/CD pipelines already generate more numbers than anyone looks at. The problem is the gap between "your lead time is 3.8 days" and knowing whether that's bad, why it happened, or what to change.

This project is an attempt to close that gap.


## What it does

Takes five developer productivity metrics, works out what's likely causing them, and surfaces a plain-English diagnosis with two specific next steps.

Instead of generic advice, the interpretation references your actual numbers such as review wait time, PR size, bug root causes, and compares them against your teammates so context isn't missing.


## How the reasoning works

There's no ML here. The core is a pure-function reasoning engine that classifies your month into one of four patterns: Healthy Flow, Watch Bottlenecks, Quality Watch, Needs Review, and generates interpretation text from if/else rules I can read and explain.

A few things it does that a standard dashboard doesn't:

**Peer benchmarking.** Your lead time card shows the team average underneath it. 3.8 days reads differently when your teammates are at 2.1 vs 5.2.

**Contradiction detection.** Fast cycle time but slow lead time usually means the bottleneck is post-code, review queue or deploy pipeline, not development itself. The logic catches combinations like this and calls them out separately.

**Confidence flagging.** Two completed issues in a month is a thin sample. The website says so rather than displaying metrics like they mean something definitive.

**Role scoping.** Developers see only their own data. Managers see only their team. Simulated here with a login screen; would be SSO in production.


## The five metrics

| Metric | Definition |
|---|---|
| Lead Time | PR open → successful prod deploy |
| Cycle Time | Issue In Progress → Done |
| Bug Rate | Escaped prod bugs ÷ issues completed |
| Deployment Frequency | Successful prod deploys in the month |
| PR Throughput | Merged PRs in the month |


## Data layout
```text
src/data/
├── developers.js     ← identity, team, role
├── jiraIssues.js     ← cycle time
├── pullRequests.js   ← review metrics
├── deployments.js    ← lead time
├── bugReports.js     ← quality signals
└── index.js
```
Each file maps to a source system. In production, replace the import with an API call.



## Stack

React 19, Vite, inline CSS. No UI library. No backend used since it was just 32 rows of mock data.


## Running locally

```bash
git clone https://github.com/Sai-Nithya-7/devpulse.git
cd devpulse
npm install
npm run dev
```

`http://localhost:5173`  pick an identity on the login screen.


## Things I'd change with more time

The reasoning thresholds are hardcoded. "High" lead time means different things on different teams, and right now there's no way to configure that.

Two months of data limits trend detection. The "improving" pattern variant only fires if someone was already in Quality Watch the prior month and got better. With six months of history it becomes much more useful.

There are no trend charts. Delta indicators exist on each metric card but no sparklines. That'd come next.
