# Admin accounts

The standalone production Worker requires `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `ADMIN_EMAIL`, and `SUPABASE_SECRET_KEY`. Configure these directly in Cloudflare as encrypted Secret bindings. No values belong in the repository. The generated Wrangler configuration declares their names and refuses deployment if a required secret is missing.

Only a password-and-email-code verified admin session can list accounts, create teachers, or change account status. POST/PATCH also enforce same-origin requests, strict schemas, and per-admin limits. The admin cannot block their own identity or the configured admin email.

Blocking sets the app account to disabled without an expiry. Existing D1 triggers revoke teacher/admin/picture sessions and invitations immediately. Supabase is also given a 100-year ban; the app's local block remains indefinite even if that provider call fails. Explicit unblocking clears the provider ban before enabling the app account. Previous sessions stay revoked. Classes and pupil progress are preserved.

New teacher accounts are created unconfirmed and receive a signup confirmation email. The UI distinguishes creation from email delivery failure so an already-created account is not reported as nonexistent. Passwords are submitted only for creation and are never stored in the app directory, audit records, or returned responses.

The private account directory caches email addresses from verified provider responses. Access history resolves old teacher identities in bounded groups, and student rows show pupil name, class, and teacher email. Pupil email addresses are not invented. The directory is never exposed by public endpoints.

`check-admin-accounts.mjs` exercises the actual server module and routes with migrated SQLite and a mocked provider: access protection, email mapping, session revocation, provider failures, indefinite status, self-protection, creation/confirmation behavior, and safe response projection. These tests do not change real accounts or send real email.
