import {env} from 'cloudflare:workers';
import {ApiError} from './school-access';
import {db,hash} from './school-server';
export const EMAIL_COOKIE='mendje_teacher';
function config(){const e=env as unknown as Record<string,string>;const url=e.SUPABASE_URL,key=e.SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new ApiError(503,'Hyrja me email po përgatitet. Administratori duhet të aktivizojë Supabase.');if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw new ApiError(503,'Konfigurimi i hyrjes kërkon kontroll.');return {url,key};}
export function emailReady(){const e=env as unknown as Record<string,string>;return !!(e.SUPABASE_URL&&e.SUPABASE_PUBLISHABLE_KEY);}
export async function authCall(path:string,method:string,data?:unknown,token?:string){const {url,key}=config();const r=await fetch(url+'/auth/v1/'+path,{method,headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(12000)});const result=r.status===204?{}:await r.json() as Record<string,unknown>;if(!r.ok)throw new ApiError(r.status===429?429:r.status>=500?503:401,'Hyrja nuk u krye. Kontrollo email-in, fjalëkalimin dhe konfirmimin e email-it.');return result;}
export function authCookieToken(r:Request,name=EMAIL_COOKIE){const cookie=r.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));if(!cookie)return null;const token=cookie.slice(name.length+1);return /^[A-Za-z0-9_.-]{20,8000}$/.test(token)?token:null;}
export async function emailIdentity(r:Request){
 const token=authCookieToken(r);if(!token)return null;
 const h=await hash(token),row=await db().prepare("SELECT s.user FROM teacher_sessions s JOIN accounts a ON a.user=s.user WHERE s.hash=? AND s.expires>? AND a.enabled=1 AND a.role='TEACHER'").bind(h,Date.now()).first<{user:string}>();
 if(!row)throw new ApiError(401,'Sesioni përfundoi. Hyr sërish në llogari.');
 try{const u=await authCall('user','GET',undefined,token);if(typeof u.id!=='string'||!u.email_confirmed_at||row.user!=='supabase:'+u.id)throw new ApiError(401,'Hyr sërish në llogari.');return {id:row.user};}
 catch(error){if(error instanceof ApiError&&error.status===401)await db().prepare('DELETE FROM teacher_sessions WHERE hash=?').bind(h).run();throw error;}
}
export async function createEmailSession(r:Request,result:Record<string,unknown>){
 const user=result.user as {id?:string;email_confirmed_at?:string}|undefined,token=result.access_token;
 if(!user?.id||!user.email_confirmed_at||typeof token!=='string'||!/^[A-Za-z0-9_.-]{20,8000}$/.test(token))throw new ApiError(401,'Konfirmo email-in para hyrjes.');
 const owner='supabase:'+user.id;
 await db().prepare("INSERT OR IGNORE INTO accounts(user,role) VALUES(?,'TEACHER')").bind(owner).run();
 const seconds=Math.min(3600,Math.max(1,Number(result.expires_in)||3600));
 const previous=authCookieToken(r);
 if(previous)await db().prepare('DELETE FROM teacher_sessions WHERE hash=?').bind(await hash(previous)).run();
 const saved=await db().prepare("INSERT INTO teacher_sessions(hash,user,expires) SELECT ?,user,? FROM accounts WHERE user=? AND enabled=1 AND role='TEACHER' RETURNING user").bind(await hash(token),Date.now()+seconds*1000,owner).first();
 if(!saved)throw new ApiError(403,'Llogaria nuk është aktive.');
 await db().prepare('DELETE FROM teacher_sessions WHERE hash IN (SELECT hash FROM teacher_sessions WHERE expires<=? LIMIT 100)').bind(Date.now()).run();
 return sessionCookie(r,token,seconds);
}
export async function revokeProviderSession(token:string){
 // Local DB revocation is authoritative even if the provider is temporarily unavailable.
 try{await authCall('logout?scope=local','POST',undefined,token);}catch{/* Never log bearer tokens. */}
}
export async function logoutEmail(r:Request){
 const token=authCookieToken(r);
 if(token){await db().prepare('DELETE FROM teacher_sessions WHERE hash=?').bind(await hash(token)).run();await revokeProviderSession(token);}
 return Response.json({saved:true},{headers:{'Set-Cookie':sessionCookie(r,'',0),'Cache-Control':'no-store'}});
}
export function sessionCookie(r:Request,token:string,seconds:number){return EMAIL_COOKIE+'='+token+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+Math.min(3600,Math.max(0,seconds))+(new URL(r.url).protocol==='https:'?'; Secure':'');}
