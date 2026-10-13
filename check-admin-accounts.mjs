import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {z} from 'zod';
const sql=new DatabaseSync(':memory:');for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
const database={prepare(query){let args=[];return {bind(...values){args=values;return this;},async first(){return sql.prepare(query).get(...args)||null;},async run(){return sql.prepare(query).run(...args);},async all(){return {results:sql.prepare(query).all(...args)};}};},async batch(statements){sql.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}};
class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}
const actor='11111111-1111-4111-8111-111111111111',target='22222222-2222-4222-8222-222222222222',newId='33333333-3333-4333-8333-333333333333';
const users=new Map([[actor,{id:actor,email:'admin@example.test',email_confirmed_at:'now'}],[target,{id:target,email:'teacher@example.test',email_confirmed_at:'now',encrypted_password:'must-not-leak',access_token:'must-not-leak',user_metadata:{private:'must-not-leak'}}]]);
let deliveryFails=false,banFails=false,authorized=true,providerCalls=0,creationCalls=0;
globalThis.__adminAccounts={env:{ADMIN_EMAIL:'admin@example.test',SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_fixture-server-key'},ApiError,z,
 db:()=>database,json:(body,status=200)=>Response.json(body,{status}),hash:async value=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))).toString('hex'),limit:async()=>{},authCookieToken:()=>null,revokeProviderSession:async()=>{},
 authCall:async(path,method,body)=>{assert(path.startsWith('resend?redirect_to='));assert.equal(method,'POST');assert.deepEqual(body,{email:'new@example.test',type:'signup'});if(deliveryFails)throw new ApiError(503,'Delivery failed');return {};},
 input:async(r,schema)=>schema.parse(await r.json()),requireOrigin:r=>{if(r.headers.get('origin')!=='https://school.test')throw new ApiError(403,'Origin');},
 route:async fn=>{try{return await fn();}catch(e){return Response.json({error:e.message},{status:e.status||400});}}
};
async function load(file,prelude){const source=prelude+'\n'+fs.readFileSync(file,'utf8').replace(/^import .*;\r?\n/gm,'');return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));}
const admin=await load('lib/admin-server.ts','const {env,db,json,hash,ApiError,limit,authCall,authCookieToken,revokeProviderSession}=globalThis.__adminAccounts;');
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,options)=>{
 providerCalls++;assert.equal(new URL(url).origin,'https://fixture.supabase.co');const expectedKey=globalThis.__adminAccounts.env.SUPABASE_SECRET_KEY.trim();assert.equal(options.headers.apikey,expectedKey);assert.equal(options.headers.Authorization,expectedKey.startsWith('sb_secret_')?undefined:'Bearer '+expectedKey);
 const path=new URL(url).pathname,body=options.body?JSON.parse(options.body):null;
 if(path.endsWith('/users')&&options.method==='GET')return Response.json({users:[...users.values()]});
 if(path.endsWith('/users')&&options.method==='POST'){creationCalls++;assert.equal(body.email_confirm,false);assert.equal(body.password,'fixture-password-123');if(users.has(newId))return Response.json({code:'email_exists',msg:'must-not-leak'},{status:422});const user={id:newId,email:body.email};users.set(newId,user);return Response.json(user);}
 const id=path.split('/').at(-1);const user=users.get(id);if(!user)return Response.json({error:'not found'},{status:404});
 if(options.method==='PUT'){if(banFails)return Response.json({msg:'secret provider details must-not-leak'},{status:500});assert(['876000h','none'].includes(body.ban_duration));user.banned_until=body.ban_duration==='none'?undefined:'2126-01-01';}
 return Response.json(user);
};
try{
 sql.prepare("INSERT INTO accounts(user,role,enabled) VALUES(?,'TEACHER',1)").run('supabase:'+target);
 sql.prepare('INSERT INTO teacher_sessions(hash,user,expires) VALUES(?,?,?)').run('old-token','supabase:'+target,Date.now()+3600000);
 sql.prepare('INSERT INTO admin_sessions(hash,user,expires,email,provider_hash) VALUES(?,?,?,?,?)').run('old-admin',target,Date.now()+3600000,'teacher@example.test','provider');
 const before=providerCalls;await assert.rejects(admin.changeAdminAccount(actor,actor,'block'),e=>e.status===400);assert.equal(providerCalls,before+1);
 banFails=true;const blocked=await (await admin.changeAdminAccount(actor,target,'block')).json();assert.equal(blocked.blocked,true);assert.equal(sql.prepare('SELECT enabled FROM accounts WHERE user=?').get('supabase:'+target).enabled,0);assert.equal(sql.prepare('SELECT count(*) n FROM teacher_sessions').get().n,0);assert.equal(sql.prepare('SELECT count(*) n FROM admin_sessions').get().n,0);
 const listed=await (await admin.adminUsers(1,actor)).json();assert.equal(listed.users.find(u=>u.id===target).blocked,true);assert.equal(listed.users.find(u=>u.id===actor).protected,true);assert(!JSON.stringify(listed).includes('must-not-leak'));assert(!JSON.stringify(listed).includes('sb_secret_fixture-server-key'));
 await assert.rejects(admin.changeAdminAccount(actor,target,'unblock'),e=>e.status===503);assert.equal(sql.prepare('SELECT enabled FROM accounts WHERE user=?').get('supabase:'+target).enabled,0);
 banFails=false;await admin.changeAdminAccount(actor,target,'block');await admin.changeAdminAccount(actor,target,'unblock');assert.equal(sql.prepare('SELECT enabled FROM accounts WHERE user=?').get('supabase:'+target).enabled,1);assert.equal(sql.prepare('SELECT count(*) n FROM teacher_sessions').get().n,0);
 const callsBefore=providerCalls;const emails=await admin.adminAccountEmails(['supabase:'+target,'supabase:'+target]);assert.equal(emails.get('supabase:'+target),'teacher@example.test');assert.equal(providerCalls,callsBefore);
 sql.prepare('DELETE FROM account_contacts WHERE user=?').run('supabase:'+target);assert.equal((await admin.adminAccountEmails(['supabase:'+target,'supabase:'+target])).get('supabase:'+target),'teacher@example.test');assert.equal(providerCalls,callsBefore+1);
 deliveryFails=true;const created=await admin.createAdminAccount(actor,'new@example.test','fixture-password-123','https://school.test/teacher/login');assert.equal(created.status,201);const body=await created.json();assert.equal(body.confirmationSent,false);assert.equal(body.user.confirmed,false);assert(!JSON.stringify(body).includes('fixture-password-123'));assert.equal(sql.prepare('SELECT role FROM accounts WHERE user=?').get('supabase:'+newId).role,'TEACHER');
 Object.assign(globalThis.__adminAccounts,admin,{adminIdentity:async()=>{if(!authorized)throw new ApiError(401,'Unauthorized');return actor;}});
 const api=await load('app/api/admin/route.ts','const {z,route,input,adminIdentity,adminUsers,adminAccountEmails,changeAdminAccount,createAdminAccount,db,json,limit,requireOrigin}=globalThis.__adminAccounts;');
 const classroom='44444444-4444-4444-8444-444444444444',profile='55555555-5555-4555-8555-555555555555';
 sql.prepare('INSERT INTO schools(id,owner,name) VALUES(?,?,?)').run('fixture-school','supabase:'+target,'School');
 sql.prepare('INSERT INTO classes(id,school,owner,name,grade,code) VALUES(?,?,?,?,?,?)').run(classroom,'fixture-school','supabase:'+target,'Klasa 2A',2,'TESTONLY');
 sql.prepare('INSERT INTO workspaces(owner,payload) VALUES(?,?)').run('supabase:'+target,JSON.stringify({profiles:[{id:profile,name:'Nxënës prove',grade:2}],custom:[]}));
 await admin.recordAccess(new Request('https://school.test',{headers:{'cf-connecting-ip':'192.0.2.1','x-mendje-country':'AL'}}),'supabase:'+target,'TEACHER','teacher@example.test');
 await admin.recordAccess(new Request('https://school.test',{headers:{'cf-connecting-ip':'192.0.2.2'}}),classroom+':'+profile,'STUDENT');
 const accessResponse=await api.GET(new Request('https://school.test/api/admin?view=access&page=1'));assert.equal(accessResponse.status,200);const access=await accessResponse.json();
 assert.equal(access.events.find(e=>e.kind==='TEACHER').email,'teacher@example.test');const child=access.events.find(e=>e.kind==='STUDENT');assert.equal(child.profileName,'Nxënës prove');assert.equal(child.className,'Klasa 2A');assert.equal(child.teacherEmail,'teacher@example.test');assert.equal(child.email,'');assert.equal(child.ip,'192.0.2.2');
 const studentResponse=await api.GET(new Request('https://school.test/api/admin?view=students&page=1'));assert.equal((await studentResponse.json()).students[0].ownerEmail,'teacher@example.test');
 const request=(method,body,origin='https://school.test')=>new Request('https://school.test/api/admin',{method,headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 authorized=false;const beforeDenied=providerCalls;assert.equal((await api.POST(request('POST',{email:'new@example.test',password:'fixture-password-123'}))).status,401);assert.equal((await api.PATCH(request('PATCH',{id:target,action:'block'}))).status,401);assert.equal(providerCalls,beforeDenied);
 authorized=true;assert.equal((await api.PATCH(request('PATCH',{id:target,action:'block'},'https://evil.test'))).status,403);assert.equal((await api.PATCH(request('PATCH',{id:target,action:'block',role:'ADMIN'}))).status,400);assert.equal((await api.POST(request('POST',{email:'new@example.test',password:'short'}))).status,400);assert.equal(providerCalls,beforeDenied);assert.equal(creationCalls,1);
 const duplicate=await api.POST(request('POST',{email:'new@example.test',password:'fixture-password-123'}));assert.equal(duplicate.status,409);assert(!(await duplicate.text()).includes('must-not-leak'));
 users.delete(newId);deliveryFails=false;const successful=await api.POST(request('POST',{email:'new@example.test',password:'fixture-password-123'}));assert.equal(successful.status,201);const confirmation=await successful.json();assert.equal(confirmation.confirmationSent,true);assert.equal(confirmation.user.confirmed,false);
 globalThis.__adminAccounts.env.SUPABASE_SECRET_KEY='eyJfixture.payload.signature';await admin.adminUsers(1);globalThis.__adminAccounts.env.SUPABASE_SECRET_KEY='  sb_secret_fixture-server-key  ';await admin.adminUsers(1);
 const fixtureFetch=globalThis.fetch;globalThis.fetch=async()=>Response.json({message:'must-not-leak secret-provider-value'},{status:401});await assert.rejects(admin.adminUsers(1),e=>e.status===503&&e.message.includes('refuzoi')&&!e.message.includes('must-not-leak'));globalThis.fetch=fixtureFetch;
 globalThis.__adminAccounts.env.SUPABASE_SECRET_KEY='sb_publishable_fixture';const beforeInvalid=providerCalls;await assert.rejects(admin.adminUsers(1),e=>e.status===503);assert.equal(providerCalls,beforeInvalid);
 delete globalThis.__adminAccounts.env.SUPABASE_SECRET_KEY;await assert.rejects(admin.adminUsers(1),e=>e.status===503);
}finally{globalThis.fetch=originalFetch;delete globalThis.__adminAccounts;sql.close();}
console.log('Admin accounts: private directory, durable block/provider failure, session revocation, protected admin, explicit unblock, cached historical email resolution, unconfirmed creation, delivery failure, CSRF/auth/input guards and no credential leaks passed. No real accounts or emails changed.');
