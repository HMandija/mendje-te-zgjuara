import {authorize,requireOrigin} from '../../../lib/school-access';
import {route,input} from '../../../lib/api-route';
import {rosterInput,rosterData,rosterAction} from '../../../lib/classroom-server';
import {identifier} from '../../../lib/school-validation.mjs';
export async function GET(r:Request){return route(async()=>rosterData(await authorize(r,'class:write'),identifier.parse(new URL(r.url).searchParams.get('class'))));}
export async function POST(r:Request){return route(async()=>{requireOrigin(r);return rosterAction(await authorize(r,'class:write'),await input(r,rosterInput));});}
