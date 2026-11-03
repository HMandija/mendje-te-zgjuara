import assert from 'node:assert/strict';
import {curriculumLessons} from './lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from './lib/expanded-curriculum.mjs';
// The correct card of a drag exercise must not sit in a fixed slot, must not always be the
// smallest number, and its colour must not give it away.
const slots={},colorOfRight={};let smallest=0,numeric=0,total=0;
for(const g of [1,2,3,4])for(const lesson of curriculumLessons(g))for(let level=1;level<=20;level++){
  const p=curriculumPuzzle(lesson.id,level);
  if(p.type!=='placement'||!p.interaction?.tokens||p.interaction.targets?.length!==1)continue;
  let answer;try{answer=JSON.parse(p.answer);}catch{continue;}
  if(!Array.isArray(answer)||answer.length!==1)continue;
  const tokens=p.interaction.tokens,at=tokens.findIndex(t=>t.id===answer[0]);
  assert.ok(at>=0,`${p.id}: answer token must exist`);
  assert.equal(new Set(tokens.map(t=>t.id)).size,tokens.length,`${p.id}: token ids must be unique`);
  const again=curriculumPuzzle(lesson.id,level).interaction.tokens.map(t=>t.id).join(',');
  assert.equal(again,tokens.map(t=>t.id).join(','),`${p.id}: layout must be deterministic`);
  if(tokens.length<3)continue;
  total++;(slots[tokens.length]??=new Array(tokens.length).fill(0))[at]++;
  if(tokens[at].color)colorOfRight[tokens[at].color]=(colorOfRight[tokens[at].color]||0)+1;
  const q=tokens.map(t=>Number(t.quantity));
  if(q.every(Number.isFinite)&&tokens.length===3){numeric++;if(q[at]===Math.min(...q))smallest++;
    assert.equal(new Set(q).size,3,`${p.id}: the three numbers must differ`);assert.ok(q.every(x=>x>=0),`${p.id}: no negative option`);}
}
for(const [n,counts] of Object.entries(slots)){
  const sum=counts.reduce((a,b)=>a+b,0);if(sum<30)continue;
  for(const [slot,c] of counts.entries())assert.ok(c/sum<=0.5,`${n} options: slot ${slot+1} holds ${(100*c/sum).toFixed(0)}% of correct answers`);
  assert.ok(counts.every(c=>c>0),`${n} options: every slot must occur`);
}
assert.ok(numeric>0&&smallest/numeric<0.6,`the correct number is the smallest in ${(100*smallest/Math.max(1,numeric)).toFixed(0)}% of three-option levels`);
const colorTotal=Object.values(colorOfRight).reduce((a,b)=>a+b,0);
for(const [color,c] of Object.entries(colorOfRight))assert.ok(c/colorTotal<=0.5,`colour ${color} marks the correct card too often`);
console.log(`Answer positions: ${total} drag levels with 3+ options; the correct card moves between every slot, is not always the smallest number, colours do not reveal it, and layouts stay deterministic.`);
