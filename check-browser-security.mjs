import assert from 'node:assert/strict';
import {browserPolicy, createScriptNonce, secureBrowserResponse} from './lib/browser-security.mjs';

const nonces = new Set(Array.from({length:100}, createScriptNonce));
assert.equal(nonces.size,100);
for(const nonce of nonces) assert.match(nonce,/^[A-Za-z0-9+/]{32}$/);
const nonce=createScriptNonce(), policy=browserPolicy(nonce);
const script=policy.split('; ').find(p=>p.startsWith('script-src '));
assert.ok(script.includes(`'nonce-${nonce}'`));
assert.ok(!script.includes('unsafe-inline')&&!script.includes('unsafe-eval'));
for(const rule of ["script-src-attr 'none'","frame-ancestors 'none'","frame-src 'none'","object-src 'none'","base-uri 'none'","form-action 'self'","media-src 'self' blob:"]) assert.ok(policy.includes(rule));

for(const [path,type,status] of [['/admin','text/html',200],['/student','text/x-component',200],['/api/roster','application/json',401],['/missing','text/html',404],['/api/documents','application/pdf',200]]) {
  const headers=new Headers({'Content-Type':type,'Cache-Control':'public, max-age=3600',ETag:'old','X-Powered-By':'framework'});
  headers.append('Set-Cookie','teacher=one; HttpOnly; Secure');
  headers.append('Set-Cookie','challenge=two; HttpOnly; Secure');
  const original=new Response('payload',{status,headers});
  const secured=secureBrowserResponse(original,new Request('https://school.example'+path),policy);
  assert.equal(secured.status,status);
  assert.deepEqual(secured.headers.getSetCookie(),headers.getSetCookie());
  assert.equal(secured.body,original.body,'Response body stays streaming');
  assert.equal(secured.headers.get('Cache-Control'),'private, no-store');
  assert.equal(secured.headers.get('CDN-Cache-Control'),'no-store');
  assert.equal(secured.headers.get('Cloudflare-CDN-Cache-Control'),'no-store');
  assert.equal(secured.headers.get('ETag'),null);
  assert.equal(secured.headers.get('X-Powered-By'),null);
  assert.equal(secured.headers.get('X-Frame-Options'),'DENY');
  assert.match(secured.headers.get('Permissions-Policy'),/fullscreen=\(self\), autoplay=\(self\)/);
  assert.equal(secured.headers.get('Strict-Transport-Security'),'max-age=15552000');
  assert.equal(await secured.text(),'payload');
}
const redirect=secureBrowserResponse(Response.redirect('https://school.example/student',307),new Request('https://school.example/learning/index.html'),policy);
assert.equal(redirect.status,307);assert.equal(redirect.headers.get('Location'),'https://school.example/student');
const local=secureBrowserResponse(new Response('asset',{headers:{'Cache-Control':'public, max-age=31536000, immutable'}}),new Request('http://localhost:5185/example.js'),policy);
assert.equal(local.headers.get('Strict-Transport-Security'),null);
assert.equal(local.headers.get('Cache-Control'),'public, max-age=31536000, immutable');
console.log('Browser security: fresh nonces, restrictive scripts/frames, private caches, streamed bodies, cookies, redirects and local HTTP passed.');
