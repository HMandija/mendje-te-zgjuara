// Server-only: persisted IDs reserve challenges once per class, independently of retries.
import {catalogSeed} from './catalog-seed.mjs';
import {curriculumLessons,curriculumLesson} from './curriculum-catalog.mjs';
import {curriculumPuzzle} from './expanded-curriculum.mjs';
export function mixedCatalog(grade){
 const seed=catalogSeed(grade),lessons=curriculumLessons(grade),refs=[];
 for(let level=1;level<=30;level++){
  const base=seed.filter(p=>(p.gameLevel||p.level||1)===level),classic=base.filter(p=>!['robot','placement','pipes','maze'].includes(p.type)),robots=base.filter(p=>p.type==='robot'),games=base.filter(p=>['placement','pipes','maze'].includes(p.type));
  const groups=[classic.map(p=>({id:p.id})),robots.map(p=>({id:p.id})),lessons.filter((_,i)=>i%2===0).map(l=>({id:l.id,level})),games.map(p=>({id:p.id})),lessons.filter((_,i)=>i%2===1).map(l=>({id:l.id,level}))];
  for(let i=0;i<Math.max(...groups.map(g=>g.length));i++)for(const group of groups)if(group[i])refs.push(group[i]);
 }
 return refs;
}
export function reserveMixed(grade,history,count){
 const previous=history.filter(a=>a.category==='mixed'&&!a.scene&&!a.lesson_id),used=new Set(previous.flatMap(a=>{try{return JSON.parse(a.mixed_items||'[]').map(r=>r.id+':'+(r.level||0));}catch{return [];}}));
 const items=mixedCatalog(grade).filter(r=>!used.has(r.id+':'+(r.level||0))).slice(0,count);
 return {number:Math.max(0,...previous.map(a=>a.mixed_number||0),previous.length)+1,items};
}
export function mixedPuzzles(grade,refs,stored=catalogSeed(grade)){
 const seed=new Map(stored.filter(p=>p.grade===grade).map(p=>[p.id,p]));
 return refs.map(r=>{if(r.level){const lesson=curriculumLesson(r.id);if(!lesson||lesson.grade!==grade)throw Error('Invalid mixed lesson');return curriculumPuzzle(r.id,r.level);}const p=seed.get(r.id);if(!p)throw Error('Invalid mixed challenge');return p;});
}
