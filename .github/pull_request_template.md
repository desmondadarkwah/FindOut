## What this changes

<!-- One or two sentences. What is different after this is merged? -->

## Why

<!-- The problem being solved, or a link to the issue. -->

## How it was verified

<!-- Tick what you actually ran, not what you intend to run. -->

- [ ] `npm test --prefix backend` (unit)
- [ ] `npm run test:integration --prefix backend` (needs a test database)
- [ ] `npm test --prefix frontend` (components)
- [ ] `npm run test:functional --prefix backend` (needs the server running)
- [ ] Checked by hand in the browser

## Defect register

<!-- If this fixes something in Chapter 4 §4.10, give its ID and change the
     severity cell to "Fixed" in the same pull request, so the register and the
     production gate agree. -->

Fixes: <!-- D-nn, or "none" -->

## Risk

- [ ] Changes an API contract
- [ ] Changes the database schema (a migration is included)
- [ ] Changes authentication or authorisation
- [ ] None of the above

## Before requesting review

- [ ] No credential, token or real email address is included
- [ ] New behaviour has a test that would fail without the change
- [ ] Documentation updated if behaviour a reader depends on has changed
