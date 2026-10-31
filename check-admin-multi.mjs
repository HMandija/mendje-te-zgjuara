import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
// Verifies that ADMIN_EMAIL may hold several comma-separated admin addresses.
const sql=new DatabaseSync(':memory:');for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
const database={prepare(query){let args=[];return {bind(...values){args=values;return this;},async first(){return sql.prepare(query).get(...args)||null;},async run(){return sql.prepare(query).run(...args);},async all(){return {results:sql.prepare(query).all(...args)};}};},async batch(statements){return Promise.all(statements.map(s=>s.run()));}};
const users={'admin@example.test':{id:'admin-id',password:'first-password-ok'},'second@example.test':{id:'second-id',password:'second-password-ok'},'teacher@example.test':{id:'teacher-id',password:'teacher-password-ok'}};
globalThis.__adminTest={env:{ADMIN_EMAIL:' Admin@Example.test , SECOND@example.test '},database,authCalls:[],
 async authCall(path,method,data,token){this.authCalls.push(path+':'+(data?.email||''));
  const person=email=>{const u=users[email];if(!u)throw new Error('Unknown user');return {id:u.id,email,email_confirmed_at:'now'};};
  if(path.startsWith('token')){if(users[data.email]?.password!==data.password)throw new Error('Invalid password');return {user:person(data.email)};}
  if(path==='verify'){if(data.token!=='123456')throw new Error('Invalid OTP');return {user:person(data.email),access_token:'fixture-token-for-'+data.email.replace(/[^a-z]/g,''),expires_in:3600};}
  if(path==='user'){const email=Object.keys(users).find(e=>token==='fixture-token-for-'+e.replace(/[^a-z]/g,''));return person(email);}
  return {};}};
let source=fs.readFileSync('lib/admin-server.ts','utf8').replace(/^import .*;\r?\n/gm,'');
source=`const env=globalThis.__adminTest.env;const db=()=>globalThis.__adminTest.database;const hash=async value=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Buffer.from(b).toString('hex');};const json=Response.json;class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}const limit=async()=>{};const authCall=(...args)=>globalThis.__adminTest.authCall(...args);const authCookieToken=(r,name)=>r.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1)||null;const revokeProviderSession=async()=>{};\n`+source;
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const api=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const request=cookie=>new Request('https://school.test/api/admin/auth',{headers:cookie?{cookie}:undefined});
async function login(email,password){const start=await api.startAdmin(request(),email,password);const verified=await api.verifyAdmin(request(start.headers.get('set-cookie').split(';')[0]),'123456');return verified.headers.getSetCookie().filter(c=>!c.startsWith('mendje_admin_challenge=')).map(c=>c.split(';')[0]).join('; ');}
assert.deepEqual(api.adminEmails(),['admin@example.test','second@example.test']);
// A valid Supabase user who is not on the admin list is rejected before any provider call.
globalThis.__adminTest.authCalls.length=0;
await assert.rejects(api.startAdmin(request(),'teacher@example.test','teacher-password-ok'));
assert.equal(globalThis.__adminTest.authCalls.length,0);
// Both admins can sign in with their own password; the session belongs to the right person.
const first=await login('admin@example.test','first-password-ok');
const second=await login('SECOND@example.test','second-password-ok');
assert.equal(await api.adminIdentity(request(first)),'admin-id');
assert.equal(await api.adminIdentity(request(second)),'second-id');
// One admin's password never opens the other admin's account.
await assert.rejects(api.startAdmin(request(),'second@example.test','first-password-ok'));
// OTP step uses the email that started the challenge.
assert.ok(globalThis.__adminTest.authCalls.some(c=>c==='otp:second@example.test'));
assert.ok(globalThis.__adminTest.authCalls.some(c=>c==='verify:second@example.test'));
assert.equal(sql.prepare("SELECT count(*) AS n FROM access_events WHERE kind='ADMIN'").get().n,2);
// Removing an address from ADMIN_EMAIL revokes that person's session but not the other admin's.
globalThis.__adminTest.env.ADMIN_EMAIL='admin@example.test';
await assert.rejects(api.adminIdentity(request(second)));
assert.equal(await api.adminIdentity(request(first)),'admin-id');
console.log('Admin multi: several ADMIN_EMAIL addresses, per-admin password and code, non-admin rejection and revocation after removal passed. Provider delivery is mocked.');
