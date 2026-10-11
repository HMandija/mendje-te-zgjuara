import {z} from 'zod';
import {input,route} from '../../../lib/api-route';
import {ApiError,limit,requireOrigin} from '../../../lib/school-access';
import {json} from '../../../lib/school-server';
import {demoPublic,demoAnswer} from '../../../lib/demo-puzzles.mjs';
const selection=z.object({grade:z.number().int().min(1).max(4),category:z.enum(['logic','patterns','math','spatial','memory','code','errors','whatif']).optional(),lessonId:z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/).optional(),scene:z.enum(['shadows','garden','path','patterns','memory','wheels','memory-grid','pipes','maze','robot']).optional()}).strict().refine(x=>[x.category,x.scene,x.lessonId].filter(Boolean).length===1,'Zgjidh një mësim.');
async function throttle(r:Request){await limit('demo:'+(r.headers.get('cf-connecting-ip')||'local-demo'),120);}
// Deliberately public, first-level-only route. All full-course APIs retain authorization.
export async function GET(r:Request){return route(async()=>{await throttle(r);const q=Object.fromEntries(new URL(r.url).searchParams);const x=selection.parse({...q,grade:Number(q.grade)});const puzzle=demoPublic(x);if(!puzzle)throw new ApiError(404,'Mësimi nuk u gjet.');return json({puzzle,preview:true,persistsProgress:false});});}
export async function POST(r:Request){return route(async()=>{requireOrigin(r);await throttle(r);const x=await input(r,z.object({selection,value:z.string().max(1000)}).strict());const result=demoAnswer(x.selection,x.value);if(!result)throw new ApiError(400,'Përgjigje e pavlefshme.');return json({...result,preview:true,persistsProgress:false});});}
