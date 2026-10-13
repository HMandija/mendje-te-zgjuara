import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {z} from 'zod';
const sql=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
const database={prepare(query){let args=[];return {bind(...values){args=values;return this;},async first(){return sql.prepare(query).get(...args)||null;},async run(){return sql.prepare(query).run(...args);}};},async batch(statements){return Promise.all(statements.map(s=>s.run()));}};
class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}
globalThis.__sessionTest={env:{DB:database,SUPABASE_URL:'https://fixture.supabase.co',SUPABASE_PUBLISHABLE_KEY:'fixture-public-key'},ApiError,z};
async function load(file,prelude){const source=prelude+'\n'+fs.readFileSync(file,'utf8').replace(/^import .*;\r?\n/gm,'');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));}
const school=await load('lib/school-server.ts','const env=globalThis.__sessionTest.env;');
Object.assign(globalThis.__sessionTest,school);
const email=await load('lib/email-auth.ts','const {env,ApiError,db,hash}=globalThis.__sessionTest;const IDLE_SESSION_MS=30*60_000;');
const classroom=await load('lib/classroom-server.ts',"const {ApiError,db,hash,workspace,json,z}=globalThis.__sessionTest;const identifier=z.string();const assignmentInput=z.object({class:z.string()});const pictureIds=[];");
const tokenA='fixture-teacher-session-A',tokenB='fixture-teacher-session-B';
const request=token=>new Request('https://school.test/api/workspace',{headers:token?{cookie:'mendje_teacher='+token}:undefined});
const user={id:'teacher-id',email_confirmed_at:'now'},result=token=>({user,access_token:token,expires_in:3600});
const originalFetch=globalThis.fetch;
let providerStatus=200,providerLogoutFails=false,providerCalls=0;
globalThis.fetch=async(url,options)=>{
 assert.equal(new URL(url).origin,'https://fixture.supabase.co');
 if(url.endsWith('/user')){providerCalls++;assert(options.headers.Authorization.startsWith('Bearer '));return Response.json(providerStatus===200?user:{error:'rejected'},{status:providerStatus});}
 assert(url.endsWith('/logout?scope=local'));
 if(providerLogoutFails)throw Error('Provider unavailable');
 return new Response(null,{status:204});
};
try{
 assert.equal(await email.emailIdentity(request()),null);
 await assert.rejects(email.emailIdentity(request(tokenA)),e=>e.status===401);
 assert.equal(providerCalls,0,'An old unregistered cookie must be rejected before contacting Supabase');
 const cookie=await email.createEmailSession(request(),result(tokenA));assert.match(cookie,/HttpOnly; SameSite=Lax/);assert.match(cookie,/Secure/);
 const teacherExpiry=sql.prepare('SELECT expires FROM teacher_sessions WHERE hash=?').get(await school.hash(tokenA)).expires;
 assert(teacherExpiry-Date.now()<=30*60_000&&teacherExpiry-Date.now()>29*60_000,'Teacher D1 session starts with a 30-minute idle deadline');
 assert.deepEqual(await email.emailIdentity(request(tokenA)),{id:'supabase:teacher-id'});
 assert(!JSON.stringify(sql.prepare('SELECT * FROM teacher_sessions').all()).includes(tokenA),'Only credential hashes belong in D1');
 await email.createEmailSession(request(),result(tokenB));
 providerLogoutFails=true;const exited=await email.logoutEmail(request(tokenA));assert.match(exited.headers.get('set-cookie'),/Max-Age=0/);
 await assert.rejects(email.emailIdentity(request(tokenA)),e=>e.status===401);
 assert.deepEqual(await email.emailIdentity(request(tokenB)),{id:'supabase:teacher-id'},'Other device session remains valid');
 await email.logoutEmail(request(tokenA)); // Idempotent, including an unavailable provider.
 providerLogoutFails=false;
 await email.createEmailSession(request(tokenB),result(tokenA));
 await assert.rejects(email.emailIdentity(request(tokenB)),e=>e.status===401);
 providerStatus=503;await assert.rejects(email.emailIdentity(request(tokenA)),e=>e.status===503);providerStatus=200;
 assert.deepEqual(await email.emailIdentity(request(tokenA)),{id:'supabase:teacher-id'},'Temporary provider errors fail closed without destroying a valid session');
 providerStatus=401;await assert.rejects(email.emailIdentity(request(tokenA)),e=>e.status===401);providerStatus=200;
 await assert.rejects(email.emailIdentity(request(tokenA)),e=>e.status===401);
 await email.createEmailSession(request(),result(tokenA));sql.exec('UPDATE teacher_sessions SET expires=0');await assert.rejects(email.emailIdentity(request(tokenA)),e=>e.status===401);
 await email.logoutEmail(request(tokenA));await email.createEmailSession(request(),result(tokenA));
 sql.exec("UPDATE accounts SET enabled=0 WHERE user='supabase:teacher-id'");
 assert.equal(sql.prepare('SELECT count(*) AS n FROM teacher_sessions').get().n,0);
 await assert.rejects(email.createEmailSession(request(),result(tokenB)),e=>e.status===403);
 sql.exec("UPDATE accounts SET enabled=1 WHERE user='supabase:teacher-id'");await assert.rejects(email.emailIdentity(request(tokenA)),e=>e.status===401);

 // Exercise the real student authorizer and logout against a fully migrated database.
 const owner='supabase:teacher-id',profile='student-one',picture='1'.repeat(64),invite='2'.repeat(64),other='3'.repeat(64);
 sql.prepare('INSERT INTO workspaces(owner,payload) VALUES(?,?)').run(owner,JSON.stringify({profiles:[{id:profile,name:'Fixture',grade:1}],custom:[]}));
 sql.prepare('INSERT INTO schools(id,owner,name) VALUES(?,?,?)').run('school',owner,'Fixture');
 sql.prepare('INSERT INTO classes(id,school,owner,name,grade,code) VALUES(?,?,?,?,?,?)').run('class','school',owner,'Fixture',1,'12345678');
 sql.prepare('INSERT INTO class_students(class,profile) VALUES(?,?)').run('class',profile);
 async function addStudents(){await school.db().prepare('INSERT INTO picture_sessions(hash,class,profile,expires) VALUES(?,?,?,?)').bind(await school.hash(picture),'class',profile,Date.now()+60000).run();for(const token of [invite,other])await school.db().prepare('INSERT INTO invitations(hash,owner,profile,expires) VALUES(?,?,?,?)').bind(await school.hash(token),owner,profile,Date.now()+60000).run();}
 const studentRequest=token=>new Request('https://school.test/api/student',{headers:{Authorization:'Bearer '+token}});
 await addStudents();assert(await school.student(studentRequest(picture)));assert(await school.student(studentRequest(invite)));
 assert(sql.prepare('SELECT expires FROM picture_sessions WHERE hash=?').get(await school.hash(picture)).expires>Date.now()+25*60_000,'Active picture login receives a sliding 30-minute idle deadline');
 const idle='4'.repeat(64);await school.db().prepare('INSERT INTO student_sessions(hash,owner,profile,expires) VALUES(?,?,?,?)').bind(await school.hash(idle),owner,profile,Date.now()+60000).run();
 assert(await school.student(studentRequest(idle)),'An active legacy invite session is accepted');
 assert(sql.prepare('SELECT expires FROM student_sessions WHERE hash=?').get(await school.hash(idle)).expires>Date.now()+25*60_000,'Active invite session receives a sliding 30-minute idle deadline');
 sql.prepare('UPDATE student_sessions SET expires=0 WHERE hash=?').run(await school.hash(idle));assert.equal(await school.student(studentRequest(idle)),null,'An idle student session is rejected server-side');
 await school.db().prepare('DELETE FROM student_sessions WHERE hash=?').bind(await school.hash(idle)).run();
 await classroom.logoutPicture(studentRequest(picture));assert.equal(await school.student(studentRequest(picture)),null);assert(await school.student(studentRequest(invite)));
 await classroom.logoutPicture(studentRequest(invite));assert.equal(await school.student(studentRequest(invite)),null);assert(await school.student(studentRequest(other)));
 await classroom.logoutPicture(studentRequest(invite));
 sql.exec("UPDATE accounts SET enabled=0 WHERE user='supabase:teacher-id'");assert.equal(await school.student(studentRequest(other)),null);
 sql.exec("UPDATE accounts SET enabled=1 WHERE user='supabase:teacher-id'");assert.equal(await school.student(studentRequest(other)),null,'Re-enabling an account must not revive revoked invitations');
 sql.exec('DELETE FROM invitations');await addStudents();
 await email.createEmailSession(request(),result(tokenB));sql.exec("DELETE FROM accounts WHERE user='supabase:teacher-id'");
 assert.equal(sql.prepare('SELECT count(*) AS n FROM teacher_sessions').get().n,0);assert.equal(sql.prepare('SELECT count(*) AS n FROM picture_sessions').get().n,0);assert.equal(sql.prepare('SELECT count(*) AS n FROM student_sessions').get().n,0);assert.equal(await school.student(studentRequest(invite)),null);
}finally{globalThis.fetch=originalFetch;delete globalThis.__sessionTest;sql.close();}
console.log('Session revocation: teacher cookie replay, separate devices, expiry, provider failure, account disable/delete, picture and invite logout passed against migrated SQLite. Provider responses mocked.');
