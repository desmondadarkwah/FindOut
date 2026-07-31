# FindOut

A peer-learning platform for university students. A student who wants to learn a
subject is matched with a student willing to teach it, and the two can message
each other, form study groups, and share resources.

Matching is *reciprocal*: it does not look for people who are similar, it looks
for people who are complementary. A student marked **Ready To Learn** in Calculus
is ranked highly against a student marked **Ready To Teach** in Calculus, not
against another learner.

Final-year project, Department of Computer Science, University of Ghana, Legon.

## Stack

MongoDB and Mongoose · Express 4 · React 18 and Vite · Node.js 22.22+ or 24.15+ · Socket.IO 4
for messaging and presence · JWT authentication with a short-lived access token
and a rotating refresh token.

## Running it

```bash
npm install                 # installs the root, backend and frontend packages
```

Create `backend/.env`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/findout
JWT_SECRET=<a long random string>
REFRESH_TOKEN_SECRET=<a different long random string>
EMAIL_USER=<smtp account>
EMAIL_PASS=<smtp password or app password>
PORT=5000
```

Then, in two terminals:

```bash
npm run backend             # http://localhost:5000
npm run frontend            # http://localhost:5173
```

The first administrator is created with
`node backend/migration/createSuperAdmin.js`.

API documentation is served from the running backend at
<http://localhost:5000/api-docs> (OpenAPI 3.0, 58 operations).

## Tests

```bash
npm run test --prefix backend            # unit
npm run test:integration --prefix backend  # needs a database whose name contains "test"
npm run test:coverage --prefix frontend  # Vitest + Testing Library
```

The integration suite refuses to run against any database whose name does not
contain `test`, so it cannot be pointed at real data by accident.

## Continuous integration

The pipeline runs on every push to `feature/**`, `bugfix/**`, `hotfix/**` and
`release/**`, on pull requests into `develop` and `main`, and again on the commit
that results from each merge. See [.github/CI.md](.github/CI.md) for what each
job does and the branch protection rules it assumes.

## Repository layout

```
backend/     Express API, Mongoose models, Socket.IO server, tests
frontend/    React client (Vite, Tailwind)
docs/        SRS, thesis chapters 1–5, figures, generated DOCX
scripts/     thesis build, screenshot capture, CI check scripts
.github/     workflows and CI documentation
```

## Documentation

| Document | What it covers |
|---|---|
| [docs/srs.md](docs/srs.md) | Software requirements specification |
| [docs/chapter1-problem-identification.md](docs/chapter1-problem-identification.md) | Problem, aims, scope |
| [docs/chapter2-literature-review.md](docs/chapter2-literature-review.md) | Literature review |
| [docs/chapter3-methodology.md](docs/chapter3-methodology.md) | Methodology, design, diagrams |
| [docs/chapter4-implementation.md](docs/chapter4-implementation.md) | Implementation and the defect register |
| [docs/chapter5-results-testing-discussion.md](docs/chapter5-results-testing-discussion.md) | Results, testing, discussion |

Rebuild the submission document with:

```bash
python3 scripts/build-thesis.py            # writes docs/FindOut-Thesis.docx
```

Requires `pandoc`.
