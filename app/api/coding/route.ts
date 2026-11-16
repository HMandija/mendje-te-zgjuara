import {authorize} from '../../../lib/school-access';
import {route} from '../../../lib/api-route';
import {json} from '../../../lib/school-server';
import {CODING_MISSIONS} from '../../../lib/coding-missions.mjs';
import {codingStudentData} from '../../../lib/coding-server';
import {codingLaunch,codingScope} from '../../../lib/coding-project-server';

export async function GET(r:Request){return route(async()=>{
 if(new URL(r.url).searchParams.get('preview')==='1')return json({mission:CODING_MISSIONS[0]});
 const actor=await authorize(r,'coding:read');
 if(new URL(r.url).searchParams.has('mission'))return codingLaunch(actor,codingScope(r));
 return codingStudentData(actor);
});}
