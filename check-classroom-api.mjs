import {curriculumLessons} from './lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from './lib/expanded-curriculum.mjs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFile,rm} from 'node:fs/promises';
import {catalogSeed} from './lib/catalog-seed.mjs';
const origin='http://127.0.0.1:5173';
const cookie=(await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'})).headers.get('set-cookie')?.split(';')[0];assert(cookie);
async function req(path,method='GET',data,token,anonymous=false){const headers={Origin:origin};if(token)headers.Authorization='Bearer '+token;else if(!anonymous)headers.Cookie=cookie;if(data)headers['Content-Type']='application/json';const r=await fetch(origin+path,{method,headers,body:data?JSON.stringify(data):undefined});return {status:r.status,data:await r.json()};}
async function sql(command){const path='.wrangler/classroom-test.sql';await writeFile(path,command);try{const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--file',path],{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);}finally{await rm(path,{force:true});}}
const before=await req('/api/workspace');assert.equal(before.status,200);const original=before.data;const ids=[];let students=[];
try{
 for(const name of ['Test 1A','Test 1B','Test 4A']){const c=await req('/api/classes','POST',{name,grade:name.includes('4')?4:1});assert.equal(c.status,200,JSON.stringify(c));ids.push(c.data.id);}
 const classA=ids[0];
 assert.equal((await req('/api/roster','POST',{class:classA,action:'add',names:['Ana lokale','Ardi lokal']})).status,200);
 const roster=(await req('/api/roster?class='+classA)).data.students;assert.equal(roster.length,2);students=roster.map(p=>p.id);assert(roster.every(p=>p.picture));
 const classes=(await req('/api/classes')).data.classes,code=classes.find(c=>c.id===classA).code;
 const lookup=await req('/api/class-login','POST',{code:code.toLowerCase()},undefined,true);assert.equal(lookup.status,200);assert.equal(lookup.data.students.length,2);assert(!JSON.stringify(lookup.data).includes('picture'));
 assert.equal((await req('/api/class-login','PUT',{challenge:lookup.data.challenge,profile:roster[0].id,picture:roster[0].picture==='sun'?'moon':'sun'},undefined,true)).status,401);
 const logged=await req('/api/class-login','PUT',{challenge:lookup.data.challenge,profile:roster[0].id,picture:roster[0].picture},undefined,true);assert.equal(logged.status,200);const token=logged.data.token;
 assert.equal((await req('/api/student','GET',undefined,token)).data.profile.id,roster[0].id);
 assert.equal((await req('/api/roster?class='+classA,'GET',undefined,token)).status,403);
 assert.equal((await req('/api/workspace','GET',undefined,token)).status,403);
 assert.equal((await req('/api/adventures','POST',{grade:1,profile:roster[0].id,category:'mixed',count:5},token)).status,403);
 // Teacher previews authorize teachers only and never write learning records.
 const previewLesson=curriculumLessons(4)[0],selection={grade:4,choice:'lesson:'+previewLesson.id,level:10};
 const query=new URLSearchParams({...selection,grade:'4',level:'10'});
 assert.equal((await req('/api/teacher-preview?'+query,'GET',undefined,undefined,true)).status,401);
 assert.equal((await req('/api/teacher-preview?'+query,'GET',undefined,token)).status,403);
 const recordsBefore=(await req('/api/class-progress?class='+classA)).data;
 const sample=await req('/api/teacher-preview?'+query);assert.equal(sample.status,200,JSON.stringify(sample));assert(!sample.data.puzzle.answer);assert.equal(sample.data.persistsProgress,false);
 const checked=await req('/api/teacher-preview','POST',{selection,value:curriculumPuzzle(previewLesson.id,10).answer});assert.equal(checked.status,200);assert.equal(checked.data.correct,true);
 assert.deepEqual((await req('/api/class-progress?class='+classA)).data,recordsBefore);
 assert.equal((await req('/api/teacher-preview?'+new URLSearchParams({grade:'4',choice:selection.choice,level:'31'}))).status,400);
 const crossTask={title:previewLesson.title,category:'mixed',level:1,count:5,due:'',lessonId:previewLesson.id,lessonLevel:10,sourceGrade:4};
 assert.equal((await req('/api/class-assignments','POST',{classes:[classA],task:crossTask})).status,409);
 const cross=await req('/api/class-assignments','POST',{classes:[classA],task:{...crossTask,allowGradeMismatch:true}});assert.equal(cross.status,200,JSON.stringify(cross));
 const crossAdventure=await req('/api/adventures','POST',{grade:1,profile:roster[0].id,category:'mixed',count:5,assignment:cross.data.ids[0]},token);assert.equal(crossAdventure.status,200,JSON.stringify(crossAdventure));assert.equal(crossAdventure.data.grade,1);assert.equal(crossAdventure.data.items[0].lessonId,previewLesson.id);
 const crossAnswer=await req('/api/adventures','PATCH',{id:crossAdventure.data.id,index:0,value:curriculumPuzzle(previewLesson.id,10).answer},token);assert.equal(crossAnswer.status,200);assert(crossAnswer.data.correct);
 const task={title:'Mision i përbashkët',category:'mixed',level:1,count:5,due:''};
 assert.equal((await req('/api/class-assignments','POST',{classes:[classA,ids[2]],task})).status,400);
 const assigned=await req('/api/class-assignments','POST',{classes:[classA,ids[1]],task});assert.equal(assigned.status,200);assert.equal(assigned.data.ids.length,2);
 const openTasks=(await req('/api/classes')).data.assignments;assert(openTasks.filter(a=>assigned.data.ids.includes(a.id)).every(a=>a.due===''));
 const studentData=(await req('/api/classes','GET',undefined,token)).data;assert.equal(studentData.classes.length,1);assert(!studentData.classes[0].code);assert.deepEqual(studentData.classes[0].profiles,[roster[0].id]);assert.equal(studentData.assignments.length,1);
 assert.equal((await req('/api/adventures','POST',{grade:1,profile:roster[0].id,category:'mixed',count:5,assignment:assigned.data.ids[1]},token)).status,404);
 const a=(await req('/api/adventures','POST',{grade:1,profile:roster[0].id,category:'mixed',count:5,assignment:assigned.data.ids[0]},token)).data;assert(a.id);
 const inProgress=(await req('/api/class-progress?class='+classA)).data;assert(inProgress.started.some(p=>p.profile===roster[0].id));
 const known=new Map(catalogSeed().map(p=>[p.id,p]));const answers=[];
 for(let i=0;i<a.items.length;i++){const p=a.items[i];assert(!p.answer);const result=await req('/api/adventures','PATCH',{id:a.id,index:i,value:(p.lessonId?curriculumPuzzle(p.lessonId,p.lessonLevel):known.get(p.id)).answer},token);assert.equal(result.status,200,JSON.stringify(result));answers.push({cat:p.cat,correct:false,question:'Fake client score'});}
 assert.equal((await req('/api/student','POST',{id:a.id,grade:1,profile:roster[0].id,answers},token)).status,200);
 const progress=(await req('/api/class-progress?class='+classA)).data;assert(progress.sessions.some(s=>s.id===a.id&&s.assignment===assigned.data.ids[0]&&s.answers.every(a=>a.correct)));
 const second=await req('/api/class-assignments','POST',{classes:[classA],task});assert.equal(second.status,200);
 const packs=(await req('/api/classes')).data.assignments.filter(t=>t.class===classA&&t.mixed_number);assert.deepEqual(packs.map(t=>t.mixed_number).sort(),[1,2]);const firstIds=new Set(JSON.parse(packs.find(t=>t.mixed_number===1).mixed_items).map(r=>r.id+':'+r.level));assert(JSON.parse(packs.find(t=>t.mixed_number===2).mixed_items).every(r=>!firstIds.has(r.id+':'+r.level)));
 const robotAssigned=await req('/api/class-assignments','POST',{classes:[classA],task:{...task,scene:'robot',gameLevel:20}});assert.equal(robotAssigned.status,200);
 const replaced=(await req('/api/classes','GET',undefined,token)).data;assert.equal(replaced.assignments.length,1);assert.equal(replaced.assignments[0].id,robotAssigned.data.ids[0]);assert(replaced.sessions.some(s=>s.id===a.id&&s.stars===3));
 const history=(await req('/api/classes')).data.assignments;assert.equal(history.find(t=>t.id===assigned.data.ids[0]).active,0);assert.equal(history.find(t=>t.id===robotAssigned.data.ids[0]).active,1);
 assert.equal((await req('/api/adventures','POST',{grade:1,profile:roster[0].id,category:'mixed',count:5,assignment:assigned.data.ids[0]},token)).status,404);
 assert.equal((await req('/api/adventures?id='+a.id+'&index=0','GET',undefined,token)).status,404);
 const robot=await req('/api/adventures','POST',{grade:1,profile:roster[0].id,category:'mixed',count:10,assignment:robotAssigned.data.ids[0]},token);assert.equal(robot.status,200);assert.equal(robot.data.items.length,1);assert.equal(robot.data.items[0].gameLevel,20);assert.equal(robot.data.items[0].type,'robot');
 assert.equal((await req('/api/roster','POST',{action:'rename',class:classA,profile:roster[0].id,name:'Emër i ri'})).status,200);
 assert.equal((await req('/api/roster','POST',{action:'renameClass',class:classA,name:'1A e re'})).status,200);
 const cards=await fetch(origin+'/api/login-cards?class='+classA,{headers:{Cookie:cookie}});assert.equal(cards.status,200);assert((await cards.text()).includes('Emër i ri'));
 assert.equal((await req('/api/roster','POST',{action:'picture',class:classA,profile:roster[0].id,picture:'star'})).status,200);
 assert.equal((await req('/api/student','GET',undefined,token)).status,401);
 const next=await req('/api/class-login','PUT',{challenge:lookup.data.challenge,profile:roster[0].id,picture:'star'},undefined,true);assert.equal(next.status,200);
 assert.equal((await req('/api/roster','POST',{action:'archive',class:classA})).status,200);
 assert.equal((await req('/api/student','GET',undefined,next.data.token)).status,401);
 assert.equal((await req('/api/class-login','POST',{code},undefined,true)).status,404);
 assert.equal((await req('/api/roster','POST',{action:'restore',class:classA})).status,200);
 assert.equal((await req('/api/roster','POST',{action:'remove',class:classA,profile:roster[1].id})).status,200);
 assert.equal((await req('/api/roster?class='+classA)).data.students.length,1);
 assert.equal((await req('/api/class-assignments','PUT',{id:assigned.data.ids[0],task:{...task,title:'Titull i ri'}})).status,200);
 assert.equal((await req('/api/class-assignments','DELETE',{id:assigned.data.ids[0]})).status,200);
 assert.equal((await req('/api/roster','POST',{action:'renameClass',class:crypto.randomUUID(),name:'Foreign'})).status,404);
 assert.equal((await req('/api/roster','POST',{action:'purgeClass',class:ids[1],confirmation:'FSHI'})).status,400);
 assert.equal((await req('/api/roster','POST',{action:'archive',class:ids[1]})).status,200);
 assert.equal((await req('/api/roster','POST',{action:'purgeClass',class:ids[1],confirmation:'FSHI'})).status,200);
 assert(!(await req('/api/classes')).data.classes.some(c=>c.id===ids[1]));
 // Per-student throttling cannot be reset by requesting a fresh roster challenge.
 let finalStatus;for(let i=0;i<6;i++){const limited=await req('/api/class-login','PUT',{challenge:lookup.data.challenge,profile:roster[0].id,picture:'sun'},undefined,true);assert([401,429].includes(limited.status));finalStatus=limited.status;}assert.equal(finalStatus,429);
 console.log('Classroom API passed: batch roster, case-insensitive code, private picture login, role and class isolation, assignments for parallel classes, exact robot level, in-progress and verified results, rename, picture reset revocation, archive/restore, removal, task CRUD and throttling.');
}finally{
 for(const id of ids)assert(/^[a-f0-9-]{36}$/.test(id));
 for(const profile of students){const w=(await req('/api/workspace')).data;assert.equal((await req('/api/workspace','DELETE',{profile,revision:w.revision,confirmation:'FSHI'})).status,200);}
 const w=(await req('/api/workspace')).data;assert.equal((await req('/api/workspace','PUT',{profiles:original.profiles,custom:original.custom,revision:w.revision})).status,200);
 if(ids.length)await sql('DELETE FROM classes WHERE id IN ('+ids.map(id=>"'"+id+"'").join(',')+") AND owner='local_seedy';");
}
