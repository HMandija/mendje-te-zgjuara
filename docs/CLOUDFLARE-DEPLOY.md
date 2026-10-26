# Independent school deployment

This deployment uses a NEW empty D1 database. It does not copy existing emails,
classes, pupils, assignments, stars, invitations or sessions from Sites.
The existing Supabase project is retained: its existing auth accounts are not deleted.
The current Sites audience and deployment remain unchanged.

## One-time account configuration

1. Put this project at the root of a GitHub repository. The workflow watches `main`;
   change that branch if the repository uses a different production branch.
2. In your Cloudflare account create a new D1 database named `mendje-school`.
   Do not choose the existing Sites database. Copy the new database UUID.
3. In GitHub repository Actions settings add variables `CLOUDFLARE_ACCOUNT_ID`
   and `CLOUDFLARE_D1_DATABASE_ID`. Store `CLOUDFLARE_API_TOKEN` as a secret.
   Use a scoped token with Workers Scripts edit and D1 edit for the intended account.
   Never paste tokens into chat, source code or command arguments.
4. Set Worker runtime secrets `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
   `ADMIN_EMAIL` and `SUPABASE_SECRET_KEY` through Cloudflare's dashboard.
   Use the existing project and its publishable key for normal login. The separate
   secret key is server-only and is required for administrative account operations;
   never expose it in browser code. These values are deliberately absent from Git.
   After the first deploy, configure them before inviting teachers.
5. In Supabase Auth set the new HTTPS Site URL and allow the exact
   `https://<new-host>/teacher/login` and
   `https://<new-host>/teacher/reset-password` redirects. Enable email
   confirmation and production SMTP. Keep old redirects while the original app
   is still used.
6. Push to `main` or run the workflow manually. Checks must pass before the
   append-only SQL schema migrations and Worker deployment run.
   Public URL is returned by Wrangler; use workers.dev initially.

## Local verification without a cloud account

`CLOUDFLARE_D1_DATABASE_ID` must be set before running
`node scripts/cloudflare-build.mjs`. A dummy UUID may be used only for a local
build/dry-run; never run a remote migration with it.
The generated `.cloudflare/wrangler.json` is ignored. Production output is
`dist/server/wrangler.json`, with static assets built alongside the Worker.
This replaces generated dist output only; rebuilding through the original
`npm run build` restores the Sites build configuration.

## Security and release verification

- Standalone builds omit Sites mock login and connector preview bindings.
- Public requests cannot authenticate through `oai-authenticated-user-*`:
  the Worker strips these headers and server code disables that auth fallback.
- Logout clears the teacher cookie and returns home in standalone mode.
- First real login creates an empty teacher workspace; students enter by class
  code, name and secret picture after the teacher creates the roster.
- Migrations contain schema only. No local seed fixtures or database exports
  are uploaded. The public lesson catalog is original application content.
- Verify email delivery, login/logout, one new class, picture login, assignment,
  answer validation and progress before a classroom rollout.
- Current teacher sessions expire after at most one hour. Session refresh is
  still a separate required improvement for longer uninterrupted use.

## Capacity and free plan

30 simultaneous pupils / 100 daily pupils is the intended pilot, not a measured
capacity guarantee. Measure CPU time in Workers metrics (Free: 10 ms per request)
and D1 rows read/written. Test 30 concurrent real lesson sessions in a staging
database, not against production records. Browser animation time is separate
from Worker CPU time. No authenticated load test has been completed yet.
Supabase Free can pause after inactivity: verify it before returning from holidays.

Deploy rollback restores Worker code, not SQL data. Keep backups and use additive
schema migrations. For now the workflow intentionally has no database-reset step.
