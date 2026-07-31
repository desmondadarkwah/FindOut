# Continuous integration

## What runs, and when

| Event | Workflow | Purpose |
|---|---|---|
| Push to `feature/**`, `bugfix/**`, `hotfix/**`, `release/**` | CI | Catch a problem on the branch, before review |
| Pull request into `develop` or `main` | CI, CodeQL | Gate the merge |
| Push to `develop` (including a merge) | CI, CodeQL | Verify the merge result, then the staging gate |
| Push to `main` (including a merge) | CI, CodeQL | Verify the merge result, then the production gate |
| Monday 06:00 UTC | CodeQL | Apply newly published rules to unchanged code |
| Monday 06:00 UTC | Dependabot | Dependency updates, grouped |

A branch being green is not the same as the merge being green. The pipeline
therefore runs again on the commit that lands, which is what a branch
protection rule should require.

## The pipeline

```
changes ──┬── lint ──┬── test-backend-unit (Node 22, 24)
          │          ├── test-backend-integration (MongoDB service)
          │          ├── test-frontend
          │          └── build ── bundle budget
          └── security
                        │
                  quality-gate
                        │
          ┌─────────────┴─────────────┐
   staging-gate                production-gate
   (develop only)               (main only)
```

**changes** — a paths filter. A documentation-only commit does not run the
backend test matrix. Skipped jobs are treated as passes by the gate.

**lint** — syntax, OpenAPI specification loads, ESLint, and a check that every
relative import resolves with the correct capitalisation. That last one exists
because case-mismatched imports resolve on macOS and Windows and fail on Linux;
that fault reached deployment once.

**test-backend-unit** — Jest across the supported Node versions, with coverage
thresholds enforced. The matrix is 22 (maintenance LTS) and 24 (active LTS);
18 and 20 are past end-of-life and the frontend toolchain no longer runs on
them.

**test-backend-integration** — Jest and Supertest against a real MongoDB in a
service container. The suite refuses any database whose name does not contain
`test`, so it cannot be pointed at real data by mistake.

**test-frontend** — Vitest and Testing Library in jsdom.

**build** — the production build, plus a gzipped bundle budget. Bundle growth
is gradual and invisible on a fast connection, so it is checked rather than
observed.

**security** — dependency audit, a scan for committed credentials, and a check
that no `.env` file is tracked. The credential scan is deliberately narrow: a
scanner that cries wolf gets disabled.

**quality-gate** — aggregates the rest. This is the single check to require in
branch protection; the jobs above it can be reordered without editing the
protection rule.

**production-gate** — reads the defect register in `docs/chapter4-implementation.md`
and fails while any defect is marked **Critical**. Closing a defect in the
document is what opens the gate, so the register cannot claim one thing while
the pipeline believes another.

## Branch protection

These are the repository settings the pipeline assumes. Set them under
**Settings → Branches → Add rule**.

### `main`

- Require a pull request before merging — 1 approval
- Dismiss stale approvals when new commits are pushed
- Require review from Code Owners
- Require status checks to pass: **Quality gate**, **Analyse
  javascript-typescript**
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Do not allow bypassing the above settings
- Restrict who can push: no direct pushes

### `develop`

- Require a pull request before merging — 1 approval
- Require status checks to pass: **Quality gate**
- Require branches to be up to date before merging

Feature branches are deliberately unprotected. The pipeline runs on them so a
problem is visible early, but nothing is blocked until a merge is proposed.

## Environments

`staging` and `production` are declared as GitHub environments so that
deployment steps, protection rules and secrets can be attached later without
restructuring the pipeline. Neither currently deploys anything; each records
that a commit reached the bar for its branch.

To require a human before production, add a required reviewer under
**Settings → Environments → production**.

## Running the same checks locally

```bash
# static
node scripts/check-imports.js
node scripts/check-secrets.js

# backend
npm ci --prefix backend
npm run test:coverage --prefix backend
MONGODB_URI='mongodb://127.0.0.1:27017/findout_test' \
  npm run test:integration --prefix backend

# frontend
npm ci --prefix frontend
npm run test:coverage --prefix frontend
npm run build --prefix frontend
node scripts/check-bundle-size.js

# release readiness
node scripts/check-release-blockers.js
```

The functional and performance suites need a running server and are not part of
the pipeline:

```bash
npm run backend            # in one terminal
npm run test:functional --prefix backend
npm run test:perf --prefix backend
```

## Coverage thresholds

Thresholds are floors set from measured coverage, not aspirations. Their
purpose is to stop coverage regressing silently.

The global floor is low because most of the backend is Express controllers,
which the integration and functional suites cover by running against a live
server rather than through instrumented unit tests. The modules holding
algorithmic logic are held to a high standard individually — `matchingService`
at 95% statements, `authMiddleware` at 100% — which is where a regression would
actually matter.

Raise the floors as tests are added. Do not set an aspirational number that
fails the build from day one; a pipeline that is red by default gets ignored.
