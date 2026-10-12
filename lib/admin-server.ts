import {env} from 'cloudflare:workers';
import {db,hash,json} from './school-server';
import {ApiError,limit} from './school-access';
import {authCall,authCookieToken,revokeProviderSession} from './email-auth';
const SESSION='mendje_admin',CHALLENGE='mendje_admin_challenge',PROVIDER='mendje_admin_provider';
export function adminEmail(){const email=(env as unknown as Record<string,string>).ADMIN_EMAIL?.trim().toLowerCase();if(!email)throw new ApiError(503,'Hyrja e administratorit nuk është aktivizuar.');return email;}
function cookie(r:Request,name:string){const value=r.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);return value&&/^[a-f0-9]{64}$/.test(value)?value:null;}
function random(){return [...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('');}
function setCookie(r:Request,name:string,value:string,seconds:number){return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${new URL(r.url).protocol==='https:'?'; Secure':''}`;}
type User={id?:string;email?:string;email_confirmed_at?:string};
function checkedUser(value:unknown){const u=value as User;if(!u?.id||!u.email_confirmed_at||u.email?.toLowerCase()!==adminEmail())throw new ApiError(401,'Hyrja e administratorit nuk u krye.');return u.id;}
export async function recordAccess(r:Request,principal:string,kind:string){
 await db().prepare('INSERT INTO access_events(id,principal,kind,created,ip,country) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),principal,kind,Date.now(),r.headers.get('cf-connecting-ip')?.slice(0,45)||'E panjohur',r.headers.get('x-mendje-country')?.slice(0,2)||'XX').run();
 await db().prepare('DELETE FROM access_events WHERE id IN (SELECT id FROM access_events WHERE created<? LIMIT 100)').bind(Date.now()-30*86400000).run();
}
async function activeAdminAccount(user:string){
 const account=await db().prepare("SELECT enabled,role FROM accounts WHERE user=?").bind('supabase:'+user).first<{enabled:number;role:string}>();
 if(!account?.enabled||!['TEACHER','ADMIN'].includes(account.role))throw new ApiError(401,'Llogaria nuk është aktive.');
}
export async function adminIdentity(r:Request){
 const token=cookie(r,SESSION);if(!token)throw new ApiError(401,'Hyr si administrator dhe konfirmo kodin në email.');
 const h=await hash(token),row=await db().prepare('SELECT user,email,provider_hash FROM admin_sessions WHERE hash=? AND expires>?').bind(h,Date.now()).first<{user:string;email:string;provider_hash:string}>();
 if(!row)throw new ApiError(401,'Sesioni përfundoi. Hyr sërish me kod të ri.');
 try{
  const provider=authCookieToken(r,PROVIDER);
  if(row.email!==adminEmail()||!provider||await hash(provider)!==row.provider_hash)throw new ApiError(401,'Hyr sërish me kod të ri.');
  await activeAdminAccount(row.user);
  const user=await authCall('user','GET',undefined,provider);
  if(checkedUser(user)!==row.user)throw new ApiError(401,'Llogaria e hyrjes ka ndryshuar.');
  return row.user;
 }catch(error){if(error instanceof ApiError&&error.status===401)await db().prepare('DELETE FROM admin_sessions WHERE hash=?').bind(h).run();throw error;}
}
export async function startAdmin(r:Request,email:string,password:string){
 await limit('admin-login:'+(r.headers.get('cf-connecting-ip')||'local'),5,600000);
 if(email.trim().toLowerCase()!==adminEmail())throw new ApiError(401,'Hyrja e administratorit nuk u krye.');
 const auth=await authCall('token?grant_type=password','POST',{email:adminEmail(),password});const user=checkedUser(auth.user);
 await db().prepare("INSERT OR IGNORE INTO accounts(user,role) VALUES(?,'TEACHER')").bind('supabase:'+user).run();await activeAdminAccount(user);
 const previous=cookie(r,CHALLENGE);if(previous)await db().prepare('DELETE FROM admin_challenges WHERE hash=?').bind(await hash(previous)).run();
 // A password-only Supabase token never grants access to an admin endpoint.
 await authCall('otp','POST',{email:adminEmail(),create_user:false});
 const token=random();await db().prepare('INSERT INTO admin_challenges(hash,user,expires,email) VALUES(?,?,?,?)').bind(await hash(token),user,Date.now()+600000,adminEmail()).run();
 await db().batch([db().prepare('DELETE FROM admin_challenges WHERE expires<?').bind(Date.now()),db().prepare('DELETE FROM admin_sessions WHERE expires<?').bind(Date.now())]);
 return Response.json({challenge:true},{headers:{'Cache-Control':'no-store','Set-Cookie':setCookie(r,CHALLENGE,token,600)}});
}
export async function verifyAdmin(r:Request,code:string){
 await limit('admin-verify:'+(r.headers.get('cf-connecting-ip')||'local'),15,600000);
 const token=cookie(r,CHALLENGE);if(!token)throw new ApiError(401,'Fillo përsëri hyrjen me email dhe fjalëkalim.');
 const h=await hash(token);const row=await db().prepare('UPDATE admin_challenges SET attempts=attempts+1 WHERE hash=? AND expires>? AND attempts<5 AND email=? RETURNING user').bind(h,Date.now(),adminEmail()).first<{user:string}>();if(!row)throw new ApiError(401,'Kodi skadoi ose u arrit kufiri i provave. Fillo hyrjen përsëri.');
 await activeAdminAccount(row.user);
 const verified=await authCall('verify','POST',{email:adminEmail(),token:code,type:'email'});if(checkedUser(verified.user)!==row.user)throw new ApiError(401,'Kodi nuk përputhet me hyrjen.');
 const provider=verified.access_token;if(typeof provider!=='string'||!/^[A-Za-z0-9_.-]{20,8000}$/.test(provider))throw new ApiError(401,'Konfirmimi i llogarisë nuk u krye.');
 const consumed=await db().prepare('DELETE FROM admin_challenges WHERE hash=? AND expires>? RETURNING user').bind(h,Date.now()).first();if(!consumed)throw new ApiError(401,'Kodi është përdorur.');
 const previous=cookie(r,SESSION);if(previous)await db().prepare('DELETE FROM admin_sessions WHERE hash=?').bind(await hash(previous)).run();
 const seconds=Math.min(1800,Math.max(1,Number(verified.expires_in)||1800));
 const session=random();const saved=await db().prepare("INSERT INTO admin_sessions(hash,user,expires,email,provider_hash) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM accounts WHERE user=? AND enabled=1 AND role IN ('TEACHER','ADMIN')) RETURNING user").bind(await hash(session),row.user,Date.now()+seconds*1000,adminEmail(),await hash(provider),'supabase:'+row.user).first();if(!saved)throw new ApiError(401,'Llogaria nuk është aktive.');await recordAccess(r,'supabase:'+row.user,'ADMIN');
 const headers=new Headers({'Cache-Control':'no-store'});headers.append('Set-Cookie',setCookie(r,SESSION,session,seconds));headers.append('Set-Cookie',setCookie(r,PROVIDER,provider,seconds));headers.append('Set-Cookie',setCookie(r,CHALLENGE,'',0));return Response.json({authenticated:true},{headers});
}
export async function logoutAdmin(r:Request){for(const name of [SESSION,CHALLENGE]){const token=cookie(r,name);if(token)await db().prepare(`DELETE FROM ${name===SESSION?'admin_sessions':'admin_challenges'} WHERE hash=?`).bind(await hash(token)).run();}const provider=authCookieToken(r,PROVIDER);if(provider)await revokeProviderSession(provider);const headers=new Headers({'Cache-Control':'no-store'});for(const name of [SESSION,CHALLENGE,PROVIDER])headers.append('Set-Cookie',setCookie(r,name,'',0));return Response.json({loggedOut:true},{headers});}
export async function adminUsers(page:number){
 const e=env as unknown as Record<string,string>;if(!e.SUPABASE_SECRET_KEY)throw new ApiError(503,'Lista e llogarive kërkon secret-in SUPABASE_SECRET_KEY në server.');
 const response=await fetch(e.SUPABASE_URL+`/auth/v1/admin/users?page=${page}&per_page=50`,{headers:{apikey:e.SUPABASE_SECRET_KEY,Authorization:'Bearer '+e.SUPABASE_SECRET_KEY},signal:AbortSignal.timeout(12000)});if(!response.ok)throw new ApiError(503,'Lista e përdoruesve nuk u lexua. Kontrollo konfigurimin Supabase.');
 const result=await response.json() as {users?:Array<{id:string;email?:string;created_at?:string;last_sign_in_at?:string;email_confirmed_at?:string}>};
 return json({page,users:(result.users||[]).map(u=>({id:u.id,email:u.email||'',created:u.created_at,lastLogin:u.last_sign_in_at,confirmed:!!u.email_confirmed_at}))});
}
