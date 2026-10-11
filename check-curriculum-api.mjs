import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFile,rm} from 'node:fs/promises';
import {curriculumLessons} from './lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from './lib/expanded-curriculum.mjs';
const origin='http://127.0.0.1:5173';
const seed=spawnSync(process.execPath,['scripts/seed.mjs','--local','--test-teacher','--reset-test-limits'],{encoding:'utf8'});assert.equal(seed.status,0,seed.stderr||seed.stdout);
const cookie=(await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'})).headers.get('set-cookie')?.split(';')[0];assert(cookie);
async function req(path,method='GET',data,token,anonymous=false){const headers={Origin:origin};if(token)headers.Authorization='Bearer '+token;else if(!anonymous)headers.Cookie=cookie;if(data)headers['Content-Type']='application/json';const r=await fetch(origin+path,{method,headers,body:data?JSON.stringify(data):undefined});return {status:r.status,data:await r.json()};}
async function sql(command){const path='.wrangler/curriculum-test.sql';await writeFile(path,command);try{const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--file',path],{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);}finally{await rm(path,{force:true});}}
const before=(await req('/api/workspace')).data,classes=[],adventures=[];let students=[];
try{
 for(const grade of [1,4]){
  const lesson=curriculumLessons(grade).find(l=>l.domain==='robotics'),base={grade,profile:'',category:'mixed',count:5,lessonId:lesson.id,lessonLevel:30};
  assert.equal((await req('/api/demo?'+new URLSearchParams({grade:String(grade),lessonId:lesson.id}),'GET',undefined,undefined,true)).data.puzzle.gameLevel,1);
  assert.equal((await req('/api/demo?'+new URLSearchParams({grade:String(grade),lessonId:lesson.id,lessonLevel:'2'}),'GET',undefined,undefined,true)).status,400);
  assert.equal((await req('/api/adventures','POST',{...base,lessonLevel:31})).status,400);
  assert.equal((await req('/api/adventures','POST',{...base,grade:grade===1?4:1})).status,400);
  const issued=await req('/api/adventures','POST',base);assert.equal(issued.status,200,JSON.stringify(issued));assert.equal(issued.data.items.length,1);adventures.push(issued.data.id);assert.equal(issued.data.lessonLevel,30);assert(!('answer' in issued.data.items[0]));
  const answer=await req('/api/adventures','PATCH',{id:issued.data.id,index:0,value:curriculumPuzzle(lesson.id,30).answer});assert.equal(answer.status,200);assert(answer.data.correct);
  const saved=await req('/api/sessions','POST',{id:issued.data.id,profile:'',grade,answers:[{cat:'errors',correct:false,question:'forged'}]});assert.equal(saved.status,200);assert(saved.data.answers[0].correct);
  const progress=await req('/api/curriculum?grade='+grade+'&profile=');assert.equal(progress.status,200);assert(progress.data.progress.some(p=>p.lessonId===lesson.id&&p.level===30&&p.mastered===1));
 }
 for(const name of ['Curriculum test A','Curriculum test B']){const c=await req('/api/classes','POST',{name,grade:1});assert.equal(c.status,200);classes.push(c.data.id);}
 assert.equal((await req('/api/roster','POST',{class:classes[0],action:'add',names:['Curriculum lokal']})).status,200);const roster=(await req('/api/roster?class='+classes[0])).data.students;students=roster.map(p=>p.id);
 const lesson=curriculumLessons(1).find(l=>l.domain==='math'),task={title:'Curriculum test assignment',category:'mixed',level:1,count:5,due:new Date(Date.now()+86400000).toISOString(),lessonId:lesson.id,lessonLevel:30};
 assert.equal((await req('/api/class-assignments','POST',{classes,task:{...task,lessonId:curriculumLessons(4)[0].id}})).status,400);
 const assigned=await req('/api/class-assignments','POST',{classes,task});assert.equal(assigned.status,200,JSON.stringify(assigned));
 const data=(await req('/api/classes')).data,c=data.classes.find(c=>c.id===classes[0]);assert.equal(data.assignments.find(a=>a.id===assigned.data.ids[0]).lesson_level,30);
 const lookup=await req('/api/class-login','POST',{code:c.code.toLowerCase()},undefined,true);const login=await req('/api/class-login','PUT',{challenge:lookup.data.challenge,profile:roster[0].id,picture:roster[0].picture},undefined,true);assert.equal(login.status,200);const token=login.data.token;
 const base={grade:1,profile:roster[0].id,category:'mixed',count:5};assert.equal((await req('/api/adventures','POST',{...base,lessonId:lesson.id,lessonLevel:2},token)).status,403);
 assert.equal((await req('/api/adventures','POST',{...base,assignment:assigned.data.ids[1]},token)).status,404);
 const issued=await req('/api/adventures','POST',{...base,assignment:assigned.data.ids[0]},token);assert.equal(issued.status,200,JSON.stringify(issued));assert.equal(issued.data.lessonId,lesson.id);assert.equal(issued.data.lessonLevel,30);adventures.push(issued.data.id);
 assert((await req('/api/adventures','PATCH',{id:issued.data.id,index:0,value:curriculumPuzzle(lesson.id,30).answer},token)).data.correct);
 assert.equal((await req('/api/student','POST',{id:issued.data.id,grade:1,profile:roster[0].id,answers:[{cat:'math',correct:false,question:'forged'}]},token)).status,200);
 assert((await req('/api/class-progress?class='+classes[0])).data.sessions.some(s=>s.id===issued.data.id&&s.assignment===assigned.data.ids[0]));
 assert.equal((await req('/api/curriculum?grade=4&profile='+roster[0].id,'GET',undefined,token)).status,403);
 assert.equal((await req('/api/class-assignments','PUT',{id:assigned.data.ids[0],task:{...task,lessonLevel:1}})).status,200);
 assert.equal((await req('/api/class-assignments','DELETE',{id:assigned.data.ids[1]})).status,200);
 console.log('Local curriculum API: level30 server issuing/scoring, grade denial, visitor1only, parallel assignments, picture-login scoped access and teacher progress passed.');
}finally{
 const quote=x=>"'"+x.replaceAll("'","''")+"'";const ids=adventures.map(quote).join(',');let cleanup=ids?`DELETE FROM attempt_answers WHERE adventure IN (${ids}); DELETE FROM sessions WHERE id IN (${ids}); DELETE FROM adventures WHERE id IN (${ids});`:'';
 if(classes.length)cleanup+=`DELETE FROM classes WHERE id IN (${classes.map(quote).join(',')});`;if(students.length)cleanup+=`DELETE FROM adventures WHERE profile IN (${students.map(quote).join(',')});`;
 if(cleanup)await sql(cleanup);const latest=(await req('/api/workspace')).data;assert.equal((await req('/api/workspace','PUT',{profiles:before.profiles,custom:before.custom,revision:latest.revision})).status,200);
}
