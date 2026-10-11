import assert from 'node:assert/strict';
import {originalPuzzles} from './lib/original-puzzles.mjs';
import {plugins,accepts,assess,puzzleTypes} from './lib/puzzle-engine.mjs';
import {progress,starScore} from './lib/progress.mjs';
import {pdfDocument} from './lib/pdf-document.mjs';
import {csvExport} from './lib/csv-export.mjs';
import {allowed} from './lib/security-policy.mjs';
assert(allowed('STUDENT','class:join'));assert(!allowed('STUDENT','class:write'));assert(!allowed('TEACHER','class:join'));assert(allowed('TEACHER','class:write'));
assert.equal(csvExport([[' =2+2','Ylli, "1"']]),'\uFEFF"\' =2+2","Ylli, ""1"""');
const puzzles=originalPuzzles();assert.equal(puzzles.length,64);assert.equal(new Set(puzzles.map(p=>p.title)).size,64);
assert.deepEqual(new Set(puzzles.map(p=>p.type)),new Set(puzzleTypes.filter(t=>!['placement','pipes','maze','robot','creative'].includes(t))));assert.deepEqual(new Set(puzzles.map(p=>p.level)),new Set([1,2,3]));
for(const p of puzzles){assert(p.explain&&p.hint);assert(plugins[p.type].hint(p,2).startsWith(p.hint));assert(plugins[p.type].hint(p,2).length>p.hint.length);assert(assess(p,p.answer).correct,p.id);assert.equal(assess(p,p.answer).score,1);assert.equal(plugins[p.type].render,p.type);assert(!accepts(p,'forged'));if(p.type==='ordering'){const wrong=JSON.stringify([...JSON.parse(p.answer)].reverse());assert(!assess(p,wrong).correct);assert(!accepts(p,JSON.stringify([p.interaction.items[0],p.interaction.items[0]])));}else if(p.type==='grid'){assert(!accepts(p,'["+"]'));assert(!assess(p,JSON.stringify(JSON.parse(p.answer).map(v=>v==='+'?'−':'+'))).correct);}else{const wrong=p.options.find(v=>v!==p.answer);assert(!assess(p,wrong).correct);}}
const answers=Array.from({length:5},()=>({cat:'logic',correct:true}));assert.equal(starScore(answers),3);assert.equal(starScore([...answers.slice(0,4),{correct:false}]),2);assert.equal(starScore([{correct:false}]),1);
const rows=[1,2,3].map(level=>({profile:'a',grade:1,level,verified:true,stars:2,date:`2026-10-0${level}T12:00:00Z`,answers,duration:60}));
const p=progress(rows,'a',1,new Date('2026-10-03T12:00:00Z'));assert(p.certificate);assert.equal(p.streak,3);assert.equal(p.stars,6);assert.equal(p.duration,180);assert(!progress(rows,'b',1).certificate);assert(!progress(rows.map(s=>({...s,verified:false})),'a',1).certificate);
assert.equal(progress(rows,'a',1,new Date('2026-10-04T12:00:00Z')).streak,3);assert.equal(progress(rows,'a',1,new Date('2026-10-05T12:00:00Z')).streak,0);
const pdf=pdfDocument('Certifikatë',['Nxënësi: Ylli','Klasa 1',...Array(100).fill('Ushtrim (provë): 2 + 2.')]);const text=Buffer.from(pdf).toString('latin1');assert(text.startsWith('%PDF-1.4'));assert(text.endsWith('%%EOF'));assert(text.includes('/Count 3'));const xref=Number(text.match(/startxref\n(\d+)/)[1]);assert.equal(text.slice(xref,xref+4),'xref');assert(text.includes('Certifikat\xeb'));
console.log('Product: 64 unique tasks, eight plugins, invalid answer rejection, scoring, scoped progress, UTC streaks and multi-page PDF passed.');

// Teacher selector must resolve grade-bound lessons and identify previously assigned entries.
const {assignmentCatalog,assignmentCategory}=await import('./lib/assignment-catalog.mjs');
const {curriculumLesson}=await import('./lib/curriculum-catalog.mjs');
for(const grade of [1,2,3,4]){
 const rows=assignmentCatalog(grade);
 assert.equal(new Set(rows.map(r=>r.value)).size,rows.length);
 assert(rows.some(r=>r.group==='Robotikë'));
 for(const r of rows.filter(r=>r.value.startsWith('lesson:')))assert.equal(curriculumLesson(r.value.slice(7)).grade,grade);
}
assert.equal(assignmentCatalog(5).length,0);
assert.equal(assignmentCategory({lesson_id:'draw-g1',scene:null,category:'code'}),'lesson:draw-g1');
assert.equal(assignmentCategory({scene:'robot',category:'mixed'}),'game:robot');
assert.equal(assignmentCategory({category:'math'}),'quiz:math');
