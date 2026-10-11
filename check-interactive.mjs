import assert from 'node:assert/strict';
import {interactivePuzzles} from './lib/interactive-puzzles.mjs';
import {assess,accepts,plugins} from './lib/puzzle-engine.mjs';
import {publicPuzzle} from './lib/security-policy.mjs';
const puzzles=interactivePuzzles();assert.equal(puzzles.length,240);assert.equal(new Set(puzzles.map(p=>p.id)).size,240);
for(const grade of [1,2,3,4])assert.equal(puzzles.filter(p=>p.grade===grade).length,60);
for(const grade of [1,2,3,4])for(const scene of ['memory-grid','pipes','maze']){const group=puzzles.filter(p=>p.grade===grade&&p.interaction.scene===scene);assert.deepEqual(group.map(p=>p.gameLevel),Array.from({length:20},(_,i)=>i+1));assert(group.at(-1).interaction.size>=group[0].interaction.size);assert.equal(new Set(group.map(p=>JSON.stringify(p.interaction))).size,20);}
for(const p of puzzles){
 assert(assess(p,p.answer).correct,p.id);assert.equal(assess(p,p.answer).score,1);
 assert(!accepts(p,'not-json'));assert(!accepts(p,'[]'));
 for(const key of ['answer','explain','hint'])assert(!(key in publicPuzzle(p)));
 assert(plugins[p.type].hint(p,2).length>p.hint.length);
 const answer=JSON.parse(p.answer);
 if(p.type==='maze'){
  assert(!accepts(p,JSON.stringify([p.interaction.start,p.interaction.end])),'Teleport must be rejected');
  const wall=p.interaction.cells.indexOf('#');assert(!accepts(p,JSON.stringify([p.interaction.start,wall])));
  assert(!assess(p,JSON.stringify([p.interaction.start])).correct);
  const detour=[answer[0],answer[1],answer[0],...answer.slice(1)];assert(assess(p,JSON.stringify(detour)).correct,'Valid backtracking is allowed');
 }else if(p.type==='pipes'){
  assert(!accepts(p,JSON.stringify(answer.slice(1))));assert(!accepts(p,JSON.stringify(answer.map(()=>4))));
  assert(!assess(p,JSON.stringify(p.interaction.pipes.map(t=>t.rotation))).correct);
  const symmetric=p.interaction.pipes.findIndex(t=>t.exits.length===2&&Math.abs(t.exits[0]-t.exits[1])===2);
  if(symmetric>=0){const same=[...answer];same[symmetric]=2;assert(assess(p,JSON.stringify(same)).correct,'Equivalent straight-tube rotations must count');}
 }else{
  assert.equal(answer.length,p.interaction.size**2);
  for(const t of p.interaction.preview)assert.equal(answer[t.position],t.id);
  assert(!accepts(p,JSON.stringify(answer.map(()=> '_'))));
  const shifted=[answer.at(-1),...answer.slice(0,-1)];assert(accepts(p,JSON.stringify(shifted)));assert(!assess(p,JSON.stringify(shifted)).correct);
  const duplicate=[...answer],filled=answer.findIndex(v=>v!=='_'),empty=answer.indexOf('_');duplicate[empty]=answer[filled];assert(!accepts(p,JSON.stringify(duplicate)));
 }
}
console.log('Interactive boards: 240 solvable challenges, memory positions, pipe symmetry/connectivity, maze walls/teleport/backtracking, schemas and safe projection passed.');
