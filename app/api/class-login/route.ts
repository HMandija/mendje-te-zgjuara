import {requireOrigin} from '../../../lib/school-access';
import {route,input} from '../../../lib/api-route';
import {lookupInput,pictureInput,lookupClass,loginPicture,logoutPicture} from '../../../lib/classroom-server';
export async function POST(r:Request){return route(async()=>{requireOrigin(r);return lookupClass(r,await input(r,lookupInput));});}
export async function PUT(r:Request){return route(async()=>{requireOrigin(r);return loginPicture(r,await input(r,pictureInput));});}
export async function DELETE(r:Request){return route(async()=>{requireOrigin(r);return logoutPicture(r);});}
