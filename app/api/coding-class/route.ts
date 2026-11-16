import {authorize,requireOrigin} from '../../../lib/school-access';
import {input,route} from '../../../lib/api-route';
import {identifier} from '../../../lib/school-validation.mjs';
import {codingAssignmentInput,codingClassData,setCodingAssignment} from '../../../lib/coding-server';

export async function GET(r:Request){return route(async()=>codingClassData(await authorize(r,'class:write'),identifier.parse(new URL(r.url).searchParams.get('class'))));}
export async function POST(r:Request){return route(async()=>{requireOrigin(r);return setCodingAssignment(await authorize(r,'class:write'),await input(r,codingAssignmentInput));});}
