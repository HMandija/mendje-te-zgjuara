import {json,db,hash} from '../../../lib/school-server';
import {authorize,requireOrigin,limit,ApiError,actorWorkspace} from '../../../lib/school-access';
import {input,route} from '../../../lib/api-route';
import {inviteSchema} from '../../../lib/school-validation.mjs';
export async function POST(r:Request){return route(async()=>{
 requireOrigin(r);const actor=await authorize(r,'invite:create');await limit('invite:'+actor.principal,10);
 const x=await input(r,inviteSchema),w=await actorWorkspace(actor);
 if(!w.profiles.some((p:{id:string})=>p.id===x.profile))throw new ApiError(400,'Zgjidhni një profil të ruajtur.');
 const token=[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join(''),expires=Date.now()+7*86400000;
 await db().batch([
  db().prepare('UPDATE invitations SET revoked=1 WHERE owner=? AND profile=?').bind(actor.owner,x.profile),
  db().prepare('INSERT INTO invitations(hash,owner,profile,expires) VALUES(?,?,?,?)').bind(await hash(token),actor.owner,x.profile,expires),
 ]);
 return json({token,expires});
});}
export async function DELETE(r:Request){return route(async()=>{requireOrigin(r);const actor=await authorize(r,'invite:revoke');const x=await input(r,inviteSchema);await db().prepare('UPDATE invitations SET revoked=1 WHERE owner=? AND profile=?').bind(actor.owner,x.profile).run();return json({revoked:true});});}
