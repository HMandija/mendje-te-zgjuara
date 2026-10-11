import {curriculumPuzzle} from './lib/expanded-curriculum.mjs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdir,writeFile,rm} from 'node:fs/promises';
import {catalogSeed} from './lib/catalog-seed.mjs';
const origin='http://127.0.0.1:5173';
const cookie=(await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'})).headers.get('set-cookie')?.split(';')[0];assert(cookie);
async function req(path,method='GET',data,token){const headers={Origin:origin};if(token)headers.Authorization='Bearer '+token;else headers.Cookie=cookie;if(data)headers['Content-Type']='application/json';const r=await fetch(origin+path,{method,headers,body:data?JSON.stringify(data):undefined});return {status:r.status,data:await r.json()};}
const original=(await req('/api/workspace')).data,profiles=[1,2].map(grade=>({id:crypto.randomUUID(),name:'Produit Test '+grade,grade}));let classId;
async function localSQL(sql){await mkdir('.wrangler',{recursive:true});const path='.wrangler/product-test-cleanup.sql';await writeFile(path,sql);try{const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--file',path],{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);}finally{await rm(path,{force:true});}}
try{
 assert.equal((await req('/api/workspace','PUT',{profiles:[...original.profiles.slice(0,38),...profiles],custom:original.custom,revision:original.revision})).status,200);
 const token=(await req('/api/invites','POST',{profile:profiles[0].id})).data.token;
 const other=(await req('/api/invites','POST',{profile:profiles[1].id})).data.token;
 const created=await req('/api/classes','POST',{name:'Klasa lokale e provës',grade:1});assert.equal(created.status,200);classId=created.data.id;
 assert.equal((await req('/api/classes','POST',{name:'Jo',grade:1},token)).status,403);
 assert.equal((await req('/api/classes','PUT',{class:classId,profile:profiles[1].id})).status,400);
 assert.equal((await req('/api/classes','PATCH',{code:created.data.code},other)).status,404);
 assert.equal((await req('/api/classes','PATCH',{code:created.data.code},token)).status,200);
 const assignment=await req('/api/assignments','POST',{class:classId,title:'Mision lokal',category:'mixed',level:1,count:5,due:new Date(Date.now()+86400000).toISOString()});assert.equal(assignment.status,200);
 assert.equal((await req('/api/assignments','POST',{class:classId,title:'Jo',category:'mixed',level:1,count:5,due:new Date(Date.now()+86400000).toISOString()},token)).status,403);
 const student=(await req('/api/classes','GET',undefined,token)).data;assert.equal(student.classes[0].id,classId);assert(!student.classes[0].code);assert.deepEqual(student.classes[0].profiles,[profiles[0].id]);assert.equal(student.assignments[0].id,assignment.data.id);
 assert(!(await req('/api/classes','GET',undefined,other)).data.assignments.length);
 assert.equal((await req('/api/adventures','POST',{grade:2,profile:profiles[1].id,category:'mixed',count:5,assignment:assignment.data.id},other)).status,404);
 const known=new Map(catalogSeed().map(p=>[p.id,p]));
 async function complete(level,assignmentId){
  const started=await req('/api/adventures','POST',{grade:1,profile:profiles[0].id,category:'mixed',count:5,level,assignment:assignmentId},token);assert.equal(started.status,200,JSON.stringify(started.data));const a=started.data;assert.equal(a.items.length,5);const answers=[];
  for(let i=0;i<a.items.length;i++){const p=a.items[i];assert(!('answer' in p));assert(!('hint' in p));const result=await req('/api/adventures','PATCH',{id:a.id,index:i,value:(p.lessonId?curriculumPuzzle(p.lessonId,p.lessonLevel):known.get(p.id)).answer},token);assert.equal(result.status,200,JSON.stringify(result.data));assert(result.data.correct);answers.push({cat:p.cat,correct:false,question:'Client cannot forge',note:'Arsyetim prove'});}
  assert.equal((await req('/api/student','POST',{id:a.id,profile:profiles[0].id,grade:1,answers,verified:true,level:3,assignment:crypto.randomUUID()},token)).status,200);return a.id;
 }
 const assignedId=await complete(3,assignment.data.id);await complete(1);await complete(2);await complete(3);
 const levelCertificate=await fetch(origin+'/api/documents?kind=certificate&grade=1&level=1&profile='+profiles[0].id,{headers:{Authorization:'Bearer '+token}});assert.equal(levelCertificate.status,200);assert((await levelCertificate.text()).includes('nivelit 1'));
 const teacher=(await req('/api/classes')).data;assert(teacher.sessions.some(s=>s.id===assignedId&&s.assignment===assignment.data.id&&s.level===null&&s.stars===3));assert(teacher.sessions.filter(s=>s.profile===profiles[0].id).every(s=>s.duration>=0&&s.answers.every(a=>a.correct)));
 for(const kind of ['certificate','worksheet','report','csv']){const query=new URLSearchParams({kind,grade:'1',...(kind==='certificate'?{profile:profiles[0].id}:kind==='worksheet'?{category:'mixed'}:{class:classId})});const r=await fetch(origin+'/api/documents?'+query,{headers:{Cookie:cookie}});assert.equal(r.status,200,await r.clone().text());const buffer=Buffer.from(await r.arrayBuffer());assert(kind==='csv'?buffer.toString().includes('Produit Test 1'):buffer.toString('latin1').startsWith('%PDF'));if(kind==='worksheet'){await mkdir('.wrangler/pdf-qa',{recursive:true});await writeFile('.wrangler/pdf-qa/worksheet.pdf',buffer);}}
 assert.equal((await req('/api/documents?kind=report&grade=1&class='+classId,'GET',undefined,token)).status,403);
 assert.equal((await req('/api/documents?kind=certificate&grade=1&profile='+profiles[0].id,'GET',undefined,other)).status,403);
 assert.equal((await req('/api/classes','PUT',{class:crypto.randomUUID(),profile:profiles[0].id})).status,404);
 console.log('Product API passed: class creation, grade-safe join, assignment isolation, server-controlled set/score/time, three levels, earned certificate, CSV/PDF and student privacy.');
}finally{
 for(const profile of profiles){const w=(await req('/api/workspace')).data;assert.equal((await req('/api/workspace','DELETE',{profile:profile.id,revision:w.revision,confirmation:'FSHI'})).status,200);}
 const w=(await req('/api/workspace')).data;assert.equal((await req('/api/workspace','PUT',{profiles:original.profiles,custom:original.custom,revision:w.revision})).status,200);
 if(classId){assert(/^[a-f0-9-]{36}$/.test(classId));await localSQL(`DELETE FROM classes WHERE id='${classId}' AND owner='local_seedy';`);}
}
