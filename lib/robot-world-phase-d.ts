import {traceMission,missionTokens,type MissionTrace} from './robot-world-phase-b';
import type {WorldChallenge,WorldState} from './robot-world';
export type School={antenna:boolean;graduated:boolean;issuedAt:number};
export type SchoolMission={broken?:string[];repeat?:boolean;answers?:string[];variants?:number[][];crossing?:number;quiz?:'count'|'position'|'choice'};
export const D_STAGES=['Dita e parë','Kuizi i robotit','Ndreq robotin','Nëse… atëherë'];
export const initialSchool=():School=>({antenna:false,graduated:false,issuedAt:0});
export function schoolIntelligence(state:WorldState){const first=[1,2,3].every(n=>state.progress[`school-1-${n}`]?.stars),quizzes=[1,2,3].filter(n=>state.progress[`school-2-${n}`]?.stars).length;return Math.min(5,1+Number(first)+quizzes);}
export function phaseDChallenges(grade:number):WorldChallenge[]{
 const list:WorldChallenge[]=[],advanced=grade>=3;
 for(let stage=0;stage<4;stage++)for(let round=0;round<3;round++){
  const base={id:`school-${stage+1}-${round+1}`,theme:5 as const,stage,round,options:[],visual:'',target:0,efficient:1};
  if(stage===0){const count=(advanced?5:3)+round,size=advanced?9:7,start=size,goal=start+count;list.push({...base,kind:'school-repeat',title:'Mëso përsëritjen me mësuesin robot',icon:'🔁',size,start,goal,path:Array(count).fill('R'),blocked:[],mission:{},school:{repeat:true},efficient:1});}
  if(stage===1){
   if(round===0){const count=grade===4?3:advanced?5:3,target=grade===4?count*2:count;list.push({...base,kind:'school-quiz',title:'Sa hapa bën ky program?',icon:'🔢',target,options:[target,target+1,target-1,target+2],visual:grade===4?`[→ ↓] × ${count}`:`→ × ${count}`,school:{quiz:'count'}});}
   else if(round===1){const size=6,path=grade===4?['R','R','R','D','D','D','L','L','U']:advanced?['R','R','R','D','D','L']:['R','R','D'];let target=0;for(const d of path)target+=d==='R'?1:d==='L'?-1:d==='D'?size:-size;list.push({...base,kind:'school-quiz',title:'Ku përfundon roboti?',icon:'📍',target,options:[target,target+1,target+size,target-1],visual:path.map(d=>({R:'→',D:'↓',L:'←',U:'↑'})[d]).join(' '),size,start:0,goal:target,path,blocked:[],mission:{},school:{quiz:'position'}});}
   else{const answers=grade===4?['🪵 → 🔁','→ ≈','↺','←']:['🪵','→ ≈','↺','←'];list.push({...base,kind:'school-quiz',title:'Çfarë bën roboti kur ura mungon?',icon:'🌉',target:0,options:[1,0,3,2],visual:'🌊  🌉 ❌  🐰',school:{quiz:'choice',answers}});}
  }
  if(stage===2){const size=advanced?7:5,path=[['R','R','D'],['D','R','R','D'],['R','D','R','D','R']][round].concat(advanced?['R','D']:[]),broken=[...path];broken[round]=['L','U','L'][round];let goal=0;for(const d of path)goal+=d==='R'?1:d==='L'?-1:d==='D'?size:-size;list.push({...base,kind:'school-debug',title:'Vëzhgo gabimin dhe ndreq një komandë',icon:'🔧',size,start:0,goal,path,blocked:[],mission:{},school:{broken},efficient:path.length});}
  if(stage===3){const size=advanced?9:6,count=(advanced?4:1)+round,goal=size+1+count;list.push({...base,kind:'school-condition',title:'Një program për urën dhe rrugën tjetër',icon:'🔀',size,start:0,goal,path:['R','D',...Array(count).fill('R')],blocked:[size],mission:{},school:{variants:[[size],[1]],crossing:1},efficient:2});}
 }
 return list;
}
const GROUP=/^IF([UDLR]):\[([UDLR.]+)\]:\[([UDLR.]+)\]$/;
export function schoolSolution(c:WorldChallenge){if(c.kind==='school-repeat')return `Rx${c.path!.length}`;if(c.kind==='school-condition'){const count=c.path!.length-2;return `IFR:[R.D]:[D.R],R${count>1?'x'+count:''}`;}if(c.kind==='school-quiz')return String(c.target);return c.path!.join(',');}
export function schoolHint(c:WorldChallenge){if(c.kind==='school-condition')return '🌉 ✓ → ↓ · 🌉 ✗ ↓ → · 🔁 →';if(c.kind==='school-repeat')return `→ × ${c.path!.length}`;if(c.kind==='school-quiz')return c.school?.answers?.[c.target]||(c.school?.quiz==='position'?`📍 ${c.options.indexOf(c.target)+1}`:String(c.target));return c.path!.map(d=>({R:'→',D:'↓',U:'↑',L:'←'})[d]).join(' ');}
export function traceSchool(c:WorldChallenge,value:string,variant=0):MissionTrace{
 const actual={...c,blocked:c.school?.variants?.[variant]||c.blocked},moves:string[]=[],conditionFrames=new Map<number,boolean>();let used=false;
 for(const token of value.split(',').filter(Boolean)){
  const match=GROUP.exec(token);let sequence:string[];
  if(match){used=true;const previous=traceMission(actual,moves.join(',')),pos=previous.frames.at(-1)!.position,size=c.size!,x=pos%size,y=Math.floor(pos/size),nx=x+(match[1]==='R'?1:match[1]==='L'?-1:0),ny=y+(match[1]==='D'?1:match[1]==='U'?-1:0),clear=nx>=0&&ny>=0&&nx<size&&ny<size&&!actual.blocked?.includes(ny*size+nx);sequence=match[clear?2:3].split('.');if(sequence.length>8||!sequence.every(d=>/^[UDLR]$/.test(d)))return {...previous,correct:false};conditionFrames.set(moves.length+1,clear);}
  else{const parsed=missionTokens(token);if(!parsed||!parsed.every(t=>/^[UDLR]$/.test(t)))return {...traceMission(actual,moves.join(',')),correct:false};sequence=parsed;}
  moves.push(...sequence);if(moves.length>120)return {...traceMission(actual,''),correct:false};
 }
 const result=traceMission(actual,moves.join(','));for(const [n,condition] of conditionFrames)if(result.frames[n])result.frames[n].condition=condition;
 return {...result,commands:value.split(',').filter(Boolean).length,conditionUsed:used};
}
export function evaluatePhaseD(c:WorldChallenge,value:string){
 if(c.kind==='school-quiz')return {correct:value===String(c.target),steps:1};
 const trace=traceSchool(c,value);let correct=trace.correct;
 if(c.kind==='school-repeat')correct=correct&&/x[2-9]/.test(value);
 if(c.kind==='school-debug'){const tokens=value.split(',');correct=correct&&tokens.length===c.school!.broken!.length&&tokens.filter((t,n)=>t!==c.school!.broken![n]).length===1&&tokens.every(t=>/^[UDLR]$/.test(t));}
 if(c.kind==='school-condition')correct=correct&&trace.conditionUsed&&traceSchool(c,value,1).correct;
 return {correct,steps:c.kind==='school-debug'?value.split(',').length:trace.commands};
}
export function phaseDSuccess(state:WorldState){state.robot.intelligence=schoolIntelligence(state);if([1,2,3].every(n=>state.progress[`school-1-${n}`]?.stars))state.school.antenna=true;if(phaseDChallenges(1).every(c=>state.progress[c.id]?.stars)&&!state.school.graduated){state.school.graduated=true;state.school.issuedAt=Date.now();}}
