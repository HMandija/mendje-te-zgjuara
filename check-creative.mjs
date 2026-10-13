import assert from 'node:assert/strict';
import {creativeLessons} from './lib/creative-catalog.mjs';
import {curriculumPuzzle} from './lib/expanded-curriculum.mjs';
import {assess,accepts} from './lib/puzzle-engine.mjs';
import {tangramSolved,drawTrace} from './lib/creative-rules.mjs';
import {publicPuzzle} from './lib/security-policy.mjs';
import {submissionSchema} from './lib/school-validation.mjs';
import {tangramLayouts} from './lib/tangram-layouts.mjs';
let total=0;
for(let grade=1;grade<=4;grade++)for(const lesson of creativeLessons(grade)){
 let previousWorkload=null;
 for(let level=1;level<=30;level++){
 const p=curriculumPuzzle(lesson.id,level),b=p.interaction.creative,a=JSON.parse(p.answer);total++;
 assert(assess(p,p.answer).correct,p.id);assert(submissionSchema.safeParse({id:'test',index:0,value:p.answer}).success);
 for(const bad of ['null','{}','[]','[null]','not json'])assert(!accepts(p,bad),`${p.id}: malformed input`);
 const safe=publicPuzzle(p);assert(!('answer' in safe));assert(!('hint' in safe));assert(!('explain' in safe));
 if(b.kind==='color'){assert(grade<=2);assert(new Set(b.cells.map(c=>c.symbol)).size>1);const bad=[...a];bad[0]=(bad[0]+1)%b.palette.length;assert(!assess(p,JSON.stringify(bad)).correct);assert(!accepts(p,JSON.stringify(a.map(()=>99))));}
 if(b.kind==='draw'){assert.deepEqual(drawTrace(b,a),b.target);assert(!accepts(p,JSON.stringify([{op:'forward',n:999}])));assert(!assess(p,JSON.stringify([{op:'right',n:1}])).correct);}
 if(b.kind==='events'){const bad=[...a];bad[0]=b.actions.find(x=>x.id!==a[0]).id;assert(!assess(p,JSON.stringify(bad)).correct);}
 if(b.kind==='story'){const bad=[...a];bad[0]=b.story[0].options.find(x=>x.id!==a[0]).id;assert(!assess(p,JSON.stringify(bad)).correct);assert(b.story.every(s=>s.options.every(o=>/^o[0-2]$/.test(o.id))));}
 if(b.kind==='objects'){assert(!assess(p,JSON.stringify(a.map(()=>-1))).correct);if(a.length>1&&b.tokens[0].value===b.tokens[1].value){const swapped=[...a];[swapped[0],swapped[1]]=[swapped[1],swapped[0]];assert(assess(p,JSON.stringify(swapped)).correct);}}
 if(b.kind==='rules'){const bad=a.map(r=>[...r]);bad[0][0]=(bad[0][0]+1)%b.rounds[0].labels.length;assert(!assess(p,JSON.stringify(bad)).correct);if(grade===1)assert(b.rounds.every(r=>!r.rule.includes('tek')));}
 if(b.kind==='tangram'){assert(tangramSolved(b,a));const bad=a.map(t=>({...t}));bad[0].x+=.5;assert(!assess(p,JSON.stringify(bad)).correct);assert(!accepts(p,JSON.stringify(a.map(t=>({...t,x:NaN})))));}
  const workload=b.kind==='color'?b.cells.length:b.kind==='draw'?b.target.length:b.kind==='events'?b.events.length:b.kind==='story'?b.story.length:b.kind==='objects'?b.goals.reduce((sum,n)=>sum+n,0):b.kind==='rules'?b.rounds.reduce((sum,r)=>sum+r.figures.length,0):tangramLayouts[grade-1][level-1].score;
  assert(workload>=previousWorkload,`${p.id}: creative workload must not decrease (${previousWorkload} → ${workload})`);previousWorkload=workload;
 }
}
assert.equal(total,780);
console.log('Creative: 780 grade-specific levels; seven engines, progressive workload, bounded input, wrong answers, equivalent object groups, tangram coverage/overlap and safe payloads passed.');
