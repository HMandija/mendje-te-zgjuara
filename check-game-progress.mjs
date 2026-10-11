import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {gameProgressSQL} from './lib/game-progress.mjs';
import {catalogSeed} from './lib/catalog-seed.mjs';
import {gameCategoryCount,gamesForGrade} from './lib/game-catalog.mjs';
const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE sessions(id TEXT PRIMARY KEY,owner TEXT,profile TEXT,payload TEXT,created TEXT)');
const insert=db.prepare('INSERT INTO sessions VALUES(?,?,?,?,?)');
function session(id,owner='teacher',profile='child',grade=1,gameLevel=1,correct=true,verified=true){insert.run(String(id),owner,profile,JSON.stringify({grade,verified,gameScene:'maze',gameLevel,answers:[{correct}],stars:correct?3:1}),String(id));}
session('first');for(let i=0;i<250;i++)session(i,'teacher','child',1,20,false);session('other-profile','teacher','other');session('other-owner','other');session('other-grade','teacher','child',4);session('legacy','teacher','child',1,2,true,false);
const progress=db.prepare(gameProgressSQL).all('teacher','child',1);assert.equal(progress.length,2);assert.equal(progress.find(p=>p.level===1).mastered,1);assert.equal(progress.find(p=>p.level===20).attempts,250);assert.equal(progress.find(p=>p.level===20).mastered,0);session('solved','teacher','child',1,20,true);const solved=db.prepare(gameProgressSQL).all('teacher','child',1).find(p=>p.level===20);assert.equal(solved.mastered,1);assert.equal(solved.stars,3);db.close();
const rows=catalogSeed();for(const grade of [1,2,3,4]){assert.equal(gamesForGrade(grade).length,9);assert.equal(new Set(gamesForGrade(grade).map(g=>g.title)).size,9);for(const cat of ['logic','patterns','math','spatial','memory','code','errors','whatif'])assert.equal(rows.filter(p=>p.grade===grade&&p.cat===cat).length,14+gameCategoryCount(cat));}
for(let grade=2;grade<=4;grade++)assert(gamesForGrade(grade).every((g,i)=>g.title!==gamesForGrade(grade-1)[i].title));
console.log('Game progress: full history, owner/profile/grade isolation, failed vs mastered, retry best stars, nine curricula and exact category counts passed.');
