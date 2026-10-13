import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const config = JSON.parse(await readFile('dist/server/wrangler.json', 'utf8'));
assert.equal(config.name, 'mendje-te-zgjuara');
assert.equal(config.keep_vars,true,'Preserve dashboard configuration during deploy');
assert.deepEqual(config.secrets?.required,['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','ADMIN_EMAIL','SUPABASE_SECRET_KEY'],'Missing admin server secret must fail deployment');
assert.equal(config.d1_databases.length, 1);
assert.equal(config.d1_databases[0].database_name, 'mendje-school');
assert.equal(config.d1_databases[0].binding, 'DB');
assert.equal(config.services.length, 0, 'Preview connector must not reach production');
const source = await readFile('build/cloudflare-worker.ts', 'utf8');
// Execute the actual gateway logic with a stubbed framework handler, no DB/network.
const executable = source.replace('import handler from "vinext/server/fetch-handler";',
  'const handler = { fetch: (request) => new Response(null, { headers: request.headers }) };')
  .replace("'../lib/browser-security.mjs'", JSON.stringify(new URL('../lib/browser-security.mjs', import.meta.url).href))
  .replace('request: Request, env: Cloudflare.Env, ctx: ExecutionContext', 'request, env, ctx');
const worker = (await import('data:text/javascript;base64,' + Buffer.from(executable).toString('base64'))).default;
const request = await worker.fetch(new Request('https://school.example/api/workspace', {
  headers: { 'oai-authenticated-user-id': 'forged',
    'oai-authenticated-user-email': 'forged@example.com',
    'oai-authenticated-user-full-name': 'forged',
    cookie: 'mendje_teacher=verified-session', authorization: 'Bearer pupil-session','x-mendje-country':'forged',
    'x-nonce': 'forged', 'Content-Security-Policy': "script-src 'nonce-forged'", 'Content-Security-Policy-Report-Only': 'forged' },
}), {}, {});
assert.equal(request.headers.get('oai-authenticated-user-id'), null);
assert.equal(request.headers.get('oai-authenticated-user-email'), null);
assert.equal(request.headers.get('oai-authenticated-user-full-name'), null);
assert.equal(request.headers.get('cookie'), 'mendje_teacher=verified-session');
assert.equal(request.headers.get('authorization'), 'Bearer pupil-session');
assert.equal(request.headers.get('x-mendje-country'),null,'Client cannot forge logged country');
assert.notEqual(request.headers.get('x-nonce'), 'forged');
assert.ok(request.headers.get('Content-Security-Policy').includes(`'nonce-${request.headers.get('x-nonce')}'`));
assert.equal(request.headers.get('Content-Security-Policy-Report-Only'), null);
assert.equal(request.headers.get('X-Frame-Options'), 'DENY');
assert.equal(request.headers.get('Cache-Control'), 'private, no-store');
const staticHeaders = await readFile('dist/client/_headers', 'utf8');
assert.ok(staticHeaders.includes('X-Content-Type-Options: nosniff'));
assert.ok(staticHeaders.includes('max-age=31536000, immutable'));
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
