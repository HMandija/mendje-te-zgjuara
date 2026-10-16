import assert from 'node:assert/strict';
import {loadRobotRules} from './scripts/load-robot-world-rules.mjs';
const r=await loadRobotRules(),cmd=(action,data)=>({id:crypto.randomUUID(),action,...data});
for(let grade=1;grade<=4;grade++){
 let state=r.initialWorld();const list=r.allWorldChallenges(grade);assert.equal(list.length,84);assert.throws(()=>r.applyWorld(state,cmd('answer',{challenge:list[60].id,value:r.festivalSolution(list[60])}),grade));
 for(const c of list.slice(0,60)){if(c.kind==='cook')for(const [item,quantity] of Object.entries(c.market.recipe.ingredients))state=r.applyWorld(state,cmd('buy',{item,quantity}),grade).state;const value=c.theme===5?r.schoolSolution(c):c.theme===4?r.marketSolution(c)+(c.kind==='cook'?'|rabbit':''):c.mission?.pattern?.join(',')||c.path?.join(',')||String(c.target);state=r.applyWorld(state,cmd('answer',{challenge:c.id,value}),grade).state;}
 assert.throws(()=>r.applyWorld(state,cmd('share-dance',{classId:crypto.randomUUID()}),grade));
 for(const c of list.slice(60)){
  const before=r.worldStars(state),wrong=r.applyWorld(state,cmd('answer',{challenge:c.id,value:'invalid'}),grade);assert.equal(wrong.correct,false);assert.equal(r.worldStars(wrong.state),before);
  const value=r.festivalSolution(c);assert(r.evaluatePhaseE(c,value).correct,`${grade} ${c.id}: ${value}`);const win=r.applyWorld(wrong.state,cmd('answer',{challenge:c.id,value}),grade);assert(win.correct);state=win.state;assert(win.earned>0);
  const replay=r.applyWorld(state,cmd('answer',{challenge:c.id,value}),grade);assert.equal(replay.earned,0);assert.equal(r.worldStars(replay.state),r.worldStars(state));
  if(c.kind==='dance'){assert.deepEqual(r.danceTokens(value),c.festival.pattern);assert(!r.evaluatePhaseE(c,'H').correct);if(c.festival.repeat)assert(!r.evaluatePhaseE(c,c.festival.pattern.join(',')).correct);}
  else{assert(r.raceTrace(c,value).correct);assert(r.shortestRace(c).length>0);if(c.festival.conditional){assert(r.raceTrace(c,value,1).correct);assert(!r.evaluatePhaseE(c,'IFR:[R.D]:[R.D],'+value.split(',')[1]).correct);}if(c.stage===1)assert(r.raceTime(c,value)<r.raceTime(c,c.festival.opponent.join(',')));}
 }
 assert.equal(r.completedWorld(state),84);assert(state.festival.trophy);assert.equal(Object.keys(state.festival.medals).length,12);assert(state.school.graduated);assert.equal(state.robot.intelligence,5);
 const shared=r.applyWorld(state,cmd('share-dance',{classId:crypto.randomUUID()}),grade);assert.equal(shared.earned,0);assert(shared.state.festival.shared);assert.deepEqual(shared.state.festival.shared.program,state.festival.dance);
 if(grade===1){const c=list.find(c=>c.id==='race-2-1'),fresh=structuredClone(state);delete fresh.progress[c.id];delete fresh.festival.medals[c.id];const silver=r.applyWorld(fresh,cmd('answer',{challenge:c.id,value:'Rx4,D,L'}),grade);assert.equal(silver.state.festival.medals[c.id],'silver');const gold=r.applyWorld(silver.state,cmd('answer',{challenge:c.id,value:r.festivalSolution(c)}),grade);assert.equal(gold.state.festival.medals[c.id],'gold');const bad=r.applyWorld(gold.state,cmd('answer',{challenge:c.id,value:'L'}),grade);assert.equal(bad.state.festival.medals[c.id],'gold');const hinted=r.applyWorld(fresh,cmd('hint',{challenge:c.id}),grade),bronze=r.applyWorld(hinted.state,cmd('answer',{challenge:c.id,value:r.festivalSolution(c)}),grade);assert.equal(bronze.state.festival.medals[c.id],'bronze');}
 const old={...state};delete old.festival;assert.deepEqual(r.normalizeWorld(old).festival,r.initialFestival());
}
for(const bad of ['Jx99','[J..H]x2','[J.H]x9,[J.H]x9,[J.H]x9','IFR:R:D','<script>','[J.H]x2x2'])assert.equal(r.danceTokens(bad),null);
assert(!r.worldCommandSchema.safeParse(cmd('answer',{challenge:'race-4-3',value:'R',medal:'gold'})).success);
const detour=r.phaseEChallenges(1).find(c=>c.id==='race-2-1');assert(r.evaluatePhaseE(detour,'Rx4,D,L').correct);assert(r.evaluatePhaseE(detour,'Rx4,D,L').steps>detour.efficient);
console.log('Phase E: 96 grade-specific dance/race challenges, bounded parser, both conditional worlds, local opponent, compression, medals/trophy, replay rewards, old saves and sequential gates passed.');
