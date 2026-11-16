import {authorize,requireOrigin} from '../../../lib/school-access';
import {route} from '../../../lib/api-route';
import {codingScope,loadCodingProject,saveCodingProject} from '../../../lib/coding-project-server';

export async function GET(r:Request){return route(async()=>loadCodingProject(await authorize(r,'coding:read'),codingScope(r)));}
export async function PUT(r:Request){return route(async()=>{requireOrigin(r);return saveCodingProject(await authorize(r,'coding:write'),codingScope(r),r);});}
