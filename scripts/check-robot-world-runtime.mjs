// Uses only the isolated local D1 created by the robot-world QA bootstrap.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadRobotRules} from './load-robot-world-rules.mjs';
const rules=await loadRobotRules();
const {tokens}=JSON.parse(fs.readFileSync('.wrangler/robot-world-runtime-fixture.json','utf8'));
const base='http://127.0.0.1:8787';
async function call(token,command,origin=base){await new Promise(resolve=>setTimeout(resolve,1500));const response=await fetch(base+'/api/robot-world',{method:command?'POST':'GET',headers:{Authorization:'Bearer '+token,...(command?{Origin:origin,'Content-Type':'application/json'}:{})},body:command?JSON.stringify(command):undefined});return {status:response.status,body:await response.json()};}
let result=await call(tokens[0]);assert.equal(result.status,200);const robot=result.body.state.robot;
result=await call(tokens[0],{id:crypto.randomUUID(),action:'robot',robot:{...robot,head:3,name:'Piko'}});assert.equal(result.status,200);assert.equal(result.body.state.robot.head,3);
const command={id:crypto.randomUUID(),action:'answer',challenge:'factory-1-1',value:'0'};result=await call(tokens[0],command);assert.equal(result.status,200);assert.equal(result.body.earned,3);
result=await call(tokens[0],command);assert.equal(result.status,200);assert.equal(result.body.earned,0);
result=await call(tokens[0]);assert.equal(result.body.state.robot.name,'Piko');assert.equal(result.body.state.progress['factory-1-1'].stars,3);
result=await call(tokens[1]);assert.equal(result.status,200);assert.equal(Object.keys(result.body.state.progress).length,0);assert.equal(result.body.state.robot.head,0);
assert.equal((await call(tokens[0],{...command,id:crypto.randomUUID(),challenge:'factory-4-3'})).status,409);
assert.equal((await call(tokens[0],{...command,id:crypto.randomUUID(),stars:999})).status,400);
assert.equal((await call(tokens[0],command,'https://other.local')).status,403);
assert.equal((await call('b'.repeat(64))).status,401);
for(const c of rules.allWorldChallenges(1).slice(0,36)){
 const command={id:crypto.randomUUID(),action:'answer',challenge:c.id,value:c.mission?.pattern?.join(',')||c.path?.join(',')||String(c.target)};
 result=await call(tokens[0],command);assert.equal(result.status,200);assert(result.body.correct);
 const duplicate=await call(tokens[0],command);assert.equal(duplicate.body.earned,0);
}
result=await call(tokens[0]);assert.equal(rules.completedWorld(result.body.state),36);assert.equal(result.body.state.animals.length,6);const beforeStars=rules.worldStars(result.body.state),flower=result.body.state.garden.plots[0],free=Array.from({length:36},(_,n)=>n).find(n=>!result.body.state.garden.plots.some(f=>f.cell===n));
assert.equal((await call(tokens[0],{id:crypto.randomUUID(),action:'garden-move',flower:flower.id,cell:free})).status,200);
const visit={id:crypto.randomUUID(),action:'garden-visit'};result=await call(tokens[0],visit);assert.equal(result.body.state.garden.visits,1);result=await call(tokens[0],visit);assert.equal(result.body.state.garden.visits,1);
result=await call(tokens[0]);assert.equal(result.body.state.garden.plots[0].cell,free);assert.equal(rules.worldStars(result.body.state),beforeStars);assert.equal((await call(tokens[1])).body.state.animals.length,0);
for(const path of ['/robot-world','/sounds/robot-world/v0-hello.wav'])assert.equal((await fetch(base+path)).status,200);
console.log('Real local Worker/D1: all 36 student challenges, robot settings, animals/garden save/reload, idempotent rewards/visits, profile isolation, locked stages, forged stars, foreign origin, invalid credentials and local audio assets passed.');
