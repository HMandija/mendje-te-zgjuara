import assert from 'node:assert/strict';
import {CATEGORIES, questions} from './lib/puzzles.mjs';
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
console.log(`Validated ${checked} original question variants across grades 1-4.`);
