import assert from 'node:assert/strict';
import {demoPublic,demoPuzzle,demoAnswer} from './lib/demo-puzzles.mjs';
import {gameScenes} from './lib/game-catalog.mjs';
import {CATEGORIES} from './lib/categories.mjs';
for(const grade of [1,2,3,4])for(const selection of [...[...gameScenes,'robot'].map(scene=>({grade,scene})),...CATEGORIES.map(c=>({grade,category:c.id}))]){
 const p=demoPuzzle(selection),view=demoPublic(selection);assert(p);assert(view);
 assert.equal(view.level,1);if(selection.scene)assert.equal(view.gameLevel,1);
 for(const field of ['answer','explain','hint'])assert(!(field in view));
 assert(demoAnswer(selection,p.answer).correct);
 assert.equal(demoAnswer(selection,'x'.repeat(1100)),null);
}
assert.equal(demoPublic({grade:5,scene:'robot'}),null);
console.log('Visitor: 72 first-level samples, four grades, safe projection and server answer validation passed.');
