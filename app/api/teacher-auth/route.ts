import {recordAccess} from "../../../lib/admin-server";
import {z} from 'zod';
import {route,input} from '../../../lib/api-route';
import {limit,requireOrigin} from '../../../lib/school-access';
import {authCall,emailReady,createEmailSession,logoutEmail} from '../../../lib/email-auth';
const schema=z.object({action:z.enum(['signup','login']),email:z.string().email().max(254),password:z.string().min(12).max(128)}).strict();
export async function GET(){return Response.json({ready:emailReady()},{headers:{'Cache-Control':'no-store'}});}
export async function POST(r:Request){return route(async()=>{requireOrigin(r);await limit('email-auth:'+(r.headers.get('cf-connecting-ip')||'local'),10,600000);const x=await input(r,schema);if(x.action==='signup'){await authCall('signup?redirect_to='+encodeURIComponent(new URL('/teacher/login',r.url).href),'POST',{email:x.email,password:x.password});return Response.json({message:'Kontrollo email-in për konfirmim. Pastaj hyr me email dhe fjalëkalim.'},{headers:{'Cache-Control':'no-store'}});}const result=await authCall('token?grant_type=password','POST',{email:x.email,password:x.password});const cookie=await createEmailSession(r,result);await recordAccess(r,'supabase:'+String((result.user as {id:string}).id),'TEACHER',(result.user as {email?:string}).email);return Response.json({saved:true},{headers:{'Set-Cookie':cookie,'Cache-Control':'no-store'}});});}
export async function DELETE(r:Request){return route(async()=>{requireOrigin(r);return logoutEmail(r);});}
