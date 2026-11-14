import {mixedPuzzles} from './mixed-pack.mjs';
import {db,json} from './school-server';
import {ApiError,limit,actorWorkspace,type Actor} from './school-access';
import {seedCatalog} from './catalog-seed.mjs';
import {shuffle,shufflePuzzleForIssue} from './puzzles.mjs';
import {publicPuzzle,evaluateAnswer} from './security-policy.mjs';
import type {Answer,Puzzle,SavedSession} from './learning-types';
import {accepts,plugins} from './puzzle-engine.mjs';
import {assignmentFor} from './product-server';
import {starScore} from './progress.mjs';
import {curriculumPuzzle} from './expanded-curriculum.mjs';
import {curriculumLesson} from './curriculum-catalog.mjs';
import {assignmentLevels} from './assignment-levels';
type Issued = {id:string;owner:string;profile:string;principal:string;grade:number;payload:string;expires:number;completed:number;level:number|null;assignment:string|null;started:number|null};
type Started = {grade:number;profile:string;category:string;count:number;level?:number;assignment?:string;assignmentLevel?:number;scene?:string;gameLevel?:number;lessonId?:string;lessonLevel?:number};
export async function startAdventure(actor:Actor,x:Started){
 if(actor.role==='STUDENT'&&(x.profile!==actor.profile||x.grade!==actor.grade))throw new ApiError(403,'Profili ose klasa nuk lejohet.');
 if(actor.classroom&&!x.assignment)throw new ApiError(403,'Zgjidh një nga detyrat që të ka caktuar mësuesi.');
 await limit('adventure-start:'+actor.principal,12);
 const w=await actorWorkspace(actor);
 if(x.profile&&!w.profiles.some((p:{id:string})=>p.id===x.profile))throw new ApiError(404,'Profili nuk ekziston.');
 if(x.scene&&(x.level||x.assignment)||x.gameLevel&&(!x.scene||x.category!=='play'))throw new ApiError(400,'Niveli i lojës kërkon një lojë me figura pa detyrë kursi.');
 let mixed: Puzzle[]|null=null;let contentGrade=x.grade;
 if(x.assignment){const a=await assignmentFor(actor,x.assignment,x.profile,x.grade),levels=assignmentLevels(a),selected=x.assignmentLevel??levels[0];
  if(!levels.includes(selected))throw new ApiError(403,'Ky nivel nuk është aktivizuar nga mësuesi.');
  contentGrade=a.source_grade||a.grade;if(a.mixed_items){await seedCatalog(db());const stored=await db().prepare('SELECT payload FROM puzzle_catalog WHERE grade=?').bind(contentGrade).all<{payload:string}>();mixed=mixedPuzzles(contentGrade,JSON.parse(a.mixed_items),stored.results.map(r=>JSON.parse(r.payload))) as Puzzle[];}
  x={...x,category:a.scene?'play':a.category,level:a.scene||a.lesson_id?undefined:selected,count:a.scene||a.lesson_id?1:a.count,scene:a.scene||undefined,gameLevel:a.scene?selected:undefined,lessonId:a.lesson_id||undefined,lessonLevel:a.lesson_id?selected:undefined};}
 if(mixed){mixed=mixed.map(shufflePuzzleForIssue);const id=crypto.randomUUID();await db().prepare('INSERT INTO adventures(id,owner,profile,principal,grade,payload,expires,level,assignment,started) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,actor.owner,x.profile,actor.principal,x.grade,JSON.stringify(mixed),Date.now()+86400000,x.level||null,x.assignment||null,Date.now()).run();return json({id,grade:x.grade,profile:x.profile,level:x.level,assignment:x.assignment,items:mixed.map(publicPuzzle)});}
 if(x.lessonId){
  const lesson=curriculumLesson(x.lessonId);
  if(!lesson||lesson.grade!==contentGrade||!x.lessonLevel)throw new ApiError(400,'Mësimi nuk përputhet me klasën.');
  const p=curriculumPuzzle(x.lessonId,x.lessonLevel) as Puzzle;
  const items=[{...p,lessonId:x.lessonId,lessonLevel:x.lessonLevel}],id=crypto.randomUUID();
  await db().prepare('INSERT INTO adventures(id,owner,profile,principal,grade,payload,expires,level,assignment,started) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,actor.owner,x.profile,actor.principal,x.grade,JSON.stringify(items),Date.now()+86400000,null,x.assignment||null,Date.now()).run();
  return json({id,grade:x.grade,profile:x.profile,assignment:x.assignment,lessonId:x.lessonId,lessonLevel:x.lessonLevel,items:items.map(publicPuzzle)});
 }
 await seedCatalog(db());
 const rows=await db().prepare('SELECT payload FROM puzzle_catalog WHERE grade=?').bind(contentGrade).all<{payload:string}>();
 let pool:Puzzle[]=[...rows.results.map(r=>JSON.parse(r.payload)),...w.custom.filter((p:Puzzle)=>p.grade===contentGrade)];
 if(x.category==='custom')pool=w.custom.filter((p:Puzzle)=>p.grade===contentGrade);
 else if(x.category==='play')pool=pool.filter(p=>['placement','pipes','maze','robot'].includes(p.type||'')&&(!x.scene||p.interaction?.scene===x.scene));
 else if(x.category!=='mixed')pool=pool.filter(p=>p.cat===x.category);
 if(x.category==='play'&&x.scene){x={...x,gameLevel:x.gameLevel||1};pool=pool.filter(p=>p.gameLevel===x.gameLevel);}
 if(x.level){const preferred=pool.filter(p=>(p.level||1)===x.level),support=pool.filter(p=>(p.level||1)!==x.level).sort((a,b)=>Math.abs((a.level||1)-x.level!)-Math.abs((b.level||1)-x.level!));pool=preferred.length>=x.count?preferred:[...preferred,...support.slice(0,x.count-preferred.length)];}
 if(!pool.length)throw new ApiError(400,'Nuk ka ushtrime në këtë kategori.');
 if(x.scene&&x.category!=='play')throw new ApiError(400,'Lloji i lojës kërkon kategorinë e lojërave me figura.');
 const original=shuffle(pool.filter(p=>p.id?.startsWith('original-'))),other=shuffle(pool.filter(p=>!p.id?.startsWith('original-')));
 const visual=original.filter(p=>['placement','pipes','maze','robot'].includes(p.type||'')),classic=original.filter(p=>!['placement','pipes','maze','robot'].includes(p.type||''));
 const items=[...visual,...classic,...other].slice(0,x.count).map((p:Puzzle)=>shufflePuzzleForIssue(p));
 const id=crypto.randomUUID(),expires=Date.now()+24*60*60*1000;
 await db().prepare('INSERT INTO adventures(id,owner,profile,principal,grade,payload,expires,level,assignment,started) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,actor.owner,x.profile,actor.principal,x.grade,JSON.stringify(items),expires,x.level||null,x.assignment||null,Date.now()).run();
 return json({id,grade:x.grade,profile:x.profile,level:x.level,assignment:x.assignment,gameLevel:x.gameLevel,scene:x.scene,items:items.map(publicPuzzle)});
}
export async function issued(actor:Actor,id:string){
 const a=await db().prepare('SELECT * FROM adventures WHERE id=? AND owner=? AND principal=?').bind(id,actor.owner,actor.principal).first<Issued>();
 if(!a || actor.role==='STUDENT'&&a.profile!==actor.profile)throw new ApiError(404,'Aventura nuk u gjet.');
 if(actor.role==='STUDENT'&&a.assignment){const task=await assignmentFor(actor,a.assignment,a.profile,a.grade),p=(JSON.parse(a.payload) as Puzzle[])[0],selected=task.lesson_id?p?.lessonLevel:task.scene?p?.gameLevel:a.level||task.level;
  if(!selected||!assignmentLevels(task).includes(selected))throw new ApiError(403,'Ky nivel nuk është aktivizuar nga mësuesi.');}
 if(a.expires<Date.now()&&!a.completed)throw new ApiError(410,'Aventura ka skaduar. Fillo një të re.');
 return {...a,items:JSON.parse(a.payload) as Puzzle[]};
}
export async function submitAnswer(actor:Actor,x:{id:string;index:number;value:string}){
 await limit('answer:'+actor.principal,90);
 const a=await issued(actor,x.id),p=a.items[x.index];
 if(!p||!accepts(p,x.value))throw new ApiError(400,'Përgjigje e pavlefshme.');
 const result=evaluateAnswer(p,x.value);
 // One atomic INSERT guards sequence, uniqueness, expiry and completion.
 await db().prepare(`INSERT OR IGNORE INTO attempt_answers(adventure,position,value,payload)
 SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM attempt_answers WHERE adventure=?)=?
 AND EXISTS(SELECT 1 FROM adventures WHERE id=? AND completed=0 AND expires>=?)`).bind(a.id,x.index,x.value,JSON.stringify({cat:p.cat,question:p.title,...result}),a.id,x.index,a.id,Date.now()).run();
 const saved=await db().prepare('SELECT value,payload FROM attempt_answers WHERE adventure=? AND position=?').bind(a.id,x.index).first<{value:string;payload:string}>();
 if(!saved||saved.value!==x.value)throw new ApiError(409,'Kjo përgjigje është ruajtur ose radha nuk është e saktë.');
 return json(JSON.parse(saved.payload));
}
export async function puzzleHint(actor:Actor,x:{id:string;index:number;step?:number}){
 await limit('hint:'+actor.principal,60);
 const a=await issued(actor,x.id);
 const n=await db().prepare('SELECT COUNT(*) AS n FROM attempt_answers WHERE adventure=?').bind(a.id).first<{n:number}>();
 if(!a.items[x.index]||x.index!==n?.n||a.completed)throw new ApiError(409,'Ndihma lejohet vetëm për pyetjen aktuale.');
 const puzzle=a.items[x.index];return json({hint:plugins[puzzle.type||'choice'].hint(puzzle,x.step||1)});
}
export async function finishAdventure(actor:Actor,x:SavedSession){
 const a=await issued(actor,x.id);
 if(x.grade!==a.grade||actor.role!=='STUDENT'&&x.profile!==a.profile)throw new ApiError(400,'Aventurë e pavlefshme.');
 const rows=await db().prepare('SELECT position,payload FROM attempt_answers WHERE adventure=? ORDER BY position').bind(a.id).all<{position:number;payload:string}>();
 if(rows.results.length!==a.items.length||x.answers.length!==a.items.length)throw new ApiError(409,'Përfundo të gjitha ushtrimet.');
 // Client correctness/category/question are ignored. Only optional notes are accepted.
 const answers:Answer[]=rows.results.map((r,i)=>{const answer=JSON.parse(r.payload);return {cat:answer.cat,question:answer.question,correct:answer.correct,note:x.answers[i].note};});
 await db().batch([
  db().prepare('INSERT OR IGNORE INTO sessions(id,owner,profile,payload,created) VALUES(?,?,?,?,?)').bind(a.id,a.owner,a.profile,JSON.stringify({grade:a.grade,answers,verified:true,...(a.items.length===1&&a.items[0].lessonId?{lessonId:a.items[0].lessonId,lessonLevel:a.items[0].lessonLevel}:a.items.length===1&&a.items[0].gameLevel?{gameScene:a.items[0].interaction?.scene,gameLevel:a.items[0].gameLevel}:{}),level:a.level,assignment:a.assignment,duration:a.started?Math.min(86400,Math.max(0,Math.round((Date.now()-a.started)/1000))):0,stars:starScore(answers)}),new Date().toISOString()),
  db().prepare('UPDATE adventures SET completed=1 WHERE id=?').bind(a.id),
 ]);
 return json({saved:true,answers,verified:true,stars:starScore(answers)});
}
