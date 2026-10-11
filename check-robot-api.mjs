import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {robotPuzzles} from './lib/robot-puzzles.mjs';
const origin='http://127.0.0.1:5173';
const seed=spawnSync(process.execPath,['scripts/seed.mjs','--local','--test-teacher','--reset-test-limits'],{encoding:'utf8'});assert.equal(seed.status,0,seed.stderr||seed.stdout);
const cookie=(await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'})).headers.get('set-cookie')?.split(';')[0];assert(cookie);
async function request(path,method='GET',data){const response=await fetch(origin+path,{method,headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});return {status:response.status,data:await response.json()};}
const known=new Map(robotPuzzles().map(p=>[p.id,p]));
for(const grade of [1,2,3,4])for(const gameLevel of [1,20]){
 const issued=await request('/api/adventures','POST',{grade,profile:'',category:'play',scene:'robot',count:5,gameLevel});assert.equal(issued.status,200,JSON.stringify(issued.data));assert.equal(issued.data.items.length,1);
 const p=issued.data.items[0];assert.equal(p.type,'robot');assert.equal(p.gameLevel,gameLevel);for(const field of ['answer','hint','explain'])assert(!(field in p));
 const invalid=await request('/api/adventures','PATCH',{id:issued.data.id,index:0,value:'[{"op":"teleport","correct":true}]'});assert.equal(invalid.status,400);
 const result=await request('/api/adventures','PATCH',{id:issued.data.id,index:0,value:known.get(p.id).answer});assert.equal(result.status,200,JSON.stringify(result.data));assert(result.data.correct);
 const saved=await request('/api/sessions','POST',{id:issued.data.id,profile:'',grade,answers:[{cat:'math',question:'forged',correct:false}]});assert.equal(saved.status,200,JSON.stringify(saved.data));assert(saved.data.answers[0].correct);assert.equal(saved.data.answers[0].cat,'code');assert.equal(saved.data.stars,3);
 const progress=await request('/api/games?grade='+grade+'&profile=');assert.equal(progress.status,200);assert(progress.data.progress.some(r=>r.scene==='robot'&&r.level===gameLevel&&r.mastered===1));
}
console.log('Local robot API: four grades at levels 1 and 20, safe snapshots, forged commands rejected, server revalidation and verified progress passed. No profiles, classes or invites changed.');
