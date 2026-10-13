import {z} from 'zod';
import {route,input} from '../../../lib/api-route';
import {adminIdentity,adminUsers,adminAccountEmails,changeAdminAccount,createAdminAccount} from '../../../lib/admin-server';
import {db,json} from '../../../lib/school-server';
import {limit,requireOrigin} from '../../../lib/school-access';
const query=z.object({view:z.enum(['overview','users','students','access']),page:z.coerce.number().int().min(1).max(10000).default(1)}).strict();
export async function GET(r:Request){return route(async()=>{
 const user=await adminIdentity(r);await limit('admin-read:'+user,120);const {view,page}=query.parse(Object.fromEntries(new URL(r.url).searchParams));
 if(view==='users')return adminUsers(page,user);
 if(view==='students'){const rows=await db().prepare('SELECT owner,payload FROM workspaces ORDER BY owner LIMIT 20 OFFSET ?').bind((page-1)*20).all<{owner:string;payload:string}>();const emails=await adminAccountEmails(rows.results.map(w=>w.owner));return json({page,hasMore:rows.results.length===20,students:rows.results.flatMap(w=>{const data=JSON.parse(w.payload) as {profiles?:Array<{id:string;name:string;grade:number}>};return (data.profiles||[]).map(p=>({id:p.id,name:p.name,grade:p.grade,owner:w.owner,ownerEmail:emails.get(w.owner)||''}));})});}
 if(view==='access'){
  const events=await db().prepare(`SELECT e.principal,e.kind,e.created,e.ip,e.country,c.owner AS teacher_owner,c.name AS class_name,json_extract(p.value,'$.name') AS profile_name
   FROM (SELECT * FROM access_events WHERE created>? ORDER BY created DESC LIMIT 50 OFFSET ?) e
   LEFT JOIN classes c ON e.kind='STUDENT' AND c.id=substr(e.principal,1,36)
   LEFT JOIN workspaces w ON w.owner=c.owner
   LEFT JOIN json_each(w.payload,'$.profiles') p ON json_extract(p.value,'$.id')=substr(e.principal,38)
   ORDER BY e.created DESC`).bind(Date.now()-30*86400000,(page-1)*50).all<{principal:string;kind:string;created:number;ip:string;country:string;teacher_owner:string|null;class_name:string|null;profile_name:string|null}>();
  const emails=await adminAccountEmails(events.results.map(e=>e.kind==='STUDENT'?e.teacher_owner||'':e.principal));
  return json({page,events:events.results.map(e=>({principal:e.principal,kind:e.kind,created:e.created,ip:e.ip,country:e.country,email:e.kind==='STUDENT'?'':emails.get(e.principal)||'',profileName:e.profile_name||'',className:e.class_name||'',teacherEmail:emails.get(e.teacher_owner||'')||''}))});
 }
 const [accounts,classes,students,traffic,logins]=await Promise.all([
 db().prepare('SELECT count(*) AS count FROM accounts').first(),db().prepare('SELECT count(*) AS count FROM classes').first(),db().prepare('SELECT count(*) AS count FROM class_students').first(),db().prepare('SELECT day,SUM(count) AS count FROM traffic_days WHERE day>=? GROUP BY day ORDER BY day DESC LIMIT 30').bind(new Date(Date.now()-29*86400000).toISOString().slice(0,10)).all(),db().prepare('SELECT count(*) AS count FROM access_events WHERE created>?').bind(Date.now()-30*86400000).first()]);
 return json({accounts,classes,students,traffic:traffic.results,logins,period:'30 ditët e fundit'});
});}
const create=z.object({email:z.string().trim().email().max(254),password:z.string().min(12).max(128)}).strict();
const change=z.object({id:z.string().uuid(),action:z.enum(['block','unblock'])}).strict();
export async function POST(r:Request){return route(async()=>{requireOrigin(r);const actor=await adminIdentity(r);await limit('admin-create:'+actor,10,600000);const x=await input(r,create);return createAdminAccount(actor,x.email,x.password,new URL('/teacher/login',r.url).href);});}
export async function PATCH(r:Request){return route(async()=>{requireOrigin(r);const actor=await adminIdentity(r);await limit('admin-change:'+actor,20,600000);const x=await input(r,change);return changeAdminAccount(actor,x.id,x.action);});}
