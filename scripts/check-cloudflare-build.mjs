import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import JSZip from 'jszip';
const config = JSON.parse(await readFile('dist/server/wrangler.json', 'utf8'));
assert.equal(config.name, 'mendje-te-zgjuara');
assert.equal(config.keep_vars,true,'Preserve dashboard configuration during deploy');
assert.deepEqual(config.secrets?.required,['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','ADMIN_EMAIL','SUPABASE_SECRET_KEY'],'Missing admin server secret must fail deployment');
assert.equal(config.d1_databases.length, 1);
assert.equal(config.d1_databases[0].database_name, 'mendje-school');
assert.equal(config.d1_databases[0].binding, 'DB');
assert.deepEqual(config.ratelimits?.find(rate => rate.name === 'AUTH_RATE'),
  {name:'AUTH_RATE',namespace_id:'1001',simple:{limit:900,period:60}},
  'AUTH_RATE binding must be present in the production build');
assert.equal(config.services.length, 0, 'Preview connector must not reach production');
const source = await readFile('build/cloudflare-worker.ts', 'utf8');
// Execute the actual gateway logic with a stubbed framework handler, no DB/network.
const executable = source.replace('import handler from "vinext/server/fetch-handler";',
  'const handler = { fetch: (request) => new Response(null, { headers: request.headers }) };')
  .replace("'../lib/browser-security.mjs'", JSON.stringify(new URL('../lib/browser-security.mjs', import.meta.url).href))
  .replace("import {collectCodingObjects} from '../lib/coding-project-server';",'const collectCodingObjects = async () => {};')
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
assert.ok(staticHeaders.includes('/coding-lab/*')&&staticHeaders.includes('! Cross-Origin-Resource-Policy'));
const editor=await worker.fetch(new Request('https://school.example/coding-lab/index.html'),{},{});
assert.equal(editor.headers.get('X-Frame-Options'),'SAMEORIGIN');
assert.equal(editor.headers.get('Access-Control-Allow-Origin'),'*');
assert.equal(editor.headers.get('Cross-Origin-Resource-Policy'),'cross-origin');
assert.ok(editor.headers.get('Content-Security-Policy').includes("script-src 'self' 'unsafe-eval'"));
const pending=[];
await worker.fetch(new Request('https://school.example/api/coding'),{BUCKET:{}},{waitUntil:promise=>pending.push(promise)});
assert.equal(pending.length,1);await Promise.all(pending);
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
async function inspectAssetSizes(directory){
 for(const item of await readdir(directory,{withFileTypes:true})){
  const path=directory+'/'+item.name;
  if(item.isDirectory())await inspectAssetSizes(path);
  else assert.ok((await stat(path)).size<=25*1024*1024,'Asset exceeds Cloudflare limit: '+path);
 }
}
await inspectAssetSizes('dist/client');
const parts=(await readdir('dist/client/coding-lab')).filter(name=>/^source(?:-\d+)?\.zip$/.test(name));
assert.ok(parts.includes('source.zip'));
const sourceFiles=new Set();
for(const part of parts){
 const zip=await JSZip.loadAsync(await readFile('dist/client/coding-lab/'+part));
 for(const file of Object.values(zip.files).filter(file=>!file.dir)){
  assert.ok(!sourceFiles.has(file.name),'Duplicate source file: '+file.name);
  assert.ok(!/(^|\/)(\.env(?:\.|$)|\.dev\.vars|\.wrangler\/)/.test(file.name),'Private configuration in source archive');
  sourceFiles.add(file.name);
 }
}
for(const file of ['coding-editor/main.jsx','coding-editor/build-source.mjs','coding-editor/source-loader.cjs','coding-editor/package-lock.json','lib/coding-project-file.mjs','upstream/@scratch/scratch-gui/src/index.ts','upstream/@scratch/scratch-gui/LICENSE','upstream/@scratch/scratch-vm/src/index.js','upstream/@scratch/scratch-paint/src/index.js'])assert.ok(sourceFiles.has(file),'Missing source file: '+file);
console.log('Standalone build: D1/rate-limit bindings, strict gateway, editor headers, asset size limit and source archive parts passed.');
