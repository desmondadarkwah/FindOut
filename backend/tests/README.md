# Test scripts

Standalone scripts producing the measured results reported in Chapter 5 of the
project documentation. Neither requires a database or a running server.

## fuzzyMatcher.test.js

Unit tests for the fuzzy subject matcher. The `fuzzyMatch` and
`levenshteinDistance` functions are copied verbatim from
`controllers/Suggestions.js`.

    node backend/tests/fuzzyMatcher.test.js

Produces the results in Chapter 5, Table 5.2. Note test TU-03 (`C++` vs `cpp`),
which exposes the normalisation defect documented in Chapter 5, §5.3.2.

## scalability.bench.js

Benchmarks the matching algorithm's scoring loop against synthetic user
populations from 100 to 16,000 users.

    node backend/tests/scalability.bench.js

Produces the results in Chapter 5, Table 5.4. Uses a fixed random seed so runs
are repeatable, and warms up the JavaScript engine before timing.

Measures the in-memory scoring loop only. Database retrieval, network transfer
and JSON serialisation are excluded, so full endpoint response time will be
higher.
