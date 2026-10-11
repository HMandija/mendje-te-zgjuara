import assert from 'node:assert/strict';
import {demoPuzzle} from './lib/demo-puzzles.mjs';
const origin='http://127.0.0.1:5173';
async function request(path,method='GET',data,originHeader=origin){const r=await fetch(origin+path,{method,headers:{Origin:originHeader,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});const text=await r.text();let payload;try{payload=JSON.parse(text);}catch{payload=text;}return {status:r.status,data:payload};}
for(const grade of [1,2,3,4])for(const scene of ['robot','pipes','garden']){
 const x={grade,scene},r=await request('/api/demo?'+new URLSearchParams({grade:String(grade),scene}));assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.data.puzzle.gameLevel,1);assert.equal(r.data.persistsProgress,false);assert(!('answer' in r.data.puzzle));
 const answer=await request('/api/demo','POST',{selection:x,value:demoPuzzle(x).answer});assert.equal(answer.status,200);assert(answer.data.correct);assert.equal(answer.data.persistsProgress,false);
}
for(const query of ['grade=1&scene=robot&gameLevel=2','grade=1&scene=robot&level=2','grade=5&scene=robot','grade=1&scene=robot&profile=other'])assert.equal((await request('/api/demo?'+query)).status,400);
assert.equal((await request('/api/demo','POST',{selection:{grade:1,scene:'robot',level:2},value:'[]'})).status,400);
assert.equal((await request('/api/demo','POST',{selection:{grade:1,scene:'robot'},value:'[]'},'https://other.example')).status,403);
assert.equal((await request('/api/adventures','POST',{grade:1,profile:'',category:'play',scene:'robot',count:1,gameLevel:2})).status,401);
console.log('Local visitor API: unauthenticated level 1 runs, answer validation, higher-level bypass and cross-origin rejection passed. No school fixtures created.');
