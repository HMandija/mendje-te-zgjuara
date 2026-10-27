import {recordAccess} from "../../../lib/admin-server";
import {z} from 'zod';
import {route,input} from '../../../lib/api-route';
import {limit,requireOrigin} from '../../../lib/school-access';
import {authCall,emailReady,createEmailSession,logoutEmail} from '../../../lib/email-auth';
// Use the already-configured Supabase callback, then hand the recovery fragment
// to the dedicated reset page. This also avoids inheriting localhost origins.
const TEACHER_RECOVERY_CALLBACK_URL='https://mendje-te-zgjuara.edu-al.workers.dev/teacher/login';
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('signup'),email:z.string().email().max(254),password:z.string().min(12).max(128)}).strict(),
 z.object({action:z.literal('login'),email:z.string().email().max(254),password:z.string().min(12).max(128)}).strict(),
 z.object({action:z.literal('request-reset'),email:z.string().email().max(254)}).strict(),
 z.object({action:z.literal('reset-password'),accessToken:z.string().regex(/^[A-Za-z0-9_.-]{20,8000}$/),password:z.string().min(12).max(128)}).strict(),
]);
export async function GET(){return Response.json({ready:emailReady()},{headers:{'Cache-Control':'no-store'}});}
export async function POST(r:Request){return route(async()=>{requireOrigin(r);const x=await input(r,schema),ip=r.headers.get('cf-connecting-ip')||'local';
 if(x.action==='request-reset'){await limit('email-reset:'+ip,3,600000);await authCall('recover?redirect_to='+encodeURIComponent(TEACHER_RECOVERY_CALLBACK_URL),'POST',{email:x.email});return Response.json({message:'Nëse ekziston një llogari me këtë adresë, do të marrësh një email me lidhjen për ndryshimin e fjalëkalimit.'},{headers:{'Cache-Control':'no-store'}});}
 if(x.action==='reset-password'){await limit('email-reset-confirm:'+ip,5,600000);await authCall('user','GET',undefined,x.accessToken);await authCall('user','PUT',{password:x.password},x.accessToken);return Response.json({saved:true,message:'Fjalëkalimi u ndryshua. Tani mund të hysh me fjalëkalimin e ri.'},{headers:{'Cache-Control':'no-store'}});}
 await limit('email-auth:'+ip,10,600000);if(x.action==='signup'){await authCall('signup?redirect_to='+encodeURIComponent(new URL('/teacher/login',r.url).href),'POST',{email:x.email,password:x.password});return Response.json({message:'Kontrollo email-in për konfirmim. Pastaj hyr me email dhe fjalëkalim.'},{headers:{'Cache-Control':'no-store'}});}const result=await authCall('token?grant_type=password','POST',{email:x.email,password:x.password});const cookie=await createEmailSession(r,result);await recordAccess(r,'supabase:'+String((result.user as {id:string}).id),'TEACHER',(result.user as {email?:string}).email);return Response.json({saved:true},{headers:{'Set-Cookie':cookie,'Cache-Control':'no-store'}});});}
export async function DELETE(r:Request){return route(async()=>{requireOrigin(r);return logoutEmail(r);});}
