import {z} from 'zod';
import {route} from '../../../lib/api-route';
import {adminIdentity,adminUsers} from '../../../lib/admin-server';
import {db,json} from '../../../lib/school-server';
import {limit} from '../../../lib/school-access';
const query=z.object({view:z.enum(['overview','users','students','access']),page:z.coerce.number().int().min(1).max(10000).default(1)}).strict();
export async function GET(r:Request){return route(async()=>{
 const user=await adminIdentity(r);await limit('admin-read:'+user,120);const {view,page}=query.parse(Object.fromEntries(new URL(r.url).searchParams));
 if(view==='users')return adminUsers(page);
 if(view==='students'){const rows=await db().prepare('SELECT owner,payload FROM workspaces ORDER BY owner LIMIT 20 OFFSET ?').bind((page-1)*20).all<{owner:string;payload:string}>();return json({page,hasMore:rows.results.length===20,students:rows.results.flatMap(w=>{const data=JSON.parse(w.payload) as {profiles?:Array<{id:string;name:string;grade:number}>};return (data.profiles||[]).map(p=>({id:p.id,name:p.name,grade:p.grade,owner:w.owner}));})});}
 if(view==='access'){const events=await db().prepare('SELECT principal,kind,created,ip,country FROM access_events WHERE created>? ORDER BY created DESC LIMIT 50 OFFSET ?').bind(Date.now()-30*86400000,(page-1)*50).all();return json({page,events:events.results});}
 const [accounts,classes,students,traffic,logins]=await Promise.all([
 db().prepare('SELECT count(*) AS count FROM accounts').first(),db().prepare('SELECT count(*) AS count FROM classes').first(),db().prepare('SELECT count(*) AS count FROM class_students').first(),db().prepare('SELECT day,SUM(count) AS count FROM traffic_days WHERE day>=? GROUP BY day ORDER BY day DESC LIMIT 30').bind(new Date(Date.now()-29*86400000).toISOString().slice(0,10)).all(),db().prepare('SELECT count(*) AS count FROM access_events WHERE created>?').bind(Date.now()-30*86400000).first()]);
 return json({accounts,classes,students,traffic:traffic.results,logins,period:'30 ditët e fundit'});
});}
