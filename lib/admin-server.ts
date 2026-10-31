import {env} from 'cloudflare:workers';
import {db,hash,json} from './school-server';
import {ApiError,limit} from './school-access';
import {authCall,authCookieToken,revokeProviderSession} from './email-auth';
const SESSION='mendje_admin',CHALLENGE='mendje_admin_challenge',PROVIDER='mendje_admin_provider';
export function adminEmails(){const list=[...new Set(((env as unknown as Record<string,string>).ADMIN_EMAIL??'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean))];if(!list.length)throw new ApiError(503,'Hyrja e administratorit nuk është aktivizuar.');return list;}
export function isAdminEmail(email?:string){const value=email?.trim().toLowerCase();return !!value&&adminEmails().includes(value);}
export function adminEmail(){return adminEmails()[0];}
function cookie(r:Request,name:string){const value=r.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);return value&&/^[a-f0-9]{64}$/.test(value)?value:null;}
function random(){return [...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('');}
function setCookie(r:Request,name:string,value:string,seconds:number){return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${new URL(r.url).protocol==='https:'?'; Secure':''}`;}
type User={id?:string;email?:string;email_confirmed_at?:string};
function checkedUser(value:unknown,expected?:string){const u=value as User,email=u?.email?.toLowerCase();if(!u?.id||!u.email_confirmed_at||!email||!isAdminEmail(email)||(expected!==undefined&&email!==expected))throw new ApiError(401,'Hyrja e administratorit nuk u krye.');return u.id;}
export async function recordAccess(r:Request,principal:string,kind:string,email?:string){
 if(email)await rememberAccountEmail(principal,email);
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
  if(!isAdminEmail(row.email)||!provider||await hash(provider)!==row.provider_hash)throw new ApiError(401,'Hyr sërish me kod të ri.');
  await activeAdminAccount(row.user);
  const user=await authCall('user','GET',undefined,provider);
  if(checkedUser(user,row.email)!==row.user)throw new ApiError(401,'Llogaria e hyrjes ka ndryshuar.');
  return row.user;
 }catch(error){if(error instanceof ApiError&&error.status===401)await db().prepare('DELETE FROM admin_sessions WHERE hash=?').bind(h).run();throw error;}
}
export async function startAdmin(r:Request,email:string,password:string){
 await limit('admin-login:'+(r.headers.get('cf-connecting-ip')||'local'),5,600000);
 const entered=email.trim().toLowerCase();if(!isAdminEmail(entered))throw new ApiError(401,'Hyrja e administratorit nuk u krye.');
 const auth=await authCall('token?grant_type=password','POST',{email:entered,password});const user=checkedUser(auth.user,entered);
 await db().prepare("INSERT OR IGNORE INTO accounts(user,role) VALUES(?,'TEACHER')").bind('supabase:'+user).run();await activeAdminAccount(user);
 const previous=cookie(r,CHALLENGE);if(previous)await db().prepare('DELETE FROM admin_challenges WHERE hash=?').bind(await hash(previous)).run();
 // A password-only Supabase token never grants access to an admin endpoint.
 await authCall('otp','POST',{email:entered,create_user:false});
 const token=random();await db().prepare('INSERT INTO admin_challenges(hash,user,expires,email) VALUES(?,?,?,?)').bind(await hash(token),user,Date.now()+600000,entered).run();
 await db().batch([db().prepare('DELETE FROM admin_challenges WHERE expires<?').bind(Date.now()),db().prepare('DELETE FROM admin_sessions WHERE expires<?').bind(Date.now())]);
 return Response.json({challenge:true},{headers:{'Cache-Control':'no-store','Set-Cookie':setCookie(r,CHALLENGE,token,600)}});
}
export async function verifyAdmin(r:Request,code:string){
 await limit('admin-verify:'+(r.headers.get('cf-connecting-ip')||'local'),15,600000);
 const token=cookie(r,CHALLENGE);if(!token)throw new ApiError(401,'Fillo përsëri hyrjen me email dhe fjalëkalim.');
 const h=await hash(token);const row=await db().prepare('UPDATE admin_challenges SET attempts=attempts+1 WHERE hash=? AND expires>? AND attempts<5 RETURNING user,email').bind(h,Date.now()).first<{user:string;email:string}>();if(!row||!isAdminEmail(row.email))throw new ApiError(401,'Kodi skadoi ose u arrit kufiri i provave. Fillo hyrjen përsëri.');
 await activeAdminAccount(row.user);
 const verified=await authCall('verify','POST',{email:row.email,token:code,type:'email'});if(checkedUser(verified.user,row.email)!==row.user)throw new ApiError(401,'Kodi nuk përputhet me hyrjen.');
 const provider=verified.access_token;if(typeof provider!=='string'||!/^[A-Za-z0-9_.-]{20,8000}$/.test(provider))throw new ApiError(401,'Konfirmimi i llogarisë nuk u krye.');
 const consumed=await db().prepare('DELETE FROM admin_challenges WHERE hash=? AND expires>? RETURNING user').bind(h,Date.now()).first();if(!consumed)throw new ApiError(401,'Kodi është përdorur.');
 const previous=cookie(r,SESSION);if(previous)await db().prepare('DELETE FROM admin_sessions WHERE hash=?').bind(await hash(previous)).run();
 const seconds=Math.min(1800,Math.max(1,Number(verified.expires_in)||1800));
 const session=random();const saved=await db().prepare("INSERT INTO admin_sessions(hash,user,expires,email,provider_hash) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM accounts WHERE user=? AND enabled=1 AND role IN ('TEACHER','ADMIN')) RETURNING user").bind(await hash(session),row.user,Date.now()+seconds*1000,row.email,await hash(provider),'supabase:'+row.user).first();if(!saved)throw new ApiError(401,'Llogaria nuk është aktive.');await recordAccess(r,'supabase:'+row.user,'ADMIN',row.email);
 const headers=new Headers({'Cache-Control':'no-store'});headers.append('Set-Cookie',setCookie(r,SESSION,session,seconds));headers.append('Set-Cookie',setCookie(r,PROVIDER,provider,seconds));headers.append('Set-Cookie',setCookie(r,CHALLENGE,'',0));return Response.json({authenticated:true},{headers});
}
export async function logoutAdmin(r:Request){for(const name of [SESSION,CHALLENGE]){const token=cookie(r,name);if(token)await db().prepare(`DELETE FROM ${name===SESSION?'admin_sessions':'admin_challenges'} WHERE hash=?`).bind(await hash(token)).run();}const provider=authCookieToken(r,PROVIDER);if(provider)await revokeProviderSession(provider);const headers=new Headers({'Cache-Control':'no-store'});for(const name of [SESSION,CHALLENGE,PROVIDER])headers.append('Set-Cookie',setCookie(r,name,'',0));return Response.json({loggedOut:true},{headers});}

type ProviderUser={id:string;email?:string;created_at?:string;last_sign_in_at?:string;email_confirmed_at?:string;banned_until?:string};
function adminConfig(){
 const e=env as unknown as Record<string,string>,key=e.SUPABASE_SECRET_KEY?.trim();
 if(!key)throw new ApiError(503,'Administrimi i llogarive kërkon SUPABASE_SECRET_KEY me Type = Secret në Cloudflare. Ruajeni me Deploy.');
 if(!key.startsWith('sb_secret_')&&!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key))throw new ApiError(503,'Vlera e SUPABASE_SECRET_KEY nuk ka formatin e një çelësi Secret të Supabase. Kopjo çelësin nga Settings → API Keys të këtij projekti.');
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(e.SUPABASE_URL||''))throw new ApiError(503,'Konfigurimi i Supabase kërkon kontroll.');
 return {url:e.SUPABASE_URL,key};
}
async function providerAdmin(path:string,method='GET',body?:unknown,timeoutMs=12000):Promise<Record<string,unknown>>{
 const {url,key}=adminConfig();let response:Response;
 // Modern secret keys are opaque API keys, not JWTs. Only legacy service_role
 // JWTs also belong in Authorization; the gateway handles modern apikey auth.
 const headers={apikey:key,'Content-Type':'application/json',...(!key.startsWith('sb_secret_')?{Authorization:'Bearer '+key}:{})};
 try{response=await fetch(url+'/auth/v1/admin/'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(timeoutMs)});}
 catch{throw new ApiError(503,'Supabase nuk u përgjigj. Provo përsëri pas pak.');}
 let payload:Record<string,unknown>;
 try{const result=await response.json();if(!result||typeof result!=='object'||Array.isArray(result))throw Error();payload=result as Record<string,unknown>;}
 catch{throw new ApiError(503,'Supabase dha një përgjigje të papritur.');}
 if(!response.ok){
  const code=payload.code||payload.error_code;
  if(response.status===404)throw new ApiError(404,'Llogaria nuk u gjet.');
  if(code==='email_exists'||code==='user_already_exists'||response.status===409)throw new ApiError(409,'Ky email ka tashmë një llogari.');
  if(code==='weak_password')throw new ApiError(400,'Zgjidh një fjalëkalim më të fortë me të paktën 12 karaktere.');
  if(response.status===429)throw new ApiError(429,'Shumë kërkesa. Prit pak dhe provo përsëri.');
  if(response.status===401||response.status===403)throw new ApiError(503,'Supabase refuzoi çelësin e administrimit. Kontrollo që SUPABASE_SECRET_KEY është çelësi Secret i këtij projekti, jo çelësi Publishable.',undefined,'supabase_admin_key_rejected');
  // Never echo provider details: they may contain credentials or personal data.
  throw new ApiError(503,'Administrimi në Supabase është përkohësisht i padisponueshëm. Provo përsëri pas pak.');
 }
 return payload;
}
function providerUser(value:unknown):ProviderUser{
 const u=value as ProviderUser;
 if(!u||typeof u.id!=='string'||u.id.length>100||u.email!==undefined&&typeof u.email!=='string')throw new ApiError(503,'Të dhënat e llogarisë nuk u lexuan.');
 return u;
}
function projectUser(u:ProviderUser,enabled=true,actor?:string){
 return {id:u.id,email:u.email||'',created:u.created_at,lastLogin:u.last_sign_in_at,confirmed:!!u.email_confirmed_at,
  blocked:!enabled||!!u.banned_until&&Date.parse(u.banned_until)>Date.now(),protected:u.id===actor||isAdminEmail(u.email)};
}
export async function rememberAccountEmail(user:string,email:string){
 if(!user.startsWith('supabase:')||email.length>254||!email.includes('@'))return;
 await db().prepare('INSERT INTO account_contacts(user,email,updated) VALUES(?,?,?) ON CONFLICT(user) DO UPDATE SET email=excluded.email,updated=excluded.updated').bind(user,email.toLowerCase(),Date.now()).run();
}
export async function adminAccountEmails(owners:string[]):Promise<Map<string,string>>{
 const unique=[...new Set(owners.filter(Boolean))].slice(0,50),emails=new Map<string,string>();if(!unique.length)return emails;
 const rows=await db().prepare(`SELECT user,email FROM account_contacts WHERE user IN (${unique.map(()=>'?').join(',')})`).bind(...unique).all<{user:string;email:string}>();
 for(const row of rows.results)emails.set(row.user,row.email);
 const missing=unique.filter(user=>!emails.has(user)&&/^supabase:[0-9a-f-]{36}$/i.test(user));
 if(!(env as unknown as Record<string,string>).SUPABASE_SECRET_KEY)return emails;
 // Resolve only unique identities on this page, at most four requests at a time.
 const deadline=Date.now()+8000;
 for(let i=0;i<missing.length&&Date.now()<deadline;i+=4)await Promise.all(missing.slice(i,i+4).map(async owner=>{
  try{const u=providerUser(await providerAdmin('users/'+owner.slice(9),'GET',undefined,Math.max(1,deadline-Date.now())));if(owner!=='supabase:'+u.id||!u.email)return;await rememberAccountEmail(owner,u.email);emails.set(owner,u.email.toLowerCase());}
  catch{/* Deleted accounts and provider outages must not hide access history. */}
 }));
 return emails;
}
export async function adminUsers(page:number,actor?:string){
 const result=await providerAdmin(`users?page=${page}&per_page=50`);
 if(!Array.isArray(result.users))throw new ApiError(503,'Lista e përdoruesve nuk u lexua.');
 const users=result.users.slice(0,50).map(providerUser),owners=users.map(u=>'supabase:'+u.id);
 const rows=owners.length?await db().prepare(`SELECT user,enabled FROM accounts WHERE user IN (${owners.map(()=>'?').join(',')})`).bind(...owners).all<{user:string;enabled:number}>():{results:[]};
 const disabled=new Set(rows.results.filter(r=>!r.enabled).map(r=>r.user));
 const contacts=users.filter(u=>u.email).map(u=>db().prepare('INSERT INTO account_contacts(user,email,updated) VALUES(?,?,?) ON CONFLICT(user) DO UPDATE SET email=excluded.email,updated=excluded.updated').bind('supabase:'+u.id,u.email!.toLowerCase(),Date.now()));
 if(contacts.length)await db().batch(contacts);
 return json({page,users:users.map(u=>projectUser(u,!disabled.has('supabase:'+u.id),actor))});
}
export async function changeAdminAccount(actor:string,id:string,action:'block'|'unblock'){
 const u=providerUser(await providerAdmin('users/'+id));if(u.id!==id)throw new ApiError(503,'Llogaria nuk përputhet me kërkesën.');
 if(id===actor||isAdminEmail(u.email))throw new ApiError(400,'Llogaria e administratorit nuk mund të bllokohet nga ky panel.');
 const owner='supabase:'+id;
 if(action==='unblock')await providerAdmin('users/'+id,'PUT',{ban_duration:'none'});
 // D1 is the authoritative indefinite block. The existing trigger revokes all
 // teacher/admin/picture sessions and invitation links, including current tokens.
 await db().batch([
  db().prepare("INSERT INTO accounts(user,role,enabled) VALUES(?,'TEACHER',?) ON CONFLICT(user) DO UPDATE SET enabled=excluded.enabled").bind(owner,action==='block'?0:1),
  db().prepare('INSERT INTO admin_account_actions(id,actor,target,action,created) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),actor,owner,action,Date.now()),
 ]);
 let providerSynced=true;
 if(action==='block')try{await providerAdmin('users/'+id,'PUT',{ban_duration:'876000h'});}catch{providerSynced=false;}
 return json({saved:true,blocked:action==='block',message:action==='block'?(providerSynced?'Llogaria u bllokua pa afat. Sesionet e mëparshme u mbyllën.':'Llogaria është bllokuar në aplikacion dhe sesionet u mbyllën. Sinkronizimi me Supabase dështoi; përsërit bllokimin pas pak.'):'Llogaria u zhbllokua. Përdoruesi duhet të hyjë përsëri.'});
}
export async function createAdminAccount(actor:string,email:string,password:string,redirect:string){
 const u=providerUser(await providerAdmin('users','POST',{email,password,email_confirm:false}));
 if(u.email?.toLowerCase()!==email.toLowerCase())throw new ApiError(503,'Krijimi i llogarisë kërkon kontroll.');
 const owner='supabase:'+u.id;
 await db().batch([
  db().prepare("INSERT OR IGNORE INTO accounts(user,role,enabled) VALUES(?,'TEACHER',1)").bind(owner),
  db().prepare('INSERT INTO account_contacts(user,email,updated) VALUES(?,?,?) ON CONFLICT(user) DO UPDATE SET email=excluded.email,updated=excluded.updated').bind(owner,u.email.toLowerCase(),Date.now()),
  db().prepare('INSERT INTO admin_account_actions(id,actor,target,action,created) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),actor,owner,'create',Date.now()),
 ]);
 let confirmationSent=true;
 try{await authCall('resend?redirect_to='+encodeURIComponent(redirect),'POST',{type:'signup',email:u.email});}catch{confirmationSent=false;}
 return json({saved:true,user:projectUser(u),confirmationSent,message:confirmationSent?'Llogaria u krijua. U dërgua email-i i konfirmimit; përdoruesi konfirmon email-in para hyrjes.':'Llogaria u krijua, por email-i i konfirmimit nuk u dërgua. Mos e krijo përsëri; ridërgo konfirmimin nga Supabase.'},201);
}
