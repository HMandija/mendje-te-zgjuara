import {json,workspace,sessionRows,db} from '../../../lib/school-server';
import {authorize,requireOrigin} from '../../../lib/school-access';
import {input,route} from '../../../lib/api-route';
import {sessionSchema} from '../../../lib/school-validation.mjs';
import {finishAdventure} from '../../../lib/adventure-server';
export async function GET(r:Request){return route(async()=>{const actor=await authorize(r,'student:read'),w=await workspace(actor.owner);const full=actor.classroom?await db().prepare('SELECT id,payload,created FROM sessions WHERE owner=? AND profile=? ORDER BY created').bind(actor.owner,actor.profile).all<{id:string;payload:string;created:string}>():null;return json({role:actor.role,profile:w.profiles.find((p:{id:string})=>p.id===actor.profile),custom:w.custom.filter(p=>p.grade===actor.grade).map(p=>({id:p.id,grade:p.grade,cat:p.cat})),sessions:full?full.results.map(s=>({...JSON.parse(s.payload),id:s.id,profile:actor.profile,date:s.created})):await sessionRows(actor.owner,actor.profile)});});}
export async function POST(r:Request){return route(async()=>{requireOrigin(r);const actor=await authorize(r,'student:finish');const x=await input(r,sessionSchema);return finishAdventure(actor,{...x,profile:actor.profile!});});}
