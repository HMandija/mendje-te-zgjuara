import assert from 'node:assert/strict';
import {interactivePuzzles} from './lib/interactive-puzzles.mjs';
const origin='http://127.0.0.1:5173';
const cookie=(await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'})).headers.get('set-cookie')?.split(';')[0];assert(cookie);
async function request(method,data){const response=await fetch(origin+'/api/adventures',{method,headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:response.status,data:await response.json()};}
const known=new Map(interactivePuzzles().map(p=>[p.id,p]));
for(const grade of [1,4])for(const scene of ['memory-grid','pipes','maze']){
 const start=await request('POST',{grade,profile:'',category:'play',scene,count:5,gameLevel:20});assert.equal(start.status,200,JSON.stringify(start.data));assert.equal(start.data.items.length,1);
 for(let index=0;index<1;index++){
  const p=start.data.items[index];for(const key of ['answer','hint','explain'])assert(!(key in p));
  assert.equal((await request('PATCH',{id:start.data.id,index,value:'[]'})).status,400);
  const result=await request('PATCH',{id:start.data.id,index,value:known.get(p.id).answer});assert.equal(result.status,200,JSON.stringify(result.data));assert(result.data.correct);
 }
}
console.log('Local interactive API: level 20 for each new scene in grades 1 and 4, safe issued snapshots, malformed-answer rejection and server scoring passed. No profiles/invites/classes changed.');
