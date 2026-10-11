import {questions} from './puzzles.mjs';
import {categories} from './school-validation.mjs';
import {visualPuzzles} from './visual-puzzles.mjs';
import {interactivePuzzles} from './interactive-puzzles.mjs';
import {originalPuzzles} from './original-puzzles.mjs';
import {robotPuzzles} from './robot-puzzles.mjs';
export function catalogSeed(){return [...[1,2,3,4].flatMap(grade => categories.flatMap(cat => questions(grade,cat).map((p,i) => ({...p,id:`g${grade}-${cat}-${i}`,grade,cat,level:Math.floor(i/4)+1})))),...originalPuzzles(),...visualPuzzles(),...interactivePuzzles(),...robotPuzzles()];}
export async function seedCatalog(db){
 const count=await db.prepare("SELECT COUNT(*) AS n, SUM(CASE WHEN json_extract(payload, '$.gameRevision') = 1 THEN 1 ELSE 0 END) AS games, SUM(CASE WHEN json_extract(payload, '$.gameRevision') = 2 AND json_extract(payload, '$.type') = 'robot' THEN 1 ELSE 0 END) AS robots FROM puzzle_catalog").first();
 if(count?.n===1248&&count?.games===720&&count?.robots===80)return;
 const rows=catalogSeed(),statements=[];
 // 25 statements with one JSON binding each; leaves room for authorization within D1 limits.
 for(let i=0;i<rows.length;i+=50){const group=rows.slice(i,i+50);statements.push(db.prepare("INSERT INTO puzzle_catalog(id,grade,category,payload) SELECT json_extract(value, '$.id'),json_extract(value, '$.grade'),json_extract(value, '$.cat'),value FROM json_each(?) WHERE 1 ON CONFLICT(id) DO UPDATE SET grade=excluded.grade,category=excluded.category,payload=excluded.payload").bind(JSON.stringify(group)));}
 await db.batch(statements);
}
