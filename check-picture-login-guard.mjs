import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {ZodError} from 'zod';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
const database={prepare(query){let args=[];return {bind(...values){args=values;return this;},async first(){return sql.prepare(query).get(...args)||null;},execute(){const stmt=sql.prepare(query);if(stmt.columns().length)return {results:stmt.all(...args)};stmt.run(...args);return {results:[]};}};},async batch(statements){sql.exec('BEGIN');try{const results=statements.map(s=>s.execute());sql.exec('COMMIT');return results;}catch(error){sql.exec('ROLLBACK');throw error;}}};
const hash=async value=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))).toString('hex');
class ApiError extends Error{constructor(status,message,retryAfter,code){super(message);Object.assign(this,{status,retryAfter,code});}}
globalThis.__pictureGuard={db:()=>database,hash,ApiError,ZodError,json:(data,status)=>Response.json(data,{status})};
async function load(file){const source='const {db,hash,ApiError,ZodError,json}=globalThis.__pictureGuard;const IDLE_SESSION_MS=30*60_000;\n'+fs.readFileSync(file,'utf8').replace(/^import .*;\r?\n/gm,'');return import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));}
const {guardedPictureLogin:login}=await load('lib/picture-login-guard.ts'),{route}=await load('lib/api-route.ts');
const originalNow=Date.now;let now=originalNow();Date.now=()=>now;
sql.exec("INSERT INTO accounts(user,role) VALUES('teacher','TEACHER'); INSERT INTO schools(id,owner,name) VALUES('school','teacher','Fixture');");
for(const c of ['class-a','class-b']){
 sql.prepare('INSERT INTO classes(id,school,owner,name,grade,code) VALUES(?,?,?,?,?,?)').run(c,'school','teacher','Fixture',1,c==='class-a'?'12345678':'87654321');
 for(const p of ['one','two','parallel','replay','recover']){sql.prepare('INSERT INTO class_students(class,profile) VALUES(?,?)').run(c,p);sql.prepare('INSERT INTO picture_logins(class,profile,picture) VALUES(?,?,?)').run(c,p,'cat');}
}
function challenge(c='class-a'){const h=crypto.randomUUID();sql.prepare('INSERT INTO roster_challenges(hash,class,expires) VALUES(?,?,?)').run(h,c,now+600000);return h;}
const state=(p,c='class-a')=>sql.prepare('SELECT * FROM picture_login_guard WHERE class=? AND profile=?').get(c,p);
async function attempt(p,picture='wrong',c='class-a',h=challenge(c)){return route(async()=>Response.json({token:await login(c,p,picture,h)}));}
try{
 assert.equal((await attempt('one')).status,401);assert.equal((await attempt('one')).status,401);
 let blocked=await attempt('one');assert.equal(blocked.status,429);assert.equal(blocked.headers.get('Retry-After'),'300');
 const lockedUntil=state('one').retry_at;
 assert.equal((await attempt('one','cat')).status,429,'Correct picture cannot bypass cooldown');assert.equal(state('one').failures,3);assert.equal(state('one').retry_at,lockedUntil,'Blocked requests must not extend the cooldown');
 assert.equal((await attempt('two','cat')).status,200,'Another student in the same classroom is unaffected');
 assert.equal((await attempt('one','cat','class-b')).status,200,'The same profile in another class is isolated');
 now=lockedUntil-1;blocked=await attempt('one');assert.equal(blocked.headers.get('Retry-After'),'1');
 now=lockedUntil;assert.equal((await attempt('one')).status,429);assert.equal(state('one').failures,4);
 now=state('one').retry_at;assert.equal((await attempt('one')).status,429);assert.equal(state('one').failures,5);
 now=state('one').retry_at;blocked=await attempt('one');assert.equal(blocked.status,403);assert.equal((await blocked.json()).code,'PICTURE_LOCKED');
 now+=86400000;assert.equal((await attempt('one','cat')).status,403,'New challenges and a new day do not reset teacher-required locks');
 sql.prepare('UPDATE picture_logins SET picture=? WHERE class=? AND profile=?').run('dog','class-a','one');assert.equal(state('one'),undefined);
 assert.equal((await attempt('one','dog')).status,200,'Teacher picture change unlocks the student');
 assert.equal((await attempt('recover')).status,401);assert.equal((await attempt('recover','cat')).status,200);assert.equal(state('recover').failures,0,'Successful login resets preceding mistakes');
 const concurrent=await Promise.all(Array.from({length:20},()=>attempt('parallel')));
 assert.equal(concurrent.filter(r=>r.status===401).length,2);assert.equal(concurrent.filter(r=>r.status===429).length,18);assert.equal(state('parallel').failures,3,'Parallel guesses must not cross the limit');
 const reusable=challenge();const race=await Promise.all([attempt('replay','cat','class-a',reusable),attempt('replay','cat','class-a',reusable)]);
 assert.equal(race.filter(r=>r.status===200).length,1,'A successful challenge can be consumed only once');
 assert.equal((await attempt('replay','cat','class-a',reusable)).status,401);
 const before=sql.prepare('SELECT count(*) AS n FROM picture_sessions').get().n;
 assert.equal((await attempt('unknown','cat')).status,401);assert.equal(state('unknown'),undefined,'Unknown students must not create guard rows');
 assert.equal((await attempt('two','cat','class-a','nonexistent-challenge')).status,401);
 const expired=challenge();sql.prepare('UPDATE roster_challenges SET expires=? WHERE hash=?').run(now-1,expired);assert.equal((await attempt('two','cat','class-a',expired)).status,401);
 sql.exec("INSERT INTO classroom_settings(class,archived) VALUES('class-a',1)");assert.equal((await attempt('two','cat')).status,401);
 sql.exec("UPDATE classroom_settings SET archived=0; UPDATE accounts SET enabled=0 WHERE user='teacher'");assert.equal((await attempt('two','cat')).status,401);
 sql.exec("UPDATE accounts SET enabled=1 WHERE user='teacher'");
 // Disabling the teacher also revokes existing sessions via the previous migration.
 assert.equal(sql.prepare('SELECT count(*) AS n FROM picture_sessions').get().n,0);assert(before>0);
 sql.exec("DELETE FROM class_students WHERE class='class-a' AND profile='parallel'");assert.equal(state('parallel'),undefined);assert.equal((await attempt('parallel','cat')).status,401);
}finally{Date.now=originalNow;delete globalThis.__pictureGuard;sql.close();}
console.log('Picture login guard: atomic parallel guesses, cooldown boundaries, permanent lock, per-class/student isolation, teacher recovery, single-use challenges and inactive membership passed.');
