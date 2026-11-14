import {json,db,sameOrigin,sessionRows} from '../../../lib/school-server';
import {authorize,ApiError,actorWorkspace} from '../../../lib/school-access';
import {input,route} from '../../../lib/api-route';
import {workspaceSchema,deleteProfileSchema} from '../../../lib/school-validation.mjs';
export async function GET(r:Request){return route(async()=>{const actor=await authorize(r,'workspace:read');return json({...await actorWorkspace(actor),scope:actor.owner,role:actor.role,sessions:await sessionRows(actor.owner)});});}
export async function PUT(r:Request){return route(async()=>{
 const actor=await authorize(r,'workspace:write');
 if(!sameOrigin(r))throw new ApiError(403,'Origjinë e palejuar.');
 const x=await input(r,workspaceSchema);
 const payload=JSON.stringify({profiles:x.profiles,custom:x.custom});
 if(x.revision===0)await db().prepare('INSERT OR IGNORE INTO workspaces(owner,payload,revision) VALUES(?,?,0)').bind(actor.owner,JSON.stringify({profiles:[],custom:[]})).run();
 const result=await db().prepare('UPDATE workspaces SET payload=?,revision=revision+1 WHERE owner=? AND revision=?').bind(payload,actor.owner,x.revision).run();
 if(!result.meta.changes)throw new ApiError(409,'Të dhënat ndryshuan në një pajisje tjetër. Ringarko faqen para ndryshimit tjetër.');
 return json({revision:x.revision+1});
});}
export async function DELETE(r:Request){return route(async()=>{
 const actor=await authorize(r,'workspace:write');if(!sameOrigin(r))throw new ApiError(403,'Origjinë e palejuar.');
 const x=await input(r,deleteProfileSchema),w=await actorWorkspace(actor);
 if(x.revision!==w.revision)throw new ApiError(409,'Ringarko profilet përpara fshirjes.');
 const payload=JSON.stringify({profiles:w.profiles.filter(p=>p.id!==x.profile),custom:w.custom});
 const guard="AND NOT EXISTS (SELECT 1 FROM workspaces, json_each(workspaces.payload,'$.profiles') p WHERE workspaces.owner=? AND json_extract(p.value,'$.id')=?)";
 const results=await db().batch([
  db().prepare('UPDATE workspaces SET payload=?,revision=revision+1 WHERE owner=? AND revision=?').bind(payload,actor.owner,x.revision),
  db().prepare('DELETE FROM invitations WHERE owner=? AND profile=? '+guard).bind(actor.owner,x.profile,actor.owner,x.profile),
  db().prepare('DELETE FROM robot_worlds WHERE owner=? AND profile=? '+guard).bind(actor.owner,x.profile,actor.owner,x.profile),
  db().prepare('DELETE FROM sessions WHERE owner=? AND profile=? '+guard).bind(actor.owner,x.profile,actor.owner,x.profile),
  db().prepare('DELETE FROM adventures WHERE owner=? AND profile=? '+guard).bind(actor.owner,x.profile,actor.owner,x.profile),
  db().prepare('DELETE FROM class_students WHERE profile=? AND class IN (SELECT id FROM classes WHERE owner=?) '+guard).bind(x.profile,actor.owner,actor.owner,x.profile),
  db().prepare('DELETE FROM picture_logins WHERE profile=? AND class IN (SELECT id FROM classes WHERE owner=?) '+guard).bind(x.profile,actor.owner,actor.owner,x.profile),
  db().prepare('DELETE FROM picture_sessions WHERE profile=? AND class IN (SELECT id FROM classes WHERE owner=?) '+guard).bind(x.profile,actor.owner,actor.owner,x.profile),
 ]);
 if(!results[0].meta.changes)throw new ApiError(409,'Të dhënat ndryshuan. Ringarko profilet.');
 return json({deleted:true,revision:x.revision+1});
});}
