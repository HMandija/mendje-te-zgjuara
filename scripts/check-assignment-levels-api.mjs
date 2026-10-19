import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {curriculumLessons} from '../lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from '../lib/expanded-curriculum.mjs';

const base=process.env.ASSIGNMENT_TEST_URL||'http://127.0.0.1:8787';
assert(['127.0.0.1','localhost'].includes(new URL(base).hostname),'This test only writes disposable fixtures to localhost.');
const suffix=randomUUID(),owner='assignment-qa-'+suffix,profile='assignment-pupil-'+suffix,classId='assignment-class-'+suffix,id='assignment-task-'+suffix;
const token=randomBytes(32).toString('hex'),hash=createHash('sha256').update(token).digest('hex'),lesson=curriculumLessons(1)[0];
const file='.wrangler/assignment-api-'+suffix+'.sql',quote=x=>"'"+String(x).replaceAll("'","''")+"'";
function sql(command){fs.writeFileSync(file,command);const result=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/robot-world-local-state','--file',file,'--json'],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr||result.stdout);}
// Wrangler's synchronous fixture updates can outlast an idle pooled connection.
// Close test connections explicitly; never retry a possibly accepted POST.
async function request(path,method='GET',body){const response=await fetch(base+path,{method,headers:{Authorization:'Bearer '+token,Origin:base,Connection:'close',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json()};}
const firstTen=Array.from({length:10},(_,i)=>i+1),start=n=>request('/api/adventures','POST',{grade:1,profile,category:'mixed',count:5,assignment:id,assignmentLevel:n});
let created=false;
try{
 sql(`INSERT INTO accounts(user,role) VALUES(${quote(owner)},'TEACHER');
 INSERT INTO workspaces(owner,payload) VALUES(${quote(owner)},${quote(JSON.stringify({profiles:[{id:profile,name:'Provë automatike',grade:1}],custom:[]}))});
 INSERT INTO schools(id,owner,name) VALUES(${quote(owner)},${quote(owner)},'Fixture');
 INSERT INTO classes(id,school,owner,name,grade,code) VALUES(${quote(classId)},${quote(owner)},${quote(owner)},'Fixture',1,${quote(suffix)});
 INSERT INTO class_students(class,profile) VALUES(${quote(classId)},${quote(profile)});
 INSERT INTO picture_sessions(hash,class,profile,expires) VALUES(${quote(hash)},${quote(classId)},${quote(profile)},${Date.now()+3600000});
 INSERT INTO assignments(id,class,title,category,level,count,due,lesson_id,lesson_level,source_grade,allowed_levels) VALUES(${quote(id)},${quote(classId)},'Fixture','mixed',1,5,'',${quote(lesson.id)},1,1,${quote(JSON.stringify(firstTen))});`);created=true;
 const own=await request('/api/classes');assert.equal(own.status,200);assert.equal(own.data.assignments.length,1);assert.deepEqual(JSON.parse(own.data.assignments[0].allowed_levels),firstTen);
 for(const n of [1,5,10]){const response=await start(n);assert.equal(response.status,200,JSON.stringify(response.data));assert.equal(response.data.lessonLevel,n);assert.equal(response.data.items[0].lessonLevel,n);assert(!('answer' in response.data.items[0]));}
 assert.equal((await start(11)).status,403);assert.equal((await start(30)).status,403);
 const run=await start(10);assert.equal(run.status,200);
 const answer=await request('/api/adventures','PATCH',{id:run.data.id,index:0,value:curriculumPuzzle(lesson.id,10).answer});assert.equal(answer.status,200);assert(answer.data.correct);
 const saved=await request('/api/student','POST',{id:run.data.id,profile,grade:1,answers:[{cat:'logic',question:'Client ignored',correct:false}]});assert.equal(saved.status,200);assert.equal(saved.data.stars,3);
 let history=(await request('/api/student')).data.sessions;const completed=history.find(s=>s.id===run.data.id);assert.equal(completed.lessonLevel,10);assert.equal(completed.assignment,id);assert.equal(completed.stars,3);
 const pending=await start(1);assert.equal(pending.status,200);
 sql(`UPDATE assignments SET allowed_levels='[11]' WHERE id=${quote(id)};`);
 assert.equal((await start(1)).status,403);assert.equal((await request('/api/adventures','PATCH',{id:pending.data.id,index:0,value:curriculumPuzzle(lesson.id,1).answer})).status,403);
 assert.equal((await start(11)).status,200);
 history=(await request('/api/student')).data.sessions;assert.deepEqual(history.find(s=>s.id===run.data.id),completed);
 assert.equal((await request('/api/class-assignments','PUT',{id,task:{}})).status,403,'A real student session cannot modify teacher assignments');
 console.log('Local Worker/D1: synthetic picture login, stored levels, exact content for 1/5/10, locked 11/30 rejection, verified completion with level-specific stars, disabling an in-flight level, enabling level 11 and preserved history passed. Disposable fixtures only; no remote requests.');
}finally{
 if(created)sql(`DELETE FROM sessions WHERE owner=${quote(owner)}; DELETE FROM adventures WHERE owner=${quote(owner)}; DELETE FROM classes WHERE owner=${quote(owner)}; DELETE FROM schools WHERE owner=${quote(owner)}; DELETE FROM workspaces WHERE owner=${quote(owner)}; DELETE FROM accounts WHERE user=${quote(owner)};`);
 fs.rmSync(file,{force:true});
}
