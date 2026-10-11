import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const origin='http://127.0.0.1:5173';
const login=await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});
const cookie=login.headers.get('set-cookie')?.split(';')[0];assert(cookie,'Local mock login must return a cookie');
async function req(path,method='GET',data,token){const headers={Origin:origin};if(token)headers.Authorization='Bearer '+token;else headers.Cookie=cookie;if(data)headers['Content-Type']='application/json';let r;for(let attempt=0;attempt<3;attempt++){try{r=await fetch(origin+path,{method,headers,body:data?JSON.stringify(data):undefined});break;}catch(error){if(method!=='GET'||attempt===2)throw error;}}return {status:r.status,data:await r.json()};}
function localRole(role,reset=false){const r=spawnSync(process.execPath,['scripts/seed.mjs','--local','--test-'+role,...(reset?['--reset-test-limits']:[])],{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);}
localRole('teacher',true);
assert.equal((await fetch(origin+'/api/workspace')).status,401);
const spoof=await fetch(origin+'/api/workspace',{headers:{'oai-authenticated-user-id':'local_seedy','oai-authenticated-user-email':'seedy@sites.test'}});assert.equal(spoof.status,401);
let w=(await req('/api/workspace')).data;
const original={profiles:w.profiles,custom:w.custom};
const p={id:crypto.randomUUID(),name:'Provë Sigurie',grade:2},p2={id:crypto.randomUUID(),name:'Provë Izolimi',grade:2};
try {
const custom=Array.from({length:3},()=>({id:crypto.randomUUID(),grade:2,cat:'logic',title:'Provë: sa është 1?',visual:'1',options:['1','2','3'],answer:'1',hint:'Shiko numrin.',explain:'Numri i shfaqur është 1.'}));
const config={profiles:[...w.profiles.slice(0,35),p,p2],custom:[...w.custom.filter(q=>q.grade!==2), ...custom],revision:w.revision};
assert.equal((await req('/api/workspace','PUT',config)).status,200);
assert.equal((await req('/api/workspace','PUT',config)).status,409);
assert.equal((await req('/api/workspace','PUT',{...config,role:'ADMIN'})).status,400);
const token=(await req('/api/invites','POST',{profile:p.id})).data.token;
const other=(await req('/api/invites','POST',{profile:p2.id})).data.token;
assert(token && other);
const student=await req('/api/student','GET',undefined,token);assert.equal(student.status,200);assert.equal(student.data.profile.id,p.id);assert(!('profiles' in student.data));assert(student.data.custom.every(q=>!('answer' in q)&&!('explain' in q)&&!('hint' in q)));
for(const [path,method,data] of [['/api/workspace','GET'],['/api/workspace','PUT',config],['/api/workspace','DELETE',{profile:p.id,revision:0,confirmation:'FSHI'}],['/api/invites','POST',{profile:p.id}],['/api/invites','DELETE',{profile:p.id}],['/api/sessions','POST',{}]])assert.equal((await req(path,method,data,token)).status,403,path);
assert.equal((await req('/api/student','GET',undefined,'0'.repeat(64))).status,401);
assert.equal((await req('/api/student')).status,403);
assert.equal((await req('/api/games?grade=2&profile='+p.id,'GET',undefined,token)).status,200);
assert.equal((await req('/api/games?grade=2&profile='+p2.id,'GET',undefined,token)).status,403);
assert.equal((await req('/api/games?grade=4&profile='+p.id,'GET',undefined,token)).status,403);
assert.equal((await req('/api/games?grade=5&profile='+p.id)).status,400);
assert.equal((await req('/api/games?grade=2&profile=unknown')).status,404);
assert.equal((await req('/api/adventures','POST',{grade:2,profile:p.id,category:'play',scene:'pipes',count:5,gameLevel:21},token)).status,400);
assert.equal((await req('/api/adventures','POST',{grade:2,profile:p.id,category:'play',count:5,gameLevel:1},token)).status,400);
assert.equal((await req('/api/adventures','POST',{grade:2,profile:p.id,category:'play',scene:'pipes',count:5,level:3},token)).status,400);
const played=await req('/api/adventures','POST',{grade:2,profile:p.id,category:'play',scene:'pipes',count:5,gameLevel:20},token);assert.equal(played.status,200);assert.equal(played.data.items.length,1);assert.equal(played.data.items[0].gameLevel,20);
const pipeAnswer=JSON.stringify(played.data.items[0].interaction.pipes.map(()=>0));assert.equal((await req('/api/adventures','PATCH',{id:played.data.id,index:0,value:pipeAnswer},token)).data.correct,true);
const completedGame={id:played.data.id,profile:p.id,grade:2,answers:[{cat:'spatial',question:'Forged metadata',correct:false}]};
assert.equal((await req('/api/student','POST',{...completedGame,gameLevel:1},token)).status,400);
assert.equal((await req('/api/student','POST',completedGame,token)).status,200);
const gameProgress=await req('/api/games?grade=2&profile='+p.id,'GET',undefined,token);const record=gameProgress.data.progress.find(x=>x.scene==='pipes'&&x.level===20);assert.equal(record.mastered,1);assert.equal(record.stars,3);
assert.equal((await req('/api/games?grade=2&profile='+p2.id)).data.progress.length,0);
assert.equal((await req('/api/games?grade=1&profile='+p.id)).data.progress.length,0);
assert.equal((await req('/api/adventures','POST',{grade:4,profile:p.id,category:'logic',count:5},token)).status,403);
assert.equal((await req('/api/adventures','POST',{grade:2,profile:p2.id,category:'logic',count:5},token)).status,403);
const started=await req('/api/adventures','POST',{grade:2,profile:p.id,category:'custom',count:5},token);assert.equal(started.status,200);const a=started.data;assert(a.items.length>=3);
for(const q of a.items){assert(!('answer' in q));assert(!('hint' in q));assert(!('explain' in q));}
assert.equal((await req('/api/adventures?id='+a.id+'&index=0','GET',undefined,other)).status,404);
assert.equal((await req('/api/adventures','PATCH',{id:a.id,index:1,value:'2'},token)).status,409);
assert.equal((await req('/api/adventures','PATCH',{id:a.id,index:0,value:'2',correct:true},token)).status,400);
assert.equal((await req('/api/adventures?id='+a.id+'&index=0','GET',undefined,token)).status,200);
const answers=[];
for(let i=0;i<a.items.length;i++){
 const results=await Promise.all([req('/api/adventures','PATCH',{id:a.id,index:i,value:'2'},token),req('/api/adventures','PATCH',{id:a.id,index:i,value:'2'},token)]);
 assert(results.every(r=>r.status===200),JSON.stringify(results));assert(results.every(r=>r.data.correct===false));
 assert.equal((await req('/api/adventures','PATCH',{id:a.id,index:i,value:'1'},token)).status,409);
 answers.push({cat:'math',question:'Falsifikuar',correct:true,note:'Shënim prove'});
}
const s={id:a.id,profile:p.id,grade:2,answers,verified:true};
assert.equal((await req('/api/student','POST',{...s,grade:4},token)).status,400);
assert.equal((await req('/api/student','POST',{...s,id:crypto.randomUUID()},token)).status,404);
const saved=await Promise.all([req('/api/student','POST',s,token),req('/api/student','POST',s,token)]);assert(saved.every(r=>r.status===200));
w=(await req('/api/workspace')).data;const stored=w.sessions.filter(x=>x.id===s.id);assert.equal(stored.length,1);assert(stored[0].verified);assert(stored[0].answers.every(x=>!x.correct && x.cat==='logic' && x.question!== 'Falsifikuar'));
assert(!(await req('/api/student','GET',undefined,other)).data.sessions.some(x=>x.id===s.id));
assert.equal((await req('/api/invites','DELETE',{profile:p.id})).status,200);
assert.equal((await req('/api/student','GET',undefined,token)).status,401);
let removalState=(await req('/api/workspace')).data;
assert.equal((await req('/api/workspace','DELETE',{profile:p.id,revision:removalState.revision})).status,400);
assert.equal((await req('/api/workspace','DELETE',{profile:p.id,revision:removalState.revision-1,confirmation:'FSHI'})).status,409);
assert.equal((await req('/api/workspace','DELETE',{profile:p.id,revision:removalState.revision,confirmation:'FSHI'})).status,200);
removalState=(await req('/api/workspace')).data;assert(!removalState.sessions.some(row=>row.id===s.id));assert(removalState.profiles.some(row=>row.id===p2.id));
const cross=await fetch(origin+'/api/workspace',{method:'PUT',headers:{Origin:'https://unrelated.example',Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(config)});assert.equal(cross.status,403);
localRole('student');
for(const path of ['/api/workspace','/api/student'])assert.equal((await req(path)).status,403);
localRole('admin');assert.equal((await req('/api/workspace')).data.role,'ADMIN');
localRole('teacher');assert.equal((await req('/api/workspace')).data.role,'TEACHER');
let throttled=false;
for(let i=0;i<12;i++){const result=await req('/api/invites','POST',{profile:p2.id});if(result.status===429){throttled=true;break;}}
assert(throttled,'Invite creation is rate-limited');
let authThrottled=false;
for(let i=0;i<65;i++){const result=await req('/api/student','GET',undefined,other);if(result.status===429){authThrottled=true;break;}}
assert(authThrottled,'Student authentication is rate-limited');
console.log('API security passed: all roles, stripped spoof headers, student/profile isolation, Zod, safe payloads, sequence/races, forged score rejection, revocation, CSRF and rate limits.');

} finally {
 localRole('teacher',true);
 for(const profile of [p.id,p2.id]){const state=(await req('/api/workspace')).data;assert.equal((await req('/api/workspace','DELETE',{profile,revision:state.revision,confirmation:'FSHI'})).status,200);}
 const state=(await req('/api/workspace')).data;assert.equal((await req('/api/workspace','PUT',{...original,revision:state.revision})).status,200);
}
