import {db,workspace,hash} from './school-server';
import {ApiError} from './school-access';

// The caller authorizes class:write and verifies ownership before entering here.
export async function importRoster(owner:string,c:{id:string;grade:number},names:string[],requestId:string,picture:()=>string){
 const database=db(),fingerprint=await hash(JSON.stringify({class:c.id,names}));
 const previous=async()=>{
  const row=await database.prepare('SELECT fingerprint,added FROM roster_imports WHERE owner=? AND request_id=?').bind(owner,requestId).first<{fingerprint:string;added:number}>();
  if(row&&row.fingerprint!==fingerprint)throw new ApiError(409,'Kjo kërkesë është përdorur për një listë tjetër.');
  return row;
 };
 const saved=await previous();if(saved)return {added:saved.added};
 const members=await database.prepare('SELECT COUNT(*) n FROM class_students WHERE class=?').bind(c.id).first<{n:number}>();
 if((members?.n||0)+names.length>100){const replay=await previous();if(replay)return {added:replay.added};throw new ApiError(400,'Një klasë mbështet deri në 100 nxënës.');}
 const w=await workspace(owner);
 if(w.profiles.length+names.length>2000){const replay=await previous();if(replay)return {added:replay.added};throw new ApiError(400,'Hapësira mbështet deri në 2000 nxënës.');}
 const students=names.map(name=>({id:crypto.randomUUID(),name,grade:c.grade}));
 const rows=JSON.stringify(students.map(p=>({id:p.id,picture:picture()})));
 await database.prepare('INSERT OR IGNORE INTO workspaces(owner,payload,revision) VALUES(?,?,0)').bind(owner,JSON.stringify({profiles:[],custom:[] })).run();
 // Checking a newly generated ID as well as the revision prevents a losing
 // concurrent request from attaching its rows to another writer's revision.
 const guard="EXISTS(SELECT 1 FROM workspaces w,json_each(w.payload,'$.profiles') p WHERE w.owner=? AND w.revision=? AND json_extract(p.value,'$.id')=?)";
 const results=await database.batch([
  database.prepare(`UPDATE workspaces SET payload=?,revision=revision+1 WHERE owner=? AND revision=?
   AND NOT EXISTS(SELECT 1 FROM roster_imports WHERE owner=? AND request_id=?)
   AND EXISTS(SELECT 1 FROM classes c LEFT JOIN classroom_settings s ON s.class=c.id WHERE c.id=? AND c.owner=? AND c.grade=? AND COALESCE(s.archived,0)=0)
   AND (SELECT COUNT(*) FROM class_students WHERE class=?) + ? <= 100`)
   .bind(JSON.stringify({profiles:[...w.profiles,...students],custom:w.custom}),owner,w.revision,owner,requestId,c.id,owner,c.grade,c.id,names.length),
  database.prepare(`INSERT INTO class_students(class,profile) SELECT ?,json_extract(value,'$.id') FROM json_each(?) WHERE ${guard}`)
   .bind(c.id,rows,owner,w.revision+1,students[0].id),
  database.prepare(`INSERT INTO picture_logins(class,profile,picture) SELECT ?,json_extract(value,'$.id'),json_extract(value,'$.picture') FROM json_each(?) WHERE ${guard}`)
   .bind(c.id,rows,owner,w.revision+1,students[0].id),
  database.prepare(`INSERT INTO roster_imports(owner,request_id,class,fingerprint,added) SELECT ?,?,?,?,? WHERE ${guard}`)
   .bind(owner,requestId,c.id,fingerprint,names.length,owner,w.revision+1,students[0].id),
 ]);
 if(!results[0].meta.changes){const replay=await previous();if(replay)return {added:replay.added};throw new ApiError(409,'Lista ose klasa ndryshoi në një pajisje tjetër. Provo përsëri.');}
 return {added:students.length};
}
