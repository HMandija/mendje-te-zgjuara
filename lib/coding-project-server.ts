import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {db,json} from './school-server';
import {ApiError,actorWorkspace,limit,type Actor} from './school-access';
import {identifier} from './school-validation.mjs';
import {codingMission} from './coding-missions.mjs';
import {MAX_PROJECT_BYTES,readProjectFile} from './coding-project-file.mjs';

const scopeInput=z.object({class:identifier,mission:identifier,profile:identifier.optional()}).strict();
export type CodingScope=z.infer<typeof scopeInput>;
export function codingScope(r:Request){const query=new URL(r.url).searchParams;return scopeInput.parse({class:query.get('class'),mission:query.get('mission'),...(query.has('profile')?{profile:query.get('profile')}:{})});}
const activeStudent=`SELECT 1 FROM classes c JOIN class_students s ON s.class=c.id
 JOIN coding_assignments a ON a.class=c.id LEFT JOIN classroom_settings settings ON settings.class=c.id
 JOIN accounts account ON account.user=c.owner JOIN workspaces w ON w.owner=c.owner
 WHERE c.id=? AND c.owner=? AND s.profile=? AND a.mission=? AND c.grade=5
 AND COALESCE(settings.archived,0)=0 AND account.enabled=1 AND account.role IN ('TEACHER','ADMIN')
 AND EXISTS(SELECT 1 FROM json_each(w.payload,'$.profiles') p WHERE json_extract(p.value,'$.id')=s.profile AND json_extract(p.value,'$.grade')=5)`;
export async function projectTarget(actor:Actor,scope:CodingScope){
 if(!codingMission(scope.mission))throw new ApiError(404,'Misioni nuk u gjet.');
 if(actor.role==='STUDENT'){
  if(actor.grade!==5||!actor.profile||scope.profile&&scope.profile!==actor.profile||actor.classroom&&scope.class!==actor.classroom)throw new ApiError(403,'Misioni nuk është i lejuar për ty.');
  const allowed=await db().prepare(activeStudent).bind(scope.class,actor.owner,actor.profile,scope.mission).first();
  if(!allowed)throw new ApiError(403,'Misioni nuk është i lejuar për ty.');
  return actor.profile;
 }
 if(!scope.profile)throw new ApiError(400,'Zgjidh projektin e një nxënësi.');
 const allowed=await db().prepare(`SELECT 1 FROM classes c JOIN class_students s ON s.class=c.id WHERE c.id=? AND c.owner=? AND c.grade=5 AND s.profile=?`).bind(scope.class,actor.owner,scope.profile).first();
 const profile=(await actorWorkspace(actor)).profiles.find(p=>p.id===scope.profile&&p.grade===5);
 if(!allowed||!profile)throw new ApiError(404,'Projekti nuk u gjet në këtë klasë.');
 return scope.profile;
}
function bucket(){if(!env.BUCKET)throw new ApiError(503,'Ruajtja private nuk është konfiguruar ende.');return env.BUCKET;}
type ProjectRow={object_key:string;revision:number;updated:number;digest:string;bytes:number};
export async function codingLaunch(actor:Actor,scope:CodingScope){
 const profile=await projectTarget(actor,scope);
 const project=await db().prepare('SELECT revision,updated FROM coding_projects WHERE owner=? AND profile=? AND mission=?').bind(actor.owner,profile,scope.mission).first<{revision:number;updated:number}>();
 return json({mission:codingMission(scope.mission),readonly:actor.role!=='STUDENT',project});
}
export async function loadCodingProject(actor:Actor,scope:CodingScope){
 const profile=await projectTarget(actor,scope);
 const row=await db().prepare('SELECT object_key,revision,updated,digest,bytes FROM coding_projects WHERE owner=? AND profile=? AND mission=?').bind(actor.owner,profile,scope.mission).first<ProjectRow>();
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Project-Revision':String(row?.revision||0)};
 if(!row)return new Response(null,{status:204,headers});
 const object=await bucket().get(row.object_key);
 if(!object)throw new ApiError(503,'Projekti nuk mund të hapet për momentin. Provo përsëri.');
 const bytes=await object.arrayBuffer();
 if(bytes.byteLength!==row.bytes||await digest(bytes)!==row.digest)throw new ApiError(503,'Projekti nuk mund të hapet për momentin. Provo përsëri.');
 await projectTarget(actor,scope);
 return new Response(bytes,{headers:{...headers,'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename="projekti.sb3"'}});
}
async function digest(bytes:ArrayBuffer){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(value=>value.toString(16).padStart(2,'0')).join('');}
async function projectBody(r:Request){
 if(r.headers.get('content-type')?.split(';')[0]!=='application/octet-stream')throw new ApiError(415,'Dërgo një projekt .sb3.');
 if(Number(r.headers.get('content-length')||0)>MAX_PROJECT_BYTES)throw new ApiError(413,'Projekti duhet të jetë deri në 10 MB.');
 const reader=r.body?.getReader();if(!reader)throw new ApiError(400,'Projekti është bosh.');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>MAX_PROJECT_BYTES){await reader.cancel();throw new ApiError(413,'Projekti duhet të jetë deri në 10 MB.');}chunks.push(chunk.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 try{await readProjectFile(bytes.buffer);}catch(error){throw new ApiError(400,error instanceof Error?error.message:'Projekti është i pavlefshëm.');}
 return bytes.buffer;
}
export async function saveCodingProject(actor:Actor,scope:CodingScope,r:Request){
 if(actor.role!=='STUDENT')throw new ApiError(403,'Mësuesi mund ta shohë projektin, por jo ta ndryshojë.');
 const profile=await projectTarget(actor,scope);
 await limit('coding-save:'+actor.principal,12);
 const rawRevision=z.string().regex(/^(0|[1-9][0-9]{0,15})$/).parse(new URL(r.url).searchParams.get('revision'));
 const revision=z.coerce.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER-1).parse(rawRevision);
 const storage=bucket(),bytes=await projectBody(r),checksum=await digest(bytes);
 const current=await db().prepare('SELECT revision,digest FROM coding_projects WHERE owner=? AND profile=? AND mission=?').bind(actor.owner,profile,scope.mission).first<{revision:number;digest:string}>();
 if(current?.revision===revision+1&&current.digest===checksum){await projectTarget(actor,scope);return json({saved:true,revision:current.revision});}
 if((current?.revision||0)!==revision)throw new ApiError(409,'Projekti ndryshoi në një pajisje tjetër. Shkarko punën tënde përpara rihapjes.');
 const key='coding/'+crypto.randomUUID()+'.sb3',updated=Date.now();
 // Track the object before upload so failed or conflicting writes remain collectible.
 await db().prepare('INSERT INTO coding_objects(object_key,created) VALUES(?,?)').bind(key,updated).run();
 await storage.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});
 const result=await db().prepare(`INSERT INTO coding_projects(owner,profile,mission,object_key,revision,updated,digest,bytes)
 SELECT ?,?,?,?,?,?,?,? WHERE EXISTS(${activeStudent})
 AND (? IS NULL OR ?=?)
 AND ((?=0 AND NOT EXISTS(SELECT 1 FROM coding_projects WHERE owner=? AND profile=? AND mission=?)) OR EXISTS(SELECT 1 FROM coding_projects WHERE owner=? AND profile=? AND mission=? AND revision=?))
 ON CONFLICT(owner,profile,mission) DO UPDATE SET object_key=excluded.object_key,revision=excluded.revision,updated=excluded.updated,digest=excluded.digest,bytes=excluded.bytes
 WHERE coding_projects.revision=?`).bind(actor.owner,profile,scope.mission,key,revision+1,updated,checksum,bytes.byteLength,scope.class,actor.owner,profile,scope.mission,actor.classroom||null,actor.classroom||null,scope.class,revision,actor.owner,profile,scope.mission,actor.owner,profile,scope.mission,revision,revision).run();
 if(!result.meta.changes){await projectTarget(actor,scope);throw new ApiError(409,'Projekti ndryshoi. Shkarko punën tënde përpara rihapjes.');}
 return json({saved:true,revision:revision+1,updated});
}
let lastCleanup=0;
export async function collectCodingObjects(){
 if(!env.BUCKET||Date.now()-lastCleanup<60000)return;
 lastCleanup=Date.now();
 const stale=await db().prepare(`SELECT object_key FROM coding_objects o WHERE created<? AND NOT EXISTS(SELECT 1 FROM coding_projects p WHERE p.object_key=o.object_key) LIMIT 20`).bind(Date.now()-3600000).all<{object_key:string}>();
 for(const object of stale.results){await env.BUCKET.delete(object.object_key);await db().prepare('DELETE FROM coding_objects WHERE object_key=? AND NOT EXISTS(SELECT 1 FROM coding_projects WHERE object_key=?)').bind(object.object_key,object.object_key).run();}
}
