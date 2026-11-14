import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {seedCatalog,catalogSeed,CATALOG_ROWS} from './lib/catalog-seed.mjs';
// The exercise bank must not be rebuilt (about 70 ms of CPU) on every request, yet a missing or stale bank must still be repaired.
assert.equal(catalogSeed().length,CATALOG_ROWS,'CATALOG_ROWS must equal the real number of exercises');
// Single-grade seeds must stay identical to the matching slice of the full bank.
// Option order is deliberately shuffled per build, so compare it order-independent.
const canon=p=>{const copy={...p};if(Array.isArray(copy.options))copy.options=[...copy.options].sort();return JSON.stringify(copy);};
const fullKeys=new Set(catalogSeed().map(canon)),perGrade=[1,2,3,4].flatMap(grade=>catalogSeed(grade));
assert.equal(perGrade.length,CATALOG_ROWS,'per-grade seeds cover every exercise');
assert.equal(new Set(perGrade.map(p=>p.id)).size,CATALOG_ROWS,'per-grade seeds have unique ids');
assert(perGrade.every(p=>fullKeys.has(canon(p))),'per-grade seeds match the full bank');
const sql=new DatabaseSync(':memory:');for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
let prepares=0;
const make=()=>({prepare(query){prepares++;let args=[];return {bind(...values){args=values;return this;},async first(){return sql.prepare(query).get(...args)||null;},async run(){return sql.prepare(query).run(...args);},async all(){return {results:sql.prepare(query).all(...args)};}};},async batch(list){return Promise.all(list.map(s=>s.run()));}});
const count=()=>sql.prepare('SELECT COUNT(*) AS n FROM puzzle_catalog').get().n;
const first=make();await seedCatalog(first);assert.equal(count(),CATALOG_ROWS,'an empty database is seeded');
prepares=0;await seedCatalog(first);assert.equal(prepares,0,'a database already verified by this isolate is not queried again');
const second=make();prepares=0;await seedCatalog(second);assert.equal(prepares,1,'a current bank needs one cheap check and no rebuild');
sql.exec("DELETE FROM puzzle_catalog WHERE id='g1-math-0'");assert.equal(count(),CATALOG_ROWS-1);
await seedCatalog(make());assert.equal(count(),CATALOG_ROWS,'a damaged bank is repaired');
sql.exec("UPDATE puzzle_catalog SET payload=json_set(payload,'$.catalogRevision',0) WHERE id='g2-math-0'");
await seedCatalog(make());assert.equal(sql.prepare("SELECT json_extract(payload,'$.catalogRevision') AS r FROM puzzle_catalog WHERE id='g2-math-0'").get().r,2,'an outdated revision is refreshed');
console.log('Catalog seed: verified once per database, no rebuild when current, missing rows and outdated revisions repaired.');
