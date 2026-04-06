const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/workflows.json', 'utf8'));

data['shibboleth-security.yml'] = `name: 🛡️ Shibboleth Security

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened]
  schedule:
    - cron: '0 2 * * *' # Run daily at 2 AM

jobs:
  security-audit:
    name: Comprehensive Security Audit
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Shibboleth Engine
        uses: shibboleth-ai/security-action@v2
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          SHIBBOLETH_API_KEY: \${{ secrets.SHIBBOLETH_API_KEY }}
        with:
          scan_type: 'deep'
          fail_on_critical: true
          analyze_dependencies: true
          analyze_sast: true
          
      - name: Upload SARIF file
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: shibboleth-results.sarif
`;

data['codex-review.yml'] = `name: 💻 Codex Reviewer

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  code-review:
    name: OpenAI Codex Review
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR Diff
        id: get_diff
        run: |
          git diff origin/\${{ github.base_ref }}...HEAD > pr_diff.txt

      - name: Codex Analysis
        uses: openai/codex-review-action@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
        with:
          model: 'code-davinci-002'
          diff_file: 'pr_diff.txt'
          comment_on_pr: true
          focus_areas: 'performance, readability, best-practices'
`;

data['grok-analyst.yml'] = `name: 🌌 Grok Analyst

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  grok-respond:
    name: Grok Insight
    # Only run if comment contains @grok
    if: contains(github.event.comment.body, '@grok')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
      pull-requests: write

    steps:
      - uses: actions/checkout@v4

      - name: Invoke Grok
        uses: xai/grok-github-action@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          XAI_API_KEY: \${{ secrets.XAI_API_KEY }}
        with:
          context: 'github-issue-pr'
          humor_level: 'high'
          insight_depth: 'maximum'
`;

fs.writeFileSync('src/data/workflows.json', JSON.stringify(data, null, 2));
