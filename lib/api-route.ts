import {ZodError,type ZodType} from 'zod';
import {ApiError} from './school-access';
import {body,json} from './school-server';
export async function input<T>(r:Request,schema:ZodType<T>):Promise<T>{return schema.parse(await body(r));}
export async function route(action:()=>Promise<Response>){try{return await action();}catch(error){
 if(error instanceof ApiError)return json({error:error.message},error.status);
 if(error instanceof ZodError || error instanceof SyntaxError)return json({error:'Të dhëna të pavlefshme.'},400);
 console.error('School API failure',error instanceof Error ? error.message : 'Unknown error');
 return json({error:'Kërkesa nuk u përfundua. Provo përsëri.'},500);
}}
