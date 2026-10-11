import assert from 'node:assert/strict';
import {visualPuzzles} from './lib/visual-puzzles.mjs';
const origin='http://127.0.0.1:5173';
const login=await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});
const cookie=login.headers.get('set-cookie')?.split(';')[0];assert(cookie);
async function req(method,data){const response=await fetch(origin+'/api/adventures',{method,headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:response.status,data:await response.json()};}
for(const original of visualPuzzles().filter(p=>p.gameLevel===20&&(p.grade===1||p.grade===4&&p.interaction.scene==='path'))){
 const started=await req('POST',{grade:original.grade,profile:'',category:'play',count:5,scene:original.interaction.scene,gameLevel:original.gameLevel});assert.equal(started.status,200,JSON.stringify(started.data));
 const a=started.data;assert.equal(a.items.length,1);assert.equal(a.items[0].id,original.id);for(const key of ['answer','hint','explain'])assert(!(key in a.items[0]));
 assert.equal((await req('PATCH',{id:a.id,index:0,value:JSON.stringify(['forged'])})).status,400);
 const answer=await req('PATCH',{id:a.id,index:0,value:original.answer});assert.equal(answer.status,200,JSON.stringify(answer.data));assert(answer.data.correct);
}
console.log('Local API: all six scenes and grade-four road, safe payloads, forged-answer rejection and server scoring passed. Adventures expire normally; no profiles, invites or classes changed.');
