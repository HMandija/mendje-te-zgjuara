import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
let writes=0,calls=0,allowed=true;
const keys=[];
const env={AUTH_RATE:{limit:async({key})=>{calls++;keys.push(key);return {success:allowed};}}};
const db={prepare(){writes++;return {bind(){return this;},async first(){return {count:1};},async run(){return {meta:{changes:1}};}};}};
globalThis.__rateTest={env,db};
const prelude="const env=globalThis.__rateTest.env;const getChatGPTUser=async()=>null;const db=()=>globalThis.__rateTest.db;const hash=async()=>'';const student=async()=>null;const workspace=async()=>({});const emailIdentity=async()=>null;const allowed=()=>true;";
const source=prelude+'\n'+fs.readFileSync('lib/school-access.ts','utf8').replace(/^import .*;\r?\n/gm,'');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const access=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const request=ip=>new Request('https://school.test/api/workspace',{headers:{'cf-connecting-ip':ip}});
try{
 // The broad per-request guard is answered by the binding, not by D1.
 calls=0;writes=0;await access.authSourceLimit(request('203.0.113.9'));
 assert.equal(calls,1);assert.equal(keys[0],'auth-source:203.0.113.9');assert.equal(writes,0,'auth-source must not write to D1 when the binding is present');
 // Over the limit, the request is rejected before authentication touches D1.
 allowed=false;writes=0;await assert.rejects(access.authorize(request('203.0.113.9'),'workspace:read'),e=>e.status===429);assert.equal(writes,0);
 // The real authorizer still calls the guard once and keeps precise limits on D1.
 allowed=true;calls=0;writes=0;await assert.rejects(access.authorize(request('203.0.113.9'),'workspace:read'),e=>e.status===401);
 assert.equal(calls,1,'authorize uses the bound guard');assert(writes>0,'failed-auth keeps its precise D1 counter');
 // Local development and tests without the binding keep the old behaviour.
 delete env.AUTH_RATE;calls=0;writes=0;await access.authSourceLimit(request('203.0.113.9'));
 assert.equal(calls,0);assert(writes>0,'a missing binding falls back to the D1 limiter');
}finally{delete globalThis.__rateTest;}
console.log('Rate limits: auth-source is enforced by the Cloudflare binding with no D1 writes, rejects before authentication, and falls back to D1 when the binding is absent. Precise per-account limits stay in D1.');
