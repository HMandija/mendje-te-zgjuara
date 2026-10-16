import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {z} from 'zod';
import {DatabaseSync} from 'node:sqlite';
import {loadRobotRules} from './scripts/load-robot-world-rules.mjs';
const rules=await loadRobotRules();
const {initialWorld,applyWorld,challenges,worldStars,routeTrace,robotSchema}=rules;
for(let grade=1;grade<=4;grade++){
 let state=initialWorld();const list=challenges(grade);assert.equal(list.length,12);assert.throws(()=>applyWorld(state,{id:crypto.randomUUID(),action:'answer',challenge:list[1].id,value:'0'},grade));
 for(const c of list){const wrong=applyWorld(state,{id:crypto.randomUUID(),action:'answer',challenge:c.id,value:'bad'},grade);assert.equal(wrong.correct,false);assert.equal(worldStars(wrong.state),worldStars(state));const value=c.kind==='route'?c.path.join(','):String(c.target);if(c.kind==='route'){assert.equal(routeTrace(c,value).correct,true);assert.equal(routeTrace(c,'L').correct,false);}
  const win=applyWorld(wrong.state,{id:crypto.randomUUID(),action:'answer',challenge:c.id,value},grade);assert.equal(win.correct,true);state=win.state;
  const replay=applyWorld(state,{id:crypto.randomUUID(),action:'answer',challenge:c.id,value},grade);assert.equal(replay.earned,0);assert.equal(worldStars(state),worldStars(replay.state));
 }
 assert.equal(Object.values(state.progress).filter(p=>p.stars).length,12);assert(worldStars(state)>=33);
 const c=list[0],hint=applyWorld(initialWorld(),{action:'hint',challenge:c.id,id:crypto.randomUUID()},grade),win=applyWorld(hint.state,{action:'answer',challenge:c.id,value:String(c.target),id:crypto.randomUUID()},grade);assert.equal(win.earned,1);
}
assert(!robotSchema.safeParse({...initialWorld().robot,color:12}).success);assert(!robotSchema.safeParse({...initialWorld().robot,name:'<script>'}).success);
const manifest=JSON.parse(fs.readFileSync('public/sounds/robot-world/manifest.json','utf8'));
assert.equal(manifest.language,'sq');assert.equal(manifest.voices.length,4);
for(let voice=0;voice<4;voice++)for(const name of Object.keys(manifest.phrases)){
 const wave=fs.readFileSync(`public/sounds/robot-world/v${voice}-${name}.wav`);assert.equal(wave.toString('ascii',0,4),'RIFF');assert.equal(wave.readUInt32LE(4),wave.length-8);assert.equal(wave.readUInt32LE(40),wave.length-44);assert(wave.length>20000);let peak=0;for(let i=44;i<wave.length;i+=2)peak=Math.max(peak,Math.abs(wave.readInt16LE(i)));assert(peak>1000&&peak<=32767);
}
// Run the real route's queries against SQLite, including transactions, isolation,
// stale retries, duplicate receipts and deletion cascades.
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const database={prepare(query){let values=[];return {bind(...v){values=v;return this;},async first(){return sql.prepare(query).get(...values)||null;},async all(){return {results:sql.prepare(query).all(...values)};},async run(){return {meta:{changes:sql.prepare(query).run(...values).changes}};}};},async batch(statements){sql.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}};
let actor={role:'STUDENT',owner:'teacher',profile:'one',grade:1};class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}
globalThis.__worldTest={...rules,db:()=>database,json:body=>Response.json(body),ApiError,authorize:async()=>actor,requireOrigin:r=>{if(r.headers.get('origin')!=='https://test.local')throw new ApiError(403,'Origin');},input:async(r,s)=>s.parse(await r.json()),route:async f=>{try{return await f();}catch(e){return Response.json({error:e.message},{status:e.status||400});}},ownedClass:async()=>{throw new ApiError(403,'Class');},identifier:z.string()};
const routeSource='const {authorize,ApiError,requireOrigin,db,json,input,route,applyWorld,initialWorld,worldCommandSchema,worldStars,completedWorld,normalizeWorld,unlockedWorld,ownedClass,identifier}=globalThis.__worldTest;\n'+fs.readFileSync('app/api/robot-world/route.ts','utf8').replace(/^import .*;\r?\n/gm,'');
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(routeSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
const send=command=>POST(new Request('https://test.local/api/robot-world',{method:'POST',headers:{origin:'https://test.local','Content-Type':'application/json'},body:JSON.stringify(command)}));
const answer={id:crypto.randomUUID(),action:'answer',challenge:'factory-1-1',value:'0'};let response=await send(answer);assert.equal(response.status,200);assert.equal((await response.json()).earned,3);response=await send(answer);assert.equal((await response.json()).earned,0);assert.equal(sql.prepare('SELECT COUNT(*) n FROM robot_world_events').get().n,1);
assert.equal((await send({...answer,id:crypto.randomUUID(),stars:999})).status,400);
const foreignOrigin=new Request('https://test.local/api/robot-world',{method:'POST',headers:{origin:'https://other.local','Content-Type':'application/json'},body:JSON.stringify(answer)});assert.equal((await POST(foreignOrigin)).status,403);
actor={...actor,profile:'two'};assert.equal(worldStars((await (await GET(new Request('https://test.local/api/robot-world'))).json()).state),0);assert.equal((await send({...answer,id:crypto.randomUUID(),challenge:'factory-4-3'})).status,409);
actor={...actor,role:'TEACHER'};assert.equal((await send({...answer,id:crypto.randomUUID()})).status,403);
actor={...actor,role:'STUDENT',profile:'one'};
for(const c of rules.allWorldChallenges(1).slice(0,36)){
 const command={id:crypto.randomUUID(),action:'answer',challenge:c.id,value:c.mission?.pattern?.join(',')||c.path?.join(',')||String(c.target)};
 const saved=await send(command);assert.equal(saved.status,200);assert.equal((await saved.json()).correct,true);
 const duplicate=await send(command);assert.equal((await duplicate.json()).earned,0);
}
const full=(await (await GET(new Request('https://test.local/api/robot-world'))).json()).state;assert.equal(full.animals.length,6);assert.equal(rules.completedWorld(full),36);
const f=full.garden.plots[0],cell=Array.from({length:36},(_,n)=>n).find(n=>!full.garden.plots.some(p=>p.cell===n));
assert.equal((await send({id:crypto.randomUUID(),action:'garden-move',flower:f.id,cell})).status,200);
const visit={id:crypto.randomUUID(),action:'garden-visit'};const grown=(await (await send(visit)).json()).state;assert.equal(grown.garden.visits,1);assert.equal((await (await send(visit)).json()).state.garden.visits,1);
const restored=(await (await GET(new Request('https://test.local/api/robot-world'))).json()).state;assert.equal(restored.garden.plots[0].cell,cell);assert.equal(rules.worldStars(restored),rules.worldStars(full));
const purchase={id:crypto.randomUUID(),action:'buy',item:'carrot',quantity:2};let bought=(await (await send(purchase)).json()).state;assert.equal(bought.commerce.pantry.carrot,2);assert.equal(rules.worldStars(bought),rules.worldStars(restored)-2);assert.equal((await (await send(purchase)).json()).state.commerce.pantry.carrot,2);
assert.equal((await send({...purchase,id:crypto.randomUUID(),price:0})).status,400);assert.equal((await send({id:crypto.randomUUID(),action:'equip',item:'hat'})).status,422);
for(const c of rules.allWorldChallenges(1).slice(36,48)){
 if(c.kind==='cook')for(const [item,quantity] of Object.entries(c.market.recipe.ingredients))assert.equal((await send({id:crypto.randomUUID(),action:'buy',item,quantity})).status,200);
 const command={id:crypto.randomUUID(),action:'answer',challenge:c.id,value:rules.marketSolution(c)+(c.kind==='cook'?'|rabbit':'')};
 const result=await (await send(command)).json();assert(result.correct);assert.equal(result.earned,c.kind==='cook'?5:3);assert.equal((await (await send(command)).json()).earned,0);
}
bought=(await (await GET(new Request('https://test.local/api/robot-world'))).json()).state;assert.equal(rules.completedWorld(bought),48);assert.equal(bought.commerce.meals,3);assert.equal(bought.commerce.bonus,6);
const cook=rules.allWorldChallenges(1)[45];for(const [item,quantity] of Object.entries(cook.market.recipe.ingredients))assert.equal((await send({id:crypto.randomUUID(),action:'buy',item,quantity})).status,200);
const meal={id:crypto.randomUUID(),action:'cook-meal',challenge:cook.id,value:rules.marketSolution(cook)+'|rabbit'};assert.equal((await (await send(meal)).json()).state.commerce.meals,4);assert.equal((await (await send(meal)).json()).state.commerce.meals,4);assert.equal((await send({...meal,id:crypto.randomUUID()})).status,422);
const hat={id:crypto.randomUUID(),action:'buy',item:'hat',quantity:1};assert.equal((await send(hat)).status,200);const afterHat=await (await send(hat)).json();assert.equal(afterHat.state.commerce.owned.filter(id=>id==='hat').length,1);assert.equal((await send({id:crypto.randomUUID(),action:'equip',item:'hat'})).status,200);
assert.equal((await (await GET(new Request('https://test.local/api/robot-world'))).json()).state.commerce.equipped.head,'hat');
for(const c of rules.allWorldChallenges(1).slice(48,60)){const command={id:crypto.randomUUID(),action:'answer',challenge:c.id,value:rules.schoolSolution(c)};const result=await (await send(command)).json();assert(result.correct);assert.equal((await (await send(command)).json()).earned,0);}
const graduated=(await (await GET(new Request('https://test.local/api/robot-world'))).json()).state;assert.equal(graduated.robot.intelligence,5);assert(graduated.school.graduated);const edited=await (await send({id:crypto.randomUUID(),action:'robot',robot:{...graduated.robot,intelligence:1}})).json();assert.equal(edited.state.robot.intelligence,5);assert(edited.state.school.graduated);

for(const c of rules.allWorldChallenges(1).slice(60)){const command={id:crypto.randomUUID(),action:'answer',challenge:c.id,value:rules.festivalSolution(c)};const result=await (await send(command)).json();assert(result.correct,c.id);assert.equal((await (await send(command)).json()).earned,0);}
const champion=(await (await GET(new Request('https://test.local/api/robot-world'))).json()).state;assert.equal(rules.completedWorld(champion),84);assert(champion.festival.trophy);assert.equal(Object.keys(champion.festival.medals).length,12);
const classId='ef000000-0000-4000-8000-000000000001',otherClass='ef000000-0000-4000-8000-000000000002';
sql.prepare('INSERT INTO schools(id,owner,name) VALUES(?,?,?)').run('qa-school','teacher','QA');sql.prepare('INSERT INTO classes(id,school,owner,name,grade,code) VALUES(?,?,?,?,?,?)').run(classId,'qa-school','teacher','QA class',1,'QA-E1');sql.prepare('INSERT INTO classes(id,school,owner,name,grade,code) VALUES(?,?,?,?,?,?)').run(otherClass,'qa-school','teacher','Other class',1,'QA-E2');for(const profile of ['one','two'])sql.prepare('INSERT INTO class_students(class,profile) VALUES(?,?)').run(classId,profile);
const sharing={id:crypto.randomUUID(),action:'share-dance',classId};assert.equal((await send({...sharing,classId:otherClass})).status,422);assert.equal((await send({...sharing,program:['H']})).status,400);
assert.equal((await send(sharing)).status,200);assert.equal((await (await send(sharing)).json()).earned,0);
let feed=await (await GET(new Request('https://test.local/api/robot-world?dances=1&classId='+classId))).json();assert.equal(feed.dances.length,1);assert.equal(feed.dances[0].robot.name,champion.robot.name);assert.deepEqual(feed.dances[0].program,champion.festival.dance);assert.equal(feed.dances[0].profile,undefined);assert.equal(feed.dances[0].progress,undefined);
actor={...actor,profile:'two'};assert.equal((await GET(new Request('https://test.local/api/robot-world?dances=1&classId='+classId))).status,200);assert.equal((await send({...sharing,id:crypto.randomUUID()})).status,409);
actor={...actor,profile:'outsider'};assert.equal((await GET(new Request('https://test.local/api/robot-world?dances=1&classId='+classId))).status,403);assert.equal((await send({...sharing,id:crypto.randomUUID()})).status,422);
actor={...actor,profile:'one',classroom:otherClass};assert.equal((await GET(new Request('https://test.local/api/robot-world?dances=1&classId='+classId))).status,403);assert.equal((await send({...sharing,id:crypto.randomUUID()})).status,422);delete actor.classroom;
sql.prepare('INSERT INTO classroom_settings(class,archived) VALUES(?,1)').run(classId);assert.equal((await GET(new Request('https://test.local/api/robot-world?dances=1&classId='+classId))).status,403);assert.equal((await send({...sharing,id:crypto.randomUUID()})).status,422);sql.prepare('UPDATE classroom_settings SET archived=0 WHERE class=?').run(classId);
sql.prepare('DELETE FROM class_students WHERE class=? AND profile=?').run(classId,'one');assert.equal((await (await GET(new Request('https://test.local/api/robot-world?dances=1&classId='+classId))).json()).error.includes('klasës'),true);
actor={...actor,profile:'two'};assert.equal((await (await GET(new Request('https://test.local/api/robot-world?dances=1&classId='+classId))).json()).dances.length,0);

actor={...actor,profile:'two'};assert.equal((await send({id:crypto.randomUUID(),action:'garden-visit'})).status,409);assert.equal((await (await GET(new Request('https://test.local/api/robot-world'))).json()).state.animals.length,0);
sql.prepare('DELETE FROM robot_worlds WHERE profile=?').run('one');assert.equal(sql.prepare('SELECT COUNT(*) n FROM robot_world_events').get().n,0);
delete globalThis.__worldTest;sql.close();
console.log('Robot world: 84 authenticated challenges, medals/trophy, idempotence, class-only dance sharing, membership/archival/revocation/privacy guards, purchases/cooking/decor, school/graduation, isolation and deletion passed.');
