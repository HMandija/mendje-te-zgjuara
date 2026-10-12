import {recordAccess} from "./admin-server";
import {reserveMixed} from './mixed-pack.mjs';
import {z} from 'zod';
import {db,workspace,json,hash} from './school-server';
import {ApiError,limit,type Actor} from './school-access';
import {identifier} from './school-validation.mjs';
import {ownedClass,assignmentInput} from './product-server';
import {pictureIds} from './picture-catalog';
import {curriculumLesson} from './curriculum-catalog.mjs';
const name=z.string().trim().min(1).max(30);
const picture=z.string().refine(x=>pictureIds.includes(x as typeof pictureIds[number]));
export const rosterInput=z.discriminatedUnion('action',[
 z.object({action:z.literal('add'),class:identifier,names:z.array(name).min(1).max(100)}).strict(),
 z.object({action:z.literal('rename'),class:identifier,profile:identifier,name}).strict(),
 z.object({action:z.literal('picture'),class:identifier,profile:identifier,picture:picture.optional()}).strict(),
 z.object({action:z.literal('remove'),class:identifier,profile:identifier}).strict(),
 z.object({action:z.literal('renameClass'),class:identifier,name:z.string().trim().min(1).max(60)}).strict(),
 z.object({action:z.literal('archive'),class:identifier}).strict(),
 z.object({action:z.literal('restore'),class:identifier}).strict(),
 z.object({action:z.literal('purgeClass'),class:identifier,confirmation:z.literal('FSHI')}).strict(),
]);
export const codeSchema=z.string().trim().transform(x=>x.toUpperCase()).pipe(z.string().regex(/^[A-F0-9]{8}$/));
export const lookupInput=z.object({code:codeSchema}).strict();
export const pictureInput=z.object({challenge:z.string().regex(/^[a-f0-9]{64}$/),profile:identifier,picture}).strict();
const taskInput=assignmentInput.omit({class:true}).extend({scene:z.enum(['robot','shadows','garden','path','patterns','memory','wheels','memory-grid','pipes','maze']).optional(),gameLevel:z.number().int().min(1).max(20).optional(),lessonId:identifier.optional(),lessonLevel:z.number().int().min(1).max(30).optional(),sourceGrade:z.number().int().min(1).max(4).optional(),allowGradeMismatch:z.boolean().optional()}).refine(x=>!!x.scene===!!x.gameLevel&&!!x.lessonId===!!x.lessonLevel&&!(x.scene&&x.lessonId)&&(!x.lessonId||x.count===5));
export const bulkAssignmentInput=z.object({classes:z.array(identifier).min(1).max(100),task:taskInput}).strict().refine(x=>new Set(x.classes).size===x.classes.length);
export const editAssignmentInput=z.object({id:identifier,task:taskInput}).strict();
export const deleteAssignmentInput=z.object({id:identifier}).strict();
const randomToken=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('');
const randomPicture=()=>pictureIds[crypto.getRandomValues(new Uint32Array(1))[0]%pictureIds.length];
async function changeProfiles(actor:Actor,transform:(p:Awaited<ReturnType<typeof workspace>>['profiles'])=>Awaited<ReturnType<typeof workspace>>['profiles']){
 const w=await workspace(actor.owner),profiles=transform(w.profiles);
 if(profiles.length>2000)throw new ApiError(400,'Eksporto ose arkivo të dhënat përpara se të shtosh më shumë nxënës.');
 await db().prepare('INSERT OR IGNORE INTO workspaces(owner,payload,revision) VALUES(?,?,0)').bind(actor.owner,JSON.stringify({profiles:[],custom:[]})).run();
 const r=await db().prepare('UPDATE workspaces SET payload=?,revision=revision+1 WHERE owner=? AND revision=?').bind(JSON.stringify({profiles,custom:w.custom}),actor.owner,w.revision).run();
 if(!r.meta.changes)throw new ApiError(409,'Lista ndryshoi në një pajisje tjetër. Provo përsëri.');
 return profiles;
}
export async function rosterData(actor:Actor,id:string){
 const c=await ownedClass(actor,id),w=await workspace(actor.owner);
 const members=await db().prepare('SELECT m.profile,l.picture FROM class_students m LEFT JOIN picture_logins l ON l.class=m.class AND l.profile=m.profile WHERE m.class=?').bind(c.id).all<{profile:string;picture:string|null}>();
 return json({students:members.results.flatMap(m=>{const p=w.profiles.find(p=>p.id===m.profile);return p?[{...p,picture:m.picture}]:[];})});
}
export async function rosterAction(actor:Actor,x:z.infer<typeof rosterInput>){
 const c=await ownedClass(actor,x.class);await limit('roster-write:'+actor.principal,60);
 if(x.action==='purgeClass'){
  const archived=await db().prepare('SELECT archived FROM classroom_settings WHERE class=?').bind(c.id).first<{archived:number}>();if(!archived?.archived)throw new ApiError(400,'Arkivo klasën përpara fshirjes përfundimtare.');
  await db().prepare('DELETE FROM classes WHERE id=? AND owner=?').bind(c.id,actor.owner).run();return json({deleted:true});
 }
 if(x.action==='renameClass'){await db().prepare('UPDATE classes SET name=? WHERE id=? AND owner=?').bind(x.name,c.id,actor.owner).run();return json({saved:true});}
 if(x.action==='archive'||x.action==='restore'){
  await db().batch([db().prepare('INSERT INTO classroom_settings(class,archived) VALUES(?,?) ON CONFLICT(class) DO UPDATE SET archived=excluded.archived').bind(c.id,x.action==='archive'?1:0),db().prepare('DELETE FROM picture_sessions WHERE class=?').bind(c.id)]);return json({saved:true});
 }
 const archived=await db().prepare('SELECT archived FROM classroom_settings WHERE class=?').bind(c.id).first<{archived:number}>();if(archived?.archived)throw new ApiError(400,'Rikthe klasën përpara ndryshimeve.');
 if(x.action==='add'){
  const members=await db().prepare('SELECT COUNT(*) n FROM class_students WHERE class=?').bind(c.id).first<{n:number}>();if((members?.n||0)+x.names.length>100)throw new ApiError(400,'Një klasë mbështet deri në 100 nxënës.');
  const students=x.names.map(name=>({id:crypto.randomUUID(),name,grade:c.grade}));
  const w=await workspace(actor.owner);if(w.profiles.length+students.length>2000)throw new ApiError(400,'Hapësira mbështet deri në 2000 nxënës.');
  await db().prepare('INSERT OR IGNORE INTO workspaces(owner,payload,revision) VALUES(?,?,0)').bind(actor.owner,JSON.stringify({profiles:[],custom:[]})).run();
  const guard="EXISTS(SELECT 1 FROM workspaces w,json_each(w.payload,'$.profiles') p WHERE w.owner=? AND w.revision=? AND json_extract(p.value,'$.id')=?)";
  const results=await db().batch([db().prepare('UPDATE workspaces SET payload=?,revision=revision+1 WHERE owner=? AND revision=?').bind(JSON.stringify({profiles:[...w.profiles,...students],custom:w.custom}),actor.owner,w.revision),...students.flatMap(p=>[
   db().prepare('INSERT INTO class_students(class,profile) SELECT ?,? WHERE '+guard).bind(c.id,p.id,actor.owner,w.revision+1,p.id),
   db().prepare('INSERT INTO picture_logins(class,profile,picture) SELECT ?,?,? WHERE '+guard).bind(c.id,p.id,randomPicture(),actor.owner,w.revision+1,p.id),
  ])]);if(!results[0].meta.changes)throw new ApiError(409,'Lista ndryshoi në një pajisje tjetër. Provo përsëri.');
  return json({added:students.length});
 }
 const m=await db().prepare('SELECT profile FROM class_students WHERE class=? AND profile=?').bind(c.id,x.profile).first();if(!m)throw new ApiError(404,'Nxënësi nuk u gjet në këtë klasë.');
 if(x.action==='rename')await changeProfiles(actor,p=>p.map(p=>p.id===x.profile?{...p,name:x.name}:p));
 if(x.action==='picture')await db().batch([db().prepare('INSERT INTO picture_logins(class,profile,picture) VALUES(?,?,?) ON CONFLICT(class,profile) DO UPDATE SET picture=excluded.picture').bind(c.id,x.profile,x.picture||randomPicture()),db().prepare('DELETE FROM picture_sessions WHERE class=? AND profile=?').bind(c.id,x.profile)]);
 if(x.action==='remove')await db().batch([db().prepare('DELETE FROM class_students WHERE class=? AND profile=?').bind(c.id,x.profile),db().prepare('DELETE FROM picture_logins WHERE class=? AND profile=?').bind(c.id,x.profile),db().prepare('DELETE FROM picture_sessions WHERE class=? AND profile=?').bind(c.id,x.profile)]);
 return json({saved:true});
}
export async function lookupClass(r:Request,x:z.infer<typeof lookupInput>){
 await limit('roster-lookup-ip:'+(r.headers.get('cf-connecting-ip')||'private-site'),300,300000);
 const c=await db().prepare('SELECT c.id,c.name,c.grade,c.owner FROM classes c LEFT JOIN classroom_settings s ON s.class=c.id JOIN accounts a ON a.user=c.owner WHERE c.code=? AND COALESCE(s.archived,0)=0 AND a.enabled=1 AND a.role IN (\'TEACHER\',\'ADMIN\')').bind(x.code).first<{id:string;name:string;grade:number;owner:string}>();
 if(!c)throw new ApiError(404,'Kontrollo kodin e klasës me mësuesin.');
 const w=await workspace(c.owner),rows=await db().prepare('SELECT profile FROM picture_logins WHERE class=? AND EXISTS(SELECT 1 FROM class_students m WHERE m.class=picture_logins.class AND m.profile=picture_logins.profile)').bind(c.id).all<{profile:string}>();
 const challenge=randomToken();await db().batch([db().prepare('INSERT INTO roster_challenges(hash,class,expires) VALUES(?,?,?)').bind(await hash(challenge),c.id,Date.now()+600000),db().prepare('DELETE FROM roster_challenges WHERE hash IN (SELECT hash FROM roster_challenges WHERE expires<? LIMIT 100)').bind(Date.now())]);
 return json({challenge,name:c.name,grade:c.grade,students:rows.results.flatMap(m=>{const p=w.profiles.find(p=>p.id===m.profile);return p?[{id:p.id,name:p.name}]:[];})});
}
export async function loginPicture(r:Request,x:z.infer<typeof pictureInput>){
 await limit('picture-ip:'+(r.headers.get('cf-connecting-ip')||'private-site'),300,300000);
 const challenge=await db().prepare('SELECT class FROM roster_challenges WHERE hash=? AND expires>?').bind(await hash(x.challenge),Date.now()).first<{class:string}>();
 if(!challenge)throw new ApiError(401,'Kodi ka skaduar. Vendose sërish.');
 await limit('picture-student:'+challenge.class+':'+x.profile,5,300000);
 const match=await db().prepare('SELECT l.picture FROM picture_logins l JOIN class_students m ON m.class=l.class AND m.profile=l.profile JOIN classes c ON c.id=l.class JOIN accounts a ON a.user=c.owner LEFT JOIN classroom_settings s ON s.class=c.id WHERE l.class=? AND l.profile=? AND COALESCE(s.archived,0)=0 AND a.enabled=1 AND a.role IN (\'TEACHER\',\'ADMIN\')').bind(challenge.class,x.profile).first<{picture:string}>();
 if(!match||match.picture!==x.picture)throw new ApiError(401,'Figura nuk përputhet. Provo sërish ose pyet mësuesin.');
 const token=randomToken();await db().prepare('INSERT INTO picture_sessions(hash,class,profile,expires) VALUES(?,?,?,?)').bind(await hash(token),challenge.class,x.profile,Date.now()+8*3600000).run();await recordAccess(r,challenge.class+':'+x.profile,'STUDENT');return json({token});
}
export async function logoutPicture(r:Request){const raw=r.headers.get('authorization')||'';if(/^Bearer [a-f0-9]{64}$/.test(raw)){const h=await hash(raw.slice(7));await db().batch([db().prepare('DELETE FROM picture_sessions WHERE hash=?').bind(h),db().prepare('UPDATE invitations SET revoked=1 WHERE hash=?').bind(h)]);}return json({loggedOut:true});}
export async function assignClasses(actor:Actor,x:z.infer<typeof bulkAssignmentInput>){
 const classes=await Promise.all(x.classes.map(id=>ownedClass(actor,id)));if(new Set(classes.map(c=>c.grade)).size!==1)throw new ApiError(400,'Detyrat e përbashkëta duhet të kenë të njëjtin vit shkollor.');
 const sourceGrade=x.task.lessonId?curriculumLesson(x.task.lessonId)?.grade:x.task.sourceGrade||classes[0].grade;
 if(!sourceGrade||x.task.sourceGrade&&x.task.sourceGrade!==sourceGrade)throw new ApiError(400,'Klasa e mësimit është e pavlefshme.');
 if(classes.some(c=>c.grade!==sourceGrade)&&!x.task.allowGradeMismatch)throw new ApiError(409,`Ky mësim është për klasën ${sourceGrade}. Konfirmoni caktimin për një klasë tjetër.`);
 const archived=await db().prepare('SELECT class FROM classroom_settings WHERE archived=1 AND class IN (SELECT id FROM classes WHERE owner=?)').bind(actor.owner).all<{class:string}>();if(archived.results.some(s=>x.classes.includes(s.class)))throw new ApiError(400,'Rikthe klasën nga arkivi përpara caktimit.');
 await limit('assign-many:'+actor.principal,20);
 const ids=x.classes.map(()=>crypto.randomUUID());
 const plans=await Promise.all(classes.map(async c=>{if(x.task.category!=='mixed'||x.task.scene||x.task.lessonId)return null;const h=await db().prepare('SELECT category,scene,lesson_id,mixed_number,mixed_items FROM assignments WHERE class=?').bind(c.id).all();const p=reserveMixed(sourceGrade,h.results,x.task.count);if(!p.items.length)throw new ApiError(400,'Kjo klasë ka konsumuar të gjitha kuizet e përziera.');return p;}));
 await db().batch(x.classes.flatMap((c,i)=>[db().prepare('UPDATE assignments SET active=0 WHERE class=? AND active=1').bind(c),db().prepare('INSERT INTO assignments(id,class,title,category,level,count,due,scene,game_level,lesson_id,lesson_level,mixed_number,mixed_items,source_grade) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(ids[i],c,plans[i]?`Kuize të përziera ${plans[i].number}`:x.task.title,x.task.category,x.task.level,x.task.count,x.task.due,x.task.scene||null,x.task.gameLevel||null,x.task.lessonId||null,x.task.lessonLevel||null,plans[i]?.number||null,plans[i]?JSON.stringify(plans[i].items):null,sourceGrade)]));return json({ids});
}
export async function changeAssignment(actor:Actor,x:z.infer<typeof editAssignmentInput>|z.infer<typeof deleteAssignmentInput>){
 const a=await db().prepare('SELECT a.id,a.mixed_number,a.count,a.source_grade,c.grade FROM assignments a JOIN classes c ON c.id=a.class WHERE a.id=? AND c.owner=?').bind(x.id,actor.owner).first<{id:string;grade:number;mixed_number:number|null;count:number;source_grade:number|null}>();if(!a)throw new ApiError(404,'Detyra nuk u gjet.');
 if('task' in x&&(a.mixed_number?x.task.category!=='mixed'||!!x.task.scene||!!x.task.lessonId||x.task.count!==a.count:x.task.category==='mixed'&&!x.task.scene&&!x.task.lessonId))throw new ApiError(400,'Për një paketë të re kuizesh përdor Cakto një mësim të ri.');
 const sourceGrade='task' in x?(x.task.lessonId?curriculumLesson(x.task.lessonId)?.grade:x.task.sourceGrade||a.source_grade||a.grade):a.grade;
 if(!sourceGrade)throw new ApiError(400,'Mësimi nuk u gjet.');
 if('task' in x&&sourceGrade!==a.grade&&sourceGrade!==a.source_grade&&!x.task.allowGradeMismatch)throw new ApiError(409,'Konfirmoni klasën e mësimit.');
 if('task' in x)await db().prepare('UPDATE assignments SET title=?,category=?,level=?,count=?,due=?,scene=?,game_level=?,lesson_id=?,lesson_level=?,source_grade=? WHERE id=?').bind(x.task.title,x.task.category,x.task.level,x.task.count,x.task.due,x.task.scene||null,x.task.gameLevel||null,x.task.lessonId||null,x.task.lessonLevel||null,sourceGrade,x.id).run();else await db().prepare('UPDATE assignments SET active=0 WHERE id=?').bind(x.id).run();return json({saved:true});
}
