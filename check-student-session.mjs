import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

class MemoryStorage {
  entries=new Map();
  get length(){return this.entries.size;}
  key(i){return [...this.entries.keys()][i]??null;}
  getItem(key){return this.entries.get(key)??null;}
  setItem(key,value){this.entries.set(key,String(value));}
  removeItem(key){this.entries.delete(key);}
  clear(){this.entries.clear();}
}
globalThis.localStorage=new MemoryStorage();
globalThis.sessionStorage=new MemoryStorage();
const js=ts.transpileModule(fs.readFileSync('lib/student-session.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const session=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const a='a'.repeat(64),b='b'.repeat(64);
const teacher=JSON.stringify({config:{profiles:[{id:'teacher-owned-profile'}]}});
localStorage.setItem('mendje-cloud-teacher-123',teacher);
localStorage.setItem('mendje-sound','on');
localStorage.setItem('mendje-v1',JSON.stringify({grade:2,count:5,activeProfile:'old-student'}));
localStorage.setItem('mendje-student-token',a);
localStorage.setItem('mendje-picture-token',b);
for(const suffix of ['', '-conflict', '-legacy-pending'])localStorage.setItem('mendje-cloud-student-'+a+suffix,'private old data');
assert.equal(session.getStudentToken(),'','Persistent tokens must never restore login');
assert.equal(localStorage.getItem('mendje-student-token'),null);
assert.equal(localStorage.getItem('mendje-picture-token'),null);
assert(![...localStorage.entries.keys()].some(key=>key.startsWith('mendje-cloud-student-')));
assert.deepEqual(JSON.parse(localStorage.getItem('mendje-v1')),{grade:2,count:5});
assert.equal(localStorage.getItem('mendje-cloud-teacher-123'),teacher);
assert.equal(localStorage.getItem('mendje-sound'),'on');

// The previous picture login can migrate within the same tab only.
sessionStorage.setItem('mendje-picture-token',a);
assert.equal(session.getStudentToken(),a);
assert.equal(sessionStorage.getItem('mendje-picture-token'),null);
assert(session.writeStudentCache(a,{pending:[{id:'a-result',verified:true}]}));
session.startStudentSession(a);
assert.equal(session.getStudentToken(),a,'A page reload keeps the tab session');
assert.equal(session.readStudentCache().pending[0].id,'a-result');
assert(![...sessionStorage.entries.keys()].some(key=>key.includes(a)),'Cache keys must not contain credentials');
session.startStudentSession(b);
assert.deepEqual(session.readStudentCache(),{},'Another student must not inherit queued work');
assert.equal(session.writeStudentCache(a,{pending:['late-result']}),false);
assert(session.writeStudentCache(b,{pending:['b-result']}));
assert.throws(()=>session.startStudentSession('invalid-token'));
assert.equal(session.getStudentToken(),b);

let release,departures=0;
const logout=session.endStudentSession(()=>new Promise((_,reject)=>{release=reject;}),()=>{departures++;});
assert.equal(session.getStudentToken(),'','Logout clears credentials before the network finishes');
assert.deepEqual(session.readStudentCache(),{});
assert.equal(session.writeStudentCache(b,{pending:['late-result']}),false);
release(Error('offline'));
await logout;
assert.equal(departures,1,'Failed revocation must not prevent navigation');
session.startStudentSession(a);
await session.endStudentSession(async()=>{},()=>{departures++;});
assert.equal(departures,2);
assert.equal(sessionStorage.length,0);
assert.equal(localStorage.getItem('mendje-cloud-teacher-123'),teacher);
assert.equal(localStorage.getItem('mendje-sound'),'on');

// Persistent storage unavailable: session authentication still works, without a fallback.
const persistent=globalThis.localStorage;
Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('blocked');}});
session.startStudentSession(a);
assert.equal(session.getStudentToken(),a);
session.clearStudentSession();
Object.defineProperty(globalThis,'localStorage',{configurable:true,writable:true,value:persistent});
const temporary=globalThis.sessionStorage;
Object.defineProperty(globalThis,'sessionStorage',{configurable:true,get(){throw Error('blocked');}});
assert.throws(()=>session.startStudentSession(a));
session.clearStudentSession();
Object.defineProperty(globalThis,'sessionStorage',{configurable:true,writable:true,value:temporary});
assert(!JSON.stringify([...localStorage.entries]).includes(a));
console.log('Student sessions: legacy cleanup, same-tab migration/reload, isolated pending work, stale writes, offline logout and blocked storage passed.');
