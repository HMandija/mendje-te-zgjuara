import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {curriculumLessons} from '../lib/curriculum-catalog.mjs';
import {curriculumPuzzle} from '../lib/expanded-curriculum.mjs';
import {catalogSeed} from '../lib/catalog-seed.mjs';
import {assignmentCatalog} from '../lib/assignment-catalog.mjs';
import {challengeFingerprint} from '../lib/curriculum-fingerprint.mjs';
const names=new Map(),titles=new Map(),seen=new Map(),duplicates=[],within=[],nameDuplicates=[],titleDuplicates=[];let count=0;
for(const grade of [1,2,3,4]){
 for(const e of assignmentCatalog(grade)){if(names.has(e.label))nameDuplicates.push([names.get(e.label),`${grade}:${e.value}`]);names.set(e.label,`${grade}:${e.value}`);}
 for(const lesson of curriculumLessons(grade)){
  if(titles.has(lesson.title))titleDuplicates.push([titles.get(lesson.title),`${grade}:${lesson.id}`]);else titles.set(lesson.title,`${grade}:${lesson.id}`);
  const local=new Map();for(let level=1;level<=lesson.levels;level++){
   const p=curriculumPuzzle(lesson.id,level),key=challengeFingerprint(p);count++;
   if(local.has(key))within.push([local.get(key),p.id]);else local.set(key,p.id);
   if(seen.has(key))duplicates.push([seen.get(key),p.id]);else seen.set(key,p.id);
  }
 }
}
const seedDuplicates=[],seedSeen=new Map();for(const p of catalogSeed()){const key=challengeFingerprint(p);if(seedSeen.has(key))seedDuplicates.push([seedSeen.get(key),p.id]);else seedSeen.set(key,p.id);}
assert.equal(nameDuplicates.length,0,'Assignment labels must be unique');
assert.equal(titleDuplicates.length,0,'Lesson titles must be unique across grades');
assert.equal(within.length,0,'A lesson must not repeat an exercise across levels');
assert.equal(duplicates.length,0,'Curriculum exercises must be unique across all lessons and grades');
assert.equal(seedDuplicates.length,0,'Seed exercises must be unique');
const report={namedEntries:names.size,nameDuplicates,lessonTitles:titles.size,titleDuplicates,curriculumLevels:count,withinLessonRepeats:within.length,curriculumRepeats:duplicates.length,seedRepeats:seedDuplicates.length,within,duplicates,seedDuplicates};
await mkdir('.wrangler',{recursive:true});await writeFile('.wrangler/curriculum-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,within:within.slice(0,20),duplicates:duplicates.slice(0,30),seedDuplicates:seedDuplicates.slice(0,20)},null,2));
