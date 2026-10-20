import assert from 'node:assert/strict';
import {gradeCurriculum} from './lib/grade-curriculum.mjs';
import {curriculumLessons,curriculumLesson,CURRICULUM_TOTALS} from './lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from './lib/expanded-curriculum.mjs';
import {accepts,assess} from './lib/puzzle-engine.mjs';
import {publicPuzzle} from './lib/security-policy.mjs';
import {demoPublic,demoAnswer} from './lib/demo-puzzles.mjs';
import {startSchema} from './lib/school-validation.mjs';
for(let grade=1;grade<=4;grade++){assert.equal(gradeCurriculum(grade).grade,grade);assert.equal(gradeCurriculum(grade).skills.length,3);}
assert.equal(gradeCurriculum(5),null);
for(let i=0;i<106;i++)assert.equal(new Set([1,2,3,4].map(g=>curriculumLessons(g)[i].title)).size,4,'Lesson labels must distinguish grade progression');
for(let level=1;level<=20;level++){
 for(const lesson of curriculumLessons(1).filter(l=>l.domain==='algorithm')){const p=curriculumPuzzle(lesson.id,level);assert(!/[×÷]|nëse/.test(p.visual),'Grade 1 algorithms use simple steps, not conditions or multiplication');}
 for(const variant of [4,5,8]){const lesson=curriculumLessons(2).find(l=>l.domain==='math'&&l.variant===variant);const p=curriculumPuzzle(lesson.id,level);assert(!/[×÷]/.test(p.visual),'Grade 2 groups use addition and concrete sharing');assert(assess(p,p.answer).correct);}
}
const ids=new Set(),types=new Set();let levels=0;
for(const grade of [1,2,3,4]){
 const lessons=curriculumLessons(grade);assert.equal(lessons.length,grade<=2?107:106);assert.equal(new Set(lessons.map(l=>l.id)).size,grade<=2?107:106);
 for(const lesson of lessons){assert.equal(lesson.grade,grade);assert.equal(lesson.levels,20);assert(lesson.objective&&lesson.tutorial.length>=3);const boards=new Set();
  for(let level=1;level<=lesson.levels;level++){
   const p=curriculumPuzzle(lesson.id,level);assert(!ids.has(p.id));ids.add(p.id);levels++;types.add(p.type);
   assert(accepts(p,p.answer),`${p.id}: answer rejected`);assert(assess(p,p.answer).correct,`${p.id}: incorrect authored answer`);
   assert.equal(p.grade,grade);assert.equal(p.gameLevel,level);assert.equal(p.difficultyBand,1+Math.floor((level-1)/5));
   const safe=publicPuzzle(p);for(const key of ['answer','hint','hint2','explain'])assert(!(key in safe));
   boards.add(JSON.stringify({visual:p.visual,interaction:p.interaction,answer:p.answer}));
   if(p.type==='number')assert(!assess(p,String(Number(p.answer)+1)).correct);
   if(p.type==='placement'){const a=JSON.parse(p.answer);const bad=a.map(x=>x==='n0'?'n1':x);if(p.interaction.tokens.some(t=>t.id==='n1'))assert(!assess(p,JSON.stringify(bad)).correct);}
  }
  assert(boards.size>=20,`${lesson.id}: only ${boards.size} distinct visible challenges`);
  const sample=demoPublic({grade,lessonId:lesson.id});assert(sample);assert.equal(sample.gameLevel,1);assert(demoAnswer({grade,lessonId:lesson.id},curriculumPuzzle(lesson.id,1).answer).correct);
 }
}
assert.equal(levels,8520);assert.equal(CURRICULUM_TOTALS.lessons,426);assert.equal(CURRICULUM_TOTALS.levels,8520);assert(types.has('robot')&&types.has('placement')&&types.has('maze')&&types.has('pipes')&&types.has('ordering'));
assert.equal(curriculumPuzzle(curriculumLessons(1)[0].id,30).lessonLevel,30,'Previously assigned levels remain compatible.');
const mathLesson=curriculumLessons(4).find(l=>l.domain==='math'&&l.variant===0),carrying=curriculumPuzzle(mathLesson.id,6),unknownAddend=curriculumPuzzle(mathLesson.id,16);assert(carrying.interaction.targets[0].label.includes('248 + 37'),'Grade 4 advances to carrying addition.');
assert(unknownAddend.interaction.targets[0].label.includes('?'),'Advanced grade 4 addition introduces an unknown addend.');
const robotLesson=curriculumLessons(1).find(l=>l.domain==='robotics'),robotA=curriculumPuzzle(robotLesson.id,1),robotB=curriculumPuzzle(robotLesson.id,10);assert.notEqual(robotA.explain,robotB.explain,'Robot explanations must describe the generated route.');
const numericLesson=curriculumLessons(4).find(l=>l.domain==='math'&&l.variant===0),numericPuzzle=curriculumPuzzle(numericLesson.id,6);assert(!numericPuzzle.hint2.includes('figurën'),'Expanded arithmetic hints must fit the question.');
assert.equal(curriculumLesson('unknown'),null);assert.throws(()=>curriculumPuzzle(curriculumLessons(1)[0].id,31));assert.equal(demoPublic({grade:4,lessonId:curriculumLessons(1)[0].id}),null);
const base={grade:1,profile:'',category:'mixed',count:5};assert(startSchema.safeParse({...base,lessonId:curriculumLessons(1)[0].id,lessonLevel:30}).success);for(const extra of [{lessonLevel:31},{lessonLevel:0},{lessonId:'unknown'},{lessonId:'unknown',lessonLevel:1,scene:'robot'}])assert(!startSchema.safeParse({...base,...extra}).success);
console.log(`Curriculum: ${levels} generated levels across 426 skill lessons / four grades; ${[...types].join(', ')}; solutions, contextual hints, grade progression, legacy assigned levels and safe projections passed.`);
