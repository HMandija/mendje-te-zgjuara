import {z} from 'zod';
import {authorize,ApiError} from '../../../lib/school-access';
import {route} from '../../../lib/api-route';
import {db,json,workspace} from '../../../lib/school-server';
import {identifier} from '../../../lib/school-validation.mjs';
import {gameProgressSQL} from '../../../lib/game-progress.mjs';
const query=z.object({grade:z.coerce.number().int().min(1).max(4),profile:z.union([identifier,z.literal('')])}).strict();
export async function GET(r:Request){return route(async()=>{
 const actor=await authorize(r,'product:read'),x=query.parse(Object.fromEntries(new URL(r.url).searchParams));
 if(actor.role==='STUDENT'&&(x.profile!==actor.profile||x.grade!==actor.grade))throw new ApiError(403,'Profili ose klasa nuk lejohet.');
 const w=await workspace(actor.owner);if(x.profile&&!w.profiles.some(p=>p.id===x.profile))throw new ApiError(404,'Profili nuk ekziston.');
 const progress=await db().prepare(gameProgressSQL).bind(actor.owner,x.profile,x.grade).all();
 return json({progress:progress.results});
});}
