import {authorize,requireOrigin} from '../../../lib/school-access';
import {input,route} from '../../../lib/api-route';
import {sessionSchema} from '../../../lib/school-validation.mjs';
import {finishAdventure} from '../../../lib/adventure-server';
export async function POST(r:Request){return route(async()=>{requireOrigin(r);const actor=await authorize(r,'session:finish');const x=await input(r,sessionSchema);return finishAdventure(actor,{...x,profile:x.profile||''});});}
