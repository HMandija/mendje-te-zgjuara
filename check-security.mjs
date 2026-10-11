import assert from 'node:assert/strict';
import {allowed,evaluateAnswer,publicPuzzle} from './lib/security-policy.mjs';
import {catalogSeed,seedCatalog} from './lib/catalog-seed.mjs';
import {DatabaseSync} from 'node:sqlite';
import {startSchema,submissionSchema,hintSchema,workspaceSchema} from './lib/school-validation.mjs';
for(const role of ['TEACHER','ADMIN'])for(const permission of ['workspace:read','workspace:write','invite:create','invite:revoke','session:finish'])assert(allowed(role,permission));
for(const permission of ['workspace:read','workspace:write','invite:create','invite:revoke','session:finish'])assert(!allowed('STUDENT',permission));
for(const permission of ['student:read','student:finish']){assert(allowed('STUDENT',permission));assert(!allowed('TEACHER',permission));assert(!allowed('ADMIN',permission));}
assert(!allowed('UNKNOWN','workspace:read'));
const seed=catalogSeed();assert.equal(seed.length,1248);assert.equal(new Set(seed.map(p=>p.id)).size,1248);
for(const p of seed){const safe=publicPuzzle(p);assert(!('answer' in safe));assert(!('explain' in safe));assert(!('hint' in safe));assert(evaluateAnswer(p,p.answer).correct);if(!['ordering','grid','placement','pipes','maze','robot'].includes(p.type))assert(!evaluateAnswer(p,p.options.find(o=>o!==p.answer)).correct);}
assert.throws(()=>evaluateAnswer(seed[0],'forged'));
assert(!startSchema.safeParse({grade:5,profile:'',count:5,category:'logic'}).success);
assert(!submissionSchema.safeParse({id:'x',index:0,value:'1',correct:true}).success);
assert(!hintSchema.safeParse({id:'x',index:'-1'}).success);
assert(!workspaceSchema.safeParse({profiles:[],custom:[],revision:0,role:'ADMIN'}).success);
const sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE puzzle_catalog(id TEXT PRIMARY KEY,grade INTEGER,category TEXT,payload TEXT)');
let queries=0;
const seedDb={prepare(sql){const stmt=sqlite.prepare(sql);return {async first(){queries++;return stmt.get();},bind(...values){assert(values.length<=100);return {run(){queries++;return stmt.run(...values);}};}};},async batch(statements){for(const stmt of statements)stmt.run();}};
await seedCatalog(seedDb);assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM puzzle_catalog').get().n,1248);assert(queries<=26);
assert(startSchema.safeParse({grade:1,profile:'',count:5,category:'play',scene:'maze',gameLevel:20}).success);for(const gameLevel of [0,21,1.5])assert(!startSchema.safeParse({grade:1,profile:'',count:5,category:'play',scene:'maze',gameLevel}).success);
const firstQueries=queries;await seedCatalog(seedDb);assert.equal(queries,firstQueries+1);sqlite.close();
console.log('Security: role matrix, deny-by-default, 1248 server seeds, safe puzzle projection, scoring and strict Zod input passed.');
