import assert from 'node:assert/strict';
import {mixedCatalog,reserveMixed,mixedPuzzles} from './lib/mixed-pack.mjs';
import {assess} from './lib/puzzle-engine.mjs';
for(let grade=1;grade<=4;grade++){
 const refs=mixedCatalog(grade),keys=refs.map(r=>r.id+':'+(r.level||0));assert.equal(new Set(keys).size,refs.length);
 const first=reserveMixed(grade,[],5);assert.equal(first.number,1);const puzzles=mixedPuzzles(grade,first.items);assert(puzzles.every(p=>p.grade===grade&&assess(p,p.answer).correct));assert(puzzles.some(p=>p.type==='robot'));assert(puzzles.some(p=>p.type==='creative'));assert(puzzles.some(p=>p.type==='placement'||p.type==='maze'||p.type==='pipes'));
 const history=[{category:'mixed',mixed_number:1,mixed_items:JSON.stringify(first.items)}],second=reserveMixed(grade,history,5);assert.equal(second.number,2);assert(second.items.every(r=>!first.items.some(p=>p.id===r.id&&p.level===r.level)));
 assert.deepEqual(mixedPuzzles(grade,first.items).map(p=>p.id),puzzles.map(p=>p.id));
 const exhausted=reserveMixed(grade,[{category:'mixed',mixed_number:100,mixed_items:JSON.stringify(refs)}],10);assert.equal(exhausted.items.length,0);
}
console.log('Mixed packages: four grades, classic/robot/creative/game coverage, fixed references, unique reservations, numbered history and exhaustion passed.');
