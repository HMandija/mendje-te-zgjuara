import {authorize,requireOrigin} from '../../../lib/school-access';
import {input,route} from '../../../lib/api-route';
import {startSchema,submissionSchema,hintSchema} from '../../../lib/school-validation.mjs';
import {startAdventure,submitAnswer,puzzleHint} from '../../../lib/adventure-server';
export async function POST(r:Request){return route(async()=>{requireOrigin(r);const actor=await authorize(r,'adventure:start');return startAdventure(actor,await input(r,startSchema));});}
export async function PATCH(r:Request){return route(async()=>{requireOrigin(r);const actor=await authorize(r,'adventure:answer');return submitAnswer(actor,await input(r,submissionSchema));});}
export async function GET(r:Request){return route(async()=>{const actor=await authorize(r,'adventure:hint');const query=Object.fromEntries(new URL(r.url).searchParams);return puzzleHint(actor,hintSchema.parse(query));});}
