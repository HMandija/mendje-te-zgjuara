import assert from 'node:assert/strict';
import {loadRobotRules} from './scripts/load-robot-world-rules.mjs';
const r=await loadRobotRules(),cmd=(action,data={})=>({id:crypto.randomUUID(),action,...data});
for(let grade=1;grade<=4;grade++){
 let state=r.initialWorld();const list=r.allWorldChallenges(grade);assert.equal(list.length,84);assert.throws(()=>r.applyWorld(state,cmd('answer',{challenge:list[48].id,value:r.schoolSolution(list[48])}),grade));
 const fake=r.applyWorld(state,cmd('robot',{robot:{...state.robot,intelligence:5}}),grade);assert.equal(fake.state.robot.intelligence,1);
 for(const c of list.slice(0,48)){
  if(c.kind==='cook')for(const [item,quantity] of Object.entries(c.market.recipe.ingredients))state=r.applyWorld(state,cmd('buy',{item,quantity}),grade).state;
  const value=c.theme===4?r.marketSolution(c)+(c.kind==='cook'?'|rabbit':''):c.mission?.pattern?.join(',')||c.path?.join(',')||String(c.target);state=r.applyWorld(state,cmd('answer',{challenge:c.id,value}),grade).state;
 }
 for(const [n,c] of list.slice(48,60).entries()){
  const before=r.worldStars(state),wrong=r.applyWorld(state,cmd('answer',{challenge:c.id,value:'bad'}),grade);assert.equal(wrong.correct,false);assert.equal(r.worldStars(wrong.state),before);assert.equal(wrong.state.robot.intelligence,state.robot.intelligence);
  const value=r.schoolSolution(c);assert(r.evaluatePhaseD(c,value).correct,`${grade} ${c.id}`);const win=r.applyWorld(wrong.state,cmd('answer',{challenge:c.id,value}),grade);assert(win.correct);state=win.state;assert.equal(win.earned,3);
  const replay=r.applyWorld(state,cmd('answer',{challenge:c.id,value}),grade);assert.equal(replay.earned,0);assert.deepEqual(replay.state.school,state.school);assert.equal(replay.state.robot.intelligence,state.robot.intelligence);
  if(n===2){assert(state.school.antenna);assert.equal(state.robot.intelligence,2);}if(n>=3&&n<=5)assert.equal(state.robot.intelligence,n);
  if(c.kind==='school-repeat')assert.equal(r.evaluatePhaseD(c,c.path.join(',')).correct,false);
  if(c.kind==='school-debug'){assert.equal(r.evaluatePhaseD(c,c.school.broken.join(',')).correct,false);assert.equal(r.traceSchool(c,c.school.broken.join(',')).correct,false);const wrong=[...c.path];wrong[0]='L';assert.equal(r.evaluatePhaseD(c,wrong.join(',')).correct,false);}
  if(c.kind==='school-condition'){assert(r.traceSchool(c,value,0).correct);assert(r.traceSchool(c,value,1).correct);assert.equal(r.evaluatePhaseD(c,c.path.join(',')).correct,false);assert.equal(r.evaluatePhaseD(c,'IFR:[R.D]:[R.D],'+value.split(',')[1]).correct,false);}
 }
 assert.equal(r.unlockedWorld(state),60);assert.equal(r.completedWorld(state),60);assert(state.school.graduated);assert(state.school.issuedAt>0);assert.equal(state.robot.intelligence,5);
 const edit=r.applyWorld(state,cmd('robot',{robot:{...state.robot,intelligence:1,head:4}}),grade);assert.equal(edit.state.robot.intelligence,5);assert(edit.state.school.graduated);
 const old={...state};delete old.school;const normalized=r.normalizeWorld(old);assert.equal(normalized.robot.intelligence,5);
}
assert.equal(r.evaluatePhaseD(r.phaseDChallenges(1)[9],'IFR:[R.]:[D.R],R').correct,false);
assert(!r.worldCommandSchema.safeParse(cmd('answer',{challenge:'school-4-3',value:'R',intelligence:5})).success);
assert(!r.robotSchema.safeParse({...r.initialWorld().robot,intelligence:6}).success);
console.log('Phase D: all 48 grade-specific school challenges solvable; repetition, pictorial quizzes, one-command repairs, both conditional routes, chronological access, monotonic intelligence/antenna/graduation, safe robot edits and replay rewards passed.');
