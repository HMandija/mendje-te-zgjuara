import {authorize,requireOrigin} from '../../../lib/school-access';
import {route,input} from '../../../lib/api-route';
import {classInput,memberInput,joinInput,productData,createClass,addMember,joinClass} from '../../../lib/product-server';
export async function GET(r:Request){return route(async()=>productData(await authorize(r,'product:read')));}
export async function POST(r:Request){return route(async()=>{requireOrigin(r);return createClass(await authorize(r,'class:write'),await input(r,classInput));});}
export async function PUT(r:Request){return route(async()=>{requireOrigin(r);return addMember(await authorize(r,'class:write'),await input(r,memberInput));});}
export async function PATCH(r:Request){return route(async()=>{requireOrigin(r);return joinClass(await authorize(r,'class:join'),await input(r,joinInput));});}
