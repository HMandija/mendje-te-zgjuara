import assert from 'node:assert/strict';
import {loadRobotRules} from './scripts/load-robot-world-rules.mjs';
const r=await loadRobotRules();
const answer=(state,c,value,grade)=>r.applyWorld(state,{id:crypto.randomUUID(),action:'answer',challenge:c.id,value},grade);
for(let grade=1;grade<=4;grade++){
 let state=r.initialWorld();const list=r.allWorldChallenges(grade).slice(0,36);assert.equal(list.length,36);
 assert.throws(()=>answer(state,list[12],list[12].path.join(','),grade));
 for(const c of list){
  const bad=answer(state,c,'bad',grade);assert.equal(bad.correct,false);assert.equal(r.worldStars(bad.state),r.worldStars(state));
  const value=c.mission?.pattern?.join(',')||c.path?.join(',')||String(c.target);
  if(c.theme>1&&!c.mission.pattern)assert(r.traceMission(c,value).correct,`Witness failed: grade ${grade}, ${c.id}`);
  const result=answer(bad.state,c,value,grade);assert(result.correct,`Not solvable: ${grade} ${c.id}`);state=result.state;
  const replay=answer(state,c,value,grade);assert.equal(replay.earned,0);assert.deepEqual(replay.state.animals,state.animals);assert.deepEqual(replay.state.garden,state.garden);
 }
 assert.equal(r.unlockedWorld(state),36);assert.equal(r.completedWorld(state),36);assert.equal(state.animals.length,6);assert.equal(new Set(state.animals).size,6);assert(state.garden.plots.length>=12);
 const before=r.worldStars(state),visit=r.applyWorld(state,{id:crypto.randomUUID(),action:'garden-visit'},grade);assert.equal(visit.earned,0);assert.equal(r.worldStars(visit.state),before);assert(visit.state.garden.plots.every(f=>f.growth>=state.garden.plots.find(p=>p.id===f.id).growth));
 const flower=visit.state.garden.plots[0],free=Array.from({length:36},(_,n)=>n).find(cell=>!state.garden.plots.some(f=>f.cell===cell));
 const moved=r.applyWorld(visit.state,{id:crypto.randomUUID(),action:'garden-move',flower:flower.id,cell:free},grade);assert.equal(moved.state.garden.plots[0].cell,free);assert.equal(r.worldStars(moved.state),before);
 assert.throws(()=>r.applyWorld(state,{id:crypto.randomUUID(),action:'garden-move',flower:'flower-99',cell:0},grade));
 assert.throws(()=>r.applyWorld(state,{id:crypto.randomUUID(),action:'garden-move',flower:flower.id,cell:state.garden.plots[1].cell},grade));
 const bridge=list[18];assert.equal(r.traceMission(bridge,Array(bridge.mission.water.length+1).fill('R').join(',')).correct,false);
 const count=bridge.mission.water.length;assert(r.traceMission(bridge,`[B.R]x${count},R`).correct);
 const row=list[27],n=row.mission.flowers.length;assert(r.traceMission(row,`[R.K.W]x${n}`).correct);assert.equal(answer(state,row,`[R.K.W]x${n}`,grade).state.progress[row.id].stars,3);
 assert.equal(r.traceMission(row,Array(n).fill('R,W').join(',')).correct,false);
 if(grade===4){const conditional=list[20];assert(conditional.mission.requiredCondition);assert.equal(r.traceMission(conditional,[...Array(6).fill('B'),...Array(7).fill('R')].join(',')).correct,false);assert(r.traceMission(conditional,conditional.path.join(',')).conditionUsed);}
}
assert.equal(r.missionTokens('[R.K.W]x4').length,12);assert.equal(r.missionTokens('[R]x999'),null);assert.equal(r.missionTokens('eval'),null);assert.equal(r.missionTokens('R,'.repeat(121)),null);
const old={...r.initialWorld()};delete old.animals;delete old.garden;assert.deepEqual(r.normalizeWorld(old).animals,[]);assert.equal(r.applyWorld(old,{id:crypto.randomUUID(),action:'robot',robot:old.robot},1).state.garden.plots.length,0);
assert.throws(()=>r.applyWorld(r.initialWorld(),{id:crypto.randomUUID(),action:'garden-visit'},1));
assert.equal(r.worldCommandSchema.safeParse({id:crypto.randomUUID(),action:'answer',challenge:'garden-1-1',value:'R,K,W',stars:999}).success,false);
console.log('Phase B: all 144 challenges solved; chronological access, bridge loops and conditions, watering order, flower patterns, album uniqueness, replay rewards, persistent garden movement/growth and Phase A snapshot compatibility passed.');
