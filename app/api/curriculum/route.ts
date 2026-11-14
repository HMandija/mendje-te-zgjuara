import {z} from 'zod';
import {authorize,ApiError,actorWorkspace} from '../../../lib/school-access';
import {route} from '../../../lib/api-route';
import {db,json} from '../../../lib/school-server';
import {identifier} from '../../../lib/school-validation.mjs';
const query=z.object({grade:z.coerce.number().int().min(1).max(4),profile:z.union([identifier,z.literal('')])}).strict();
export async function GET(r:Request){return route(async()=>{
 const actor=await authorize(r,'product:read'),x=query.parse(Object.fromEntries(new URL(r.url).searchParams));
 if(actor.role==='STUDENT'&&(x.profile!==actor.profile||x.grade!==actor.grade))throw new ApiError(403,'Profili ose klasa nuk lejohet.');
 const w=await actorWorkspace(actor);if(x.profile&&!w.profiles.some(p=>p.id===x.profile))throw new ApiError(404,'Profili nuk ekziston.');
 const rows=await db().prepare(`SELECT json_extract(payload,'$.lessonId') AS lessonId,
 CAST(json_extract(payload,'$.lessonLevel') AS INTEGER) AS level,COUNT(*) AS attempts,
 MAX(CASE WHEN NOT EXISTS(SELECT 1 FROM json_each(json_extract(payload,'$.answers')) a WHERE json_extract(a.value,'$.correct') != 1) THEN 1 ELSE 0 END) AS mastered,
 MAX(json_extract(payload,'$.stars')) AS stars FROM sessions WHERE owner=? AND profile=?
 AND json_extract(payload,'$.grade')=? AND json_extract(payload,'$.verified')=1
 AND json_extract(payload,'$.lessonId') IS NOT NULL AND json_extract(payload,'$.lessonLevel') BETWEEN 1 AND 30
 GROUP BY lessonId,level`).bind(actor.owner,x.profile,x.grade).all();
 return json({progress:rows.results});
});}
