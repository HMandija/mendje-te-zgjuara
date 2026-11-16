import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+f,'utf8'));
let queries=0,beforeBatch=null,failPictures=false;
const database={prepare(query){let args=[];return {
 bind(...values){assert(values.length<=100);args=values;return this;},
 async first(){queries++;return sql.prepare(query).get(...args)||null;},
 async run(){return this.execute();},
 execute(){queries++;if(failPictures&&query.startsWith('INSERT INTO picture_logins'))throw Error('simulated storage failure');const result=sql.prepare(query).run(...args);return {meta:{changes:Number(result.changes)}};},
 };},async batch(statements){if(beforeBatch){const hook=beforeBatch;beforeBatch=null;await hook();}sql.exec('BEGIN');try{const result=statements.map(s=>s.execute());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}};
const workspace=async owner=>{const row=await database.prepare('SELECT payload,revision FROM workspaces WHERE owner=?').bind(owner).first();return row?{...JSON.parse(row.payload),revision:row.revision}:{profiles:[],custom:[],revision:0};};
const hash=async value=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))).toString('hex');
class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}
globalThis.__roster={db:()=>database,workspace,hash,ApiError};
const source='const {db,workspace,hash,ApiError}=globalThis.__roster;\n'+fs.readFileSync('lib/roster-import.ts','utf8').replace(/^import .*;\r?\n/gm,'');
const {importRoster}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
sql.exec("INSERT INTO schools(id,owner,name) VALUES('school','teacher','Fixture')");
let counter=0;
function classroom(grade=1){const id='class-'+(++counter);sql.prepare('INSERT INTO classes(id,school,owner,name,grade,code) VALUES(?,?,?,?,?,?)').run(id,'school','teacher','Fixture',grade,id);return {id,grade};}
const add=(c,names,id=crypto.randomUUID(),owner='teacher')=>importRoster(owner,c,names,id,()=> 'cat');
const count=(table,c)=>sql.prepare(`SELECT COUNT(*) n FROM ${table} WHERE class=?`).get(c.id).n;
const names=Array.from({length:100},(_,i)=>'Nxënësi '+i);
try{
 const c=classroom(),id=crypto.randomUUID();queries=0;
 assert.deepEqual(await add(c,names,id),{added:100});assert.equal(queries,8,'100 pupils use eight SQL statements, independent of list length');
 assert.equal(count('class_students',c),100);assert.equal(count('picture_logins',c),100);
 const before=await workspace('teacher');assert.equal(before.profiles.length,100);
 assert.deepEqual(await add(c,names,id),{added:100});assert.equal(count('class_students',c),100,'Retry must not duplicate');
 await assert.rejects(add(c,['Different'],id),e=>e.status===409);
 await assert.rejects(add(c,['Extra']),e=>e.status===400);
 const same=classroom();await add(same,['Ana','Ana']);assert.equal(count('class_students',same),2,'Different pupils can share a name');
 const rollback=classroom(),snapshot=await workspace('teacher');failPictures=true;
 await assert.rejects(add(rollback,['Test']),/storage failure/);failPictures=false;
 assert.deepEqual(await workspace('teacher'),snapshot);assert.equal(count('class_students',rollback),0);assert.equal(count('roster_imports',rollback),0);
 const race=classroom();beforeBatch=()=>sql.exec("UPDATE workspaces SET revision=revision+1 WHERE owner='teacher'");
 await assert.rejects(add(race,['Test']),e=>e.status===409);assert.equal(count('class_students',race),0);assert.equal(count('picture_logins',race),0);
 const archive=classroom();beforeBatch=()=>sql.prepare('INSERT INTO classroom_settings(class,archived) VALUES(?,1)').run(archive.id);
 await assert.rejects(add(archive,['Test']),e=>e.status===409);assert.equal(count('class_students',archive),0);
 const full=classroom();await add(full,names.slice(0,99));beforeBatch=()=>sql.prepare('INSERT INTO class_students(class,profile) VALUES(?,?)').run(full.id,'concurrent');
 await assert.rejects(add(full,['Extra']),e=>e.status===409);assert.equal(count('class_students',full),100);
 const other=classroom();await assert.rejects(add(other,['Test'],crypto.randomUUID(),'intruder'),e=>e.status===409);assert.equal(count('class_students',other),0);
 const parallel=classroom(),request=crypto.randomUUID();const results=await Promise.all([add(parallel,names,request),add(parallel,names,request)]);
 assert.deepEqual(results,[{added:100},{added:100}]);assert.equal(count('class_students',parallel),100);assert.equal(count('roster_imports',parallel),1);
 const fifty=classroom();queries=0;await add(fifty,names.slice(0,50));assert.equal(queries,8);assert.equal(count('picture_logins',fifty),50);
 const conflict=classroom();let release;const gate=new Promise(resolve=>{release=resolve;});
 beforeBatch=()=>{beforeBatch=()=>release();return gate;};
 const competing=await Promise.allSettled([add(conflict,['First']),add(conflict,['Second'])]);
 assert.equal(competing.filter(r=>r.status==='fulfilled').length,1);assert.equal(competing.find(r=>r.status==='rejected').reason.status,409);
 assert.equal(count('class_students',conflict),1);assert.equal(count('picture_logins',conflict),1);
 const fifth=classroom(5);await add(fifth,['Klasa e pestë']);
 const fifthProfile=(await workspace('teacher')).profiles.find(p=>p.name==='Klasa e pestë');
 assert.equal(fifthProfile.grade,5);assert.equal(count('class_students',fifth),1);assert.equal(count('picture_logins',fifth),1);
 const cap=classroom();sql.prepare('UPDATE workspaces SET payload=? WHERE owner=?').run(JSON.stringify({profiles:Array.from({length:2000},(_,i)=>({id:'cap'+i,name:'Test',grade:1})),custom:[]}),'teacher');
 await assert.rejects(add(cap,['Extra']),e=>e.status===400);assert.equal(count('class_students',cap),0);
 sql.prepare('DELETE FROM classes WHERE id=?').run(parallel.id);assert.equal(count('roster_imports',parallel),0,'Deleting a class cleans its import receipts');
}finally{delete globalThis.__roster;sql.close();}
console.log('Roster imports: 100 pupils in 8 SQL statements, atomic rollback, retries, concurrent duplicate requests, ownership, archive/revision/capacity races and workspace limit passed.');
