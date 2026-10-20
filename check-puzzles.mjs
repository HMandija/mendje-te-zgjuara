import assert from 'node:assert/strict';
import {CATEGORIES, questions,shufflePuzzleForIssue} from './lib/puzzles.mjs';
let checked = 0;
for (const grade of [1, 2, 3, 4]) for (const category of CATEGORIES) {
  const items = questions(grade, category.id);
  assert.equal(items.length, 12);
  for (const item of items) {
    assert(item.options.length >= 3 && item.options.length <= 4);
    assert.equal(new Set(item.options).size, item.options.length);
    assert(item.options.includes(item.answer));
    assert(item.explain && item.hint && item.title);
    checked++;
  }
}
assert.equal(CATEGORIES.length, 8);
assert.equal(checked, 384);
const sample=questions(4,'math')[0],positions=Array(sample.options.length).fill(0);
for(let i=0;i<160;i++){
  const issued=shufflePuzzleForIssue(sample);
  assert.deepEqual([...issued.options].sort(),[...sample.options].sort());
  positions[issued.options.indexOf(issued.answer)]++;
}
assert(positions.filter(n=>n>0).length===sample.options.length,`Correct answer must appear in every position across repeated openings: ${positions}`);
assert(positions.every(n=>n>=15&&n<=90),`Correct answer position distribution is unexpectedly biased: ${positions}`);
const placement={type:'placement',options:[],answer:'["n0"]',interaction:{tokens:[{id:'n0'},{id:'n1'},{id:'n2'}]}};
assert.deepEqual(JSON.parse(placement.answer),['n0']);
const tokenOrders=new Set(Array.from({length:24},()=>JSON.stringify(shufflePuzzleForIssue(placement).interaction.tokens)));
assert(tokenOrders.size>1,'Interactive answer cards must also change order between openings.');
console.log(`Validated ${checked} original question variants across grades 1-4.`);
