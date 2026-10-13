import {env} from 'cloudflare:workers';
import {ApiError} from './school-access';
import {db,hash} from './school-server';
import {IDLE_SESSION_MS} from './session-policy';
export const EMAIL_COOKIE='mendje_teacher';
function config(){const e=env as unknown as Record<string,string>;const url=e.SUPABASE_URL,key=e.SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new ApiError(503,'Hyrja me email po përgatitet. Administratori duhet të aktivizojë Supabase.');if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw new ApiError(503,'Konfigurimi i hyrjes kërkon kontroll.');return {url,key};}
export function emailReady(){const e=env as unknown as Record<string,string>;return !!(e.SUPABASE_URL&&e.SUPABASE_PUBLISHABLE_KEY);}
function providerError(status:number,result:Record<string,unknown>){
 const code=typeof result.error_code==='string'?result.error_code:typeof result.code==='string'?result.code:'';
 const known:Record<string,[number,string]>={
  email_address_not_authorized:[503,'Email-i i konfirmimit nuk mund të dërgohet. Administratori duhet të konfigurojë shërbimin e email-it për regjistrime të reja.'],
  over_email_send_rate_limit:[429,'Është arritur kufiri i dërgimit të email-eve. Prit pak përpara se të provosh përsëri.'],
  over_request_rate_limit:[429,'Janë bërë shumë kërkesa. Prit pak dhe provo përsëri.'],
  email_not_confirmed:[401,'Email-i nuk është konfirmuar ende. Kontrollo email-in dhe dosjen Spam. Nëse nuk ka mbërritur, kontakto administratorin.'],
  invalid_credentials:[401,'Email-i ose fjalëkalimi nuk është i saktë. Nëse nuk ke llogari, zgjidh “Krijo një llogari”.'],
  signup_disabled:[503,'Krijimi i llogarive të reja është përkohësisht i çaktivizuar.'],
  email_provider_disabled:[503,'Regjistrimi me email është përkohësisht i çaktivizuar.'],
  weak_password:[400,'Zgjidh një fjalëkalim më të fortë me të paktën 12 karaktere, shkronja, numra dhe simbole.'],
  email_address_invalid:[400,'Kontrollo adresën e email-it dhe përdor një adresë të vlefshme.'],
 };
 if(Object.hasOwn(known,code)){const [http,message]=known[code];return new ApiError(http,message,undefined,code);}
 // Inspect provider text only to classify delivery errors. Never send it to the
 // browser or logs: it can contain addresses, SMTP credentials or other details.
 const message=typeof result.msg==='string'?result.msg:typeof result.message==='string'?result.message:'';
 if(status>=500&&/error sending (confirmation|recovery|magic link|otp) email/i.test(message))return new ApiError(503,'Shërbimi i email-it nuk arriti të dërgojë mesazhin. Administratori duhet të kontrollojë konfigurimin e dërgimit.',undefined,'email_delivery_failed');
 return new ApiError(status===429?429:status>=500?503:401,status===429?'Janë bërë shumë kërkesa. Prit pak dhe provo përsëri.':status>=500?'Shërbimi i hyrjes është përkohësisht i padisponueshëm. Provo përsëri.':'Kërkesa e hyrjes nuk u pranua. Kontrollo të dhënat dhe provo përsëri.');
}
export async function authCall(path:string,method:string,data?:unknown,token?:string){
 const {url,key}=config();let r:Response;
 try{r=await fetch(url+'/auth/v1/'+path,{method,headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(12000)});}
 catch{throw new ApiError(503,'Shërbimi i hyrjes nuk u përgjigj. Provo përsëri pas pak.');}
 let result:Record<string,unknown>;
 try{const payload=r.status===204?{}:await r.json();if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Invalid provider response');result=payload as Record<string,unknown>;}
 catch{throw new ApiError(503,'Shërbimi i hyrjes dha një përgjigje të papritur. Provo përsëri pas pak.');}
 if(!r.ok)throw providerError(r.status,result);
 return result;
}
export function authCookieToken(r:Request,name=EMAIL_COOKIE){const cookie=r.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));if(!cookie)return null;const token=cookie.slice(name.length+1);return /^[A-Za-z0-9_.-]{20,8000}$/.test(token)?token:null;}
export async function emailSessionPresent(r:Request){const token=authCookieToken(r);if(!token)return false;const row=await db().prepare("SELECT 1 AS active FROM teacher_sessions s JOIN accounts a ON a.user=s.user WHERE s.hash=? AND s.expires>? AND a.enabled=1 AND a.role='TEACHER'").bind(await hash(token),Date.now()).first();return !!row;}
export async function emailIdentity(r:Request){
 const token=authCookieToken(r);if(!token)return null;
 const now=Date.now(),h=await hash(token),row=await db().prepare("SELECT s.user FROM teacher_sessions s JOIN accounts a ON a.user=s.user WHERE s.hash=? AND s.expires>? AND a.enabled=1 AND a.role='TEACHER'").bind(h,now).first<{user:string}>();
 if(!row)throw new ApiError(401,'Sesioni përfundoi. Hyr sërish në llogari.');
 // `expires` is a sliding 30-minute idle deadline. Touch it at most every
 // five minutes to keep active sessions alive without writing on every API call.
 await db().prepare('UPDATE teacher_sessions SET expires=? WHERE hash=? AND expires>? AND expires<?').bind(now+IDLE_SESSION_MS,h,now,now+IDLE_SESSION_MS-5*60_000).run();
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
 const saved=await db().prepare("INSERT INTO teacher_sessions(hash,user,expires) SELECT ?,user,? FROM accounts WHERE user=? AND enabled=1 AND role='TEACHER' RETURNING user").bind(await hash(token),Date.now()+Math.min(seconds*1000,IDLE_SESSION_MS),owner).first();
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
