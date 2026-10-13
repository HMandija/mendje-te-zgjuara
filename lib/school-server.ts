import {env} from 'cloudflare:workers';
import type {Config} from './learning-types';
export const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(status===429?{'Retry-After':'60'}:{})}});
export function db(){if(!env.DB)throw Error('DB unavailable');return env.DB;}
export function sameOrigin(r:Request){return r.headers.get('origin')===new URL(r.url).origin;}
export async function body(r:Request){
 if(Number(r.headers.get('content-length')||0)>500000)throw new SyntaxError('Body too large');
 const reader=r.body?.getReader();if(!reader)throw new SyntaxError('Missing body');
 let size=0;const chunks:Uint8Array[]=[];
 while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>500000){await reader.cancel();throw new SyntaxError('Body too large');}chunks.push(chunk.value);}
 const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength;}
 return JSON.parse(new TextDecoder().decode(buffer));
}
export async function workspace(user:string):Promise<Config & {revision:number}>{const row=await db().prepare('SELECT payload,revision FROM workspaces WHERE owner=?').bind(user).first<{payload:string,revision:number}>();return row?{...JSON.parse(row.payload),revision:row.revision}:{profiles:[],custom:[],revision:0};}
export async function sessionRows(user:string,profile?:string){const stmt=profile===undefined?db().prepare('SELECT id,profile,payload,created FROM sessions WHERE owner=? ORDER BY created DESC LIMIT 200').bind(user):db().prepare('SELECT id,profile,payload,created FROM sessions WHERE owner=? AND profile=? ORDER BY created DESC LIMIT 200').bind(user,profile);const rows=await stmt.all<{id:string,profile:string,payload:string,created:string}>();return rows.results.map(r=>({...JSON.parse(r.payload),id:r.id,profile:r.profile,date:r.created})).reverse();}
export async function hash(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function student(r:Request){
 const raw=r.headers.get('authorization')||'';if(!/^Bearer [a-f0-9]{64}$/.test(raw))return null;const token=raw.slice(7);
 const now=Date.now(),tokenHash=await hash(token);
 const picture=await db().prepare("SELECT c.owner,s.profile,s.expires,c.id AS classroom FROM picture_sessions s JOIN classes c ON c.id=s.class JOIN class_students m ON m.class=s.class AND m.profile=s.profile LEFT JOIN classroom_settings settings ON settings.class=c.id JOIN accounts a ON a.user=c.owner WHERE s.hash=? AND s.expires>? AND COALESCE(settings.archived,0)=0 AND a.enabled=1 AND a.role IN ('TEACHER','ADMIN')").bind(tokenHash,now).first<{owner:string;profile:string;expires:number;classroom:string}>();
 if(picture){
  // Extend active student sessions, writing at most once in each five-minute
  // window. A missing request for 30 minutes leaves the token expired.
  if(picture.expires<now+25*60_000)await db().prepare('UPDATE picture_sessions SET expires=? WHERE hash=? AND expires>? AND expires<?').bind(now+30*60_000,tokenHash,now,now+25*60_000).run();
  const w=await workspace(picture.owner),profile=w.profiles.find(p=>p.id===picture.profile);return profile?{...picture,revoked:0,workspace:w,profileData:profile}:null;
 }
 const session=await db().prepare("SELECT s.owner,s.profile,s.expires FROM student_sessions s JOIN accounts a ON a.user=s.owner WHERE s.hash=? AND s.expires>? AND a.enabled=1 AND a.role IN ('TEACHER','ADMIN')").bind(tokenHash,now).first<{owner:string;profile:string;expires:number}>();
 if(session){
  if(session.expires<now+25*60_000)await db().prepare('UPDATE student_sessions SET expires=? WHERE hash=? AND expires>? AND expires<?').bind(now+30*60_000,tokenHash,now,now+25*60_000).run();
  const w=await workspace(session.owner),profile=w.profiles.find(p=>p.id===session.profile);return profile?{...session,revoked:0,workspace:w,profileData:profile}:null;
 }
 const invite=await db().prepare('SELECT owner,profile,expires,revoked FROM invitations WHERE hash=?').bind(await hash(token)).first<{owner:string,profile:string,expires:number,revoked:number}>();
 if(!invite||invite.revoked||invite.expires<=Date.now())return null;
 const account=await db().prepare('SELECT role,enabled FROM accounts WHERE user=?').bind(invite.owner).first<{role:string;enabled:number}>();
 if(!account?.enabled||!['TEACHER','ADMIN'].includes(account.role))return null;
 const w=await workspace(invite.owner),profile=w.profiles.find(p=>p.id===invite.profile);
 return profile?{...invite,workspace:w,profileData:profile}:null;
}
