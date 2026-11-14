import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const id = process.env.CLOUDFLARE_D1_DATABASE_ID;
if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
  throw new Error('Set CLOUDFLARE_D1_DATABASE_ID to the ID of the NEW empty D1 database.');
}
await mkdir('.cloudflare', { recursive: true });
await writeFile('.cloudflare/wrangler.json', JSON.stringify({
  name: 'mendje-te-zgjuara',
  main: '../build/cloudflare-worker.ts',
  compatibility_date: '2026-05-15',
  compatibility_flags: ['nodejs_compat'],
  workers_dev: true,
  // Dashboard secrets stay encrypted; keep dashboard non-secret variables too.
  keep_vars: true,
  secrets: { required: ['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','ADMIN_EMAIL','SUPABASE_SECRET_KEY'] },
  d1_databases: [{ binding: 'DB', database_name: 'mendje-school', database_id: id,
    migrations_dir: '../drizzle' }],
  ratelimits: [{ name: 'AUTH_RATE', namespace_id: '1001', simple: { limit: 900, period: 60 } }],
}, null, 2));
const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--config', 'vite.cloudflare.ts'], {
  stdio: 'inherit', env: { ...process.env, DEPLOY_TARGET: 'cloudflare',
    CLOUDFLARE_CF_FETCH_ENABLED: 'false', WRANGLER_SEND_METRICS: 'false',
    WRANGLER_WRITE_LOGS: 'false' },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
