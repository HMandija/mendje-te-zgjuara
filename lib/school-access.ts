import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {db,hash,student,workspace} from './school-server';
import {emailIdentity} from './email-auth';
import {allowed} from './security-policy.mjs';
export type Actor = {role:'STUDENT'|'TEACHER'|'ADMIN';owner:string;principal:string;profile?:string;grade?:number;classroom?:string;workspace?:Awaited<ReturnType<typeof workspace>>};
// Nxënësi e ka workspace-in e lexuar gjatë autentifikimit; mësuesit e lexojnë
// të freskët në vend, sepse autentifikimi i tyre nuk e përfshin.
export async function actorWorkspace(actor:Actor){return actor.workspace??await workspace(actor.owner);}
export class ApiError extends Error {constructor(public status:number,message:string,public retryAfter?:number,public code?:string){super(message);}}
let lastSweep=0;
type RateLimiter={limit(options:{key:string}):Promise<{success:boolean}>};
export async function limit(key:string,max:number,windowMs=60_000){
 const now=Date.now(),bucket=Math.floor(now/windowMs),expires=(bucket+1)*windowMs;
 const row=await db().prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(await hash(key+':'+bucket),expires).first<{count:number}>();
 if(!row || row.count>max)throw new ApiError(429,'Shumë kërkesa. Prit pak dhe provo përsëri.');
 // Bounded cleanup of old counter buckets; no visitor identifiers are stored.
 if(now-lastSweep>=30_000){lastSweep=now;await db().prepare('DELETE FROM rate_limits WHERE key IN (SELECT key FROM rate_limits WHERE expires<? LIMIT 100)').bind(now).run();}
}
// The broad IP guard counted here runs on every request, so it uses the Workers
// binding and skips D1 entirely. Precise per-account limits stay on `limit()`.
export async function authSourceLimit(r:Request){
 const key='auth-source:'+(r.headers.get('cf-connecting-ip')||'private-site'),limiter=(env as unknown as {AUTH_RATE?:RateLimiter}).AUTH_RATE;
 if(!limiter)return limit(key,900);
 const {success}=await limiter.limit({key});
 if(!success)throw new ApiError(429,'Shumë kërkesa. Prit pak dhe provo përsëri.');
}
export async function authorize(r:Request,permission:string):Promise<Actor>{
 await authSourceLimit(r);
 let actor:Actor|null=null;
 if(r.headers.has('authorization')){
  const raw=r.headers.get('authorization')||'';
  await limit('token-auth:'+await hash(raw),60);
  const s=await student(r);
  if(s)actor={role:'STUDENT',owner:s.owner,principal:'invite:'+await hash(raw.slice(7)),profile:s.profile,grade:s.profileData.grade,...('classroom' in s?{classroom:s.classroom}:{}),workspace:s.workspace};
 } else {
  const email=await emailIdentity(r);
  if(email){let account=await db().prepare('SELECT role,enabled FROM accounts WHERE user=?').bind(email.id).first<{role:Actor['role'];enabled:number}>();if(!account){await db().prepare("INSERT OR IGNORE INTO accounts(user,role) VALUES(?,'TEACHER')").bind(email.id).run();account=await db().prepare('SELECT role,enabled FROM accounts WHERE user=?').bind(email.id).first();}if(account?.enabled&&account.role==='TEACHER')actor={role:'TEACHER',owner:email.id,principal:'account:'+email.id};else throw new ApiError(403,'Llogaria nuk është aktive.');}
  const user=email?null:await getChatGPTUser();
  if(user){
   await limit('account-auth:'+user.userId,180);
   let account=await db().prepare('SELECT role,enabled FROM accounts WHERE user=?').bind(user.userId).first<{role:Actor['role'];enabled:number}>();
   if(!account){
    const legacy=await db().prepare('SELECT owner FROM workspaces WHERE owner=?').bind(user.userId).first();
    const admin=env.BOOTSTRAP_ADMIN_EMAIL && user.email.toLowerCase()===env.BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
    // Only the explicitly configured existing owner or a pre-upgrade workspace owner is provisioned.
    if(admin||legacy){await db().prepare('INSERT OR IGNORE INTO accounts(user,role) VALUES(?,?)').bind(user.userId,admin?'ADMIN':'TEACHER').run();account=await db().prepare('SELECT role,enabled FROM accounts WHERE user=?').bind(user.userId).first();}
   }
   if(account?.enabled && account.role!=='STUDENT')actor={role:account.role,owner:user.userId,principal:'account:'+user.userId};
   if(!actor)throw new ApiError(403,'Kjo llogari nuk ka rol të autorizuar në shkollë.');
  }
 }
 if(!actor){await limit('failed-auth:'+(r.headers.get('cf-connecting-ip')||'private-site'),40);throw new ApiError(401,'Hyrja ose lidhja personale kërkohet.');}
 if(!allowed(actor.role,permission))throw new ApiError(403,'Roli yt nuk e lejon këtë veprim.');
 return actor;
}
export function requireOrigin(r:Request){if(r.headers.get('origin')!==new URL(r.url).origin)throw new ApiError(403,'Origjinë e palejuar.');}
