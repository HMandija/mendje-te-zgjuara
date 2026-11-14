// Server-only fixed first-level samples. No sessions, rewards or profile records.
import {catalogSeed} from './catalog-seed.mjs';
import {publicPuzzle,evaluateAnswer} from './security-policy.mjs';
import {accepts} from './puzzle-engine.mjs';
import {curriculumPuzzle} from './expanded-curriculum.mjs';
import {curriculumLesson} from './curriculum-catalog.mjs';
const samples=new Map();
function sampleSeed(grade){let list=samples.get(grade);if(!list)samples.set(grade,list=catalogSeed(grade));return list;}
export function demoPuzzle({grade,category,scene,lessonId}){
 if(!Number.isInteger(grade)||grade<1||grade>4)return null;
 if(lessonId)return curriculumLesson(lessonId)?.grade===grade?curriculumPuzzle(lessonId,1):null;
 return sampleSeed(grade).find(p=>p.grade===grade&&(scene?p.interaction?.scene===scene&&p.gameLevel===1:p.cat===category&&(p.level||1)===1&&!['placement','robot','pipes','maze'].includes(p.type)));
}
export function demoPublic(selection){const p=demoPuzzle(selection);return p?publicPuzzle(p):null;}
export function demoAnswer(selection,value){const p=demoPuzzle(selection);return p&&accepts(p,value)?evaluateAnswer(p,value):null;}
