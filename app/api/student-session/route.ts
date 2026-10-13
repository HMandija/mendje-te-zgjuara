import {z} from 'zod';
import {input,route} from '../../../lib/api-route';
import {ApiError,limit,requireOrigin} from '../../../lib/school-access';
import {db,hash,json,workspace} from '../../../lib/school-server';
import {IDLE_SESSION_MS} from '../../../lib/session-policy';

const schema=z.object({token:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export async function POST(request:Request){return route(async()=>{
  requireOrigin(request);
  await limit('student-session:'+ (request.headers.get('cf-connecting-ip')||'private-site'),20,60_000);
  const {token}=await input(request,schema);
  const invite=await db().prepare('SELECT owner,profile FROM invitations WHERE hash=? AND revoked=0 AND expires>?').bind(await hash(token),Date.now()).first<{owner:string;profile:string}>();
  if(!invite)throw new ApiError(401,'Kjo lidhje hyrjeje ka skaduar. Kërko një lidhje të re nga mësuesi.');
  const account=await db().prepare("SELECT 1 AS enabled FROM accounts WHERE user=? AND enabled=1 AND role IN ('TEACHER','ADMIN')").bind(invite.owner).first();
  const data=await workspace(invite.owner);
  if(!account||!data.profiles.some(profile=>profile.id===invite.profile))throw new ApiError(401,'Profili nuk është më aktiv. Kërko ndihmën e mësuesit.');
  const session=[...crypto.getRandomValues(new Uint8Array(32))].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  await db().prepare('INSERT INTO student_sessions(hash,owner,profile,expires) VALUES(?,?,?,?)').bind(await hash(session),invite.owner,invite.profile,Date.now()+IDLE_SESSION_MS).run();
  return json({token:session});
});}
