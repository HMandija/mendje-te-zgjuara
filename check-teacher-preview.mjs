import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {z} from 'zod';
import {curriculumLesson} from './lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from './lib/expanded-curriculum.mjs';
import {publicPuzzle,evaluateAnswer} from './lib/security-policy.mjs';
import {accepts} from './lib/puzzle-engine.mjs';
class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}
let allowed=true,reads=0;
const fixture={id:'preview-fixture',grade:1,cat:'logic',level:1,title:'Numëro',visual:'',options:['1','2','3'],answer:'2',explain:'Dy',hint:'Numëro sendet.'};
globalThis.__teacherPreview={z,curriculumLesson,curriculumPuzzle,publicPuzzle,evaluateAnswer,accepts,ApiError,
 route:async fn=>{try{return await fn();}catch(e){return Response.json({error:e.message},{status:e.status||400});}},
 input:async(r,schema)=>schema.parse(await r.json()),
 authorize:async()=>{if(!allowed)throw new ApiError(401,'Hyrja kërkohet.');},
 requireOrigin:r=>{if(r.headers.get('origin')!=='https://fixture.test')throw new ApiError(403,'Origjinë e pavlefshme.');},
 json:body=>Response.json(body),
 db:()=>({prepare(sql){assert.match(sql,/^SELECT payload FROM puzzle_catalog/);return {bind(grade){assert.equal(grade,1);return {async all(){reads++;return {results:[{payload:JSON.stringify(fixture)}]};}};}};}})
};
const source='const {z,route,input,authorize,requireOrigin,ApiError,db,json,curriculumLesson,curriculumPuzzle,publicPuzzle,evaluateAnswer,accepts}=globalThis.__teacherPreview;\n'+fs.readFileSync('app/api/teacher-preview/route.ts','utf8').replace(/^import .*;\r?\n/gm,'');
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
try{
 const response=await GET(new Request('https://fixture.test/api/teacher-preview?grade=1&choice=quiz:logic&level=1'));
 assert.equal(response.status,200);const view=await response.json();assert.equal(view.persistsProgress,false);
 for(const key of ['answer','hint','explain'])assert(!(key in view.puzzle));
 const request=value=>new Request('https://fixture.test/api/teacher-preview',{method:'POST',headers:{origin:'https://fixture.test','Content-Type':'application/json'},body:JSON.stringify({selection:{grade:1,choice:'quiz:logic',level:1},value})});
 for(const [value,correct] of [['2',true],['1',false]]){const r=await POST(request(value));assert.equal(r.status,200);const result=await r.json();assert.equal(result.correct,correct);assert.equal(result.persistsProgress,false);}
 assert.equal(reads,3);
 const before=reads;allowed=false;assert.equal((await GET(new Request('https://fixture.test/api/teacher-preview?grade=1&choice=quiz:logic&level=1'))).status,401);assert.equal((await POST(request('2'))).status,401);assert.equal(reads,before);
 allowed=true;const badOrigin=request('2');badOrigin.headers.set('origin','https://other.test');assert.equal((await POST(badOrigin)).status,403);assert.equal(reads,before);
 assert.equal((await GET(new Request('https://fixture.test/api/teacher-preview?grade=1&choice=quiz:logic&level=30'))).status,400);assert.equal(reads,before);
}finally{delete globalThis.__teacherPreview;}
console.log('Teacher preview: authenticated read-only trials, correct/wrong answers, hidden solutions, origin and level guards passed; no progress writes.');
