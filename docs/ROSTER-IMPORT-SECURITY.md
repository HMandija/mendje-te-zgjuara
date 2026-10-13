# Bulk roster import

The teacher roster accepts 1–100 names through the existing strict API schema.
Names are not deduplicated: different pupils may legitimately share a name.

Previously, 100 names generated 201 batch statements, plus authorization and
preflight queries. D1 Free permits 50 statements per Worker invocation; batching
does not remove that limit.

The import helper now executes eight SQL statements on a successful new import,
whether adding one, fifty, or one hundred pupils. Authorization and route checks
are additional. JSON parameters feed two set-based inserts; each statement stays
below D1's 100 bound-parameter limit.

Four statements run in one atomic D1 batch: workspace compare-and-swap update,
class membership insert, secret picture insert, and import receipt. All writes
roll back if any statement fails. The workspace update rechecks ownership, grade,
archival state, class capacity, and revision inside the transaction. Dependent
inserts require both the new revision and a freshly generated profile ID.

The UI sends a UUID request ID and retains it for retries of an unchanged list
until the server acknowledges success. Receipts are scoped to the teacher and
store a SHA-256 request fingerprint and count, not names or secret pictures.
Replaying a successful request returns its original count. Reusing its ID for
different input returns 409. Receipts are deleted with their class. Old clients
without a request ID remain compatible, but cannot deduplicate network retries.
Reloading the page also discards the UI's pending request ID; this is not durable
offline submission storage.

The form blocks concurrent clicks, disables editing during submission, and clears
after acknowledgment. A subsequent refresh failure does not resubmit the list.

`node check-roster-import.mjs` executes actual migration and application SQL in
SQLite. It checks 50/100 pupil imports, constant query counts, rollback on storage
failure, duplicate requests, concurrent conflicting writers, class/workspace
limits, ownership and archive/revision races, and receipt cleanup. This is not a
production load test or proof of 50 concurrent complete learning sessions.

References:
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/d1/worker-api/d1-database/
