import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const english=JSON.parse(readFileSync(new URL('./node_modules/scratch-blocks/msg/json/en.json',import.meta.url),'utf8'));
const albanian=JSON.parse(readFileSync(new URL('./locales/blocks-sq.json',import.meta.url),'utf8'));
assert.deepEqual(Object.keys(albanian).sort(),Object.keys(english).sort(),'Every block message must have a translation');
for(const [key,value] of Object.entries(english)){
 assert.equal(typeof albanian[key],'string',key);
 assert(albanian[key].trim(),key);
 assert.deepEqual((albanian[key].match(/%\d+/g)||[]).sort(),(value.match(/%\d+/g)||[]).sort(),key+' placeholders');
}
console.log(`Albanian blocks: ${Object.keys(albanian).length} entries and their placeholders match the pinned source.`);
