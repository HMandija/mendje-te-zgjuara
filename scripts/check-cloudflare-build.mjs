import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const config = JSON.parse(await readFile('dist/server/wrangler.json', 'utf8'));
assert.equal(config.name, 'mendje-te-zgjuara');
assert.equal(config.d1_databases.length, 1);
assert.equal(config.d1_databases[0].database_name, 'mendje-school');
assert.equal(config.d1_databases[0].binding, 'DB');
assert.equal(config.services.length, 0, 'Preview connector must not reach production');
const source = await readFile('build/cloudflare-worker.ts', 'utf8');
// Execute the actual gateway logic with a stubbed framework handler, no DB/network.
const executable = source.replace('import handler from "vinext/server/fetch-handler";',
  'const handler = { fetch: (request) => request };')
  .replace('request: Request, env: Cloudflare.Env, ctx: ExecutionContext', 'request, env, ctx');
const worker = (await import('data:text/javascript;base64,' + Buffer.from(executable).toString('base64'))).default;
const request = worker.fetch(new Request('https://school.example/api/workspace', {
  headers: { 'oai-authenticated-user-id': 'forged',
    'oai-authenticated-user-email': 'forged@example.com',
    'oai-authenticated-user-full-name': 'forged',
    cookie: 'mendje_teacher=verified-session', authorization: 'Bearer pupil-session' },
}), {}, {});
assert.equal(request.headers.get('oai-authenticated-user-id'), null);
assert.equal(request.headers.get('oai-authenticated-user-email'), null);
assert.equal(request.headers.get('oai-authenticated-user-full-name'), null);
assert.equal(request.headers.get('cookie'), 'mendje_teacher=verified-session');
assert.equal(request.headers.get('authorization'), 'Bearer pupil-session');
async function inspect(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = directory + '/' + item.name;
    if (item.isDirectory()) await inspect(path);
    else if (item.name.endsWith('.js')) {
      const text = await readFile(path, 'utf8');
      assert.ok(!text.includes('oai-authenticated-user-id'), 'Trusted Sites identity fallback found: ' + path);
    }
  }
}
await inspect('dist/server');
console.log('Standalone build: new D1 binding, no preview connector, forged identity stripped, verified cookies/tokens preserved.');
