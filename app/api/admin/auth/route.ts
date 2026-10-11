import {z} from 'zod';
import {route,input} from '../../../../lib/api-route';
import {requireOrigin} from '../../../../lib/school-access';
import {adminIdentity,startAdmin,verifyAdmin,logoutAdmin} from '../../../../lib/admin-server';
const login=z.object({email:z.string().email().max(254),password:z.string().min(1).max(128)}).strict();
const otp=z.object({code:z.string().regex(/^\d{6,10}$/)}).strict();
export async function GET(r:Request){return route(async()=>{await adminIdentity(r);return Response.json({authenticated:true},{headers:{'Cache-Control':'no-store'}});});}
export async function POST(r:Request){return route(async()=>{requireOrigin(r);const x=await input(r,login);return startAdmin(r,x.email,x.password);});}
export async function PUT(r:Request){return route(async()=>{requireOrigin(r);return verifyAdmin(r,(await input(r,otp)).code);});}
export async function DELETE(r:Request){return route(async()=>{requireOrigin(r);return logoutAdmin(r);});}
