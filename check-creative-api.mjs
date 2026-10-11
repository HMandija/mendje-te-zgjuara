import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFile,rm} from 'node:fs/promises';
import {creativeLessons} from './lib/creative-catalog.mjs';
import {curriculumPuzzle} from './lib/expanded-curriculum.mjs';
const origin='http://127.0.0.1:5173',ids=[];
const seed=spawnSync(process.execPath,['scripts/seed.mjs','--local','--test-teacher','--reset-test-limits'],{encoding:'utf8'});assert.equal(seed.status,0,seed.stderr||seed.stdout);
const cookie=(await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'})).headers.get('set-cookie')?.split(';')[0];assert(cookie);
async function req(path,method='GET',data,anon=false){const headers={Origin:origin};if(!anon)headers.Cookie=cookie;if(data)headers['Content-Type']='application/json';const r=await fetch(origin+path,{method,headers,body:data?JSON.stringify(data):undefined});return {status:r.status,data:await r.json()};}
try{
 for(const [i,lesson] of creativeLessons(4).entries()){
  const grade=i%4+1,l=creativeLessons(grade)[i],p=curriculumPuzzle(l.id,30);
  const demo=await req('/api/demo?'+new URLSearchParams({grade:String(grade),lessonId:l.id}),'GET',undefined,true);assert.equal(demo.status,200);assert.equal(demo.data.puzzle.gameLevel,1);assert.equal(demo.data.puzzle.interaction.creative.kind,lesson.domain);
  assert.equal((await req('/api/demo?'+new URLSearchParams({grade:String(grade),lessonId:l.id,lessonLevel:'30'}),'GET',undefined,true)).status,400);
  const issued=await req('/api/adventures','POST',{grade,profile:'',category:'mixed',count:5,lessonId:l.id,lessonLevel:30});assert.equal(issued.status,200,JSON.stringify(issued));ids.push(issued.data.id);assert(!('answer' in issued.data.items[0]));
  assert.equal((await req('/api/adventures','PATCH',{id:issued.data.id,index:0,value:'[null]'})).status,400);
  const result=await req('/api/adventures','PATCH',{id:issued.data.id,index:0,value:p.answer});assert.equal(result.status,200);assert(result.data.correct);
  const save=await req('/api/sessions','POST',{id:issued.data.id,profile:'',grade,answers:[{cat:l.category,correct:false,question:'forged'}]});assert.equal(save.status,200);assert(save.data.answers[0].correct);
  const progress=await req('/api/curriculum?grade='+grade+'&profile=');assert(progress.data.progress.some(x=>x.lessonId===l.id&&x.level===30&&x.mastered===1));
 }
 console.log('Creative API: six level30 engines issued, validated and saved; forged correctness ignored, malformed answers rejected, progress scoped and visitor level1 restriction passed.');
}finally{
 if(ids.length){const path='.wrangler/creative-test-cleanup.sql',quoted=ids.map(x=>"'"+x.replaceAll("'","''")+"'").join(',');await writeFile(path,`DELETE FROM attempt_answers WHERE adventure IN (${quoted}); DELETE FROM sessions WHERE id IN (${quoted}); DELETE FROM adventures WHERE id IN (${quoted});`);try{const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--file',path],{encoding:'utf8'});assert.equal(r.status,0,r.stderr||r.stdout);}finally{await rm(path,{force:true});}}
}
