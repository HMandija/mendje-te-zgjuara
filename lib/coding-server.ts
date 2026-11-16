import {z} from 'zod';
import {db,json} from './school-server';
import {ApiError,actorWorkspace,type Actor} from './school-access';
import {identifier} from './school-validation.mjs';
import {CODING_MISSIONS,codingMission} from './coding-missions.mjs';
import {ownedClass} from './product-server';

export const codingAssignmentInput=z.object({class:identifier,mission:identifier,enabled:z.boolean()}).strict();

export async function studentMissionAllowed(actor:Actor,mission:string){
 if(actor.role!=='STUDENT'||actor.grade!==5||!actor.profile||!codingMission(mission))return false;
 const row=await db().prepare(`SELECT 1 AS ok FROM coding_assignments a
  JOIN classes c ON c.id=a.class JOIN class_students s ON s.class=c.id
  LEFT JOIN classroom_settings settings ON settings.class=c.id
  WHERE c.owner=? AND c.grade=5 AND s.profile=? AND a.mission=?
  AND COALESCE(settings.archived,0)=0 AND (? IS NULL OR c.id=?) LIMIT 1`)
  .bind(actor.owner,actor.profile,mission,actor.classroom||null,actor.classroom||null).first<{ok:number}>();
 return !!row;
}

export async function codingStudentData(actor:Actor){
 if(actor.role!=='STUDENT'||actor.grade!==5||!actor.profile)throw new ApiError(403,'Laboratori është për nxënësit e klasës së pestë.');
 const rows=await db().prepare(`SELECT a.mission,c.id AS classroom,c.name FROM coding_assignments a
  JOIN classes c ON c.id=a.class JOIN class_students s ON s.class=c.id
  LEFT JOIN classroom_settings settings ON settings.class=c.id
  WHERE c.owner=? AND c.grade=5 AND s.profile=? AND COALESCE(settings.archived,0)=0
  AND (? IS NULL OR c.id=?) ORDER BY a.created,c.name`)
  .bind(actor.owner,actor.profile,actor.classroom||null,actor.classroom||null).all<{mission:string;classroom:string;name:string}>();
 const projects=await db().prepare('SELECT mission,revision,updated FROM coding_projects WHERE owner=? AND profile=?').bind(actor.owner,actor.profile).all<{mission:string;revision:number;updated:number}>();
 return json({missions:CODING_MISSIONS.filter(m=>rows.results.some(r=>r.mission===m.id)).map(m=>({...m,classes:rows.results.filter(r=>r.mission===m.id).map(r=>({id:r.classroom,name:r.name})),project:projects.results.find(p=>p.mission===m.id)||null}))});
}

export async function codingClassData(actor:Actor,id:string){
 const classroom=await ownedClass(actor,id);
 if(classroom.grade!==5)throw new ApiError(400,'Laboratori është për klasën e pestë.');
 const assignments=await db().prepare('SELECT mission FROM coding_assignments WHERE class=?').bind(id).all<{mission:string}>();
 const projects=await db().prepare(`SELECT p.profile,p.mission,p.revision,p.updated FROM coding_projects p
  JOIN class_students s ON s.profile=p.profile JOIN classes c ON c.id=s.class
  WHERE c.id=? AND c.owner=? AND p.owner=c.owner`).bind(id,actor.owner).all<{profile:string;mission:string;revision:number;updated:number}>();
 const workspace=await actorWorkspace(actor);
 return json({missions:CODING_MISSIONS,assigned:assignments.results.map(a=>a.mission),projects:projects.results.flatMap(p=>{const profile=workspace.profiles.find(s=>s.id===p.profile);return profile?[{...p,name:profile.name}]:[];})});
}

export async function setCodingAssignment(actor:Actor,x:z.infer<typeof codingAssignmentInput>){
 const classroom=await ownedClass(actor,x.class);
 if(classroom.grade!==5||!codingMission(x.mission))throw new ApiError(400,'Misioni ose klasa nuk është e vlefshme.');
 const archived=await db().prepare('SELECT archived FROM classroom_settings WHERE class=?').bind(x.class).first<{archived:number}>();
 if(archived?.archived)throw new ApiError(400,'Rikthe klasën nga arkivi përpara caktimit.');
 const result=x.enabled
  ?await db().prepare(`INSERT INTO coding_assignments(class,mission,created)
   SELECT c.id,?,? FROM classes c LEFT JOIN classroom_settings s ON s.class=c.id
   WHERE c.id=? AND c.owner=? AND c.grade=5 AND COALESCE(s.archived,0)=0
   ON CONFLICT(class,mission) DO UPDATE SET mission=excluded.mission`)
   .bind(x.mission,Date.now(),x.class,actor.owner).run()
  :await db().prepare(`DELETE FROM coding_assignments WHERE class=? AND mission=? AND EXISTS(
   SELECT 1 FROM classes c LEFT JOIN classroom_settings s ON s.class=c.id
   WHERE c.id=? AND c.owner=? AND c.grade=5 AND COALESCE(s.archived,0)=0)`)
   .bind(x.class,x.mission,x.class,actor.owner).run();
 if(!result.meta.changes){
  const active=await db().prepare(`SELECT 1 AS ok FROM classes c LEFT JOIN classroom_settings s ON s.class=c.id
   WHERE c.id=? AND c.owner=? AND c.grade=5 AND COALESCE(s.archived,0)=0`)
   .bind(x.class,actor.owner).first<{ok:number}>();
  if(!active||x.enabled)throw new ApiError(409,'Klasa ndryshoi. Provo përsëri.');
 }
 return json({saved:true});
}
