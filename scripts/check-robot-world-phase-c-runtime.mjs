import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadRobotRules} from './load-robot-world-rules.mjs';
const r=await loadRobotRules(),{tokens}=JSON.parse(fs.readFileSync('.wrangler/robot-world-runtime-fixture.json','utf8')),base='http://127.0.0.1:8787';
async function call(command,token=tokens[0]){for(let attempt=0;attempt<3;attempt++){await new Promise(resolve=>setTimeout(resolve,1500));try{const response=await fetch(base+'/api/robot-world',{method:command?'POST':'GET',headers:{Authorization:'Bearer '+token,...(command?{Origin:base,'Content-Type':'application/json'}:{})},body:command?JSON.stringify(command):undefined});if(response.status>=500||!response.headers.get('content-type')?.includes('application/json'))throw Error('Local proxy transport failed: '+response.status);return {status:response.status,body:await response.json()};}catch(e){if(attempt===2)throw e;console.log('Retrying a transient local proxy connection with the same command ID.');}}throw Error('Unreachable');}

const cmd=(action,data={})=>({id:crypto.randomUUID(),action,...data});
let result=await call();assert.equal(result.status,200);assert.equal(r.unlockedWorld(result.body.state),36);const before=r.worldStars(result.body.state);
const buy=cmd('buy',{item:'carrot',quantity:2});result=await call(buy);assert.equal(result.body.state.commerce.pantry.carrot,2);assert.equal(r.worldStars(result.body.state),before-2);result=await call(buy);assert.equal(result.body.state.commerce.pantry.carrot,2);
assert.equal((await call({...cmd('buy',{item:'carrot',quantity:1}),price:0})).status,400);assert.equal((await call(cmd('equip',{item:'hat'}))).status,422);
for(const c of r.allWorldChallenges(1).slice(36,48)){
 if(c.kind==='cook')for(const [item,quantity] of Object.entries(c.market.recipe.ingredients))assert.equal((await call(cmd('buy',{item,quantity}))).status,200);
 const answer=cmd('answer',{challenge:c.id,value:r.marketSolution(c)+(c.kind==='cook'?'|rabbit':'')});result=await call(answer);assert.equal(result.status,200);assert(result.body.correct);assert.equal(result.body.earned,c.kind==='cook'?5:3);
 if(c.kind==='cook')assert.equal((await call(answer)).body.earned,0);
}
const cook=r.allWorldChallenges(1)[45];for(const [item,quantity] of Object.entries(cook.market.recipe.ingredients))assert.equal((await call(cmd('buy',{item,quantity}))).status,200);
const meal=cmd('cook-meal',{challenge:cook.id,value:r.marketSolution(cook)+'|rabbit'});result=await call(meal);assert.equal(result.body.state.commerce.meals,4);result=await call(meal);assert.equal(result.body.state.commerce.meals,4);
assert.equal((await call(cmd('buy',{item:'hat',quantity:1}))).status,200);assert.equal((await call(cmd('equip',{item:'hat'}))).status,200);
assert.equal((await call(cmd('buy',{item:'rug',quantity:1}))).status,200);const placement=cmd('place',{item:'rug',room:'bedroom',cell:0});assert.equal((await call(placement)).status,200);assert.equal((await call(placement)).body.state.commerce.placed.length,1);
result=await call();assert.equal(r.completedWorld(result.body.state),48);assert.equal(result.body.state.commerce.meals,4);assert.equal(result.body.state.commerce.bonus,6);assert.equal(result.body.state.commerce.equipped.head,'hat');assert.equal(result.body.state.commerce.placed[0].cell,0);assert(r.worldStars(result.body.state)>=0);
const other=await call(undefined,tokens[1]);assert.equal(other.body.state.commerce.owned.length,0);assert.equal(other.body.state.commerce.pantry.carrot,undefined);assert.equal((await call(cmd('buy',{item:'water',quantity:1}),tokens[1])).status,422);
console.log('Real local Worker/D1 Phase C: all 12 challenges, server prices/stock/spending, idempotent purchase/cooking/decor, pantry/bonus/equipment reload, forged price rejection, ownership and pupil isolation passed.');
