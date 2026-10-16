import {z} from 'zod';
import {route,input} from '../../../lib/api-route';
import {authorize,requireOrigin,ApiError} from '../../../lib/school-access';
import {db,json} from '../../../lib/school-server';
import {curriculumLesson} from '../../../lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from '../../../lib/expanded-curriculum.mjs';
import {publicPuzzle,evaluateAnswer} from '../../../lib/security-policy.mjs';
import {accepts} from '../../../lib/puzzle-engine.mjs';
import {seedCatalog} from '../../../lib/catalog-seed.mjs';
import type {Puzzle} from '../../../lib/learning-types';
const selection=z.object({grade:z.number().int().min(1).max(4),level:z.number().int().min(1).max(30),choice:z.string().regex(/^(lesson:[a-zA-Z0-9_-]{1,80}|game:(robot|shadows|garden|path|patterns|memory|wheels|memory-grid|pipes|maze)|quiz:(mixed|logic|patterns|math|spatial|memory|code|errors|whatif))$/)}).strict();
async function puzzleFor(x:z.infer<typeof selection>){
 if(x.choice.startsWith('lesson:')){const id=x.choice.slice(7);if(curriculumLesson(id)?.grade!==x.grade)throw new ApiError(400,'Mësimi nuk përputhet me klasën.');return curriculumPuzzle(id,x.level) as Puzzle;}
 const game=x.choice.startsWith('game:'),value=x.choice.slice(5);if(x.level>(game?20:3))throw new ApiError(400,'Ky nivel nuk ekziston.');
 await seedCatalog(db());
 const rows=await db().prepare('SELECT payload FROM puzzle_catalog WHERE grade=? ORDER BY id').bind(x.grade).all<{payload:string}>();
 const p=rows.results.map(r=>JSON.parse(r.payload) as Puzzle).find(p=>game?p.interaction?.scene===value&&p.gameLevel===x.level:!['placement','robot','pipes','maze','creative'].includes(p.type||'')&&(value==='mixed'||p.cat===value)&&(p.level||1)===x.level);
 if(!p)throw new ApiError(404,'Niveli nuk u gjet në bibliotekë.');return p;
}
// Teacher sandbox: no adventures, attempts, sessions, rewards or profile writes.
export async function GET(r:Request){return route(async()=>{await authorize(r,'class:write');const q=Object.fromEntries(new URL(r.url).searchParams),x=selection.parse({...q,grade:Number(q.grade),level:Number(q.level)});return json({puzzle:publicPuzzle(await puzzleFor(x)),persistsProgress:false});});}
export async function POST(r:Request){return route(async()=>{requireOrigin(r);await authorize(r,'class:write');const x=await input(r,z.object({selection,value:z.string().max(12000)}).strict()),p=await puzzleFor(x.selection);if(!accepts(p,x.value))throw new ApiError(400,'Përgjigje e pavlefshme.');return json({...evaluateAnswer(p,x.value),persistsProgress:false});});}
