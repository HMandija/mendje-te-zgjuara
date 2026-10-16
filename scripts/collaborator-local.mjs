import { copyFile, mkdir, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));
const mode = process.argv[2];
if (!['setup', 'start'].includes(mode)) throw new Error('Expected setup or start');
async function copyPrivateConfig(directory) {
  try { await access('.dev.vars'); }
  catch { throw new Error('Copy .dev.vars.example to .dev.vars first. Empty values allow guest preview; configure Supabase for login.'); }
  await mkdir(directory, { recursive: true });
  await copyFile('.dev.vars', `${directory}/.dev.vars`);
}
function run(script, args = [], extraEnv = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: 'inherit', env: { ...process.env, ...extraEnv },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (mode === 'setup') {
  await copyPrivateConfig('.cloudflare');
  // Local simulation only: this UUID is never used for a remote operation.
  run('scripts/cloudflare-build.mjs', [], {
    CLOUDFLARE_D1_DATABASE_ID: '00000000-0000-4000-8000-000000000000',
  });
  run('scripts/migrate-local.mjs', ['--local']);
  run('scripts/seed.mjs', ['--local']);
}
await copyPrivateConfig('dist/server');
if (mode === 'start') {
  run('node_modules/wrangler/bin/wrangler.js', ['dev', '--config',
    'dist/server/wrangler.json', '--local', '--persist-to', '.wrangler/state',
    '--ip', '127.0.0.1', '--port', '8787', '--inspector-port', '0']);
} else console.log('Local setup complete. Run npm run collaborator:start.');
