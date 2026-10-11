import {authorize,requireOrigin} from '../../../lib/school-access';
import {route,input} from '../../../lib/api-route';
import {assignmentInput,createAssignment} from '../../../lib/product-server';
export async function POST(r:Request){return route(async()=>{requireOrigin(r);return createAssignment(await authorize(r,'class:write'),await input(r,assignmentInput));});}
