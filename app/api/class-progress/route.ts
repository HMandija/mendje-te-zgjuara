import {authorize} from '../../../lib/school-access';
import {route} from '../../../lib/api-route';
import {identifier} from '../../../lib/school-validation.mjs';
import {ownedClass} from '../../../lib/product-server';
import {db,json} from '../../../lib/school-server';
export async function GET(r:Request){return route(async()=>{
 const actor=await authorize(r,'class:write'),c=await ownedClass(actor,identifier.parse(new URL(r.url).searchParams.get('class')));
 const sessions=await db().prepare("SELECT s.id,s.profile,s.payload,s.created FROM sessions s JOIN class_students m ON m.profile=s.profile AND m.class=? WHERE s.owner=? ORDER BY s.created").bind(c.id,actor.owner).all<{id:string;profile:string;payload:string;created:string}>();
 const started=await db().prepare('SELECT a.profile,a.assignment,COUNT(t.position) AS answered FROM adventures a JOIN class_students m ON m.profile=a.profile AND m.class=? JOIN assignments task ON task.id=a.assignment AND task.class=? LEFT JOIN attempt_answers t ON t.adventure=a.id WHERE a.owner=? AND a.completed=0 AND a.expires>? GROUP BY a.id').bind(c.id,c.id,actor.owner,Date.now()).all();
 return json({sessions:sessions.results.map(s=>({...JSON.parse(s.payload),id:s.id,profile:s.profile,date:s.created})),started:started.results});
 });}
